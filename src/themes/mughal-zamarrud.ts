import type { Theme } from "./types";

/**
 * Deep emerald and antique gold, opening on carved doors into a marble
 * water garden at dusk.
 *
 * Artwork and palette generated in Lovable from the brief in
 * LOVABLE-BRIEF.md — the first template with real painted backdrops rather
 * than drawn ornament, which is why `ornamentation` is "none": the scenes
 * carry their own arches and framing.
 */
export const mughalZamarrud: Theme = {
  id: "mughal-zamarrud",
  name: "Mughal Zamarrud",
  tier: "royal",
  tradition: "traditional", // Heritage Mughal
  occasions: ["wedding", "nikah", "reception"],
  thumbnail: "/themes/mughal-zamarrud/hero.jpg",

  palette: {
    accent: "#c9a24a",
    accentSoft: "#e3c987",
    tint: "#1f5c47",
    paper: "#f3ead7",
    paperLight: "#fbf6ea",
    paperDark: "#d9c7a0",
    highlight: "#f6e3a8",
    surface: "#0e3b2e",
    scratchFoil: "#b8923e",
    scratchInk: "#0a2a21",
    background: "#07261d",
    foreground: "#f3ead7",
    muted: "#a9b8a8",
    border: "#8a7a45",
  },

  typography: {
    serif: "Cormorant Garamond",
    sans: "Jost",
    fontsHref:
      "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,400;1,500&family=Jost:wght@300;400;500&display=swap",
  },

  ornamentation: "none",

  assets: {
    sealedBackdrop: "/themes/mughal-zamarrud/sealed.jpg",
    revealedBackdrop: "/themes/mughal-zamarrud/hero.jpg",
    sectionBackdrop: "/themes/mughal-zamarrud/section-bg.jpg",
    paperTexture: "/themes/mughal-zamarrud/paper.jpg",
  },

  motion: {
    reveal: "envelope",
    openMs: 1500,
    introSeconds: 6,
    musicFadeMs: 8000,
    maxVolume: 0.6,
    scratchThreshold: 0.38,
    petals: "marigold",
  },

  kicker: "WAX SEAL ENVELOPE",
  tagline:
    "Deep emerald and antique gold Mughal invitation that unseals onto a marble water garden at dusk, lit by lanterns and floating diyas.",
  features: [
    "Wax Seal Envelope",
    "Marble Water Garden Hero",
    "Scratch-to-Reveal Date",
    "Live Countdown",
  ],

  copy: {
    scratchTitle: "The appointed day",
    scratchHint: "Scratch to reveal",
  },

  ornament: "✦",
};
