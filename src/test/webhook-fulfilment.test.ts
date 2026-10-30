import { describe, expect, it, vi } from "vitest";
import crypto from "node:crypto";

// orders-server.ts imports the service-role Supabase client, which throws
// at module load when server env vars are absent. The functions under
// test here are the pure decision seam plus the gateway lookup with an
// injected fetch, so the client module is stubbed out entirely.
vi.mock("@/lib/supabase-server", () => ({ supabaseServer: {} }));

import {
  amountMatches,
  fetchGatewayPayment,
  fulfilmentPlan,
  payloadCurrencyMismatch,
  verifyWebhookSignature,
  type FulfilmentPayloadInput,
  type GatewayLookupResult,
  type GatewayPayment,
} from "@/lib/orders-server";
import type { OrderRow } from "@/lib/orders-api";

// Batch 2 / Task 3: the webhook used to fulfil on the browser client
// (which can never update orders under RLS), never compared amounts,
// recorded the delivery BEFORE fulfilling (so a failed fulfilment could
// never be retried), and logged the expected HMAC. These tests pin the
// pure decision seam the repaired handler executes: fulfilmentPlan,
// amountMatches, payloadCurrencyMismatch, verifyWebhookSignature, and
// the gateway lookup's result mapping (fetch injected — no live
// gateway is contacted).
//
// Coverage boundary, stated precisely:
// - The HMAC comparison itself IS tested (valid / tampered / wrong
//   secret / malformed), because it is a pure function of
//   (raw body, signature header, secret).
// - NOT covered here, because they live in the route handler, which
//   binds env and headers: the header name read (X-Razorpay-Signature),
//   that the raw body is read before JSON parsing, the HTTP status
//   chosen per plan, and the delivery-row insert ORDER (it sits after
//   the fulfilment awaits in the handler — verified by inspection).
//   The plan-level property that makes a retry possible after a failed
//   fulfilment IS tested below: a failed attempt leaves the order
//   untouched, so a redelivery re-plans to fulfilment.
// - Live Razorpay behaviour (real payload shape, redelivery policy) is
//   not testable in this environment and remains an open assumption.

const SECRET = "test-webhook-secret";

/** Razorpay's scheme: a raw hex HMAC-SHA256 digest, no "sha256=" prefix. */
function sign(body: string, secret: string = SECRET): string {
  return crypto.createHmac("sha256", secret).update(body).digest("hex");
}

function order(status: OrderRow["status"]): OrderRow {
  return {
    id: "order-1",
    user_id: "user-1",
    invite_id: "invite-1",
    tier: "royal",
    amount_minor: 59900,
    currency: "INR",
    gateway: "razorpay",
    gateway_order_id: null,
    gateway_payment_id: null,
    status,
    created_at: "2026-10-21T00:00:00Z",
    paid_at: null,
  };
}

function successPayload(
  overrides: Partial<FulfilmentPayloadInput> = {},
): FulfilmentPayloadInput {
  return {
    event: "SUCCESS",
    orderId: "order-1",
    amountPaise: 59900,
    // A real SUCCESS delivery carries the gateway payment id — the
    // fulfilment plan requires one (NF-5), so the fixture has one.
    paymentId: "pay-1",
    ...overrides,
  };
}

function gatewayPayment(
  overrides: Partial<GatewayPayment> = {},
): GatewayPayment {
  return {
    paymentId: "pay-1",
    orderId: "order-1",
    amountPaise: 59900,
    currency: "INR",
    status: "SUCCESS",
    ...overrides,
  };
}

function lookupOk(
  overrides: Partial<GatewayPayment> = {},
): GatewayLookupResult {
  return { ok: true, payment: gatewayPayment(overrides) };
}

describe("verifyWebhookSignature", () => {
  const body = JSON.stringify({ event: "SUCCESS", orderId: "order-1" });

  it("accepts a correctly signed body", () => {
    expect(verifyWebhookSignature(body, sign(body), SECRET)).toBe(true);
  });

  it("rejects a tampered body", () => {
    expect(verifyWebhookSignature(body + " ", sign(body), SECRET)).toBe(false);
  });

  it("rejects a signature made with the wrong secret", () => {
    expect(
      verifyWebhookSignature(body, sign(body, "other-secret"), SECRET),
    ).toBe(false);
  });

  it("rejects malformed, prefixed or empty signatures", () => {
    // A YouPI-style "sha256=" prefixed signature — the scheme this
    // project's earlier gateway used — must NOT validate against
    // Razorpay's raw-hex-digest scheme.
    const prefixed =
      "sha256=" + crypto.createHmac("sha256", SECRET).update(body).digest("hex");
    expect(verifyWebhookSignature(body, prefixed, SECRET)).toBe(false);
    expect(verifyWebhookSignature(body, "deadbeef", SECRET)).toBe(false);
    expect(verifyWebhookSignature(body, "", SECRET)).toBe(false);
  });
});

describe("amountMatches", () => {
  it("accepts only an exact integer match against the stored order amount", () => {
    expect(amountMatches(59900, 59900)).toBe(true);
    expect(amountMatches(100, 59900)).toBe(false);
    expect(amountMatches(599, 59900)).toBe(false);
    expect(amountMatches(59900.5, 59900)).toBe(false);
  });

  it("rejects string, missing and non-numeric amounts", () => {
    expect(amountMatches("59900", 59900)).toBe(false);
    expect(amountMatches(undefined, 59900)).toBe(false);
    expect(amountMatches(null, 59900)).toBe(false);
    expect(amountMatches(Number.NaN, 59900)).toBe(false);
  });
});

describe("payloadCurrencyMismatch", () => {
  it("fails closed only when a currency is present and different", () => {
    expect(payloadCurrencyMismatch(successPayload(), order("created"))).toBe(
      false,
    );
    expect(
      payloadCurrencyMismatch(
        successPayload({ currency: "INR" }),
        order("created"),
      ),
    ).toBe(false);
    expect(
      payloadCurrencyMismatch(
        successPayload({ currency: "USD" }),
        order("created"),
      ),
    ).toBe(true);
  });
});

describe("fulfilmentPlan — SUCCESS events", () => {
  it("plans not_found for a missing order", () => {
    expect(fulfilmentPlan(null, successPayload(), lookupOk())).toEqual({
      action: "not_found",
    });
  });

  it("rejects a SUCCESS whose amount differs from the order amount", () => {
    expect(
      fulfilmentPlan(
        order("created"),
        successPayload({ amountPaise: 100 }),
        lookupOk(),
      ),
    ).toEqual({ action: "reject", reason: "amount_mismatch" });
  });

  it("rejects string or missing payload amounts", () => {
    expect(
      fulfilmentPlan(
        order("created"),
        successPayload({ amountPaise: "59900" }),
        lookupOk(),
      ),
    ).toEqual({ action: "reject", reason: "amount_mismatch" });
    expect(
      fulfilmentPlan(
        order("created"),
        successPayload({ amountPaise: undefined }),
        lookupOk(),
      ),
    ).toEqual({ action: "reject", reason: "amount_mismatch" });
  });

  it("plans fulfilment only when payload, lookup, amount and currency all match", () => {
    expect(
      fulfilmentPlan(order("created"), successPayload(), lookupOk()),
    ).toEqual({ action: "mark_paid_and_publish", publishInvite: true });
  });

  it("rejects when the payload currency is present and wrong, even if the lookup passes", () => {
    expect(
      fulfilmentPlan(
        order("created"),
        successPayload({ currency: "USD" }),
        lookupOk(),
      ),
    ).toEqual({ action: "reject", reason: "currency_mismatch" });
  });

  it("rejects when the gateway record is in a different currency", () => {
    expect(
      fulfilmentPlan(
        order("created"),
        successPayload(),
        lookupOk({ currency: "USD" }),
      ),
    ).toEqual({ action: "reject", reason: "lookup_currency_mismatch" });
  });

  it("rejects when the gateway record is for a different order", () => {
    expect(
      fulfilmentPlan(
        order("created"),
        successPayload(),
        lookupOk({ orderId: "order-2" }),
      ),
    ).toEqual({ action: "reject", reason: "lookup_order_mismatch" });
  });

  it("rejects when the gateway record's amount differs from the order", () => {
    expect(
      fulfilmentPlan(
        order("created"),
        successPayload(),
        lookupOk({ amountPaise: 100 }),
      ),
    ).toEqual({ action: "reject", reason: "lookup_amount_mismatch" });
  });

  it("plans mark_failed when the gateway record says the payment FAILED", () => {
    expect(
      fulfilmentPlan(
        order("created"),
        successPayload(),
        lookupOk({ status: "FAILED" }),
      ),
    ).toEqual({ action: "mark_failed" });
  });

  it("rejects when the gateway record is in a non-terminal non-success state", () => {
    expect(
      fulfilmentPlan(
        order("created"),
        successPayload(),
        lookupOk({ status: "PROCESSING" }),
      ),
    ).toEqual({ action: "reject", reason: "lookup_status_mismatch" });
  });

  it("fails closed (retry) when the gateway lookup errors or was not attempted", () => {
    expect(
      fulfilmentPlan(order("created"), successPayload(), {
        ok: false,
        reason: "network_error",
      }),
    ).toEqual({
      action: "retry",
      reason: "lookup_unavailable",
      lookupReason: "network_error",
    });
    expect(fulfilmentPlan(order("created"), successPayload(), null)).toEqual({
      action: "retry",
      reason: "lookup_unavailable",
      lookupReason: "not_attempted",
    });
  });

  it("rejects a SUCCESS with no paymentId instead of retrying forever", () => {
    // NF-5: the gateway lookup is keyed by paymentId — with none, no
    // redelivery can ever corroborate the payment, so a "retry" verdict
    // would strand a paid order behind an endless generic-500 loop.
    // Definitive reject: the handler answers 400 and records nothing.
    expect(
      fulfilmentPlan(
        order("created"),
        successPayload({ paymentId: undefined }),
        null,
      ),
    ).toEqual({ action: "reject", reason: "missing_payment_id" });
    expect(
      fulfilmentPlan(order("created"), successPayload({ paymentId: "" }), null),
    ).toEqual({ action: "reject", reason: "missing_payment_id" });
    expect(
      fulfilmentPlan(
        order("created"),
        successPayload({ paymentId: 12345 }),
        null,
      ),
    ).toEqual({ action: "reject", reason: "missing_payment_id" });
  });

  it("an already-paid replay without a paymentId is still a no-op", () => {
    expect(
      fulfilmentPlan(
        order("paid"),
        successPayload({ paymentId: undefined }),
        null,
      ),
    ).toEqual({ action: "ignore", reason: "already_paid" });
  });

  it("treats an already-paid order as an idempotent no-op", () => {
    expect(fulfilmentPlan(order("paid"), successPayload(), lookupOk())).toEqual(
      { action: "ignore", reason: "already_paid" },
    );
  });

  it("treats an already-paid order whose invite is published as a no-op", () => {
    expect(
      fulfilmentPlan(order("paid"), successPayload(), lookupOk(), "published"),
    ).toEqual({ action: "ignore", reason: "already_paid" });
  });

  // Round 2 / scenario 14: a first delivery can mark the order paid and
  // then fail the publish step; the handler answers 500 and records
  // nothing, so the gateway redelivers. On redelivery the order is
  // already "paid" — the plan must complete the outstanding publish
  // instead of no-oping, or the paid invitation stays a draft forever.
  it("plans publish_only when a paid order's invite is still unpublished (partial-failure recovery)", () => {
    expect(
      fulfilmentPlan(order("paid"), successPayload(), lookupOk(), "draft"),
    ).toEqual({ action: "publish_only" });
  });

  it("plans publish_only for a paid order even when the replay carries no paymentId", () => {
    // The payment was corroborated when the order was marked paid;
    // completing the publish does not depend on the replay's payload.
    expect(
      fulfilmentPlan(
        order("paid"),
        successPayload({ paymentId: undefined }),
        null,
        "draft",
      ),
    ).toEqual({ action: "publish_only" });
  });

  it("stays a no-op for a paid order when the invite state is unknown", () => {
    // publish_only requires positive knowledge that the invite is
    // unpublished; an unknown status must not trigger a publish.
    expect(
      fulfilmentPlan(order("paid"), successPayload(), lookupOk(), null),
    ).toEqual({ action: "ignore", reason: "already_paid" });
    const noInvite = { ...order("paid"), invite_id: null };
    expect(
      fulfilmentPlan(noInvite, successPayload(), lookupOk(), "draft"),
    ).toEqual({ action: "ignore", reason: "already_paid" });
  });

  // Round 3 / WS2: archived is a terminal owner decision, not a
  // synonym for "unpublished". The old broad condition
  // (inviteStatus !== "published" ⇒ publishable) would resurrect an
  // archived invite through both fulfilment and the publish_only
  // recovery path. Explicit state handling instead:
  it("round3-ws2: never plans publish_only for an archived invite — a paid order's replay is a conflict", () => {
    expect(
      fulfilmentPlan(order("paid"), successPayload(), lookupOk(), "archived"),
    ).toEqual({ action: "conflict", reason: "invite_archived" });
  });

  it("round3-ws2: plans a conflict for a corroborated SUCCESS whose invite is archived", () => {
    // The handler executes the conflict by marking the order paid
    // (money state is truth — the gateway verified the payment) while
    // never touching the invite.
    expect(
      fulfilmentPlan(
        order("created"),
        successPayload(),
        lookupOk(),
        "archived",
      ),
    ).toEqual({ action: "conflict", reason: "invite_archived" });
  });

  it("round3-ws2: corroboration precedes the conflict — an archived invite with an unavailable lookup still retries", () => {
    // The order must not be marked paid on an unverifiable payment,
    // archived or not: the lookup failure stays a retryable deferral.
    expect(
      fulfilmentPlan(
        order("created"),
        successPayload(),
        {
          ok: false,
          reason: "network_error",
        },
        "archived",
      ),
    ).toEqual({
      action: "retry",
      reason: "lookup_unavailable",
      lookupReason: "network_error",
    });
  });

  it("round3-ws2: never plans a publish for an unrecognized invite status", () => {
    // The 0001 CHECK constraint limits status to draft/published/
    // archived, so this is defence in depth: an unknown value fails
    // safe (order may still be marked paid on a corroborated payment,
    // but nothing is published).
    expect(
      fulfilmentPlan(
        order("created"),
        successPayload(),
        lookupOk(),
        "some-future-status",
      ),
    ).toEqual({ action: "mark_paid_and_publish", publishInvite: false });
  });

  it("an already-paid replay does not depend on the gateway being reachable", () => {
    expect(
      fulfilmentPlan(order("paid"), successPayload(), {
        ok: false,
        reason: "http_error",
      }),
    ).toEqual({ action: "ignore", reason: "already_paid" });
  });

  it("skips the publish step when the invite is already published", () => {
    expect(
      fulfilmentPlan(
        order("created"),
        successPayload(),
        lookupOk(),
        "published",
      ),
    ).toEqual({ action: "mark_paid_and_publish", publishInvite: false });
  });

  it("skips the publish step when the order has no invite", () => {
    const noInvite = { ...order("created"), invite_id: null };
    expect(fulfilmentPlan(noInvite, successPayload(), lookupOk())).toEqual({
      action: "mark_paid_and_publish",
      publishInvite: false,
    });
  });

  it("fulfils a late SUCCESS for an order previously marked failed, once the gateway record verifies", () => {
    // markOrderFailed fires on verification timeouts; a payment that
    // then actually settles arrives as a later SUCCESS. The gateway's
    // own record is authoritative, so full verification may fulfil it.
    expect(
      fulfilmentPlan(order("failed"), successPayload(), lookupOk()),
    ).toEqual({ action: "mark_paid_and_publish", publishInvite: true });
  });

  it("re-plans to fulfilment after a failed attempt, so a redelivery can retry", () => {
    // The handler records the delivery only AFTER fulfilment succeeds,
    // so when markOrderPaid throws, the order stays "created" and no
    // delivery row exists. The redelivery therefore re-plans to the
    // same fulfilment instead of hitting already_processed.
    const before = fulfilmentPlan(
      order("created"),
      successPayload(),
      lookupOk(),
    );
    const redelivered = fulfilmentPlan(
      order("created"),
      successPayload(),
      lookupOk(),
    );
    expect(before).toEqual({
      action: "mark_paid_and_publish",
      publishInvite: true,
    });
    expect(redelivered).toEqual(before);
  });
});

describe("fulfilmentPlan — FAILED and unknown events", () => {
  it("plans mark_failed for FAILED on an unpaid order", () => {
    expect(
      fulfilmentPlan(
        order("created"),
        { event: "FAILED", orderId: "order-1" },
        null,
      ),
    ).toEqual({ action: "mark_failed" });
  });

  it("never un-pays a paid order on a FAILED event", () => {
    expect(
      fulfilmentPlan(
        order("paid"),
        { event: "FAILED", orderId: "order-1" },
        null,
      ),
    ).toEqual({ action: "ignore", reason: "already_paid" });
  });

  it("treats a repeated FAILED as an idempotent no-op", () => {
    expect(
      fulfilmentPlan(
        order("failed"),
        { event: "FAILED", orderId: "order-1" },
        null,
      ),
    ).toEqual({ action: "ignore", reason: "already_failed" });
  });

  it("ignores unknown events without state changes", () => {
    expect(
      fulfilmentPlan(
        order("created"),
        { event: "REFUNDED", orderId: "order-1" },
        null,
      ),
    ).toEqual({ action: "ignore", reason: "unknown_event" });
  });

  it("ignores a non-terminal PENDING event without state changes", () => {
    // Scenario 7: a pending payment is not a success and not a
    // failure — nothing may be marked until a terminal event arrives
    // (and the gateway lookup remains the authority for SUCCESS).
    expect(
      fulfilmentPlan(
        order("created"),
        { event: "PENDING", orderId: "order-1" },
        null,
      ),
    ).toEqual({ action: "ignore", reason: "unknown_event" });
  });

  it("plans not_found before event handling when the order is missing", () => {
    expect(
      fulfilmentPlan(null, { event: "FAILED", orderId: "nope" }, null),
    ).toEqual({ action: "not_found" });
  });
});

describe("fetchGatewayPayment", () => {
  const base = { keyId: "rzp_test_key", keySecret: SECRET };

  it("returns the gateway record, normalised to SUCCESS, with Basic Auth", async () => {
    const calls: Array<{ url: string; init: RequestInit | undefined }> = [];
    const fetchImpl = (async (url: string, init?: RequestInit) => {
      calls.push({ url, init });
      return {
        ok: true,
        status: 200,
        json: async () => ({
          id: "pay-1",
          order_id: "order-1",
          amount: 59900,
          currency: "INR",
          status: "captured",
        }),
      };
    }) as unknown as typeof fetch;

    const result = await fetchGatewayPayment("pay-1", { ...base, fetchImpl });

    expect(result).toEqual({ ok: true, payment: gatewayPayment() });
    expect(calls).toHaveLength(1);
    expect(calls[0]?.url).toBe("https://api.razorpay.com/v1/payments/pay-1");
    const headers = (calls[0]?.init?.headers ?? {}) as Record<string, string>;
    expect(headers["Authorization"]).toBe(
      "Basic " + Buffer.from(`${base.keyId}:${base.keySecret}`).toString("base64"),
    );
  });

  it("normalises a Razorpay 'failed' status to FAILED", async () => {
    const fetchImpl = (async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        id: "pay-1",
        order_id: "order-1",
        amount: 59900,
        currency: "INR",
        status: "failed",
      }),
    })) as unknown as typeof fetch;

    const result = await fetchGatewayPayment("pay-1", { ...base, fetchImpl });
    expect(result).toEqual({
      ok: true,
      payment: gatewayPayment({ status: "FAILED" }),
    });
  });

  it("fails closed when the gateway returns a non-200 response", async () => {
    const fetchImpl = (async () => ({
      ok: false,
      status: 500,
      json: async () => ({}),
    })) as unknown as typeof fetch;

    expect(await fetchGatewayPayment("pay-1", { ...base, fetchImpl })).toEqual({
      ok: false,
      reason: "http_error",
    });
  });

  it("fails closed when the gateway is unreachable", async () => {
    const fetchImpl = (async () => {
      throw new Error("connection refused");
    }) as unknown as typeof fetch;

    expect(await fetchGatewayPayment("pay-1", { ...base, fetchImpl })).toEqual({
      ok: false,
      reason: "network_error",
    });
  });

  it("fails closed when the gateway response lacks required fields", async () => {
    const fetchImpl = (async () => ({
      ok: true,
      status: 200,
      json: async () => ({ id: "pay-1", status: "captured" }),
    })) as unknown as typeof fetch;

    expect(await fetchGatewayPayment("pay-1", { ...base, fetchImpl })).toEqual({
      ok: false,
      reason: "invalid_response",
    });
  });

  it("fails closed when the key id or secret is not configured", async () => {
    const fetchImpl = (async () => {
      throw new Error("fetch must not be called when unconfigured");
    }) as unknown as typeof fetch;

    expect(
      await fetchGatewayPayment("pay-1", {
        keyId: "",
        keySecret: SECRET,
        fetchImpl,
      }),
    ).toEqual({ ok: false, reason: "not_configured" });
    expect(
      await fetchGatewayPayment("pay-1", {
        keyId: base.keyId,
        keySecret: "",
        fetchImpl,
      }),
    ).toEqual({ ok: false, reason: "not_configured" });
  });
});

describe("fulfilmentPlan — refunded orders are terminal (Round 3 consolidation)", () => {
  // Found by the Round-3 consolidation review: "refunded" is a real
  // order status (0001 CHECK) and markOrderPaid's predicate already
  // treats it as terminal, but the plan had no refunded case — a
  // FAILED event (or a SUCCESS whose gateway record says FAILED)
  // planned mark_failed, and markOrderFailed is an unconditional
  // update, so a late/contradictory delivery would have overwritten
  // the refund record with "failed". A refunded order must be a
  // no-op for every later event: the money was returned, and nothing
  // the gateway says afterwards may mutate the order.
  it("never plans mark_failed for a refunded order on a FAILED event", () => {
    expect(
      fulfilmentPlan(
        order("refunded"),
        { event: "FAILED", orderId: "order-1" },
        null,
      ),
    ).toEqual({ action: "ignore", reason: "already_refunded" });
  });

  it("never plans fulfilment for a refunded order on a corroborated SUCCESS", () => {
    expect(
      fulfilmentPlan(order("refunded"), successPayload(), lookupOk(), "draft"),
    ).toEqual({ action: "ignore", reason: "already_refunded" });
  });

  it("never plans mark_failed for a refunded order when the gateway record says FAILED", () => {
    expect(
      fulfilmentPlan(
        order("refunded"),
        successPayload(),
        lookupOk({ status: "FAILED" }),
        "draft",
      ),
    ).toEqual({ action: "ignore", reason: "already_refunded" });
  });
});
