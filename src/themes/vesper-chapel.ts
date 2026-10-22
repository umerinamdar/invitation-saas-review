import type { Theme } from "./types";

/**
 * Warm ivory and antique gold, opening like a lifted keepsake box onto a
 * candlelit Gothic nave. Artwork and palette generated in Lovable — a
 * warmer, more intimate counterpart to Cathedral Light's cool ivory rose
 * window.
 */
export const vesperChapel: Theme = {
  id: "vesper-chapel",
  name: "Vesper Chapel",
  tier: "royal",
  religion: "christian",
  tradition: "traditional", // Gothic chapel
  occasions: ["wedding", "engagement", "reception"],
  thumbnail: "/themes/vesper-chapel/hero.jpg",

  palette: {
    accent: "#8a5a1f",
    accentSoft: "#b98a4a",
    tint: "#e3c48a",
    paper: "#f2e6cf",
    paperLight: "#f9f1e2",
    paperDark: "#ddc49a",
    highlight: "#e7cd94",
    surface: "#fbf6ea",
    scratchFoil: "#c99a4d",
    scratchInk: "#3f2a12",
    background: "#241607",
    foreground: "#3c2c16",
    muted: "#786249",
    border: "#c99a4d",
  },

  typography: {
    serif: "Cormorant Garamond",
    sans: "Jost",
    fontsHref:
      "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,400;1,500&family=Jost:wght@300;400;500&display=swap",
  },

  ornamentation: "none",

  // The default dark-brown palette.foreground all but disappears against the
  // dim, amber-lit nave photo behind the names — lift it to a warm ivory so
  // it reads clearly over the candlelit backdrop.
  namesColor: "#f3e6c8",

  assets: {
    sealedBackdrop: "/themes/vesper-chapel/sealed.jpg",
    revealedBackdrop: "/themes/vesper-chapel/hero.jpg",
    // A tall, seamlessly-tiling continuation of the hero scene — the
    // candlelit columns dissolving into a soft ivory-and-gold gradient —
    // that runs behind every section after the hero instead of a flat colour.
    sectionBackdrop: "/themes/vesper-chapel/section-bg.jpg",
    // Shares Cathedral Light's neutral ivory grain — both themes are
    // Christian-tradition and sit in a related palette family.
    paperTexture: "/themes/cathedral-light/paper.jpg",
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
    "Warm ivory and antique gold invitation whose lifted keepsake box opens onto a candlelit Gothic nave, aisle stretching toward a glowing altar.",
  features: [
    "Lifting Keepsake Box",
    "Candlelit Nave Hero",
    "Scratch-to-Reveal Date",
    "White Blossom Shower",
  ],

  copy: {
    scratchTitle: "The day",
    scratchHint: "Scratch to reveal",
  },

  ornament: "✛",
};
