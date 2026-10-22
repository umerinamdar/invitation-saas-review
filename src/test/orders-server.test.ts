import { beforeEach, describe, expect, it, vi } from "vitest";

// orders-server.ts runs on the service-role Supabase client, which
// throws at module load when server env vars are absent — stub the
// whole module with a chainable fake that captures update payloads.
const mockState = vi.hoisted(() => ({
  table: null as string | null,
  updated: null as Record<string, unknown> | null,
  inPredicate: null as { col: string; values: unknown[] } | null,
  rowMatches: true as boolean,
  // Round 3.7: publishInvite model — the stored invite row's status,
  // whether the row exists at all, and staged failures for the
  // conditional update and for the fallback status read.
  inviteStatus: "draft" as string,
  inviteExists: true as boolean,
  inviteUpdateError: null as { message: string } | null,
  inviteSelectError: null as { message: string } | null,
  // Round 3.7: settleAndPublish RPC stub — records calls, returns a
  // staged outcome string or a staged PostgREST-style error.
  rpcCalls: [] as Array<{ name: string; args: Record<string, unknown> }>,
  rpcOutcome: null as string | null,
  rpcError: null as { message: string; code?: string } | null,
}));

vi.mock("@/lib/supabase-server", () => {
  type Ctx = {
    table: string;
    op: "select" | "update" | null;
    payload: Record<string, unknown> | null;
    eqPairs: Array<[string, unknown]>;
  };

  function makeChain(table: string) {
    const ctx: Ctx = { table, op: null, payload: null, eqPairs: [] };

    // Settles an awaited-directly chain (the invites conditional
    // update in publishInvite is awaited without a terminal
    // maybeSingle/single, like the real PostgREST builder).
    const settle = (): { data: unknown; error: unknown } => {
      if (ctx.table === "invites" && ctx.op === "update") {
        if (mockState.inviteUpdateError) {
          return { data: null, error: mockState.inviteUpdateError };
        }
        // Conditional-update semantics: the draft predicate matches
        // only while the stored invite is actually a draft (and a
        // missing row matches nothing at all).
        const statusPredicate = ctx.eqPairs.find(
          ([col]) => col === "status",
        )?.[1];
        if (
          !mockState.inviteExists ||
          (statusPredicate !== undefined &&
            statusPredicate !== mockState.inviteStatus)
        ) {
          return { data: [], error: null };
        }
        mockState.inviteStatus = String(ctx.payload?.["status"] ?? "");
        return { data: [{ id: "invite-1" }], error: null };
      }
      return { data: null, error: null };
    };

    const chain = {
      update: (payload: Record<string, unknown>) => {
        ctx.op = "update";
        ctx.payload = payload;
        mockState.updated = payload;
        return chain;
      },
      eq: (col: string, value: unknown) => {
        ctx.eqPairs.push([col, value]);
        return chain;
      },
      in: (col: string, values: unknown[]) => {
        mockState.inPredicate = { col, values };
        return chain;
      },
      select: () => {
        if (ctx.op === null) ctx.op = "select";
        return chain;
      },
      single: async () => ({
        data: { id: "order-1", ...(mockState.updated ?? {}) },
        error: null,
      }),
      // Round 3: markOrderPaid resolves through maybeSingle — the row is
      // returned only when the conditional update actually matched a
      // row still in a fulfillable status (mockState.rowMatches models
      // the predicate outcome PostgREST would produce).
      maybeSingle: async () => {
        if (ctx.table === "invites" && ctx.op === "select") {
          // publishInvite's fallback status read. A staged error is
          // returned exactly as PostgREST returns it: data null AND
          // error set — the combination the pre-fix code mishandled
          // by reading only `data`.
          if (mockState.inviteSelectError) {
            return { data: null, error: mockState.inviteSelectError };
          }
          return {
            data: mockState.inviteExists
              ? { status: mockState.inviteStatus }
              : null,
            error: null,
          };
        }
        return {
          data: mockState.rowMatches
            ? { id: "order-1", ...(mockState.updated ?? {}) }
            : null,
          error: null,
        };
      },
      then: (
        onFulfilled: (v: { data: unknown; error: unknown }) => unknown,
        onRejected?: (e: unknown) => unknown,
      ) => Promise.resolve(settle()).then(onFulfilled, onRejected),
    };
    return chain;
  }

  return {
    supabaseServer: {
      from: (table: string) => {
        mockState.table = table;
        return makeChain(table);
      },
      rpc: async (name: string, args: Record<string, unknown>) => {
        mockState.rpcCalls.push({ name, args });
        if (mockState.rpcError) {
          return { data: null, error: mockState.rpcError };
        }
        return { data: mockState.rpcOutcome, error: null };
      },
    },
  };
});

import {
  markOrderFailed,
  markOrderPaid,
  publishInvite,
  settleAndPublish,
} from "@/lib/orders-server";

// NF-4: markOrderPaid used to write the webhook's UTR into the
// gateway_order_id column. They are different identifiers: the schema
// (0001) gives orders a UNIQUE gateway_order_id for the gateway's order
// id and a gateway_payment_id for the gateway's payment id (the lookup
// key for GET /api/v1/payments/{id}); a UTR is the bank/UPI
// transaction reference and belongs to neither column. (The UTR itself
// is not lost — the handler records the full webhook payload, UTR
// included, in webhook_deliveries after fulfilment.)
describe("markOrderPaid — gateway identifier mapping (NF-4)", () => {
  beforeEach(() => {
    mockState.table = null;
    mockState.updated = null;
    mockState.inPredicate = null;
    mockState.rowMatches = true;
  });

  it("stores the gateway payment id in gateway_payment_id, never the UTR in gateway_order_id", async () => {
    await markOrderPaid("order-1", {
      paymentId: "pay-1",
      utr: "UTR9988776655",
      amountPaise: 59900,
    });

    expect(mockState.table).toBe("orders");
    expect(mockState.updated?.["status"]).toBe("paid");
    expect(mockState.updated?.["gateway_payment_id"]).toBe("pay-1");
    expect(mockState.updated?.["gateway_order_id"]).not.toBe("UTR9988776655");
    expect(mockState.updated?.["gateway_order_id"] ?? null).toBeNull();
    expect(typeof mockState.updated?.["paid_at"]).toBe("string");
  });

  // Round 3 / WS3: the paid transition must be ATOMIC. Two webhook
  // deliveries with different ids can both read the order as unpaid;
  // only a status predicate on the UPDATE itself (evaluated by the
  // database against the row) can serialize them — a check in the
  // handler cannot. The fulfillable-from set is {created, failed}:
  // 'failed' stays fulfillable because a gateway timeout can mark an
  // order failed before its payment actually settles (see the plan's
  // late-SUCCESS case); 'paid' and 'refunded' are terminal for this
  // transition.
  it("round3-ws3: the update carries a status predicate over the fulfillable states only", async () => {
    await markOrderPaid("order-1", {
      paymentId: "pay-1",
      amountPaise: 59900,
    });

    expect(mockState.inPredicate?.col).toBe("status");
    expect(mockState.inPredicate?.values).toEqual(["created", "failed"]);
  });

  it("round3-ws3: returns the paid row when this call wins the transition", async () => {
    const row = await markOrderPaid("order-1", {
      paymentId: "pay-1",
      amountPaise: 59900,
    });
    expect(row?.id).toBe("order-1");
    expect(row?.status).toBe("paid");
  });

  it("round3-ws3: returns null when the row no longer matches (a concurrent delivery already settled it)", async () => {
    mockState.rowMatches = false;
    const row = await markOrderPaid("order-1", {
      paymentId: "pay-1",
      amountPaise: 59900,
    });
    expect(row).toBeNull();
  });
});

// Round 3.5: markOrderFailed gets the same atomic treatment as
// markOrderPaid. Its pre-fix update matched by id alone, so a FAILED
// transition planned from a stale "created" read could overwrite an
// order that had since been refunded (terminal) or paid — the plan's
// already_refunded / already_paid no-ops only guard what the handler
// READ, not what the row became before the write. The eligible-from
// set is {created, failed}: 'created' is the normal failure path and
// 'failed' keeps a re-delivered FAILED (payload or gateway-record)
// idempotent; 'paid' and 'refunded' must never be overwritten.
describe("markOrderFailed — atomic conditional transition (Round 3.5)", () => {
  beforeEach(() => {
    mockState.table = null;
    mockState.updated = null;
    mockState.inPredicate = null;
    mockState.rowMatches = true;
  });

  it("round3.5: the update carries a status predicate over the eligible states only", async () => {
    await markOrderFailed("order-1");

    expect(mockState.table).toBe("orders");
    expect(mockState.updated?.["status"]).toBe("failed");
    expect(mockState.inPredicate?.col).toBe("status");
    expect(mockState.inPredicate?.values).toEqual(["created", "failed"]);
  });

  it("round3.5: returns the failed row when the transition applies", async () => {
    const row = await markOrderFailed("order-1");
    expect(row?.id).toBe("order-1");
    expect(row?.status).toBe("failed");
  });

  it("round3.5: returns null when no row matches (the order left the eligible states concurrently)", async () => {
    mockState.rowMatches = false;
    const row = await markOrderFailed("order-1");
    expect(row).toBeNull();
  });
});

// --------------------------------------------------------------------
// Round 3.7 / Part 1: publishInvite's fallback read. When the
// conditional draft→published update matches no row, publishInvite
// re-reads the invite's status to distinguish "already published"
// (idempotent success) from "not_draft" (archived/gone — a conflict
// for the caller). The pre-fix fallback destructured only `data`:
// a FAILED read (data null, error set) fell into the not_draft
// branch, so the webhook recorded the delivery behind a terminal
// conflict outcome for an invitation whose state was never actually
// established. A database error is not a state: the fallback must
// throw, leaving the delivery unrecorded and retryable.
// --------------------------------------------------------------------
describe("publishInvite — conditional publish + fallback read (Round 3.7 Part 1)", () => {
  beforeEach(() => {
    mockState.table = null;
    mockState.updated = null;
    mockState.inPredicate = null;
    mockState.rowMatches = true;
    mockState.inviteStatus = "draft";
    mockState.inviteExists = true;
    mockState.inviteUpdateError = null;
    mockState.inviteSelectError = null;
  });

  it("publishes a draft invite and reports 'published' (happy path)", async () => {
    const outcome = await publishInvite("invite-1");
    expect(outcome).toBe("published");
    expect(mockState.inviteStatus).toBe("published");
  });

  it("fallback read failure after a zero-row update throws — unknown state is never reported as not_draft", async () => {
    // The invite was published concurrently, so the conditional
    // update matches nothing; the fallback read then fails. Pre-fix
    // this returned "not_draft" and the handler recorded a conflict
    // outcome on a state it had never established.
    mockState.inviteStatus = "published";
    mockState.inviteSelectError = { message: "database unavailable" };

    await expect(publishInvite("invite-1")).rejects.toMatchObject({
      message: "database unavailable",
    });
  });

  it("zero-row update + fallback reads 'published' → already_published (idempotency preserved)", async () => {
    mockState.inviteStatus = "published";
    const outcome = await publishInvite("invite-1");
    expect(outcome).toBe("already_published");
  });

  it("zero-row update + fallback reads 'archived' → not_draft (conflict behaviour preserved)", async () => {
    mockState.inviteStatus = "archived";
    const outcome = await publishInvite("invite-1");
    expect(outcome).toBe("not_draft");
  });

  it("zero-row update + fallback finds no row → not_draft", async () => {
    mockState.inviteExists = false;
    const outcome = await publishInvite("invite-1");
    expect(outcome).toBe("not_draft");
  });

  it("a failing conditional update throws rather than falling through to the fallback", async () => {
    mockState.inviteUpdateError = { message: "invites update failed" };
    await expect(publishInvite("invite-1")).rejects.toMatchObject({
      message: "invites update failed",
    });
  });
});

// --------------------------------------------------------------------
// Round 3.7 / Part 2: settleAndPublish — the typed wrapper over the
// settle_and_publish RPC (migration 0004). The wrapper's contract:
// pass (order id, gateway payment id | null) through verbatim, return
// the function's outcome string unchanged when it is one of the
// documented outcomes, and THROW on an RPC error or on anything
// unrecognized — an unknown outcome must fail the delivery closed
// (retryable 500, nothing recorded), never be mapped onto a success
// or conflict claim by guesswork.
// --------------------------------------------------------------------
describe("settleAndPublish — RPC wrapper (Round 3.7)", () => {
  beforeEach(() => {
    mockState.rpcCalls = [];
    mockState.rpcOutcome = null;
    mockState.rpcError = null;
  });

  it("calls settle_and_publish with the order id and gateway payment id verbatim", async () => {
    mockState.rpcOutcome = "settled_published";
    const outcome = await settleAndPublish("order-1", "pay-1");
    expect(outcome).toBe("settled_published");
    expect(mockState.rpcCalls).toHaveLength(1);
    expect(mockState.rpcCalls[0]?.name).toBe("settle_and_publish");
    expect(mockState.rpcCalls[0]?.args).toEqual({
      p_order_id: "order-1",
      p_gateway_payment_id: "pay-1",
    });
  });

  it("passes a null gateway payment id through (recovery mode never marks an order paid)", async () => {
    mockState.rpcOutcome = "not_paid";
    const outcome = await settleAndPublish("order-1", null);
    expect(outcome).toBe("not_paid");
    expect(mockState.rpcCalls[0]?.args).toEqual({
      p_order_id: "order-1",
      p_gateway_payment_id: null,
    });
  });

  it("returns every documented outcome unchanged", async () => {
    for (const expected of [
      "settled_published",
      "settled_already_published",
      "settled_no_invite",
      "conflict_archived",
      "refunded",
      "not_found",
      "not_paid",
      "retryable",
      "duplicate_active_order",
    ]) {
      mockState.rpcOutcome = expected;
      await expect(settleAndPublish("order-1", "pay-1")).resolves.toBe(
        expected,
      );
    }
  });

  it("throws on an RPC error (e.g. PGRST202 when migration 0004 is not applied yet)", async () => {
    mockState.rpcError = {
      message: "function not found",
      code: "PGRST202",
    };
    await expect(settleAndPublish("order-1", "pay-1")).rejects.toMatchObject({
      code: "PGRST202",
    });
  });

  // Round 3.7 adversarial review (Reviewer A, HIGH): once migration
  // 0005's partial unique index is live, the RPC's mark-paid UPDATE
  // raises 23505 when a late-settling order's invite already has a
  // successor ACTIVE order. The wrapper must translate exactly that
  // code into the dedicated outcome — throwing it would 500 the
  // delivery forever (every redelivery violates the same index).
  it("translates a 23505 RPC error into the duplicate_active_order outcome", async () => {
    mockState.rpcError = {
      message:
        'duplicate key value violates unique constraint "orders_one_active_per_invite"',
      code: "23505",
    };
    await expect(settleAndPublish("order-1", "pay-1")).resolves.toBe(
      "duplicate_active_order",
    );
  });

  it("still throws on any other RPC error code (e.g. a 40P01 deadlock abort stays retryable)", async () => {
    mockState.rpcError = {
      message: "deadlock detected",
      code: "40P01",
    };
    await expect(settleAndPublish("order-1", "pay-1")).rejects.toMatchObject({
      code: "40P01",
    });
  });

  it("throws on an unrecognized outcome string", async () => {
    mockState.rpcOutcome = "settled_maybe";
    await expect(settleAndPublish("order-1", "pay-1")).rejects.toThrow();
  });

  it("throws when the RPC returns no outcome at all", async () => {
    mockState.rpcOutcome = null;
    await expect(settleAndPublish("order-1", "pay-1")).rejects.toThrow();
  });
});
