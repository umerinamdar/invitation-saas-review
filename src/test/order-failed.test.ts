import { describe, expect, it } from "vitest";
import {
  ORDER_FAILED_DEFAULT_MESSAGE,
  reasonMessage,
} from "@/routes/order-failed";

// NF-6: /order-failed used to render the `reason` URL parameter verbatim,
// so anyone could craft a branded "payment failed" link displaying
// arbitrary text. reasonMessage must only ever return one of the fixed
// strings — the raw parameter must never reach the page.
describe("reasonMessage — /order-failed reason sanitization", () => {
  it("maps every known code to a fixed, non-default customer message", () => {
    for (const code of [
      "payment_failed",
      "payment_cancelled",
      "cancelled",
      "session_expired",
      "expired",
      "gateway_error",
      "verification_failed",
      "verification_timeout",
      "timeout",
    ]) {
      const message = reasonMessage(code);
      expect(message.length).toBeGreaterThan(0);
      expect(message).not.toBe(ORDER_FAILED_DEFAULT_MESSAGE);
    }
  });

  it("matches codes case-insensitively and ignores surrounding space", () => {
    expect(reasonMessage("PAYMENT_FAILED")).toBe(
      reasonMessage("payment_failed"),
    );
    expect(reasonMessage(" payment_failed ")).toBe(
      reasonMessage("payment_failed"),
    );
  });

  it("never echoes an unknown code — it falls back to the generic message", () => {
    const hostile = "<script>alert(1)</script>";
    expect(reasonMessage(hostile)).toBe(ORDER_FAILED_DEFAULT_MESSAGE);
    expect(reasonMessage(hostile)).not.toContain("script");
    expect(reasonMessage("You won a prize — send money to claim it")).toBe(
      ORDER_FAILED_DEFAULT_MESSAGE,
    );
    expect(reasonMessage("payment_failed_but_longer")).toBe(
      ORDER_FAILED_DEFAULT_MESSAGE,
    );
  });

  it("falls back to the generic message for absent codes", () => {
    expect(reasonMessage(undefined)).toBe(ORDER_FAILED_DEFAULT_MESSAGE);
    expect(reasonMessage(null)).toBe(ORDER_FAILED_DEFAULT_MESSAGE);
    expect(reasonMessage("")).toBe(ORDER_FAILED_DEFAULT_MESSAGE);
    expect(reasonMessage("   ")).toBe(ORDER_FAILED_DEFAULT_MESSAGE);
  });
});
