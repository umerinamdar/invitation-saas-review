import type { Theme } from "./types";

/**
 * Lovable-20 conversion (2026-10-25), source project i09-gujarati-patola.
 * Palette ported from that project's own styles.css tokens; no photography
 * (the export had no binary assets) — drawn geometric ornamentation instead
 * (patola ikat weaving is famous for intricate geometric patterns).
 */
export const gujaratiPatola: Theme = {
  id: "gujarati-patola",
  name: "Gujarati Patola",
  tier: "classic",
  tradition: "traditional",
  religion: "hindu",
  occasions: ["wedding", "engagement", "reception", "sangeet"],
  thumbnail: "/themes/gujarati-patola/thumbnail.svg",

  palette: {
    accent: "oklch(0.72 0.11 78)",
    accentSoft: "oklch(0.91 0.03 78)",
    tint: "oklch(0.76 0.14 78)",
    paper: "oklch(0.935 0.03 75)",
    paperLight: "oklch(0.965 0.022 85)",
    paperDark: "oklch(0.78 0.07 78)",
    highlight: "oklch(0.99 0.008 85)",
    surface: "oklch(0.935 0.03 75)",
    scratchFoil: "oklch(0.91 0.03 78)",
    scratchInk: "oklch(0.25 0.04 30)",
    background: "oklch(0.965 0.022 85)",
    foreground: "oklch(0.25 0.04 30)",
    muted: "oklch(0.45 0.04 40)",
    border: "oklch(0.78 0.07 78)",
  },

  typography: {
    serif: "Rozha One",
    sans: "Hind",
    fontsHref:
      "https://fonts.googleapis.com/css2?family=Rozha+One&family=Hind:wght@400;500;600&display=swap",
  },

  ornamentation: "geometric",

  assets: {
    defaultMusic: "/themes/dubai-silk/track.mp3",
  },

  motion: {
    reveal: "scroll",
    openMs: 1500,
    introSeconds: 6,
    musicFadeMs: 8000,
    maxVolume: 0.6,
    scratchThreshold: 0.38,
    petals: "marigold",
  },

  kicker: "AHMEDABAD PATOLA SCROLL",
  tagline:
    "Crimson and mustard invitation that rolls open like a patola scroll, drawn with an ikat geometric frame for an Ahmedabad wedding.",
  features: [
    "Scroll-Rolls-Up Opening",
    "Patola Ikat Frame",
    "Scratch-to-Reveal Muhurat",
    "Falling Marigold Petals",
  ],

  copy: {
    scratchTitle: "A muhurat to remember",
    scratchHint: "Scratch to reveal",
  },

  ornament: "✧",
};
