import type { Theme } from "./types";

/**
 * Midnight teal and gold on a fine geometric grid, opening as a folded card.
 * Drawn decoration only — no photography.
 */
export const qubooHai: Theme = {
  id: "qubool-hai",
  name: "Qubool Hai",
  tier: "classic",
  occasions: ["nikah", "wedding", "engagement"],
  thumbnail: "/themes/thumbs/qubool-hai.svg",

  palette: {
    accent: "oklch(0.79 0.105 85)",
    accentSoft: "oklch(0.88 0.072 88)",
    tint: "oklch(0.4 0.062 225)",
    paper: "oklch(0.27 0.052 240)",
    paperLight: "oklch(0.34 0.058 240)",
    paperDark: "oklch(0.2 0.04 240)",
    highlight: "oklch(0.9 0.05 88)",
    surface: "oklch(0.25 0.05 238)",
    scratchFoil: "oklch(0.31 0.054 239)",
    scratchInk: "oklch(0.89 0.058 88)",
    background: "oklch(0.15 0.03 240)",
    foreground: "oklch(0.94 0.028 88)",
    muted: "oklch(0.74 0.042 90)",
    border: "oklch(0.42 0.06 230)",
  },

  typography: {
    serif: "Cormorant Garamond",
    sans: "Jost",
    fontsHref:
      "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,400;1,500&family=Jost:wght@300;400;500&display=swap",
  },

  ornamentation: "geometric",

  assets: {},

  motion: {
    reveal: "book",
    openMs: 1500,
    introSeconds: 5,
    musicFadeMs: 8000,
    maxVolume: 0.6,
    scratchThreshold: 0.38,
    petals: "white-blossom",
  },

  kicker: "FOLDED CARD",
  tagline:
    "Midnight navy and gold nikah invitation that turns open like a folded card, on a fine geometric grid.",
  features: [
    "Folded Card Opening",
    "Geometric Grid Work",
    "Scratch-to-Reveal Date",
    "Nikah Ceremony Cards",
  ],

  copy: {
    scratchTitle: "Save the date",
    scratchHint: "Scratch to reveal",
  },

  ornament: "◈",
};
