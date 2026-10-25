import type { Theme } from "./types";

/**
 * Saffron and cream, its carved temple doors swinging open on their own
 * hinges onto the Ram Mandir's sandstone shikharas at golden hour.
 * Artwork and palette generated in Lovable, matching the Nagara-style
 * architecture the backdrop was composed around.
 *
 * Reworked 2026-10-26 (owner request) from the original lifting-casket
 * ("box") opening to a bespoke doors mechanic — ramMandirDoors in
 * reveals/index.tsx — built directly in this engine to the same
 * ceremonial choreography standard as Ivory Silk & Pearls (see
 * docs/ops/OPENING-STUDY-ivory-silk-pearls.md), since no Lovable
 * component existed for this one to port.
 */
export const ramMandir: Theme = {
  id: "ram-mandir",
  name: "Ayodhya Ram Mandir",
  tier: "royal",
  religion: "hindu",
  tradition: "traditional", // Hindu temple
  occasions: ["wedding", "haldi", "mehendi", "reception"],
  thumbnail: "/themes/ram-mandir/hero.jpg",

  palette: {
    accent: "#b5480f",
    accentSoft: "#d98a3d",
    tint: "#f2b705",
    paper: "#f7e8c9",
    paperLight: "#fdf6e6",
    paperDark: "#e8c98f",
    highlight: "#e0a23c",
    surface: "#fffaef",
    scratchFoil: "#d9a23b",
    scratchInk: "#5c2a0d",
    background: "#3d1707",
    foreground: "#3f2211",
    muted: "#8a6a47",
    border: "#dcb66e",
  },

  typography: {
    serif: "Cormorant Garamond",
    sans: "Jost",
    fontsHref:
      "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,400;1,500&family=Great+Vibes&family=Jost:wght@300;400;500&display=swap",
  },

  ornamentation: "none",

  assets: {
    sealedBackdrop: "/themes/ram-mandir/sealed.jpg",
    revealedBackdrop: "/themes/ram-mandir/hero.jpg",
    // A tall, seamlessly-tiling continuation of the hero scene — the
    // temple shikharas dissolving into a soft saffron-and-cream gradient —
    // that runs behind every section after the hero instead of a flat colour.
    sectionBackdrop: "/themes/ram-mandir/section-bg.jpg",
    // Shares Kesari Mandap's warm saffron-cream grain — both themes sit in
    // the same palette family, so no new texture was generated for this.
    paperTexture: "/themes/kesari-mandap/paper.jpg",
    defaultMusic: "/themes/dubai-silk/track.mp3",
  },

  motion: {
    // openMs matches exactly when the doors' own CSS choreography
    // finishes (1.4s hold + 4s swing = 5.4s) — see the mechanic's CSS
    // in styles.css. Like Ivory Silk & Pearls' envelope, this mechanic
    // doesn't scale with openMs; the number exists only so the JS
    // unmount timer in invitation.tsx fires exactly when the CSS ends.
    reveal: "ramMandirDoors",
    openMs: 5400,
    introSeconds: 6,
    musicFadeMs: 8000,
    maxVolume: 0.6,
    scratchThreshold: 0.38,
    petals: "marigold",
  },

  kicker: "TEMPLE DOORS",
  tagline:
    "Saffron and cream invitation whose carved temple doors swing open on their own hinges onto the Ram Mandir's sandstone shikharas at golden hour, strung with marigold garlands.",
  features: [
    "Ceremonial Temple-Door Opening",
    "Golden-Hour Temple Hero",
    "Scratch-to-Reveal Muhurat",
    "Marigold Petal Shower",
  ],

  copy: {
    scratchTitle: "The muhurat",
    scratchHint: "Scratch to reveal",
  },

  ornament: "✴",
};
