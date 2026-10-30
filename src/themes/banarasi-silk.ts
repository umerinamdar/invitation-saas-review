import type { Theme } from "./types";

/**
 * Lovable-20 conversion (2026-10-25), source project i03-banarasi-silk.
 * Palette ported from that project's own styles.css tokens; no photography
 * (the export had no binary assets) — drawn paisley ornamentation instead
 * (Banarasi silk sarees are famous for paisley/booti weaves).
 */
export const banarasiSilk: Theme = {
  id: "banarasi-silk",
  name: "Banarasi Silk",
  tier: "royal",
  tradition: "traditional",
  religion: "hindu",
  occasions: ["wedding", "engagement", "reception", "sangeet"],
  thumbnail: "/themes/banarasi-silk/thumbnail.svg",

  palette: {
    accent: "oklch(0.76 0.12 82)",
    accentSoft: "oklch(0.93 0.03 75)",
    tint: "oklch(0.6 0.2 0)",
    paper: "oklch(0.93 0.025 75)",
    paperLight: "oklch(0.985 0.012 80)",
    paperDark: "oklch(0.78 0.09 80)",
    highlight: "oklch(0.99 0.008 85)",
    surface: "oklch(0.965 0.018 75)",
    scratchFoil: "oklch(0.93 0.03 75)",
    scratchInk: "oklch(0.3 0.09 25)",
    background: "oklch(0.985 0.012 80)",
    foreground: "oklch(0.3 0.09 25)",
    muted: "oklch(0.48 0.06 35)",
    border: "oklch(0.78 0.09 80)",
  },

  typography: {
    serif: "Rozha One",
    sans: "Hind",
    fontsHref:
      "https://fonts.googleapis.com/css2?family=Rozha+One&family=Hind:wght@400;500;600&display=swap",
  },

  ornamentation: "paisley",

  assets: {
    defaultMusic: "/themes/dubai-silk/track.mp3",
  },

  motion: {
    reveal: "envelope",
    openMs: 1400,
    introSeconds: 6,
    musicFadeMs: 8000,
    maxVolume: 0.6,
    scratchThreshold: 0.38,
    petals: "marigold",
  },

  kicker: "VARANASI BROCADE ENVELOPE",
  tagline:
    "Crimson and gold invitation that unfolds like a brocade envelope, drawn with a Banarasi paisley frame for a wedding on the Ganges.",
  features: [
    "Brocade Envelope Unfold",
    "Banarasi Paisley Frame",
    "Scratch-to-Reveal Muhurat",
    "Falling Marigold Petals",
  ],

  copy: {
    scratchTitle: "A muhurat to remember",
    scratchHint: "Scratch to reveal",
  },

  ornament: "✦",
};
