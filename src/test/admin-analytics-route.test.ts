import { beforeEach, describe, expect, it, vi } from "vitest";

// Same shape as orders-auth.test.ts's supabase-server fake: auth.getUser
// accepts exactly one staged token, and a profiles.eq("id", ...).maybeSingle()
// serves a staged is_admin flag. This route has no RLS of its own to lean
// on (it calls Google, not the database) — the admin check IS the
// access boundary, so these tests pin exactly that check.
const mockState = vi.hoisted(() => ({
  user: null as { id: string } | null,
  isAdmin: false,
}));

vi.mock("@/lib/supabase-server", () => ({
  supabaseServer: {
    auth: {
      getUser: async (token: string) => {
        if (token === "valid-access-token" && mockState.user) {
          return { data: { user: mockState.user }, error: null };
        }
        return { data: { user: null }, error: { message: "Invalid token" } };
      },
    },
    from: (table: string) => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => {
            if (table !== "profiles") return { data: null, error: null };
            return {
              data: mockState.user ? { is_admin: mockState.isAdmin } : null,
              error: null,
            };
          },
        }),
      }),
    }),
  },
}));

const ga4 = vi.hoisted(() => ({
  result: { ok: false, reason: "not_configured" } as unknown,
}));

vi.mock("@/lib/ga4-server", () => ({
  getGa4VisitorStats: vi.fn(async () => ga4.result),
}));

import { GET } from "@/routes/api/admin/analytics";

function analyticsRequest(token?: string): Request {
  return new Request("http://localhost/api/admin/analytics", {
    method: "GET",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

beforeEach(() => {
  mockState.user = null;
  mockState.isAdmin = false;
  ga4.result = { ok: false, reason: "not_configured" };
});

describe("GET /api/admin/analytics", () => {
  it("rejects a request with no Authorization header with 401", async () => {
    const res = await GET(analyticsRequest());
    expect(res.status).toBe(401);
  });

  it("rejects an invalid access token with 401", async () => {
    const res = await GET(analyticsRequest("bad-token"));
    expect(res.status).toBe(401);
  });

  it("rejects a signed-in non-admin with 403", async () => {
    mockState.user = { id: "ordinary-user" };
    mockState.isAdmin = false;
    const res = await GET(analyticsRequest("valid-access-token"));
    expect(res.status).toBe(403);
  });

  it("returns the GA4 stats for an admin", async () => {
    mockState.user = { id: "admin-owner" };
    mockState.isAdmin = true;
    ga4.result = {
      ok: true,
      last7Days: { activeUsers: 10, pageViews: 25 },
      last30Days: { activeUsers: 80, pageViews: 200 },
    };
    const res = await GET(analyticsRequest("valid-access-token"));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(ga4.result);
  });

  it("passes through a GA4 failure as 200 with the typed reason (not an HTTP error)", async () => {
    mockState.user = { id: "admin-owner" };
    mockState.isAdmin = true;
    ga4.result = { ok: false, reason: "api_error" };
    const res = await GET(analyticsRequest("valid-access-token"));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: false, reason: "api_error" });
  });

  it("sends Cache-Control: no-store", async () => {
    mockState.user = { id: "admin-owner" };
    mockState.isAdmin = true;
    const res = await GET(analyticsRequest("valid-access-token"));
    expect(res.headers.get("cache-control")).toBe("no-store");
  });
});
