import type { Theme } from "./types";

/**
 * Lovable-20 conversion (2026-10-25), source project i05-bengali-jamdani.
 * Palette ported from that project's own styles.css tokens; no photography
 * (the export had no binary assets) — drawn geometric ornamentation instead
 * (jamdani weaving is itself a fine geometric motif).
 */
export const bengaliJamdani: Theme = {
  id: "bengali-jamdani",
  name: "Bengali Jamdani",
  tier: "classic",
  tradition: "traditional",
  religion: "hindu",
  occasions: ["wedding", "engagement", "reception"],
  thumbnail: "/themes/bengali-jamdani/thumbnail.svg",

  palette: {
    accent: "oklch(0.74 0.12 80)",
    accentSoft: "oklch(0.93 0.025 70)",
    tint: "oklch(0.58 0.14 40)",
    paper: "oklch(0.94 0.015 75)",
    paperLight: "oklch(0.99 0.006 85)",
    paperDark: "oklch(0.82 0.05 70)",
    highlight: "oklch(0.99 0.006 85)",
    surface: "oklch(0.955 0.012 75)",
    scratchFoil: "oklch(0.93 0.025 70)",
    scratchInk: "oklch(0.28 0.05 30)",
    background: "oklch(0.99 0.006 85)",
    foreground: "oklch(0.28 0.05 30)",
    muted: "oklch(0.5 0.04 40)",
    border: "oklch(0.82 0.05 70)",
  },

  typography: {
    serif: "Rozha One",
    sans: "Hind Siliguri",
    fontsHref:
      "https://fonts.googleapis.com/css2?family=Rozha+One&family=Hind+Siliguri:wght@400;500;600&display=swap",
  },

  ornamentation: "geometric",

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
    petals: "marigold",
  },

  kicker: "KOLKATA JAMDANI BOOK",
  tagline:
    "Terracotta and gold invitation that opens like a folded book, drawn with a jamdani-weave frame for a Kolkata wedding.",
  features: [
    "Book-Opens Reveal",
    "Jamdani-Weave Frame",
    "Scratch-to-Reveal Date",
    "Falling Marigold Petals",
  ],

  copy: {
    scratchTitle: "A date to remember",
    scratchHint: "Scratch to reveal",
  },

  ornament: "✧",
};
