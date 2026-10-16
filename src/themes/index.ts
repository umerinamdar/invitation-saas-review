import type { Theme } from "./types";
import { dubaiSilk } from "./dubai-silk";
import { azureVows } from "./azure-vows";
import { mughalZamarrud } from "./mughal-zamarrud";
import { qubooHai } from "./qubool-hai";
import { monochromeVow } from "./monochrome-vow";
import { sageNikah } from "./sage-nikah";

export const themes: Theme[] = [
  dubaiSilk,
  azureVows,
  mughalZamarrud,
  qubooHai,
  monochromeVow,
  sageNikah,
];

export const themesById = new Map(themes.map((theme) => [theme.id, theme]));

export const DEFAULT_THEME_ID = dubaiSilk.id;

export function getTheme(id: string): Theme {
  return themesById.get(id) ?? dubaiSilk;
}

export * from "./types";
