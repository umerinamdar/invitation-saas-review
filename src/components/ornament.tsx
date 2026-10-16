import { useId } from "react";
import type { Ornamentation } from "@/themes/types";

/**
 * Procedural decoration. A theme that names an `ornamentation` gets its
 * backdrop and frame drawn here from the palette, so a template needs no
 * photography at all — which is how the whole Classic tier is built.
 */

/** Full-bleed repeating pattern standing in for a photographic backdrop. */
export function PatternBackdrop({ kind }: { kind: Ornamentation }) {
  /*
   * Ids must be unique per instance. Duplicate SVG ids resolve to whichever
   * was defined first in the document, so a shared id made every card in the
   * gallery paint itself with the first theme's colours.
   */
  const uid = useId().replace(/:/g, "");
  if (kind === "none") return null;
  const tileId = `tile-${uid}`;
  const vignetteId = `vig-${uid}`;
  return (
    <svg
      className="pattern-backdrop"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <pattern
          id={tileId}
          width="120"
          height="120"
          patternUnits="userSpaceOnUse"
        >
          <PatternTile kind={kind} />
        </pattern>
        <radialGradient id={vignetteId} cx="50%" cy="42%" r="78%">
          <stop offset="0%" stopColor="var(--pattern-core)" />
          <stop offset="100%" stopColor="var(--pattern-edge)" />
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${vignetteId})`} />
      <rect width="100%" height="100%" fill={`url(#${tileId})`} opacity="0.5" />
    </svg>
  );
}

function PatternTile({ kind }: { kind: Ornamentation }) {
  const stroke = "var(--gold)";
  switch (kind) {
    case "jali":
      // Interlocking eight-point stars, the Mughal lattice motif.
      return (
        <g fill="none" stroke={stroke} strokeWidth="0.9" opacity="0.5">
          <path d="M60 18 78 42 102 60 78 78 60 102 42 78 18 60 42 42Z" />
          <path d="M60 32 70 50 88 60 70 70 60 88 50 70 32 60 50 50Z" />
          <circle cx="60" cy="60" r="5" />
          <path d="M0 0 18 18M120 0 102 18M0 120 18 102M120 120 102 102" />
        </g>
      );
    case "deco":
      // Stepped fans radiating from the corners.
      return (
        <g fill="none" stroke={stroke} strokeWidth="0.9" opacity="0.45">
          <path d="M0 120 A120 120 0 0 1 120 0" />
          <path d="M0 120 A96 96 0 0 1 96 24" />
          <path d="M0 120 A72 72 0 0 1 72 48" />
          <path d="M60 0v14M0 60h14M120 60h-14M60 120v-14" strokeWidth="1.4" />
        </g>
      );
    case "geometric":
      // A fine diamond grid with marked intersections.
      return (
        <g fill="none" stroke={stroke} strokeWidth="0.8" opacity="0.4">
          <path d="M60 6 114 60 60 114 6 60Z" />
          <path d="M60 30 90 60 60 90 30 60Z" />
          <circle cx="60" cy="60" r="2.4" fill={stroke} stroke="none" />
          <circle cx="0" cy="0" r="2.4" fill={stroke} stroke="none" />
          <circle cx="120" cy="120" r="2.4" fill={stroke} stroke="none" />
        </g>
      );
    case "botanical":
      // A trailing vine with paired leaves.
      return (
        <g fill="none" stroke={stroke} strokeWidth="0.9" opacity="0.45">
          <path d="M0 96 C30 96 34 60 60 60 C86 60 90 24 120 24" />
          <ellipse
            cx="34"
            cy="78"
            rx="9"
            ry="4.2"
            transform="rotate(-38 34 78)"
          />
          <ellipse
            cx="86"
            cy="42"
            rx="9"
            ry="4.2"
            transform="rotate(-38 86 42)"
          />
          <ellipse cx="60" cy="60" rx="4" ry="7" />
        </g>
      );
    case "mandala":
      // Concentric lotus petals radiating from a centre — rangoli geometry.
      return (
        <g fill="none" stroke={stroke} strokeWidth="0.85" opacity="0.45">
          {Array.from({ length: 12 }, (_, i) => (
            <ellipse
              key={i}
              cx="60"
              cy="34"
              rx="5.5"
              ry="19"
              transform={`rotate(${i * 30} 60 60)`}
            />
          ))}
          <circle cx="60" cy="60" r="9" />
          <circle cx="60" cy="60" r="3.4" fill={stroke} stroke="none" />
        </g>
      );
    case "paisley":
      // The boteh teardrop of bandhani and phulkari work.
      return (
        <g fill="none" stroke={stroke} strokeWidth="0.85" opacity="0.45">
          <path d="M44 86 C26 72 30 44 50 36 C70 28 86 42 80 58 C76 70 60 72 56 62 C53 54 62 48 68 53" />
          <path d="M104 26 C95 19 97 5 107 1" strokeWidth="0.7" />
          <circle cx="40" cy="30" r="2.2" fill={stroke} stroke="none" />
          <circle cx="96" cy="94" r="2.2" fill={stroke} stroke="none" />
          <circle cx="18" cy="108" r="1.6" fill={stroke} stroke="none" />
        </g>
      );
    case "temple":
      // Stepped gopuram tiers with a pointed finial.
      return (
        <g fill="none" stroke={stroke} strokeWidth="0.85" opacity="0.42">
          <path d="M30 118 L30 96 L46 96 L46 76 L54 76 L54 58 L60 46 L66 58 L66 76 L74 76 L74 96 L90 96 L90 118" />
          <path d="M60 46 L60 30" strokeWidth="1.2" />
          <circle cx="60" cy="25" r="3.4" />
          <path d="M0 118 L120 118" strokeWidth="1.1" />
          <path d="M6 108 L14 96 L22 108Z" />
          <path d="M98 108 L106 96 L114 108Z" />
        </g>
      );
    default:
      return null;
  }
}

/** A drawn border frame, the signature of a Classic-tier template. */
export function OrnateFrame({ kind }: { kind: Ornamentation }) {
  if (kind === "none") return null;
  return (
    <svg
      className="ornate-frame"
      viewBox="0 0 400 600"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <rect
        x="14"
        y="14"
        width="372"
        height="572"
        fill="none"
        stroke="var(--gold)"
        strokeWidth="1.1"
        opacity="0.75"
      />
      <rect
        x="20"
        y="20"
        width="360"
        height="560"
        fill="none"
        stroke="var(--gold-light)"
        strokeWidth="0.6"
        opacity="0.55"
      />
      {[
        [14, 14, 1, 1],
        [386, 14, -1, 1],
        [14, 586, 1, -1],
        [386, 586, -1, -1],
      ].map(([x, y, sx, sy]) => (
        <g
          key={`${x}-${y}`}
          transform={`translate(${x} ${y}) scale(${sx} ${sy})`}
          fill="none"
          stroke="var(--gold)"
          strokeWidth="1.2"
          opacity="0.9"
        >
          <FrameCorner kind={kind} />
        </g>
      ))}
    </svg>
  );
}

function FrameCorner({ kind }: { kind: Ornamentation }) {
  switch (kind) {
    case "jali":
      return (
        <>
          <path d="M0 54 C0 22 22 0 54 0" />
          <path d="M8 44 C8 22 22 8 44 8" strokeWidth="0.7" />
          <path d="M20 20 l10 -4 -4 10Z" fill="var(--gold)" stroke="none" />
        </>
      );
    case "deco":
      return (
        <>
          <path d="M0 56 L0 30 L30 30 L30 0 L56 0" />
          <path d="M10 56 L10 40 L40 40 L40 10 L56 10" strokeWidth="0.7" />
        </>
      );
    case "geometric":
      return (
        <>
          <path d="M0 48 L0 0 L48 0" />
          <path d="M0 24 L24 0" strokeWidth="0.7" />
          <circle cx="16" cy="16" r="3" fill="var(--gold)" stroke="none" />
        </>
      );
    case "botanical":
      return (
        <>
          <path d="M0 58 C26 58 58 26 58 0" />
          <ellipse
            cx="22"
            cy="40"
            rx="11"
            ry="5"
            transform="rotate(-45 22 40)"
          />
          <ellipse
            cx="40"
            cy="22"
            rx="11"
            ry="5"
            transform="rotate(-45 40 22)"
          />
          <circle cx="8" cy="54" r="2.6" fill="var(--gold)" stroke="none" />
        </>
      );
    case "mandala":
      return (
        <>
          <path d="M0 60 A60 60 0 0 1 60 0" />
          <path d="M0 40 A40 40 0 0 1 40 0" strokeWidth="0.7" />
          {[0, 30, 60].map((angle) => (
            <ellipse
              key={angle}
              cx="0"
              cy="0"
              rx="4"
              ry="15"
              transform={`rotate(${angle + 45}) translate(0 20)`}
              strokeWidth="0.7"
            />
          ))}
        </>
      );
    case "paisley":
      return (
        <>
          <path d="M0 62 C34 62 62 34 62 0" />
          <path d="M14 46 C14 30 30 14 46 14" strokeWidth="0.7" />
          <path
            d="M26 34 C20 28 22 18 30 16 C38 14 43 21 39 27 C36 31 29 31 28 27"
            strokeWidth="0.8"
          />
          <circle cx="6" cy="56" r="2.4" fill="var(--gold)" stroke="none" />
        </>
      );
    case "temple":
      return (
        <>
          <path d="M0 58 L0 34 L18 34 L18 16 L34 16 L34 0 L58 0" />
          <path
            d="M9 58 L9 43 L27 43 L27 25 L43 25 L43 9 L58 9"
            strokeWidth="0.7"
          />
          <circle cx="12" cy="12" r="2.8" fill="var(--gold)" stroke="none" />
        </>
      );
    default:
      return null;
  }
}
