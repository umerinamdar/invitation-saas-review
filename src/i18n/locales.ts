/**
 * The catalog of languages the site can run in, grouped the way the
 * language switcher presents them — by region, since a flat list of 13
 * languages is hard to scan but "India / Europe / Middle East" groups are
 * instantly recognisable to someone looking for their own language.
 *
 * Adding a language: add its entry here, add `"<code>": { ... }` to
 * `dictionaries` in translations.ts with every key `en` has, and add the
 * code to a region's `codes` list below.
 */
export type LocaleCode =
  | "en"
  | "hi"
  | "ar"
  | "mr"
  | "gu"
  | "bn"
  | "pa"
  | "ur"
  | "fr"
  | "de"
  | "es"
  | "pt"
  | "ru";

export type Locale = {
  code: LocaleCode;
  /** Shown in the switcher, in the language's own script. */
  label: string;
  /** English gloss shown alongside `label`, for scanning. */
  englishName: string;
  dir: "ltr" | "rtl";
};

export const LOCALES: Record<LocaleCode, Locale> = {
  en: { code: "en", label: "English", englishName: "English", dir: "ltr" },
  hi: { code: "hi", label: "हिन्दी", englishName: "Hindi", dir: "ltr" },
  mr: { code: "mr", label: "मराठी", englishName: "Marathi", dir: "ltr" },
  gu: { code: "gu", label: "ગુજરાતી", englishName: "Gujarati", dir: "ltr" },
  bn: { code: "bn", label: "বাংলা", englishName: "Bengali", dir: "ltr" },
  pa: { code: "pa", label: "ਪੰਜਾਬੀ", englishName: "Punjabi", dir: "ltr" },
  ur: { code: "ur", label: "اردو", englishName: "Urdu", dir: "rtl" },
  ar: { code: "ar", label: "العربية", englishName: "Arabic", dir: "rtl" },
  fr: { code: "fr", label: "Français", englishName: "French", dir: "ltr" },
  de: { code: "de", label: "Deutsch", englishName: "German", dir: "ltr" },
  es: { code: "es", label: "Español", englishName: "Spanish", dir: "ltr" },
  pt: { code: "pt", label: "Português", englishName: "Portuguese", dir: "ltr" },
  ru: { code: "ru", label: "Русский", englishName: "Russian", dir: "ltr" },
};

/**
 * Marwadi has no standardised digital script of its own in common use (it's
 * written in Devanagari where it's written at all, with no stable
 * translation tooling) — rather than fake a distinct translation, it rides
 * on Hindi until there's an actual Marwadi source text to use instead.
 */
export const REGIONS: { name: string; codes: LocaleCode[] }[] = [
  {
    name: "India",
    codes: ["hi", "mr", "gu", "bn", "pa", "ur"],
  },
  {
    name: "Europe",
    codes: ["fr", "de", "es", "pt", "ru"],
  },
  {
    name: "Middle East",
    codes: ["ar"],
  },
];

export const DEFAULT_LOCALE: LocaleCode = "en";

/** Languages with real translations today; everything else falls back to English. */
export const LIVE_LOCALES: LocaleCode[] = [
  "en",
  "hi",
  "mr",
  "gu",
  "bn",
  "pa",
  "ur",
  "ar",
  "fr",
  "de",
  "es",
  "pt",
  "ru",
];
