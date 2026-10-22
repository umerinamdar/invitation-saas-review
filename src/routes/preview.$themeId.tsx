import { createFileRoute, notFound } from "@tanstack/react-router";
import { Invitation } from "@/components/invitation";
import { ThemeTuner } from "@/components/dev/theme-tuner";
import { themesById } from "@/themes";
import { getDemoInvite } from "@/invites/demo-wedding";

/**
 * Previews a theme against that theme's own demo invite — the link behind
 * each card in the template gallery.
 */
export const Route = createFileRoute("/preview/$themeId")({
  loader: ({ params }) => {
    const theme = themesById.get(params.themeId);
    if (!theme) throw notFound();
    return { theme };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.theme.name ?? "Template"} — Preview` },
      { name: "robots", content: "noindex" },
    ],
    links: loaderData
      ? [{ rel: "stylesheet", href: loaderData.theme.typography.fontsHref }]
      : [],
  }),
  component: Preview,
});

function Preview() {
  const { theme } = Route.useLoaderData();
  return (
    <>
      <Invitation theme={theme} invite={getDemoInvite(theme.id)} />
      <ThemeTuner />
    </>
  );
}
