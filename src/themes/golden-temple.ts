import type { Theme } from "./types";

/**
 * Gold and white, opening like a lifted casket onto the Harmandir Sahib
 * reflected in the Amrit Sarovar at dusk. Artwork and palette generated in
 * Lovable, matching the temple's own gold-on-water glow.
 */
export const goldenTemple: Theme = {
  id: "golden-temple",
  name: "Golden Temple",
  tier: "royal",
  religion: "sikh",
  tradition: "traditional",
  occasions: ["wedding", "reception"],
  thumbnail: "/themes/golden-temple/hero.jpg",

  palette: {
    accent: "#b8860b",
    accentSoft: "#dcb340",
    tint: "#f0d890",
    paper: "#f6ecd2",
    paperLight: "#fcf7e9",
    paperDark: "#e8d6a5",
    highlight: "#ead9a0",
    surface: "#fdf9ee",
    scratchFoil: "#d4af37",
    scratchInk: "#4a3a0f",
    background: "#2b2108",
    foreground: "#3f3214",
    muted: "#7a6b45",
    border: "#d4af37",
  },

  typography: {
    serif: "Cormorant Garamond",
    sans: "Jost",
    fontsHref:
      "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,400;1,500&family=Jost:wght@300;400;500&display=swap",
  },

  ornamentation: "none",

  assets: {
    sealedBackdrop: "/themes/golden-temple/sealed.jpg",
    revealedBackdrop: "/themes/golden-temple/hero.jpg",
    // A tall, seamlessly-tiling continuation of the hero scene — the gold
    // dome dissolving into a soft gold-and-white gradient — that runs
    // behind every section after the hero instead of a flat colour.
    sectionBackdrop: "/themes/golden-temple/section-bg.jpg",
    // Shares Phulkari Anand's warm saffron-ivory grain — both themes are
    // Sikh-tradition and sit in the same palette family.
    paperTexture: "/themes/phulkari-anand/paper.jpg",
  },

  motion: {
    reveal: "box",
    openMs: 1500,
    introSeconds: 6,
    musicFadeMs: 8000,
    maxVolume: 0.6,
    scratchThreshold: 0.38,
    petals: "marigold",
  },

  kicker: "KEEPSAKE BOX",
  tagline:
    "Gold and white invitation whose lifted casket opens onto the Harmandir Sahib reflected in the Amrit Sarovar at dusk.",
  features: [
    "Lifting Casket Opening",
    "Dusk Reflection Hero",
    "Scratch-to-Reveal Date",
    "Marigold Petal Shower",
  ],

  copy: {
    scratchTitle: "The day",
    scratchHint: "Scratch to reveal",
  },

  ornament: "✪",
};
