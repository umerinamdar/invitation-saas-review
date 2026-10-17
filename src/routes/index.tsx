import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { paletteVariables } from "@/themes/types";
import { BRAND, SiteFooter, SiteHeader } from "@/components/site/chrome";
import { ThemeCard, ThemePhone } from "@/components/site/theme-card";
import { Reveal } from "@/components/site/reveal";
import { themes } from "@/themes";

const TITLE = `${BRAND} — Digital wedding invitations you can share on WhatsApp`;
const DESCRIPTION =
  "Choose a design, add your names and dates, and share a link your guests open on their phone. One payment, no subscription.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Jost:wght@300;400;500&display=swap",
      },
    ],
  }),
  component: Landing,
});

const STEPS = [
  {
    title: "Choose",
    body: `${themes.length} designs, each with its own opening — an envelope to unseal, doors to part, a card to turn.`,
  },
  {
    title: "Make it yours",
    body: "Your names, your dates, your functions, your photographs. Watch it change as you type.",
  },
  {
    title: "Share",
    body: "One link. Guests tap it and your invitation opens on their phone, music and all.",
  },
];

const INCLUDED = [
  "Your own link to share",
  "Animated opening and music",
  "Scratch-to-reveal date",
  "Live countdown",
  "Mehendi, sangeet and reception",
  "Venue with directions",
  "Your photographs",
  "Edit until the wedding day",
];

function Landing() {
  const hero = themes[0]!;
  return (
    <div className="site">
      <SiteHeader />

      <section className="hero">
        <Reveal className="hero-inner">
          <span className="hero-badge">
            Wedding invitations, made in minutes
          </span>
          <h1>
            An invitation your guests <em>open</em>
          </h1>
          <p className="lede">
            Shaadi, engagement, mehendi, sangeet and reception — one link for
            all of it. {themes.length} designs that unseal on their phone with music, a
            scratch-to-reveal date and a live countdown.
          </p>
          <div className="hero-actions">
            <Link to="/create" className="btn btn-solid">
              Create free invitation <ArrowRight size={17} />
            </Link>
            <Link to="/templates" className="btn btn-quiet">
              Explore {themes.length} designs
            </Link>
          </div>
          <p className="hero-note">
            No card needed · Free to design · ₹599 once to share
          </p>
        </Reveal>

        {/*
          A row of real invitations in handsets. The product is phone-shaped
          and the designs are the pitch, so the hero shows several at once
          rather than one decorative photograph.
        */}
        <Reveal className="hero-phones" delay={180} aria-hidden="true">
          {themes.slice(0, 6).map((theme) => (
            <span
              key={theme.id}
              className="device hero-phone"
              style={paletteVariables(theme) as React.CSSProperties}
            >
              <ThemePhone theme={theme} />
            </span>
          ))}
        </Reveal>
      </section>

      <section className="designs" id="designs">
        <Reveal as="header" className="section-head">
          <p className="eyebrow">The designs</p>
          <h2>{themes.length} ways to open a door</h2>
          <p className="section-sub">
            Every one is a living page, not a picture of one. Tap any design to
            open the real thing.
          </p>
        </Reveal>
        <div className="theme-grid">
          {themes.slice(0, 6).map((theme, i) => (
            <Reveal key={theme.id} delay={(i % 3) * 90}>
              <ThemeCard theme={theme} />
            </Reveal>
          ))}
        </div>
        <Link to="/templates" className="btn btn-quiet">
          All {themes.length} designs <ArrowRight size={16} />
        </Link>
      </section>

      <section className="how" id="how">
        <ol className="steps">
          {STEPS.map((step, i) => (
            <Reveal as="li" key={step.title} delay={i * 110}>
              <span className="step-number">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </Reveal>
          ))}
        </ol>
      </section>

      <section className="pricing" id="pricing">
        <Reveal className="price-panel">
          <div className="price-side">
            <p className="eyebrow">One price</p>
            <h2>
              ₹599 <span>once</span>
            </h2>
            <p className="section-sub">
              Design the whole thing free. Pay only when you're ready to send
              it. No subscription, no per-guest charge.
            </p>
            <Link to="/create" className="btn btn-solid">
              Start yours free <ArrowRight size={17} />
            </Link>
          </div>
          <ul className="price-list">
            {INCLUDED.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Reveal>
      </section>

      <SiteFooter />
    </div>
  );
}
