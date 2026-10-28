import type { Theme } from "./types";

/**
 * Deep emerald and antique gold, opening like a keepsake book onto a
 * moonlit mosque courtyard. Ported from the owner's Lovable project
 * "Noor Invitation" (054990d9, October 2026) — the sealed image is a
 * horizontal lacquered book, so the opening is a book opening, not
 * doors: one full-cover panel hinged on the right (Arabic opening)
 * that swings back over 4.5s after a 1.2s hold (openMs 5700).
 *
 * Deliberately no seal anywhere on the cover (owner request) — the
 * Lovable cover's wax seal and initials are gone; only a Tap to open
 * pill and a You're Invited line sit on the book. After entering,
 * the guest is greeted first by the Quran verse (Surah Ar-Rum 30:21),
 * carried by the demo invite's blessing field, and the inside
 * animation is its own page-settle + verse illumination — not a zoom,
 * dolly or bloom.
 *
 * Artwork note: the Lovable project's own sealed-backdrop.jpg and
 * hero-backdrop.jpg cannot be pulled through the Lovable connector
 * (it garbles image binaries), so the shipped sealed.jpg / hero.jpg
 * are generated stand-ins in the same design — emerald book, gold
 * inlay, moonlit courtyard — until the owner swaps in the real files
 * (same paths, no code change).
 */
export const noorInvitation: Theme = {
  id: "noor-invitation",
  name: "Noor Invitation",
  tier: "royal",
  religion: "muslim",
  tradition: "traditional",
  occasions: ["wedding", "engagement", "reception"],
  thumbnail: "/themes/noor-invitation/hero.jpg",

  palette: {
    accent: "#c9a24b",
    accentSoft: "#e3cb8f",
    tint: "#0f3d2e",
    paper: "#f4eddc",
    paperLight: "#fbf7ec",
    paperDark: "#e6dac0",
    highlight: "#f7e7b4",
    // Light page background, not the Lovable project's dark surround:
    // the site's cards are paper-light with foreground text, and the
    // product's a11y bar requires foreground-on-surface ≥ 4.5 (the
    // music-error bubble). The dark emerald lives in tint, the hero
    // image and the cover instead.
    surface: "#fbf7ec",
    scratchFoil: "#b8923e",
    scratchInk: "#7a5c1e",
    background: "#071c16",
    foreground: "#2a2418",
    muted: "#6e6450",
    border: "#d8c79a",
  },

  typography: {
    serif: "Cormorant Garamond",
    sans: "Jost",
    fontsHref:
      "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,400;1,500&family=Jost:wght@300;400;500&display=swap",
  },

  ornamentation: "none",

  assets: {
    sealedBackdrop: "/themes/noor-invitation/sealed.jpg",
    revealedBackdrop: "/themes/noor-invitation/hero.jpg",
    sectionBackdrop: "/themes/noor-invitation/section-bg.jpg",
    paperTexture: "/themes/noor-invitation/paper.jpg",
    defaultMusic: "/themes/dubai-silk/track.mp3",
  },

  // The hero image is a dark night courtyard, so the names sit in
  // paper-light, not the dark foreground ink (which is for the light
  // page below). The verse and heading take the same light colour
  // via scoped CSS in styles.css; the family lines already default
  // to paper-light on their dark chip.
  namesColor: "#fbf7ec",

  motion: {
    // openMs matches exactly when the book's own CSS choreography
    // finishes (1.2s hold + 4.5s swing = 5.7s) — see the mechanic's CSS
    // in styles.css. Like the temple doors, this mechanic doesn't scale
    // with openMs; the number exists only so the JS unmount timer in
    // invitation.tsx fires exactly when the CSS ends.
    reveal: "noorBook",
    openMs: 5700,
    introSeconds: 6,
    musicFadeMs: 8000,
    maxVolume: 0.55,
    scratchThreshold: 0.38,
    petals: "white-blossom",
  },

  kicker: "NOOR · THE EMERALD BOOK",
  tagline:
    "Deep emerald and antique gold invitation whose keepsake book opens onto a moonlit mosque courtyard, greeted by a Quran verse.",
  features: [
    "Book Opening",
    "Quran Verse Blessing",
    "Scratch-to-Reveal Date",
    "White Rose Petals",
  ],

  copy: {
    scratchTitle: "The day",
    scratchHint: "Scratch to reveal",
  },

  ornament: "✦",
};
