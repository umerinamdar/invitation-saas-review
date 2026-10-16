import type { Theme } from "./types";

/**
 * Deep emerald with a gold jali lattice and carved doors. Ships with no
 * photography: the backdrop and frame are drawn from the palette.
 */
export const mughalZamarrud: Theme = {
  id: "mughal-zamarrud",
  name: "Mughal Zamarrud",
  tier: "classic",
  occasions: ["wedding", "nikah", "reception"],
  thumbnail: "/themes/thumbs/mughal-zamarrud.svg",

  palette: {
    accent: "oklch(0.76 0.115 88)", // antique gold
    accentSoft: "oklch(0.86 0.085 90)",
    tint: "oklch(0.42 0.072 165)",
    paper: "oklch(0.3 0.055 166)",
    paperLight: "oklch(0.38 0.062 167)",
    paperDark: "oklch(0.23 0.043 166)",
    highlight: "oklch(0.88 0.06 92)",
    surface: "oklch(0.28 0.052 166)",
    scratchFoil: "oklch(0.34 0.058 166)",
    scratchInk: "oklch(0.88 0.062 92)",
    background: "oklch(0.17 0.032 165)",
    foreground: "oklch(0.93 0.035 92)",
    muted: "oklch(0.73 0.05 94)",
    border: "oklch(0.45 0.07 120)",
  },

  typography: {
    serif: "Cormorant Garamond",
    sans: "Montserrat",
    fontsHref:
      "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,400&family=Montserrat:wght@300;400;600&display=swap",
  },

  ornamentation: "jali",

  assets: {
    defaultMusic: "/themes/dubai-silk/track.mp3",
  },

  motion: {
    reveal: "doors",
    openMs: 1600,
    introSeconds: 6,
    musicFadeMs: 8000,
    maxVolume: 0.6,
    scratchThreshold: 0.38,
    petals: "none",
  },

  copy: {
    scratchTitle: "The appointed day",
    scratchHint: "Scratch to reveal",
  },

  ornament: "✦",
};
