import { beforeEach, describe, expect, it, vi } from "vitest";

// Stage B (auth/ownership audit) pinned the QUERY CONSTRUCTION of the
// browser data-access layer (invites-api / orders-api) with the Supabase
// client stubbed at the module boundary — the same pattern as
// orders-auth.test.ts. These tests cannot prove what the live database
// does; they pin what the CODE asks for, which is the part a regression
// could silently change.
//
// DB-2 update (Stage B hardening): the owner-surface functions
// (listInvites, getInviteById, saveInvite, deleteInvite) now carry an
// explicit code-level user predicate as a backstop behind RLS — the
// session user comes from supabase.auth.getUser() inside the data
// layer, every owner query filters on it, and the functions fail
// closed (empty list / null / throw) when there is no session user
// instead of issuing an unscoped query. getPublishedBySlug stays
// public and published-only: it must keep its in-code
// status='published' filter and must NOT gain a user predicate (it is
// the anonymous guest path).

const recorded = vi.hoisted(() => ({
  calls: [] as Array<{ method: string; args: unknown[] }>,
  row: null as Record<string, unknown> | null,
  userId: "owner-1" as string | null,
  getUserCalls: 0,
}));

vi.mock("@/lib/supabase", () => {
  function makeChain() {
    const chain: Record<string, unknown> = {};
    const rec =
      (name: string) =>
      (...args: unknown[]) => {
        recorded.calls.push({ method: name, args });
        return chain;
      };
    chain["select"] = rec("select");
    chain["eq"] = rec("eq");
    chain["order"] = rec("order");
    chain["insert"] = rec("insert");
    chain["update"] = rec("update");
    chain["delete"] = rec("delete");
    chain["single"] = async () => ({ data: recorded.row, error: null });
    chain["maybeSingle"] = async () => ({ data: recorded.row, error: null });
    // list*/delete functions await the builder itself (PostgREST
    // builders are thenable), so the fake chain resolves like one.
    chain["then"] = (
      resolve: (value: unknown) => unknown,
      reject?: (reason: unknown) => unknown,
    ) =>
      Promise.resolve({
        data: recorded.row ? [recorded.row] : [],
        error: null,
      }).then(resolve, reject);
    return chain;
  }
  return {
    supabase: {
      from: (table: string) => {
        recorded.calls.push({ method: "from", args: [table] });
        return makeChain();
      },
      auth: {
        getUser: async () => {
          recorded.getUserCalls += 1;
          return {
            data: {
              user: recorded.userId ? { id: recorded.userId } : null,
            },
            error: null,
          };
        },
      },
    },
  };
});

import {
  blankConfig,
  deleteInvite,
  getInviteById,
  getPublishedBySlug,
  listInvites,
  saveInvite,
} from "@/lib/invites-api";
import { getOrderById } from "@/lib/orders-api";

function eqFilters(): unknown[][] {
  return recorded.calls
    .filter((call) => call.method === "eq")
    .map((call) => call.args);
}

function tables(): unknown[] {
  return recorded.calls
    .filter((call) => call.method === "from")
    .map((call) => call.args[0]);
}

beforeEach(() => {
  recorded.calls = [];
  recorded.row = { id: "row-1", user_id: "owner-1", status: "draft" };
  recorded.userId = "owner-1";
  recorded.getUserCalls = 0;
});

describe("browser data-access scoping (Stage B, DB-2 hardened)", () => {
  it("getPublishedBySlug filters on slug AND status='published' in code", async () => {
    recorded.row = { id: "row-1", status: "published" };
    await getPublishedBySlug("aisha-omar-x1y2");
    expect(tables()).toEqual(["invites"]);
    expect(eqFilters()).toContainEqual(["slug", "aisha-omar-x1y2"]);
    expect(eqFilters()).toContainEqual(["status", "published"]);
  });

  it("getPublishedBySlug stays public: no user predicate, no auth lookup", async () => {
    recorded.row = { id: "row-1", status: "published" };
    recorded.userId = null;
    await getPublishedBySlug("aisha-omar-x1y2");
    expect(eqFilters()).not.toContainEqual(["user_id", expect.anything()]);
    expect(recorded.getUserCalls).toBe(0);
  });

  it("listInvites scopes to the session user in code", async () => {
    await listInvites();
    expect(tables()).toEqual(["invites"]);
    expect(eqFilters()).toEqual([["user_id", "owner-1"]]);
  });

  it("listInvites fails closed with no session user: empty list, no query", async () => {
    recorded.userId = null;
    await expect(listInvites()).resolves.toEqual([]);
    expect(tables()).toEqual([]);
  });

  it("getInviteById filters by id AND session user", async () => {
    await getInviteById("invite-9");
    expect(tables()).toEqual(["invites"]);
    expect(eqFilters()).toEqual([
      ["id", "invite-9"],
      ["user_id", "owner-1"],
    ]);
  });

  it("getInviteById fails closed with no session user: null, no query", async () => {
    recorded.userId = null;
    await expect(getInviteById("invite-9")).resolves.toBeNull();
    expect(tables()).toEqual([]);
  });

  it("saveInvite updates by id AND session user", async () => {
    await saveInvite("invite-9", { theme_id: "dubai-silk" });
    expect(tables()).toEqual(["invites"]);
    expect(recorded.calls.some((call) => call.method === "update")).toBe(true);
    expect(eqFilters()).toEqual([
      ["id", "invite-9"],
      ["user_id", "owner-1"],
    ]);
  });

  it("saveInvite with a CLEARED date writes event_date = null (impl round 2, C-8)", async () => {
    const config = blankConfig(); // startIso is "" — the cleared state
    await saveInvite("invite-9", { config });
    const updateCall = recorded.calls.find((call) => call.method === "update");
    expect(updateCall).toBeTruthy();
    const payload = updateCall!.args[0] as Record<string, unknown>;
    expect(payload).toHaveProperty("event_date", null);
  });

  it("saveInvite with a set date writes that instant as event_date (C-8)", async () => {
    const config = blankConfig();
    config.event.startIso = "2027-02-12T10:00:00+05:30";
    await saveInvite("invite-9", { config });
    const updateCall = recorded.calls.find((call) => call.method === "update");
    const payload = updateCall!.args[0] as Record<string, unknown>;
    expect(payload).toHaveProperty("event_date", "2027-02-12T10:00:00+05:30");
  });

  it("saveInvite refuses with no session user: throws, no query", async () => {
    recorded.userId = null;
    await expect(
      saveInvite("invite-9", { theme_id: "dubai-silk" }),
    ).rejects.toThrow();
    expect(tables()).toEqual([]);
  });

  it("deleteInvite deletes by id AND session user", async () => {
    await deleteInvite("invite-9");
    expect(tables()).toEqual(["invites"]);
    expect(recorded.calls.some((call) => call.method === "delete")).toBe(true);
    expect(eqFilters()).toEqual([
      ["id", "invite-9"],
      ["user_id", "owner-1"],
    ]);
  });

  it("deleteInvite refuses with no session user: throws, no query", async () => {
    recorded.userId = null;
    await expect(deleteInvite("invite-9")).rejects.toThrow();
    expect(tables()).toEqual([]);
  });

  it("browser getOrderById filters by id only, no ownership predicate (RLS-dependent)", async () => {
    await getOrderById("order-9");
    expect(tables()).toEqual(["orders"]);
    expect(eqFilters()).toEqual([["id", "order-9"]]);
  });
});
