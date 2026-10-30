import crypto from "node:crypto";

import { supabaseServer } from "./supabase-server";
import type { OrderRow, PaymentFields } from "./orders-api";

/**
 * Server-side order operations for the Razorpay webhook.
 *
 * These mirror the functions in ./orders-api but run on the service-role
 * client (supabaseServer). The browser client in orders-api can never
 * update orders — the orders table has no UPDATE policy for
 * anon/authenticated (0001), only "read own orders" — so webhook
 * fulfilment bound to it always failed and a paid order could never be
 * marked paid. orders-api keeps its browser-safe exports untouched:
 * order-success.tsx legitimately reads through them under SELECT-own
 * RLS.
 *
 * This module also holds the pure decision seam the webhook handler
 * executes (amountMatches / payloadCurrencyMismatch / fulfilmentPlan /
 * verifyWebhookSignature) and the gateway lookup (fetchGatewayPayment),
 * so the money-path decisions are unit-testable without a live gateway
 * or database.
 */

// ---------------------------------------------------------------------------
// Server-client data operations (same shapes as orders-api, privileged client)
// ---------------------------------------------------------------------------

/**
 * Retrieve a single order by ID using the service-role client.
 */
export async function getOrderById(orderId: string): Promise<OrderRow | null> {
  const { data, error } = await supabaseServer
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();

  if (error) throw error;
  return data as OrderRow | null;
}

/**
 * Retrieve a single order by its Razorpay gateway order id. The
 * webhook payload identifies the order by Razorpay's own id
 * (order.entity.id, e.g. "order_xxx"), never by our internal primary
 * key — this is the lookup that bridges the two.
 */
export async function getOrderByGatewayOrderId(
  gatewayOrderId: string,
): Promise<OrderRow | null> {
  const { data, error } = await supabaseServer
    .from("orders")
    .select("*")
    .eq("gateway_order_id", gatewayOrderId)
    .maybeSingle();

  if (error) throw error;
  return data as OrderRow | null;
}

/**
 * Mark an order as paid — an ATOMIC conditional transition (Round 3 /
 * WS3). Called from the webhook only after signature verification,
 * the amount cross-check and the gateway lookup all pass.
 *
 * The update carries a status predicate — it applies only while the
 * order is still in a fulfillable state ("created", or "failed": a
 * gateway timeout can mark an order failed before its payment
 * actually settles, and the plan deliberately lets a corroborated
 * late SUCCESS fulfil it). PostgREST evaluates the predicate against
 * the row inside the single UPDATE statement, so when two deliveries
 * with different ids race the same order, exactly one caller's update
 * matches a row. The winner gets the updated row back; a caller whose
 * order was already settled (paid, or refunded — terminal for this
 * transition) gets null and must NOT proceed as if it had marked
 * anything. Before this predicate existed, the decision rested on a
 * getOrderById read taken earlier in the request: check-then-act,
 * with a real window between the two.
 */
export async function markOrderPaid(
  orderId: string,
  fields: PaymentFields,
): Promise<OrderRow | null> {
  const { data, error } = await supabaseServer
    .from("orders")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
      gateway_payment_id: fields.paymentId,
      // NF-4: fields.utr is deliberately NOT written to
      // gateway_order_id. A UTR is the bank/UPI transaction reference;
      // gateway_order_id is the gateway's order id (unique in 0001)
      // and gateway_payment_id above already holds the gateway's
      // payment id — the identifier the gateway lookup is keyed by.
      // Misfiling the UTR there corrupts reconciliation for any flow
      // that reads the column. The UTR is not lost: the webhook
      // handler records the full payload, UTR included, in
      // webhook_deliveries after fulfilment.
    })
    .eq("id", orderId)
    .in("status", ["created", "failed"])
    .select()
    .maybeSingle();

  if (error) throw error;
  return data as OrderRow | null;
}

/**
 * Publish an invitation — conditionally, so publication happens at
 * most once (Round 3 / WS3). The update applies only while the invite
 * is still a draft; the outcome distinguishes the three states the
 * caller must handle differently:
 *
 * - "published": this call performed the draft → published transition.
 * - "already_published": the invite was already published (by the
 *   racing delivery that won the mark-paid transition, or earlier) —
 *   the desired end state holds, nothing more to do.
 * - "not_draft": the invite is in some other state (archived, or the
 *   row is gone). It must NOT be published by the webhook; the caller
 *   treats this as a fulfilment conflict for reconciliation.
 *
 * The fallback read's error is checked explicitly (Round 3.7 / Part
 * 1): a failed read establishes NOTHING about the invite's state, so
 * it throws — the caller answers a retryable error and records
 * nothing — instead of letting data === null fall through to
 * "not_draft", which the webhook maps to a terminal recorded
 * conflict claim.
 *
 * Note (Round 3.7): the webhook handler no longer calls this helper
 * — settlement + publication now happen atomically inside the
 * settle_and_publish RPC (migration 0004, see settleAndPublish
 * below), which is the only way to close the refund/publication
 * window. publishInvite is retained as a library helper with its
 * conditional-publish semantics intact; any future caller gets the
 * fixed fallback behaviour above.
 */
export type PublishInviteOutcome =
  "published" | "already_published" | "not_draft";

export async function publishInvite(
  inviteId: string,
): Promise<PublishInviteOutcome> {
  const { data, error } = await supabaseServer
    .from("invites")
    .update({
      status: "published",
      published_at: new Date().toISOString(),
    })
    .eq("id", inviteId)
    .eq("status", "draft")
    .select("id");

  if (error) throw error;
  if (Array.isArray(data) && data.length > 0) {
    return "published";
  }

  const { data: invite, error: inviteError } = await supabaseServer
    .from("invites")
    .select("status")
    .eq("id", inviteId)
    .maybeSingle();

  if (inviteError) throw inviteError;

  return invite?.status === "published" ? "already_published" : "not_draft";
}

/**
 * Mark an order as failed — an ATOMIC conditional transition (Round
 * 3.5), the mirror of markOrderPaid. Called when the gateway reports
 * failure (a FAILED event, or a SUCCESS whose gateway record says
 * FAILED).
 *
 * The eligible source states are "created" (the normal path) and
 * "failed" (a re-delivered FAILED stays idempotent). "paid" and
 * "refunded" are NEVER overwritten: the plan already no-ops orders
 * it READS as paid/refunded, but that read is a snapshot — an order
 * refunded (or settled) after the read and before this write would
 * have been clobbered by the old id-only update. The status
 * predicate is evaluated by the database against the row inside the
 * single UPDATE, closing that window. The winner gets the updated
 * row; a caller whose update matched nothing (the order left the
 * eligible states concurrently, or is gone) gets null and must NOT
 * report a transition that did not happen.
 */
export async function markOrderFailed(
  orderId: string,
): Promise<OrderRow | null> {
  const { data, error } = await supabaseServer
    .from("orders")
    .update({ status: "failed" })
    .eq("id", orderId)
    .in("status", ["created", "failed"])
    .select()
    .maybeSingle();

  if (error) throw error;
  return data as OrderRow | null;
}

/**
 * The outcomes of the settle_and_publish RPC (migration 0004). The
 * function performs settlement and publication in ONE transaction
 * under a fixed lock order (orders row first, invites row second),
 * which is what closes the refund/publication window the separate
 * markOrderPaid → publishInvite sequence could not: any concurrent
 * update of the orders row — including an out-of-band refund, which
 * is how refunds reach this system — must take the order row lock,
 * so it is serialized either strictly before the function's status
 * check (the function observes "refunded" and publishes nothing) or
 * strictly after the function commits (a refund of an already-
 * legitimately-published invite — a product-policy case handled by
 * reconciliation Q6a, not something any publish-side code can
 * prevent). See mission/ADR-settle-and-publish.md.
 *
 * - "settled_published": the order is paid (marked by this call if
 *   it was not already) and this call published the invite.
 * - "settled_already_published": the order is paid and the invite
 *   was already published — the desired end state holds.
 * - "settled_no_invite": the order is paid and has no invite
 *   (invite_id null) — the historically tolerated outcome.
 * - "conflict_archived": the order is paid but its invite is
 *   archived — never published; a recorded conflict for
 *   reconciliation (Q5), exactly as the old conflict branch.
 * - "refunded": the order is refunded — terminal; nothing was
 *   written and nothing may be published.
 * - "not_found": no such order.
 * - "not_paid": recovery mode (null gateway payment id) found the
 *   order still unpaid — the publish_only premise does not hold.
 * - "retryable": the invite row referenced by a paid order could
 *   not be read/locked (defensive; the FK makes it unreachable in
 *   practice) — the caller must fail the delivery closed.
 * - "duplicate_active_order": the function itself never returns
 *   this — the wrapper below synthesizes it from a 23505
 *   (unique_violation) RPC error once migration 0005 is live: the
 *   mark-paid UPDATE moved the order into 0005's partial unique
 *   index while a successor ACTIVE order already occupies it for
 *   the same invite, so the whole RPC transaction aborted with
 *   nothing written. The money settled at the gateway; only the
 *   database transition is blocked — a terminal conflict for the
 *   delivery, resolved by the owner (runbook §2.1, Q7).
 */
export type SettleAndPublishOutcome =
  | "settled_published"
  | "settled_already_published"
  | "settled_no_invite"
  | "conflict_archived"
  | "refunded"
  | "not_found"
  | "not_paid"
  | "retryable"
  | "duplicate_active_order";

const SETTLE_AND_PUBLISH_OUTCOMES: ReadonlySet<string> = new Set([
  "settled_published",
  "settled_already_published",
  "settled_no_invite",
  "conflict_archived",
  "refunded",
  "not_found",
  "not_paid",
  "retryable",
  "duplicate_active_order",
]);

/**
 * Settle an order and publish its invitation atomically via the
 * settle_and_publish RPC (migration 0004 — which must be applied
 * BEFORE code calling this is deployed; without it PostgREST
 * answers PGRST202 and this throws, failing every fulfilment closed
 * with nothing recorded).
 *
 * `gatewayPaymentId` is the corroborated gateway payment id for a
 * SUCCESS fulfilment, or null in recovery mode (publish_only), where
 * the function publishes only if the order is already paid under the
 * lock and never marks anything.
 *
 * Throws on any RPC error — with ONE translation: an error whose
 * code is "23505" becomes the "duplicate_active_order" outcome (see
 * the outcome list above). Attribution is safe: the function writes
 * nothing else unique-constrained — its orders UPDATE is by primary
 * key and never touches gateway_order_id (NF-4), its invites UPDATE
 * writes only status/published_at (never the unique slug), and it
 * never writes webhook_deliveries — so a unique_violation raised by
 * this call can only be migration 0005's orders_one_active_per_invite
 * index rejecting the mark-paid. Also throws on any outcome outside
 * the documented set — an unrecognized outcome is never guessed into
 * a response.
 */
export async function settleAndPublish(
  orderId: string,
  gatewayPaymentId: string | null,
): Promise<SettleAndPublishOutcome> {
  const { data, error } = await supabaseServer.rpc("settle_and_publish", {
    p_order_id: orderId,
    p_gateway_payment_id: gatewayPaymentId,
  });

  if (error) {
    if ((error as { code?: unknown }).code === "23505") {
      return "duplicate_active_order";
    }
    throw error;
  }

  if (typeof data !== "string" || !SETTLE_AND_PUBLISH_OUTCOMES.has(data)) {
    throw new Error("settle_and_publish returned an unrecognized outcome");
  }

  return data as SettleAndPublishOutcome;
}

/**
 * Look up a previously recorded webhook delivery (idempotency pre-check).
 */
export async function findWebhookDelivery(
  deliveryId: string,
): Promise<{ id: string } | null> {
  const { data, error } = await supabaseServer
    .from("webhook_deliveries")
    .select("id")
    .eq("delivery_id", deliveryId)
    .maybeSingle();

  if (error) throw error;
  return data as { id: string } | null;
}

/**
 * Record a webhook delivery. The handler calls this ONLY after
 * fulfilment has succeeded: recording it earlier (the old behaviour)
 * meant a failed fulfilment permanently blocked every redelivery of
 * that delivery id, bricking the payment.
 */
export async function recordWebhookDelivery(
  deliveryId: string,
  payload: unknown,
): Promise<void> {
  const { error } = await supabaseServer.from("webhook_deliveries").insert({
    delivery_id: deliveryId,
    payload: payload,
    created_at: new Date().toISOString(),
  });

  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Signature verification (extracted unchanged from the webhook handler so the
// comparison itself is unit-testable; the scheme is not modified)
// ---------------------------------------------------------------------------

/**
 * Verify a Razorpay webhook signature: HMAC-SHA256(secret, rawBody) as
 * a raw hex digest — no "sha256=" prefix, unlike some other gateways'
 * schemes (see https://razorpay.com/docs/webhooks/validate-test/).
 * Compared in constant time. Returns false for any mismatch, malformed
 * signature or empty secret — callers fail closed.
 */
export function verifyWebhookSignature(
  rawBody: string,
  signature: string,
  secret: string,
): boolean {
  if (!secret || !signature) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  if (signature.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

// ---------------------------------------------------------------------------
// Gateway order creation + lookup — Razorpay Orders/Payments API
// (https://razorpay.com/docs/api/orders/, .../api/payments/fetch-a-payment/),
// authenticated with HTTP Basic Auth (key_id:key_secret).
// ---------------------------------------------------------------------------

function razorpayAuthHeader(keyId: string, keySecret: string): string {
  return "Basic " + Buffer.from(`${keyId}:${keySecret}`).toString("base64");
}

export interface CreateRazorpayOrderOptions {
  /** Defaults to process.env.VITE_RAZORPAY_KEY_ID — the public key id, read server-side too (same dual-purpose pattern as VITE_SUPABASE_URL). */
  keyId?: string;
  /** Defaults to process.env.RAZORPAY_KEY_SECRET. Never logged. */
  keySecret?: string;
  /** Injectable for tests; defaults to the global fetch. */
  fetchImpl?: typeof fetch;
}

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
}

export type CreateOrderFailureReason =
  "not_configured" | "http_error" | "network_error" | "invalid_response";

export type CreateOrderResult =
  | { ok: true; order: RazorpayOrder }
  | { ok: false; reason: CreateOrderFailureReason };

/**
 * Create a Razorpay order for a given amount (integer paise) — the
 * order id this returns is what Checkout.js is opened with on the
 * client, and what the webhook's payload.order_id is matched against
 * (via getOrderByGatewayOrderId). `receipt` is our own invite id, so
 * the gateway-side record is traceable back to the invitation without
 * exposing anything beyond an opaque id.
 */
export async function createRazorpayOrder(
  amountPaise: number,
  currency: string,
  receipt: string,
  options: CreateRazorpayOrderOptions = {},
): Promise<CreateOrderResult> {
  const keyId = options.keyId ?? process.env["VITE_RAZORPAY_KEY_ID"];
  const keySecret = options.keySecret ?? process.env["RAZORPAY_KEY_SECRET"];
  if (!keyId || !keySecret) {
    return { ok: false, reason: "not_configured" };
  }

  const fetchImpl = options.fetchImpl ?? fetch;
  let response: Response;
  try {
    const init: RequestInit = {
      method: "POST",
      headers: {
        Authorization: razorpayAuthHeader(keyId, keySecret),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount: amountPaise, currency, receipt }),
    };
    if (typeof AbortSignal !== "undefined" && "timeout" in AbortSignal) {
      init.signal = AbortSignal.timeout(10_000);
    }
    response = await fetchImpl("https://api.razorpay.com/v1/orders", init);
  } catch {
    return { ok: false, reason: "network_error" };
  }

  if (!response.ok) {
    return { ok: false, reason: "http_error" };
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    return { ok: false, reason: "invalid_response" };
  }

  if (typeof body !== "object" || body === null) {
    return { ok: false, reason: "invalid_response" };
  }
  const record = body as Record<string, unknown>;
  if (
    typeof record["id"] !== "string" ||
    typeof record["amount"] !== "number" ||
    typeof record["currency"] !== "string"
  ) {
    return { ok: false, reason: "invalid_response" };
  }

  return {
    ok: true,
    order: {
      id: record["id"],
      amount: record["amount"],
      currency: record["currency"],
    },
  };
}

export interface GatewayPayment {
  paymentId: string;
  orderId: string;
  amountPaise: number;
  currency: string;
  status: string;
}

export type GatewayLookupFailureReason =
  "not_configured" | "http_error" | "network_error" | "invalid_response";

export type GatewayLookupResult =
  | { ok: true; payment: GatewayPayment }
  | { ok: false; reason: GatewayLookupFailureReason };

export interface GatewayLookupOptions {
  /** Defaults to process.env.VITE_RAZORPAY_KEY_ID — the public key id, read server-side too (same dual-purpose pattern as VITE_SUPABASE_URL). */
  keyId?: string;
  /** Defaults to process.env.RAZORPAY_KEY_SECRET. Never logged. */
  keySecret?: string;
  /** Injectable for tests; defaults to the global fetch. */
  fetchImpl?: typeof fetch;
}

/**
 * Razorpay's own payment statuses this lookup normalizes into the
 * internal SUCCESS/FAILED vocabulary fulfilmentPlan reasons about.
 * "captured" is the only state money has definitely settled in;
 * "authorized" (card auth held but not captured — not used by this
 * flow, which captures automatically), "created", "refunded" and
 * anything else map through unchanged and fail the
 * lookup_status_mismatch check rather than being guessed into either
 * bucket.
 */
function normalizeRazorpayStatus(status: string): string {
  if (status === "captured") return "SUCCESS";
  if (status === "failed") return "FAILED";
  return status;
}

/**
 * Fetch Razorpay's own record for a payment (GET /v1/payments/{id},
 * Basic Auth with key_id:key_secret). Any failure — missing
 * configuration, network error, non-200, malformed body — returns
 * { ok: false } so callers fail closed and never fulfil on an
 * unverifiable payment.
 */
export async function fetchGatewayPayment(
  paymentId: string,
  options: GatewayLookupOptions = {},
): Promise<GatewayLookupResult> {
  const keyId = options.keyId ?? process.env["VITE_RAZORPAY_KEY_ID"];
  const keySecret = options.keySecret ?? process.env["RAZORPAY_KEY_SECRET"];
  if (!keyId || !keySecret) {
    return { ok: false, reason: "not_configured" };
  }

  const fetchImpl = options.fetchImpl ?? fetch;
  const url = `https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}`;

  let response: Response;
  try {
    const init: RequestInit = {
      method: "GET",
      headers: { Authorization: razorpayAuthHeader(keyId, keySecret) },
    };
    if (typeof AbortSignal !== "undefined" && "timeout" in AbortSignal) {
      init.signal = AbortSignal.timeout(10_000);
    }
    response = await fetchImpl(url, init);
  } catch {
    return { ok: false, reason: "network_error" };
  }

  if (!response.ok) {
    return { ok: false, reason: "http_error" };
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    return { ok: false, reason: "invalid_response" };
  }

  if (typeof body !== "object" || body === null) {
    return { ok: false, reason: "invalid_response" };
  }

  const record = body as Record<string, unknown>;
  const amountPaise = Number(record["amount"]);
  if (
    typeof record["id"] !== "string" ||
    typeof record["order_id"] !== "string" ||
    typeof record["currency"] !== "string" ||
    typeof record["status"] !== "string" ||
    !Number.isFinite(amountPaise)
  ) {
    return { ok: false, reason: "invalid_response" };
  }

  return {
    ok: true,
    payment: {
      paymentId: record["id"],
      orderId: record["order_id"],
      amountPaise,
      currency: record["currency"],
      status: normalizeRazorpayStatus(record["status"]),
    },
  };
}

// ---------------------------------------------------------------------------
// Fulfilment plan — the pure decision the webhook handler executes
// ---------------------------------------------------------------------------

/** The payload fields the fulfilment decision depends on. */
export interface FulfilmentPayloadInput {
  event: string;
  orderId: string;
  amountPaise?: unknown;
  currency?: string;
  /** The gateway payment id the corroborating lookup is keyed by. */
  paymentId?: unknown;
}

export type FulfilmentRejectReason =
  | "amount_mismatch"
  | "currency_mismatch"
  | "missing_payment_id"
  | "lookup_order_mismatch"
  | "lookup_amount_mismatch"
  | "lookup_currency_mismatch"
  | "lookup_status_mismatch";

export type FulfilmentIgnoreReason =
  "already_paid" | "already_failed" | "already_refunded" | "unknown_event";

export type FulfilmentConflictReason = "invite_archived";

export type FulfilmentPlan =
  | { action: "not_found" }
  | { action: "ignore"; reason: FulfilmentIgnoreReason }
  | { action: "reject"; reason: FulfilmentRejectReason }
  | { action: "retry"; reason: "lookup_unavailable"; lookupReason: string }
  | { action: "mark_failed" }
  | { action: "publish_only" }
  | { action: "conflict"; reason: FulfilmentConflictReason }
  | { action: "mark_paid_and_publish"; publishInvite: boolean };

/**
 * The webhook amount is trustworthy only as an exact integer equal to
 * the amount stored on the order at creation time. Strings, floats and
 * missing values never match — an underpaid, overpaid or
 * denomination-confused SUCCESS must not fulfil.
 */
export function amountMatches(
  payloadAmountPaise: unknown,
  orderAmountMinor: number,
): boolean {
  return (
    typeof payloadAmountPaise === "number" &&
    Number.isInteger(payloadAmountPaise) &&
    payloadAmountPaise === orderAmountMinor
  );
}

/**
 * Razorpay's payment entity always carries its own currency field; the
 * webhook handler threads it through as payload.currency. When one is
 * present it must equal the order's stored currency; when absent this
 * check passes and the gateway lookup is the authoritative currency
 * source.
 */
export function payloadCurrencyMismatch(
  payload: FulfilmentPayloadInput,
  order: OrderRow,
): boolean {
  return payload.currency !== undefined && payload.currency !== order.currency;
}

/**
 * Decide what a verified webhook delivery should do.
 *
 * Inputs are everything the handler could gather: the stored order (the
 * only trusted record), the signed payload, the gateway lookup result
 * (null when not attempted — only SUCCESS events need one), and the
 * invite's current status when the order has one.
 *
 * Decision order for SUCCESS is deliberate:
 * 1. payload-level fail-closed checks (currency, then amount) that do
 *    not depend on the gateway at all;
 * 2. an already-paid order is an idempotent no-op, so a replay never
 *    depends on the gateway being reachable — with two explicit-state
 *    exceptions (Round 3 / WS2): if its invite is positively known to
 *    still be a DRAFT, the residue of a partial failure (paid marked,
 *    publish failed), the plan is publish_only, completing the one
 *    outstanding effect; if its invite is ARCHIVED, the plan is a
 *    conflict — archived is a terminal owner decision and no webhook
 *    or recovery action may resurrect it;
 * 3. a SUCCESS with no payment id is a definitive reject (NF-5): the
 *    lookup is keyed by payment id, so it can never be corroborated
 *    and a "retry" verdict would loop on redelivery forever;
 * 4. the gateway's own record must corroborate order, status, amount
 *    and currency — any lookup failure fails closed as "retry" (the
 *    delivery is not recorded, so a redelivery can try again). Only
 *    AFTER corroboration does an archived invite become a conflict:
 *    the order is then marked paid (the money genuinely moved) but
 *    the invite is never published.
 *
 * Invite states are handled explicitly everywhere (the invite status
 * vocabulary is draft / published / archived — 0001 CHECK): publish
 * is planned only for a positively-known draft, or when the state is
 * unknown (null/undefined — the handler always fetches it when the
 * order has an invite, so unknown means the row could not be read;
 * the handler's conditional publish update still refuses to publish
 * anything that is not a draft at write time). An unrecognized status
 * never publishes.
 *
 * A FAILED event never un-pays a paid order and needs no lookup: the
 * gateway reporting failure moves no money.
 */
export function fulfilmentPlan(
  order: OrderRow | null,
  payload: FulfilmentPayloadInput,
  lookup: GatewayLookupResult | null,
  inviteStatus?: string | null,
): FulfilmentPlan {
  if (!order) {
    return { action: "not_found" };
  }

  // A refunded order is terminal for EVERY later event (Round 3
  // consolidation): the money was returned, so nothing the gateway
  // says afterwards may mutate it. Without this case, a FAILED event
  // (or a SUCCESS whose gateway record says FAILED) planned
  // mark_failed — an unconditional update that would have overwritten
  // the refund record with "failed". markOrderPaid's status predicate
  // already excluded "refunded"; the plan now matches it.
  if (order.status === "refunded") {
    return { action: "ignore", reason: "already_refunded" };
  }

  if (payload.event === "FAILED") {
    if (order.status === "paid") {
      return { action: "ignore", reason: "already_paid" };
    }
    if (order.status === "failed") {
      return { action: "ignore", reason: "already_failed" };
    }
    return { action: "mark_failed" };
  }

  if (payload.event !== "SUCCESS") {
    return { action: "ignore", reason: "unknown_event" };
  }

  // SUCCESS from here on.

  if (payloadCurrencyMismatch(payload, order)) {
    return { action: "reject", reason: "currency_mismatch" };
  }

  if (!amountMatches(payload.amountPaise, order.amount_minor)) {
    return { action: "reject", reason: "amount_mismatch" };
  }

  if (order.status === "paid") {
    // Round 2 / scenario 14 — partial-failure recovery: an earlier
    // delivery marked this order paid and then failed the publish
    // step, so its delivery was never recorded and the gateway
    // redelivers. If the invite is positively known to still be a
    // draft, the publish is the only outstanding effect: plan
    // publish_only (the order is NOT re-marked) instead of a no-op
    // that would leave a paid invitation a draft forever.
    //
    // Round 3 / WS2 — explicit invite states replace the old broad
    // "not published ⇒ publishable" condition:
    // - archived: NEVER publish. The owner retired this invite; the
    //   outcome is a recorded conflict for reconciliation, not a
    //   resurrection and not a silent drop.
    // - draft: publish_only (the recovery above).
    // - published / unknown (null/undefined) / no invite: safe no-op.
    if (order.invite_id !== null && inviteStatus === "archived") {
      return { action: "conflict", reason: "invite_archived" };
    }
    if (order.invite_id !== null && inviteStatus === "draft") {
      return { action: "publish_only" };
    }
    return { action: "ignore", reason: "already_paid" };
  }

  // NF-5: without a payment id there is nothing to corroborate, today
  // or on any redelivery — reject definitively instead of returning
  // "retry" and stranding the order behind an endless 500 loop. The
  // already-paid replay above stays a no-op: it needs no lookup.
  if (typeof payload.paymentId !== "string" || payload.paymentId.length === 0) {
    return { action: "reject", reason: "missing_payment_id" };
  }

  // Note: an order in "failed" state may still be fulfilled here.
  // markOrderFailed fires on gateway verification timeouts, and a
  // payment that then actually settles arrives as a later SUCCESS; the
  // gateway lookup below is authoritative for that case.

  if (lookup === null) {
    return {
      action: "retry",
      reason: "lookup_unavailable",
      lookupReason: "not_attempted",
    };
  }
  if (!lookup.ok) {
    return {
      action: "retry",
      reason: "lookup_unavailable",
      lookupReason: lookup.reason,
    };
  }

  const payment = lookup.payment;

  if (payment.orderId !== payload.orderId) {
    return { action: "reject", reason: "lookup_order_mismatch" };
  }

  if (payment.status === "FAILED") {
    return { action: "mark_failed" };
  }
  if (payment.status !== "SUCCESS") {
    return { action: "reject", reason: "lookup_status_mismatch" };
  }

  if (!amountMatches(payment.amountPaise, order.amount_minor)) {
    return { action: "reject", reason: "lookup_amount_mismatch" };
  }

  if (payment.currency !== order.currency) {
    return { action: "reject", reason: "lookup_currency_mismatch" };
  }

  // Round 3 / WS2: the payment is now fully corroborated. If the
  // invite has been archived since checkout, the money state must
  // still be recorded truthfully (the handler marks the order paid)
  // but the invite must never be published — a deliberate conflict
  // outcome, reconciled by a human (see RECONCILIATION.sql Q5),
  // never a silent reactivation and never a fake refund.
  if (order.invite_id !== null && inviteStatus === "archived") {
    return { action: "conflict", reason: "invite_archived" };
  }

  return {
    action: "mark_paid_and_publish",
    // Publish only a positively-known draft. Unknown state
    // (null/undefined) keeps the historical behaviour — the
    // handler's publish update is itself conditional on the invite
    // still being a draft at write time, so an invite archived in
    // the meantime still cannot be published. Any other recognized
    // or unrecognized status does not publish.
    publishInvite:
      order.invite_id !== null &&
      (inviteStatus === "draft" || inviteStatus == null),
  };
}
