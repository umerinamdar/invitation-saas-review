import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// NF-9: a locale with no translation must show in the switcher as a
// disabled "coming soon" entry, never as a clickable option that silently
// falls back to English. All real locales are live today, so the test
// catalog adds one invented non-live locale ("xx") to REGIONS — the
// switcher must render it disabled while the real locales stay selectable.
vi.mock("@/i18n/locales", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/i18n/locales")>();
  const extended = {
    ...actual,
    LOCALES: {
      ...actual.LOCALES,
      xx: {
        code: "xx",
        label: "Testish",
        englishName: "Testish",
        dir: "ltr" as const,
      },
    },
    REGIONS: [...actual.REGIONS, { name: "Test Region", codes: ["xx"] }],
  };
  return extended as typeof actual;
});

import { LocaleProvider } from "@/i18n/locale-context";
import { LanguageSwitcher } from "@/components/site/language-switcher";

function renderSwitcher() {
  render(
    <LocaleProvider>
      <LanguageSwitcher />
    </LocaleProvider>,
  );
  fireEvent.click(screen.getByRole("button", { name: /English/ }));
}

describe("LanguageSwitcher coming-soon entries (NF-9)", () => {
  it("renders a locale without a translation as disabled and marked soon", () => {
    renderSwitcher();
    const soon = screen.getByRole("option", { name: /coming soon/ });
    expect(soon).toBeDisabled();
    expect(soon).toHaveAttribute("aria-disabled", "true");
    expect(soon).toHaveTextContent("Testish");
  });

  it("does not select the coming-soon locale or close the menu when clicked", () => {
    renderSwitcher();
    const soon = screen.getByRole("option", { name: /coming soon/ });
    fireEvent.click(soon);
    // Menu is still open and the current language is unchanged.
    expect(screen.getByRole("option", { name: /coming soon/ })).toBe(soon);
    expect(screen.getByRole("button", { name: /English/ })).toBeInTheDocument();
  });

  it("keeps live locales selectable", () => {
    renderSwitcher();
    const french = screen.getByRole("option", { name: /Français/ });
    expect(french).toBeEnabled();
    fireEvent.click(french);
    // Selecting a live locale closes the menu and switches the trigger.
    expect(screen.queryByRole("option")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Français/ }),
    ).toBeInTheDocument();
  });
});
