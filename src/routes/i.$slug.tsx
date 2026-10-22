import { createFileRoute, notFound } from "@tanstack/react-router";
import { Invitation } from "@/components/invitation";
import { absoluteUrl } from "@/config/site";
import { getPublishedBySlug, toInvite } from "@/lib/invites-api";
import { loadPublishedInviteMediaUrlMap } from "@/lib/media-signing";
import { collectInviteMediaPaths, type MediaUrlMap } from "@/lib/media-url";
import { getTheme } from "@/themes";
import { hostNames } from "@/invites/types";

/**
 * The link guests open. Loaded on the server so WhatsApp and iMessage get
 * real title and description tags — a link that unfurls with the couple's
 * names gets opened, a bare URL does not.
 */
export const Route = createFileRoute("/i/$slug")({
  loader: async ({ params }) => {
    const row = await getPublishedBySlug(params.slug);
    if (!row) throw notFound();
    const invite = toInvite(row);
    // Gap-B: ask the server to mint signed URLs for this published
    // invite's own stored media, so guest rendering keeps working
    // after migration 0003 makes the bucket private. Fail-soft: any
    // error leaves the map empty and the invitation falls back to
    // public URLs — exactly the pre-0003 behaviour.
    let mediaUrlMap: MediaUrlMap = {};
    if (collectInviteMediaPaths(invite).length > 0) {
      try {
        mediaUrlMap = await loadPublishedInviteMediaUrlMap({
          data: params.slug,
        });
      } catch {
        mediaUrlMap = {};
      }
    }
    return { invite, theme: getTheme(row.theme_id), mediaUrlMap };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { invite, theme } = loaderData;
    const names = hostNames(invite);
    const title = invite.meta.title || `${names} — ${invite.event.typeLabel}`;
    const description =
      invite.meta.description ||
      [names, invite.event.dateText, invite.event.venueName]
        .filter(Boolean)
        .join(" · ");
    // Per-invite og:url, but only when the owner has configured the
    // canonical origin (VITE_SITE_URL) — never a guessed URL.
    const ogUrl = absoluteUrl(`/i/${invite.slug}`);
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        ...(ogUrl ? [{ property: "og:url", content: ogUrl }] : []),
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "stylesheet", href: theme.typography.fontsHref }],
    };
  },
  component: PublicInvite,
});

function PublicInvite() {
  const { invite, theme, mediaUrlMap } = Route.useLoaderData();
  return <Invitation theme={theme} invite={invite} mediaUrlMap={mediaUrlMap} />;
}
