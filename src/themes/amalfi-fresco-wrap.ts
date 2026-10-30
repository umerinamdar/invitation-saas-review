import type { Theme } from "./types";

/**
 * Lovable-20 conversion (2026-10-25), source project p08-amalfi-fresco-wrap.
 * Palette ported from that project's own styles.css tokens; no photography
 * (the export had no binary assets) — drawn deco ornamentation instead
 * (classical Mediterranean fresco borders read as stepped-fan deco lines).
 */
export const amalfiFrescoWrap: Theme = {
  id: "amalfi-fresco-wrap",
  name: "Amalfi Fresco Wrap",
  tier: "classic",
  tradition: "traditional",
  occasions: ["wedding", "engagement", "reception"],
  thumbnail: "/themes/amalfi-fresco-wrap/thumbnail.svg",

  palette: {
    accent: "oklch(0.6 0.13 42)",
    accentSoft: "oklch(0.9 0.04 78)",
    tint: "oklch(0.45 0.1 245)",
    paper: "oklch(0.94 0.025 80)",
    paperLight: "oklch(0.975 0.015 85)",
    paperDark: "oklch(0.82 0.05 60)",
    highlight: "oklch(0.99 0.008 85)",
    surface: "oklch(0.94 0.025 80)",
    scratchFoil: "oklch(0.92 0.03 80)",
    scratchInk: "oklch(0.3 0.035 50)",
    background: "oklch(0.975 0.015 85)",
    foreground: "oklch(0.3 0.035 50)",
    muted: "oklch(0.5 0.035 55)",
    border: "oklch(0.82 0.05 60)",
  },

  typography: {
    serif: "Cormorant Garamond",
    sans: "Jost",
    fontsHref:
      "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Jost:wght@400;500;600&display=swap",
  },

  ornamentation: "deco",

  assets: {
    defaultMusic: "/themes/dubai-silk/track.mp3",
  },

  motion: {
    reveal: "wrap",
    openMs: 1400,
    introSeconds: 6,
    musicFadeMs: 8000,
    maxVolume: 0.6,
    scratchThreshold: 0.38,
    petals: "none",
  },

  kicker: "RAVELLO COASTAL WRAP",
  tagline:
    "Terracotta and sea-blue invitation that wraps open top and bottom, drawn with a stepped deco frame for an Amalfi coast wedding.",
  features: [
    "Vertical Wrap Opening",
    "Deco Drawn Frame",
    "Scratch-to-Reveal Date",
    "Mediterranean Dress-Code Copy",
  ],

  copy: {
    scratchTitle: "A date to remember",
    scratchHint: "Scratch to reveal",
  },

  ornament: "✧",
};
