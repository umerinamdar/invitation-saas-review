import type { Theme } from "./types";

/**
 * Lovable-20 conversion (2026-10-25), source project p01-ivory-silk-pearls.
 * Palette ported from that project's own styles.css tokens; no photography
 * (the export had no binary assets) — drawn botanical ornamentation instead.
 */
export const ivorySilkPearls: Theme = {
  id: "ivory-silk-pearls",
  name: "Ivory Silk & Pearls",
  tier: "classic",
  tradition: "traditional",
  occasions: ["wedding", "engagement", "reception"],
  thumbnail: "/themes/ivory-silk-pearls/thumbnail.svg",

  palette: {
    accent: "oklch(0.68 0.08 80)",
    accentSoft: "oklch(0.8 0.04 140)",
    tint: "oklch(0.93 0.02 82)",
    paper: "oklch(0.94 0.012 85)",
    paperLight: "oklch(0.985 0.006 90)",
    paperDark: "oklch(0.86 0.03 80)",
    highlight: "oklch(0.99 0.005 85)",
    surface: "oklch(0.965 0.012 85)",
    scratchFoil: "oklch(0.93 0.02 82)",
    scratchInk: "oklch(0.32 0.02 70)",
    background: "oklch(0.985 0.008 85)",
    foreground: "oklch(0.32 0.02 70)",
    muted: "oklch(0.5 0.02 70)",
    border: "oklch(0.86 0.03 80)",
  },

  typography: {
    serif: "Cormorant Garamond",
    sans: "Jost",
    fontsHref:
      "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Jost:wght@400;500;600&display=swap",
  },

  ornamentation: "botanical",

  assets: {
    defaultMusic: "/themes/dubai-silk/track.mp3",
  },

  motion: {
    reveal: "envelope",
    openMs: 1400,
    introSeconds: 6,
    musicFadeMs: 8000,
    maxVolume: 0.6,
    scratchThreshold: 0.38,
    petals: "rose",
  },

  kicker: "LAKE COMO ENVELOPE",
  tagline:
    "Ivory and pearl envelope invitation with a soft botanical frame, built for a lakeside Italian wedding, with a scratch-to-reveal date and a gentle petal fall.",
  features: [
    "Wax Seal Envelope",
    "Botanical Drawn Frame",
    "Scratch-to-Reveal Date",
    "Falling Rose Petals",
  ],

  copy: {
    scratchTitle: "A date to remember",
    scratchHint: "Scratch to reveal",
  },

  ornament: "✿",
};
