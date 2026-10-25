import type { Theme } from "./types";

/**
 * Lovable-20 conversion (2026-10-25), source project i08-goan-azulejos.
 * Palette ported from that project's own styles.css tokens; no photography
 * (the export had no binary assets) — drawn geometric ornamentation instead
 * (azulejo tiles are themselves a tessellated geometric motif).
 */
export const goanAzulejos: Theme = {
  id: "goan-azulejos",
  name: "Goan Azulejos",
  tier: "classic",
  tradition: "traditional",
  religion: "christian",
  occasions: ["wedding", "engagement", "reception"],
  thumbnail: "/themes/goan-azulejos/thumbnail.svg",

  palette: {
    accent: "oklch(0.42 0.13 262)",
    accentSoft: "oklch(0.86 0.05 245)",
    tint: "oklch(0.62 0.17 355)",
    paper: "oklch(0.93 0.02 85)",
    paperLight: "oklch(0.99 0.006 90)",
    paperDark: "oklch(0.82 0.04 255)",
    highlight: "oklch(0.985 0.006 90)",
    surface: "oklch(0.955 0.02 85)",
    scratchFoil: "oklch(0.86 0.05 245)",
    scratchInk: "oklch(0.3 0.06 260)",
    background: "oklch(0.99 0.006 90)",
    foreground: "oklch(0.3 0.06 260)",
    muted: "oklch(0.5 0.04 255)",
    border: "oklch(0.82 0.04 255)",
  },

  typography: {
    serif: "Cormorant Garamond",
    sans: "Jost",
    fontsHref:
      "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=Jost:wght@400;500;600&display=swap",
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

  kicker: "GOAN TILE SHUTTER BLINDS",
  tagline:
    "Indigo and pink invitation that opens in a cascade of flipping tile-shutter blinds, drawn with an azulejo frame for a Goan church wedding.",
  features: [
    "Tile-Shutter Blinds Opening",
    "Azulejo Drawn Frame",
    "Scratch-to-Reveal Date",
    "Nuptial-Mass Copy",
  ],

  copy: {
    scratchTitle: "A date to remember",
    scratchHint: "Scratch to reveal",
  },

  ornament: "✧",
};
