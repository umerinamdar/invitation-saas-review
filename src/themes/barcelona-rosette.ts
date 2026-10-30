import type { Theme } from "./types";

/**
 * Lovable-20 conversion (2026-10-25), source project p04-cathedral-light.
 * Renamed from the source's own "Cathedral Light" — that name collides with
 * an existing live theme (src/themes/cathedral-light.ts, a different
 * couple's design). Owner decision 2026-10-25: keep the existing theme's
 * name, rename this new one. Palette ported from the project's own
 * styles.css tokens; no photography (the export had no binary assets) —
 * drawn mandala (rose-window) ornamentation instead, echoing the iris
 * mechanic's "light through a circular window" idea.
 */
export const barcelonaRosette: Theme = {
  id: "barcelona-rosette",
  name: "Barcelona Rosette",
  tier: "classic",
  tradition: "traditional",
  religion: "christian",
  occasions: ["wedding", "engagement", "reception"],
  thumbnail: "/themes/barcelona-rosette/thumbnail.svg",

  palette: {
    accent: "oklch(0.72 0.12 80)",
    accentSoft: "oklch(0.9 0.03 80)",
    tint: "oklch(0.97 0.018 85)",
    paper: "oklch(0.94 0.022 80)",
    paperLight: "oklch(0.97 0.018 85)",
    paperDark: "oklch(0.78 0.07 80)",
    highlight: "oklch(0.99 0.006 85)",
    surface: "oklch(0.94 0.022 80)",
    scratchFoil: "oklch(0.91 0.025 80)",
    scratchInk: "oklch(0.27 0.04 50)",
    background: "oklch(0.97 0.018 85)",
    foreground: "oklch(0.27 0.04 50)",
    muted: "oklch(0.45 0.04 55)",
    border: "oklch(0.78 0.07 80)",
  },

  typography: {
    serif: "Cinzel",
    sans: "Cormorant Garamond",
    fontsHref:
      "https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600&family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&display=swap",
  },

  ornamentation: "mandala",

  assets: {
    defaultMusic: "/themes/dubai-silk/track.mp3",
  },

  motion: {
    reveal: "iris",
    openMs: 1400,
    introSeconds: 6,
    musicFadeMs: 8000,
    maxVolume: 0.6,
    scratchThreshold: 0.38,
    petals: "white-blossom",
  },

  kicker: "BARCELONA ROSE WINDOW",
  tagline:
    "Gold and ivory invitation that opens like a cathedral rose window — a circular iris of light — drawn with a radiating mandala frame for a Barcelona church wedding.",
  features: [
    "Iris-of-Light Opening",
    "Rose-Window Frame",
    "Scratch-to-Reveal Date",
    "Falling White Blossom",
  ],

  copy: {
    scratchTitle: "A date to remember",
    scratchHint: "Scratch to reveal",
  },

  ornament: "✦",
};
