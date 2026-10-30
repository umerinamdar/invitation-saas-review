import type { Theme } from "./types";

/**
 * Lovable-20 conversion (2026-10-25), source project i02-taj-mughal.
 * Palette ported from that project's own styles.css tokens; no photography
 * (the export had no binary assets) — drawn jali ornamentation instead
 * (authentic Mughal lattice, fitting a Taj-adjacent Nikah design).
 */
export const tajMughal: Theme = {
  id: "taj-mughal",
  name: "Taj Mughal",
  tier: "royal",
  tradition: "traditional",
  religion: "muslim",
  occasions: ["wedding", "engagement", "reception", "nikah"],
  thumbnail: "/themes/taj-mughal/thumbnail.svg",

  palette: {
    accent: "oklch(0.72 0.1 80)",
    accentSoft: "oklch(0.86 0.03 82)",
    tint: "oklch(0.6 0.06 150)",
    paper: "oklch(0.94 0.012 85)",
    paperLight: "oklch(0.99 0.006 85)",
    paperDark: "oklch(0.84 0.05 82)",
    highlight: "oklch(0.99 0.004 85)",
    surface: "oklch(0.965 0.012 85)",
    scratchFoil: "oklch(0.93 0.02 140)",
    scratchInk: "oklch(0.3 0.03 160)",
    background: "oklch(0.99 0.006 85)",
    foreground: "oklch(0.3 0.03 160)",
    muted: "oklch(0.5 0.03 150)",
    border: "oklch(0.84 0.05 82)",
  },

  typography: {
    serif: "Amiri",
    sans: "Cormorant Garamond",
    fontsHref:
      "https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&display=swap",
  },

  ornamentation: "jali",

  assets: {
    defaultMusic: "/themes/dubai-silk/track.mp3",
  },

  motion: {
    reveal: "iris",
    openMs: 1400,
    introSeconds: 6,
    musicFadeMs: 8000,
    maxVolume: 0.6,
    scratchThreshold: 0.38,
    petals: "white-blossom",
  },

  kicker: "AGRA TAJ-VIEW IRIS",
  tagline:
    "Ivory and sage invitation that opens as a circular iris of light, drawn with a Mughal lattice frame for a Taj-view Nikah in Agra.",
  features: [
    "Iris-of-Light Opening",
    "Mughal Jali Frame",
    "Scratch-to-Reveal Date",
    "Falling White Blossom",
  ],

  copy: {
    scratchTitle: "A date to remember",
    scratchHint: "Scratch to reveal",
  },

  ornament: "✦",
};
