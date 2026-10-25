import type { Theme } from "./types";

/**
 * Peacock teal and gold, parting on velvet drapes onto a moonlit palace
 * terrace. Artwork and palette generated in Lovable from LOVABLE-BRIEF.md.
 */
export const mayuraMahal: Theme = {
  id: "mayura-mahal",
  name: "Mayura Mahal",
  tier: "royal",
  tradition: "traditional", // Indian palace terrace
  occasions: ["wedding", "reception", "sangeet", "engagement"],
  thumbnail: "/themes/mayura-mahal/hero.jpg",

  palette: {
    accent: "#c9a45c",
    accentSoft: "#e6cf9a",
    tint: "#1f5f63",
    paper: "#0f3a40",
    paperLight: "#17505a",
    paperDark: "#0a262e",
    highlight: "#f6e7b8",
    surface: "#0c2b33",
    scratchFoil: "#b8903f",
    scratchInk: "#f3e3b5",
    background: "#071a24",
    foreground: "#f2e9d8",
    muted: "#9db3b0",
    border: "#8a7340",
  },

  typography: {
    serif: "Cormorant Garamond",
    sans: "Jost",
    fontsHref:
      "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,400;1,500&family=Jost:wght@300;400;500&display=swap",
  },

  ornamentation: "none",

  // Both palette.paperLight and palette.tint are dark teals on this theme
  // (it's a dark palette throughout), so the family-credit lines' default
  // color blends into their dark scrim pill — override with a pale gold.
  familyColor: "#e6cf9a",

  assets: {
    sealedBackdrop: "/themes/mayura-mahal/sealed.jpg",
    revealedBackdrop: "/themes/mayura-mahal/hero.jpg",
    // A tall, seamlessly-tiling continuation of the hero scene — the
    // palace terrace dissolving into a soft peacock-teal-and-gold gradient —
    // that runs behind every section after the hero instead of a flat colour.
    sectionBackdrop: "/themes/mayura-mahal/section-bg.jpg",
    paperTexture: "/themes/mayura-mahal/paper.jpg",
    defaultMusic: "/themes/dubai-silk/track.mp3",
  },

  motion: {
    reveal: "curtain",
    openMs: 1700,
    introSeconds: 6,
    musicFadeMs: 8000,
    maxVolume: 0.6,
    scratchThreshold: 0.38,
    petals: "white-blossom",
  },

  kicker: "VELVET DRAPES",
  tagline:
    "Peacock teal and gold invitation whose velvet drapes sweep apart onto a palace terrace of lotus pools and lamplight under a full moon.",
  features: [
    "Velvet Drape Reveal",
    "Moonlit Terrace Hero",
    "Scratch-to-Reveal Date",
    "Jasmine Petal Shower",
  ],

  copy: {
    scratchTitle: "The evening",
    scratchHint: "Scratch to reveal",
  },

  ornament: "❂",
};
