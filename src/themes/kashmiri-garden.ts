import type { Theme } from "./types";

/**
 * Lovable-20 conversion (2026-10-25), source project i07-kashmiri-garden.
 * Palette ported from that project's own styles.css tokens; no photography
 * (the export had no binary assets) — drawn paisley ornamentation instead
 * (Kashmir is the historic home of the paisley/boteh motif).
 */
export const kashmiriGarden: Theme = {
  id: "kashmiri-garden",
  name: "Kashmiri Garden",
  tier: "classic",
  tradition: "traditional",
  religion: "muslim",
  occasions: ["wedding", "engagement", "reception", "nikah"],
  thumbnail: "/themes/kashmiri-garden/thumbnail.svg",

  palette: {
    accent: "oklch(0.72 0.12 80)",
    accentSoft: "oklch(0.9 0.04 75)",
    tint: "oklch(0.38 0.06 205)",
    paper: "oklch(0.92 0.03 80)",
    paperLight: "oklch(0.97 0.018 85)",
    paperDark: "oklch(0.72 0.12 80 / 55%)",
    highlight: "oklch(0.99 0.008 85)",
    surface: "oklch(0.92 0.03 80)",
    scratchFoil: "oklch(0.9 0.04 75)",
    scratchInk: "oklch(0.32 0.04 50)",
    background: "oklch(0.97 0.018 85)",
    foreground: "oklch(0.32 0.04 50)",
    muted: "oklch(0.45 0.04 55)",
    border: "oklch(0.72 0.12 80 / 45%)",
  },

  typography: {
    serif: "Amiri",
    sans: "Cormorant Garamond",
    fontsHref:
      "https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&display=swap",
  },

  ornamentation: "paisley",

  assets: {
    defaultMusic: "/themes/dubai-silk/track.mp3",
  },

  motion: {
    reveal: "wrap",
    openMs: 1400,
    introSeconds: 6,
    musicFadeMs: 8000,
    maxVolume: 0.6,
    scratchThreshold: 0.38,
    petals: "none",
  },

  kicker: "SRINAGAR DAL LAKE WRAP",
  tagline:
    "Rust and teal invitation that wraps open top and bottom, drawn with a Kashmiri paisley frame for a Nikah by Dal Lake.",
  features: [
    "Vertical Wrap Opening",
    "Kashmiri Paisley Frame",
    "Scratch-to-Reveal Date",
    "Wazwan-Feast Copy",
  ],

  copy: {
    scratchTitle: "A date to remember",
    scratchHint: "Scratch to reveal",
  },

  ornament: "✦",
};
