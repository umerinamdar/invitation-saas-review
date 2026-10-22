import type { Theme } from "./types";
import { dubaiSilk } from "./dubai-silk";
import { mughalZamarrud } from "./mughal-zamarrud";
import { monochromeVow } from "./monochrome-vow";
import { kesariMandap } from "./kesari-mandap";
import { kanjeevaram } from "./kanjeevaram";
import { phulkariAnand } from "./phulkari-anand";
import { sarayuGhat } from "./sarayu-ghat";
import { cathedralLight } from "./cathedral-light";
import { mayuraMahal } from "./mayura-mahal";
import { ramMandir } from "./ram-mandir";
import { madina } from "./madina";
import { makkah } from "./makkah";
import { goldenTemple } from "./golden-temple";
import { vesperChapel } from "./vesper-chapel";

/**
 * Catalog order is gallery order. Dubai Silk leads as the flagship, then
 * each cultural category groups together (Hindu, Muslim, Sikh, Christian —
 * a landmark design first in each, then the existing design), then the
 * uncategorised designs. Capped at 15 total.
 */
export const themes: Theme[] = [
  dubaiSilk,
  // Hindu
  ramMandir,
  kesariMandap,
  kanjeevaram,
  // Muslim
  madina,
  makkah,
  // Sikh
  goldenTemple,
  phulkariAnand,
  // Christian
  vesperChapel,
  cathedralLight,
  // Uncategorised
  mughalZamarrud,
  sarayuGhat,
  mayuraMahal,
  monochromeVow,
];

export const themesById = new Map(themes.map((theme) => [theme.id, theme]));

export const DEFAULT_THEME_ID = dubaiSilk.id;

export function getTheme(id: string): Theme {
  return themesById.get(id) ?? dubaiSilk;
}

export * from "./types";
