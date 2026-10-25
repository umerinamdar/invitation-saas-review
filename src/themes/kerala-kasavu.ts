import type { Theme } from "./types";

/**
 * Lovable-20 conversion (2026-10-25), source project i04-kerala-kasavu.
 * Palette ported from that project's own styles.css tokens; no photography
 * (the export had no binary assets) — drawn botanical ornamentation instead
 * (Kerala's backwaters and greenery).
 */
export const keralaKasavu: Theme = {
  id: "kerala-kasavu",
  name: "Kerala Kasavu",
  tier: "classic",
  tradition: "traditional",
  religion: "hindu",
  occasions: ["wedding", "engagement", "reception"],
  thumbnail: "/themes/kerala-kasavu/thumbnail.svg",

  palette: {
    accent: "oklch(0.74 0.13 80)",
    accentSoft: "oklch(0.93 0.02 85)",
    tint: "oklch(0.45 0.09 145)",
    paper: "oklch(0.945 0.025 85)",
    paperLight: "oklch(0.99 0.008 95)",
    paperDark: "oklch(0.8 0.07 82)",
    highlight: "oklch(0.99 0.006 90)",
    surface: "oklch(0.945 0.025 85)",
    scratchFoil: "oklch(0.93 0.02 85)",
    scratchInk: "oklch(0.3 0.04 70)",
    background: "oklch(0.99 0.008 95)",
    foreground: "oklch(0.3 0.04 70)",
    muted: "oklch(0.5 0.04 70)",
    border: "oklch(0.8 0.07 82)",
  },

  typography: {
    serif: "Marcellus",
    sans: "Mukta",
    fontsHref:
      "https://fonts.googleapis.com/css2?family=Marcellus&family=Mukta:wght@400;500;600&display=swap",
  },

  ornamentation: "botanical",

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

  kicker: "KOLLAM BACKWATERS CURTAIN",
  tagline:
    "Ivory and gold invitation that parts like kasavu curtains, drawn with a botanical frame for a backwater wedding in Kollam.",
  features: [
    "Curtains-Rise Opening",
    "Backwater Botanical Frame",
    "Scratch-to-Reveal Muhurtham",
    "Falling White Blossom",
  ],

  copy: {
    scratchTitle: "A muhurtham to remember",
    scratchHint: "Scratch to reveal",
  },

  ornament: "✿",
};
