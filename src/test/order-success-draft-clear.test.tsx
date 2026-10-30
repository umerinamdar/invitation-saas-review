import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Release Fix 3 (Agent A, D3), order-success half: clearDraft() had
// zero callers, so a completed draft stayed in the browser forever
// and the next /create visit resurrected an already-paid design.
// When — and only when — the verified order belongs to the invite
// row the local draft created AND that invite is verified published,
// the draft is cleared. The ?invite= account flow stores no draft id
// and must never lose an unrelated in-progress draft.
const hoisted = vi.hoisted(() => ({
  order: null as Record<string, unknown> | null,
  inviteStatus: "published" as string,
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
  useSearch: () => ({ order_id: "order-1" }),
}));

vi.mock("@/lib/orders-api", () => ({
  getOrderById: hoisted.getOrderById,
}));

vi.mock("@/lib/invites-api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/invites-api")>();
  return { ...actual, getInviteById: hoisted.getInviteById };
});

import { LocaleProvider } from "@/i18n/locale-context";
import { blankConfig } from "@/lib/invites-api";
import { readDraft, setDraftInviteId, writeDraft } from "@/lib/local-draft";
import { Route as OrderSuccessRoute } from "@/routes/order-success";

const OrderSuccess = (
  OrderSuccessRoute as unknown as { component: React.ComponentType }
).component;

function paidOrder(inviteId: string) {
  return {
    id: "order-1",
    user_id: "user-1",
    invite_id: inviteId,
    tier: "royal",
    amount_minor: 59900,
    currency: "INR",
    gateway: "razorpay",
    gateway_order_id: null,
    gateway_payment_id: "pay_123",
    status: "paid",
    created_at: "2026-10-22T00:00:00Z",
    paid_at: "2026-10-22T00:01:00Z",
  };
}

function seedDraft(inviteId: string) {
  localStorage.clear();
  writeDraft({ themeId: "kesari-mandap", config: blankConfig() });
  setDraftInviteId(inviteId);
}

describe("order-success clears the completed draft (Fix 3 / D3)", () => {
  beforeEach(() => {
    hoisted.getOrderById.mockReset();
    hoisted.getInviteById.mockReset();
    hoisted.inviteStatus = "published";
    hoisted.getInviteById.mockImplementation(async (id: string) => ({
      id,
      status: hoisted.inviteStatus,
    }));
  });

  it("verified published order for the draft's own invite clears the draft", async () => {
    seedDraft("11111111-1111-4111-8111-111111111111");
    hoisted.getOrderById.mockResolvedValue(
      paidOrder("11111111-1111-4111-8111-111111111111"),
    );
    render(
      <LocaleProvider>
        <OrderSuccess />
      </LocaleProvider>,
    );
    expect(await screen.findByText(/payment received/i)).toBeTruthy();
    expect(readDraft()).toBeNull();
  });

  it("a published order for a DIFFERENT invite leaves the draft alone", async () => {
    seedDraft("11111111-1111-4111-8111-111111111111");
    hoisted.getOrderById.mockResolvedValue(paidOrder("invite-9"));
    render(
      <LocaleProvider>
        <OrderSuccess />
      </LocaleProvider>,
    );
    expect(await screen.findByText(/payment received/i)).toBeTruthy();
    expect(readDraft()?.draftInviteId).toBe(
      "11111111-1111-4111-8111-111111111111",
    );
  });

  it("a paid order whose invite is not published yet does NOT clear the draft", async () => {
    seedDraft("11111111-1111-4111-8111-111111111111");
    hoisted.inviteStatus = "draft";
    hoisted.getOrderById.mockResolvedValue(
      paidOrder("11111111-1111-4111-8111-111111111111"),
    );
    render(
      <LocaleProvider>
        <OrderSuccess />
      </LocaleProvider>,
    );
    expect(
      await screen.findByRole("heading", { name: /confirming your payment/i }),
    ).toBeTruthy();
    expect(readDraft()?.draftInviteId).toBe(
      "11111111-1111-4111-8111-111111111111",
    );
  });
});
