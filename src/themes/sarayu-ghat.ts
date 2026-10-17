import type { Theme } from "./types";

/**
 * Saffron and temple gold, opening as a folded card onto a riverside ghat
 * at dusk. Artwork and palette generated in Lovable from LOVABLE-BRIEF.md.
 */
export const sarayuGhat: Theme = {
  id: "sarayu-ghat",
  name: "Sarayu Ghat",
  tier: "royal",
  occasions: ["wedding", "engagement", "haldi", "reception"],
  thumbnail: "/themes/sarayu-ghat/hero.jpg",

  palette: {
    accent: "#c2501a",
    accentSoft: "#e9a23b",
    tint: "#f3d9a4",
    paper: "#f2e2c0",
    paperLight: "#fbf3df",
    paperDark: "#d6b67e",
    highlight: "#d9ad4f",
    surface: "#fff8ea",
    scratchFoil: "#b8892f",
    scratchInk: "#3a1e0c",
    background: "#16283a",
    foreground: "#3a1e0c",
    muted: "#7a5a3a",
    border: "#b8893f",
  },

  typography: {
    serif: "Cormorant Garamond",
    sans: "Jost",
    fontsHref:
      "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,400;1,500&family=Jost:wght@300;400;500&display=swap",
  },

  ornamentation: "none",

  assets: {
    sealedBackdrop: "/themes/sarayu-ghat/sealed.jpg",
    revealedBackdrop: "/themes/sarayu-ghat/hero.jpg",
    sealDisc: "/themes/sarayu-ghat/seal.png",
    paperTexture: "/themes/sarayu-ghat/paper.jpg",
  },

  motion: {
    reveal: "book",
    openMs: 1500,
    introSeconds: 6,
    musicFadeMs: 8000,
    maxVolume: 0.6,
    scratchThreshold: 0.38,
    petals: "marigold",
  },

  kicker: "FOLDED CARD",
  tagline:
    "Saffron and temple gold invitation that turns open like a folded card onto a riverside ghat at dusk, with diyas floating on still water.",
  features: [
    "Folded Card Opening",
    "Riverside Ghat at Dusk",
    "Scratch-to-Reveal Muhurat",
    "Marigold Petal Shower",
  ],

  copy: {
    scratchTitle: "The muhurat",
    scratchHint: "Scratch to reveal",
  },

  ornament: "✵",
};
