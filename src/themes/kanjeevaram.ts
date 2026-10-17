import type { Theme } from "./types";

/**
 * Maroon Kanjeevaram silk and gold zari, parting on heavy drapes into a
 * temple courtyard at dawn. Artwork and palette generated in Lovable from
 * LOVABLE-BRIEF.md; the backdrop was composed around the curtains.
 */
export const kanjeevaram: Theme = {
  id: "kanjeevaram",
  name: "Kanjeevaram",
  tier: "royal",
  occasions: ["wedding", "reception", "engagement"],
  thumbnail: "/themes/kanjeevaram/hero.jpg",

  palette: {
    accent: "#c9a24a",
    accentSoft: "#e6cf8f",
    tint: "#7a1424",
    paper: "#f4ead6",
    paperLight: "#fbf5e8",
    paperDark: "#e3d2ad",
    highlight: "#f7e3a1",
    surface: "#4a0c16",
    scratchFoil: "#b8913b",
    scratchInk: "#3a0911",
    background: "#2a060c",
    foreground: "#f8eedb",
    muted: "#c8b39a",
    border: "#8a6a2e",
  },

  typography: {
    serif: "Cormorant Garamond",
    sans: "Jost",
    fontsHref:
      "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,400;1,500&family=Jost:wght@300;400;500&display=swap",
  },

  ornamentation: "none",

  assets: {
    sealedBackdrop: "/themes/kanjeevaram/sealed.jpg",
    revealedBackdrop: "/themes/kanjeevaram/hero.jpg",
    sealDisc: "/themes/kanjeevaram/seal.png",
    paperTexture: "/themes/kanjeevaram/paper.jpg",
  },

  motion: {
    reveal: "curtain",
    openMs: 1700,
    introSeconds: 6,
    musicFadeMs: 8000,
    maxVolume: 0.6,
    scratchThreshold: 0.38,
    petals: "rose",
  },

  kicker: "SILK DRAPES",
  tagline:
    "Maroon Kanjeevaram silk and gold zari invitation whose heavy drapes sweep apart onto a temple courtyard at dawn, lit by rows of brass lamps.",
  features: [
    "Silk Drape Reveal",
    "Temple Courtyard at Dawn",
    "Scratch-to-Reveal Muhurat",
    "Rose Petal Shower",
  ],

  copy: {
    scratchTitle: "The auspicious day",
    scratchHint: "Scratch to reveal",
  },

  ornament: "✺",
};
