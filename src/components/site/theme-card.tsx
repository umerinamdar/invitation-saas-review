import { Link } from "@tanstack/react-router";
import { ArrowRight, Eye } from "lucide-react";
import { OrnateFrame, PatternBackdrop } from "@/components/ornament";
import { paletteVariables, type Theme } from "@/themes/types";
import { useLocale } from "@/i18n/locale-context";
import { getDemoInvite } from "@/invites/demo-wedding";

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
          <img src={revealedBackdrop} alt="" loading="lazy" />
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
          <h3>{theme.name}</h3>
          <span className="swatches" aria-hidden="true">
            <i style={{ background: theme.palette.background }} />
            <i style={{ background: theme.palette.accent }} />
            <i style={{ background: theme.palette.paper }} />
          </span>
        </div>
        <p className="theme-tagline">{theme.tagline}</p>

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
