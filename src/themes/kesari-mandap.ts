import type { Theme } from "./types";

/**
 * Marigold and saffron, turning open like a folded card into a mandap at
 * golden hour. Artwork and palette generated in Lovable from
 * LOVABLE-BRIEF.md. Reveal mechanic moved from "doors" to "book" so the
 * catalog's five opening mechanics spread evenly across all 15 templates
 * instead of repeating — the painted backdrop lifts as one piece either way.
 */
export const kesariMandap: Theme = {
  id: "kesari-mandap",
  name: "Kesari Mandap",
  tier: "royal",
  religion: "hindu",
  tradition: "traditional", // Marigold India
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
    // A tall, seamlessly-tiling continuation of the hero scene — the
    // marigold mandap archway dissolving into a soft saffron gradient —
    // that runs behind every section after the hero instead of a flat colour.
    sectionBackdrop: "/themes/kesari-mandap/section-bg.jpg",
    paperTexture: "/themes/kesari-mandap/paper.jpg",
    defaultMusic: "/themes/dubai-silk/track.mp3",
  },

  motion: {
    reveal: "book",
    openMs: 1600,
    introSeconds: 6,
    musicFadeMs: 8000,
    maxVolume: 0.6,
    scratchThreshold: 0.38,
    petals: "marigold",
  },

  kicker: "FOLDED CARD",
  tagline:
    "Marigold and saffron invitation that turns open like a folded card onto a mandap at golden hour, strung with garlands and lit by brass lamps.",
  features: [
    "Folded Card Opening",
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
