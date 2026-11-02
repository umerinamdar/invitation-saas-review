/**
 * Client-side page-liveness checks for the admin "System health"
 * panel — a quick "is everything basically up" glance, not a
 * replacement for Cloudflare/Supabase's own dashboards. Each path is
 * fetched with a plain GET (no-store) from the browser, since these
 * are all public pages anyway; a failed fetch (network error, CORS,
 * etc.) is reported as unreachable rather than thrown.
 */
export const HEALTH_CHECK_PATHS = [
  "/",
  "/templates",
  "/hindu-wedding-invitations",
  "/sikh-wedding-invitations",
  "/muslim-wedding-invitations",
  "/christian-wedding-invitations",
  "/sitemap.xml",
] as const;

export type PageStatus = { path: string; ok: boolean; status: number | null };

export async function checkPageStatuses(
  paths: readonly string[] = HEALTH_CHECK_PATHS,
  fetchImpl: typeof fetch = fetch,
): Promise<PageStatus[]> {
  return Promise.all(
    paths.map(async (path) => {
      try {
        const res = await fetchImpl(path, { cache: "no-store" });
        return { path, ok: res.ok, status: res.status };
      } catch {
        return { path, ok: false, status: null };
      }
    }),
  );
}
