import type { Theme } from "./types";

/**
 * Ivory and warm stone, opening through carved oak doors into a cathedral
 * in late light. Artwork and palette generated in Lovable from
 * LOVABLE-BRIEF.md.
 *
 * Reworked 2026-10-28 (owner request, from the Lovable "Cathedral Light
 * Invitations" cover): the generic fast doors (1.6s) are replaced by a
 * bespoke cathedralDoors mechanic — a slow smooth swing (1.2s hold +
 * 5s swing), a plain wax seal with no letters, no couple names on the
 * cover, a larger Tap to open pill plus a You're Invited line, and a
 * candlelight-bloom post-open transition. Deliberately not Ram Mandir's
 * mechanic. The split follows this artwork's own seam (~46.5%).
 */
export const cathedralLight: Theme = {
  id: "cathedral-light",
  name: "Cathedral Light",
  tier: "royal",
  religion: "christian",
  tradition: "traditional", // Christian church
  occasions: ["wedding", "engagement", "reception"],
  thumbnail: "/themes/cathedral-light/hero.jpg",

  palette: {
    accent: "#b8924a",
    accentSoft: "#d9c08a",
    tint: "#e9cfc6",
    paper: "#f3ebdd",
    paperLight: "#faf6ee",
    paperDark: "#e4d6bf",
    highlight: "#f6e7b8",
    surface: "#fbf8f2",
    scratchFoil: "#c9a55c",
    scratchInk: "#6b4e2e",
    background: "#f5efe4",
    foreground: "#3a2e25",
    muted: "#8a7764",
    border: "#d8c7a6",
  },

  typography: {
    serif: "Cormorant Garamond",
    sans: "Jost",
    fontsHref:
      "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,400;1,500&family=Jost:wght@300;400;500&display=swap",
  },

  ornamentation: "none",

  assets: {
    sealedBackdrop: "/themes/cathedral-light/sealed.jpg",
    revealedBackdrop: "/themes/cathedral-light/hero.jpg",
    // A tall, seamlessly-tiling continuation of the hero scene — the
    // cathedral doors dissolving into a soft ivory-and-candlelight gradient —
    // that runs behind every section after the hero instead of a flat colour.
    sectionBackdrop: "/themes/cathedral-light/section-bg.jpg",
    paperTexture: "/themes/cathedral-light/paper.jpg",
    defaultMusic: "/themes/dubai-silk/track.mp3",
  },

  motion: {
    // openMs matches exactly when the doors' own CSS choreography
    // finishes (1.2s hold + 5s swing = 6.2s, panels fading out over the
    // last second) — see the mechanic's CSS in styles.css. Like the
    // temple doors, this mechanic doesn't scale with openMs; the number
    // exists only so the JS unmount timer in invitation.tsx fires
    // exactly when the CSS ends.
    reveal: "cathedralDoors",
    openMs: 6200,
    introSeconds: 6,
    musicFadeMs: 8000,
    maxVolume: 0.55,
    scratchThreshold: 0.38,
    petals: "white-blossom",
  },

  kicker: "CARVED OAK DOORS",
  tagline:
    "Ivory and warm stone invitation whose carved oak doors swing inward on a cathedral lit by its rose window and candles.",
  features: [
    "Carved Door Opening",
    "Rose Window Light",
    "Scratch-to-Reveal Date",
    "White Petal Shower",
  ],

  copy: {
    scratchTitle: "The day",
    scratchHint: "Scratch to reveal",
  },

  ornament: "✦",
};
