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
// Lovable-20 conversion (2026-10-25) — 20 designs converted from exported
// Lovable source, each keeping its own opening mechanic and palette (see
// docs/ops/LOVABLE-20-REPORT.md). Two source names collided with existing
// themes above and were renamed on the owner's instruction: the source
// "Cathedral Light" (Barcelona) -> barcelonaRosette, and the source
// "Monochrome Vow" (Brooklyn) -> monochromeLoft.
import { marigoldMandap } from "./marigold-mandap";
import { udaipurRoyalScroll } from "./udaipur-royal-scroll";
import { rajputanaHeritage } from "./rajputana-heritage";
import { banarasiSilk } from "./banarasi-silk";
import { keralaKasavu } from "./kerala-kasavu";
import { bengaliJamdani } from "./bengali-jamdani";
import { gujaratiPatola } from "./gujarati-patola";
import { kanchipuramTemple } from "./kanchipuram-temple";
import { emeraldMihrab } from "./emerald-mihrab";
import { tajMughal } from "./taj-mughal";
import { kashmiriGarden } from "./kashmiri-garden";
import { goldenDarbar } from "./golden-darbar";
import { punjabiPhulkari } from "./punjabi-phulkari";
import { barcelonaRosette } from "./barcelona-rosette";
import { goanAzulejos } from "./goan-azulejos";
import { ivorySilkPearls } from "./ivory-silk-pearls";
import { chateauDeFleurs } from "./chateau-de-fleurs";
import { heirloomLaceCurtains } from "./heirloom-lace-curtains";
import { amalfiFrescoWrap } from "./amalfi-fresco-wrap";
import { monochromeLoft } from "./monochrome-loft";

/**
 * Catalog order is gallery order. Dubai Silk leads as the flagship, then
 * each cultural category groups together (Hindu, Muslim, Sikh, Christian —
 * a landmark design first in each, then the rest), then the uncategorised
 * designs. 34 total after the Lovable-20 conversion (was capped at 14).
 */
export const themes: Theme[] = [
  dubaiSilk,
  // Hindu
  ramMandir,
  kesariMandap,
  kanjeevaram,
  marigoldMandap,
  udaipurRoyalScroll,
  rajputanaHeritage,
  banarasiSilk,
  keralaKasavu,
  bengaliJamdani,
  gujaratiPatola,
  kanchipuramTemple,
  // Muslim
  madina,
  makkah,
  emeraldMihrab,
  tajMughal,
  kashmiriGarden,
  // Sikh
  goldenTemple,
  phulkariAnand,
  goldenDarbar,
  punjabiPhulkari,
  // Christian
  vesperChapel,
  cathedralLight,
  barcelonaRosette,
  goanAzulejos,
  // Uncategorised
  mughalZamarrud,
  sarayuGhat,
  mayuraMahal,
  monochromeVow,
  ivorySilkPearls,
  chateauDeFleurs,
  heirloomLaceCurtains,
  amalfiFrescoWrap,
  monochromeLoft,
];

export const themesById = new Map(themes.map((theme) => [theme.id, theme]));

export const DEFAULT_THEME_ID = dubaiSilk.id;

export function getTheme(id: string): Theme {
  return themesById.get(id) ?? dubaiSilk;
}

export * from "./types";
