import type { Theme } from "./types";

/**
 * Ivory and charcoal with art-deco fans, opening on velvet drapes. The
 * editorial counterweight to the ornate templates — and the one that reads
 * best to couples who find gold too much.
 */
export const monochromeVow: Theme = {
  id: "monochrome-vow",
  name: "Monochrome Vow",
  tier: "classic",
  occasions: ["wedding", "engagement", "reception", "roka"],
  tradition: "modern",
  thumbnail: "/themes/monochrome-vow/hero.jpg",

  palette: {
    accent: "oklch(0.44 0.018 60)", // graphite rather than gold
    accentSoft: "oklch(0.68 0.012 60)",
    tint: "oklch(0.9 0.006 60)",
    paper: "oklch(0.95 0.004 70)",
    paperLight: "oklch(0.98 0.003 70)",
    paperDark: "oklch(0.88 0.005 70)",
    highlight: "oklch(0.995 0.002 70)",
    surface: "oklch(0.97 0.003 70)",
    scratchFoil: "oklch(0.92 0.004 70)",
    scratchInk: "oklch(0.3 0.012 60)",
    background: "oklch(0.985 0.002 70)",
    foreground: "oklch(0.24 0.012 60)",
    muted: "oklch(0.52 0.01 60)",
    border: "oklch(0.84 0.006 70)",
  },

  typography: {
    serif: "Playfair Display",
    sans: "Inter",
    fontsHref:
      "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400&family=Inter:wght@300;400;500&display=swap",
  },

  ornamentation: "none",

  assets: {
    sealedBackdrop: "/themes/monochrome-vow/sealed.jpg",
    revealedBackdrop: "/themes/monochrome-vow/hero.jpg",
    // A tall, seamlessly-tiling continuation of the hero scene — the
    // art-deco fan motif dissolving into a soft ivory-and-graphite gradient —
    // that runs behind every section after the hero instead of a flat colour.
    sectionBackdrop: "/themes/monochrome-vow/section-bg.jpg",
    paperTexture: "/themes/monochrome-vow/paper.jpg",
  },

  motion: {
    reveal: "curtain",
    openMs: 1700,
    introSeconds: 5,
    musicFadeMs: 8000,
    maxVolume: 0.55,
    scratchThreshold: 0.38,
    petals: "white-blossom",
  },

  kicker: "MODERN MINIMAL",
  tagline:
    "Ivory and graphite invitation with art-deco fans, parting on drapes — for couples who find gold too much.",
  features: [
    "Velvet Curtain Reveal",
    "Art-Deco Fan Work",
    "Editorial Typography",
    "Scratch-to-Reveal Date",
  ],

  copy: {
    scratchTitle: "The date",
    scratchHint: "Scratch to reveal",
  },

  ornament: "—",
};
