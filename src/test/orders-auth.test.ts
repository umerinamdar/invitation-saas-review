import { beforeEach, describe, expect, it, vi } from "vitest";

// orders.ts imports the service-role Supabase client, which throws at
// module load when server env vars are absent — stub the whole module.
// The fake is driven per-test through mockState (hoisted so the mock
// factory can close over it): auth.getUser accepts exactly one token
// and only while a session user is staged; the from() chain serves one
// invite row and captures whatever the handler inserts.
const mockState = vi.hoisted(() => ({
  user: null as { id: string } | null,
  invite: null as {
    user_id: string;
    config?: unknown;
    status?: string;
  } | null,
  inserted: null as Record<string, unknown> | null,
  inserts: [] as Record<string, unknown>[],
  insertError: null as unknown,
  paidOrder: null as { id: string } | null,
  paidLookupError: null as unknown,
  // Round 3.7 / Q-16: the orders-table row model behind the
  // active-order lookup + migration 0005's partial unique index.
  // orderRows holds successfully inserted (or directly staged)
  // orders; the fake index rejects a second ACTIVE (created/paid)
  // row for the same invite with a 23505, exactly as the partial
  // unique index will. staleActiveLookups forces the next N
  // active-order lookups to return empty — staging the race window
  // in which a concurrent request's row is not yet visible.
  orderRows: [] as Array<{ id: string; invite_id: string; status: string }>,
  orderSeq: 0 as number,
  staleActiveLookups: 0 as number,
  activeLookupError: null as unknown,
}));

vi.mock("@/lib/supabase-server", () => {
  type FakeChain = {
    select: () => FakeChain;
    eq: () => FakeChain;
    in: () => FakeChain;
    order: () => FakeChain;
    insert: (payload: Record<string, unknown>) => FakeChain;
    maybeSingle: () => Promise<{
      data:
        | { user_id: string; config?: unknown; status?: string }
        | { id: string }
        | null;
      error: unknown;
    }>;
    single: () => Promise<{
      data: Record<string, unknown> | null;
      error: unknown;
    }>;
    then: (
      onFulfilled: (v: { data: unknown; error: unknown }) => unknown,
      onRejected?: (e: unknown) => unknown,
    ) => Promise<unknown>;
  };

  // Settles an awaited-directly chain — the Round-3.7 active-order
  // lookup awaits the orders select as a list (newest first).
  function settleList(table: string): { data: unknown; error: unknown } {
    if (table !== "orders") {
      return { data: [], error: null };
    }
    if (mockState.activeLookupError) {
      return { data: null, error: mockState.activeLookupError };
    }
    if (mockState.paidLookupError) {
      return { data: null, error: mockState.paidLookupError };
    }
    if (mockState.staleActiveLookups > 0) {
      mockState.staleActiveLookups -= 1;
      return { data: [], error: null };
    }
    const insertedActive = mockState.orderRows
      .filter((r) => r.status === "created" || r.status === "paid")
      .slice()
      .reverse()
      .map((r) => ({ id: r.id, status: r.status }));
    const rows = mockState.paidOrder
      ? [...insertedActive, { id: mockState.paidOrder.id, status: "paid" }]
      : insertedActive;
    return { data: rows, error: null };
  }

  function fakeChain(table: string): FakeChain {
    const chain: FakeChain = {
      select: () => chain,
      eq: () => chain,
      in: () => chain,
      order: () => chain,
      insert: (payload) => {
        mockState.inserted = payload;
        mockState.inserts.push(payload);
        return chain;
      },
      maybeSingle: async () => {
        // The orders-table maybeSingle in this handler is the
        // paid-order lookup (Round 3 WS1 guard). Round 3.5: a test
        // can stage a lookup ERROR — the pre-fix handler never read
        // it and proceeded as if no paid order existed.
        if (table === "orders" && mockState.paidLookupError) {
          return { data: null, error: mockState.paidLookupError };
        }
        return {
          data:
            table === "invites"
              ? mockState.invite
              : table === "orders"
                ? mockState.paidOrder
                : null,
          error: null,
        };
      },
      single: async () => {
        if (mockState.insertError) {
          return { data: null, error: mockState.insertError };
        }
        const payload = mockState.inserted ?? {};
        // Migration 0005 model: the partial unique index rejects a
        // second ACTIVE order for the same invite with 23505.
        const inviteId = payload["invite_id"];
        const conflict = mockState.orderRows.some(
          (r) =>
            r.invite_id === inviteId &&
            (r.status === "created" || r.status === "paid"),
        );
        if (conflict) {
          return {
            data: null,
            error: {
              code: "23505",
              message:
                'duplicate key value violates unique constraint "orders_one_active_per_invite"',
            },
          };
        }
        mockState.orderSeq += 1;
        const id = `order-${mockState.orderSeq}`;
        mockState.orderRows.push({
          id,
          invite_id: String(inviteId),
          status: String(payload["status"] ?? "created"),
        });
        return { data: { id, ...payload }, error: null };
      },
      then: (onFulfilled, onRejected) =>
        Promise.resolve(settleList(table)).then(onFulfilled, onRejected),
    };
    return chain;
  }

  return {
    supabaseServer: {
      auth: {
        getUser: async (token: string) => {
          if (token === "valid-access-token" && mockState.user) {
            return { data: { user: mockState.user }, error: null };
          }
          return {
            data: { user: null },
            error: { message: "Invalid token" },
          };
        },
      },
      from: (table: string) => fakeChain(table),
    },
  };
});

import { decideOrderUser } from "@/lib/orders-auth";
import { PUBLISH_PRICE_PAISE } from "@/config/site";
import { POST } from "@/routes/api/orders";

// Batch 2 / Task 4: /api/orders used to take the caller's identity from
// the request body (`userId`) and insert with the service-role client —
// anyone could create an order "as" any user. The handler now verifies
// the Supabase session from the Authorization header and derives the
// identity from it alone. decideOrderUser is the pure decision seam:
// given the verified session user id (or null) and whatever userId the
// body claimed, it decides whose id the order may be created under.
//
// - No session → 401, no matter what the body claims.
// - Session + absent body userId → the session id (tolerated for one
//   release while older clients roll over).
// - Session + body userId equal → the session id.
// - Session + body userId different → 403. The body's id is NEVER used
//   as the order's owner — silently substituting it was the IDOR.

const SESSION_ID = "session-user-1";
const OTHER_ID = "someone-else-2";

// A publish-ready stored config: it passes getDraftIssues (both names,
// a future date, a valid WhatsApp number, a valid Maps link). The
// orders handler validates the STORED config server-side (NF-3), so
// the handler tests stage invites the way the real publish flow
// leaves them.
const completeConfig = {
  hosts: { mode: "couple", person1: "Asha", person2: "Rohan" },
  event: {
    startIso: "2099-02-12T10:00:00.000Z",
    venueMapsUrl: "https://maps.google.com/?q=Palm+Grove",
  },
  rsvp: { whatsapp: "+91 98200 00000" },
  subEvents: [],
};

// What a dashboard-created blank invite stores (blankConfig()): no
// names, no date. It must never become payable.
const blankStoredConfig = {
  hosts: { mode: "couple", person1: "", person2: "" },
  event: { startIso: "" },
  rsvp: {},
  subEvents: [],
};

describe("decideOrderUser", () => {
  it("rejects with 401 when there is no session, even if the body names a user", () => {
    expect(
      decideOrderUser({ sessionUserId: null, bodyUserId: SESSION_ID }),
    ).toEqual({ ok: false, status: 401 });
  });

  it("rejects with 401 when there is no session and no body userId", () => {
    expect(
      decideOrderUser({ sessionUserId: null, bodyUserId: undefined }),
    ).toEqual({ ok: false, status: 401 });
    expect(
      decideOrderUser({ sessionUserId: undefined, bodyUserId: undefined }),
    ).toEqual({ ok: false, status: 401 });
  });

  it("uses the session id when the body omits userId", () => {
    expect(
      decideOrderUser({ sessionUserId: SESSION_ID, bodyUserId: undefined }),
    ).toEqual({ ok: true, userId: SESSION_ID });
  });

  it("treats an empty-string body userId as absent", () => {
    expect(
      decideOrderUser({ sessionUserId: SESSION_ID, bodyUserId: "" }),
    ).toEqual({ ok: true, userId: SESSION_ID });
  });

  it("uses the session id when the body userId matches it", () => {
    expect(
      decideOrderUser({ sessionUserId: SESSION_ID, bodyUserId: SESSION_ID }),
    ).toEqual({ ok: true, userId: SESSION_ID });
  });

  it("rejects with 403 when the body userId names a different user", () => {
    expect(
      decideOrderUser({ sessionUserId: SESSION_ID, bodyUserId: OTHER_ID }),
    ).toEqual({ ok: false, status: 403 });
  });
});

// Handler-level matrix (plan-1 Task 4): the route must authenticate
// before it validates or inserts, and the inserted row must carry the
// SESSION user's id. No live Supabase is contacted — supabase-server is
// mocked above; the token check, header parsing and status mapping are
// the real handler's.
describe("POST /api/orders — session authentication", () => {
  const validBody = {
    inviteId: "invite-1",
    tier: "royal",
    amountMinor: PUBLISH_PRICE_PAISE,
  };

  function orderRequest(body: unknown, token?: string) {
    return new Request("http://localhost/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });
  }

  beforeEach(() => {
    mockState.user = { id: SESSION_ID };
    mockState.invite = {
      user_id: SESSION_ID,
      config: completeConfig,
      status: "draft",
    };
    mockState.inserted = null;
    mockState.inserts = [];
    mockState.insertError = null;
    mockState.paidOrder = null;
    mockState.paidLookupError = null;
    mockState.orderRows = [];
    mockState.orderSeq = 0;
    mockState.staleActiveLookups = 0;
    mockState.activeLookupError = null;
  });

  it("rejects a request with no Authorization header with 401", async () => {
    const res = await POST(orderRequest({ ...validBody, userId: SESSION_ID }));
    expect(res.status).toBe(401);
    expect(mockState.inserted).toBeNull();
  });

  it("rejects an invalid access token with 401", async () => {
    const res = await POST(
      orderRequest({ ...validBody, userId: SESSION_ID }, "bad-token"),
    );
    expect(res.status).toBe(401);
    expect(mockState.inserted).toBeNull();
  });

  it("rejects a body userId that differs from the session user with 403", async () => {
    const res = await POST(
      orderRequest({ ...validBody, userId: OTHER_ID }, "valid-access-token"),
    );
    expect(res.status).toBe(403);
    expect(mockState.inserted).toBeNull();
  });

  it("creates the order under the session user id when the body omits userId", async () => {
    const res = await POST(orderRequest(validBody, "valid-access-token"));
    expect(res.status).toBe(201);
    expect(mockState.inserted?.["user_id"]).toBe(SESSION_ID);
    const data = (await res.json()) as { order_id: string };
    expect(data.order_id).toBe("order-1");
  });

  it("still rejects a wrong amount for a valid session with 400", async () => {
    const res = await POST(
      orderRequest(
        { ...validBody, userId: SESSION_ID, amountMinor: 100 },
        "valid-access-token",
      ),
    );
    expect(res.status).toBe(400);
    expect(mockState.inserted).toBeNull();
  });

  it("returns 404 when the invite belongs to another user", async () => {
    mockState.invite = {
      user_id: OTHER_ID,
      config: completeConfig,
      status: "draft",
    };
    const res = await POST(
      orderRequest({ ...validBody, userId: SESSION_ID }, "valid-access-token"),
    );
    expect(res.status).toBe(404);
    expect(mockState.inserted).toBeNull();
  });
});

// NF-3: the publish-readiness gate used to exist only in the browser,
// so a direct API call could create — and pay for — an order against
// the owner's own blank invite, which the webhook would then publish.
// The handler now re-validates the STORED invite config with the same
// getDraftIssues rules before inserting anything.
describe("POST /api/orders — invitation completeness (NF-3)", () => {
  const validBody = {
    inviteId: "invite-1",
    tier: "royal",
    amountMinor: PUBLISH_PRICE_PAISE,
  };

  function orderRequest(body: unknown) {
    return new Request("http://localhost/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer valid-access-token",
      },
      body: JSON.stringify(body),
    });
  }

  beforeEach(() => {
    mockState.user = { id: SESSION_ID };
    mockState.inserted = null;
    mockState.inserts = [];
    mockState.insertError = null;
    mockState.paidOrder = null;
    mockState.paidLookupError = null;
    mockState.orderRows = [];
    mockState.orderSeq = 0;
    mockState.staleActiveLookups = 0;
    mockState.activeLookupError = null;
  });

  it("rejects a blank stored invitation with 422 and inserts nothing", async () => {
    mockState.invite = {
      user_id: SESSION_ID,
      config: blankStoredConfig,
      status: "draft",
    };
    const res = await POST(orderRequest({ ...validBody, userId: SESSION_ID }));
    expect(res.status).toBe(422);
    const data = (await res.json()) as { error: string; issues: number };
    expect(data.error).toBe("invitation_incomplete");
    expect(data.issues).toBeGreaterThan(0);
    expect(mockState.inserted).toBeNull();
  });

  it("rejects the schema-default empty config object with 422", async () => {
    mockState.invite = { user_id: SESSION_ID, config: {}, status: "draft" };
    const res = await POST(orderRequest(validBody));
    expect(res.status).toBe(422);
    expect(mockState.inserted).toBeNull();
  });

  it("rejects a stored config whose event date is in the past with 422", async () => {
    mockState.invite = {
      user_id: SESSION_ID,
      config: {
        ...completeConfig,
        event: {
          ...completeConfig.event,
          startIso: "2020-01-01T00:00:00.000Z",
        },
      },
      status: "draft",
    };
    const res = await POST(orderRequest(validBody));
    expect(res.status).toBe(422);
    expect(mockState.inserted).toBeNull();
  });
});

// NF-7: the 500 path used to log the raw Supabase error object, whose
// message/details can carry database internals into server logs. It
// must log the error class only, matching the webhook's discipline.
describe("POST /api/orders — error logging (NF-7)", () => {
  it("logs only the error class when order creation fails", async () => {
    mockState.user = { id: SESSION_ID };
    mockState.invite = {
      user_id: SESSION_ID,
      config: completeConfig,
      status: "draft",
    };
    mockState.inserted = null;
    mockState.inserts = [];
    mockState.paidOrder = null;
    mockState.paidLookupError = null;
    mockState.orderRows = [];
    mockState.orderSeq = 0;
    mockState.staleActiveLookups = 0;
    mockState.activeLookupError = null;
    const sentinel = { message: "db-internal-detail-xyz", code: "XX000" };
    mockState.insertError = sentinel;

    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      const res = await POST(
        new Request("http://localhost/api/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer valid-access-token",
          },
          body: JSON.stringify({
            inviteId: "invite-1",
            tier: "royal",
            amountMinor: PUBLISH_PRICE_PAISE,
          }),
        }),
      );
      expect(res.status).toBe(500);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      const args = errorSpy.mock.calls[0] ?? [];
      expect(args[0]).toBe("Order creation failed");
      expect(args).toHaveLength(2);
      expect(args[1]).toEqual({ errorClass: "object" });
      expect(JSON.stringify(args)).not.toContain("db-internal-detail-xyz");
    } finally {
      errorSpy.mockRestore();
      mockState.insertError = null;
    }
  });
});

// Round 3 / WS1: the order API never read the invite's status — the
// /publish UI gates on it (resolvePublishSubject), but a direct API
// call could create a fresh payable order against an invite that is
// already published (a second ₹599 charge for the same publication)
// or archived (a publication the owner has retired). The server now
// enforces the state machine itself: only a draft may initiate a
// publication payment, and an invite with a paid order may never be
// charged again (that guard also closes the scenario-14 residue
// window: order paid, publish outstanding, invite still a draft —
// recovery belongs to the webhook, not to a second checkout).
//
// Each test stages its OWN session user id: the route's rate limiter
// is keyed per IP+user for the whole module, and these tests must not
// spend the shared SESSION_ID budget the describes above rely on.
describe("POST /api/orders — invitation status gate (Round 3 WS1)", () => {
  const validBody = {
    inviteId: "invite-1",
    tier: "royal",
    amountMinor: PUBLISH_PRICE_PAISE,
  };

  function orderRequest(body: unknown) {
    return new Request("http://localhost/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer valid-access-token",
      },
      body: JSON.stringify(body),
    });
  }

  function stage(userId: string, status: string) {
    mockState.user = { id: userId };
    mockState.invite = {
      user_id: userId,
      config: completeConfig,
      status,
    };
    mockState.inserted = null;
    mockState.inserts = [];
    mockState.insertError = null;
    mockState.paidOrder = null;
    mockState.paidLookupError = null;
    mockState.orderRows = [];
    mockState.orderSeq = 0;
    mockState.staleActiveLookups = 0;
    mockState.activeLookupError = null;
  }

  it("rejects an order for an already-published invite with 409 and inserts nothing", async () => {
    stage("ws1-user-published", "published");
    const res = await POST(orderRequest(validBody));
    expect(res.status).toBe(409);
    const data = (await res.json()) as { error: string };
    expect(data.error).toBe("invite_not_publishable");
    expect(mockState.inserted).toBeNull();
    expect(mockState.inserts).toHaveLength(0);
  });

  it("rejects an order for an archived invite with 409 and inserts nothing", async () => {
    stage("ws1-user-archived", "archived");
    const res = await POST(orderRequest(validBody));
    expect(res.status).toBe(409);
    expect(mockState.inserted).toBeNull();
    expect(mockState.inserts).toHaveLength(0);
  });

  it("rejects an order for an invite in an unknown state, failing closed", async () => {
    stage("ws1-user-unknown", "some-future-status");
    const res = await POST(orderRequest(validBody));
    expect(res.status).toBe(409);
    expect(mockState.inserts).toHaveLength(0);
  });

  it("rejects a second charge when a paid order already exists for the invite", async () => {
    stage("ws1-user-paid", "draft");
    mockState.paidOrder = { id: "order-earlier" };
    const res = await POST(orderRequest(validBody));
    expect(res.status).toBe(409);
    const data = (await res.json()) as { error: string };
    expect(data.error).toBe("invite_already_paid");
    expect(mockState.inserts).toHaveLength(0);
  });

  it("stale client: a retry after the invite has been published is rejected; exactly one order was created", async () => {
    stage("ws1-user-stale", "draft");
    const first = await POST(orderRequest(validBody));
    expect(first.status).toBe(201);
    expect(mockState.inserts).toHaveLength(1);

    // The payment completed, the webhook published the invite, and
    // the customer's stale browser tab retries the same request.
    mockState.invite = {
      user_id: "ws1-user-stale",
      config: completeConfig,
      status: "published",
    };
    const retry = await POST(orderRequest(validBody));
    expect(retry.status).toBe(409);
    expect(mockState.inserts).toHaveLength(1);
  });

  it("concurrent duplicate attempts on a draft converge on ONE order — and once one is paid, further attempts are rejected", async () => {
    // Round 3.7 / Q-16 rewrite: this test used to characterize the
    // duplicate-orders behaviour (two attempts → two 'created'
    // rows). Option D closes that: the second attempt either finds
    // the first order in the active-order lookup and reuses it, or
    // loses the insert race to migration 0005's partial unique
    // index (the fake models its 23505) and resolves from the
    // winner. Either way both callers leave with the SAME order id
    // and exactly one row exists.
    stage("ws1-user-concurrent", "draft");
    const [a, b] = await Promise.all([
      POST(orderRequest(validBody)),
      POST(orderRequest(validBody)),
    ]);
    expect(a.status).toBe(201);
    expect(b.status).toBe(201);
    const dataA = (await a.json()) as { order_id: string };
    const dataB = (await b.json()) as { order_id: string };
    expect(dataA.order_id).toBe(dataB.order_id);
    expect(mockState.orderRows).toHaveLength(1);
    expect(mockState.orderRows[0]?.["status"] ?? "created").toBe("created");

    mockState.paidOrder = { id: "order-1" };
    const after = await POST(orderRequest(validBody));
    expect(after.status).toBe(409);
    expect(mockState.orderRows).toHaveLength(1);
  });
});

// Round 3.5: the paid-order lookup in the handler destructured only
// `data` and never read the query's `error`. On a lookup failure
// (transient DB error, timeout) `data` is null — indistinguishable
// from "no paid order" — so the handler fell through and INSERTED a
// new payable order, defeating the invite_already_paid guard exactly
// when the database was misbehaving. The lookup must fail closed:
// no insert, no checkout, a generic 500, error-class-only logging.
describe("POST /api/orders — paid-order lookup failure (Round 3.5)", () => {
  const validBody = {
    inviteId: "invite-1",
    tier: "royal",
    amountMinor: PUBLISH_PRICE_PAISE,
  };

  function orderRequest(body: unknown) {
    return new Request("http://localhost/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer valid-access-token",
      },
      body: JSON.stringify(body),
    });
  }

  function stage(userId: string) {
    mockState.user = { id: userId };
    mockState.invite = {
      user_id: userId,
      config: completeConfig,
      status: "draft",
    };
    mockState.inserted = null;
    mockState.inserts = [];
    mockState.insertError = null;
    mockState.paidOrder = null;
    mockState.paidLookupError = null;
    mockState.orderRows = [];
    mockState.orderSeq = 0;
    mockState.staleActiveLookups = 0;
    mockState.activeLookupError = null;
  }

  it("fails closed when the paid-order lookup errors: 500, no insert, generic body", async () => {
    stage("r35-user-lookup-error");
    mockState.paidLookupError = {
      message: "paid-lookup-detail-xyz",
      code: "XX000",
    };
    try {
      const res = await POST(orderRequest(validBody));
      expect(res.status).toBe(500);
      const data = (await res.json()) as { error: string };
      expect(data.error).toBe("Failed to create order");
      // The core regression assertion: the guard's failure must NOT
      // be treated as "no paid order exists".
      expect(mockState.inserted).toBeNull();
      expect(mockState.inserts).toHaveLength(0);
    } finally {
      mockState.paidLookupError = null;
    }
  });

  it("logs only the error class when the paid-order lookup fails (no DB detail leaks)", async () => {
    stage("r35-user-lookup-log");
    mockState.paidLookupError = {
      message: "paid-lookup-detail-xyz",
      code: "XX000",
    };
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      const res = await POST(orderRequest(validBody));
      expect(res.status).toBe(500);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      const args = errorSpy.mock.calls[0] ?? [];
      expect(args[0]).toBe("Order creation failed");
      expect(args[1]).toEqual({ errorClass: "object" });
      expect(JSON.stringify(args)).not.toContain("paid-lookup-detail-xyz");
    } finally {
      errorSpy.mockRestore();
      mockState.paidLookupError = null;
    }
  });

  it("control: a successful lookup with no paid order still creates the order (201)", async () => {
    stage("r35-user-control");
    const res = await POST(orderRequest(validBody));
    expect(res.status).toBe(201);
    expect(mockState.inserts).toHaveLength(1);
    expect(mockState.inserted?.["user_id"]).toBe("r35-user-control");
  });
});

// --------------------------------------------------------------------
// Round 3.7 / Q-16 — Option D: one ACTIVE order per invite.
// The handler looks up the invite's active order (status created or
// paid, newest first) before inserting: paid → the existing 409;
// created → the existing order is RETURNED (reuse) instead of
// inserting a duplicate. Migration 0005's partial unique index is
// the database backstop: if two requests race past the lookup, the
// loser's insert fails with 23505 and the handler resolves from the
// winning order via a fresh lookup. 'failed' and 'refunded' orders
// are NOT active — a failed payment never blocks a retry.
// The fake models the index + row visibility (see mockState docs);
// each test stages its own session user (per-user rate budget).
// --------------------------------------------------------------------
describe("POST /api/orders — one active order per invite (Round 3.7 / Q-16)", () => {
  const validBody = {
    inviteId: "invite-1",
    tier: "royal",
    amountMinor: PUBLISH_PRICE_PAISE,
  };

  function orderRequest(body: unknown) {
    return new Request("http://localhost/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer valid-access-token",
      },
      body: JSON.stringify(body),
    });
  }

  function stage(userId: string) {
    mockState.user = { id: userId };
    mockState.invite = {
      user_id: userId,
      config: completeConfig,
      status: "draft",
    };
    mockState.inserted = null;
    mockState.inserts = [];
    mockState.insertError = null;
    mockState.paidOrder = null;
    mockState.paidLookupError = null;
    mockState.orderRows = [];
    mockState.orderSeq = 0;
    mockState.staleActiveLookups = 0;
    mockState.activeLookupError = null;
  }

  it("double-submit (sequential): the second request returns the SAME order id and inserts nothing new", async () => {
    stage("q16-user-double-submit");
    const first = await POST(orderRequest(validBody));
    expect(first.status).toBe(201);
    const firstData = (await first.json()) as { order_id: string };
    expect(mockState.inserts).toHaveLength(1);

    const second = await POST(orderRequest(validBody));
    expect(second.status).toBe(201);
    const secondData = (await second.json()) as {
      order_id: string;
      status: string;
    };
    expect(secondData.order_id).toBe(firstData.order_id);
    expect(secondData.status).toBe("created");
    expect(mockState.inserts).toHaveLength(1);
    expect(mockState.orderRows).toHaveLength(1);
  });

  it("concurrent pair: both lookups miss, both insert, the loser's 23505 resolves to the winner's order id", async () => {
    stage("q16-user-race");
    // Force both pre-insert lookups to observe an empty table (the
    // race window); the fake index then rejects the second insert.
    mockState.staleActiveLookups = 2;

    const [a, b] = await Promise.all([
      POST(orderRequest(validBody)),
      POST(orderRequest(validBody)),
    ]);
    expect(a.status).toBe(201);
    expect(b.status).toBe(201);
    const dataA = (await a.json()) as { order_id: string };
    const dataB = (await b.json()) as { order_id: string };
    expect(dataA.order_id).toBe(dataB.order_id);
    // Exactly one row was created; both insert attempts happened.
    expect(mockState.orderRows).toHaveLength(1);
    expect(mockState.inserts).toHaveLength(2);
  });

  it("a failed order does not block a retry: with only a failed order present, a new order is inserted", async () => {
    stage("q16-user-failed-retry");
    mockState.orderRows = [
      { id: "order-old-failed", invite_id: "invite-1", status: "failed" },
    ];

    const res = await POST(orderRequest(validBody));
    expect(res.status).toBe(201);
    const data = (await res.json()) as { order_id: string };
    expect(data.order_id).not.toBe("order-old-failed");
    expect(mockState.inserts).toHaveLength(1);
    expect(mockState.orderRows).toHaveLength(2);
  });

  it("a failed order alongside a created one: the created order is reused (failed never shadows the active one)", async () => {
    stage("q16-user-failed-and-created");
    mockState.orderRows = [
      { id: "order-old-failed", invite_id: "invite-1", status: "failed" },
      { id: "order-open", invite_id: "invite-1", status: "created" },
    ];

    const res = await POST(orderRequest(validBody));
    expect(res.status).toBe(201);
    const data = (await res.json()) as { order_id: string };
    expect(data.order_id).toBe("order-open");
    expect(mockState.inserts).toHaveLength(0);
    expect(mockState.orderRows).toHaveLength(2);
  });

  it("the 23505 race against a PAID winner resolves to 409 invite_already_paid", async () => {
    stage("q16-user-race-paid");
    // A paid order exists at the table (the migration's index
    // covers it), but this request's pre-insert lookup raced ahead
    // of it and missed; the insert hits the index and the fresh
    // re-lookup tells the truth.
    mockState.orderRows = [
      { id: "order-paid-winner", invite_id: "invite-1", status: "paid" },
    ];
    mockState.staleActiveLookups = 1;

    const res = await POST(orderRequest(validBody));
    expect(res.status).toBe(409);
    const data = (await res.json()) as { error: string };
    expect(data.error).toBe("invite_already_paid");
    expect(mockState.orderRows).toHaveLength(1);
  });

  it("a 23505 whose re-lookup finds nothing fails closed with the generic 500", async () => {
    stage("q16-user-race-vanished");
    // Pathological corner: the index fired (a conflicting row
    // committed) yet the re-lookup still cannot see any active
    // order. The handler must not guess an order id into existence.
    mockState.orderRows = [
      { id: "order-open", invite_id: "invite-1", status: "created" },
    ];
    mockState.staleActiveLookups = 2;

    const res = await POST(orderRequest(validBody));
    expect(res.status).toBe(500);
    const data = (await res.json()) as { error: string };
    expect(data.error).toBe("Failed to create order");
    expect(mockState.orderRows).toHaveLength(1);
  });

  it("an active-lookup database error fails closed: 500, no insert attempted", async () => {
    stage("q16-user-lookup-error");
    mockState.activeLookupError = {
      message: "active-lookup-detail-xyz",
      code: "XX000",
    };

    const res = await POST(orderRequest(validBody));
    expect(res.status).toBe(500);
    const data = (await res.json()) as { error: string };
    expect(data.error).toBe("Failed to create order");
    expect(mockState.inserts).toHaveLength(0);
    expect(mockState.orderRows).toHaveLength(0);
  });

  // Adversarial review B (Round 3.7): the reuse return must not
  // bypass the NF-3 completeness gate. The order below was created
  // while the invite was complete; the owner has since emptied the
  // stored config. The pre-3.7 flow re-ran completeness on EVERY
  // attempt and would 422 here; returning the existing order
  // unchecked would hand the client a payable checkout for an
  // invite the webhook would then publish blank.
  it("reuse does not bypass completeness: an existing created order + a now-incomplete invite is 422, not a reused checkout", async () => {
    stage("q16-user-reuse-incomplete");
    mockState.invite = {
      user_id: "q16-user-reuse-incomplete",
      config: blankStoredConfig,
      status: "draft",
    };
    mockState.orderRows = [
      { id: "order-open", invite_id: "invite-1", status: "created" },
    ];

    const res = await POST(orderRequest(validBody));
    expect(res.status).toBe(422);
    const data = (await res.json()) as { error: string };
    expect(data.error).toBe("invitation_incomplete");
    expect(mockState.inserts).toHaveLength(0);
    expect(mockState.orderRows).toHaveLength(1);
  });

  // Control for the precedence above: a paid order still wins over
  // the completeness gate (409 invite_already_paid), exactly as the
  // pre-3.7 ordering (paid guard → completeness) behaved.
  it("precedence control: a paid order + an incomplete invite still answers 409 invite_already_paid", async () => {
    stage("q16-user-paid-incomplete");
    mockState.invite = {
      user_id: "q16-user-paid-incomplete",
      config: blankStoredConfig,
      status: "draft",
    };
    mockState.paidOrder = { id: "order-paid-1" };

    const res = await POST(orderRequest(validBody));
    expect(res.status).toBe(409);
    const data = (await res.json()) as { error: string };
    expect(data.error).toBe("invite_already_paid");
    expect(mockState.inserts).toHaveLength(0);
  });
});
