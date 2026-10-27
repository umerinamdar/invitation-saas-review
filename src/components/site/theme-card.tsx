import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Eye } from "lucide-react";
import { OrnateFrame, PatternBackdrop } from "@/components/ornament";
import { paletteVariables, type Theme } from "@/themes/types";
import { useLocale } from "@/i18n/locale-context";
import { getDemoInvite } from "@/invites/demo-wedding";

/**
 * The WebP sibling generated next to every theme hero image (same
 * directory, same basename, `.webp`) — served via <picture> so modern
 * browsers skip the larger JPEG while the original <img> stays as the
 * fallback for browsers without WebP support.
 */
function webpVariant(src: string): string {
  return src.replace(/\.(?:jpe?g|png)$/i, ".webp");
}

/** A miniature of the real invitation, drawn from the theme's own palette. */
export function ThemePhoneScreen({ theme }: { theme: Theme }) {
  const { revealedBackdrop } = theme.assets;
  // Blur-up: the card art starts transparent over the card's palette
  // background and cross-fades in on load (or on error, so a broken
  // file still shows its alt text). The ref check covers cached files.
  const [backdropLoaded, setBackdropLoaded] = useState(false);
  // The card shows the same demo couple and date as this theme's full
  // preview, so the gallery doesn't promise one wedding and open another.
  const demo = getDemoInvite(theme.id);
  const [year, month, day] = demo.event.startIso.slice(0, 10).split("-");
  return (
    <span className="theme-phone-screen">
      {revealedBackdrop ? (
        <>
          <picture>
            <source type="image/webp" srcSet={webpVariant(revealedBackdrop)} />
            <img
              src={revealedBackdrop}
              alt=""
              loading="lazy"
              className={`blur-up${backdropLoaded ? " is-loaded" : ""}`}
              ref={(el) => {
                if (el && el.complete && el.naturalWidth > 0)
                  setBackdropLoaded(true);
              }}
              onLoad={() => setBackdropLoaded(true)}
              onError={() => setBackdropLoaded(true)}
            />
          </picture>
          <span className="theme-card-veil" />
        </>
      ) : (
        <PatternBackdrop kind={theme.ornamentation} />
      )}
      <OrnateFrame kind={theme.ornamentation} />
      <span className="theme-card-names">
        {demo.hosts.person1} <em>&</em> {demo.hosts.person2}
      </span>
      <span className="theme-card-rule" />
      <span className="theme-card-date">
        {day} · {month} · {year}
      </span>
    </span>
  );
}

/**
 * A premium handset frame — titanium bezel, Dynamic Island, glass
 * reflection — wrapped around a theme's live mini-preview.
 */
export function ThemePhone({
  theme,
  className = "",
}: {
  theme: Theme;
  className?: string;
}) {
  const vars = paletteVariables(theme) as React.CSSProperties;
  return (
    <span className={`handset theme-phone ${className}`} style={vars}>
      <span className="handset-button" style={{ left: "-0.6%", top: "17%", height: "3%" }} />
      <span className="handset-button" style={{ left: "-0.6%", top: "23%", height: "5.5%" }} />
      <span className="handset-button" style={{ left: "-0.6%", top: "30%", height: "5.5%" }} />
      <span className="handset-button" style={{ right: "-0.6%", top: "22%", height: "8%" }} />
      <span className="handset-bezel">
        <span className="handset-screen">
          <span className="handset-island" />
          <ThemePhoneScreen theme={theme} />
        </span>
      </span>
    </span>
  );
}

/**
 * The invitation inside a handset frame, then the name, what it is, and a
 * one-line pitch for the design.
 *
 * Shoppers comparing sixteen near-identical thumbnails cannot tell them
 * apart; a named design with its own tagline is what makes one feel worth
 * paying for.
 */
export function ThemeCard({ theme }: { theme: Theme }) {
  const { t } = useLocale();
  return (
    <article className="theme-card">
      <div className="theme-card-top">
        <span className="theme-kicker">{theme.kicker}</span>
        <span className="theme-card-reveal">{theme.motion.reveal}</span>
        <Link
          to="/preview/$themeId"
          params={{ themeId: theme.id }}
          aria-label={`Preview ${theme.name}`}
          className="theme-phone-link"
        >
          <ThemePhone theme={theme} />
          <span className="theme-phone-hover" aria-hidden="true">
            <Eye size={15} /> {t("theme.preview")}
          </span>
        </Link>
      </div>

      <div className="theme-card-body">
        <div className="theme-card-head">
          <h2>{theme.name}</h2>
          <span className="swatches" aria-hidden="true">
            <i style={{ background: theme.palette.background }} />
            <i style={{ background: theme.palette.accent }} />
            <i style={{ background: theme.palette.paper }} />
          </span>
        </div>
        <p className="theme-tagline">{theme.tagline}</p>

        {/* The four things this design does that another doesn't —
            the data has always been in the theme (see themes/types.ts)
            but was never rendered, so shoppers compared 14 near-
            identical phones on tagline alone. */}
        <ul className="feature-pills">
          {theme.features.map((feature) => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>

        <div className="theme-card-actions">
          <Link
            to="/create"
            search={{ theme: theme.id }}
            className="btn btn-quiet btn-sm"
          >
            {t("theme.useDesign")} <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </article>
  );
}
