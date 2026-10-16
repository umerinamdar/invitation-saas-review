export type Occasion =
  | "wedding"
  | "engagement"
  | "reception"
  | "birthday"
  | "anniversary"
  | "housewarming"
  | "baby-shower"
  | "party"
  | "opening"
  | "festive";

export type Tier = "classic" | "royal";

export type PetalStyle = "white-blossom" | "marigold" | "rose" | "none";

/**
 * How the invitation opens. Each mechanic is written once in the engine and
 * reused by every theme, so the catalog grows faster than the artwork does:
 * one artwork set carries three templates by varying this alone.
 */
export type Reveal = "envelope" | "doors" | "curtain" | "book" | "box";

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
  sealedBackdrop: string; // behind the closed envelope
  revealedBackdrop: string; // hero behind the names
  /**
   * A BLANK wax disc — no lettering. The engine prints each host's own
   * initials over it, so one disc serves every customer using this theme.
   * Omit it and the seal is drawn in CSS from the palette instead.
   */
  sealDisc?: string;
  paperTexture: string; // envelope + scratch card grain
  defaultMusic: string;
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
  occasions: Occasion[];
  thumbnail: string;
  palette: Palette;
  typography: Typography;
  assets: ThemeAssets;
  motion: Motion;
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
    "--paper-texture": `url('${a.paperTexture}')`,
    "--font-serif": `'${t.serif}', Georgia, serif`,
    "--font-sans": `'${t.sans}', sans-serif`,
  };
}
