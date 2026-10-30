import type { Theme } from "./types";

/**
 * Lovable-20 conversion (2026-10-25), source project p02-chateau-de-fleurs.
 * Palette ported from that project's own styles.css tokens; no photography
 * (the export had no binary assets) — drawn botanical ornamentation instead.
 */
export const chateauDeFleurs: Theme = {
  id: "chateau-de-fleurs",
  name: "Château de Fleurs",
  tier: "classic",
  tradition: "traditional",
  occasions: ["wedding", "engagement", "reception"],
  thumbnail: "/themes/chateau-de-fleurs/thumbnail.svg",

  palette: {
    accent: "oklch(0.68 0.1 78)",
    accentSoft: "oklch(0.82 0.07 82)",
    tint: "oklch(0.86 0.05 18)",
    paper: "oklch(0.94 0.015 80)",
    paperLight: "oklch(0.975 0.014 85)",
    paperDark: "oklch(0.84 0.05 80)",
    highlight: "oklch(0.985 0.01 85)",
    surface: "oklch(0.955 0.018 80)",
    scratchFoil: "oklch(0.9 0.04 20)",
    scratchInk: "oklch(0.32 0.03 60)",
    background: "oklch(0.975 0.014 85)",
    foreground: "oklch(0.32 0.03 60)",
    muted: "oklch(0.5 0.03 60)",
    border: "oklch(0.84 0.05 80)",
  },

  typography: {
    serif: "Playfair Display",
    sans: "Jost",
    fontsHref:
      "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Jost:wght@400;500;600&display=swap",
  },

  ornamentation: "botanical",

  assets: {
    defaultMusic: "/themes/dubai-silk/track.mp3",
  },

  motion: {
    reveal: "doors",
    openMs: 1400,
    introSeconds: 6,
    musicFadeMs: 8000,
    maxVolume: 0.6,
    scratchThreshold: 0.38,
    petals: "rose",
  },

  kicker: "PROVENÇAL GARDEN DOORS",
  tagline:
    "Blush and gold château invitation that opens through two carved garden doors, drawn with a trailing botanical frame for a French countryside wedding.",
  features: [
    "Carved Garden Doors",
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
