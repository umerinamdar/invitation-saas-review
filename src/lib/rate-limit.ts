/**
 * Minimal in-code rate limiting (Batch 2 / Task 5).
 *
 * A dependency-free fixed-window counter: each key gets `limit`
 * requests per `windowMs`; the first request over the limit is refused
 * with the number of seconds until its window rolls over (for the
 * `Retry-After` header). The clock is injectable (the `now` argument
 * to `check`) so the window arithmetic is unit-testable without fake
 * timers or wall-clock races.
 *
 * HONEST LIMITATION — read this before trusting the numbers: the
 * counters live in a `Map` inside ONE isolate's memory. Cloudflare
 * Workers isolates are ephemeral and numerous, with no shared memory:
 * a counter resets whenever its isolate is recycled, different
 * isolates serving the same route count independently, and traffic is
 * naturally spread across isolates and colos — so the effective
 * global limit is the per-isolate limit multiplied by an unknowable
 * number of isolates. This limiter is therefore a per-isolate
 * BACKSTOP: it blunts a naive flood that happens to stick to one
 * isolate and stops accidental client retry storms. It is NOT a
 * complete production control, and must never be described as "the
 * API is rate-limited" without that qualification. The real control
 * is the owner-configured Cloudflare WAF rate-limiting rule
 * (dashboard → Security → WAF → Rate limiting rules; shapes and tier
 * caveats in the Batch 2 handoff / plan-3 §4.3), which counts at the
 * edge before traffic fans out to isolates. A correct in-Worker
 * limiter would need shared state (KV / Durable Objects) and is
 * deliberately deferred — see plan-3 §4.5.
 */

export interface RateLimitResult {
  allowed: boolean;
  /** Seconds until the key's window resets; 0 when allowed. */
  retryAfterSeconds: number;
}

export interface RateLimiter {
  check: (key: string, now?: number) => RateLimitResult;
  /** Live bucket count — exposed so eviction is testable. */
  size: () => number;
}

interface Bucket {
  windowStart: number;
  count: number;
}

export function createRateLimiter(options: {
  limit: number;
  windowMs: number;
}): RateLimiter {
  const { limit, windowMs } = options;
  const buckets = new Map<string, Bucket>();

  // Drop every bucket whose window has fully elapsed. Called whenever
  // a check starts a fresh window, which bounds the map to keys seen
  // within roughly the current window instead of growing forever with
  // every distinct key ever presented.
  function pruneExpired(now: number) {
    for (const [key, bucket] of buckets) {
      if (now - bucket.windowStart >= windowMs) {
        buckets.delete(key);
      }
    }
  }

  return {
    check(key: string, now: number = Date.now()): RateLimitResult {
      const existing = buckets.get(key);

      if (!existing || now - existing.windowStart >= windowMs) {
        buckets.set(key, { windowStart: now, count: 1 });
        pruneExpired(now);
        return { allowed: true, retryAfterSeconds: 0 };
      }

      if (existing.count < limit) {
        existing.count += 1;
        return { allowed: true, retryAfterSeconds: 0 };
      }

      // Over the limit. Blocked requests do NOT consume quota or move
      // the window (fixed window): Retry-After is simply the time left
      // in the window the key is already in.
      return {
        allowed: false,
        retryAfterSeconds: Math.max(
          1,
          Math.ceil((existing.windowStart + windowMs - now) / 1000),
        ),
      };
    },

    size(): number {
      return buckets.size;
    },
  };
}

/**
 * Best-effort client IP for rate-limit keys. In the Cloudflare
 * runtime, `cf-connecting-ip` is set by the edge and is the value to
 * trust; `x-forwarded-for` (first hop) is only a fallback for local /
 * non-Cloudflare runs, where it is client-spoofable — acceptable here
 * because this limiter is a backstop (see the header) and the orders
 * route additionally keys on the verified session user id. When no
 * header is present every such caller shares the "unknown" bucket,
 * which fails safe (stricter, never looser).
 */
export function clientIpFromRequest(request: Request): string {
  const cfIp = request.headers.get("cf-connecting-ip")?.trim();
  if (cfIp) {
    return cfIp;
  }

  const firstForwarded = request.headers
    .get("x-forwarded-for")
    ?.split(",")[0]
    ?.trim();
  if (firstForwarded) {
    return firstForwarded;
  }

  return "unknown";
}
