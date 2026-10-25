import type { Theme } from "./types";

/**
 * Lovable-20 conversion (2026-10-25), source project i01-rajputana-heritage.
 * The source project's own CSS tokens were an unconfigured shadcn default
 * (generic blue-grey, no bespoke colours) — only its fonts (Rozha One,
 * Pinyon Script, Mukta) and its described identity (Samode Palace, Rajput
 * heritage) were distinctive. Palette authored here to match that stated
 * identity rather than the unfinished default tokens. No photography (the
 * export had no binary assets) — drawn jali ornamentation instead (the
 * literal Rajput palace lattice-window motif).
 */
export const rajputanaHeritage: Theme = {
  id: "rajputana-heritage",
  name: "Rajputana Heritage",
  tier: "royal",
  tradition: "traditional",
  religion: "hindu",
  occasions: ["wedding", "engagement", "reception", "sangeet"],
  thumbnail: "/themes/rajputana-heritage/thumbnail.svg",

  palette: {
    accent: "oklch(0.72 0.12 75)",
    accentSoft: "oklch(0.88 0.05 78)",
    tint: "oklch(0.55 0.1 30)",
    paper: "oklch(0.93 0.03 70)",
    paperLight: "oklch(0.97 0.015 80)",
    paperDark: "oklch(0.78 0.08 72)",
    highlight: "oklch(0.99 0.006 85)",
    surface: "oklch(0.93 0.03 70)",
    scratchFoil: "oklch(0.88 0.05 78)",
    scratchInk: "oklch(0.27 0.07 25)",
    background: "oklch(0.97 0.015 80)",
    foreground: "oklch(0.27 0.07 25)",
    muted: "oklch(0.45 0.05 35)",
    border: "oklch(0.78 0.08 72)",
  },

  typography: {
    serif: "Rozha One",
    sans: "Mukta",
    fontsHref:
      "https://fonts.googleapis.com/css2?family=Rozha+One&family=Mukta:wght@400;500;600&display=swap",
  },

  ornamentation: "jali",

  assets: {
    defaultMusic: "/themes/dubai-silk/track.mp3",
  },

  motion: {
    reveal: "doors",
    openMs: 1400,
    introSeconds: 6,
    musicFadeMs: 8000,
    maxVolume: 0.6,
    scratchThreshold: 0.38,
    petals: "marigold",
  },

  kicker: "SAMODE PALACE GATES",
  tagline:
    "Maroon and gold invitation that swings open like palace gates, drawn with a Rajput lattice frame for a Samode Palace wedding.",
  features: [
    "Palace Gates Opening",
    "Rajput Jali Frame",
    "Scratch-to-Reveal Date",
    "Falling Marigold Petals",
  ],

  copy: {
    scratchTitle: "A date to remember",
    scratchHint: "Scratch to reveal",
  },

  ornament: "✦",
};
