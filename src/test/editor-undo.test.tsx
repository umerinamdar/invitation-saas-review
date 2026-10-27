import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

// Undo banner for destructive row removals: removing a family member or
// a sub-event shows a banner for a few seconds; clicking Undo restores
// the row at its original position. Same render harness and mocks as
// editor-field-inputs.test.tsx (the editor is rendered statefully).

vi.mock("@/lib/supabase", () => ({ supabase: {} }));

vi.mock("@/lib/auth", () => ({
  useAuth: () => ({ session: null, loading: false }),
  useUser: () => null,
  signOut: vi.fn(async () => {}),
}));

window.HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);
window.HTMLMediaElement.prototype.pause = vi.fn();
Object.defineProperty(document, "fonts", {
  configurable: true,
  value: { ready: Promise.resolve() },
});
vi.stubGlobal(
  "ResizeObserver",
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  },
);
class FakeImage {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  _src = "";
  get src() {
    return this._src;
  }
  set src(value: string) {
    this._src = value;
    queueMicrotask(() => this.onload?.());
  }
}
vi.stubGlobal("Image", FakeImage);

import { InviteEditor } from "@/components/editor/invite-editor";
import { LocaleProvider } from "@/i18n/locale-context";
import { blankConfig, type InviteConfig } from "@/lib/invites-api";

function renderEditor(initial: InviteConfig) {
  function Harness() {
    const [config, setConfig] = useState(initial);
    return (
      <LocaleProvider>
        <InviteEditor
          config={config}
          themeId="dubai-silk"
          onChange={setConfig}
          onThemeChange={() => {}}
          toolbar={null}
        />
      </LocaleProvider>
    );
  }
  return render(<Harness />);
}

describe("editor undo for destructive removals", () => {
  it("removing a family member shows Undo and restores the row", () => {
    const config = blankConfig();
    config.familyMembers = [{ name: "Priya", role: "Sister of the bride" }];
    renderEditor(config);
    expect(screen.getByDisplayValue("Priya")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Remove Priya" }));
    expect(screen.queryByDisplayValue("Priya")).toBeNull();
    expect(screen.getByRole("status")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
    expect(screen.getByDisplayValue("Priya")).toBeTruthy();
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("removing a sub-event shows Undo and restores the row", () => {
    const config = blankConfig();
    config.subEvents = [
      { label: "Sangeet", dateText: "", timeText: "7:00 PM" },
    ];
    renderEditor(config);
    expect(screen.getByDisplayValue("Sangeet")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Remove Sangeet" }));
    expect(screen.queryByDisplayValue("Sangeet")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
    expect(screen.getByDisplayValue("Sangeet")).toBeTruthy();
  });
});
