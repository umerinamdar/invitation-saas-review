import type { Theme } from "./types";

/**
 * White marble and gold, turning open like a folded card onto the grand
 * courtyard arches of Masjid al-Haram at golden hour. Artwork and palette
 * generated in Lovable — architecture only, dignified and serene.
 */
export const makkah: Theme = {
  id: "makkah",
  name: "Makkah",
  tier: "royal",
  religion: "muslim",
  tradition: "traditional",
  occasions: ["wedding", "nikah", "reception"],
  thumbnail: "/themes/makkah/hero.jpg",

  palette: {
    accent: "#a8831f",
    accentSoft: "#cdab52",
    tint: "#e8d093",
    paper: "#f4efe2",
    paperLight: "#fbf8ef",
    paperDark: "#e3d9bf",
    highlight: "#ecdba6",
    surface: "#fbf9f2",
    scratchFoil: "#cdab52",
    scratchInk: "#3a2f14",
    background: "#241e0f",
    foreground: "#3a3220",
    muted: "#6e6552",
    border: "#cdab52",
  },

  typography: {
    serif: "Cormorant Garamond",
    sans: "Jost",
    fontsHref:
      "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,400;1,500&family=Jost:wght@300;400;500&display=swap",
  },

  ornamentation: "none",

  assets: {
    sealedBackdrop: "/themes/makkah/sealed.jpg",
    revealedBackdrop: "/themes/makkah/hero.jpg",
    // A tall, seamlessly-tiling continuation of the hero scene — the
    // marble arches dissolving into a soft white-and-gold gradient — that
    // runs behind every section after the hero instead of a flat colour.
    sectionBackdrop: "/themes/makkah/section-bg.jpg",
    // Shares Cathedral Light's neutral ivory grain — both themes sit on a
    // light marble palette, so no new texture was generated for this.
    paperTexture: "/themes/cathedral-light/paper.jpg",
  },

  motion: {
    reveal: "book",
    openMs: 1500,
    introSeconds: 6,
    musicFadeMs: 8000,
    maxVolume: 0.6,
    scratchThreshold: 0.38,
    petals: "white-blossom",
  },

  kicker: "FOLDED CARD",
  tagline:
    "White marble and gold invitation that turns open like a folded card onto the grand courtyard arches of Makkah at golden hour.",
  features: [
    "Folded Card Opening",
    "Golden-Hour Arcade Hero",
    "Scratch-to-Reveal Date",
    "White Blossom Shower",
  ],

  copy: {
    scratchTitle: "The day",
    scratchHint: "Scratch to reveal",
  },

  ornament: "✥",
};
