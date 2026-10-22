import type { Theme } from "./types";

/**
 * White marble and emerald green, opening like a sealed envelope onto
 * Al-Masjid an-Nabawi's green dome at dusk. Artwork and palette generated
 * in Lovable — architecture only, dignified and serene.
 */
export const madina: Theme = {
  id: "madina",
  name: "Madina",
  tier: "royal",
  religion: "muslim",
  tradition: "traditional",
  occasions: ["wedding", "nikah", "reception"],
  thumbnail: "/themes/madina/hero.jpg",

  palette: {
    accent: "#0e6b4f",
    accentSoft: "#4a9c82",
    tint: "#d9c27a",
    paper: "#f3efe4",
    paperLight: "#faf8f1",
    paperDark: "#e2dbc6",
    highlight: "#e7d9a8",
    surface: "#fbfaf4",
    scratchFoil: "#c9b474",
    scratchInk: "#163a2d",
    background: "#0f2a20",
    foreground: "#1c3b30",
    muted: "#5f7468",
    border: "#c9b474",
  },

  typography: {
    serif: "Cormorant Garamond",
    sans: "Jost",
    fontsHref:
      "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,400;1,500&family=Jost:wght@300;400;500&display=swap",
  },

  ornamentation: "none",

  assets: {
    sealedBackdrop: "/themes/madina/sealed.jpg",
    revealedBackdrop: "/themes/madina/hero.jpg",
    // A tall, seamlessly-tiling continuation of the hero scene — the dome
    // and minarets dissolving into a soft white-and-emerald gradient —
    // that runs behind every section after the hero instead of a flat colour.
    sectionBackdrop: "/themes/madina/section-bg.jpg",
    // Shares Cathedral Light's neutral ivory grain — both themes sit on a
    // light marble palette, so no new texture was generated for this.
    paperTexture: "/themes/cathedral-light/paper.jpg",
  },

  motion: {
    reveal: "envelope",
    openMs: 1400,
    introSeconds: 6,
    musicFadeMs: 8000,
    maxVolume: 0.6,
    scratchThreshold: 0.38,
    petals: "white-blossom",
  },

  kicker: "WAX SEAL ENVELOPE",
  tagline:
    "White marble and emerald invitation that unseals onto Al-Masjid an-Nabawi's green dome at dusk, dignified and serene.",
  features: [
    "Wax Seal Envelope",
    "Dusk Dome Hero",
    "Scratch-to-Reveal Date",
    "White Blossom Shower",
  ],

  copy: {
    scratchTitle: "The day",
    scratchHint: "Scratch to reveal",
  },

  ornament: "◆",
};
