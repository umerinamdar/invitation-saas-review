import { createFileRoute } from "@tanstack/react-router";
import { BRAND, SiteFooter, SiteHeader } from "@/components/site/chrome";
import { ThemeCard } from "@/components/site/theme-card";
import { themes } from "@/themes";

const TITLE = `Wedding invitation designs — ${BRAND}`;
const DESCRIPTION =
  "Every design opens differently: an envelope to unseal, doors to part, curtains to draw, a card to turn.";

/** Each card draws itself in the theme's own typeface, so load them all. */
const fontHrefs = [...new Set(themes.map((t) => t.typography.fontsHref))];

export const Route = createFileRoute("/templates")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
    ],
    links: fontHrefs.map((href) => ({ rel: "stylesheet", href })),
  }),
  component: Templates,
});

function Templates() {
  return (
    <div className="site">
      <SiteHeader />
      <section className="page-head">
        <p className="eyebrow">Designs</p>
        <h1>{themes.length} wedding designs</h1>
        <p className="lede">
          Each one opens differently. Tap any design to open the real thing —
          these are live invitations, not pictures of them.
        </p>
      </section>
      <section className="designs">
        <div className="theme-grid">
          {themes.map((theme) => (
            <ThemeCard key={theme.id} theme={theme} />
          ))}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
