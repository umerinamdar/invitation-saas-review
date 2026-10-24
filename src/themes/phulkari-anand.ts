import type { Theme } from "./types";

/**
 * Saffron and ivory phulkari for an Anand Karaj. Only one competitor serves
 * Sikh weddings seriously, which makes this the least contested design here.
 */
export const phulkariAnand: Theme = {
  id: "phulkari-anand",
  name: "Phulkari Anand",
  tier: "classic",
  religion: "sikh",
  tradition: "traditional",
  occasions: ["wedding", "roka", "engagement"],
  thumbnail: "/themes/phulkari-anand/hero.jpg",

  palette: {
    accent: "oklch(0.68 0.16 58)",
    accentSoft: "oklch(0.82 0.11 62)",
    tint: "oklch(0.88 0.07 70)",
    paper: "oklch(0.95 0.025 80)",
    paperLight: "oklch(0.985 0.012 82)",
    paperDark: "oklch(0.88 0.045 68)",
    highlight: "oklch(0.995 0.005 80)",
    surface: "oklch(0.97 0.018 78)",
    scratchFoil: "oklch(0.92 0.04 70)",
    scratchInk: "oklch(0.34 0.09 52)",
    background: "oklch(0.98 0.012 80)",
    foreground: "oklch(0.3 0.075 50)",
    muted: "oklch(0.54 0.07 56)",
    border: "oklch(0.86 0.055 66)",
  },

  typography: {
    serif: "Cormorant Garamond",
    sans: "Inter",
    fontsHref:
      "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,400;1,500&family=Inter:wght@300;400;500&display=swap",
  },

  ornamentation: "none",

  assets: {
    sealedBackdrop: "/themes/phulkari-anand/sealed.jpg",
    revealedBackdrop: "/themes/phulkari-anand/hero.jpg",
    // A tall, seamlessly-tiling continuation of the hero scene — the
    // phulkari-patterned doors dissolving into a soft saffron-and-ivory
    // gradient — runs behind every section after the hero instead of a flat colour.
    sectionBackdrop: "/themes/phulkari-anand/section-bg.jpg",
    paperTexture: "/themes/phulkari-anand/paper.jpg",
    defaultMusic: "/themes/dubai-silk/track.mp3",
  },

  motion: {
    reveal: "doors",
    openMs: 1600,
    introSeconds: 5,
    musicFadeMs: 8000,
    maxVolume: 0.55,
    scratchThreshold: 0.38,
    petals: "marigold",
  },

  kicker: "ANAND KARAJ",
  tagline:
    "Saffron and ivory Sikh invitation with phulkari thread work, opening through carved doors onto the Anand Karaj programme.",
  features: [
    "Carved Door Opening",
    "Phulkari Thread Work",
    "Anand Karaj Programme",
    "Marigold Shower",
  ],

  copy: {
    scratchTitle: "The day of our Anand Karaj",
    scratchHint: "Scratch to reveal",
  },
  ornament: "✶",
};
