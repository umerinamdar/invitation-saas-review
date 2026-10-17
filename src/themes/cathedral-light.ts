import type { Theme } from "./types";

/**
 * Ivory and warm stone, opening through carved oak doors into a cathedral
 * in late light. Artwork and palette generated in Lovable from
 * LOVABLE-BRIEF.md.
 */
export const cathedralLight: Theme = {
  id: "cathedral-light",
  name: "Cathedral Light",
  tier: "royal",
  occasions: ["wedding", "engagement", "reception"],
  thumbnail: "/themes/cathedral-light/hero.jpg",

  palette: {
    accent: "#b8924a",
    accentSoft: "#d9c08a",
    tint: "#e9cfc6",
    paper: "#f3ebdd",
    paperLight: "#faf6ee",
    paperDark: "#e4d6bf",
    highlight: "#f6e7b8",
    surface: "#fbf8f2",
    scratchFoil: "#c9a55c",
    scratchInk: "#6b4e2e",
    background: "#f5efe4",
    foreground: "#3a2e25",
    muted: "#8a7764",
    border: "#d8c7a6",
  },

  typography: {
    serif: "Cormorant Garamond",
    sans: "Jost",
    fontsHref:
      "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,400;1,500&family=Jost:wght@300;400;500&display=swap",
  },

  ornamentation: "none",

  assets: {
    sealedBackdrop: "/themes/cathedral-light/sealed.jpg",
    revealedBackdrop: "/themes/cathedral-light/hero.jpg",
    sealDisc: "/themes/cathedral-light/seal.png",
    paperTexture: "/themes/cathedral-light/paper.jpg",
  },

  motion: {
    reveal: "doors",
    openMs: 1600,
    introSeconds: 6,
    musicFadeMs: 8000,
    maxVolume: 0.55,
    scratchThreshold: 0.38,
    petals: "white-blossom",
  },

  kicker: "CARVED OAK DOORS",
  tagline:
    "Ivory and warm stone invitation whose carved oak doors swing inward on a cathedral lit by its rose window and candles.",
  features: [
    "Carved Door Opening",
    "Rose Window Light",
    "Scratch-to-Reveal Date",
    "White Petal Shower",
  ],

  copy: {
    scratchTitle: "The day",
    scratchHint: "Scratch to reveal",
  },

  ornament: "✦",
};
