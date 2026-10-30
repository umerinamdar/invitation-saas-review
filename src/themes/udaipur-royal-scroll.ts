import type { Theme } from "./types";

/**
 * Lovable-20 conversion (2026-10-25), source project
 * p10-udaipur-royal-scroll. Palette ported from that project's own
 * styles.css tokens; no photography (the export had no binary assets) —
 * drawn mandala ornamentation instead (royal Rajasthani rangoli geometry).
 */
export const udaipurRoyalScroll: Theme = {
  id: "udaipur-royal-scroll",
  name: "Udaipur Royal Scroll",
  tier: "royal",
  tradition: "traditional",
  religion: "hindu",
  occasions: ["wedding", "engagement", "reception", "sangeet"],
  thumbnail: "/themes/udaipur-royal-scroll/thumbnail.svg",

  palette: {
    accent: "oklch(0.74 0.11 80)",
    accentSoft: "oklch(0.92 0.03 80)",
    tint: "oklch(0.45 0.08 200)",
    paper: "oklch(0.94 0.025 80)",
    paperLight: "oklch(0.97 0.018 85)",
    paperDark: "oklch(0.78 0.08 78)",
    highlight: "oklch(0.99 0.008 85)",
    surface: "oklch(0.94 0.025 80)",
    scratchFoil: "oklch(0.92 0.03 80)",
    scratchInk: "oklch(0.28 0.07 20)",
    background: "oklch(0.97 0.018 85)",
    foreground: "oklch(0.28 0.07 20)",
    muted: "oklch(0.45 0.05 30)",
    border: "oklch(0.78 0.08 78)",
  },

  typography: {
    serif: "Rozha One",
    sans: "Mukta",
    fontsHref:
      "https://fonts.googleapis.com/css2?family=Rozha+One&family=Mukta:wght@400;500;600&display=swap",
  },

  ornamentation: "mandala",

  assets: {
    defaultMusic: "/themes/dubai-silk/track.mp3",
  },

  motion: {
    reveal: "scroll",
    openMs: 1500,
    introSeconds: 6,
    musicFadeMs: 8000,
    maxVolume: 0.6,
    scratchThreshold: 0.38,
    petals: "marigold",
  },

  kicker: "UDAIPUR PALACE SCROLL",
  tagline:
    "Maroon and gold invitation that rolls open like a royal scroll, drawn with a rangoli mandala frame for a City Palace wedding.",
  features: [
    "Scroll-Rolls-Up Opening",
    "Rangoli Mandala Frame",
    "Scratch-to-Reveal Date",
    "Falling Marigold Petals",
  ],

  copy: {
    scratchTitle: "A date to remember",
    scratchHint: "Scratch to reveal",
  },

  ornament: "✦",
};
