export type Track = {
  id: string;
  title: string;
  /** Shown as a group heading in the picker. */
  language: "Instrumental" | "Hindi" | "English";
  url: string;
  /** Required before a track may ship to paying customers. */
  licence: string;
};

/**
 * The music library offered in the editor.
 *
 * Every customer's invitation plays one of these, so each needs commercial
 * rights — a track licensed for personal use only does not survive being
 * resold inside a product. Public-domain classical recordings are the
 * safest source and the right register for this.
 *
 * To add one: drop the file in `public/music/<language>/`, add a row here
 * with its licence, and it appears in the picker. Nothing else to change.
 */
export const LIBRARY: Track[] = [
  {
    id: "romantic-strings",
    title: "Romantic Strings",
    language: "Instrumental",
    url: "/themes/dubai-silk/track.mp3",
    licence: "Dvořák, Romantic Pieces Op. 75 — CC0 (verify current file)",
  },
];

export const LANGUAGES = ["Instrumental", "Hindi", "English"] as const;

export function tracksByLanguage(language: Track["language"]) {
  return LIBRARY.filter((track) => track.language === language);
}

/**
 * Release Fix 9 (C-3): the label for the music picker's default
 * option. Only a theme that actually ships a track (today: Dubai
 * Silk) may call it "theme music" — the other designs are silent
 * until the customer picks the library track or uploads their own,
 * and the option must say so. The option's VALUE is unaffected: it
 * still selects the theme default (undefined) either way.
 */
export function themeDefaultLabel(
  themeName: string,
  hasThemeMusic: boolean,
): string {
  return hasThemeMusic
    ? `${themeName} theme music`
    : "No theme music — silent unless you pick or upload a track";
}
