import { Link } from "@tanstack/react-router";
import { OrnateFrame, PatternBackdrop } from "@/components/ornament";
import { paletteVariables, type Reveal, type Theme } from "@/themes/types";

const OPENS: Record<Reveal, string> = {
  envelope: "a sealed envelope",
  doors: "carved doors",
  curtain: "velvet curtains",
  book: "a folded card",
  box: "a lifting lid",
};

/**
 * A live miniature of the template, drawn with the same palette and
 * ornament the real invitation uses — so the gallery needs no screenshots
 * and can never show a thumbnail that has drifted from the design.
 */
export function ThemeCard({ theme }: { theme: Theme }) {
  const { revealedBackdrop } = theme.assets;
  return (
    <article className="theme-card">
      <Link
        to="/preview/$themeId"
        params={{ themeId: theme.id }}
        className="theme-card-stage"
        style={paletteVariables(theme) as React.CSSProperties}
        aria-label={`Preview ${theme.name}`}
      >
        {revealedBackdrop ? (
          <>
            <img src={revealedBackdrop} alt="" loading="lazy" />
            {/* Photographic backdrops need a scrim or the names disappear. */}
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
      </Link>

      <div className="theme-card-meta">
        <h3>{theme.name}</h3>
        <span className={`tier tier-${theme.tier}`}>{theme.tier}</span>
      </div>
      {/* Two themes can share artwork, so how it opens is the real difference. */}
      <p className="theme-card-opens">
        Opens with {OPENS[theme.motion.reveal]}
      </p>
      <p className="theme-card-occasions">{theme.occasions.join(" · ")}</p>
      <Link
        to="/preview/$themeId"
        params={{ themeId: theme.id }}
        className="btn btn-quiet btn-sm"
      >
        View live demo
      </Link>
    </article>
  );
}
