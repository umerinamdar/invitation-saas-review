import { Link } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";
import { OrnateFrame, PatternBackdrop } from "@/components/ornament";
import { paletteVariables, type Theme } from "@/themes/types";

/** A miniature of the real invitation, drawn from the theme's own palette. */
export function ThemePhone({ theme }: { theme: Theme }) {
  const { revealedBackdrop } = theme.assets;
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
        Aarav <em>&</em> Anaya
      </span>
      <span className="theme-card-rule" />
      <span className="theme-card-date">14 · 02 · 2027</span>
    </span>
  );
}

/**
 * The invitation inside a handset frame, then the name, what it is, and the
 * four things it does.
 *
 * Shoppers comparing twelve near-identical thumbnails cannot tell them
 * apart; a named feature list is what makes one design feel worth paying
 * for. Every competitor in this market leads with one.
 */
export function ThemeCard({ theme }: { theme: Theme }) {
  const vars = paletteVariables(theme) as React.CSSProperties;

  return (
    <article className="theme-card">
      <div className="theme-card-top" style={vars}>
        <span className="theme-kicker">{theme.kicker}</span>
        <Link
          to="/preview/$themeId"
          params={{ themeId: theme.id }}
          className="theme-phone"
          aria-label={`Preview ${theme.name}`}
        >
          <ThemePhone theme={theme} />
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

        <ul className="feature-pills">
          {theme.features.map((feature) => (
            <li key={feature}>
              <Check size={12} /> {feature}
            </li>
          ))}
        </ul>

        <div className="theme-card-actions">
          <Link
            to="/preview/$themeId"
            params={{ themeId: theme.id }}
            className="btn btn-quiet btn-sm"
          >
            Live demo
          </Link>
          <Link
            to="/create"
            search={{ theme: theme.id }}
            className="btn btn-solid btn-sm"
          >
            Use this design <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </article>
  );
}
