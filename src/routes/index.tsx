import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, ChevronDown, X } from "lucide-react";
import { BRAND, SiteFooter, SiteHeader } from "@/components/site/chrome";
import { absoluteUrl, PUBLISH_PRICE_LABEL } from "@/config/site";
import { ThemeCard, ThemePhone } from "@/components/site/theme-card";
import { Reveal } from "@/components/site/reveal";
import { themes, themesById } from "@/themes";
import { useLocale } from "@/i18n/locale-context";

/** One of each opening mechanic, in an order where no two sit side by side. */
const SHOWCASE_IDS = [
  "dubai-silk",
  "ram-mandir",
  "cathedral-light",
  "kanjeevaram",
  "makkah",
  "golden-temple",
] as const;

const TITLE = `${BRAND} — Digital wedding invitations you can share on WhatsApp`;
const DESCRIPTION =
  "Choose a design, add your names and dates, and share a link your guests open on their phone. One payment, no subscription.";

/** og:url for this page — null until the canonical origin is set. */
const OG_URL = absoluteUrl("/");

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      // og:url only when the owner has configured the canonical
      // origin (VITE_SITE_URL) — never a guessed or localhost URL.
      ...(OG_URL ? [{ property: "og:url", content: OG_URL }] : []),
    ],
    links: [
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Manrope:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  component: Landing,
});

const STEP_KEYS = ["steps.1", "steps.2", "steps.3"] as const;
const COMPARE_ROW_KEYS = [
  "cost",
  "delivery",
  "animation",
  "music",
  "countdown",
  "editable",
  "maps",
  "guests",
  "whatsapp",
] as const;
const COMPARE_BOOL_ROWS = new Set([
  "animation",
  "music",
  "countdown",
  "editable",
  "maps",
  "guests",
  "whatsapp",
]);
const FAQ_KEYS = Array.from({ length: 11 }, (_, i) => i);
const INCLUDED_KEYS = Array.from({ length: 6 }, (_, i) => i);

function Landing() {
  const [a, b, c] = [
    themes[0]!,
    themes[3] ?? themes[1]!,
    themes[5] ?? themes[2]!,
  ];
  const { t } = useLocale();
  return (
    <div className="site">
      <SiteHeader />

      <main>
        <section className="hero grain">
          <Reveal as="div" className="hero-inner animate-rise">
            <p className="eyebrow">{t("hero.eyebrow")}</p>
            <h1>
              {t("hero.titleLine1")}
              <br />
              {t("hero.titleOpenPrefix")}
              <em className="gold-foil">{t("hero.titleOpen")}</em>
              {t("hero.titleLine3") && (
                <>
                  <br />
                  {t("hero.titleLine3")}
                </>
              )}
            </h1>
            <p className="lede">{t("hero.lede")}</p>
            <div className="hero-actions">
              <Link to="/templates" className="btn btn-solid">
                {t("hero.browseDesigns", { count: themes.length })}{" "}
                <ArrowRight size={16} />
              </Link>
              <p className="hero-note">
                <strong>{t("hero.noteStrong")}</strong> — {t("hero.noteRest")}
              </p>
            </div>
          </Reveal>

          <Reveal
            as="div"
            className="hero-phones"
            delay={180}
            aria-hidden="true"
          >
            <span className="hero-phone hero-phone-1">
              <ThemePhone theme={b} className="animate-float" />
            </span>
            <span className="hero-phone hero-phone-2">
              <ThemePhone theme={c} className="animate-float" />
            </span>
            <span className="hero-phone hero-phone-3">
              <ThemePhone theme={a} className="animate-float" />
            </span>
          </Reveal>
        </section>

        <section className="designs" id="designs">
          <Reveal as="header" className="section-head">
            <p className="eyebrow">{t("collection.eyebrow")}</p>
            <h2>
              {t("collection.heading", { count: themes.length })}{" "}
              <em>{t("collection.headingEm")}</em>
            </h2>
            <p className="section-sub">{t("collection.sub")}</p>
          </Reveal>
          <div className="theme-grid">
            {SHOWCASE_IDS.map((id, i) => {
              const theme = themesById.get(id);
              if (!theme) return null;
              return (
                <Reveal key={id} delay={(i % 6) * 70}>
                  <ThemeCard theme={theme} />
                </Reveal>
              );
            })}
          </div>
          <Link to="/templates" className="btn btn-quiet">
            {t("collection.seeAll", { count: themes.length })}{" "}
            <ArrowRight size={16} />
          </Link>
        </section>

        <section className="how grain" id="how">
          <Reveal as="header" className="section-head">
            <p className="eyebrow">{t("how.eyebrow")}</p>
            <h2>
              {t("how.heading")} <em>{t("how.headingEm")}</em>
            </h2>
          </Reveal>
          <ol className="steps">
            {STEP_KEYS.map((key, i) => (
              <Reveal as="li" key={key} delay={i * 110}>
                <span className="step-number">{["I", "II", "III"][i]}</span>
                <h3>{t(`${key}.title` as any)}</h3>
                <p>{t(`${key}.body` as any, { count: themes.length })}</p>
              </Reveal>
            ))}
          </ol>
        </section>

        <section className="compare" id="compare">
          <Reveal as="header" className="section-head">
            <p className="eyebrow">{t("compare.eyebrow")}</p>
            <h2>
              {t("compare.heading")} <em>{t("compare.headingEm")}</em>{" "}
              {t("compare.headingSuffix")}
            </h2>
          </Reveal>
          <Reveal as="div" className="compare-table">
            <div className="compare-row compare-head">
              <span>{t("compare.colFeature")}</span>
              <span>{t("compare.colPaper")}</span>
              <span>{t("compare.colDigital")}</span>
            </div>
            {COMPARE_ROW_KEYS.map((key) => {
              const isBool = COMPARE_BOOL_ROWS.has(key);
              return (
                <div className="compare-row" key={key}>
                  <span className="compare-feature">
                    {t(`compare.row.${key}.feature` as any)}
                  </span>
                  <span className="compare-paper">
                    {isBool ? (
                      <X size={16} />
                    ) : (
                      t(`compare.row.${key}.paper` as any)
                    )}
                  </span>
                  <span className="compare-digital">
                    {isBool ? (
                      <Check size={16} />
                    ) : (
                      t(`compare.row.${key}.digital` as any)
                    )}
                  </span>
                </div>
              );
            })}
          </Reveal>
        </section>

        <section className="pricing" id="pricing">
          <Reveal as="div" className="price-panel">
            <div className="price-side">
              <p className="eyebrow">{t("pricing.eyebrow")}</p>
              <h2>
                {t("pricing.heading1")}
                <br />
                <em>{t("pricing.heading2")}</em>
              </h2>
              <p>{t("pricing.body")}</p>
            </div>
            <div className="price-card">
              <p className="eyebrow">{t("pricing.theInvitation")}</p>
              <div className="price-amount">
                <strong>{PUBLISH_PRICE_LABEL}</strong>
                <span>{t("pricing.oneTime")}</span>
              </div>
              <div className="gold-rule" />
              <ul className="price-list">
                {INCLUDED_KEYS.map((i) => (
                  <li key={i}>
                    <Check size={16} />{" "}
                    {t(`included.${i}` as any, { count: themes.length })}
                  </li>
                ))}
              </ul>
              <Link to="/create" className="btn btn-solid">
                {t("pricing.startCustomising")} <ArrowRight size={16} />
              </Link>
            </div>
          </Reveal>
        </section>

        <section className="faq" id="faq">
          <Reveal as="header" className="section-head">
            <p className="eyebrow">{t("faq.eyebrow")}</p>
            <h2>
              {t("faq.heading")} <em>{t("faq.headingEm")}</em>
            </h2>
          </Reveal>
          <div className="faq-list">
            {FAQ_KEYS.map((i) => (
              <details key={i} className="faq-item">
                <summary>
                  {t(`faq.q${i}` as any)}
                  <ChevronDown size={18} className="faq-chevron" />
                </summary>
                <p>{t(`faq.a${i}` as any)}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="closing-cta">
          <p className="eyebrow" style={{ color: "var(--gold-soft)" }}>
            {t("closing.shubhVivah")}
          </p>
          <h2>
            {t("closing.heading")}{" "}
            <em className="gold-foil">{t("closing.headingEm")}</em>{" "}
            {t("closing.headingSuffix")}
          </h2>
          <Link to="/create" className="btn btn-solid">
            {t("closing.createYours")} <ArrowRight size={16} />
          </Link>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
