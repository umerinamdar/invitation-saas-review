import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BRAND, SiteFooter, SiteHeader } from "@/components/site/chrome";
import { absoluteUrl } from "@/config/site";
import { ThemeCard } from "@/components/site/theme-card";
import { themes, type Religion, type Tradition } from "@/themes";

type CategoryFilter = "all" | Religion | Tradition;

const CATEGORIES: { id: CategoryFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "traditional", label: "Traditional" },
  { id: "modern", label: "Modern" },
  { id: "hindu", label: "Hindu" },
  { id: "muslim", label: "Muslim" },
  { id: "sikh", label: "Sikh" },
  { id: "christian", label: "Christian" },
];

const TITLE = `Wedding invitation designs — ${BRAND}`;
const DESCRIPTION =
  "Every design opens differently: an envelope to unseal, doors to part, curtains to draw, a card to turn.";

/** Each card draws itself in the theme's own typeface, so load them all. */
const fontHrefs = [...new Set(themes.map((t) => t.typography.fontsHref))];

/** og:url for this page — null until the canonical origin is set. */
const OG_URL = absoluteUrl("/templates");

export const Route = createFileRoute("/templates")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      // og:url only when the canonical origin is configured
      // (VITE_SITE_URL) — never a guessed or localhost URL.
      ...(OG_URL ? [{ property: "og:url", content: OG_URL }] : []),
    ],
    links: [
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Manrope:wght@400;500;600;700&display=swap",
      },
      ...fontHrefs.map((href) => ({ rel: "stylesheet" as const, href })),
    ],
  }),
  component: Templates,
});

function Templates() {
  const [category, setCategory] = useState<CategoryFilter>("all");
  const filtered = useMemo(
    () => {
      if (category === "all") return themes;
      if (category === "traditional" || category === "modern") {
        return themes.filter((theme) => theme.tradition === category);
      }
      // Religion filter
      return themes.filter((theme) => theme.religion === category);
    },
    [category],
  );

  return (
    <div className="site">
      <SiteHeader />
      <main>
        <section className="page-head">
          <p className="eyebrow">The collection</p>
          <h1>
            {themes.length} ways to say{" "}
            <em className="gold-foil">save the date</em>
          </h1>
          <p className="lede">
            Each one opens differently. Tap any design to open the real thing
            — these are live invitations, not pictures of them.
          </p>
        </section>
        <div className="category-filter" role="group" aria-label="Filter by tradition">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`category-pill ${category === c.id ? "is-active" : ""}`}
              aria-pressed={category === c.id}
              onClick={() => setCategory(c.id)}
            >
              {c.label}
            </button>
          ))}
        </div>
        <section className="designs">
          <div className="theme-grid">
            {filtered.map((theme) => (
              <ThemeCard key={theme.id} theme={theme} />
            ))}
          </div>
          {filtered.length === 0 && (
            <p className="category-empty">
              No designs in this category yet — check back soon.
            </p>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
