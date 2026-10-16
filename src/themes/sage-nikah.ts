import type { Theme } from "./types";

/**
 * Sage and warm cream with trailing botanicals. Research found nobody
 * serving a minimalist nikah aesthetic — every Muslim template on the market
 * is maroon-and-gold — so this one is a deliberate bet on that gap.
 */
export const sageNikah: Theme = {
  id: "sage-nikah",
  name: "Sage Nikah",
  tier: "classic",
  occasions: ["nikah", "engagement", "wedding"],
  thumbnail: "/themes/thumbs/sage-nikah.svg",

  palette: {
    accent: "oklch(0.56 0.052 148)", // muted sage-green
    accentSoft: "oklch(0.76 0.042 148)",
    tint: "oklch(0.89 0.028 148)",
    paper: "oklch(0.94 0.014 120)",
    paperLight: "oklch(0.975 0.01 110)",
    paperDark: "oklch(0.87 0.02 140)",
    highlight: "oklch(0.995 0.004 110)",
    surface: "oklch(0.96 0.012 125)",
    scratchFoil: "oklch(0.91 0.02 140)",
    scratchInk: "oklch(0.33 0.036 150)",
    background: "oklch(0.98 0.008 115)",
    foreground: "oklch(0.3 0.032 150)",
    muted: "oklch(0.55 0.028 150)",
    border: "oklch(0.85 0.025 145)",
  },

  typography: {
    serif: "Cormorant Garamond",
    sans: "Jost",
    fontsHref:
      "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Jost:wght@300;400;500&display=swap",
  },

  ornamentation: "botanical",

  assets: {
    defaultMusic: "/themes/dubai-silk/track.mp3",
  },

  motion: {
    reveal: "envelope",
    openMs: 1400,
    introSeconds: 5,
    musicFadeMs: 8000,
    maxVolume: 0.55,
    scratchThreshold: 0.38,
    petals: "rose",
  },

  copy: {
    scratchTitle: "Our day",
    scratchHint: "Scratch to reveal",
  },

  ornament: "❧",
};
