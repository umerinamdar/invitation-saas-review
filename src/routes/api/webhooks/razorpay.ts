import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import {
  fetchGatewayPayment,
  findWebhookDelivery,
  fulfilmentPlan,
  getOrderByGatewayOrderId,
  markOrderFailed,
  payloadCurrencyMismatch,
  recordWebhookDelivery,
  settleAndPublish,
  verifyWebhookSignature,
  type FulfilmentPayloadInput,
  type GatewayLookupResult,
  type SettleAndPublishOutcome,
} from "@/lib/orders-server";
import { supabaseServer } from "@/lib/supabase-server";
import { clientIpFromRequest, createRateLimiter } from "@/lib/rate-limit";

// Batch 2 / Task 5: per-isolate rate-limit backstop for webhook
// deliveries — 120 requests/minute per client IP, set generously
// because webhooks are machine traffic and must tolerate the
// gateway's legitimate retries. NOT a complete production control:
// Workers isolates share no memory, so counts are per-isolate only
// (see the honesty note in src/lib/rate-limit.ts). The HMAC signature
// check below is this route's real protection; the real rate control
// is the owner's Cloudflare WAF rate-limiting rule.
const webhookRateLimiter = createRateLimiter({
  limit: 120,
  windowMs: 60_000,
});

/**
 * The slice of Razorpay's webhook payload this handler reads. Razorpay
 * nests the actual payment/order under payload.payment.entity /
 * payload.order.entity (https://razorpay.com/docs/webhooks/payloads/payments/);
 * the handler extracts only what fulfilmentPlan needs and ignores the
 * rest (card/bank/vpa details, notes, fees — none of it affects the
 * fulfilment decision).
 */
interface RazorpayWebhookPayload {
  event: string;
  payload?: {
    payment?: {
      entity?: {
        id?: string;
        order_id?: string;
        amount?: number;
        currency?: string;
        status?: string;
      };
    };
  };
}

/** Razorpay's own payment.* event names, translated to the internal
 * SUCCESS/FAILED vocabulary fulfilmentPlan already reasons about
 * (shared with the gateway-lookup status normalization in
 * orders-server.ts). Every other event (order.paid, refund.*, etc.)
 * is deliberately NOT subscribed to at the Razorpay dashboard, but a
 * misconfigured subscription must still be handled safely — it falls
 * through to fulfilmentPlan's own "unknown_event" branch. */
function translateEvent(event: string): string {
  if (event === "payment.captured") return "SUCCESS";
  if (event === "payment.failed") return "FAILED";
  return event;
}

/**
 * Razorpay webhook endpoint.
 * Receives payment success/failure notifications and updates order status.
 *
 * Security:
 * - Verifies HMAC-SHA256 signature from the X-Razorpay-Signature header
 *   (raw hex digest, no prefix — see verifyWebhookSignature)
 * - Never trusts the client-side Checkout.js handler callback
 * - Fulfils on the service-role client (orders have no UPDATE policy
 *   for the browser client, so fulfilment through it can never succeed)
 * - Cross-checks the payload amount against the stored order, then
 *   corroborates status, amount and currency against Razorpay's own
 *   record (GET /v1/payments/{id}) before marking paid
 * - Records the delivery id only AFTER fulfilment succeeds, so a failed
 *   fulfilment stays retryable by redelivery instead of bricking the
 *   payment behind an already_processed response
 * - The mark-paid transition is atomic (status predicate on the UPDATE)
 *   and the publish is conditional on the invite still being a draft,
 *   so concurrent deliveries with different ids settle exactly once;
 *   the mark-failed transition carries the same kind of predicate, so
 *   a late FAILED can never overwrite a paid or refunded order it lost
 *   a race to; a zero-row paid transition is never assumed to mean
 *   settlement — the handler re-reads the order and answers the state
 *   that is actually true. Settlement and publication are ONE database
 *   transaction (the settle_and_publish RPC, migration 0004), which
 *   closes the refund/publication race a separate mark-paid → publish
 *   sequence could not; an archived invite is never published — it
 *   yields a recorded conflict outcome for reconciliation.
 * - Logs never contain signature material, and error responses never
 *   contain internal details
 * - Per-isolate rate-limit backstop (120/min/IP, 429 + Retry-After) —
 *   not a complete production control; see src/lib/rate-limit.ts
 *
 * This is a faithful port of the gateway-agnostic fulfilment machinery
 * built for the project's earlier YouPI integration (see git history
 * for src/routes/api/webhooks/youpi.ts) — the decision seam in
 * orders-server.ts (fulfilmentPlan, amountMatches,
 * payloadCurrencyMismatch, settleAndPublish) is unchanged; only the
 * signature scheme, payload shape, event names and gateway lookup call
 * are Razorpay's own.
 */
export async function POST(request: Request) {
  // Log context only — ids and the error class, never payloads or secrets.
  let deliveryId = "";
  let gatewayOrderId: string | undefined;
  let internalOrderId: string | undefined;

  try {
    // Rate-limit first, cheaply, before the body is even read. A 429
    // here is backpressure, NOT a verification verdict: no state has
    // changed and no delivery is recorded, so Razorpay's ordinary
    // retry-on-non-2xx behaviour redelivers later — the same contract
    // as the generic 500 below. The limiter therefore never turns a
    // genuine payment notification into a permanently lost one; it
    // only defers it.
    const rate = webhookRateLimiter.check(clientIpFromRequest(request));
    if (!rate.allowed) {
      console.warn("Webhook rate limit exceeded", {
        retryAfterSeconds: rate.retryAfterSeconds,
      });
      return json(
        { error: "Too many requests" },
        {
          status: 429,
          headers: { "Retry-After": String(rate.retryAfterSeconds) },
        },
      );
    }

    // Get raw body for signature verification (must be raw bytes, not parsed JSON)
    const rawBody = await request.arrayBuffer();
    const rawBodyBuffer = Buffer.from(rawBody);
    const rawBodyString = rawBodyBuffer.toString("utf8");

    const signature = request.headers.get("x-razorpay-signature") || "";
    // Razorpay does not send a delivery id or timestamp header; the
    // event id inside the payload is the closest equivalent and is
    // used as the idempotency key once the signature (below) has
    // proven the payload itself genuine. Unlike a header, this is only
    // trustworthy AFTER signature verification, so the idempotency
    // pre-check sits after that check, not before.
    const signatureSecret = process.env["RAZORPAY_WEBHOOK_SECRET"];
    if (!signatureSecret) {
      console.error("RAZORPAY_WEBHOOK_SECRET not configured");
      return json({ error: "Webhook secret not configured" }, { status: 500 });
    }

    if (!verifyWebhookSignature(rawBodyString, signature, signatureSecret)) {
      // Log only that validation failed — never the received or
      // expected signature values.
      console.warn("Invalid webhook signature");
      return json({ error: "Invalid signature" }, { status: 401 });
    }

    // Parse payload after signature verification
    let rawPayload: RazorpayWebhookPayload;
    try {
      rawPayload = JSON.parse(rawBodyString) as RazorpayWebhookPayload;
    } catch {
      console.warn("Failed to parse webhook payload");
      return json({ error: "Invalid JSON" }, { status: 400 });
    }

    const entity = rawPayload.payload?.payment?.entity;
    // Every event this handler acts on carries a payment entity with
    // an order_id; a payload missing one cannot be fulfilled under any
    // branch below, so it is rejected uniformly as a bad request
    // rather than threading an undefined order id deeper into the
    // plan (which would surface a confusing "not_found" instead).
    if (!entity || typeof entity.order_id !== "string" || entity.order_id.length === 0) {
      console.warn("Webhook payload missing payment.entity.order_id", {
        event: rawPayload.event,
      });
      return json({ error: "Invalid payload" }, { status: 400 });
    }
    gatewayOrderId = entity.order_id;
    const paymentId = typeof entity.id === "string" ? entity.id : undefined;

    // Idempotency key: the Razorpay payment id is unique per payment
    // attempt and stable across redeliveries of the same event, unlike
    // nothing Razorpay sends at the transport level.
    deliveryId = paymentId ?? "";

    // Check delivery ID for idempotency: a recorded delivery was
    // already fulfilled, so a redelivery of it is a no-op.
    if (deliveryId) {
      const processed = await findWebhookDelivery(deliveryId);
      if (processed) {
        console.log("Webhook already processed", { deliveryId });
        return json({ status: "already_processed" }, { status: 200 });
      }
    }

    // The stored order is the only trusted record of what was supposed
    // to be paid; load it by Razorpay's own order id, with the
    // service-role client.
    const order = await getOrderByGatewayOrderId(gatewayOrderId);
    internalOrderId = order?.id;

    // Built with conditional spreads, not `key: value | undefined`:
    // FulfilmentPayloadInput's optional fields are checked under
    // exactOptionalPropertyTypes, which treats an explicit `undefined`
    // value as distinct from an absent key.
    const payload: FulfilmentPayloadInput = {
      event: translateEvent(rawPayload.event),
      orderId: gatewayOrderId,
      amountPaise: entity.amount,
      ...(entity.currency !== undefined ? { currency: entity.currency } : {}),
      ...(paymentId !== undefined ? { paymentId } : {}),
    };

    // Current invite status, so re-publishing stays idempotent.
    let inviteStatus: string | null = null;
    if (order?.invite_id) {
      const { data: invite, error: inviteError } = await supabaseServer
        .from("invites")
        .select("status")
        .eq("id", order.invite_id)
        .maybeSingle();
      if (inviteError) throw inviteError;
      inviteStatus = (invite?.status as string | undefined) ?? null;
    }

    // For SUCCESS, corroborate the payment against Razorpay's own
    // record before fulfilling. Skipped when there is nothing to
    // corroborate (no such order, no payment id) or when the payload
    // already fails the currency pre-check — that rejection does not
    // depend on the gateway.
    let lookup: GatewayLookupResult | null = null;
    if (
      payload.event === "SUCCESS" &&
      order &&
      !payloadCurrencyMismatch(payload, order) &&
      typeof payload.paymentId === "string" &&
      payload.paymentId.length > 0
    ) {
      lookup = await fetchGatewayPayment(payload.paymentId);
    }

    const plan = fulfilmentPlan(order, payload, lookup, inviteStatus);

    // The archived-invite conflict outcome: the payment is real
    // (corroborated) and stays recorded as paid; the invite is never
    // published; the delivery IS recorded so Razorpay stops retrying;
    // and the outcome is loud in the logs and findable by
    // RECONCILIATION.sql Q5. No payment record is deleted and no
    // refund is pretended — reconciliation is a human decision.
    const conflictResponse = async () => {
      console.error(
        "Webhook fulfilment conflict: paid order's invite is archived — NOT publishing; manual reconciliation required",
        { deliveryId, gatewayOrderId, inviteId: order?.invite_id },
      );
      if (deliveryId) {
        await recordWebhookDelivery(deliveryId, rawPayload);
      }
      return json(
        {
          status: "conflict",
          reason: "invite_archived",
          orderId: internalOrderId,
          inviteId: order?.invite_id,
        },
        { status: 200 },
      );
    };

    // The shared mapping from settle_and_publish RPC outcomes
    // (migration 0004 — the function performs settlement and
    // publication in one transaction under the order row lock) onto
    // this handler's established response vocabulary:
    //   settled_*          → record the delivery, idempotent success
    //   conflict_archived  → the shared recorded conflict outcome
    //   duplicate_active_order → record the delivery, a recorded
    //                        conflict outcome (a successor order owns
    //                        the invite's active slot; owner
    //                        resolution, never a retry)
    //   refunded           → record the delivery, the truthful
    //                        terminal refunded outcome (never a
    //                        publish, never a success claim)
    //   not_found / not_paid / retryable → throw: claim nothing,
    //     record nothing — the settlement premise does not hold, so
    //     the generic 500 keeps the delivery retryable.
    // Callers must `return await` this helper: a bare `return` of its
    // promise would let a failure inside it (e.g. the delivery
    // recording) escape the handler's try/catch as an unhandled
    // rejection instead of the generic 500.
    const respondToSettleOutcome = async (
      outcome: SettleAndPublishOutcome,
    ): Promise<Response> => {
      switch (outcome) {
        case "settled_published":
        case "settled_already_published":
        case "settled_no_invite": {
          if (deliveryId) {
            await recordWebhookDelivery(deliveryId, rawPayload);
          }
          return json(
            {
              status: "success",
              orderId: internalOrderId,
              inviteId: order?.invite_id,
            },
            { status: 200 },
          );
        }
        case "conflict_archived": {
          return conflictResponse();
        }
        case "duplicate_active_order": {
          console.error(
            "Webhook fulfilment conflict: settlement blocked by a duplicate active order — manual reconciliation required",
            { gatewayOrderId, reason: "duplicate_active_order" },
          );
          if (deliveryId) {
            await recordWebhookDelivery(deliveryId, rawPayload);
          }
          return json(
            {
              status: "conflict",
              reason: "duplicate_active_order",
              orderId: internalOrderId,
              inviteId: order?.invite_id,
            },
            { status: 200 },
          );
        }
        case "refunded": {
          console.log(
            "Settlement classified the order as refunded — refund preserved, not publishing",
            { gatewayOrderId, deliveryId },
          );
          if (deliveryId) {
            await recordWebhookDelivery(deliveryId, rawPayload);
          }
          return json({ status: "refunded", orderId: internalOrderId }, { status: 200 });
        }
        default: {
          throw new Error(
            `settle_and_publish outcome ${outcome} leaves fulfilment unresolved`,
          );
        }
      }
    };

    switch (plan.action) {
      case "not_found": {
        console.warn("Order not found", { gatewayOrderId, deliveryId });
        return json({ error: "Order not found" }, { status: 404 });
      }

      case "reject": {
        // Definitive inconsistency between the payload/gateway record
        // and the stored order: no state change, and the delivery is
        // NOT recorded, so a corrected redelivery can still fulfil.
        // Details stay in the server log; the response stays generic.
        console.error("Webhook fulfilment rejected", {
          deliveryId,
          gatewayOrderId,
          reason: plan.reason,
          expectedAmountMinor: order?.amount_minor,
          payloadAmountPaise: payload.amountPaise,
        });
        return json({ error: "Webhook verification failed" }, { status: 400 });
      }

      case "retry": {
        // The gateway record could not be verified (lookup failed or
        // RAZORPAY_KEY_ID/RAZORPAY_KEY_SECRET not configured). Fail
        // closed: no fulfilment, no delivery record, generic 500 so
        // the failure is visible and a redelivery can try again.
        console.error("Webhook fulfilment deferred", {
          deliveryId,
          gatewayOrderId,
          reason: plan.reason,
          lookupReason: plan.lookupReason,
        });
        return json({ error: "Internal server error" }, { status: 500 });
      }

      case "ignore": {
        // Fulfilment is a no-op for this plan (replay of an already
        // settled order, or an event we do not act on); recording the
        // delivery is safe and keeps further redeliveries cheap.
        if (plan.reason === "unknown_event") {
          console.warn("Unknown webhook event", {
            event: rawPayload.event,
            gatewayOrderId,
          });
        }
        if (deliveryId) {
          await recordWebhookDelivery(deliveryId, rawPayload);
        }
        if (plan.reason === "already_paid") {
          return json(
            {
              status: "success",
              orderId: internalOrderId,
              inviteId: order?.invite_id,
            },
            { status: 200 },
          );
        }
        if (plan.reason === "already_failed") {
          return json({ status: "failed", orderId: internalOrderId }, { status: 200 });
        }
        if (plan.reason === "already_refunded") {
          return json({ status: "refunded", orderId: internalOrderId }, { status: 200 });
        }
        return json({ status: "unknown_event" }, { status: 200 });
      }

      case "mark_failed": {
        // The failed transition is conditional on the order still
        // being in an eligible state at write time. A null row means
        // a concurrent transition won the race after our read — the
        // order is now paid or refunded, both terminal for a FAILED
        // event. Re-read and answer with the outcome that is actually
        // true, and record the delivery (the outcome is final for
        // this delivery either way). Never claim a "failed" transition
        // that did not happen.
        if (!internalOrderId) {
          throw new Error("mark_failed reached with no internal order id");
        }
        const failedRow = await markOrderFailed(internalOrderId);
        if (failedRow === null) {
          const current = await getOrderByGatewayOrderId(gatewayOrderId);
          if (current?.status === "refunded") {
            console.log(
              "FAILED delivery arrived for an order refunded concurrently — refund preserved",
              { gatewayOrderId, deliveryId },
            );
            if (deliveryId) {
              await recordWebhookDelivery(deliveryId, rawPayload);
            }
            return json({ status: "refunded", orderId: current.id }, { status: 200 });
          }
          if (current?.status === "paid") {
            console.log(
              "FAILED delivery arrived for an order settled concurrently — paid state preserved",
              { gatewayOrderId, deliveryId },
            );
            if (deliveryId) {
              await recordWebhookDelivery(deliveryId, rawPayload);
            }
            return json(
              { status: "success", orderId: current.id, inviteId: current.invite_id },
              { status: 200 },
            );
          }
          // The row is gone or in a state no transition accounts
          // for: record nothing and claim nothing — the generic 500
          // from the catch below leaves the delivery retryable
          // instead of permanently swallowing it behind a false
          // outcome.
          throw new Error(
            "mark_failed matched no row and the order state is unresolved",
          );
        }
        if (deliveryId) {
          await recordWebhookDelivery(deliveryId, rawPayload);
        }
        console.log("Order marked failed", { orderId: internalOrderId });
        return json({ status: "failed", orderId: internalOrderId }, { status: 200 });
      }

      case "conflict": {
        // The invite is archived: never publish it. The payment is
        // corroborated, so the money state must still be recorded
        // truthfully — but only if it is still true. The recording is
        // the settle_and_publish RPC: under the order row lock it
        // marks the order paid and classifies the invite's CURRENT
        // state; a database error throws, so nothing is recorded and
        // a redelivery can retry.
        if (!internalOrderId) {
          throw new Error("conflict plan reached with no internal order id");
        }
        const corroboratedPaymentId =
          typeof payload.paymentId === "string" ? payload.paymentId : null;
        const outcome = await settleAndPublish(internalOrderId, corroboratedPaymentId);
        return await respondToSettleOutcome(outcome);
      }

      case "publish_only": {
        // Partial-failure recovery: an earlier delivery marked this
        // order paid, then the publish step failed, so that delivery
        // was never recorded. This redelivery completes ONLY the
        // publish — the order is not re-marked. Runs through the
        // settle_and_publish RPC in its never-mark mode (null payment
        // id).
        if (!internalOrderId) {
          throw new Error("publish_only plan reached with no internal order id");
        }
        const outcome = await settleAndPublish(internalOrderId, null);
        if (outcome === "settled_published") {
          console.log("Invite published on redelivery after partial failure", {
            orderId: internalOrderId,
            inviteId: order?.invite_id,
          });
        }
        return await respondToSettleOutcome(outcome);
      }

      case "mark_paid_and_publish": {
        // Settlement and publication are a single RPC transaction
        // (see respondToSettleOutcome above). The payment id passed is
        // the corroborated payload's — this branch is reached only
        // after the signature, amount, currency and gateway-lookup
        // checks all passed.
        if (!internalOrderId) {
          throw new Error("mark_paid_and_publish plan reached with no internal order id");
        }
        const corroboratedPaymentId =
          typeof payload.paymentId === "string" ? payload.paymentId : null;
        const outcome = await settleAndPublish(internalOrderId, corroboratedPaymentId);
        if (outcome === "settled_published") {
          console.log("Invite published after payment", {
            orderId: internalOrderId,
            inviteId: order?.invite_id,
          });
        }
        return await respondToSettleOutcome(outcome);
      }
    }
  } catch (error) {
    console.error("Webhook processing error", {
      deliveryId,
      gatewayOrderId,
      orderId: internalOrderId,
      errorClass: error instanceof Error ? error.name : typeof error,
    });
    return json({ error: "Internal server error" }, { status: 500 });
  }
}

// R-1 wiring fix (owner-approved follow-up to Batch 2, 2026-10-21):
// TanStack's route generator only mounts route files that export a
// `Route` created with createFileRoute — with only the bare POST export
// above, this file was excluded from the route tree and the production
// build answered POST /api/webhooks/razorpay with the app's HTML 404. In
// TanStack Start 1.168 a server handler receives a context object
// ({ request, params, ... }) rather than the Request itself (see
// RouteMethodHandlerFn in @tanstack/start-client-core), so this
// registration is a thin adapter onto the existing POST(request)
// handler: its logic is unchanged.
export const Route = createFileRoute("/api/webhooks/razorpay")({
  server: {
    handlers: {
      POST: ({ request }) => POST(request),
    },
  },
});
