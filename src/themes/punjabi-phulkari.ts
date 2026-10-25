import type { Theme } from "./types";

/**
 * Lovable-20 conversion (2026-10-25), source project i06-punjabi-phulkari.
 * Palette ported from that project's own styles.css tokens; no photography
 * (the export had no binary assets) — drawn botanical ornamentation instead
 * (phulkari literally means "flower work" embroidery). Distinct from the
 * existing "Phulkari Anand" theme (different couple, different design).
 */
export const punjabiPhulkari: Theme = {
  id: "punjabi-phulkari",
  name: "Punjabi Phulkari",
  tier: "classic",
  tradition: "traditional",
  religion: "sikh",
  occasions: ["wedding", "engagement", "reception"],
  thumbnail: "/themes/punjabi-phulkari/thumbnail.svg",

  palette: {
    accent: "oklch(0.78 0.13 80)",
    accentSoft: "oklch(0.93 0.04 70)",
    tint: "oklch(0.7 0.18 50)",
    paper: "oklch(0.96 0.025 75)",
    paperLight: "oklch(0.985 0.015 80)",
    paperDark: "oklch(0.78 0.1 75)",
    highlight: "oklch(0.99 0.01 85)",
    surface: "oklch(0.96 0.025 75)",
    scratchFoil: "oklch(0.93 0.04 70)",
    scratchInk: "oklch(0.28 0.08 22)",
    background: "oklch(0.985 0.015 80)",
    foreground: "oklch(0.28 0.08 22)",
    muted: "oklch(0.45 0.06 30)",
    border: "oklch(0.78 0.1 75)",
  },

  typography: {
    serif: "Rozha One",
    sans: "Mukta",
    fontsHref:
      "https://fonts.googleapis.com/css2?family=Rozha+One&family=Mukta:wght@400;500;600&display=swap",
  },

  ornamentation: "botanical",

  assets: {
    defaultMusic: "/themes/dubai-silk/track.mp3",
  },

  motion: {
    reveal: "fan",
    openMs: 1400,
    introSeconds: 6,
    musicFadeMs: 8000,
    maxVolume: 0.6,
    scratchThreshold: 0.38,
    petals: "marigold",
  },

  kicker: "AMRITSAR PHULKARI FAN",
  tagline:
    "Maroon and tangerine invitation that fans open from a single pivot, drawn with a phulkari floral frame for an Amritsar Anand Karaj.",
  features: [
    "Fan-Open Reveal",
    "Phulkari Floral Frame",
    "Scratch-to-Reveal Date",
    "Falling Marigold Petals",
  ],

  copy: {
    scratchTitle: "A date to remember",
    scratchHint: "Scratch to reveal",
  },

  ornament: "✿",
};
