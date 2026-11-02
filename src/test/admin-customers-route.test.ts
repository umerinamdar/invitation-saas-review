import { beforeEach, describe, expect, it, vi } from "vitest";

// Same fake shape as admin-analytics-route.test.ts (both routes now
// share requireAdmin from @/lib/admin-auth-server, which imports
// supabase-server — mocking that module here covers both call sites).
const mockState = vi.hoisted(() => ({
  user: null as { id: string } | null,
  isAdmin: false,
  users: [] as { id: string; email?: string | null }[],
  listUsersError: null as unknown,
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
      admin: {
        listUsers: async () => {
          if (mockState.listUsersError) {
            return { data: null, error: mockState.listUsersError };
          }
          return { data: { users: mockState.users }, error: null };
        },
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

import { GET } from "@/routes/api/admin/customers";

function customersRequest(token?: string): Request {
  return new Request("http://localhost/api/admin/customers", {
    method: "GET",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

beforeEach(() => {
  mockState.user = null;
  mockState.isAdmin = false;
  mockState.users = [];
  mockState.listUsersError = null;
});

describe("GET /api/admin/customers", () => {
  it("rejects a request with no Authorization header with 401", async () => {
    const res = await GET(customersRequest());
    expect(res.status).toBe(401);
  });

  it("rejects an invalid access token with 401", async () => {
    const res = await GET(customersRequest("bad-token"));
    expect(res.status).toBe(401);
  });

  it("rejects a signed-in non-admin with 403", async () => {
    mockState.user = { id: "ordinary-user" };
    mockState.isAdmin = false;
    const res = await GET(customersRequest("valid-access-token"));
    expect(res.status).toBe(403);
  });

  it("returns id/email pairs for an admin, dropping users with no email", async () => {
    mockState.user = { id: "admin-owner" };
    mockState.isAdmin = true;
    mockState.users = [
      { id: "user-1", email: "aisha@example.com" },
      { id: "user-2", email: null },
      { id: "user-3", email: "bilal@example.com" },
    ];
    const res = await GET(customersRequest("valid-access-token"));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([
      { id: "user-1", email: "aisha@example.com" },
      { id: "user-3", email: "bilal@example.com" },
    ]);
  });

  it("returns 500 without leaking details when the admin user list fails", async () => {
    mockState.user = { id: "admin-owner" };
    mockState.isAdmin = true;
    mockState.listUsersError = { message: "db-internal-detail-xyz" };
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      const res = await GET(customersRequest("valid-access-token"));
      expect(res.status).toBe(500);
      const body = (await res.json()) as { error: string };
      expect(body.error).toBe("Failed to load customers");
      expect(JSON.stringify(errorSpy.mock.calls)).not.toContain(
        "db-internal-detail-xyz",
      );
    } finally {
      errorSpy.mockRestore();
    }
  });

  it("sends Cache-Control: no-store on success", async () => {
    mockState.user = { id: "admin-owner" };
    mockState.isAdmin = true;
    const res = await GET(customersRequest("valid-access-token"));
    expect(res.headers.get("cache-control")).toBe("no-store");
  });
});
