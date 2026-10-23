import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Audit fix C-1: /order-success visited with no order behind it (a
// bookmark, a revisit, a shared link) used to sit on "We're confirming
// your payment…" forever — the honest "unverified" state existed in
// orderSuccessState() but had no render branch, so it fell into the
// confirming UI and never attempted a lookup. It now gets a neutral
// no-order state. The mock pattern follows
// order-success-draft-clear.test.tsx.
const hoisted = vi.hoisted(() => ({
  search: {} as Record<string, unknown>,
  getOrderById: vi.fn(),
  getInviteById: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  useAuth: () => ({ session: null, loading: false }),
  useUser: () => null,
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
  useNavigate: () => vi.fn(async () => {}),
  useSearch: () => hoisted.search,
}));

vi.mock("@/lib/orders-api", () => ({
  getOrderById: hoisted.getOrderById,
}));

vi.mock("@/lib/invites-api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/invites-api")>();
  return { ...actual, getInviteById: hoisted.getInviteById };
});

import { LocaleProvider } from "@/i18n/locale-context";
import { Route as OrderSuccessRoute } from "@/routes/order-success";

const OrderSuccess = (
  OrderSuccessRoute as unknown as { component: React.ComponentType }
).component;

describe("order-success with no order to verify (audit C-1)", () => {
  beforeEach(() => {
    hoisted.getOrderById.mockReset();
    hoisted.getInviteById.mockReset();
    hoisted.search = {};
  });

  it("no order_id → neutral state, no confirming copy, no lookup attempted", async () => {
    render(
      <LocaleProvider>
        <OrderSuccess />
      </LocaleProvider>,
    );
    expect(await screen.findByText(/no payment to confirm here/i)).toBeTruthy();
    expect(screen.queryByText(/we're confirming your payment/i)).toBeNull();
    expect(hoisted.getOrderById).not.toHaveBeenCalled();
  });

  it("the old placeholder order_id → same neutral state, still no lookup", async () => {
    hoisted.search = { order_id: "success" };
    render(
      <LocaleProvider>
        <OrderSuccess />
      </LocaleProvider>,
    );
    expect(await screen.findByText(/no payment to confirm here/i)).toBeTruthy();
    expect(screen.queryByText(/we're confirming your payment/i)).toBeNull();
    expect(hoisted.getOrderById).not.toHaveBeenCalled();
  });
});
