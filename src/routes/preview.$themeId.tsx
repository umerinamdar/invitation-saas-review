import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { X } from "lucide-react";
import { Invitation } from "@/components/invitation";
import { ThemeTuner } from "@/components/dev/theme-tuner";
import { absoluteUrl } from "@/config/site";
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
  head: ({ loaderData, params }) => {
    // Canonical for this concrete preview URL — only when the owner
    // has configured the canonical origin (VITE_SITE_URL).
    const ogUrl = absoluteUrl(`/preview/${params.themeId}`);
    return {
      meta: [
        { title: `${loaderData?.theme.name ?? "Template"} — Preview` },
        { name: "robots", content: "noindex" },
      ],
      links: [
        ...(ogUrl ? [{ rel: "canonical", href: ogUrl }] : []),
        ...(loaderData
          ? [
              {
                rel: "stylesheet",
                href: loaderData.theme.typography.fontsHref,
              },
            ]
          : []),
      ],
    };
  },
  component: Preview,
});

function Preview() {
  const { theme } = Route.useLoaderData();
  return (
    <>
      <Link to="/templates" className="preview-close" aria-label="Close preview">
        <X size={18} />
      </Link>
      <Invitation theme={theme} invite={getDemoInvite(theme.id)} watermark />
      <ThemeTuner />
    </>
  );
}
