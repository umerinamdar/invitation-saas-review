import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import {
  fetchGatewayPayment,
  findWebhookDelivery,
  fulfilmentPlan,
  getOrderById,
  markOrderFailed,
  payloadCurrencyMismatch,
  recordWebhookDelivery,
  settleAndPublish,
  verifyWebhookSignature,
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

interface YouPiWebhookPayload {
  event: string;
  orderId: string;
  amount: string;
  amountPaise: number;
  utr: string;
  paymentId: string;
  // YouPI's docs disagree on whether deliveries carry a currency field
  // (the OpenAPI schema and developer guide include one; the README
  // contract list omits it). Optional: when present it is cross-checked
  // against the stored order, and the gateway lookup below is the
  // authoritative currency source either way.
  currency?: string;
}

/**
 * YouPI PG webhook endpoint.
 * Receives payment success/failure notifications and updates order status.
 *
 * Security:
 * - Verifies HMAC-SHA256 signature from X-Gateway-Signature header
 * - Validates X-Gateway-Timestamp for replay protection
 * - Never trusts the client-side handler callback
 * - Fulfils on the service-role client (orders have no UPDATE policy
 *   for the browser client, so fulfilment through it can never succeed)
 * - Cross-checks the payload amount against the stored order, then
 *   corroborates status, amount and currency against the gateway's own
 *   record (GET /api/v1/payments/{id}) before marking paid
 * - Records the delivery id only AFTER fulfilment succeeds, so a failed
 *   fulfilment stays retryable by redelivery instead of bricking the
 *   payment behind an already_processed response
 * - The mark-paid transition is atomic (status predicate on the UPDATE)
 *   and the publish is conditional on the invite still being a draft,
 *   so concurrent deliveries with different ids settle exactly once
 *   (Round 3 / WS3); the mark-failed transition carries the same kind
 *   of predicate, so a late FAILED can never overwrite a paid or
 *   refunded order it lost a race to (Round 3.5); a zero-row paid
 *   transition is never assumed to mean settlement — the handler
 *   re-reads the order and answers the state that is actually true
 *   (settled → idempotent completion, refunded → the terminal
 *   refunded outcome, anything else → retryable error), in the
 *   fulfil branch, the archived-conflict branch and the publish_only
 *   recovery alike (Round 3.6); since Round 3.7 the settlement and
 *   the publication are ONE database transaction — the
 *   settle_and_publish RPC (migration 0004) locks the order row,
 *   classifies and marks it under that lock, and publishes under
 *   the same lock — which also closes the winner-path window the
 *   re-reads could not (a refund landing between a won mark-paid
 *   and a separate publish); an archived invite
 *   is never published — it yields a recorded conflict outcome for
 *   reconciliation (Round 3 / WS2); a settlement rejected by
 *   migration 0005's one-active-order index (a late-settling order
 *   whose invite has a successor active order) likewise yields a
 *   recorded conflict (reason "duplicate_active_order") for owner
 *   resolution — never a retry loop (Round 3.7 review)
 * - Logs never contain signature material, and error responses never
 *   contain internal details
 * - Per-isolate rate-limit backstop (120/min/IP, 429 + Retry-After) —
 *   not a complete production control; see src/lib/rate-limit.ts
 */
export async function POST(request: Request) {
  // Log context only — ids and the error class, never payloads or secrets.
  let deliveryId = "";
  let orderId: string | undefined;

  try {
    // Rate-limit first, cheaply, before the body is even read. A 429
    // here is backpressure, NOT a verification verdict: no state has
    // changed and no delivery is recorded, so the gateway's ordinary
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

    const signature = request.headers.get("x-gateway-signature") || "";
    deliveryId = request.headers.get("x-gateway-delivery-id") || "";
    const timestamp = request.headers.get("x-gateway-timestamp") || "";

    // Replay protection: reject webhooks older than 5 minutes (300 seconds)
    if (timestamp) {
      const tsMs = Date.parse(timestamp);
      const nowMs = Date.now();
      const maxAgeMs = 5 * 60 * 1000; // 5 minutes
      if (isNaN(tsMs) || nowMs - tsMs > maxAgeMs || tsMs > nowMs + maxAgeMs) {
        console.warn("Stale or future webhook timestamp", {
          timestamp,
          nowMs,
          tsMs,
        });
        return json({ error: "Stale timestamp" }, { status: 401 });
      }
    } else {
      // Timestamp header is required for replay protection
      console.warn("Missing webhook timestamp");
      return json({ error: "Missing timestamp" }, { status: 401 });
    }

    // Verify HMAC-SHA256 signature
    const secret = process.env["YOUPI_WEBHOOK_SECRET"];
    if (!secret) {
      console.error("YOUPI_WEBHOOK_SECRET not configured");
      return json({ error: "Webhook secret not configured" }, { status: 500 });
    }

    if (!verifyWebhookSignature(rawBodyString, signature, secret)) {
      // Log only that validation failed — never the received or
      // expected signature values.
      console.warn("Invalid webhook signature", { deliveryId });
      return json({ error: "Invalid signature" }, { status: 401 });
    }

    // Check delivery ID for idempotency: a recorded delivery was
    // already fulfilled, so a redelivery of it is a no-op.
    if (deliveryId) {
      const processed = await findWebhookDelivery(deliveryId);
      if (processed) {
        console.log("Webhook already processed", { deliveryId });
        return json({ status: "already_processed" }, { status: 200 });
      }
    }

    // Parse payload after signature verification
    let payload: YouPiWebhookPayload;
    try {
      payload = JSON.parse(rawBodyString) as YouPiWebhookPayload;
    } catch {
      console.warn("Failed to parse webhook payload", { deliveryId });
      return json({ error: "Invalid JSON" }, { status: 400 });
    }

    if (typeof payload.orderId !== "string" || payload.orderId.length === 0) {
      console.warn("Webhook payload missing orderId", { deliveryId });
      return json({ error: "Invalid payload" }, { status: 400 });
    }
    orderId = payload.orderId;

    // The stored order is the only trusted record of what was supposed
    // to be paid; load it with the service-role client.
    const order = await getOrderById(orderId);

    // Current invite status, so re-publishing stays idempotent.
    // Round 3.7 / Fix 2: the read's error is checked explicitly. It
    // used to be destructured away, so a failed read produced the
    // same null as a missing row and the plan was computed on an
    // "unknown" invite state — for a paid order whose invite is
    // really still a draft, the plan then degraded to an ignore that
    // RECORDS the delivery, consuming the delivery id the
    // scenario-14 recovery depends on (and an archived invite's
    // conflict outcome was silently missed). A failed read
    // establishes nothing: throw, so the catch answers a retryable
    // 500 with nothing recorded. A successful read with no row
    // keeps the historical null semantics.
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

    // For SUCCESS, corroborate the payment against the gateway's own
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

    // Round 3 / WS2: the archived-invite conflict outcome, shared by
    // the plan-level conflict and by a publish attempt that discovers
    // the invite left the draft state mid-flight. The payment is real
    // (corroborated) and stays recorded as paid; the invite is never
    // published; the delivery IS recorded so the gateway stops
    // retrying; and the outcome is loud in the logs and findable by
    // RECONCILIATION.sql Q5. No payment record is deleted and no
    // refund is pretended — reconciliation is a human decision.
    const conflictResponse = async () => {
      console.error(
        "Webhook fulfilment conflict: paid order's invite is archived — NOT publishing; manual reconciliation required",
        { deliveryId, orderId, inviteId: order?.invite_id },
      );
      if (deliveryId) {
        await recordWebhookDelivery(deliveryId, payload);
      }
      return json(
        {
          status: "conflict",
          reason: "invite_archived",
          orderId,
          inviteId: order?.invite_id,
        },
        { status: 200 },
      );
    };

    // Round 3.7: the shared mapping from settle_and_publish RPC
    // outcomes (migration 0004 — the function performs settlement
    // and publication in one transaction under the order row lock)
    // onto this handler's established response vocabulary:
    //   settled_*          → record the delivery, idempotent success
    //   conflict_archived  → the shared recorded conflict outcome
    //   duplicate_active_order → record the delivery, the recorded
    //                        conflict outcome below (a successor
    //                        order owns the invite's active slot;
    //                        owner resolution, never a retry)
    //   refunded           → record the delivery, the truthful
    //                        terminal refunded outcome (never a
    //                        publish, never a success claim)
    //   not_found / not_paid / retryable → throw: claim nothing,
    //     record nothing — the settlement premise does not hold, so
    //     the generic 500 keeps the delivery retryable.
    // Callers must `return await` this helper: a bare `return` of
    // its promise would let a failure inside it (e.g. the delivery
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
            await recordWebhookDelivery(deliveryId, payload);
          }
          return json(
            { status: "success", orderId, inviteId: order?.invite_id },
            { status: 200 },
          );
        }
        case "conflict_archived": {
          return conflictResponse();
        }
        case "duplicate_active_order": {
          // Round 3.7 adversarial review (Reviewer A, HIGH): the
          // payment genuinely settled at the gateway, but migration
          // 0005's partial unique index rejected the mark-paid
          // because a SUCCESSOR order already owns this invite's
          // active slot — the designed case is a failed order whose
          // payment settled late, after the customer retried into a
          // new order (or after 0005 cleanup retired this order and
          // its already-open checkout was completed). The aborted
          // RPC wrote nothing: this order keeps its current status
          // and nothing is published. Terminal for THIS delivery —
          // no redelivery can change which order owns the slot — so
          // the delivery is recorded, the conflict is answered
          // truthfully in the same shape as the archived conflict,
          // and recovery is an owner action (runbook §2.1: refund
          // the late-settled duplicate at the gateway, or retire
          // the successor when this order is the only real payment;
          // detection: RECONCILIATION.sql Q7) — never a retry loop.
          console.error(
            "Webhook fulfilment conflict: settlement blocked by a duplicate active order — manual reconciliation required",
            { orderId, reason: "duplicate_active_order" },
          );
          if (deliveryId) {
            await recordWebhookDelivery(deliveryId, payload);
          }
          return json(
            {
              status: "conflict",
              reason: "duplicate_active_order",
              orderId,
              inviteId: order?.invite_id,
            },
            { status: 200 },
          );
        }
        case "refunded": {
          console.log(
            "Settlement classified the order as refunded — refund preserved, not publishing",
            { orderId, deliveryId },
          );
          if (deliveryId) {
            await recordWebhookDelivery(deliveryId, payload);
          }
          return json({ status: "refunded", orderId }, { status: 200 });
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
        console.warn("Order not found", { orderId, deliveryId });
        return json({ error: "Order not found" }, { status: 404 });
      }

      case "reject": {
        // Definitive inconsistency between the payload/gateway record
        // and the stored order: no state change, and the delivery is
        // NOT recorded, so a corrected redelivery can still fulfil.
        // Details stay in the server log; the response stays generic.
        console.error("Webhook fulfilment rejected", {
          deliveryId,
          orderId,
          reason: plan.reason,
          expectedAmountMinor: order?.amount_minor,
          payloadAmountPaise: payload.amountPaise,
        });
        return json({ error: "Webhook verification failed" }, { status: 400 });
      }

      case "retry": {
        // The gateway record could not be verified (lookup failed or
        // YOUPI_API_BASE_URL not configured). Fail closed: no
        // fulfilment, no delivery record, generic 500 so the failure
        // is visible and a redelivery can try again.
        console.error("Webhook fulfilment deferred", {
          deliveryId,
          orderId,
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
            event: payload.event,
            orderId,
          });
        }
        if (deliveryId) {
          await recordWebhookDelivery(deliveryId, payload);
        }
        if (plan.reason === "already_paid") {
          return json(
            { status: "success", orderId, inviteId: order?.invite_id },
            { status: 200 },
          );
        }
        if (plan.reason === "already_failed") {
          return json({ status: "failed", orderId }, { status: 200 });
        }
        if (plan.reason === "already_refunded") {
          return json({ status: "refunded", orderId }, { status: 200 });
        }
        return json({ status: "unknown_event" }, { status: 200 });
      }

      case "mark_failed": {
        // Round 3.5: the failed transition is conditional on the
        // order still being in an eligible state at write time. A
        // null row means a concurrent transition won the race after
        // our read — the order is now paid or refunded, both
        // terminal for a FAILED event. Re-read and answer with the
        // outcome that is actually true, mirroring the plan-level
        // responses for those states, and record the delivery (the
        // outcome is final for this delivery either way). Never
        // claim a "failed" transition that did not happen.
        const failedRow = await markOrderFailed(orderId);
        if (failedRow === null) {
          const current = await getOrderById(orderId);
          if (current?.status === "refunded") {
            console.log(
              "FAILED delivery arrived for an order refunded concurrently — refund preserved",
              { orderId, deliveryId },
            );
            if (deliveryId) {
              await recordWebhookDelivery(deliveryId, payload);
            }
            return json({ status: "refunded", orderId }, { status: 200 });
          }
          if (current?.status === "paid") {
            console.log(
              "FAILED delivery arrived for an order settled concurrently — paid state preserved",
              { orderId, deliveryId },
            );
            if (deliveryId) {
              await recordWebhookDelivery(deliveryId, payload);
            }
            return json(
              { status: "success", orderId, inviteId: current.invite_id },
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
          await recordWebhookDelivery(deliveryId, payload);
        }
        console.log("Order marked failed", { orderId });
        return json({ status: "failed", orderId }, { status: 200 });
      }

      case "conflict": {
        // The invite is archived: never publish it (WS2). The
        // payment is corroborated, so the money state must still be
        // recorded truthfully — but only if it is still true.
        //
        // Round 3.7: the recording is the settle_and_publish RPC.
        // Under the order row lock it marks the order paid and
        // classifies the invite's CURRENT state: still archived →
        // the recorded conflict outcome (via the shared mapping);
        // refunded meanwhile → the truthful refunded outcome and NO
        // conflict is claimed (the Round-3.6 gate, now atomic);
        // un-archived meanwhile → the fulfilment outcomes, mapped
        // truthfully. An already-paid order is classified without
        // any re-marking. A database error throws, so nothing is
        // recorded and a redelivery can retry.
        const outcome = await settleAndPublish(orderId, payload.paymentId);
        return await respondToSettleOutcome(outcome);
      }

      case "publish_only": {
        // Partial-failure recovery (scenario 14): an earlier delivery
        // marked this order paid, then the publish step failed, so
        // that delivery was never recorded. This redelivery completes
        // ONLY the publish — the order is not re-marked, so paid_at
        // and gateway_payment_id keep their first-written values.
        //
        // Round 3.7: the recovery runs through the settle_and_publish
        // RPC in its never-mark mode (null payment id). Under the
        // order row lock the function publishes only if the order is
        // still genuinely paid: an order refunded since the plan was
        // made yields the truthful refunded outcome and is never
        // published (the Round-3.6 premise re-check, now atomic
        // rather than a re-read); an order no longer paid yields
        // "not_paid", which the shared mapping turns into a
        // retryable error with nothing recorded; an invite archived
        // since the plan yields the recorded conflict. A failed call
        // throws before anything is recorded, so a further
        // redelivery can retry again.
        const outcome = await settleAndPublish(orderId, null);
        if (outcome === "settled_published") {
          console.log("Invite published on redelivery after partial failure", {
            orderId,
            inviteId: order?.invite_id,
          });
        }
        return await respondToSettleOutcome(outcome);
      }

      case "mark_paid_and_publish": {
        // Round 3.7: settlement and publication are a single RPC
        // transaction (see respondToSettleOutcome above). The
        // payment id passed is the corroborated payload's — this
        // branch is reached only after the signature, amount,
        // currency and gateway-lookup checks all passed. Every
        // outcome the earlier rounds handled by re-reading and
        // classifying after separate statements (concurrent
        // settlement, concurrent refund, archived mid-flight) is
        // now decided inside the transaction against the locked
        // rows, and the shared mapping answers it with the same
        // response vocabulary: settled → recorded success;
        // refunded → recorded truthful refunded outcome, never a
        // publish; archived → recorded conflict; unresolved →
        // retryable 500 with nothing recorded.
        const outcome = await settleAndPublish(orderId, payload.paymentId);
        if (outcome === "settled_published") {
          console.log("Invite published after payment", {
            orderId,
            inviteId: order?.invite_id,
          });
        }
        return await respondToSettleOutcome(outcome);
      }
    }
  } catch (error) {
    console.error("Webhook processing error", {
      deliveryId,
      orderId,
      errorClass: error instanceof Error ? error.name : typeof error,
    });
    return json({ error: "Internal server error" }, { status: 500 });
  }
}

// R-1 wiring fix (owner-approved follow-up to Batch 2, 2026-10-21):
// TanStack's route generator only mounts route files that export a
// `Route` created with createFileRoute — with only the bare POST export
// above, this file was excluded from the route tree and the production
// build answered POST /api/webhooks/youpi with the app's HTML 404. In
// TanStack Start 1.168 a server handler receives a context object
// ({ request, params, ... }) rather than the Request itself (see
// RouteMethodHandlerFn in @tanstack/start-client-core), so this
// registration is a thin adapter onto the existing POST(request)
// handler: its logic is unchanged.
export const Route = createFileRoute("/api/webhooks/youpi")({
  server: {
    handlers: {
      POST: ({ request }) => POST(request),
    },
  },
});
