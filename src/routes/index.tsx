import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { BRAND, SiteFooter, SiteHeader } from "@/components/site/chrome";
import { ThemeCard } from "@/components/site/theme-card";
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
    body: "Twelve designs, each with its own opening — an envelope to unseal, doors to part, a card to turn.",
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
      <SiteHeader overlay />

      <section className="hero">
        <img
          className="hero-art"
          src={hero.assets.revealedBackdrop}
          alt=""
          fetchPriority="high"
        />
        <span className="hero-scrim" />
        <div className="hero-inner">
          <p className="eyebrow">Digital wedding invitations</p>
          <h1>
            An invitation your guests
            <em>open</em>
          </h1>
          <p className="lede">
            Not a card. Not a video. A link that unseals on their phone, with
            music, your photographs and a countdown to the day.
          </p>
          <div className="hero-actions">
            <Link to="/create" className="btn btn-solid">
              Start yours free <ArrowRight size={17} />
            </Link>
            <Link to="/templates" className="btn btn-ghost">
              See all {themes.length} designs
            </Link>
          </div>
          <p className="hero-note">
            Free to design · ₹599 once to share · No subscription
          </p>
        </div>
      </section>

      <section className="designs" id="designs">
        <header className="section-head">
          <p className="eyebrow">The designs</p>
          <h2>Twelve ways to open a door</h2>
          <p className="section-sub">
            Every one is a living page, not a picture of one. Tap any design to
            open the real thing.
          </p>
        </header>
        <div className="theme-grid">
          {themes.slice(0, 6).map((theme) => (
            <ThemeCard key={theme.id} theme={theme} />
          ))}
        </div>
        <Link to="/templates" className="btn btn-quiet">
          All {themes.length} designs <ArrowRight size={16} />
        </Link>
      </section>

      <section className="how" id="how">
        <ol className="steps">
          {STEPS.map((step, i) => (
            <li key={step.title}>
              <span className="step-number">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="pricing" id="pricing">
        <div className="price-panel">
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
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
