import type { Theme } from "./types";

/**
 * Emerald and ivory with antique gold, opening as a keepsake box onto a
 * moonlit courtyard. Artwork and palette generated in Lovable from
 * LOVABLE-BRIEF.md.
 */
export const noorHaram: Theme = {
  id: "noor-haram",
  name: "Noor Haram",
  tier: "royal",
  occasions: ["nikah", "wedding", "engagement", "reception"],
  thumbnail: "/themes/noor-haram/hero.jpg",

  palette: {
    accent: "#c9a24b",
    accentSoft: "#e3cb8f",
    tint: "#0f3d2e",
    paper: "#f4eddc",
    paperLight: "#fbf7ec",
    paperDark: "#e6dac0",
    highlight: "#f7e7b4",
    surface: "#0b2a21",
    scratchFoil: "#b8923e",
    scratchInk: "#7a5c1e",
    background: "#071c16",
    foreground: "#f4eddc",
    muted: "#bcae92",
    border: "#d8c79a",
  },

  typography: {
    serif: "Cormorant Garamond",
    sans: "Jost",
    fontsHref:
      "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,400;1,500&family=Jost:wght@300;400;500&display=swap",
  },

  ornamentation: "none",

  assets: {
    sealedBackdrop: "/themes/noor-haram/sealed.jpg",
    revealedBackdrop: "/themes/noor-haram/hero.jpg",
    sealDisc: "/themes/noor-haram/seal.png",
    paperTexture: "/themes/noor-haram/paper.jpg",
  },

  motion: {
    reveal: "box",
    openMs: 1500,
    introSeconds: 6,
    musicFadeMs: 8000,
    maxVolume: 0.6,
    scratchThreshold: 0.38,
    petals: "white-blossom",
  },

  kicker: "KEEPSAKE BOX",
  tagline:
    "Emerald and ivory invitation whose inlaid lid lifts away onto a moonlit courtyard of scalloped arches, hanging lamps and white roses.",
  features: [
    "Lifting Lid Opening",
    "Moonlit Courtyard Hero",
    "Scratch-to-Reveal Date",
    "White Petal Shower",
  ],

  copy: {
    scratchTitle: "The appointed day",
    scratchHint: "Scratch to reveal",
  },

  ornament: "✧",
};
