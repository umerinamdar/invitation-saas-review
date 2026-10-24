/**
 * Public maintenance gate (owner decision, 2026-10-24): the site is not
 * ready for real visitors while development continues. When
 * MAINTENANCE_MODE is set, every request gets a simple "still building"
 * page instead of the real app — except a request carrying the bypass
 * token, which gets a cookie so the team can keep testing the real site
 * on the real domain throughout.
 *
 * Returns 503, not 200: a maintenance page is not the site's real
 * content. A crawler or uptime monitor should treat it as temporary,
 * never index it as the page, and `retry-after` says so explicitly.
 */

const BYPASS_COOKIE = "eim_preview";
const BYPASS_PARAM = "preview_token";

const MAINTENANCE_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex" />
<title>EasyInviteMaker — coming soon</title>
<style>
  body { margin:0; min-height:100vh; display:grid; place-items:center; font-family: system-ui, sans-serif; background:#f4ede1; color:#2a2420; text-align:center; padding:24px; }
  h1 { font-size:1.5rem; margin-bottom:8px; }
  p { color:#6b625a; }
</style>
</head>
<body>
  <div>
    <h1>We're still building this.</h1>
    <p>EasyInviteMaker will be back shortly — thanks for your patience.</p>
  </div>
</body>
</html>`;

function isEnabled(env: Record<string, string | undefined>): boolean {
  return (env["MAINTENANCE_MODE"] ?? "").trim() === "true";
}

function bypassToken(env: Record<string, string | undefined>): string {
  return (env["MAINTENANCE_BYPASS_TOKEN"] ?? "").trim();
}

function hasValidBypassCookie(request: Request, token: string): boolean {
  const cookie = request.headers.get("cookie") ?? "";
  return cookie
    .split(";")
    .map((pair) => pair.trim())
    .some((pair) => pair === `${BYPASS_COOKIE}=${token}`);
}

/**
 * Returns a maintenance Response if this request should see it, or
 * null if the real app should handle the request as usual — either
 * because maintenance mode is off, or because this request carries a
 * valid bypass (query param, on first visit, or the cookie it sets).
 */
export function maintenanceGate(
  request: Request,
  env: Record<string, string | undefined> = process.env,
): Response | null {
  if (!isEnabled(env)) return null;

  const token = bypassToken(env);
  const url = new URL(request.url);
  const queryToken = url.searchParams.get(BYPASS_PARAM);

  // A correct bypass link sets the cookie once, then redirects to the
  // same URL with the token stripped — so it never leaks into further
  // navigation, copied links, or referrer headers.
  if (token && queryToken === token) {
    url.searchParams.delete(BYPASS_PARAM);
    return new Response(null, {
      status: 302,
      headers: {
        location: url.toString(),
        "set-cookie": `${BYPASS_COOKIE}=${token}; Path=/; Max-Age=2592000; SameSite=Lax; Secure`,
      },
    });
  }

  if (token && hasValidBypassCookie(request, token)) return null;

  return new Response(MAINTENANCE_HTML, {
    status: 503,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "retry-after": "3600",
    },
  });
}
