import type { Theme } from "./types";
import { dubaiSilk } from "./dubai-silk";
import { azureVows } from "./azure-vows";

export const themes: Theme[] = [dubaiSilk, azureVows];

export const themesById = new Map(themes.map((theme) => [theme.id, theme]));

export const DEFAULT_THEME_ID = dubaiSilk.id;

export function getTheme(id: string): Theme {
  return themesById.get(id) ?? dubaiSilk;
}

export * from "./types";
