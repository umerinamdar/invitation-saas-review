import type { Theme } from "./types";
import { dubaiSilk } from "./dubai-silk";
import { ivorySilkPearls } from "./ivory-silk-pearls";

/**
 * Catalog reset (2026-10-25, owner decision): every theme except Dubai
 * Silk was taken OUT of the active catalog — not deleted, just
 * unregistered here — to be brought back one at a time, each rebuilt in
 * the owner's own Lovable project and then ported in faithfully (see
 * docs/ops/OPENING-STUDY-ivory-silk-pearls.md for the choreography this
 * is measured against: a held latch beat, a slow cover-only unfold with
 * the card never moving, then the frame revealed before the text fades
 * in last, plus a blur/zoom "emerge into focus" transition once the
 * cover clears).
 *
 * Ivory Silk & Pearls (2026-10-25) is the first one back — ported
 * literally from its own Lovable build, with its own mechanic
 * (`ivorySilkEnvelope` in reveals/index.tsx) and its own hardcoded CSS
 * timings, not generalized into the shared engine. Pending the owner's
 * playback approval before the next theme is reworked.
 *
 * Every other theme's file is untouched on disk — src/themes/*.ts for
 * the 13 pre-existing designs and the remaining 19 Lovable-20
 * conversions — and will be brought back the same way, one at a time.
 * Do not re-add a batch at once.
 */
export const themes: Theme[] = [dubaiSilk, ivorySilkPearls];

export const themesById = new Map(themes.map((theme) => [theme.id, theme]));

export const DEFAULT_THEME_ID = dubaiSilk.id;

export function getTheme(id: string): Theme {
  return themesById.get(id) ?? dubaiSilk;
}

export * from "./types";
