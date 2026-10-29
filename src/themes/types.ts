/** Wedding-related only — the catalog deliberately covers nothing else. */
export type Occasion =
  | "wedding"
  | "engagement"
  | "reception"
  | "roka"
  | "nikah"
  | "mehendi"
  | "sangeet"
  | "haldi";

export type Tier = "classic" | "royal";

/** Optional cultural/religious category, used by the templates gallery filter. */
export type Religion = "hindu" | "muslim" | "sikh" | "christian";

/**
 * Design tradition, used by the templates gallery filter. "traditional" covers
 * the cultural patterns above; "modern" is the restrained, editorial end.
 */
export type Tradition = "traditional" | "modern";

export type PetalStyle = "white-blossom" | "marigold" | "rose" | "none";

/**
 * How the invitation opens. Each mechanic is written once in the engine and
 * reused by every theme, so the catalog grows faster than the artwork does:
 * one artwork set carries three templates by varying this alone.
 *
 * iris/quadrant/fan/wrap/blinds/scroll added for the Lovable-20 conversion
 * (2026-10-25) — six genuinely new opening gestures the batch needed,
 * built as shared mechanics here rather than per-theme special cases.
 *
 * ivorySilkEnvelope added 2026-10-25 for the one-by-one template rework
 * (see docs/ops/OPENING-STUDY-ivory-silk-pearls.md): a faithful, literal
 * port of one theme's own Lovable-built mechanic, not a reusable gesture
 * for the catalog — it carries its own hardcoded CSS timings rather than
 * the shared var(--open-duration) contract the mechanics above use.
 *
 * ramMandirDoors added 2026-10-26, same one-off contract as
 * ivorySilkEnvelope: Ram Mandir's own carved temple doors (the
 * sealedBackdrop photo itself, split down the centre seam) swinging
 * open on their own hinges, built directly in this engine (no Lovable
 * component existed to port) with hardcoded ceremonial timings.
 *
 * goldenTempleDoors added 2026-10-27, same split-in-two markup and
 * outer-hinge swing as ramMandirDoors (after two rejected variants —
 * a slide-apart push, then a centre hinge — the owner's final word was
 * to make it exactly like Ram Mandir's own doors). The one real
 * difference: once the doors clear, the revealed hero scene doesn't
 * just blur-focus in place, it dollies forward, as if the camera is
 * walking through the doorway into the courtyard beyond.
 *
 * noorBook added 2026-10-28 (Noor Invitation, owner request),
 * reworked 2026-10-29 as a CONVERSION of the fixed Lovable
 * opening (project 054990d9): Lovable's OpeningBook preserved
 * exactly inside the site's container — centred portrait book,
 * 1.2s hold, 4.5s left-hinged swing with the camera reframing
 * into the flat two-page spread, 1.0s warm flash from the centre
 * on its own, Ar-Rum 30:21 readable on the spread for 5.2s, 1.0s
 * settled fade (openMs 12900) — with no seal and no names on the
 * cover. The old right-hinged panel swing was removed, not
 * stacked on top. The generic `book` mechanic is a small portrait
 * card with different geometry, so it could not carry this. The
 * inside animation is its own page-settle + verse illumination,
 * not a zoom, dolly or bloom.
 *
 * cathedralDoors added 2026-10-28 (Cathedral Light rework, owner
 * request): the same split-in-two markup, but deliberately NOT Ram
 * Mandir's mechanic — no swing at all: a slow slide-apart (1.2s hold
 * + 5s glide) opening exactly from the artwork's middle line, with
 * warm light spilling from the gap, its own SVG wax seal (gold lily
 * wreath, lily centre, no letters), no names
 * on the cover, and a candlelight-bloom post-open transition
 * instead of a zoom or a dolly. The split follows this artwork's
 * own middle line (seam, arch apex and handle midpoint all ~50% of
 * sealed.jpg; an early 46.5% split was a plank-gap misread).
 */
export type Reveal =
  | "envelope"
  | "doors"
  | "curtain"
  | "book"
  | "box"
  | "iris"
  | "quadrant"
  | "fan"
  | "wrap"
  | "blinds"
  | "scroll"
  | "ivorySilkEnvelope"
  | "ramMandirDoors"
  | "goldenTempleDoors"
  | "noorBook"
  | "cathedralDoors";

/**
 * Drawn decoration used instead of photography. A theme naming one of these
 * gets its backdrop and border frame rendered from the palette, which is how
 * a template ships without any artwork at all.
 */
export type Ornamentation =
  | "none"
  | "jali"
  | "deco"
  | "geometric"
  | "botanical"
  | "mandala"
  | "paisley"
  | "temple";

/**
 * Every colour is a plain CSS colour string, so hex, oklch and rgb all work.
 * Each one maps to a custom property the stylesheet already consumes.
 */
export type Palette = {
  accent: string; // seal lines, ornaments, countdown separators
  accentSoft: string; // hairline borders, underlines
  tint: string; // secondary petals, hero veil
  paper: string; // envelope body
  paperLight: string; // envelope inner sheet, lit edges
  paperDark: string; // envelope shadowed edges
  highlight: string; // near-white inner glow
  surface: string; // page background once opened
  scratchFoil: string; // mid-stop of the scratch gradient
  scratchInk: string; // scratch card stippling and lettering
  background: string;
  foreground: string;
  muted: string; // small caption text
  border: string;
};

export type Typography = {
  serif: string; // display: names, headings, scratch title
  sans: string; // labels, counters, captions
  /** Google Fonts href loaded by the invite route for this theme. */
  fontsHref: string;
};

export type ThemeAssets = {
  /** Omit both backdrops to let `ornamentation` draw them instead. */
  sealedBackdrop?: string; // behind the closed envelope
  revealedBackdrop?: string; // hero behind the names
  /**
   * Gallery card WebP: the card serves a `.webp` sibling of the hero
   * (same directory, same basename) first, because it weighs roughly
   * a third of the JPEG. A theme WITHOUT that sibling must set this
   * false — otherwise the card picks the missing file, gets a 404,
   * and shows blank instead of falling back to the JPEG (caught on
   * Noor Invitation, 2026-10-28: its hero.webp was never generated,
   * and the <picture> fallback never fired). Omit (or true) for
   * every theme that ships the sibling.
   */
  hasWebpHero?: boolean;
  /**
   * A tall (1080×3600) image, purpose-built to repeat seamlessly top-to-
   * bottom, that continues the hero's own motif and colour story behind
   * every section after it. Omit it and the engine falls back to a
   * heavily-softened crop of `revealedBackdrop` instead — a reasonable
   * stand-in, but not designed to tile, so it reads a little more like an
   * ambient wash than a continuation of the actual scene.
   */
  sectionBackdrop?: string;
  /** Omit on dark themes: a light grain would wash the surfaces out. */
  paperTexture?: string; // envelope + scratch card grain
  /**
   * Optional. A theme ships silent until it has a track with commercial
   * rights of its own — one host's personal song cannot be resold inside
   * every customer's invitation.
   */
  defaultMusic?: string;
};

export type Motion = {
  reveal: Reveal;
  /** How long the opening animation runs before the invitation appears. */
  openMs: number;
  introSeconds: number;
  musicFadeMs: number;
  maxVolume: number;
  scratchThreshold: number; // 0-1 cleared before auto-reveal
  petals: PetalStyle;
};

export type Theme = {
  id: string;
  name: string;
  tier: Tier;
  /** Omit for a design with no specific cultural tradition attached. */
  religion?: Religion;
  /** Traditional uses cultural motifs; modern is editorial, restrained. */
  tradition: Tradition;
  occasions: Occasion[];
  thumbnail: string;
  palette: Palette;
  typography: Typography;
  ornamentation: Ornamentation;
  assets: ThemeAssets;
  motion: Motion;
  /** Multiplies the names heading's size (both lines). Omit for 1. */
  namesScale?: number;
  /** Overrides the names heading colour. Omit to use the theme's own foreground. */
  namesColor?: string;
  /** Multiplies the parent/family credit lines' size. Omit for 1. */
  familyScale?: number;
  /** Overrides the parent/family credit lines' colour (and the scrim stays
   * dark regardless, so this only needs to contrast with a dark chip —
   * see .family-block in styles.css). Omit to use the theme's paper-light. */
  familyColor?: string;
  /** A short kicker above the name in the gallery, e.g. "NIKAH INVITATION". */
  kicker: string;
  /** One sentence describing the template, as a shopper would read it. */
  tagline: string;
  /**
   * Four things this template does that another does not. Competitors lead
   * with these because a list of named features is what makes one design
   * feel worth paying for next to eleven others.
   */
  features: [string, string, string, string];

  /** Wording baked into the design rather than supplied by the host. */
  copy: {
    scratchTitle: string;
    scratchHint: string;
  };
  ornament: string;
};

/** Maps a palette onto the custom properties the stylesheet reads. */
export function paletteVariables(theme: Theme): Record<string, string> {
  const { palette: p, typography: t, assets: a } = theme;
  return {
    "--gold": p.accent,
    "--gold-light": p.accentSoft,
    // The opening's single source of truth: the CSS reveal mechanics in
    // styles.css read this variable for their transition duration, so
    // the animation and the JS unmount timer in invitation.tsx
    // (openMs) can never drift apart again — before this, curtain
    // themes declared 1700ms against a hard-coded 1.5s CSS motion and
    // sat static for the last 200ms of every opening.
    "--open-duration": `${theme.motion.openMs}ms`,
    "--powder": p.tint,
    "--paper": p.paper,
    "--paper-light": p.paperLight,
    "--paper-dark": p.paperDark,
    "--ink-light": p.highlight,
    "--invitation-surface": p.surface,
    "--scratch": p.scratchFoil,
    "--scratch-ink": p.scratchInk,
    "--background": p.background,
    "--foreground": p.foreground,
    "--muted-foreground": p.muted,
    "--border": p.border,
    "--paper-texture": a.paperTexture ? `url('${a.paperTexture}')` : "none",
    "--revealed-backdrop": a.revealedBackdrop
      ? `url('${a.revealedBackdrop}')`
      : "none",
    // A dedicated, seamlessly-tiling backdrop behind the post-hero
    // sections, when the theme has one. Falling back to a "cover" crop of
    // the small hero photo instead (the previous behaviour here) produced
    // an ugly, muddy zoomed-in smear with no recognisable motif and much
    // worse text contrast than either a real section backdrop OR no image
    // at all — so themes without their own dedicated asset yet get the
    // plain flat surface colour, same as before this feature existed,
    // until they have one.
    "--section-backdrop": a.sectionBackdrop
      ? `url('${a.sectionBackdrop}')`
      : "none",
    "--section-bg-size": "100% auto",
    "--section-bg-repeat": a.sectionBackdrop ? "repeat-y" : "no-repeat",
    // Vignette stops for a drawn backdrop: lighter at the centre, darker out.
    "--pattern-core": p.surface,
    "--pattern-edge": p.background,
    "--font-serif": `'${t.serif}', Georgia, serif`,
    "--font-sans": `'${t.sans}', sans-serif`,
    ...(theme.namesScale !== undefined
      ? { "--names-scale": String(theme.namesScale) }
      : {}),
    ...(theme.namesColor ? { "--names-color": theme.namesColor } : {}),
    ...(theme.familyScale !== undefined
      ? { "--family-scale": String(theme.familyScale) }
      : {}),
    ...(theme.familyColor ? { "--family-color": theme.familyColor } : {}),
  };
}
