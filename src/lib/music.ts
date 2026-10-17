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

export function trackById(id: string) {
  return LIBRARY.find((track) => track.id === id);
}

export function tracksByLanguage(language: Track["language"]) {
  return LIBRARY.filter((track) => track.language === language);
}
