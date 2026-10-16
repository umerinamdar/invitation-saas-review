import { createFileRoute } from "@tanstack/react-router";
import { Invitation } from "@/components/invitation";
import { getTheme } from "@/themes";
import { demoWedding } from "@/invites/demo-wedding";

// Phase 1 previews the public demo invite. Phase 4 replaces this with /i/$slug,
// loading the invite from the database and picking its theme by id.
const invite = demoWedding;
const theme = getTheme(invite.themeId);

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: invite.meta.title },
      { name: "description", content: invite.meta.description },
      { property: "og:title", content: invite.meta.title },
      { property: "og:description", content: invite.meta.description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "stylesheet", href: theme.typography.fontsHref }],
  }),
  component: () => <Invitation theme={theme} invite={invite} />,
});
