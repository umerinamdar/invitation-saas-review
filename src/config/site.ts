/**
 * Site-wide constants that must never drift between pages.
 *
 * The publish price lives here and ONLY here. Every display (homepage
 * pricing, the /create button, Terms, Refund, /publish) and the actual
 * charge (the YouPI checkout amount and the server-side orders check)
 * reads from this module — a hardcoded price anywhere else is a bug.
 * (Audit 2026-10-21: /publish showed ₹999 for "royal" themes while
 * everything else promised ₹599. The owner confirmed ₹599 is the price
 * for every design.)
 */
export const PUBLISH_PRICE_INR = 599;

/** The same price in paise — the unit the payment gateway charges in. */
export const PUBLISH_PRICE_PAISE = PUBLISH_PRICE_INR * 100;

/** Display label, e.g. "₹599". */
export const PUBLISH_PRICE_LABEL = `₹${PUBLISH_PRICE_INR}`;

/**
 * Canonical public origin of the deployed site (e.g.
 * "https://easyinvitemaker.com", no trailing slash), set through the
 * VITE_SITE_URL build-time env var — see .env.example. Empty until the
 * owner configures it: SEO tags that need an absolute URL (og:url) are
 * only emitted when this is set, so the site never advertises a
 * guessed, tunnel or localhost canonical URL.
 */
export const SITE_URL = (
  (import.meta.env["VITE_SITE_URL"] as string | undefined) ?? ""
).replace(/\/+$/, "");

/** Absolute canonical URL for a path, or null when SITE_URL is unset. */
export function absoluteUrl(path: string): string | null {
  if (!SITE_URL) return null;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
