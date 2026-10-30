import { beforeEach, describe, expect, it, vi } from "vitest";

// Round-2 two-user authorization pack (master prompt §5.5 / §5.11 /
// §8.2). TWO named users plus anonymous, against the app's REAL
// data-access layer — no app code was changed for these tests.
//
//   user A ("user-a") owns: a draft invite, a published invite, an order.
//   user B ("user-b") owns: a draft invite, an order. B is a stranger
//   to everything of A's.
//   anonymous: no session at all.
//
// How the fake works — and what it does and does NOT prove:
// The browser Supabase client is stubbed at the module boundary, but
// unlike a pure recording stub, the chain below APPLIES the recorded
// eq() filters to fixture rows, the way PostgREST would. Two different
// legs, two different claims:
//
//   * invites legs: the fake applies ONLY the filters the code itself
//     builds, over the raw fixture table. If B gets nothing of A's,
//     that is the CODE predicate (invites-api's DB-2 backstop:
//     .eq("user_id", <session user>)) doing it alone — these legs stay
//     green even in a world where RLS was never applied.
//   * orders-read legs: orders-api deliberately has no code predicate
//     (reads are owner-scoped by the 0001 policy "read own orders"
//     only — the DB-2 residual for orders). To model the SYSTEM
//     outcome the fake additionally applies that one policy's rule
//     (an orders row is visible only when user_id = session user).
//     These legs pin the combined code+policy contract; the LIVE
//     proof that the policy exists is mission/RLS-VERIFICATION.sql,
//     not anything a unit test can see.
//
// The /api/orders legs drive the real POST handler with the
// service-role module stubbed (the orders-auth.test.ts pattern):
// tokens map to users, the invite lookup answers by requested id, and
// inserts are captured.

type Row = Record<string, unknown>;

const USER_A = "user-a";
const USER_B = "user-b";
const A_DRAFT = "invite-a-draft";
const A_PUB = "invite-a-pub";
const B_DRAFT = "invite-b-draft";
const A_ORDER = "order-a-1";

// ---------------------------------------------------------------------
// Browser client fake (@/lib/supabase)
// ---------------------------------------------------------------------
const browser = vi.hoisted(() => ({
  sessionUserId: "user-a" as string | null,
  getUserCalls: 0,
  calls: [] as Array<{ method: string; args: unknown[] }>,
  invites: [] as Row[],
  orders: [] as Row[],
}));

vi.mock("@/lib/supabase", () => {
  function makeChain(table: string) {
    const filters: Array<[string, unknown]> = [];
    let op: "select" | "insert" | "update" | "delete" = "select";
    let payload: Row | null = null;
    const chain: Record<string, unknown> = {};
    const rec =
      (name: string) =>
      (...args: unknown[]) => {
        browser.calls.push({ method: name, args });
        return chain;
      };

    function baseRows(): Row[] {
      return table === "invites" ? browser.invites : browser.orders;
    }
    function matched(): Row[] {
      let rows = baseRows().filter((row) =>
        filters.every(([col, val]) => row[col] === val),
      );
      if (table === "orders") {
        // Modelled 0001 policy "read own orders" — see header comment.
        rows = rows.filter((row) => row["user_id"] === browser.sessionUserId);
      }
      return rows;
    }
    const noRowsError = {
      code: "PGRST116",
      message: "JSON object requested, multiple (or no) rows returned",
    };

    chain["select"] = rec("select");
    chain["order"] = rec("order");
    chain["eq"] = (col: string, val: unknown) => {
      browser.calls.push({ method: "eq", args: [col, val] });
      filters.push([col, val]);
      return chain;
    };
    chain["insert"] = (row: Row) => {
      browser.calls.push({ method: "insert", args: [row] });
      op = "insert";
      payload = row;
      return chain;
    };
    chain["update"] = (row: Row) => {
      browser.calls.push({ method: "update", args: [row] });
      op = "update";
      payload = row;
      return chain;
    };
    chain["delete"] = () => {
      browser.calls.push({ method: "delete", args: [] });
      op = "delete";
      return chain;
    };
    chain["single"] = async () => {
      const rows = matched();
      if (op === "update") {
        if (rows.length !== 1) return { data: null, error: noRowsError };
        Object.assign(rows[0] as Row, payload);
        return { data: rows[0], error: null };
      }
      if (op === "insert") {
        baseRows().push(payload as Row);
        return { data: payload, error: null };
      }
      return rows.length === 1
        ? { data: rows[0], error: null }
        : { data: null, error: noRowsError };
    };
    chain["maybeSingle"] = async () => {
      const rows = matched();
      if (rows.length === 0) return { data: null, error: null };
      if (rows.length === 1) return { data: rows[0], error: null };
      return { data: null, error: noRowsError };
    };
    chain["then"] = (
      resolve: (value: unknown) => unknown,
      reject?: (reason: unknown) => unknown,
    ) => {
      const rows = matched();
      if (op === "delete") {
        const base = baseRows();
        for (const row of rows) {
          const idx = base.indexOf(row);
          if (idx >= 0) base.splice(idx, 1);
        }
      }
      return Promise.resolve({ data: rows, error: null }).then(resolve, reject);
    };
    return chain;
  }

  return {
    supabase: {
      from: (table: string) => {
        browser.calls.push({ method: "from", args: [table] });
        return makeChain(table);
      },
      auth: {
        getUser: async () => {
          browser.getUserCalls += 1;
          return {
            data: {
              user: browser.sessionUserId
                ? { id: browser.sessionUserId }
                : null,
            },
            error: null,
          };
        },
      },
    },
  };
});

// ---------------------------------------------------------------------
// Server client fake (@/lib/supabase-server) for the /api/orders route
// ---------------------------------------------------------------------
const server = vi.hoisted(() => ({
  invitesById: {} as Record<
    string,
    { user_id: string; config: unknown; status?: string }
  >,
  inserted: null as Record<string, unknown> | null,
}));

vi.mock("@/lib/supabase-server", () => {
  function fakeChain(table: string) {
    let wantedId: string | null = null;
    const chain: Record<string, unknown> = {
      select: () => chain,
      eq: (col: string, val: unknown) => {
        if (col === "id") wantedId = val as string;
        return chain;
      },
      // Round 3.7: the route's active-order lookup chains .in() +
      // .order() and awaits the builder as a list. These fixtures
      // stage no pre-existing orders, so the list resolves empty.
      in: () => chain,
      order: () => chain,
      then: (
        onFulfilled: (v: { data: unknown; error: unknown }) => unknown,
        onRejected?: (e: unknown) => unknown,
      ) =>
        Promise.resolve({ data: [], error: null }).then(
          onFulfilled,
          onRejected,
        ),
      insert: (payload: Record<string, unknown>) => {
        server.inserted = payload;
        return chain;
      },
      maybeSingle: async () => ({
        data:
          table === "invites" && wantedId
            ? (server.invitesById[wantedId] ?? null)
            : null,
        error: null,
      }),
      single: async () => ({
        data: { id: "order-new", ...(server.inserted ?? {}) },
        error: null,
      }),
    };
    return chain;
  }

  return {
    supabaseServer: {
      auth: {
        getUser: async (token: string) => {
          if (token === "token-a")
            return { data: { user: { id: USER_A } }, error: null };
          if (token === "token-b")
            return { data: { user: { id: USER_B } }, error: null };
          return { data: { user: null }, error: { message: "Invalid token" } };
        },
      },
      from: (table: string) => fakeChain(table),
    },
  };
});

// /api/orders now creates a Razorpay order (a real network call) before
// inserting the row — stub it so these tests stay offline and
// deterministic. Every other export is untouched.
vi.mock("@/lib/orders-server", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/orders-server")>();
  return {
    ...actual,
    createRazorpayOrder: vi.fn(async () => ({
      ok: true as const,
      order: { id: "rzp_order_fake", amount: 59900, currency: "INR" },
    })),
  };
});

import {
  deleteInvite,
  getInviteById,
  getPublishedBySlug,
  listInvites,
  saveInvite,
} from "@/lib/invites-api";
import * as ordersApi from "@/lib/orders-api";
import { PUBLISH_PRICE_PAISE } from "@/config/site";
import { POST } from "@/routes/api/orders";

// A publish-ready stored config (same shape orders-auth.test.ts uses):
// passes the route's server-side completeness gate, so in the route
// legs below the ONLY thing that can reject B is ownership.
const completeConfig = {
  hosts: { mode: "couple", person1: "Aisha", person2: "Rohan" },
  event: {
    startIso: "2099-02-12T10:00:00.000Z",
    venueMapsUrl: "https://maps.google.com/?q=Palm+Grove",
  },
  rsvp: { whatsapp: "+91 98200 00000" },
  subEvents: [],
};

function seedFixtures() {
  browser.invites = [
    {
      id: A_DRAFT,
      user_id: USER_A,
      slug: "aisha-rohan-draft",
      status: "draft",
      theme_id: "dubai-silk",
      config: { hosts: { person1: "Aisha", person2: "Rohan" } },
    },
    {
      id: A_PUB,
      user_id: USER_A,
      slug: "aisha-rohan-live",
      status: "published",
      theme_id: "dubai-silk",
      config: { hosts: { person1: "Aisha", person2: "Rohan" } },
    },
    {
      id: B_DRAFT,
      user_id: USER_B,
      slug: "bilal-sana-draft",
      status: "draft",
      theme_id: "madina",
      config: { hosts: { person1: "Bilal", person2: "Sana" } },
    },
  ];
  browser.orders = [
    {
      id: A_ORDER,
      user_id: USER_A,
      invite_id: A_PUB,
      status: "created",
      amount_minor: 59900,
    },
    {
      id: "order-b-1",
      user_id: USER_B,
      invite_id: B_DRAFT,
      status: "created",
      amount_minor: 59900,
    },
  ];
}

function actAs(userId: string | null) {
  browser.sessionUserId = userId;
  browser.calls = [];
  browser.getUserCalls = 0;
}

function eqFilters(): unknown[][] {
  return browser.calls
    .filter((call) => call.method === "eq")
    .map((call) => call.args);
}

function tablesHit(): unknown[] {
  return browser.calls
    .filter((call) => call.method === "from")
    .map((call) => call.args[0]);
}

function fixtureInvite(id: string): Row | undefined {
  return browser.invites.find((row) => row["id"] === id);
}

beforeEach(() => {
  seedFixtures();
  actAs(USER_A);
  // Round 3 / WS1: the route now reads the invite's status (the
  // state gate), so the server fixtures carry one — a real invites
  // row always does (0001 CHECK). These rows model the route's view:
  // all three are drafts here (the purchase subjects); the
  // browser-side fixture above keeps its own published A_PUB row for
  // the slug tests — the two fakes are independent.
  server.invitesById = {
    [A_DRAFT]: { user_id: USER_A, config: completeConfig, status: "draft" },
    [A_PUB]: { user_id: USER_A, config: completeConfig, status: "draft" },
    [B_DRAFT]: { user_id: USER_B, config: completeConfig, status: "draft" },
  };
  server.inserted = null;
});

// =====================================================================
// Invites — B (stranger) against A's fixtures
// =====================================================================
describe("two-user authz — B cannot reach A's invites (browser layer)", () => {
  it("B's listInvites returns only B's own invites", async () => {
    actAs(USER_B);
    const rows = await listInvites();
    expect(rows.map((row) => row.id)).toEqual([B_DRAFT]);
    // The only scoping filter is B's own id — A's id appears nowhere.
    expect(eqFilters()).toEqual([["user_id", USER_B]]);
  });

  it("A's listInvites returns both of A's invites (control)", async () => {
    actAs(USER_A);
    const rows = await listInvites();
    expect(rows.map((row) => row.id).sort()).toEqual([A_DRAFT, A_PUB].sort());
    expect(eqFilters()).toEqual([["user_id", USER_A]]);
  });

  it("B's getInviteById on A's draft throws and leaks nothing", async () => {
    actAs(USER_B);
    await expect(getInviteById(A_DRAFT)).rejects.toThrow();
    expect(eqFilters()).toContainEqual(["id", A_DRAFT]);
    expect(eqFilters()).toContainEqual(["user_id", USER_B]);
    expect(eqFilters()).not.toContainEqual(["user_id", USER_A]);
  });

  it("B's getInviteById on A's PUBLISHED invite also throws via the owner path", async () => {
    // The owner getter is not the guest path: publication does not
    // widen it. Guests use getPublishedBySlug (tested below).
    actAs(USER_B);
    await expect(getInviteById(A_PUB)).rejects.toThrow();
  });

  it("A's getInviteById on A's own draft succeeds (control)", async () => {
    actAs(USER_A);
    const row = await getInviteById(A_DRAFT);
    expect(row?.id).toBe(A_DRAFT);
  });

  it("B's saveInvite on A's draft throws and A's row is byte-unchanged", async () => {
    actAs(USER_B);
    const before = JSON.stringify(fixtureInvite(A_DRAFT));
    await expect(
      saveInvite(A_DRAFT, { theme_id: "vesper-chapel" }),
    ).rejects.toThrow();
    expect(JSON.stringify(fixtureInvite(A_DRAFT))).toBe(before);
    expect(eqFilters()).toContainEqual(["user_id", USER_B]);
    expect(eqFilters()).not.toContainEqual(["user_id", USER_A]);
  });

  it("A's saveInvite on A's own draft succeeds (control)", async () => {
    actAs(USER_A);
    const row = await saveInvite(A_DRAFT, { theme_id: "vesper-chapel" });
    expect(row.theme_id).toBe("vesper-chapel");
    expect(fixtureInvite(A_DRAFT)?.["theme_id"]).toBe("vesper-chapel");
  });

  it("B's deleteInvite on A's draft deletes nothing", async () => {
    actAs(USER_B);
    await deleteInvite(A_DRAFT);
    expect(fixtureInvite(A_DRAFT)).toBeDefined();
    expect(browser.invites).toHaveLength(3);
    expect(eqFilters()).toContainEqual(["user_id", USER_B]);
    expect(eqFilters()).not.toContainEqual(["user_id", USER_A]);
  });

  it("B's deleteInvite on B's own draft works (control)", async () => {
    actAs(USER_B);
    await deleteInvite(B_DRAFT);
    expect(fixtureInvite(B_DRAFT)).toBeUndefined();
  });
});

// =====================================================================
// Anonymous — fail closed, no query issued
// =====================================================================
describe("two-user authz — anonymous fails closed (browser layer)", () => {
  it("anonymous listInvites returns [] and issues no table query", async () => {
    actAs(null);
    await expect(listInvites()).resolves.toEqual([]);
    expect(tablesHit()).toEqual([]);
  });

  it("anonymous getInviteById returns null and issues no table query", async () => {
    actAs(null);
    await expect(getInviteById(A_DRAFT)).resolves.toBeNull();
    expect(tablesHit()).toEqual([]);
  });

  it("anonymous saveInvite throws and issues no table query", async () => {
    actAs(null);
    await expect(
      saveInvite(A_DRAFT, { theme_id: "vesper-chapel" }),
    ).rejects.toThrow();
    expect(tablesHit()).toEqual([]);
    expect(fixtureInvite(A_DRAFT)?.["theme_id"]).toBe("dubai-silk");
  });

  it("anonymous deleteInvite throws and issues no table query", async () => {
    actAs(null);
    await expect(deleteInvite(A_DRAFT)).rejects.toThrow();
    expect(tablesHit()).toEqual([]);
    expect(fixtureInvite(A_DRAFT)).toBeDefined();
  });
});

// =====================================================================
// Orders — reads (code + modelled 0001 RLS) and the write-helper surface
// =====================================================================
describe("two-user authz — orders (browser layer)", () => {
  it("B's getOrderById on A's order returns null", async () => {
    actAs(USER_B);
    await expect(ordersApi.getOrderById(A_ORDER)).resolves.toBeNull();
  });

  it("anonymous getOrderById on A's order returns null", async () => {
    actAs(null);
    await expect(ordersApi.getOrderById(A_ORDER)).resolves.toBeNull();
  });

  it("A's getOrderById on A's own order returns it (control)", async () => {
    actAs(USER_A);
    const row = await ordersApi.getOrderById(A_ORDER);
    expect(row?.id).toBe(A_ORDER);
    expect(row?.status).toBe("created");
  });

  it("the browser orders module exposes NO write helpers at all (DB-1)", () => {
    // If anyone re-adds a browser-side createOrder / markOrderPaid /
    // markOrderFailed (or the dead readers), this test goes red: there
    // must be no client-callable path that can flip an order's status.
    const surface = ordersApi as unknown as Record<string, unknown>;
    expect(surface["createOrder"]).toBeUndefined();
    expect(surface["markOrderPaid"]).toBeUndefined();
    expect(surface["markOrderFailed"]).toBeUndefined();
    expect(surface["listOrdersForUser"]).toBeUndefined();
    expect(surface["hasInvitePaidOrder"]).toBeUndefined();
    expect(Object.keys(ordersApi).sort()).toEqual(["getOrderById"]);
  });
});

// =====================================================================
// Published slug — the one intentionally public read
// =====================================================================
describe("two-user authz — published slug access for all three actors", () => {
  it("owner, stranger and anonymous all reach A's PUBLISHED invite by slug", async () => {
    for (const actor of [USER_A, USER_B, null]) {
      actAs(actor);
      const row = await getPublishedBySlug("aisha-rohan-live");
      expect(row?.id).toBe(A_PUB);
      expect(row?.status).toBe("published");
    }
  });

  it("owner, stranger and anonymous all get null for A's DRAFT slug", async () => {
    // The in-code status='published' filter is what carries this —
    // not RLS, not the session: even the OWNER cannot pull a draft
    // through the guest path.
    for (const actor of [USER_A, USER_B, null]) {
      actAs(actor);
      await expect(getPublishedBySlug("aisha-rohan-draft")).resolves.toBeNull();
      expect(eqFilters()).toContainEqual(["status", "published"]);
    }
  });

  it("the slug path never consults auth and never adds a user predicate", async () => {
    actAs(null);
    await getPublishedBySlug("aisha-rohan-live");
    expect(browser.getUserCalls).toBe(0);
    expect(eqFilters()).not.toContainEqual(["user_id", expect.anything()]);
  });
});

// =====================================================================
// /api/orders route — session B vs A's invite
// =====================================================================
describe("two-user authz — POST /api/orders with B's session", () => {
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

  const bBuyingAsInvite = {
    inviteId: A_PUB,
    tier: "royal",
    amountMinor: PUBLISH_PRICE_PAISE,
  };

  it("B's session + A's invite → 404, nothing inserted", async () => {
    const res = await POST(orderRequest(bBuyingAsInvite, "token-b"));
    expect(res.status).toBe(404);
    expect(server.inserted).toBeNull();
  });

  it("B's session + A's invite + body userId claiming to be A → 403, nothing inserted", async () => {
    const res = await POST(
      orderRequest({ ...bBuyingAsInvite, userId: USER_A }, "token-b"),
    );
    expect(res.status).toBe(403);
    expect(server.inserted).toBeNull();
  });

  it("B's session + A's invite + body userId honestly B → 404 (identity passes, ownership fails)", async () => {
    const res = await POST(
      orderRequest({ ...bBuyingAsInvite, userId: USER_B }, "token-b"),
    );
    expect(res.status).toBe(404);
    expect(server.inserted).toBeNull();
  });

  it("anonymous + A's invite → 401, nothing inserted", async () => {
    const res = await POST(orderRequest(bBuyingAsInvite));
    expect(res.status).toBe(401);
    expect(server.inserted).toBeNull();
  });

  it("invalid token + A's invite → 401, nothing inserted", async () => {
    const res = await POST(orderRequest(bBuyingAsInvite, "token-forged"));
    expect(res.status).toBe(401);
    expect(server.inserted).toBeNull();
  });

  it("A's session + A's invite → 201 and the order is A's (control)", async () => {
    const res = await POST(orderRequest(bBuyingAsInvite, "token-a"));
    expect(res.status).toBe(201);
    expect(server.inserted?.["user_id"]).toBe(USER_A);
    expect(server.inserted?.["invite_id"]).toBe(A_PUB);
  });
});

// =====================================================================
// Round 3 / WS1 — the order route's state gate, two-user view
// =====================================================================
describe("two-user authz — POST /api/orders state gate (Round 3 WS1)", () => {
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

  const body = {
    inviteId: A_PUB,
    tier: "royal",
    amountMinor: PUBLISH_PRICE_PAISE,
  };

  it("A's session + A's invite, now published → 409, nothing inserted", async () => {
    server.invitesById[A_PUB] = {
      user_id: USER_A,
      config: completeConfig,
      status: "published",
    };
    const res = await POST(orderRequest(body, "token-a"));
    expect(res.status).toBe(409);
    expect(server.inserted).toBeNull();
  });

  it("A's session + A's invite, archived → 409, nothing inserted", async () => {
    server.invitesById[A_PUB] = {
      user_id: USER_A,
      config: completeConfig,
      status: "archived",
    };
    const res = await POST(orderRequest(body, "token-a"));
    expect(res.status).toBe(409);
    expect(server.inserted).toBeNull();
  });

  it("B's session + A's published invite → still 404 (ownership is checked before state, so state never leaks to a stranger)", async () => {
    server.invitesById[A_PUB] = {
      user_id: USER_A,
      config: completeConfig,
      status: "published",
    };
    const res = await POST(orderRequest(body, "token-b"));
    expect(res.status).toBe(404);
    expect(server.inserted).toBeNull();
  });
});
