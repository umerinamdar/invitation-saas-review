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

/**
 * Not every theme's hero image has had a .webp sibling generated for it
 * yet (caught on Ivory Silk & Pearls, 2026-10-25 — its venue.jpg has
 * none, so the <picture> below picked the non-existent .webp source and
 * never fell back, leaving the gallery card blank). <picture> only
 * falls back to the <img> when no <source> matches syntactically, not
 * when a matched source's file 404s.
 *
 * The fix has to be React state, not a raw DOM mutation on the <img>:
 * an earlier version removed the failing <source> node directly via
 * `.previousElementSibling.remove()`, which worked for one render but
 * fought React's own reconciliation — any later re-render of this
 * component put the <source> right back, since React's virtual DOM had
 * no idea the real node had been removed out from under it. Tracking
 * "this theme's webp failed" in state and conditionally rendering the
 * <source> lets React own the DOM, so the fix survives re-renders.
 *
 * That alone still wasn't enough (caught again, same Ivory Silk card):
 * removing the <source> doesn't change the <img>'s own src attribute,
 * since it was always the JPEG path, never the WebP one. An unchanged
 * attribute never makes the browser refetch it, so the broken image
 * stayed put. The key prop below forces React to unmount and remount
 * the <img> as a brand-new element once the WebP fails, which does
 * force a fresh request for its src.
 */
function HeroImage({ src, alt }: { src: string; alt: string }) {
  const [webpFailed, setWebpFailed] = useState(false);
  return (
    <picture>
      {!webpFailed && (
        <source type="image/webp" srcSet={webpVariant(src)} />
      )}
      <img
        key={webpFailed ? "jpg" : "webp-or-jpg"}
        src={src}
        alt={alt}
        loading="lazy"
        onError={() => setWebpFailed(true)}
      />
    </picture>
  );
}

/** A miniature of the real invitation, drawn from the theme's own palette. */
export function ThemePhoneScreen({ theme }: { theme: Theme }) {
  const { revealedBackdrop } = theme.assets;
  // The card shows the same demo couple and date as this theme's full
  // preview, so the gallery doesn't promise one wedding and open another.
  const demo = getDemoInvite(theme.id);
  const [year, month, day] = demo.event.startIso.slice(0, 10).split("-");
  return (
    <span className="theme-phone-screen">
      {revealedBackdrop ? (
        <>
          <HeroImage src={revealedBackdrop} alt="" />
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
        </div>
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
