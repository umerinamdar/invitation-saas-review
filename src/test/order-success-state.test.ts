import { describe, expect, it } from "vitest";

import { orderSuccessState } from "@/routes/order-success";
import type { OrderRow } from "@/lib/orders-api";

// Batch 2 / W1: /order-success used to claim "Payment received! Your
// invitation has been published" to anyone who opened the URL. The
// page may only claim that when the order is actually paid AND the
// invite is actually published; every other case is neutral or failed.

function order(status: OrderRow["status"]): OrderRow {
  return {
    id: "order-1",
    user_id: "user-1",
    invite_id: "invite-1",
    tier: "royal",
    amount_minor: 59900,
    currency: "INR",
    gateway: "razorpay",
    gateway_order_id: null,
    gateway_payment_id: null,
    status,
    created_at: "2026-10-21T00:00:00Z",
    paid_at: null,
  };
}

describe("orderSuccessState", () => {
  it("never verifies a missing or placeholder order id", () => {
    expect(orderSuccessState(undefined, null, null)).toBe("unverified");
    expect(orderSuccessState("", null, null)).toBe("unverified");
    expect(orderSuccessState("success", null, null)).toBe("unverified");
  });

  it("stays neutral when the order cannot be found", () => {
    expect(orderSuccessState("order-1", null, null)).toBe("unverified");
  });

  it("claims published only when the order is paid AND the invite is published", () => {
    expect(orderSuccessState("order-1", order("paid"), "published")).toBe("published");
  });

  it("stays neutral while a paid order's invite is not published yet", () => {
    expect(orderSuccessState("order-1", order("paid"), "draft")).toBe("pending");
    expect(orderSuccessState("order-1", order("paid"), null)).toBe("pending");
  });

  it("stays neutral for an unpaid order and reports a failed one", () => {
    expect(orderSuccessState("order-1", order("created"), "draft")).toBe("pending");
    expect(orderSuccessState("order-1", order("failed"), "draft")).toBe("failed");
  });
});
