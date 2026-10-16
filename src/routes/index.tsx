import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";
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
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=Jost:wght@300;400;500&display=swap",
      },
    ],
  }),
  component: Landing,
});

const STEPS = [
  {
    title: "Pick a design",
    body: "Six wedding designs, each with its own opening — an envelope to unseal, doors to part, a card to turn.",
  },
  {
    title: "Add your details",
    body: "Names, dates, venue, your functions, your photographs. Preview it free as often as you like.",
  },
  {
    title: "Share the link",
    body: "Pay once and your invitation goes live at its own address. Send it on WhatsApp — guests just tap.",
  },
];

const INCLUDED = [
  "Your own shareable link",
  "Animated opening and background music",
  "Scratch-to-reveal date",
  "Live countdown to the day",
  "Mehendi, sangeet and reception timings",
  "Venue with map directions",
  "Your photographs",
  "Edit anytime before the wedding",
];

function Landing() {
  return (
    <div className="site">
      <SiteHeader />

      <section className="hero">
        <p className="eyebrow">Wedding invitations</p>
        <h1>
          An invitation your guests <em>open</em>, not just read.
        </h1>
        <p className="lede">
          Choose a design, add your names and dates, and share a link. It opens
          on their phone with music, an animated reveal and a countdown to your
          day.
        </p>
        <div className="hero-actions">
          <Link to="/templates" className="btn btn-solid">
            See the designs <ArrowRight size={17} />
          </Link>
          <Link
            to="/preview/$themeId"
            params={{ themeId: "dubai-silk" }}
            className="btn btn-quiet"
          >
            Open a live example
          </Link>
        </div>
        <p className="hero-note">
          One payment · No subscription · Free until you publish
        </p>
      </section>

      <section className="designs" id="designs">
        <header className="section-head">
          <h2>The designs</h2>
          <p>Every one is a live page, not a video file.</p>
        </header>
        <div className="theme-grid">
          {themes.slice(0, 3).map((theme) => (
            <ThemeCard key={theme.id} theme={theme} />
          ))}
        </div>
        <Link to="/templates" className="btn btn-quiet">
          All {themes.length} designs <ArrowRight size={16} />
        </Link>
      </section>

      <section className="how" id="how">
        <header className="section-head">
          <h2>How it works</h2>
        </header>
        <ol className="steps">
          {STEPS.map((step, i) => (
            <li key={step.title}>
              <span className="step-number">{i + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="pricing" id="pricing">
        <header className="section-head">
          <h2>One price</h2>
          <p>Build the whole thing free. Pay only when you want to share it.</p>
        </header>
        <div className="price-card">
          <p className="price">
            ₹599 <span>once</span>
          </p>
          <ul>
            {INCLUDED.map((item) => (
              <li key={item}>
                <Check size={15} /> {item}
              </li>
            ))}
          </ul>
          <Link to="/templates" className="btn btn-solid">
            Start free <ArrowRight size={17} />
          </Link>
          <p className="price-note">
            No charge until you publish. Preview as long as you like.
          </p>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
