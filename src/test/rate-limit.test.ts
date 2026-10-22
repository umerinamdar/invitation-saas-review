import { describe, expect, it } from "vitest";

import { clientIpFromRequest, createRateLimiter } from "@/lib/rate-limit";

// Batch 2 / Task 5: the two API routes had no rate limiting at all.
// The limiter is a deliberately small fixed-window counter with an
// injectable clock (the `now` argument) so its window behaviour is
// testable deterministically — no fake timers, no wall-clock races.
//
// Honest scope (also stated in src/lib/rate-limit.ts): the counters
// live in one isolate's memory. On Cloudflare Workers that makes this
// a per-isolate BACKSTOP against naive floods and retry storms, not a
// complete production control — the real control is the owner's
// Cloudflare WAF rate-limiting rule. These tests pin the limiter's
// own arithmetic, nothing more.

const T0 = 1_760_000_000_000; // arbitrary fixed instant, ms since epoch

describe("createRateLimiter — fixed window", () => {
  it("allows requests under the limit", () => {
    const limiter = createRateLimiter({ limit: 3, windowMs: 60_000 });

    expect(limiter.check("ip-1", T0)).toEqual({
      allowed: true,
      retryAfterSeconds: 0,
    });
    expect(limiter.check("ip-1", T0 + 1_000).allowed).toBe(true);
    expect(limiter.check("ip-1", T0 + 2_000).allowed).toBe(true);
  });

  it("blocks the first request over the limit, with a sane Retry-After", () => {
    const limiter = createRateLimiter({ limit: 3, windowMs: 60_000 });

    limiter.check("ip-1", T0);
    limiter.check("ip-1", T0);
    limiter.check("ip-1", T0);

    // 4th request, 3 s into a 60 s window: 57 s remain in the window.
    const blocked = limiter.check("ip-1", T0 + 3_000);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBe(57);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
    expect(blocked.retryAfterSeconds).toBeLessThanOrEqual(60);
  });

  it("does not extend the window when a request is blocked", () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 60_000 });

    expect(limiter.check("ip-1", T0).allowed).toBe(true);
    // Blocked attempts must not push the window out (fixed window):
    // at +30 s the remaining time is still measured from T0.
    expect(limiter.check("ip-1", T0 + 30_000)).toEqual({
      allowed: false,
      retryAfterSeconds: 30,
    });
    expect(limiter.check("ip-1", T0 + 59_000).allowed).toBe(false);
  });

  it("resets the count when the window rolls over", () => {
    const limiter = createRateLimiter({ limit: 2, windowMs: 60_000 });

    limiter.check("ip-1", T0);
    limiter.check("ip-1", T0);
    expect(limiter.check("ip-1", T0).allowed).toBe(false);

    // Exactly at the boundary a fresh window starts, with a full quota.
    expect(limiter.check("ip-1", T0 + 60_000).allowed).toBe(true);
    expect(limiter.check("ip-1", T0 + 60_000).allowed).toBe(true);
    expect(limiter.check("ip-1", T0 + 60_000).allowed).toBe(false);
  });

  it("tracks different keys independently", () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 60_000 });

    expect(limiter.check("ip-1", T0).allowed).toBe(true);
    expect(limiter.check("ip-1", T0).allowed).toBe(false);
    // A different key has its own untouched quota at the same instant.
    expect(limiter.check("ip-2", T0).allowed).toBe(true);
  });

  it("evicts expired entries so the map cannot grow without bound", () => {
    const limiter = createRateLimiter({ limit: 5, windowMs: 1_000 });

    for (let i = 0; i < 50; i++) {
      limiter.check(`ip-${i}`, T0);
    }
    expect(limiter.size()).toBe(50);

    // Once every entry is stale, the next new-window check sweeps them:
    // only the fresh key remains.
    expect(limiter.check("ip-new", T0 + 1_000).allowed).toBe(true);
    expect(limiter.size()).toBe(1);
  });

  it("does not evict entries whose window is still active", () => {
    const limiter = createRateLimiter({ limit: 5, windowMs: 60_000 });

    limiter.check("ip-1", T0);
    limiter.check("ip-2", T0);
    limiter.check("ip-3", T0 + 1_000);
    expect(limiter.size()).toBe(3);
  });

  it("uses the wall clock when no instant is injected", () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 60_000 });
    expect(limiter.check("ip-1").allowed).toBe(true);
  });
});

describe("clientIpFromRequest", () => {
  function requestWith(headers: Record<string, string>) {
    return new Request("http://localhost/api/orders", { headers });
  }

  it("prefers cf-connecting-ip, which the Cloudflare edge sets", () => {
    const request = requestWith({
      "cf-connecting-ip": "203.0.113.7",
      "x-forwarded-for": "198.51.100.9",
    });
    expect(clientIpFromRequest(request)).toBe("203.0.113.7");
  });

  it("falls back to the first x-forwarded-for entry", () => {
    const request = requestWith({
      "x-forwarded-for": "198.51.100.9, 10.0.0.1",
    });
    expect(clientIpFromRequest(request)).toBe("198.51.100.9");
  });

  it("returns 'unknown' when no IP header is present", () => {
    expect(clientIpFromRequest(requestWith({}))).toBe("unknown");
  });
});
