import { Link } from "@tanstack/react-router";
import { ArrowRight, ChevronDown } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site/chrome";
import { ThemeCard } from "@/components/site/theme-card";
import { PUBLISH_PRICE_LABEL } from "@/config/site";
import type { Theme } from "@/themes/types";

export type OccasionFaq = { q: string; a: string };

/**
 * Shared layout for the occasion/community landing pages (Hindu, Sikh,
 * Muslim, Christian, ...). Each route supplies its own copy and the
 * theme(s) that actually, honestly match — this component only lays
 * them out, so no page claims a design it doesn't have.
 */
export function OccasionLandingPage({
  eyebrow,
  heading,
  headingEm,
  intro,
  featuredThemes,
  faqs,
}: {
  eyebrow: string;
  heading: string;
  headingEm: string;
  intro: string[];
  featuredThemes: Theme[];
  faqs: OccasionFaq[];
}) {
  return (
    <div className="site">
      <SiteHeader />
      <main>
        <section className="page-head">
          <p className="eyebrow">{eyebrow}</p>
          <h1>
            {heading} <em className="gold-foil">{headingEm}</em>
          </h1>
          {intro.map((paragraph, i) => (
            <p className="lede" key={i}>
              {paragraph}
            </p>
          ))}
          <Link to="/templates" className="btn btn-solid">
            See the designs <ArrowRight size={16} />
          </Link>
        </section>

        <section className="designs">
          <div className="theme-grid">
            {featuredThemes.map((theme) => (
              <ThemeCard key={theme.id} theme={theme} />
            ))}
          </div>
        </section>

        <section className="faq" id="faq">
          <header className="section-head">
            <p className="eyebrow">Questions</p>
            <h2>
              Before you <em>create one</em>
            </h2>
          </header>
          <div className="faq-list">
            {faqs.map((item, i) => (
              <details key={i} className="faq-item">
                <summary>
                  {item.q}
                  <ChevronDown size={18} className="faq-chevron" />
                </summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="page-head" style={{ textAlign: "center" }}>
          <p className="lede">
            Choose a design, add your names and dates, and share a link your
            guests open on their phone — {PUBLISH_PRICE_LABEL} one-time, no
            subscription.
          </p>
          <Link to="/create" className="btn btn-solid">
            Start your invitation <ArrowRight size={16} />
          </Link>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

/** FAQPage JSON-LD built from the same faqs shown on the page — never a
 * second, divergent copy of the questions. */
export function faqJsonLd(faqs: OccasionFaq[]): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  });
}
