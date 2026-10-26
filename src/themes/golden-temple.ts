import type { Theme } from "./types";

/**
 * Gold and white, its gilded temple doors swinging open on their own
 * hinges onto the Harmandir Sahib reflected in the Amrit Sarovar at
 * dusk — then the camera dollies forward through the doorway into the
 * courtyard beyond. Artwork and palette generated in Lovable, matching
 * the temple's own gold-on-water glow.
 *
 * Reworked 2026-10-27 (owner request) from the original lifting-casket
 * ("box") opening to a bespoke doors mechanic — goldenTempleDoors in
 * reveals/index.tsx, built directly in this engine on the same
 * carved-doors contract as Ram Mandir (see docs/ops/OPENING-STUDY-
 * ivory-silk-pearls.md for the choreography standard both measure
 * against), reusing the sealed/hero artwork already on disk — no new
 * assets were needed, the existing sealed.jpg already shows a
 * symmetric pair of gold doors with its seam within ~1% of centre.
 * No wax seal (owner request): "You're Invited" in its own script,
 * same convention as every other bespoke door mechanic.
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
    defaultMusic: "/themes/dubai-silk/track.mp3",
  },

  motion: {
    // openMs matches exactly when the doors' own CSS choreography
    // finishes (1.4s hold + 4s swing = 5.4s) — see the mechanic's CSS
    // in styles.css. Like Ram Mandir's doors, this mechanic doesn't
    // scale with openMs; the number exists only so the JS unmount
    // timer in invitation.tsx fires exactly when the CSS ends.
    reveal: "goldenTempleDoors",
    openMs: 5400,
    introSeconds: 6,
    musicFadeMs: 8000,
    maxVolume: 0.6,
    scratchThreshold: 0.38,
    petals: "marigold",
  },

  kicker: "TEMPLE DOORS",
  tagline:
    "Gold and white invitation whose gilded temple doors swing open onto the Harmandir Sahib reflected in the Amrit Sarovar at dusk, the camera dollying forward through the doorway as they clear.",
  features: [
    "Ceremonial Temple-Door Opening",
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
