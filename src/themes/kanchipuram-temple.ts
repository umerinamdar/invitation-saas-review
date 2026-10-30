import type { Theme } from "./types";

/**
 * Lovable-20 conversion (2026-10-25), source project i10-kanchipuram-temple.
 * Palette ported from that project's own styles.css tokens; no photography
 * (the export had no binary assets) — drawn temple ornamentation instead
 * (a literal match for a kalyana mandapam wedding).
 */
export const kanchipuramTemple: Theme = {
  id: "kanchipuram-temple",
  name: "Kanchipuram Temple",
  tier: "royal",
  tradition: "traditional",
  religion: "hindu",
  occasions: ["wedding", "engagement", "reception"],
  thumbnail: "/themes/kanchipuram-temple/thumbnail.svg",

  palette: {
    accent: "oklch(0.74 0.12 80)",
    accentSoft: "oklch(0.88 0.07 85)",
    tint: "oklch(0.83 0.15 85)",
    paper: "oklch(0.96 0.025 85)",
    paperLight: "oklch(0.985 0.015 85)",
    paperDark: "oklch(0.8 0.07 80)",
    highlight: "oklch(0.99 0.008 85)",
    surface: "oklch(0.96 0.025 85)",
    scratchFoil: "oklch(0.88 0.07 85)",
    scratchInk: "oklch(0.27 0.06 22)",
    background: "oklch(0.985 0.015 85)",
    foreground: "oklch(0.27 0.06 22)",
    muted: "oklch(0.45 0.05 30)",
    border: "oklch(0.8 0.07 80)",
  },

  typography: {
    serif: "Rozha One",
    sans: "Hind",
    fontsHref:
      "https://fonts.googleapis.com/css2?family=Rozha+One&family=Hind:wght@400;500;600&display=swap",
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

  kicker: "KANCHIPURAM MANDAPAM QUADRANT",
  tagline:
    "Maroon and turmeric invitation that opens as four panels sweep to the corners, drawn with a temple gopuram frame for a kalyana mandapam wedding.",
  features: [
    "Four-Panel Quadrant Opening",
    "Temple Gopuram Frame",
    "Scratch-to-Reveal Muhurtham",
    "Falling Marigold Petals",
  ],

  copy: {
    scratchTitle: "A muhurtham to remember",
    scratchHint: "Scratch to reveal",
  },

  ornament: "✦",
};
