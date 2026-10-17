import type { Theme } from "./types";

/** Peacock navy and gold with paisley, parting on velvet curtains. */
export const midnightMayura: Theme = {
  id: "midnight-mayura",
  name: "Midnight Mayura",
  tier: "royal",
  occasions: ["wedding", "reception", "sangeet"],
  thumbnail: "/themes/thumbs/midnight-mayura.svg",

  palette: {
    accent: "oklch(0.78 0.12 86)",
    accentSoft: "oklch(0.87 0.08 88)",
    tint: "oklch(0.46 0.1 195)",
    paper: "oklch(0.3 0.08 215)",
    paperLight: "oklch(0.38 0.09 205)",
    paperDark: "oklch(0.22 0.06 218)",
    highlight: "oklch(0.9 0.06 88)",
    surface: "oklch(0.27 0.075 212)",
    scratchFoil: "oklch(0.34 0.085 208)",
    scratchInk: "oklch(0.9 0.07 88)",
    background: "oklch(0.17 0.05 218)",
    foreground: "oklch(0.95 0.04 88)",
    muted: "oklch(0.75 0.06 92)",
    border: "oklch(0.45 0.09 200)",
  },

  typography: {
    serif: "Cormorant Garamond",
    sans: "Jost",
    fontsHref:
      "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,400&family=Jost:wght@300;400;500&display=swap",
  },

  ornamentation: "paisley",
  assets: { defaultMusic: "/themes/dubai-silk/track.mp3" },

  motion: {
    reveal: "curtain",
    openMs: 1700,
    introSeconds: 6,
    musicFadeMs: 8000,
    maxVolume: 0.6,
    scratchThreshold: 0.38,
    petals: "none",
  },

  kicker: "VELVET CURTAINS",
  tagline:
    "Peacock navy and gold invitation that parts on velvet curtains, with paisley detailing and a slow cinematic entrance.",
  features: [
    "Velvet Curtain Reveal",
    "Paisley Detailing",
    "Cinematic Entrance",
    "Live Countdown",
  ],

  copy: { scratchTitle: "The evening", scratchHint: "Scratch to reveal" },
  ornament: "❂",
};
