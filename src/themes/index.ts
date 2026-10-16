import type { Theme } from "./types";
import { dubaiSilk } from "./dubai-silk";

export const themes: Theme[] = [dubaiSilk];

export const themesById = new Map(themes.map((theme) => [theme.id, theme]));

export const DEFAULT_THEME_ID = dubaiSilk.id;

export function getTheme(id: string): Theme {
  return themesById.get(id) ?? dubaiSilk;
}

export * from "./types";
