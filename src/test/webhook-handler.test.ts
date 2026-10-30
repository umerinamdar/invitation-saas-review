import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import crypto from "node:crypto";

// Handler-level tests for POST /api/webhooks/razorpay (ported from the
// project's earlier YouPI integration's §5.12 resilience matrix). The
// plan-level seam is covered by webhook-fulfilment.test.ts; this file
// drives the REAL handler with a stateful fake Supabase and a stubbed
// gateway fetch, pinning the behaviours that only exist in the route:
// status codes, the delivery-id pre-check, record-after-fulfilment
// ordering, and recovery across redeliveries.
//
// Razorpay has no delivery-id header of its own (unlike YouPI's
// x-gateway-delivery-id) — the idempotency key the handler uses is the
// payment id inside the signed payload itself (payload.payment.entity.id),
// which is stable across genuine redeliveries of the same event and
// distinct across different payment attempts. Tests that previously
// modelled "the same webhook redelivered under a fresh delivery id"
// (an artifact of YouPI's own id scheme) are adapted to what can
// actually happen with Razorpay: a true redelivery carries the SAME
// payment id (covered by the duplicate-delivery scenarios below); two
// DIFFERENT payment ids racing the same order models a genuinely
// different case — two separate payment attempts against one order —
// and is kept where the original intent was to prove the atomic
// status-predicate protects even when id-based dedup does not apply.
//
// The fake enforces webhook_deliveries.delivery_id UNIQUE exactly as
// migration 0002 does — that constraint is the last line of defence
// when two deliveries of the same id race (scenario 11). True
// row-lock interleaving can only be proven against a live database;
// what is pinned here is the invariant the combination guarantees:
// one delivery row, one paid marking, one publish.
const mockState = vi.hoisted(() => ({
  order: null as Record<string, unknown> | null,
  inviteStatus: "draft" as string,
  deliveries: new Map<string, unknown>(),
  orderWrites: [] as Record<string, unknown>[],
  inviteWrites: [] as Record<string, unknown>[],
  failOrderUpdate: null as { message: string } | null,
  failInviteUpdate: null as { message: string } | null,
  // Round 3.5: when set, the fake flips the stored order's status to
  // this value immediately AFTER a select-read has taken its snapshot
  // — modelling a concurrent write that lands between the handler's
  // order read and its subsequent update. Fires once.
  flipStatusAfterRead: null as string | null,
  // Round 3.6: when set, the Nth orders-table select (1-based,
  // counted across the whole request) fails with a DB error — used
  // to make the handler's post-transition re-read fail (test D).
  failOrderSelectAt: null as number | null,
  orderSelectCount: 0,
  // Round 3.6: one-shot failure of the webhook_deliveries insert —
  // models a transient DB error at the record step, after fulfilment
  // itself already succeeded.
  failDeliveryInsert: null as { message: string } | null,
  // Round 3.7: failure of the invites select — serves the handler's
  // invite-status pre-read (Fix 2). The pre-fix handler destructured
  // only { data }, so this error was invisible to it.
  failInviteSelect: null as { message: string } | null,
  // Round 3.7: failure of the settle_and_publish RPC call itself
  // (e.g. PGRST202 before migration 0004 is applied, or a transient
  // database error inside the transaction).
  failRpc: null as { message: string; code?: string } | null,
  rpcCalls: [] as Array<{ name: string; args: Record<string, unknown> }>,
  // Round 3.7 review: a SECOND order for the same invite (the
  // successor created when a customer retries after a failure). The
  // rpc stub consults it to mirror migration 0005's partial unique
  // index: a mark-paid that would put the settled order INTO the
  // ('created','paid') predicate while the sibling already occupies
  // it raises 23505 and aborts the whole call (no writes applied).
  siblingOrder: null as Record<string, unknown> | null,
  gatewayMode: "ok" as "ok" | "network_error" | "http_error",
  gatewayRecord: null as Record<string, unknown> | null,
}));

vi.mock("@/lib/supabase-server", () => {
  type Ctx = {
    table: string;
    op: "select" | "update" | "insert" | null;
    eqValue: unknown;
    eqPairs: Array<[string, unknown]>;
    inValues: unknown[] | null;
    payload: Record<string, unknown> | null;
  };

  function makeChain(table: string) {
    const ctx: Ctx = {
      table,
      op: null,
      eqValue: undefined,
      eqPairs: [],
      inValues: null,
      payload: null,
    };

    const settle = (): { data: unknown; error: unknown } => {
      if (ctx.table === "invites" && ctx.op === "update") {
        if (mockState.failInviteUpdate) {
          return { data: null, error: mockState.failInviteUpdate };
        }
        // Round 3: model conditional-update semantics honestly — an
        // update carrying a status predicate applies ONLY when the
        // row is still in that status (this is what PostgREST does:
        // the WHERE clause simply matches zero rows otherwise).
        const statusPredicate = ctx.eqPairs.find(
          ([col]) => col === "status",
        )?.[1];
        if (
          statusPredicate !== undefined &&
          statusPredicate !== mockState.inviteStatus
        ) {
          return { data: [], error: null };
        }
        mockState.inviteStatus = String(ctx.payload?.["status"] ?? "");
        mockState.inviteWrites.push(ctx.payload ?? {});
        return { data: [{ id: "invite-1" }], error: null };
      }
      if (ctx.table === "webhook_deliveries" && ctx.op === "insert") {
        if (mockState.failDeliveryInsert) {
          const insertError = mockState.failDeliveryInsert;
          mockState.failDeliveryInsert = null;
          return { data: null, error: insertError };
        }
        const id = String(ctx.payload?.["delivery_id"] ?? "");
        if (mockState.deliveries.has(id)) {
          // Migration 0002: delivery_id is UNIQUE — a racing duplicate
          // insert fails instead of double-recording.
          return {
            data: null,
            error: { code: "23505", message: "duplicate key value" },
          };
        }
        mockState.deliveries.set(id, ctx.payload);
        return { data: null, error: null };
      }
      return { data: null, error: null };
    };

    const chain = {
      select: () => {
        if (ctx.op === null) ctx.op = "select";
        return chain;
      },
      update: (payload: Record<string, unknown>) => {
        ctx.op = "update";
        ctx.payload = payload;
        return chain;
      },
      insert: (payload: Record<string, unknown>) => {
        ctx.op = "insert";
        ctx.payload = payload;
        return chain;
      },
      eq: (col: string, value: unknown) => {
        ctx.eqValue = value;
        ctx.eqPairs.push([col, value]);
        return chain;
      },
      in: (_col: string, values: unknown[]) => {
        ctx.inValues = values;
        return chain;
      },
      maybeSingle: async () => {
        if (ctx.table === "orders" && ctx.op === "update") {
          // Round 3: the atomic conditional mark-paid. When the update
          // carries a status IN (...) predicate, PostgREST applies it
          // only to a row still in one of those statuses; a row that
          // has already transitioned matches nothing and maybeSingle
          // returns null data — the caller did NOT win the transition.
          if (mockState.failOrderUpdate) {
            return { data: null, error: mockState.failOrderUpdate };
          }
          if (
            ctx.inValues !== null &&
            mockState.order &&
            !ctx.inValues.includes(mockState.order["status"])
          ) {
            return { data: null, error: null };
          }
          mockState.order = { ...mockState.order, ...(ctx.payload ?? {}) };
          mockState.orderWrites.push(ctx.payload ?? {});
          return { data: { ...mockState.order }, error: null };
        }
        if (ctx.table === "orders") {
          mockState.orderSelectCount += 1;
          if (
            mockState.failOrderSelectAt !== null &&
            mockState.failOrderSelectAt === mockState.orderSelectCount
          ) {
            return {
              data: null,
              error: { message: "database unavailable" },
            };
          }
          // The handler looks orders up by gateway_order_id (the
          // Razorpay order id in the webhook payload), never by the
          // internal primary key — mirror whichever column the real
          // query used.
          const idPair = ctx.eqPairs.find(([col]) => col === "id");
          const gwPair = ctx.eqPairs.find(
            ([col]) => col === "gateway_order_id",
          );
          const matchField = idPair ? "id" : "gateway_order_id";
          const matchValue = idPair ? idPair[1] : gwPair?.[1];
          const found =
            mockState.order && mockState.order[matchField] === matchValue
              ? { ...mockState.order }
              : null;
          // Round 3.5 race interleave: the snapshot above is what
          // the caller read; the stored row now moves on without it
          // (a concurrent refund / settlement committed first). The
          // caller's later UPDATE is then evaluated against the NEW
          // state — exactly the window a status predicate must close.
          if (found && mockState.flipStatusAfterRead !== null) {
            mockState.order = {
              ...mockState.order,
              status: mockState.flipStatusAfterRead,
            };
            mockState.flipStatusAfterRead = null;
          }
          return { data: found, error: null };
        }
        if (ctx.table === "invites") {
          if (mockState.failInviteSelect) {
            return { data: null, error: mockState.failInviteSelect };
          }
          return {
            data: mockState.order?.["invite_id"]
              ? { status: mockState.inviteStatus }
              : null,
            error: null,
          };
        }
        if (ctx.table === "webhook_deliveries") {
          return {
            data: mockState.deliveries.has(String(ctx.eqValue))
              ? { id: "delivery-row" }
              : null,
            error: null,
          };
        }
        return { data: null, error: null };
      },
      single: async () => {
        if (ctx.table === "orders" && ctx.op === "update") {
          if (mockState.failOrderUpdate) {
            return { data: null, error: mockState.failOrderUpdate };
          }
          mockState.order = { ...mockState.order, ...(ctx.payload ?? {}) };
          mockState.orderWrites.push(ctx.payload ?? {});
          return { data: { ...mockState.order }, error: null };
        }
        return { data: null, error: null };
      },
      // The handler awaits some chains directly (invites update,
      // webhook_deliveries insert), like the real PostgREST builder.
      then: (
        onFulfilled: (v: { data: unknown; error: unknown }) => unknown,
        onRejected?: (e: unknown) => unknown,
      ) => Promise.resolve(settle()).then(onFulfilled, onRejected),
    };
    return chain;
  }

  return {
    supabaseServer: {
      from: (table: string) => makeChain(table),
      // Round 3.7: the settle_and_publish RPC (migration 0004). The
      // stub evaluates the CURRENT stored order + invite state at
      // call time and applies mark-paid + publish as ONE atomic step
      // — no interleave can be staged inside it, mirroring the SQL
      // function's single transaction. What this models honestly is
      // the outcome contract (which outcome string each state at call
      // time produces, and the writes each outcome performs). What
      // it CANNOT prove is PostgreSQL row-lock / snapshot behaviour
      // — that remains the owner-side Q-17 live drill.
      rpc: async (name: string, args: Record<string, unknown>) => {
        mockState.rpcCalls.push({ name, args });
        if (name !== "settle_and_publish") {
          return {
            data: null,
            error: { message: `unknown rpc ${name}`, code: "PGRST202" },
          };
        }
        if (mockState.failRpc) {
          return { data: null, error: mockState.failRpc };
        }
        // A database failure at either write inside the transaction
        // fails the WHOLE call atomically (nothing is applied).
        if (mockState.failOrderUpdate) {
          return { data: null, error: mockState.failOrderUpdate };
        }
        if (mockState.failInviteUpdate) {
          return { data: null, error: mockState.failInviteUpdate };
        }
        const order = mockState.order;
        if (!order || order["id"] !== args["p_order_id"]) {
          return { data: "not_found", error: null };
        }
        const inviteId = order["invite_id"];
        if (order["status"] === "refunded") {
          return { data: "refunded", error: null };
        }
        if (order["status"] === "created" || order["status"] === "failed") {
          const paymentId = args["p_gateway_payment_id"];
          if (paymentId === null || paymentId === undefined) {
            return { data: "not_paid", error: null };
          }
          // Migration 0005 (orders_one_active_per_invite): the
          // mark-paid UPDATE moves this order INTO the index
          // predicate (invite_id not null, status in
          // ('created','paid')). If a sibling order for the same
          // invite already occupies that predicate, Postgres raises
          // 23505 and the whole transaction aborts — no writes.
          const sibling = mockState.siblingOrder;
          if (
            inviteId &&
            sibling &&
            sibling["invite_id"] === inviteId &&
            (sibling["status"] === "created" || sibling["status"] === "paid")
          ) {
            return {
              data: null,
              error: {
                code: "23505",
                message:
                  'duplicate key value violates unique constraint "orders_one_active_per_invite"',
              },
            };
          }
          const paidWrite = {
            status: "paid",
            paid_at: new Date().toISOString(),
            gateway_payment_id: paymentId,
          };
          mockState.order = { ...order, ...paidWrite };
          mockState.orderWrites.push(paidWrite);
        }
        // The order is paid here (already, or just marked above).
        if (!inviteId) {
          return { data: "settled_no_invite", error: null };
        }
        if (mockState.inviteStatus === "published") {
          return { data: "settled_already_published", error: null };
        }
        if (mockState.inviteStatus === "archived") {
          return { data: "conflict_archived", error: null };
        }
        if (mockState.inviteStatus === "draft") {
          mockState.inviteStatus = "published";
          mockState.inviteWrites.push({
            status: "published",
            published_at: new Date().toISOString(),
          });
          return { data: "settled_published", error: null };
        }
        return { data: "retryable", error: null };
      },
    },
  };
});

import { POST } from "@/routes/api/webhooks/razorpay";

const SECRET = "test-webhook-secret";

/** Razorpay's scheme: a raw hex HMAC-SHA256 digest, no prefix. */
function sign(body: string, secret: string = SECRET): string {
  return crypto.createHmac("sha256", secret).update(body).digest("hex");
}

interface PayloadOverrides {
  event?: string;
  orderId?: string;
  paymentId?: string;
  amount?: number;
  currency?: string;
}

const defaults: Required<PayloadOverrides> = {
  event: "payment.captured",
  orderId: "order-1",
  paymentId: "pay-1",
  amount: 59900,
  currency: "INR",
};

/** Builds Razorpay's actual nested webhook payload shape. */
function razorpayBody(overrides: PayloadOverrides = {}): unknown {
  const merged = { ...defaults, ...overrides };
  return {
    event: merged.event,
    payload: {
      payment: {
        entity: {
          id: merged.paymentId,
          order_id: merged.orderId,
          amount: merged.amount,
          currency: merged.currency,
          status: merged.event === "payment.failed" ? "failed" : "captured",
        },
      },
    },
  };
}

function webhookRequest(
  overrides: PayloadOverrides = {},
  opts: { secret?: string; signature?: string } = {},
): Request {
  const body = JSON.stringify(razorpayBody(overrides));
  const headers: Record<string, string> = {
    "x-razorpay-signature":
      opts.signature ?? sign(body, opts.secret ?? SECRET),
  };
  return new Request("http://localhost/api/webhooks/razorpay", {
    method: "POST",
    headers,
    body,
  });
}

beforeEach(() => {
  mockState.order = {
    id: "order-1",
    user_id: "user-1",
    invite_id: "invite-1",
    tier: "royal",
    amount_minor: 59900,
    currency: "INR",
    gateway: "razorpay",
    gateway_order_id: "order-1",
    gateway_payment_id: null,
    status: "created",
    created_at: "2026-10-21T00:00:00Z",
    paid_at: null,
  };
  mockState.inviteStatus = "draft";
  mockState.deliveries = new Map();
  mockState.orderWrites = [];
  mockState.inviteWrites = [];
  mockState.failOrderUpdate = null;
  mockState.failInviteUpdate = null;
  mockState.flipStatusAfterRead = null;
  mockState.failOrderSelectAt = null;
  mockState.orderSelectCount = 0;
  mockState.failDeliveryInsert = null;
  mockState.failInviteSelect = null;
  mockState.failRpc = null;
  mockState.rpcCalls = [];
  mockState.siblingOrder = null;
  mockState.gatewayMode = "ok";
  mockState.gatewayRecord = {
    id: "pay-1",
    order_id: "order-1",
    amount: 59900,
    currency: "INR",
    status: "captured",
  };

  process.env["RAZORPAY_WEBHOOK_SECRET"] = SECRET;
  process.env["VITE_RAZORPAY_KEY_ID"] = "rzp_test_key";
  process.env["RAZORPAY_KEY_SECRET"] = "test-key-secret";

  vi.stubGlobal("fetch", (async () => {
    if (mockState.gatewayMode === "network_error") {
      throw new Error("connection refused");
    }
    if (mockState.gatewayMode === "http_error") {
      return { ok: false, status: 502, json: async () => ({}) };
    }
    return {
      ok: true,
      status: 200,
      json: async () => mockState.gatewayRecord,
    };
  }) as unknown as typeof fetch);

  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  delete process.env["RAZORPAY_WEBHOOK_SECRET"];
  delete process.env["VITE_RAZORPAY_KEY_ID"];
  delete process.env["RAZORPAY_KEY_SECRET"];
});

describe("POST /api/webhooks/razorpay — handler-level resilience matrix", () => {
  it("scenario 1: a valid payment.captured fulfils end to end (paid, published, delivery recorded)", async () => {
    const res = await POST(webhookRequest());

    expect(res.status).toBe(200);
    const data = (await res.json()) as { status: string };
    expect(data.status).toBe("success");
    expect(mockState.orderWrites).toHaveLength(1);
    expect(mockState.orderWrites[0]?.["status"]).toBe("paid");
    expect(mockState.orderWrites[0]?.["gateway_payment_id"]).toBe("pay-1");
    expect(mockState.inviteWrites).toHaveLength(1);
    expect(mockState.inviteStatus).toBe("published");
    expect(mockState.deliveries.has("pay-1")).toBe(true);
  });

  it("scenario 2: an invalid signature is rejected 401 and touches nothing", async () => {
    const res = await POST(webhookRequest({}, { secret: "attacker-secret" }));

    expect(res.status).toBe(401);
    expect(mockState.orderWrites).toHaveLength(0);
    expect(mockState.inviteWrites).toHaveLength(0);
    expect(mockState.deliveries.size).toBe(0);
    expect(mockState.order?.["status"]).toBe("created");
  });

  it("scenario 5: an unknown gateway order id is answered 404 and touches nothing", async () => {
    const res = await POST(webhookRequest({ orderId: "order-999" }));

    expect(res.status).toBe(404);
    expect(mockState.orderWrites).toHaveLength(0);
    expect(mockState.deliveries.size).toBe(0);
  });

  it("scenario 8: a duplicate delivery of the same payment is acknowledged without re-fulfilling", async () => {
    const payload = { paymentId: "pay-dup" };
    const first = await POST(webhookRequest(payload));
    expect(first.status).toBe(200);

    const second = await POST(webhookRequest(payload));
    expect(second.status).toBe(200);
    const data = (await second.json()) as { status: string };
    expect(data.status).toBe("already_processed");
    expect(mockState.orderWrites).toHaveLength(1);
    expect(mockState.inviteWrites).toHaveLength(1);
    expect(mockState.deliveries.size).toBe(1);
  });

  it("scenario 12: a gateway outage defers fulfilment (500, nothing recorded) and a later redelivery succeeds", async () => {
    mockState.gatewayMode = "network_error";
    const down = await POST(webhookRequest());
    expect(down.status).toBe(500);
    expect(mockState.orderWrites).toHaveLength(0);
    expect(mockState.deliveries.size).toBe(0);
    expect(mockState.order?.["status"]).toBe("created");

    mockState.gatewayMode = "ok";
    // A real redelivery of the SAME event carries the SAME payment id.
    const retried = await POST(webhookRequest());
    expect(retried.status).toBe(200);
    expect(mockState.order?.["status"]).toBe("paid");
    expect(mockState.inviteStatus).toBe("published");
  });

  it("scenario 13: a database failure while marking paid records no delivery, and the same delivery can be retried", async () => {
    mockState.failOrderUpdate = { message: "database unavailable" };
    const failed = await POST(webhookRequest());
    expect(failed.status).toBe(500);
    // The delivery must NOT be recorded — recording it would brick the
    // payment behind an already_processed response on redelivery.
    expect(mockState.deliveries.size).toBe(0);
    expect(mockState.order?.["status"]).toBe("created");

    mockState.failOrderUpdate = null;
    const retried = await POST(webhookRequest());
    expect(retried.status).toBe(200);
    expect(mockState.order?.["status"]).toBe("paid");
    expect(mockState.deliveries.has("pay-1")).toBe(true);
  });

  it("scenario 14: a settlement failure is atomic — redelivery completes fulfilment exactly once", async () => {
    // Settlement is a single RPC transaction, so a publish failure
    // inside it rolls the mark-paid back with it. What this pins is
    // the invariant that matters: the failed attempt records NOTHING,
    // and the redelivery completes the fulfilment exactly once.
    mockState.failInviteUpdate = { message: "invites update failed" };
    const first = await POST(webhookRequest());
    expect(first.status).toBe(500);
    // Atomic rollback: the order was NOT left marked paid.
    expect(mockState.order?.["status"]).toBe("created");
    expect(mockState.inviteStatus).toBe("draft");
    expect(mockState.deliveries.size).toBe(0);

    mockState.failInviteUpdate = null;
    const second = await POST(webhookRequest());
    expect(second.status).toBe(200);
    const data = (await second.json()) as { status: string };
    expect(data.status).toBe("success");
    expect(mockState.inviteStatus).toBe("published");
    expect(mockState.inviteWrites).toHaveLength(1);
    expect(mockState.orderWrites).toHaveLength(1);
    expect(mockState.deliveries.has("pay-1")).toBe(true);
  });

  it("scenario 11: two concurrent deliveries of the same payment settle exactly once", async () => {
    const payload = { paymentId: "pay-race" };
    const reqA = webhookRequest(payload);
    const reqB = webhookRequest(payload);

    const [resA, resB] = await Promise.all([POST(reqA), POST(reqB)]);
    const statuses = [resA.status, resB.status];

    // At least one delivery succeeds; the loser either sees the
    // recorded delivery (200 already_processed) or hits the UNIQUE
    // constraint when recording (500) — after which a redelivery is a
    // clean no-op. Final state is the invariant: exactly one delivery
    // row, one paid marking, one publish.
    expect(statuses).toContain(200);
    expect(mockState.deliveries.size).toBe(1);
    expect(mockState.order?.["status"]).toBe("paid");
    expect(mockState.inviteStatus).toBe("published");

    const after = await POST(webhookRequest(payload));
    expect(after.status).toBe(200);
    const data = (await after.json()) as { status: string };
    expect(data.status).toBe("already_processed");
    expect(mockState.deliveries.size).toBe(1);
  });

  // ------------------------------------------------------------------
  // Round 3 / WS2: an archived invite must NEVER be (re)published by
  // the webhook — not by fulfilment, not by the recovery path. The
  // payment itself is real, so the order's money state stays truthful
  // (paid), the delivery is recorded with a conflict outcome the
  // gateway accepts (200, no retries), and reconciliation can find it.
  // ------------------------------------------------------------------

  it("round3-ws2: a verified payment.captured for an archived invite marks the order paid but never publishes, and answers conflict", async () => {
    mockState.inviteStatus = "archived";

    const res = await POST(webhookRequest());
    expect(res.status).toBe(200);
    const data = (await res.json()) as { status: string; reason?: string };
    expect(data.status).toBe("conflict");
    expect(data.reason).toBe("invite_archived");

    // Money state is truth: the gateway corroborated the payment, so
    // the order is paid. The invite is untouched.
    expect(mockState.order?.["status"]).toBe("paid");
    expect(mockState.inviteStatus).toBe("archived");
    expect(mockState.inviteWrites).toHaveLength(0);
    // The delivery IS recorded — the outcome is deliberate and final,
    // so a redelivery short-circuits instead of re-processing.
    expect(mockState.deliveries.has("pay-1")).toBe(true);

    const redelivery = await POST(webhookRequest());
    expect(redelivery.status).toBe(200);
    const again = (await redelivery.json()) as { status: string };
    expect(again.status).toBe("already_processed");
    expect(mockState.inviteStatus).toBe("archived");
  });

  it("round3-ws2: a recovery (publish_only) attempt against an archived invite never publishes it", async () => {
    // Stage the scenario-14 residue — order paid, publish outstanding —
    // but the owner has since archived the invite. The redelivery must
    // NOT resurrect it.
    mockState.order = {
      ...mockState.order,
      status: "paid",
      paid_at: "2026-10-21T01:00:00Z",
      gateway_payment_id: "pay-1",
    };
    mockState.inviteStatus = "archived";

    const res = await POST(webhookRequest({ paymentId: "pay-recovery" }));
    expect(res.status).toBe(200);
    const data = (await res.json()) as { status: string; reason?: string };
    expect(data.status).toBe("conflict");
    expect(data.reason).toBe("invite_archived");
    expect(mockState.inviteStatus).toBe("archived");
    expect(mockState.inviteWrites).toHaveLength(0);
    // The order is not re-marked either.
    expect(mockState.orderWrites).toHaveLength(0);
    expect(mockState.deliveries.has("pay-recovery")).toBe(true);
  });

  it("round3-ws2: a paid order whose invite is published stays an idempotent success no-op", async () => {
    mockState.order = {
      ...mockState.order,
      status: "paid",
      paid_at: "2026-10-21T01:00:00Z",
      gateway_payment_id: "pay-1",
    };
    mockState.inviteStatus = "published";

    const res = await POST(webhookRequest({ paymentId: "pay-replay" }));
    expect(res.status).toBe(200);
    const data = (await res.json()) as { status: string };
    expect(data.status).toBe("success");
    expect(mockState.orderWrites).toHaveLength(0);
    expect(mockState.inviteWrites).toHaveLength(0);
  });

  // ------------------------------------------------------------------
  // Round 3 / WS3: two DIFFERENT payment attempts racing the same
  // order. The same-payment race (scenario 11) is stopped by the
  // delivery pre-check + UNIQUE constraint; two distinct payment ids
  // both pass that, so only the atomic conditional mark-paid (status
  // predicate on the update, enforced inside settle_and_publish) can
  // guarantee exactly one paid transition, and only the winner
  // publishes.
  //
  // What this does NOT prove: live Postgres row-lock timing. The fake
  // applies each chain atomically at await-points; a real database
  // interleaves at row granularity. The production guarantee rests on
  // the conditional UPDATE being a single statement — its predicate
  // is evaluated against the row as locked by that statement — which
  // only a live-DB test can demonstrate end to end (owner-side).
  // ------------------------------------------------------------------

  it("round3-ws3: two different payment attempts against the same order settle exactly once (one paid transition, one publish)", async () => {
    const reqA = webhookRequest({ paymentId: "pay-A" });
    const reqB = webhookRequest({ paymentId: "pay-B" });

    const [resA, resB] = await Promise.all([POST(reqA), POST(reqB)]);

    expect(resA.status).toBe(200);
    expect(resB.status).toBe(200);
    const paidWrites = mockState.orderWrites.filter(
      (w) => w["status"] === "paid",
    );
    expect(paidWrites).toHaveLength(1);
    expect(mockState.inviteWrites).toHaveLength(1);
    expect(mockState.order?.["status"]).toBe("paid");
    expect(mockState.inviteStatus).toBe("published");
    // Both deliveries were processed and recorded; neither was lost.
    expect(mockState.deliveries.size).toBe(2);
  });

  it("round3-consolidation: a payment.failed delivery for a refunded order never overwrites the refund", async () => {
    // "refunded" is terminal (0001 CHECK; markOrderPaid's predicate
    // already excludes it). A late FAILED must not flip the order to
    // "failed" via the unconditional markOrderFailed update.
    mockState.order = { ...mockState.order, status: "refunded" };

    const res = await POST(
      webhookRequest({ event: "payment.failed", paymentId: "pay-refunded" }),
    );
    expect(res.status).toBe(200);
    const data = (await res.json()) as { status: string };
    expect(data.status).toBe("refunded");
    expect(mockState.order?.["status"]).toBe("refunded");
    expect(mockState.orderWrites).toHaveLength(0);
    expect(mockState.deliveries.has("pay-refunded")).toBe(true);
  });
});

// --------------------------------------------------------------------
// Round 3.5: markOrderFailed must be a conditional transition, like
// markOrderPaid. The plan no-ops orders it READS as paid/refunded,
// but the read is a snapshot: between the order read and the update, a
// concurrent process can settle the order (paid) or refund it. The
// pre-fix update matched by id alone, so the stale FAILED write
// landed on top of the terminal state. The fake's
// flipStatusAfterRead hook stages exactly that interleave: the
// handler reads "created", the stored row becomes refunded/paid,
// and the update is then evaluated against the new state.
// --------------------------------------------------------------------
describe("POST /api/webhooks/razorpay — mark_failed transition boundary (Round 3.5)", () => {
  it("a payment.failed delivery transitions a created order to failed (normal path preserved)", async () => {
    const res = await POST(
      webhookRequest({ event: "payment.failed", paymentId: "pay-f1" }),
    );
    expect(res.status).toBe(200);
    const data = (await res.json()) as { status: string };
    expect(data.status).toBe("failed");
    expect(mockState.order?.["status"]).toBe("failed");
    const failedWrites = mockState.orderWrites.filter(
      (w) => w["status"] === "failed",
    );
    expect(failedWrites).toHaveLength(1);
    expect(mockState.deliveries.has("pay-f1")).toBe(true);
  });

  it("the refund race: the order becomes refunded after the read — the FAILED write must not land", async () => {
    mockState.flipStatusAfterRead = "refunded";

    const res = await POST(
      webhookRequest({
        event: "payment.failed",
        paymentId: "pay-race-refund",
      }),
    );
    expect(res.status).toBe(200);
    const data = (await res.json()) as { status: string };
    // The deliberate terminal outcome — the same response the plan
    // produces when it reads the order as refunded — not a false
    // "failed" success for a transition that never happened.
    expect(data.status).toBe("refunded");
    expect(mockState.order?.["status"]).toBe("refunded");
    expect(
      mockState.orderWrites.filter((w) => w["status"] === "failed"),
    ).toHaveLength(0);
    expect(mockState.deliveries.has("pay-race-refund")).toBe(true);
  });

  it("the settle race: the order becomes paid after the read — a late FAILED must not downgrade it", async () => {
    mockState.flipStatusAfterRead = "paid";

    const res = await POST(
      webhookRequest({ event: "payment.failed", paymentId: "pay-race-paid" }),
    );
    expect(res.status).toBe(200);
    const data = (await res.json()) as { status: string };
    // Consistent with the plan's FAILED-on-paid outcome
    // (ignore / already_paid → the idempotent success response).
    expect(data.status).toBe("success");
    expect(mockState.order?.["status"]).toBe("paid");
    expect(
      mockState.orderWrites.filter((w) => w["status"] === "failed"),
    ).toHaveLength(0);
    expect(mockState.deliveries.has("pay-race-paid")).toBe(true);
  });

  it("a gateway-record FAILED against an already-failed order stays harmlessly failed", async () => {
    // The lookup path to mark_failed: the webhook says captured, the
    // order is in "failed" (an earlier timeout), and Razorpay's own
    // record says the payment failed. The conditional update includes
    // "failed" in its eligible set, so this re-marking is idempotent
    // rather than an error.
    mockState.order = { ...mockState.order, status: "failed" };
    mockState.gatewayRecord = { ...mockState.gatewayRecord, status: "failed" };

    const res = await POST(webhookRequest({ paymentId: "pay-refailed" }));
    expect(res.status).toBe(200);
    const data = (await res.json()) as { status: string };
    expect(data.status).toBe("failed");
    expect(mockState.order?.["status"]).toBe("failed");
    expect(mockState.deliveries.has("pay-refailed")).toBe(true);
  });
});

// --------------------------------------------------------------------
// Round 3.6: a zero-row markOrderPaid is NOT proof that a concurrent
// delivery settled the order. The conditional update also matches
// nothing when the row became REFUNDED (an out-of-band gateway/admin
// action) or otherwise left the fulfillable states after the
// handler's read. The pre-fix handler assumed settlement: it
// recorded the delivery and answered "success" — falsely
// acknowledging fulfilment of a refunded order, and (in the conflict
// branch) claiming a paid-and-archived conflict that never happened.
// The fix mirrors the Round-3.5 mark_failed convention: on a null
// transition, re-read the order and classify the state that is
// actually true. The fake's flipStatusAfterRead stages the
// interleaves deterministically (read snapshot → concurrent flip →
// update evaluated against the new state at write time).
// --------------------------------------------------------------------
describe("POST /api/webhooks/razorpay — mark-paid transition boundary (Round 3.6)", () => {
  it("test A: payment.captured races a refund — a zero-row paid transition is answered as refunded, never success", async () => {
    mockState.flipStatusAfterRead = "refunded";

    const res = await POST(webhookRequest());
    expect(res.status).toBe(200);
    const data = (await res.json()) as { status: string };
    // The truthful terminal outcome — the same response the plan
    // produces when it reads the order as refunded.
    expect(data.status).toBe("refunded");
    // The refund survives; this delivery performed no paid write
    // and no publication.
    expect(mockState.order?.["status"]).toBe("refunded");
    expect(
      mockState.orderWrites.filter((w) => w["status"] === "paid"),
    ).toHaveLength(0);
    expect(mockState.inviteWrites).toHaveLength(0);
    expect(mockState.inviteStatus).toBe("draft");
    // Terminal state → the delivery is recorded exactly once, so
    // the gateway stops redelivering it.
    expect(mockState.deliveries.has("pay-1")).toBe(true);
    expect(mockState.deliveries.size).toBe(1);
  });

  it("test B: payment.captured races a concurrent settlement — no duplicate transition, the outstanding publish completes once", async () => {
    mockState.flipStatusAfterRead = "paid";

    const res = await POST(webhookRequest());
    expect(res.status).toBe(200);
    const data = (await res.json()) as { status: string };
    expect(data.status).toBe("success");
    // This delivery did NOT win the paid transition (the concurrent
    // settlement did), so it must not write the order again.
    expect(
      mockState.orderWrites.filter((w) => w["status"] === "paid"),
    ).toHaveLength(0);
    expect(mockState.order?.["status"]).toBe("paid");
    // Publication was still outstanding and the invite is a draft:
    // publish_only recovery semantics complete it — exactly once,
    // through the conditional publish.
    expect(mockState.inviteWrites).toHaveLength(1);
    expect(mockState.inviteStatus).toBe("published");
    expect(mockState.deliveries.has("pay-1")).toBe(true);
    expect(mockState.deliveries.size).toBe(1);
  });

  it("test C: an archived-invite conflict races a refund — no false paid-archived conflict is claimed", async () => {
    mockState.inviteStatus = "archived";
    mockState.flipStatusAfterRead = "refunded";

    const res = await POST(webhookRequest());
    expect(res.status).toBe(200);
    const data = (await res.json()) as { status: string; reason?: string };
    // The refund won, so the truthful outcome is the refunded one —
    // NOT the conflict outcome, which asserts a paid order.
    expect(data.status).toBe("refunded");
    expect(data.reason).toBeUndefined();
    expect(mockState.order?.["status"]).toBe("refunded");
    expect(
      mockState.orderWrites.filter((w) => w["status"] === "paid"),
    ).toHaveLength(0);
    // No publication, no reactivation.
    expect(mockState.inviteWrites).toHaveLength(0);
    expect(mockState.inviteStatus).toBe("archived");
    expect(mockState.deliveries.has("pay-1")).toBe(true);
  });

  it("test C2 (pin): the conflict stays genuine when a concurrent delivery recorded the payment first", async () => {
    // Same archived setup, but the interleave settles the order
    // instead of refunding it: the transition matches nothing, the
    // re-read establishes the order is genuinely paid, and the
    // paid-and-archived conflict outcome is then truthful. (This
    // outcome was already returned pre-fix — for the wrong reason,
    // since the null result was ignored; the pin keeps it honest.)
    mockState.inviteStatus = "archived";
    mockState.flipStatusAfterRead = "paid";

    const res = await POST(webhookRequest());
    expect(res.status).toBe(200);
    const data = (await res.json()) as { status: string; reason?: string };
    expect(data.status).toBe("conflict");
    expect(data.reason).toBe("invite_archived");
    expect(mockState.order?.["status"]).toBe("paid");
    expect(mockState.inviteWrites).toHaveLength(0);
    expect(mockState.inviteStatus).toBe("archived");
    expect(mockState.deliveries.has("pay-1")).toBe(true);
  });

  it("test D: a failing settlement call claims nothing and stays retryable", async () => {
    // Round 3.7 form of the Round-3.6 test D: the unresolved-
    // settlement case is now a FAILED settle_and_publish call (the
    // classification the old code did with a post-transition re-read
    // happens inside the RPC transaction instead). The order is
    // concurrently refunded; the settlement call itself errors.
    mockState.flipStatusAfterRead = "refunded";
    mockState.failRpc = { message: "database unavailable" };

    const res = await POST(webhookRequest());
    // No success is claimed and — critically — the delivery is NOT
    // recorded, so the gateway's redelivery can settle the order
    // once the database answers again.
    expect(res.status).toBe(500);
    expect(mockState.deliveries.size).toBe(0);
    expect(mockState.order?.["status"]).toBe("refunded");
    expect(mockState.orderWrites).toHaveLength(0);
    expect(mockState.inviteWrites).toHaveLength(0);
  });

  it("publish_only premise re-check: an order refunded after the read is never published by a recovery redelivery", async () => {
    // Scenario-14 residue — order paid, publish outstanding — but
    // the order is refunded (out-of-band) after this redelivery's
    // read snapshot is taken. The recovery branch's premise ("this
    // order is paid") must be re-verified before the publish side
    // effect; the pre-fix branch published on the stale read.
    mockState.order = {
      ...mockState.order,
      status: "paid",
      paid_at: "2026-10-21T01:00:00Z",
      gateway_payment_id: "pay-1",
    };
    mockState.flipStatusAfterRead = "refunded";

    const res = await POST(webhookRequest({ paymentId: "pay-recovery-race" }));
    expect(res.status).toBe(200);
    const data = (await res.json()) as { status: string };
    expect(data.status).toBe("refunded");
    expect(mockState.order?.["status"]).toBe("refunded");
    expect(mockState.inviteWrites).toHaveLength(0);
    expect(mockState.inviteStatus).toBe("draft");
    expect(mockState.deliveries.has("pay-recovery-race")).toBe(true);
  });

  it("delivery recording: a record failure after fulfilment is not acknowledged — redelivery completes it idempotently", async () => {
    // The fulfilment itself (mark paid + publish) succeeds; only
    // the delivery-record insert fails transiently. The handler
    // must answer an error (nothing is acknowledged as processed),
    // and a redelivery must then complete the recording without
    // repeating any side effect.
    mockState.failDeliveryInsert = { message: "database unavailable" };
    const first = await POST(webhookRequest({ paymentId: "pay-record-fail" }));
    expect(first.status).toBe(500);
    expect(mockState.order?.["status"]).toBe("paid");
    expect(mockState.inviteStatus).toBe("published");
    expect(mockState.deliveries.size).toBe(0);

    // A real redelivery of the same event carries the same payment id.
    const second = await POST(webhookRequest({ paymentId: "pay-record-fail" }));
    expect(second.status).toBe(200);
    const data = (await second.json()) as { status: string };
    expect(data.status).toBe("success");
    expect(mockState.orderWrites).toHaveLength(1);
    expect(mockState.inviteWrites).toHaveLength(1);
    expect(mockState.deliveries.has("pay-record-fail")).toBe(true);
    expect(mockState.deliveries.size).toBe(1);
  });
});

// --------------------------------------------------------------------
// Round 3.7: two ignored-error sites and the Part-2 window.
//
// Fix 2 — the handler's invite-status pre-read destructured only
// { data }: a failed read was indistinguishable from a missing row,
// so the plan could be computed on an "unknown" invite state. For a
// paid order whose invite is really still a draft, the plan degrades
// to ignore/already_paid — and the ignore branch RECORDS the
// delivery, consuming the very delivery id the scenario-14 recovery
// depends on. A failed read must throw: retryable 500, nothing
// recorded, nothing published.
//
// Part 2 — the winner-path window: markOrderPaid and publishInvite
// were separate statements. A refund landing after the won mark-paid
// but before the publish still got its invitation published,
// because publishInvite inspected only the invite's state. No
// re-read can close that gap; Round 3.7 routes all three fulfil
// paths through the settle_and_publish RPC (migration 0004), which
// holds the order row lock from status check to publish commit.
// --------------------------------------------------------------------
describe("POST /api/webhooks/razorpay — pre-read errors + the settle window (Round 3.7)", () => {
  it("fix 2: a failing invite pre-read fails closed — 500, nothing recorded, nothing published", async () => {
    mockState.failInviteSelect = { message: "invites read failed" };

    const res = await POST(webhookRequest());
    expect(res.status).toBe(500);
    expect(mockState.deliveries.size).toBe(0);
    expect(mockState.orderWrites).toHaveLength(0);
    expect(mockState.inviteWrites).toHaveLength(0);
    expect(mockState.order?.["status"]).toBe("created");
    expect(mockState.inviteStatus).toBe("draft");
  });

  it("part 2: a refund landing after the handler's read but before settlement must not publish", async () => {
    // The winner-path window, staged at the closest point the new
    // flow has: the refund commits after the handler's read (the
    // plan is computed on a "created" snapshot) but before the
    // single settle_and_publish call. Pre-Round-3.7 this test was
    // staged one step later still — the refund landing after the
    // WON mark-paid, before the separate publish (a dedicated fake
    // hook flipped the stored order in that gap) — and it FAILED:
    // the old code published anyway, because publishInvite never
    // looked at the order again, and no re-read can close a gap
    // between two statements. The RPC closes it structurally: the
    // status check and the publish are one transaction under the
    // order row lock, so the refund is either seen by the check
    // (this staging — no publish, truthful refunded outcome) or it
    // lands after the whole settlement commits (a refund of a
    // legitimately published invite — the owner-policy case Q6a
    // detects; no publish-side code can prevent it).
    mockState.flipStatusAfterRead = "refunded";

    const res = await POST(webhookRequest());
    expect(res.status).toBe(200);
    const data = (await res.json()) as { status: string };
    expect(data.status).toBe("refunded");
    expect(mockState.order?.["status"]).toBe("refunded");
    expect(mockState.inviteWrites).toHaveLength(0);
    expect(mockState.inviteStatus).toBe("draft");
    expect(mockState.deliveries.has("pay-1")).toBe(true);
    // Settlement was attempted exactly once, through the RPC.
    expect(mockState.rpcCalls).toHaveLength(1);
    expect(mockState.rpcCalls[0]?.name).toBe("settle_and_publish");
  });

  it("publish_only: a paid order with a draft invite is published by redelivery without re-marking", async () => {
    // Residue from an older deployment (order paid, publish never
    // completed). The recovery redelivery must publish via the RPC
    // in never-mark mode: the stored paid_at / gateway_payment_id
    // are the first settlement's and stay untouched.
    mockState.order = {
      ...mockState.order,
      status: "paid",
      paid_at: "2026-10-21T01:00:00Z",
      gateway_payment_id: "pay-1",
    };

    const res = await POST(webhookRequest({ paymentId: "pay-recovery-ok" }));
    expect(res.status).toBe(200);
    const data = (await res.json()) as { status: string };
    expect(data.status).toBe("success");
    expect(mockState.inviteStatus).toBe("published");
    expect(mockState.inviteWrites).toHaveLength(1);
    // No re-marking: zero order writes, and the RPC was called with
    // a null payment id (recovery mode never marks).
    expect(mockState.orderWrites).toHaveLength(0);
    expect(mockState.rpcCalls).toHaveLength(1);
    expect(mockState.rpcCalls[0]?.args["p_gateway_payment_id"]).toBeNull();
    expect(mockState.deliveries.has("pay-recovery-ok")).toBe(true);
  });

  it("an error on the handler's initial order read fails closed — 500, nothing recorded", async () => {
    mockState.failOrderSelectAt = 1;

    const res = await POST(webhookRequest());
    expect(res.status).toBe(500);
    expect(mockState.deliveries.size).toBe(0);
    expect(mockState.orderWrites).toHaveLength(0);
    expect(mockState.inviteWrites).toHaveLength(0);
  });
});

// --------------------------------------------------------------------
// Round 3.7 adversarial review (Reviewer A, HIGH) — migration 0005
// vs. late settlement. Once 0005's partial unique index is live, a
// FAILED order whose payment genuinely settles late — after the
// customer retried and a successor order took the invite's active
// slot — makes the settle RPC's mark-paid UPDATE violate the index
// (23505). The RPC transaction aborts; without a translation, the
// handler would 500 forever, the delivery would never be recorded,
// and no reconciliation query keys on a 'failed' order with a
// recorded SUCCESS delivery, so the charge would be invisible.
// The fix: settleAndPublish translates error.code "23505" into the
// "duplicate_active_order" outcome, and the handler answers it like
// the other recorded conflicts — terminal for THIS delivery;
// recovery is an owner action (runbook §2.1, RECONCILIATION Q7),
// never a retry loop. The fake's rpc stub models the 0005
// predicate via mockState.siblingOrder (see the stub comment).
// --------------------------------------------------------------------
describe("POST /api/webhooks/razorpay — 0005 late-settlement conflict (Round 3.7 review)", () => {
  it("a late-settling failed order with an active successor is a recorded conflict, not a 500 loop", async () => {
    // Order A was marked failed (gateway timeout); the customer
    // retried and order B now holds the invite's active slot. A's
    // payment then genuinely settles and its captured event arrives,
    // corroborated by the gateway lookup.
    mockState.order = { ...mockState.order, status: "failed" };
    mockState.siblingOrder = {
      id: "order-2",
      invite_id: "invite-1",
      status: "created",
    };

    const res = await POST(webhookRequest({ paymentId: "pay-late-1" }));
    expect(res.status).toBe(200);
    const data = (await res.json()) as { status: string; reason?: string };
    expect(data.status).toBe("conflict");
    expect(data.reason).toBe("duplicate_active_order");

    // The aborted RPC wrote nothing: A stays failed, nothing was
    // published, and the invite is untouched.
    expect(mockState.order?.["status"]).toBe("failed");
    expect(mockState.orderWrites).toHaveLength(0);
    expect(mockState.inviteWrites).toHaveLength(0);
    expect(mockState.inviteStatus).toBe("draft");
    // The delivery IS recorded exactly once — the outcome is
    // terminal for this delivery, so the gateway stops redelivering.
    expect(mockState.deliveries.has("pay-late-1")).toBe(true);
    expect(mockState.deliveries.size).toBe(1);

    // A SEPARATE payment attempt for the same order produces the same
    // truthful conflict — not a 500 loop and no state change.
    const redelivery = await POST(webhookRequest({ paymentId: "pay-late-2" }));
    expect(redelivery.status).toBe(200);
    const again = (await redelivery.json()) as {
      status: string;
      reason?: string;
    };
    expect(again.status).toBe("conflict");
    expect(again.reason).toBe("duplicate_active_order");
    expect(mockState.order?.["status"]).toBe("failed");
    expect(mockState.orderWrites).toHaveLength(0);
    expect(mockState.inviteWrites).toHaveLength(0);
    expect(mockState.deliveries.has("pay-late-2")).toBe(true);
    expect(mockState.deliveries.size).toBe(2);
  });

  it("a paid successor blocks the late settlement the same way (the double-charge residue)", async () => {
    // Same interleave, one step further: the successor already
    // settled. A's late settlement is now a genuine duplicate
    // charge — still a recorded conflict for the owner to refund
    // via runbook §2.1, never a publish and never a 500 loop.
    mockState.order = { ...mockState.order, status: "failed" };
    mockState.siblingOrder = {
      id: "order-2",
      invite_id: "invite-1",
      status: "paid",
    };
    mockState.inviteStatus = "published";

    const res = await POST(webhookRequest({ paymentId: "pay-late-paid" }));
    expect(res.status).toBe(200);
    const data = (await res.json()) as { status: string; reason?: string };
    expect(data.status).toBe("conflict");
    expect(data.reason).toBe("duplicate_active_order");
    expect(mockState.order?.["status"]).toBe("failed");
    expect(mockState.orderWrites).toHaveLength(0);
    expect(mockState.inviteWrites).toHaveLength(0);
    expect(mockState.deliveries.has("pay-late-paid")).toBe(true);
  });

  it("control: a late-settling failed order with NO active successor still settles and publishes", async () => {
    // The 0005 caveat must not swallow the designed late-settlement
    // path: with no sibling occupying the active slot, a failed
    // order's corroborated late captured event fulfils normally.
    mockState.order = { ...mockState.order, status: "failed" };

    const res = await POST(webhookRequest({ paymentId: "pay-late-ok" }));
    expect(res.status).toBe(200);
    const data = (await res.json()) as { status: string };
    expect(data.status).toBe("success");
    expect(mockState.order?.["status"]).toBe("paid");
    expect(mockState.orderWrites).toHaveLength(1);
    expect(mockState.inviteStatus).toBe("published");
    expect(mockState.inviteWrites).toHaveLength(1);
    expect(mockState.deliveries.has("pay-late-ok")).toBe(true);
  });
});
