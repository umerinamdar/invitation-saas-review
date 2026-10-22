import { describe, expect, it } from "vitest";

import { orderErrorMessage } from "@/lib/checkout-errors";

// Impl round 2 (Agent D, D-1): /api/orders answers with machine
// codes; the checkout used to throw them verbatim at the customer
// ("invite_already_paid"). Known codes map to plain language and
// anything unknown falls back to a generic message — a raw code
// must never render.
describe("orderErrorMessage (impl round 2, D-1)", () => {
  it("maps the known order codes to plain language", () => {
    expect(orderErrorMessage("invite_already_paid")).toMatch(
      /already been paid/i,
    );
    expect(orderErrorMessage("invite_not_publishable")).toMatch(
      /can't be published/i,
    );
    expect(orderErrorMessage("invitation_incomplete")).toMatch(
      /missing a few details/i,
    );
    expect(orderErrorMessage("duplicate_active_order")).toMatch(
      /already in progress/i,
    );
  });

  it("never echoes an unknown code back", () => {
    const message = orderErrorMessage("some_internal_code_42");
    expect(message).not.toContain("some_internal_code_42");
    expect(message).toMatch(/try again/i);
    expect(orderErrorMessage(undefined)).toMatch(/try again/i);
    expect(orderErrorMessage(null)).toMatch(/try again/i);
  });
});
