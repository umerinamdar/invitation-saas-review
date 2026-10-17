import type { Theme } from "./types";

/**
 * Marigold and saffron, opening through carved wooden doors into a mandap
 * at golden hour. Artwork and palette generated in Lovable from
 * LOVABLE-BRIEF.md; the backdrop was composed around the doors, so the
 * mechanic and the painting match.
 */
export const kesariMandap: Theme = {
  id: "kesari-mandap",
  name: "Kesari Mandap",
  tier: "royal",
  occasions: ["wedding", "haldi", "mehendi", "reception"],
  thumbnail: "/themes/kesari-mandap/hero.jpg",

  palette: {
    accent: "#9e1b1b",
    accentSoft: "#c8553d",
    tint: "#f29f1c",
    paper: "#f6e7c8",
    paperLight: "#fdf5e4",
    paperDark: "#e3c690",
    highlight: "#d4a43a",
    surface: "#fff9ee",
    scratchFoil: "#c9962e",
    scratchInk: "#5a1010",
    background: "#3a0d0a",
    foreground: "#3b1a10",
    muted: "#7d5a3c",
    border: "#d9b36a",
  },

  typography: {
    serif: "Cormorant Garamond",
    sans: "Jost",
    fontsHref:
      "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,400;1,500&family=Jost:wght@300;400;500&display=swap",
  },

  ornamentation: "none",

  assets: {
    sealedBackdrop: "/themes/kesari-mandap/sealed.jpg",
    revealedBackdrop: "/themes/kesari-mandap/hero.jpg",
    sealDisc: "/themes/kesari-mandap/seal.png",
    paperTexture: "/themes/kesari-mandap/paper.jpg",
  },

  motion: {
    reveal: "doors",
    openMs: 1600,
    introSeconds: 6,
    musicFadeMs: 8000,
    maxVolume: 0.6,
    scratchThreshold: 0.38,
    petals: "marigold",
  },

  kicker: "CARVED DOORS",
  tagline:
    "Marigold and saffron invitation whose carved wooden doors swing open onto a mandap at golden hour, strung with garlands and lit by brass lamps.",
  features: [
    "Carved Door Opening",
    "Golden Hour Mandap",
    "Scratch-to-Reveal Muhurat",
    "Marigold Petal Shower",
  ],

  copy: {
    scratchTitle: "The muhurat",
    scratchHint: "Scratch to reveal",
  },

  ornament: "✸",
};
