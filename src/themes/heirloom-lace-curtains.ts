import type { Theme } from "./types";

/**
 * Lovable-20 conversion (2026-10-25), source project
 * p03-heirloom-lace-curtains. Palette ported from that project's own
 * styles.css tokens; no photography (the export had no binary assets) —
 * drawn geometric (fine lattice, reading as lace) ornamentation instead.
 */
export const heirloomLaceCurtains: Theme = {
  id: "heirloom-lace-curtains",
  name: "Heirloom Lace Curtains",
  tier: "classic",
  tradition: "traditional",
  occasions: ["wedding", "engagement", "reception"],
  thumbnail: "/themes/heirloom-lace-curtains/thumbnail.svg",

  palette: {
    accent: "oklch(0.68 0.085 78)",
    accentSoft: "oklch(0.9 0.035 20)",
    tint: "oklch(0.945 0.022 80)",
    paper: "oklch(0.935 0.02 75)",
    paperLight: "oklch(0.975 0.012 85)",
    paperDark: "oklch(0.8 0.045 78)",
    highlight: "oklch(0.985 0.008 85)",
    surface: "oklch(0.945 0.022 80)",
    scratchFoil: "oklch(0.9 0.035 20)",
    scratchInk: "oklch(0.33 0.025 40)",
    background: "oklch(0.975 0.012 85)",
    foreground: "oklch(0.33 0.025 40)",
    muted: "oklch(0.5 0.03 50)",
    border: "oklch(0.8 0.045 78)",
  },

  typography: {
    serif: "Cormorant Garamond",
    sans: "Jost",
    fontsHref:
      "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Jost:wght@400;500;600&display=swap",
  },

  ornamentation: "geometric",

  assets: {
    defaultMusic: "/themes/dubai-silk/track.mp3",
  },

  motion: {
    reveal: "curtain",
    openMs: 1500,
    introSeconds: 6,
    musicFadeMs: 8000,
    maxVolume: 0.6,
    scratchThreshold: 0.38,
    petals: "white-blossom",
  },

  kicker: "HAMPSHIRE MANOR CURTAINS",
  tagline:
    "Rose and ivory invitation that parts like heirloom lace curtains, with a fine drawn lattice frame for an English manor wedding.",
  features: [
    "Lace Curtain Reveal",
    "Fine Lattice Frame",
    "Scratch-to-Reveal Date",
    "Falling White Blossom",
  ],

  copy: {
    scratchTitle: "A date to remember",
    scratchHint: "Scratch to reveal",
  },

  ornament: "✧",
};
