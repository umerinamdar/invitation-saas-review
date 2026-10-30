import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// Pre-purchase watermark (owner request, 2026-10-23): the free preview
// surfaces (/preview/$themeId, /create, and /editor/$id while still
// unpublished) show a non-interactive overlay so theme designs aren't
// trivially screenshotted from free browsing. The published guest page
// (/i/$slug) never sets the prop, so it never renders.

vi.mock("@/lib/supabase", () => ({ supabase: {} }));

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

import { Invitation } from "@/components/invitation";
import { umerMaimoona } from "@/invites/umer-maimoona";
import { dubaiSilk } from "@/themes/dubai-silk";

describe("Invitation preview watermark", () => {
  it("renders the watermark overlay when watermark is true", () => {
    const { container } = render(
      <Invitation theme={dubaiSilk} invite={umerMaimoona} watermark />,
    );
    const overlay = container.querySelector(".preview-watermark");
    expect(overlay).not.toBeNull();
    expect(overlay?.getAttribute("aria-hidden")).toBe("true");
    expect(screen.getAllByText(/easyinvitemaker\.com/i).length).toBeGreaterThan(
      0,
    );
  });

  it("renders no watermark when the prop is omitted (the guest page's case)", () => {
    const { container } = render(
      <Invitation theme={dubaiSilk} invite={umerMaimoona} />,
    );
    expect(container.querySelector(".preview-watermark")).toBeNull();
  });

  it("renders no watermark when watermark is explicitly false", () => {
    const { container } = render(
      <Invitation theme={dubaiSilk} invite={umerMaimoona} watermark={false} />,
    );
    expect(container.querySelector(".preview-watermark")).toBeNull();
  });
});
