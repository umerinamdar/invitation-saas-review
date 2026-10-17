import type { Theme } from "./types";

/** Maroon silk and gold zari beneath a temple gopuram, opening on carved doors. */
export const kanjeevaram: Theme = {
  id: "kanjeevaram",
  name: "Kanjeevaram",
  tier: "classic",
  occasions: ["wedding", "reception", "engagement"],
  thumbnail: "/themes/thumbs/kanjeevaram.svg",

  palette: {
    accent: "oklch(0.76 0.135 84)",
    accentSoft: "oklch(0.86 0.1 86)",
    tint: "oklch(0.48 0.14 20)",
    paper: "oklch(0.35 0.12 18)",
    paperLight: "oklch(0.43 0.13 20)",
    paperDark: "oklch(0.27 0.1 17)",
    highlight: "oklch(0.91 0.07 82)",
    surface: "oklch(0.32 0.115 18)",
    scratchFoil: "oklch(0.39 0.125 19)",
    scratchInk: "oklch(0.93 0.07 84)",
    background: "oklch(0.21 0.08 16)",
    foreground: "oklch(0.95 0.05 84)",
    muted: "oklch(0.77 0.07 86)",
    border: "oklch(0.5 0.12 25)",
  },

  typography: {
    serif: "Marcellus",
    sans: "Montserrat",
    fontsHref:
      "https://fonts.googleapis.com/css2?family=Marcellus&family=Montserrat:wght@300;400;600&display=swap",
  },

  ornamentation: "temple",
  assets: { defaultMusic: "/themes/dubai-silk/track.mp3" },

  motion: {
    reveal: "doors",
    openMs: 1600,
    introSeconds: 6,
    musicFadeMs: 8000,
    maxVolume: 0.6,
    scratchThreshold: 0.38,
    petals: "marigold",
  },

  kicker: "TEMPLE GOPURAM",
  tagline:
    "Maroon Kanjeevaram silk and gold zari invitation framed by a temple gopuram, opening through carved doors.",
  features: [
    "Carved Door Opening",
    "Temple Gopuram Frame",
    "Gold Zari Borders",
    "Marigold Shower",
  ],

  copy: {
    scratchTitle: "The auspicious day",
    scratchHint: "Scratch to reveal",
  },
  ornament: "✺",
};
