import type { Theme } from "./types";

/**
 * Faithful port (2026-10-25) of the owner's own Lovable project
 * (4b5fbdfc-c2af-4434-9b22-91b0b9648def), replacing the earlier Lovable-20
 * conversion of this same theme — see docs/ops/OPENING-STUDY-ivory-silk-
 * pearls.md for the full source: exact CSS timings/markup read from the
 * live compiled build, plus what was deliberately left out.
 *
 * Palette: read from the project's own `:root` custom properties (the
 * October conversion already got this right; unchanged here).
 *
 * Typography: the real build renders "Allura" (a script face, for the
 * couple's names) over "Bodoni Moda" (body/structural serif) + "Jost"
 * (sans) — NOT "Cormorant Garamond" as the original written brief said;
 * the design moved on from its own brief during later edits. This
 * engine's Typography type has one `serif` slot used at every size from
 * giant names down to small captions (see --font-serif in styles.css),
 * so Allura — legible only at display size — can't be ported without a
 * second "display/script" font slot, which is a shared-engine change
 * affecting every theme, not something to do unasked for one theme.
 * `serif` below is Bodoni Moda, the one that holds up at every size;
 * Allura is left for a future engine change if the owner wants it.
 *
 * Images: the three real assets pulled from the project (envelope
 * texture, the Lake Como terrace art, the watercolour couple portrait)
 * are faithful — but the project also contains one genuine mismatch,
 * a backdrop literally named "dubai-interior" behind copy that reads
 * "Villa del Balbianello, Lake Como, Italy." That one image is NOT
 * used here; `venue.jpg` below is the project's OWN correctly-matching
 * Lake Como art, not something substituted in by this port.
 */
export const ivorySilkPearls: Theme = {
  id: "ivory-silk-pearls",
  name: "Ivory Silk & Pearls",
  tier: "classic",
  tradition: "traditional",
  occasions: ["wedding", "engagement", "reception"],
  thumbnail: "/themes/ivory-silk-pearls/thumbnail.svg",

  palette: {
    accent: "oklch(0.68 0.08 80)",
    accentSoft: "oklch(0.8 0.04 140)",
    tint: "oklch(0.93 0.02 82)",
    paper: "oklch(0.94 0.012 85)",
    paperLight: "oklch(0.985 0.006 90)",
    paperDark: "oklch(0.86 0.03 80)",
    highlight: "oklch(0.99 0.005 85)",
    surface: "oklch(0.965 0.012 85)",
    scratchFoil: "oklch(0.93 0.02 82)",
    scratchInk: "oklch(0.32 0.02 70)",
    background: "oklch(0.985 0.008 85)",
    foreground: "oklch(0.32 0.02 70)",
    muted: "oklch(0.5 0.02 70)",
    border: "oklch(0.86 0.03 80)",
  },

  typography: {
    serif: "Bodoni Moda",
    sans: "Jost",
    fontsHref:
      "https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,wght@0,400;0,500;0,600;1,400&family=Jost:wght@400;500;600&display=swap",
  },

  ornamentation: "none", // uses photography instead

  assets: {
    sealedBackdrop: "/themes/ivory-silk-pearls/envelope.jpg",
    revealedBackdrop: "/themes/ivory-silk-pearls/venue.jpg",
    // No purpose-built tall section image exists for this theme (the
    // source project has no such asset either) — reusing the hero photo
    // here is exactly the fallback this engine already does automatically
    // when sectionBackdrop is omitted (see the field's own comment in
    // themes/types.ts), just made an explicit, deliberate choice rather
    // than an implicit default, to satisfy this catalog's "every active
    // theme sets its full asset set on purpose" rule.
    sectionBackdrop: "/themes/ivory-silk-pearls/venue.jpg",
    // The envelope's own silk/pearl texture, reused as the paper grain —
    // it already is the project's paper material, not a stand-in.
    paperTexture: "/themes/ivory-silk-pearls/envelope.jpg",
    defaultMusic: "/themes/dubai-silk/track.mp3",
  },

  motion: {
    // openMs matches exactly when the ported cover choreography's last
    // moving piece clears (the flap finishes rotating at 1.4s + 5s, the
    // wings/pocket finish at 3.4s + 2.8s) — see the mechanic's own CSS
    // in styles.css and the timing table in the study doc. This theme's
    // reveal does not scale with openMs the way the shared mechanics do;
    // this number exists so the JS unmount timer in invitation.tsx fires
    // at the same instant the CSS finishes, not before or after it.
    reveal: "ivorySilkEnvelope",
    openMs: 6400,
    introSeconds: 6,
    musicFadeMs: 8000,
    maxVolume: 0.6,
    scratchThreshold: 0.38,
    petals: "rose",
  },

  kicker: "CEREMONIAL PEARL ENVELOPE",
  tagline:
    "A pearl-trimmed silk envelope with an unhurried, three-beat opening — the cover clears fully before the names ever appear — built for a terrace wedding above Lake Como.",
  features: [
    "Pearl-Trimmed Silk Envelope",
    "Ceremonial Multi-Beat Opening",
    "Scratch-to-Reveal Date",
    "Falling Rose Petals",
  ],

  copy: {
    scratchTitle: "A date to remember",
    scratchHint: "Scratch to reveal",
  },

  ornament: "✿",
};
