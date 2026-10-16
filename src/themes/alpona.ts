import type { Theme } from "./types";

/**
 * Bengali red and white with alpona mandala work — an aesthetic listed in
 * every video catalog and built as a microsite by nobody.
 */
export const alpona: Theme = {
  id: "alpona",
  name: "Alpona",
  tier: "classic",
  occasions: ["wedding", "reception", "engagement"],
  thumbnail: "/themes/thumbs/alpona.svg",

  palette: {
    accent: "oklch(0.52 0.19 28)",
    accentSoft: "oklch(0.72 0.14 30)",
    tint: "oklch(0.88 0.06 32)",
    paper: "oklch(0.96 0.015 70)",
    paperLight: "oklch(0.99 0.008 75)",
    paperDark: "oklch(0.89 0.03 40)",
    highlight: "oklch(0.995 0.004 75)",
    surface: "oklch(0.975 0.012 68)",
    scratchFoil: "oklch(0.93 0.03 42)",
    scratchInk: "oklch(0.36 0.16 28)",
    background: "oklch(0.985 0.008 72)",
    foreground: "oklch(0.3 0.13 28)",
    muted: "oklch(0.54 0.09 30)",
    border: "oklch(0.86 0.05 34)",
  },

  typography: {
    serif: "Playfair Display",
    sans: "Jost",
    fontsHref:
      "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400&family=Jost:wght@300;400;500&display=swap",
  },

  ornamentation: "mandala",
  assets: { defaultMusic: "/themes/dubai-silk/track.mp3" },

  motion: {
    reveal: "envelope",
    openMs: 1400,
    introSeconds: 5,
    musicFadeMs: 8000,
    maxVolume: 0.55,
    scratchThreshold: 0.38,
    petals: "rose",
  },

  copy: { scratchTitle: "Shubho bibaho", scratchHint: "Scratch to reveal" },
  ornament: "✹",
};
