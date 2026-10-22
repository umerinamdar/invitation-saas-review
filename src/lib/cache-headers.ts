/**
 * Cache-Control rules for HTML pages, applied by the custom server
 * entry (src/server.ts) next to the security headers.
 *
 * Why per-family rules (CACHE-HEADERS.md, CACHE-2 / CACHE-3):
 * - Public marketing/content pages are identical for every visitor, so
 *   a short shared-cache lifetime (60s + stale-while-revalidate) takes
 *   repeat and burst traffic off the worker without risking stale
 *   content for long. Nothing user-specific is rendered into them.
 * - Guest invitation pages (/i/<slug>) embed per-request signed media
 *   URLs minted for that response (Gap-B: 1-hour TTL, tied to the
 *   invite). A shared cache replaying one guest's response to later
 *   guests would serve ageing signed URLs and a frozen page, so these
 *   are `private, no-store` — the deliberate exception to "public
 *   content should be cacheable".
 * - Authenticated and transactional pages (dashboard, editor, create,
 *   login, publish, order outcomes) are `private, no-store` as
 *   defence-in-depth: today their SSR shells carry no user data and
 *   sessions are bearer tokens in localStorage, but an explicit rule
 *   keeps a future "cache everything" edge rule or a session-model
 *   change from ever shared-caching them.
 *
 * Boundaries: API routes return null (POSTs are not cached anyway;
 * /api/health sets its own no-store), the sitemap sets its own TTL,
 * unknown paths return null rather than guessing, and a response that
 * already carries Cache-Control is never overwritten. Static assets
 * never pass through the server entry, so nothing here applies to
 * them — /assets/* caching lives in the generated _headers file, and
 * /themes/* + /demo/* + /audio/* lifetimes are an owner edge rule
 * (see CACHE-HEADERS.md CACHE-1).
 */
export const PUBLIC_PAGE_CACHE_CONTROL =
  "public, max-age=60, stale-while-revalidate=300";
export const PRIVATE_PAGE_CACHE_CONTROL = "private, no-store";

const PUBLIC_EXACT_PATHS = new Set([
  "/",
  "/templates",
  "/terms",
  "/privacy",
  "/refund",
  "/contact",
]);

const PUBLIC_PREFIXES = ["/preview/"];

const PRIVATE_EXACT_PATHS = new Set([
  "/dashboard",
  "/create",
  "/login",
  "/order-success",
  "/order-failed",
  "/publish",
]);

const PRIVATE_PREFIXES = ["/editor/", "/publish/", "/i/"];

/** The Cache-Control value for a page path, or null to leave it alone. */
export function cacheControlForPath(pathname: string): string | null {
  if (pathname.startsWith("/api/") || pathname === "/sitemap.xml") {
    return null;
  }
  if (
    PRIVATE_EXACT_PATHS.has(pathname) ||
    PRIVATE_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  ) {
    return PRIVATE_PAGE_CACHE_CONTROL;
  }
  if (
    PUBLIC_EXACT_PATHS.has(pathname) ||
    PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  ) {
    return PUBLIC_PAGE_CACHE_CONTROL;
  }
  return null;
}

/**
 * Return a copy of `response` with the Cache-Control rule for the
 * request's path applied. Only GET/HEAD HTML responses without an
 * existing Cache-Control are touched — redirects, API JSON and
 * downloads pass through unchanged, as do status and body.
 */
export function applyCacheHeaders(
  response: Response,
  request: Request,
): Response {
  if (request.method !== "GET" && request.method !== "HEAD") return response;
  if (response.status >= 300 && response.status < 400) return response;
  if (response.headers.has("cache-control")) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("text/html")) return response;

  const value = cacheControlForPath(new URL(request.url).pathname);
  if (!value) return response;

  const headers = new Headers(response.headers);
  headers.set("cache-control", value);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
