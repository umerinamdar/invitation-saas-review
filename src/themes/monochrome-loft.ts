import type { Theme } from "./types";

/**
 * Lovable-20 conversion (2026-10-25), source project p09-monochrome-vow.
 * Renamed from the source's own "Monochrome Vow" — that name collides with
 * an existing live theme (src/themes/monochrome-vow.ts, a different
 * couple's design). Owner decision 2026-10-25: keep the existing theme's
 * name, rename this new one after its venue (The Glasshouse Loft, Brooklyn).
 * Palette ported from the project's own styles.css tokens; no photography
 * (the export had no binary assets) — drawn geometric ornamentation instead
 * (a clean modern grid, matching the source's own minimalist intent).
 */
export const monochromeLoft: Theme = {
  id: "monochrome-loft",
  name: "Monochrome Loft",
  tier: "classic",
  tradition: "modern",
  occasions: ["wedding", "engagement", "reception"],
  thumbnail: "/themes/monochrome-loft/thumbnail.svg",

  palette: {
    accent: "oklch(0.12 0 0)",
    accentSoft: "oklch(0.72 0.005 260)",
    tint: "oklch(0.86 0.003 90)",
    paper: "oklch(0.93 0.004 90)",
    paperLight: "oklch(0.975 0.008 90)",
    paperDark: "oklch(0.72 0.005 260)",
    highlight: "oklch(0.99 0.002 90)",
    surface: "oklch(0.93 0.004 90)",
    scratchFoil: "oklch(0.86 0.003 90)",
    scratchInk: "oklch(0.12 0 0)",
    background: "oklch(0.975 0.008 90)",
    foreground: "oklch(0.12 0 0)",
    muted: "oklch(0.45 0 0)",
    border: "oklch(0.72 0.005 260)",
  },

  typography: {
    serif: "Archivo",
    sans: "Inter",
    fontsHref:
      "https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap",
  },

  ornamentation: "geometric",

  assets: {
    defaultMusic: "/themes/dubai-silk/track.mp3",
  },

  motion: {
    reveal: "blinds",
    openMs: 1400,
    introSeconds: 6,
    musicFadeMs: 8000,
    maxVolume: 0.6,
    scratchThreshold: 0.38,
    petals: "none",
  },

  kicker: "BROOKLYN LOFT BLINDS",
  tagline:
    "Black-and-ivory invitation that opens in a cascade of flipping blinds, drawn with a clean geometric frame for a Brooklyn loft wedding.",
  features: [
    "Flipping Blinds Opening",
    "Minimal Geometric Frame",
    "Scratch-to-Reveal Date",
    "Strict Monochrome Dress Code",
  ],

  copy: {
    scratchTitle: "A date to remember",
    scratchHint: "Scratch to reveal",
  },

  ornament: "✧",
};
