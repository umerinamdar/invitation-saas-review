import type { Theme } from "./types";

/**
 * Lovable-20 conversion (2026-10-25), source project p06-emerald-mihrab.
 * Palette ported from that project's own styles.css tokens; no photography
 * (the export had no binary assets) — drawn jali ornamentation instead
 * (the authentic Islamic lattice motif, fitting a mihrab-themed design).
 */
export const emeraldMihrab: Theme = {
  id: "emerald-mihrab",
  name: "Emerald Mihrab",
  tier: "classic",
  tradition: "traditional",
  religion: "muslim",
  occasions: ["wedding", "engagement", "reception", "nikah"],
  thumbnail: "/themes/emerald-mihrab/thumbnail.svg",

  palette: {
    accent: "oklch(0.74 0.11 82)",
    accentSoft: "oklch(0.78 0.05 190)",
    tint: "oklch(0.9 0.04 185)",
    paper: "oklch(0.93 0.02 95)",
    paperLight: "oklch(0.985 0.012 92)",
    paperDark: "oklch(0.8 0.07 85)",
    highlight: "oklch(0.99 0.006 90)",
    surface: "oklch(0.955 0.018 95)",
    scratchFoil: "oklch(0.9 0.04 185)",
    scratchInk: "oklch(0.27 0.06 165)",
    background: "oklch(0.985 0.012 92)",
    foreground: "oklch(0.27 0.06 165)",
    muted: "oklch(0.46 0.04 165)",
    border: "oklch(0.8 0.07 85)",
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
    reveal: "book",
    openMs: 1500,
    introSeconds: 6,
    musicFadeMs: 8000,
    maxVolume: 0.6,
    scratchThreshold: 0.38,
    petals: "none",
  },

  kicker: "DUBAI MIHRAB BOOK",
  tagline:
    "Emerald and gold invitation that opens like a folded book, drawn with an Islamic lattice frame for a Dubai Nikah celebration.",
  features: [
    "Book-Opens Reveal",
    "Jali Lattice Frame",
    "Scratch-to-Reveal Date",
    "Halal-Celebration Copy",
  ],

  copy: {
    scratchTitle: "A date to remember",
    scratchHint: "Scratch to reveal",
  },

  ornament: "✦",
};
