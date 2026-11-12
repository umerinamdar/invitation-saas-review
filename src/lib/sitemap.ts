/**
 * Sitemap for the public, indexable pages. Served dynamically by the
 * /sitemap.xml server route (src/routes/sitemap[.]xml.tsx) so the
 * <loc> origins always match the domain the site is actually served
 * from — no production domain is hardcoded anywhere in this codebase,
 * and a static file baked with a guessed domain would send crawlers
 * to the wrong host. Account, checkout and order paths are excluded
 * here and disallowed in public/robots.txt.
 */
export const SITEMAP_PATHS = [
  "/",
  "/templates",
  "/hindu-wedding-invitations",
  "/sikh-wedding-invitations",
  "/muslim-wedding-invitations",
  "/christian-wedding-invitations",
  "/wedding-invitation-wording",
  "/engagement-invitation-wording",
  "/haldi-invitation-wording",
  "/mehendi-invitation-wording",
  "/reception-invitation-wording",
  "/hindu-wedding-invitation-wording",
  "/muslim-wedding-invitation-wording",
  "/share-invitation-on-whatsapp",
  "/what-to-include-in-a-digital-wedding-invitation",
  "/contact",
  "/privacy",
  "/terms",
  "/refund",
] as const;

export function buildSitemapXml(origin: string): string {
  const base = origin.replace(/\/+$/, "");
  const urls = SITEMAP_PATHS.map(
    (path) => `  <url><loc>${base}${path}</loc></url>`,
  ).join("\n");
  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    `${urls}\n</urlset>\n`
  );
}
