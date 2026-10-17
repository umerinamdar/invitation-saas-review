import type { Theme } from "./types";
import { dubaiSilk } from "./dubai-silk";
import { azureVows } from "./azure-vows";
import { mughalZamarrud } from "./mughal-zamarrud";
import { qubooHai } from "./qubool-hai";
import { monochromeVow } from "./monochrome-vow";
import { sageNikah } from "./sage-nikah";
import { kesariMandap } from "./kesari-mandap";
import { midnightMayura } from "./midnight-mayura";
import { kanjeevaram } from "./kanjeevaram";
import { haveliBandhej } from "./haveli-bandhej";
import { alpona } from "./alpona";
import { phulkariAnand } from "./phulkari-anand";
import { sarayuGhat } from "./sarayu-ghat";

/** Catalog order is gallery order, so lead with the strongest designs. */
export const themes: Theme[] = [
  dubaiSilk,
  mughalZamarrud,
  kesariMandap,
  sarayuGhat,
  midnightMayura,
  kanjeevaram,
  qubooHai,
  phulkariAnand,
  alpona,
  haveliBandhej,
  monochromeVow,
  sageNikah,
  azureVows,
];

export const themesById = new Map(themes.map((theme) => [theme.id, theme]));

export const DEFAULT_THEME_ID = dubaiSilk.id;

export function getTheme(id: string): Theme {
  return themesById.get(id) ?? dubaiSilk;
}

export * from "./types";
