import { createFileRoute } from "@tanstack/react-router";
import { buildSitemapXml } from "@/lib/sitemap";

/**
 * Dynamic sitemap: the <loc> origin comes from the incoming request,
 * so the sitemap is correct on whatever domain the site is deployed
 * to (no canonical domain is configured at build time — see
 * src/lib/sitemap.ts). Lists only public, indexable pages.
 */
export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: ({ request }) => {
        const origin = new URL(request.url).origin;
        return new Response(buildSitemapXml(origin), {
          headers: {
            "content-type": "application/xml; charset=utf-8",
            "cache-control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
