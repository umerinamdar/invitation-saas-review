import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_LOCALE,
  LOCALES,
  type LocaleCode,
} from "./locales";
import { getDictionary, type TranslationKey } from "./translations";

const STORAGE_KEY = "easyinvitemaker-locale";

type LocaleContextValue = {
  locale: LocaleCode;
  setLocale: (code: LocaleCode) => void;
  dir: "ltr" | "rtl";
  /** `t("hero.browseDesigns", { count: 16 })` fills `{count}` placeholders. */
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function readStoredLocale(): LocaleCode {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && stored in LOCALES) return stored as LocaleCode;
  } catch {
    // Private browsing / blocked storage — just use the default.
  }
  return DEFAULT_LOCALE;
}

/**
 * Locale lives in localStorage, not the URL — picking a language is a
 * per-visitor display preference here, not a distinct page to index or
 * share, so there's no SEO or deep-linking reason to route on it. The
 * tradeoff: the server always renders English first, and the chosen
 * language swaps in after hydration. That one-frame flash is an accepted
 * cost for how much simpler this keeps every route.
 */
export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<LocaleCode>(DEFAULT_LOCALE);

  useEffect(() => {
    setLocaleState(readStoredLocale());
  }, []);

  const setLocale = useCallback((code: LocaleCode) => {
    setLocaleState(code);
    try {
      window.localStorage.setItem(STORAGE_KEY, code);
    } catch {
      // Nothing to do if storage is blocked — the choice just won't persist.
    }
  }, []);

  const dir = LOCALES[locale].dir;

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
  }, [locale, dir]);

  const dictionary = useMemo(() => getDictionary(locale), [locale]);

  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>) => {
      const template = dictionary[key] ?? key;
      if (!vars) return template;
      return Object.entries(vars).reduce(
        (text, [name, value]) => text.replaceAll(`{${name}}`, String(value)),
        template,
      );
    },
    [dictionary],
  );

  const value = useMemo(
    () => ({ locale, setLocale, dir, t }),
    [locale, setLocale, dir, t],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale must be used within a LocaleProvider");
  }
  return ctx;
}
