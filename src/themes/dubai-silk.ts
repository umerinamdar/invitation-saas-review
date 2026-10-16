import type { Theme } from "./types";

/**
 * Reference theme. Values are carried over verbatim from the original
 * hand-built invitation, so this renders pixel-identically to it.
 * Copy this file to start a new theme.
 */
export const dubaiSilk: Theme = {
  id: "dubai-silk",
  name: "Dubai Silk",
  tier: "royal",
  occasions: ["wedding", "engagement", "reception"],
  thumbnail: "/themes/dubai-silk/skyline.jpg",

  palette: {
    accent: "oklch(0.57 0.068 81)",
    accentSoft: "oklch(0.78 0.056 81)",
    tint: "oklch(0.88 0.027 239)",
    paper: "oklch(0.91 0.022 234)",
    paperLight: "oklch(0.95 0.015 239)",
    paperDark: "oklch(0.84 0.03 239)",
    highlight: "oklch(0.98 0.006 80)",
    surface: "oklch(0.947 0.017 239)",
    scratchFoil: "oklch(0.87 0.028 237)",
    scratchInk: "oklch(0.29 0.043 244)",
    background: "oklch(0.986 0.005 90)",
    foreground: "oklch(0.27 0.043 245)",
    muted: "oklch(0.4 0.027 241)",
    border: "oklch(0.84 0.035 83)",
  },

  typography: {
    serif: "Cormorant Garamond",
    sans: "Montserrat",
    fontsHref:
      "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Montserrat:wght@400;500;600&display=swap",
  },

  assets: {
    sealedBackdrop: "/themes/dubai-silk/silk.jpg",
    revealedBackdrop: "/themes/dubai-silk/skyline.jpg",
    waxSeal: "/themes/dubai-silk/seal.png",
    paperTexture: "/themes/dubai-silk/paper.jpg",
    defaultMusic: "/themes/dubai-silk/track.mp3",
  },

  motion: {
    envelopeOpenMs: 1400,
    introSeconds: 6,
    musicFadeMs: 8000,
    maxVolume: 0.6,
    scratchThreshold: 0.38,
    petals: "white-blossom",
  },

  copy: {
    scratchTitle: "A date to remember",
    scratchHint: "Scratch to reveal",
  },

  ornament: "✧",
};
