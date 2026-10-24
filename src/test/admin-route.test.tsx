import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// /admin route gates (admin dashboard v1, migration 0007). The route
// is owner-only and reached by direct URL — there is no nav link —
// so its three gate outcomes are the whole access story at the UI
// layer:
//   no session        → /login      (same as the dashboard)
//   session, not admin → /dashboard, SILENTLY (no copy confirming
//                        what /admin is for)
//   session, admin     → the overview renders, and the data calls
//                        happen only after the flag check passes
// Mock pattern follows order-success-unverified.test.tsx. The real
// security boundary is RLS (proven by admin-authz.test.ts's modelled
// policies and, live, by docs/ops/VERIFY-0007.sql) — these tests pin
// the route's behaviour, not the database's.
const hoisted = vi.hoisted(() => ({
  session: null as { user: { id: string; email: string } } | null,
  loading: false,
  navigate: vi.fn(async () => {}),
  isCurrentUserAdmin: vi.fn(),
  getAdminOverview: vi.fn(),
  listRecentOrders: vi.fn(),
  listRecentInvites: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  useAuth: () => ({ session: hoisted.session, loading: hoisted.loading }),
  useUser: () => hoisted.session?.user ?? null,
  signOut: vi.fn(async () => {}),
}));

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (opts: Record<string, unknown>) => opts,
  Link: ({
    to,
    children,
    ...rest
  }: {
    to: string;
    children?: React.ReactNode;
  }) => (
    <a href={to} {...rest}>
      {children}
    </a>
  ),
  useNavigate: () => hoisted.navigate,
}));

vi.mock("@/lib/admin-api", () => ({
  isCurrentUserAdmin: hoisted.isCurrentUserAdmin,
  getAdminOverview: hoisted.getAdminOverview,
  listRecentOrders: hoisted.listRecentOrders,
  listRecentInvites: hoisted.listRecentInvites,
}));

import { LocaleProvider } from "@/i18n/locale-context";
import { Route as AdminRoute } from "@/routes/admin";

const Admin = (AdminRoute as unknown as { component: React.ComponentType })
  .component;

function renderAdmin() {
  return render(
    <LocaleProvider>
      <Admin />
    </LocaleProvider>,
  );
}

describe("/admin route gates", () => {
  beforeEach(() => {
    hoisted.session = null;
    hoisted.loading = false;
    hoisted.navigate.mockReset();
    hoisted.navigate.mockImplementation(async () => {});
    hoisted.isCurrentUserAdmin.mockReset();
    hoisted.getAdminOverview.mockReset();
    hoisted.listRecentOrders.mockReset();
    hoisted.listRecentInvites.mockReset();
  });

  it("no session → redirects to /login, never checks the flag, renders nothing", async () => {
    renderAdmin();
    await waitFor(() =>
      expect(hoisted.navigate).toHaveBeenCalledWith({ to: "/login" }),
    );
    expect(hoisted.isCurrentUserAdmin).not.toHaveBeenCalled();
    expect(hoisted.getAdminOverview).not.toHaveBeenCalled();
    expect(screen.queryByText("Site overview")).toBeNull();
  });

  it("session but not admin → silent redirect to /dashboard, no data fetched, no explanation rendered", async () => {
    hoisted.session = {
      user: { id: "user-a", email: "aisha@example.com" },
    };
    hoisted.isCurrentUserAdmin.mockResolvedValue(false);
    renderAdmin();
    await waitFor(() =>
      expect(hoisted.navigate).toHaveBeenCalledWith({ to: "/dashboard" }),
    );
    // The bounce is silent: nothing on screen names the route's
    // purpose, and the aggregate/list calls never fire.
    expect(hoisted.getAdminOverview).not.toHaveBeenCalled();
    expect(hoisted.listRecentOrders).not.toHaveBeenCalled();
    expect(hoisted.listRecentInvites).not.toHaveBeenCalled();
    expect(screen.queryByText("Site overview")).toBeNull();
    expect(screen.queryByText(/not an admin/i)).toBeNull();
  });

  it("session and admin → overview renders with revenue, counts and recent rows", async () => {
    hoisted.session = {
      user: { id: "admin-owner", email: "owner@example.com" },
    };
    hoisted.isCurrentUserAdmin.mockResolvedValue(true);
    hoisted.getAdminOverview.mockResolvedValue({
      totalRevenuePaise: 119800,
      ordersByStatus: { created: 1, paid: 2, failed: 1, refunded: 0 },
      totalInvites: 3,
      totalUsers: 3,
    });
    hoisted.listRecentOrders.mockResolvedValue([
      {
        id: "order-b-paid",
        user_id: "user-b",
        invite_id: "invite-b-draft",
        amount_minor: 59900,
        currency: "INR",
        status: "paid",
        created_at: "2026-02-04T09:00:00Z",
        paid_at: "2026-02-04T09:01:00Z",
      },
    ]);
    hoisted.listRecentInvites.mockResolvedValue([
      {
        id: "invite-a-pub",
        user_id: "user-a",
        slug: "aisha-rohan-live",
        theme_id: "dubai-silk",
        status: "published",
        created_at: "2026-02-03T10:00:00Z",
      },
    ]);
    renderAdmin();

    expect(await screen.findByText("Site overview")).toBeTruthy();
    // Revenue is paise in the API and ₹ on screen: 119800 → ₹1,198.
    expect(await screen.findByText("₹1,198")).toBeTruthy();
    expect(screen.getByText(/2 paid/)).toBeTruthy();
    // Recent rows from BOTH fixture users render.
    expect(screen.getByText("aisha-rohan-live")).toBeTruthy();
    expect(screen.getByText("₹599")).toBeTruthy();
    // No bounce happened on the way in.
    expect(hoisted.navigate).not.toHaveBeenCalledWith({
      to: "/dashboard",
    });
    expect(hoisted.navigate).not.toHaveBeenCalledWith({ to: "/login" });
  });
});
