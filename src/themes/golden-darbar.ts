import type { Theme } from "./types";

/**
 * Lovable-20 conversion (2026-10-25), source project p07-golden-darbar.
 * Palette ported from that project's own styles.css tokens; no photography
 * (the export had no binary assets) — drawn paisley ornamentation instead
 * (the Punjabi textile motif, fitting a Sikh Anand Karaj design).
 */
export const goldenDarbar: Theme = {
  id: "golden-darbar",
  name: "Golden Darbar",
  tier: "royal",
  tradition: "traditional",
  religion: "sikh",
  occasions: ["wedding", "engagement", "reception"],
  thumbnail: "/themes/golden-darbar/thumbnail.svg",

  palette: {
    accent: "oklch(0.76 0.13 80)",
    accentSoft: "oklch(0.92 0.04 80)",
    tint: "oklch(0.68 0.18 50)",
    paper: "oklch(0.95 0.025 80)",
    paperLight: "oklch(0.975 0.018 85)",
    paperDark: "oklch(0.82 0.07 80)",
    highlight: "oklch(0.99 0.008 85)",
    surface: "oklch(0.95 0.025 80)",
    scratchFoil: "oklch(0.92 0.04 80)",
    scratchInk: "oklch(0.28 0.04 55)",
    background: "oklch(0.975 0.018 85)",
    foreground: "oklch(0.28 0.04 55)",
    muted: "oklch(0.48 0.04 60)",
    border: "oklch(0.82 0.07 80)",
  },

  typography: {
    serif: "Cinzel",
    sans: "Jost",
    fontsHref:
      "https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600&family=Jost:wght@400;500;600&display=swap",
  },

  ornamentation: "paisley",

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
    petals: "none",
  },

  kicker: "SOUTHALL ANAND KARAJ FAN",
  tagline:
    "Gold and saffron invitation that fans open from a single pivot, drawn with a paisley frame for a Sikh Anand Karaj celebration.",
  features: [
    "Fan-Open Reveal",
    "Paisley Drawn Frame",
    "Scratch-to-Reveal Date",
    "Alcohol-Free Celebration Copy",
  ],

  copy: {
    scratchTitle: "A date to remember",
    scratchHint: "Scratch to reveal",
  },

  ornament: "✧",
};
