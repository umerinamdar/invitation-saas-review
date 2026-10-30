import type { CSSProperties } from "react";

export type LogoTone = "light" | "dark" | "mono-black" | "mono-white";
export type LogoLayout = "horizontal" | "stacked" | "icon";

/** Ink/accent per tone, from brand.json's `tones` table. The mono tones
 * collapse ink and accent to the same single colour on purpose — "mono"
 * means one colour, full stop. */
const TONE_COLORS: Record<LogoTone, { ink: string; accent: string }> = {
  light: { ink: "#5B1A2B", accent: "#C8A97E" },
  dark: { ink: "#F4ECE4", accent: "#C8A97E" },
  "mono-black": { ink: "#000000", accent: "#000000" },
  "mono-white": { ink: "#FFFFFF", accent: "#FFFFFF" },
};

/**
 * The monogram alone — E, I and M sharing their stems in one continuous
 * line drawing (brand.json's own path data, reproduced verbatim: 64x64
 * grid, stroke 3.2, square caps, miter joins). The champagne/tone accent
 * is used only for the centred I's lower stem, never as a fill or a
 * second body colour.
 */
function Monogram({ tone, size }: { tone: LogoTone; size: number }) {
  const { ink, accent } = TONE_COLORS[tone];
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M12 52V12L32 36L52 12V52"
        fill="none"
        stroke={ink}
        strokeWidth={3.2}
        strokeLinejoin="miter"
        strokeLinecap="square"
      />
      <path
        d="M12 12H24M12 32H21M12 52H24"
        fill="none"
        stroke={ink}
        strokeWidth={3.2}
        strokeLinecap="square"
      />
      <path
        d="M32 42V52"
        fill="none"
        stroke={accent}
        strokeWidth={3.2}
        strokeLinecap="square"
      />
    </svg>
  );
}

/**
 * EasyInviteMaker set in Bodoni Moda, per brand.json's `type` spec: Easy
 * 400 · Invite 600 · Maker 400, +0.01em tracking. Live text (not the
 * outline-converted SVG wordmark the brand package also ships) so the
 * mark inherits colour from `tone` via CSS and stays crisp, selectable
 * and accessible at any size — the one thing a pre-baked, per-tone SVG
 * file can't do.
 */
function Wordmark({ tone, size }: { tone: LogoTone; size: number }) {
  const { ink } = TONE_COLORS[tone];
  const style: CSSProperties = {
    fontFamily: '"Bodoni Moda Brand", Georgia, serif',
    fontSize: size,
    letterSpacing: "0.01em",
    color: ink,
    whiteSpace: "nowrap",
    lineHeight: 1,
  };
  return (
    <span style={style} aria-hidden="true">
      <span style={{ fontWeight: 400 }}>Easy</span>
      <span style={{ fontWeight: 600 }}>Invite</span>
      <span style={{ fontWeight: 400 }}>Maker</span>
    </span>
  );
}

/**
 * The EasyInviteMaker logo — `tone` picks one of the four approved
 * treatments, `layout` picks the lockup. Always reads as "EasyInviteMaker
 * home" to assistive tech regardless of layout, since every layout links
 * home in practice (see chrome.tsx's header/footer/editor-bar usage).
 */
export function Logo({
  tone = "light",
  layout = "horizontal",
  size,
  className = "",
}: {
  tone?: LogoTone;
  layout?: LogoLayout;
  /** Icon size in px. The wordmark (when shown) is sized off this, per
   * brand.json's own icon:wordmark proportions. Defaults vary by layout
   * so each lockup reads at a sensible size out of the box. */
  size?: number;
  className?: string;
}) {
  const iconSize = size ?? (layout === "stacked" ? 34 : layout === "icon" ? 28 : 26);

  if (layout === "icon") {
    return (
      <span
        className={`brand-logo brand-logo-icon ${className}`}
        role="img"
        aria-label="EasyInviteMaker home"
      >
        <Monogram tone={tone} size={iconSize} />
      </span>
    );
  }

  const wordmarkSize = Math.round(iconSize * 0.7);

  return (
    <span
      className={`brand-logo brand-logo-${layout} ${className}`}
      role="img"
      aria-label="EasyInviteMaker home"
    >
      <Monogram tone={tone} size={iconSize} />
      <Wordmark tone={tone} size={wordmarkSize} />
    </span>
  );
}
