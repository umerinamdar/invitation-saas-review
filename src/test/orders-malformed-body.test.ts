import { beforeEach, describe, expect, it, vi } from "vitest";

// Follow-up (owner-approved, 2026-10-23) to CODE-HEALTH finding
// API-ORDERS-1: POST /api/orders answered 500 for a malformed-JSON,
// JSON-null or JSON-array body, where 400 is correct. The handler did
//   const body = await request.json();
// inside the outer try with no local guard: a SyntaxError (malformed
// JSON) or a TypeError (destructuring `null`) landed in the catch-all,
// which logs "Order creation failed" and returns the generic 500.
// An array body slipped through to the "Missing fields" 400 only by
// accident of destructuring — the guard now rejects every non-object
// body deterministically, with the route's machine-code error style
// ({ error: "invalid_json" }; the checkout maps unknown codes to a
// generic message via orderErrorMessage, so no raw code can render).
//
// Auth runs BEFORE body parsing, so these requests carry a valid
// session: the mock below is the hoisted supabase-server fake from
// orders-auth.test.ts, reused verbatim, and each test stages its own
// session user id (the route's rate limiter is keyed per IP+user for
// the whole module).

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

import { PUBLISH_PRICE_PAISE } from "@/config/site";
import { POST } from "@/routes/api/orders";

// A publish-ready stored config (same staging as orders-auth.test.ts):
// it passes getStoredInviteIssues, so the well-formed control below
// flows all the way to a created order.
const completeConfig = {
  hosts: { mode: "couple", person1: "Asha", person2: "Rohan" },
  event: {
    startIso: "2099-02-12T10:00:00.000Z",
    venueMapsUrl: "https://maps.google.com/?q=Palm+Grove",
  },
  rsvp: { whatsapp: "+91 98200 00000" },
  subEvents: [],
};

function authedRequest(rawBody: string) {
  return new Request("http://localhost/api/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer valid-access-token",
    },
    body: rawBody,
  });
}

describe("POST /api/orders — malformed body (API-ORDERS-1)", () => {
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

  beforeEach(() => {
    stage("malformed-body-user");
  });

  it("answers 400 invalid_json, not 500, for a syntactically invalid JSON body", async () => {
    stage("mb-user-malformed");
    const res = await POST(authedRequest("{not json"));
    expect(res.status).toBe(400);
    const data = (await res.json()) as { error: string };
    expect(data.error).toBe("invalid_json");
    expect(mockState.inserts).toHaveLength(0);
  });

  it("answers 400 invalid_json, not 500, for a JSON null body", async () => {
    stage("mb-user-null");
    const res = await POST(authedRequest("null"));
    expect(res.status).toBe(400);
    const data = (await res.json()) as { error: string };
    expect(data.error).toBe("invalid_json");
    expect(mockState.inserts).toHaveLength(0);
  });

  it("answers 400 invalid_json, not 500, for a JSON array body", async () => {
    stage("mb-user-array");
    const res = await POST(authedRequest("[]"));
    expect(res.status).toBe(400);
    const data = (await res.json()) as { error: string };
    expect(data.error).toBe("invalid_json");
    expect(mockState.inserts).toHaveLength(0);
  });

  it("control: a well-formed body still flows normally and creates the order (201)", async () => {
    stage("mb-user-control");
    const res = await POST(
      authedRequest(
        JSON.stringify({
          inviteId: "invite-1",
          tier: "royal",
          amountMinor: PUBLISH_PRICE_PAISE,
        }),
      ),
    );
    expect(res.status).toBe(201);
    const data = (await res.json()) as { order_id: string; status: string };
    expect(data.status).toBe("created");
    expect(mockState.inserts).toHaveLength(1);
    expect(mockState.inserted?.["user_id"]).toBe("mb-user-control");
  });
});
