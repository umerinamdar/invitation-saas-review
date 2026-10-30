import type { Theme } from "./types";

/**
 * Lovable-20 conversion (2026-10-25), source project p05-marigold-mandap.
 * Palette ported from that project's own styles.css tokens; no photography
 * (the export had no binary assets) — drawn temple ornamentation instead
 * (the mandap is a temple-like ceremonial structure).
 */
export const marigoldMandap: Theme = {
  id: "marigold-mandap",
  name: "Marigold Mandap",
  tier: "royal",
  tradition: "traditional",
  religion: "hindu",
  occasions: ["wedding", "engagement", "reception", "sangeet", "mehendi"],
  thumbnail: "/themes/marigold-mandap/thumbnail.svg",

  palette: {
    accent: "oklch(0.72 0.12 80)",
    accentSoft: "oklch(0.9 0.06 80)",
    tint: "oklch(0.74 0.17 60)",
    paper: "oklch(0.93 0.035 75)",
    paperLight: "oklch(0.97 0.02 85)",
    paperDark: "oklch(0.78 0.08 80)",
    highlight: "oklch(0.99 0.008 85)",
    surface: "oklch(0.93 0.035 75)",
    scratchFoil: "oklch(0.9 0.06 80)",
    scratchInk: "oklch(0.28 0.08 25)",
    background: "oklch(0.97 0.02 85)",
    foreground: "oklch(0.28 0.08 25)",
    muted: "oklch(0.45 0.06 35)",
    border: "oklch(0.78 0.08 80)",
  },

  typography: {
    serif: "Rozha One",
    sans: "Mukta",
    fontsHref:
      "https://fonts.googleapis.com/css2?family=Rozha+One&family=Mukta:wght@400;500;600&display=swap",
  },

  ornamentation: "temple",

  assets: {
    defaultMusic: "/themes/dubai-silk/track.mp3",
  },

  motion: {
    reveal: "quadrant",
    openMs: 1400,
    introSeconds: 6,
    musicFadeMs: 8000,
    maxVolume: 0.6,
    scratchThreshold: 0.38,
    petals: "marigold",
  },

  kicker: "JAIPUR MANDAP QUADRANT",
  tagline:
    "Maroon and marigold invitation that opens as four panels sweep to the corners, drawn with a temple frame for a Jaipur mandap wedding.",
  features: [
    "Four-Panel Quadrant Opening",
    "Temple Drawn Frame",
    "Scratch-to-Reveal Muhurat",
    "Falling Marigold Petals",
  ],

  copy: {
    scratchTitle: "A muhurat to remember",
    scratchHint: "Scratch to reveal",
  },

  ornament: "✦",
};
