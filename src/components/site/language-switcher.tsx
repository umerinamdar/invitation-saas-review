import { useEffect, useRef, useState } from "react";
import { Globe } from "lucide-react";
import { useLocale } from "@/i18n/locale-context";
import { LOCALES, REGIONS, LIVE_LOCALES, type LocaleCode } from "@/i18n/locales";

/**
 * Grouped by region (India / Europe / Middle East) rather than one flat
 * alphabetical list — with 13 languages a flat list is a wall of text to
 * scan, while regions are how someone looking for their own language
 * already thinks about it. Languages without a real translation yet still
 * show up, greyed with a note, rather than disappearing — that's more
 * honest about what's coming than hiding them would be. They render as
 * disabled buttons, though: a "coming soon" entry that can be clicked and
 * silently falls back to English would be a broken promise, not a roadmap.
 */
export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="lang-switcher" ref={rootRef}>
      <button
        type="button"
        className="lang-switcher-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <Globe size={15} />
        {LOCALES[locale].label}
      </button>
      {open && (
        <div className="lang-switcher-menu" role="listbox">
          <button
            type="button"
            role="option"
            aria-selected={locale === "en"}
            className={`lang-option ${locale === "en" ? "is-active" : ""}`}
            onClick={() => {
              setLocale("en");
              setOpen(false);
            }}
          >
            English
          </button>
          {REGIONS.map((region) => (
            <div key={region.name} className="lang-region">
              <p className="lang-region-name">{region.name}</p>
              {region.codes.map((code) => (
                <LanguageOption
                  key={code}
                  code={code}
                  active={locale === code}
                  onSelect={() => {
                    setLocale(code);
                    setOpen(false);
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function LanguageOption({
  code,
  active,
  onSelect,
}: {
  code: LocaleCode;
  active: boolean;
  onSelect: () => void;
}) {
  const info = LOCALES[code];
  const live = LIVE_LOCALES.includes(code);
  if (!live) {
    // No real translation yet: visible on the roadmap, but not selectable.
    // No onSelect is wired up at all, so the entry cannot be activated by
    // mouse, touch or keyboard — it never silently falls back to English.
    return (
      <button
        type="button"
        role="option"
        aria-selected={false}
        aria-disabled="true"
        disabled
        className="lang-option is-coming-soon"
      >
        <span>{info.label}</span>
        <span className="lang-option-english">
          {info.englishName} · coming soon
        </span>
      </button>
    );
  }
  return (
    <button
      type="button"
      role="option"
      aria-selected={active}
      className={`lang-option ${active ? "is-active" : ""}`}
      onClick={onSelect}
    >
      <span>{info.label}</span>
      <span className="lang-option-english">{info.englishName}</span>
    </button>
  );
}
