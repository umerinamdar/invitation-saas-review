import { createFileRoute, notFound } from "@tanstack/react-router";
import { Invitation } from "@/components/invitation";
import { getPublishedBySlug, toInvite } from "@/lib/invites-api";
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
    return { invite, theme: getTheme(row.theme_id) };
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
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "stylesheet", href: theme.typography.fontsHref }],
    };
  },
  component: PublicInvite,
});

function PublicInvite() {
  const { invite, theme } = Route.useLoaderData();
  return <Invitation theme={theme} invite={invite} />;
}
