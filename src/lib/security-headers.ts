/**
 * Conservative security headers for every response, applied by the
 * custom server entry (src/server.ts) — the one place that sees all
 * responses (pages, API routes, error pages) on the Cloudflare
 * Workers runtime. There is no _headers file or Nitro routeRules in
 * this stack, so the server entry is the mechanism that actually
 * ships.
 *
 * Deliberately NOT an enforcing Content-Security-Policy: the app
 * loads the YouPI checkout script from the gateway's origin, Google
 * Fonts stylesheets, and per-theme inline styles, so a strict CSP
 * would break checkout and theming. The CSP below is Report-Only —
 * browsers log violations but never block — so it documents the
 * intended policy without risking the payment flow. Tightening it
 * (and adding a report endpoint) is an owner decision.
 *
 * X-Frame-Options is SAMEORIGIN: nothing in the app embeds an
 * external iframe or is designed to be framed by third parties.
 */
export const SECURITY_HEADERS: Record<string, string> = {
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin",
  "x-frame-options": "SAMEORIGIN",
  "permissions-policy": "camera=(), microphone=(), geolocation=()",
  "content-security-policy-report-only":
    "default-src 'self'; script-src 'self' 'unsafe-inline' https:; " +
    "style-src 'self' 'unsafe-inline' https:; " +
    "img-src 'self' data: blob: https:; media-src 'self' blob: https:; " +
    "font-src 'self' data: https:; connect-src 'self' https:; " +
    "frame-ancestors 'self'",
};

/**
 * Return a copy of `response` with the security headers set. Existing
 * headers are preserved; a header the response already carries is not
 * overwritten. Status, status text and body pass through untouched.
 */
export function applySecurityHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    if (!headers.has(name)) headers.set(name, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
