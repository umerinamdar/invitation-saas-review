import type { Theme } from "./types";
import { dubaiSilk } from "./dubai-silk";

/**
 * Catalog reset (2026-10-25, owner decision): every theme except Dubai
 * Silk has been taken OUT of the active catalog — not deleted, just
 * unregistered here. Dubai Silk is the one opening the owner has
 * confirmed is right (see docs/ops/OPENING-STUDY-ivory-silk-pearls.md
 * for the choreography it's built on: a held latch beat, a slow
 * cover-only unfold with the card never moving, then the frame
 * revealed before the text fades in last, plus a blur/zoom "emerge
 * into focus" transition once the cover clears).
 *
 * Every other theme's file is untouched on disk — src/themes/*.ts for
 * the 13 pre-existing designs and the 20 Lovable-20 conversions — and
 * will be brought back one at a time as each is reworked to this same
 * opening quality. To re-add one: import it above and add it to
 * `themes` below. Do not re-add a batch at once — the plan is one by
 * one, each checked against the real thing before moving to the next.
 */
export const themes: Theme[] = [dubaiSilk];

export const themesById = new Map(themes.map((theme) => [theme.id, theme]));

export const DEFAULT_THEME_ID = dubaiSilk.id;

export function getTheme(id: string): Theme {
  return themesById.get(id) ?? dubaiSilk;
}

export * from "./types";
