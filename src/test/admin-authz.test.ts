import { beforeEach, describe, expect, it, vi } from "vitest";

// Admin authorization pack (migration 0007, admin dashboard v1) —
// the admin sibling of authz-two-user.test.ts, same fake pattern.
//
//   user-a / user-b: ordinary customers (is_admin: false).
//   admin-owner:     the flagged owner account (is_admin: true).
//
// How the fake works — and what it does and does NOT prove:
// The browser Supabase client is stubbed at the module boundary, and
// the chain APPLIES the recorded eq() filters to fixture rows, the
// way PostgREST would. On top of the code's own filters the fake
// additionally models the POLICY SET a live database would enforce,
// because admin-api deliberately builds NO owner predicate (RLS is
// the boundary for this feature — see admin-api.ts):
//
//   profiles: row visible when id = session user            (0001
//             "own profile") OR the session user is flagged
//             admin (0007 "admin reads all profiles").
//   invites:  visible when user_id = session user           (0001
//             "own invites") OR status = 'published'        (0001
//             "published invites are public") OR admin      (0007).
//   orders:   visible when user_id = session user           (0001
//             "read own orders") OR admin                   (0007).
//
// "Session user is flagged admin" is resolved from the fixture
// profiles table, mirroring public.is_admin()'s own-row lookup.
//
// So these tests pin two things: the CODE's query shape (thin
// wrappers, explicit columns, no scoping predicate that would cap
// the admin view at the admin's own rows) and the MODELLED system
// outcome (admin sees everyone; non-admins see exactly what they
// saw before 0007). They do NOT prove the live database actually
// carries the policies, the is_admin() function, or — most
// importantly — the column-privilege lock that stops a user
// setting is_admin on their own row. No unit test can: there is no
// client write path to model. That proof is docs/ops/VERIFY-0007.sql
// (V2/V3), run by the owner against the real project.

type Row = Record<string, unknown>;

const USER_A = "user-a";
const USER_B = "user-b";
const ADMIN = "admin-owner";
const A_DRAFT = "invite-a-draft";
const A_PUB = "invite-a-pub";
const B_DRAFT = "invite-b-draft";
const A_CREATED = "order-a-created";
const A_PAID = "order-a-paid";
const B_PAID = "order-b-paid";
const B_FAILED = "order-b-failed";

// ---------------------------------------------------------------------
// Browser client fake (@/lib/supabase)
// ---------------------------------------------------------------------
const browser = vi.hoisted(() => ({
  sessionUserId: "user-a" as string | null,
  calls: [] as Array<{ method: string; args: unknown[] }>,
  profiles: [] as Row[],
  invites: [] as Row[],
  orders: [] as Row[],
}));

vi.mock("@/lib/supabase", () => {
  function sessionIsAdmin(): boolean {
    if (!browser.sessionUserId) return false;
    const own = browser.profiles.find(
      (row) => row["id"] === browser.sessionUserId,
    );
    return own?.["is_admin"] === true;
  }

  function policyVisible(table: string, row: Row): boolean {
    const me = browser.sessionUserId;
    if (!me) return false;
    if (sessionIsAdmin()) return true; // 0007 admin-read policies
    if (table === "profiles") return row["id"] === me;
    if (table === "orders") return row["user_id"] === me;
    // invites: own rows, plus anyone's published (both from 0001)
    return row["user_id"] === me || row["status"] === "published";
  }

  function makeChain(table: string) {
    const filters: Array<[string, unknown]> = [];
    let orderSpec: { col: string; ascending: boolean } | null = null;
    let limitN: number | null = null;
    let headCount = false;
    const chain: Record<string, unknown> = {};

    function baseRows(): Row[] {
      if (table === "profiles") return browser.profiles;
      if (table === "invites") return browser.invites;
      return browser.orders;
    }
    function matched(): Row[] {
      return baseRows().filter(
        (row) =>
          policyVisible(table, row) &&
          filters.every(([col, val]) => row[col] === val),
      );
    }
    function presented(): Row[] {
      let rows = matched();
      if (orderSpec) {
        const { col, ascending } = orderSpec;
        rows = [...rows].sort((a, b) => {
          const av = String(a[col]);
          const bv = String(b[col]);
          return ascending ? av.localeCompare(bv) : bv.localeCompare(av);
        });
      }
      if (limitN !== null) rows = rows.slice(0, limitN);
      return rows;
    }
    const noRowsError = {
      code: "PGRST116",
      message: "JSON object requested, multiple (or no) rows returned",
    };

    chain["select"] = (cols?: unknown, opts?: unknown) => {
      browser.calls.push({ method: "select", args: [cols, opts] });
      const options = opts as { count?: string; head?: boolean } | undefined;
      if (options?.head && options?.count === "exact") headCount = true;
      return chain;
    };
    chain["eq"] = (col: string, val: unknown) => {
      browser.calls.push({ method: "eq", args: [col, val] });
      filters.push([col, val]);
      return chain;
    };
    chain["order"] = (col: string, opts?: { ascending?: boolean }) => {
      browser.calls.push({ method: "order", args: [col, opts] });
      orderSpec = { col, ascending: opts?.ascending !== false };
      return chain;
    };
    chain["limit"] = (n: number) => {
      browser.calls.push({ method: "limit", args: [n] });
      limitN = n;
      return chain;
    };
    chain["single"] = async () => {
      const rows = presented();
      return rows.length === 1
        ? { data: rows[0], error: null }
        : { data: null, error: noRowsError };
    };
    chain["maybeSingle"] = async () => {
      const rows = presented();
      if (rows.length === 0) return { data: null, error: null };
      if (rows.length === 1) return { data: rows[0], error: null };
      return { data: null, error: noRowsError };
    };
    chain["then"] = (
      resolve: (value: unknown) => unknown,
      reject?: (reason: unknown) => unknown,
    ) => {
      if (headCount) {
        return Promise.resolve({
          data: null,
          count: matched().length,
          error: null,
        }).then(resolve, reject);
      }
      return Promise.resolve({ data: presented(), error: null }).then(
        resolve,
        reject,
      );
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
        getUser: async () => ({
          data: {
            user: browser.sessionUserId ? { id: browser.sessionUserId } : null,
          },
          error: null,
        }),
      },
    },
  };
});

import * as adminApi from "@/lib/admin-api";
import {
  getAdminOverview,
  isCurrentUserAdmin,
  listRecentInvites,
  listRecentOrders,
} from "@/lib/admin-api";

function seedFixtures() {
  browser.profiles = [
    { id: USER_A, full_name: "Aisha Kapoor", phone: null, is_admin: false },
    { id: USER_B, full_name: "Bilal Sheikh", phone: null, is_admin: false },
    { id: ADMIN, full_name: "Site Owner", phone: null, is_admin: true },
  ];
  // Insertion order deliberately differs from created_at order, so
  // the order-by in the wrappers is what sorts the results.
  browser.invites = [
    {
      id: A_PUB,
      user_id: USER_A,
      slug: "aisha-rohan-live",
      theme_id: "dubai-silk",
      status: "published",
      created_at: "2026-02-03T10:00:00Z",
    },
    {
      id: B_DRAFT,
      user_id: USER_B,
      slug: "bilal-sana-draft",
      theme_id: "madina",
      status: "draft",
      created_at: "2026-02-02T10:00:00Z",
    },
    {
      id: A_DRAFT,
      user_id: USER_A,
      slug: "aisha-rohan-draft",
      theme_id: "dubai-silk",
      status: "draft",
      created_at: "2026-02-01T10:00:00Z",
    },
  ];
  browser.orders = [
    {
      id: B_PAID,
      user_id: USER_B,
      invite_id: B_DRAFT,
      amount_minor: 59900,
      currency: "INR",
      status: "paid",
      created_at: "2026-02-04T09:00:00Z",
      paid_at: "2026-02-04T09:01:00Z",
    },
    {
      id: A_CREATED,
      user_id: USER_A,
      invite_id: A_PUB,
      amount_minor: 59900,
      currency: "INR",
      status: "created",
      created_at: "2026-02-05T09:00:00Z",
      paid_at: null,
    },
    {
      id: A_PAID,
      user_id: USER_A,
      invite_id: A_PUB,
      amount_minor: 59900,
      currency: "INR",
      status: "paid",
      created_at: "2026-02-03T09:00:00Z",
      paid_at: "2026-02-03T09:02:00Z",
    },
    {
      id: B_FAILED,
      user_id: USER_B,
      invite_id: B_DRAFT,
      amount_minor: 59900,
      currency: "INR",
      status: "failed",
      created_at: "2026-02-02T09:00:00Z",
      paid_at: null,
    },
  ];
}

function actAs(userId: string | null) {
  browser.sessionUserId = userId;
  browser.calls = [];
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

beforeEach(() => {
  seedFixtures();
  actAs(USER_A);
});

// =====================================================================
// The flag check itself
// =====================================================================
describe("admin authz — isCurrentUserAdmin", () => {
  it("is false for both ordinary customers", async () => {
    actAs(USER_A);
    await expect(isCurrentUserAdmin()).resolves.toBe(false);
    actAs(USER_B);
    await expect(isCurrentUserAdmin()).resolves.toBe(false);
  });

  it("is true for the flagged owner account", async () => {
    actAs(ADMIN);
    await expect(isCurrentUserAdmin()).resolves.toBe(true);
  });

  it("fails closed when signed out — false, and no table is queried", async () => {
    actAs(null);
    await expect(isCurrentUserAdmin()).resolves.toBe(false);
    expect(tablesHit()).toEqual([]);
  });

  it("reads only the caller's OWN profile row (the 0001 policy path)", async () => {
    actAs(USER_B);
    await isCurrentUserAdmin();
    expect(eqFilters()).toEqual([["id", USER_B]]);
  });
});

// =====================================================================
// Admin reads — the widening the feature exists for
// =====================================================================
describe("admin authz — admin sees across users (modelled 0007 policies)", () => {
  it("admin's listRecentOrders returns BOTH users' orders, newest first", async () => {
    actAs(ADMIN);
    const rows = await listRecentOrders();
    expect(rows.map((row) => row.id)).toEqual([
      A_CREATED,
      B_PAID,
      A_PAID,
      B_FAILED,
    ]);
  });

  it("admin's listRecentInvites returns BOTH users' invites, newest first", async () => {
    actAs(ADMIN);
    const rows = await listRecentInvites();
    expect(rows.map((row) => row.id)).toEqual([A_PUB, B_DRAFT, A_DRAFT]);
  });

  it("the recent lists honour the limit argument", async () => {
    actAs(ADMIN);
    const rows = await listRecentOrders(2);
    expect(rows.map((row) => row.id)).toEqual([A_CREATED, B_PAID]);
  });

  it("admin's overview totals span every user", async () => {
    actAs(ADMIN);
    const overview = await getAdminOverview();
    // Revenue: the two paid orders only (A_PAID + B_PAID), in paise.
    expect(overview.totalRevenuePaise).toBe(119800);
    expect(overview.ordersByStatus).toEqual({
      created: 1,
      paid: 2,
      failed: 1,
    });
    expect(overview.totalInvites).toBe(3);
    expect(overview.totalUsers).toBe(3);
  });

  it("the wrappers build NO user predicate — widening is RLS's job, not a missing filter", async () => {
    // If a future edit "defensively" adds .eq("user_id", ...) here
    // (the invites-api DB-2 habit), the admin view silently collapses
    // to the admin's own rows and the feature dies without any test
    // elsewhere noticing. Pin the deliberate absence.
    actAs(ADMIN);
    await listRecentOrders();
    await listRecentInvites();
    expect(eqFilters()).toEqual([]);
  });
});

// =====================================================================
// Non-admin reads — provably unchanged from before 0007
// =====================================================================
describe("admin authz — non-admin visibility is not widened", () => {
  it("user-a's listRecentOrders returns only user-a's orders", async () => {
    actAs(USER_A);
    const rows = await listRecentOrders();
    expect(rows.map((row) => row.id)).toEqual([A_CREATED, A_PAID]);
  });

  it("user-a's listRecentInvites returns only user-a's invites (B's draft stays invisible)", async () => {
    actAs(USER_A);
    const rows = await listRecentInvites();
    expect(rows.map((row) => row.id)).toEqual([A_PUB, A_DRAFT]);
  });

  it("user-b still sees A's PUBLISHED invite — pre-existing 0001 public read, unchanged", async () => {
    actAs(USER_B);
    const rows = await listRecentInvites();
    expect(rows.map((row) => row.id).sort()).toEqual([A_PUB, B_DRAFT].sort());
  });

  it("user-a's overview silently narrows to their own data (safe, not an error)", async () => {
    // This is the brief's degradation contract: called by a
    // non-admin, the aggregate functions return the caller's own
    // numbers — RLS filtered, nothing of B's included, no throw.
    // The /admin route never makes this call for a non-admin; this
    // leg proves the call would be harmless if it ever happened.
    actAs(USER_A);
    const overview = await getAdminOverview();
    expect(overview.totalRevenuePaise).toBe(59900);
    expect(overview.ordersByStatus).toEqual({ created: 1, paid: 1 });
    expect(overview.totalInvites).toBe(2);
    expect(overview.totalUsers).toBe(1);
  });
});

// =====================================================================
// Surface — read-only means read-only
// =====================================================================
describe("admin authz — the module exposes no write surface", () => {
  it("admin-api exports exactly the four read functions", () => {
    const surface = adminApi as unknown as Record<string, unknown>;
    expect(Object.keys(adminApi).sort()).toEqual([
      "getAdminOverview",
      "isCurrentUserAdmin",
      "listRecentInvites",
      "listRecentOrders",
    ]);
    expect(surface["setAdmin"]).toBeUndefined();
    expect(surface["updateProfile"]).toBeUndefined();
    expect(surface["deleteOrder"]).toBeUndefined();
  });
});
