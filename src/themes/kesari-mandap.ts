import type { Theme } from "./types";

/** Marigold and deep saffron under a rangoli mandala, opening as a keepsake box. */
export const kesariMandap: Theme = {
  id: "kesari-mandap",
  name: "Kesari Mandap",
  tier: "classic",
  occasions: ["wedding", "haldi", "mehendi"],
  thumbnail: "/themes/thumbs/kesari-mandap.svg",

  palette: {
    accent: "oklch(0.72 0.155 62)",
    accentSoft: "oklch(0.84 0.12 68)",
    tint: "oklch(0.62 0.15 48)",
    paper: "oklch(0.42 0.13 36)",
    paperLight: "oklch(0.5 0.14 40)",
    paperDark: "oklch(0.33 0.11 33)",
    highlight: "oklch(0.92 0.08 78)",
    surface: "oklch(0.38 0.12 35)",
    scratchFoil: "oklch(0.46 0.13 38)",
    scratchInk: "oklch(0.94 0.07 80)",
    background: "oklch(0.26 0.085 32)",
    foreground: "oklch(0.95 0.055 80)",
    muted: "oklch(0.78 0.08 72)",
    border: "oklch(0.52 0.12 45)",
  },

  typography: {
    serif: "Marcellus",
    sans: "Jost",
    fontsHref:
      "https://fonts.googleapis.com/css2?family=Marcellus&family=Jost:wght@300;400;500&display=swap",
  },

  ornamentation: "mandala",
  assets: { defaultMusic: "/themes/dubai-silk/track.mp3" },

  motion: {
    reveal: "box",
    openMs: 1500,
    introSeconds: 5,
    musicFadeMs: 8000,
    maxVolume: 0.6,
    scratchThreshold: 0.38,
    petals: "marigold",
  },

  copy: { scratchTitle: "The muhurat", scratchHint: "Scratch to reveal" },
  ornament: "✸",
};
