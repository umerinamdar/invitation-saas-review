import { describe, expect, it } from "vitest";
import { applySecurityHeaders, SECURITY_HEADERS } from "@/lib/security-headers";

// Wave 4 / Stage D: the custom server entry (src/server.ts) applies
// these headers to every response. The CSP is report-only by design —
// the YouPI checkout script, Google Fonts and inline theme styles
// would break under an enforcing policy (see lib/security-headers).
describe("security headers", () => {
  it("defines the conservative header set", () => {
    expect(SECURITY_HEADERS["x-content-type-options"]).toBe("nosniff");
    expect(SECURITY_HEADERS["referrer-policy"]).toBe(
      "strict-origin-when-cross-origin",
    );
    expect(SECURITY_HEADERS["x-frame-options"]).toBe("SAMEORIGIN");
    expect(SECURITY_HEADERS["permissions-policy"]).toContain("camera=()");
    expect(SECURITY_HEADERS["permissions-policy"]).toContain("microphone=()");
    expect(SECURITY_HEADERS["permissions-policy"]).toContain("geolocation=()");
  });

  it("ships CSP as report-only, never enforcing", () => {
    expect(SECURITY_HEADERS["content-security-policy"]).toBeUndefined();
    expect(SECURITY_HEADERS["content-security-policy-report-only"]).toContain(
      "default-src 'self'",
    );
    expect(SECURITY_HEADERS["content-security-policy-report-only"]).toContain(
      "frame-ancestors 'self'",
    );
  });

  it("applies headers while preserving status and body", async () => {
    const original = new Response("<h1>ok</h1>", {
      status: 201,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
    const secured = applySecurityHeaders(original);
    expect(secured.status).toBe(201);
    expect(secured.headers.get("content-type")).toBe(
      "text/html; charset=utf-8",
    );
    expect(secured.headers.get("x-content-type-options")).toBe("nosniff");
    expect(secured.headers.get("x-frame-options")).toBe("SAMEORIGIN");
    await expect(secured.text()).resolves.toBe("<h1>ok</h1>");
  });

  it("does not overwrite a header the response already carries", () => {
    const original = new Response("x", {
      headers: { "referrer-policy": "no-referrer" },
    });
    const secured = applySecurityHeaders(original);
    expect(secured.headers.get("referrer-policy")).toBe("no-referrer");
    expect(secured.headers.get("x-content-type-options")).toBe("nosniff");
  });
});
