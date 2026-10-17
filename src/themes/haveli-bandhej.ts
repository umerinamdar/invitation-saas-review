import type { Theme } from "./types";

/**
 * Marwari terracotta and rose with bandhani paisley. Research found this
 * aesthetic named everywhere and designed nowhere, so it is a bet on a gap.
 */
export const haveliBandhej: Theme = {
  id: "haveli-bandhej",
  name: "Haveli Bandhej",
  tier: "classic",
  occasions: ["wedding", "mehendi", "roka"],
  thumbnail: "/themes/thumbs/haveli-bandhej.svg",

  palette: {
    accent: "oklch(0.56 0.15 28)",
    accentSoft: "oklch(0.74 0.11 32)",
    tint: "oklch(0.86 0.06 38)",
    paper: "oklch(0.93 0.035 62)",
    paperLight: "oklch(0.97 0.02 66)",
    paperDark: "oklch(0.86 0.05 50)",
    highlight: "oklch(0.99 0.008 70)",
    surface: "oklch(0.95 0.028 60)",
    scratchFoil: "oklch(0.9 0.045 52)",
    scratchInk: "oklch(0.36 0.12 28)",
    background: "oklch(0.97 0.018 64)",
    foreground: "oklch(0.32 0.1 28)",
    muted: "oklch(0.55 0.07 32)",
    border: "oklch(0.84 0.06 42)",
  },

  typography: {
    serif: "Cormorant Garamond",
    sans: "Jost",
    fontsHref:
      "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,400&family=Jost:wght@300;400;500&display=swap",
  },

  ornamentation: "paisley",
  assets: { defaultMusic: "/themes/dubai-silk/track.mp3" },

  motion: {
    reveal: "book",
    openMs: 1500,
    introSeconds: 5,
    musicFadeMs: 8000,
    maxVolume: 0.55,
    scratchThreshold: 0.38,
    petals: "marigold",
  },

  kicker: "MARWARI HAVELI",
  tagline:
    "Terracotta and rose Marwari invitation with bandhani paisley, turning open like a folded card from a haveli jharokha.",
  features: [
    "Folded Card Opening",
    "Bandhani Paisley Work",
    "Jharokha Framing",
    "Marigold Shower",
  ],

  copy: { scratchTitle: "Save our date", scratchHint: "Scratch to reveal" },
  ornament: "❁",
};
