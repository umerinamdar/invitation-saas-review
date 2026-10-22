import { describe, expect, it } from "vitest";
import {
  applyCacheHeaders,
  cacheControlForPath,
  PUBLIC_PAGE_CACHE_CONTROL,
  PRIVATE_PAGE_CACHE_CONTROL,
} from "@/lib/cache-headers";

// Consolidation fix (CACHE-2 / CACHE-3): before this module, page HTML
// carried no Cache-Control at all — public pages could not be cached
// by any shared cache, and authenticated pages had no explicit
// no-store protection. The server entry (src/server.ts) applies these
// rules to HTML responses; static assets never pass through it, and
// routes that set their own Cache-Control (sitemap, /api/health) are
// never overwritten.
describe("cacheControlForPath", () => {
  it("gives public pages a short shared-cache lifetime", () => {
    expect(cacheControlForPath("/")).toBe(PUBLIC_PAGE_CACHE_CONTROL);
    expect(cacheControlForPath("/templates")).toBe(PUBLIC_PAGE_CACHE_CONTROL);
    expect(cacheControlForPath("/preview/dubai-silk")).toBe(
      PUBLIC_PAGE_CACHE_CONTROL,
    );
    expect(cacheControlForPath("/terms")).toBe(PUBLIC_PAGE_CACHE_CONTROL);
    expect(cacheControlForPath("/privacy")).toBe(PUBLIC_PAGE_CACHE_CONTROL);
    expect(cacheControlForPath("/refund")).toBe(PUBLIC_PAGE_CACHE_CONTROL);
    expect(cacheControlForPath("/contact")).toBe(PUBLIC_PAGE_CACHE_CONTROL);
  });

  it("keeps guest invitation pages out of every cache (signed media URLs)", () => {
    // /i/<slug> HTML embeds per-request signed media URLs minted for
    // that response (Gap-B, 1h TTL). A shared cache serving one
    // response to later guests would hand out ageing URLs and freeze
    // the page at first-render state — no-store, not a short TTL.
    expect(cacheControlForPath("/i/umer-and-maimoona")).toBe(
      PRIVATE_PAGE_CACHE_CONTROL,
    );
  });

  it("marks authenticated and transactional pages private, no-store", () => {
    for (const path of [
      "/dashboard",
      "/editor/abc-123",
      "/create",
      "/login",
      "/order-success",
      "/order-failed",
      "/publish",
      "/publish/abc-123",
    ]) {
      expect(cacheControlForPath(path)).toBe(PRIVATE_PAGE_CACHE_CONTROL);
    }
  });

  it("leaves API routes and self-managed routes alone", () => {
    expect(cacheControlForPath("/api/orders")).toBeNull();
    expect(cacheControlForPath("/api/webhooks/youpi")).toBeNull();
    // /api/health sets its own no-store; the sitemap sets its own TTL.
    expect(cacheControlForPath("/api/health")).toBeNull();
    expect(cacheControlForPath("/sitemap.xml")).toBeNull();
  });

  it("returns null for unknown paths instead of guessing", () => {
    expect(cacheControlForPath("/no-such-page")).toBeNull();
  });
});

describe("applyCacheHeaders", () => {
  const html = (body = "<h1>ok</h1>", headers: Record<string, string> = {}) =>
    new Response(body, {
      status: 200,
      headers: { "content-type": "text/html; charset=utf-8", ...headers },
    });
  const get = (path: string) => new Request(`https://example.test${path}`);

  it("applies the rule for the request path and preserves the body", async () => {
    const res = applyCacheHeaders(html(), get("/templates"));
    expect(res.headers.get("cache-control")).toBe(PUBLIC_PAGE_CACHE_CONTROL);
    await expect(res.text()).resolves.toBe("<h1>ok</h1>");
  });

  it("never overwrites a Cache-Control the response already carries", () => {
    const res = applyCacheHeaders(
      html("<x/>", { "cache-control": "public, max-age=3600" }),
      get("/"),
    );
    expect(res.headers.get("cache-control")).toBe("public, max-age=3600");
  });

  it("does not touch non-HTML responses (API JSON, downloads)", () => {
    const res = applyCacheHeaders(
      new Response("{}", {
        headers: { "content-type": "application/json" },
      }),
      get("/dashboard"),
    );
    expect(res.headers.get("cache-control")).toBeNull();
  });

  it("does not touch non-GET requests", () => {
    const res = applyCacheHeaders(
      html(),
      new Request("https://example.test/dashboard", { method: "POST" }),
    );
    expect(res.headers.get("cache-control")).toBeNull();
  });

  it("does not cache redirects", () => {
    const res = applyCacheHeaders(
      new Response(null, {
        status: 302,
        headers: { location: "/login", "content-type": "text/html" },
      }),
      get("/dashboard"),
    );
    expect(res.headers.get("cache-control")).toBeNull();
  });
});
