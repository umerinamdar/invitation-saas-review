/**
 * Startup configuration validation for server-only environment
 * variables (Round 2, master prompt §7.1).
 *
 * Before this module existed, a missing variable was discovered late:
 * `supabase-server.ts` throws at import time (surfacing as a per-request
 * 500), and the webhook/orders code reads its secrets per request and
 * fails closed per request. `serverEnvStatus()` gives the server entry
 * (src/server.ts) one central, startup-time answer to "what is missing"
 * so it can log a single loud line naming the missing variables.
 *
 * The result contains variable NAMES only — values are never copied
 * into the status object, so it is safe to log or return anywhere.
 *
 * Deliberate trade-off: this check does NOT throw. On Cloudflare
 * Workers a boot-time throw would take down every route — including
 * pages that never touch the missing variable — on every cold start;
 * the affected endpoints already fail closed per request. Loud log at
 * startup + fail-closed endpoints beats a full outage for a partial
 * misconfiguration.
 */

/**
 * Every server-side env var read in `src/` (grep-verified):
 * - VITE_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY: supabase-server.ts
 *   (module throws at import when either is absent).
 * - VITE_RAZORPAY_KEY_ID + RAZORPAY_KEY_SECRET: order creation + gateway
 *   payment lookup, Basic Auth (orders-server.ts, api/orders.ts). The
 *   key id is VITE_-prefixed and read server-side too — the same
 *   dual-purpose pattern as VITE_SUPABASE_URL: it is also baked into
 *   the browser bundle for Checkout.js, and it is the PUBLIC half of
 *   the key pair, safe to expose.
 * - RAZORPAY_WEBHOOK_SECRET: webhook signature verification
 *   (orders-server.ts, api/webhooks/razorpay.ts) — a separate value
 *   from the key secret, set when the webhook is configured in the
 *   Razorpay dashboard.
 */
export const REQUIRED_SERVER_ENV = [
  "VITE_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "VITE_RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET",
  "RAZORPAY_WEBHOOK_SECRET",
] as const;

export interface ServerEnvStatus {
  ok: boolean;
  /** Names of required variables that are unset or empty. Never values. */
  missing: string[];
}

export function serverEnvStatus(
  env: Record<string, string | undefined> = process.env,
): ServerEnvStatus {
  const missing = REQUIRED_SERVER_ENV.filter((name) => {
    const value = env[name];
    return value === undefined || value.trim() === "";
  });
  return { ok: missing.length === 0, missing: [...missing] };
}
