import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// invitation.tsx imports the browser Supabase client to resolve stored
// media paths; it throws at module load without env vars and is never
// exercised here (every media value in the fixture is app-relative).
vi.mock("@/lib/supabase", () => ({ supabase: {} }));

// jsdom media elements cannot play; the invitation primes audio on the
// opening gesture and would otherwise reject inside the click handler.
window.HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);
window.HTMLMediaElement.prototype.pause = vi.fn();

// jsdom has no FontFaceSet; the scratch canvas waits on document.fonts
// before painting. Real browsers always provide it.
Object.defineProperty(document, "fonts", {
  configurable: true,
  value: { ready: Promise.resolve() },
});

// jsdom has no ResizeObserver; the scratch canvas observes its own
// size with one. Real browsers always provide it.
vi.stubGlobal(
  "ResizeObserver",
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  },
);

// jsdom never loads images; stand in one that "loads" immediately so
// the artwork gate resolves (the same seam photo-picker.test.tsx uses).
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
import { getDemoInvite } from "@/invites/demo-wedding";
import { blankConfig } from "@/lib/invites-api";
import { getDraftIssues, getStoredInviteIssues } from "@/lib/draft-validation";
import { safeExternalUrl, venueMapsHref } from "@/lib/invitation";
import { buildShareLinks } from "@/lib/share";
import { getTheme } from "@/themes";

/**
 * Input-safety regression coverage (master prompt §5.2/§8.4):
 * invitation fields are owner-supplied strings that render on guests'
 * pages. Payloads must stay inert text, script-scheme URLs must never
 * become hrefs, and malformed stored payloads must hit validation
 * instead of throwing.
 */

const SCRIPT_NAME = "<script>alert(1)</script>";
const SVG_NAME = "<svg onload=alert(2)>";
const FUTURE = "2027-02-14T19:00:00+05:30";
const NOW = Date.parse("2027-01-01T00:00:00+05:30");

describe("URL helpers under hostile input", () => {
  it("safeExternalUrl rejects whitespace- and case-obfuscated script schemes", () => {
    expect(safeExternalUrl("  javascript:alert(1)")).toBeNull();
    expect(safeExternalUrl("\tJaVaScRiPt:alert(1)")).toBeNull();
    // The URL parser strips tabs/newlines before scheme parsing, so an
    // obfuscated scheme must still land on the allowlist check.
    expect(safeExternalUrl("java\nscript:alert(1)")).toBeNull();
    expect(safeExternalUrl("data:text/html;base64,PHNjcmlwdD4=")).toBeNull();
    expect(safeExternalUrl("vbscript:msgbox(1)")).toBeNull();
    expect(safeExternalUrl("file:///etc/passwd")).toBeNull();
  });

  it("venueMapsHref encodes a hostile venue name into an inert search URL", () => {
    const href = venueMapsHref(
      'Palace "><script>alert(1)</script>',
      "Road & <b>Co</b>",
    );
    const url = new URL(href);
    expect(url.protocol).toBe("https:");
    expect(url.hostname).toBe("www.google.com");
    expect(href).not.toContain("<script>");
    expect(url.searchParams.get("q")).toContain("Palace");
  });

  it("buildShareLinks encodes hostile couple names into the WhatsApp text", () => {
    const invite = getDemoInvite("dubai-silk");
    invite.hosts = { ...invite.hosts, person1: SCRIPT_NAME, person2: "Diya" };
    const links = buildShareLinks(invite, "https://example.test");
    expect(links.whatsappUrl).not.toContain("<script>");
    const url = new URL(links.whatsappUrl);
    expect(url.searchParams.get("text")).toContain(SCRIPT_NAME);
    expect(links.publicUrl).toBe("https://example.test/i/demo");
  });
});

describe("Invitation rendering with XSS payloads in config fields", () => {
  it("renders payloads as inert text and never emits a script-scheme href", async () => {
    const invite = getDemoInvite("dubai-silk");
    invite.hosts = {
      ...invite.hosts,
      person1: SCRIPT_NAME,
      person2: SVG_NAME,
    };
    invite.event = {
      ...invite.event,
      venueName: 'Grand "Palace" <script>alert(3)</script>',
      venueMapsUrl: "javascript:alert(4)",
    };
    invite.subEvents = [
      {
        label: "Mehendi <script>alert(5)</script>",
        dateText: "12 February",
        timeText: "6:00 PM onwards",
        venueName: "Courtyard Lawn",
        venueMapsUrl: "JaVaScRiPt:alert(6)",
      },
    ];
    invite.familyMembers = [
      { name: "<img src=x onerror=alert(7)>", role: "Brother of the groom" },
    ];
    invite.welcome = "<script>alert(8)</script> Welcome!";

    const { container } = render(
      <Invitation theme={getTheme("dubai-silk")} invite={invite} />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: /open the invitation from/i }),
    );
    await waitFor(
      () =>
        expect(container.querySelector(".opened-invitation")).not.toBeNull(),
      { timeout: 5000 },
    );

    // No payload became an element: React renders these fields as text,
    // and nothing in the tree may carry a payload-created node or handler.
    expect(container.querySelector("script")).toBeNull();
    expect(container.querySelector("img[src='x']")).toBeNull();
    expect(container.querySelector("svg[onload]")).toBeNull();
    expect(container.querySelector("[onerror]")).toBeNull();

    // The couple's names render as the literal (inert) strings.
    const heading = container.querySelector(".invitation-names h1");
    expect(heading?.textContent).toContain(SCRIPT_NAME);
    expect(heading?.textContent).toContain(SVG_NAME);

    // No anchor anywhere points at a script scheme.
    for (const anchor of container.querySelectorAll("a")) {
      expect(anchor.getAttribute("href") ?? "").not.toMatch(
        /^\s*(javascript|data|vbscript):/i,
      );
    }

    // The main venue's javascript: URL is dropped by the render
    // allowlist and replaced by the encoded Google search fallback.
    const venueLink = container.querySelector(".venue-section a");
    expect(venueLink?.getAttribute("href")).toMatch(
      /^https:\/\/www\.google\.com\/search\?q=/,
    );

    // The sub-event's script URL renders its venue as plain text.
    expect(container.querySelector(".sub-event a")).toBeNull();
    expect(container.querySelector(".sub-event-venue")?.textContent).toContain(
      "Courtyard Lawn",
    );
  });
});

describe("malformed invitation payloads", () => {
  it("getStoredInviteIssues tolerates non-object configs without throwing", () => {
    for (const bad of [null, undefined, "nope", 42, true, []]) {
      expect(() => getStoredInviteIssues(bad)).not.toThrow();
      expect(getStoredInviteIssues(bad).length).toBeGreaterThan(0);
    }
  });

  it("getStoredInviteIssues tolerates wrong-typed fields without throwing", () => {
    const bad = {
      hosts: { mode: "couple", person1: 42, person2: null },
      event: { startIso: 12345 },
      subEvents: "not-an-array",
      rsvp: { whatsapp: 999 },
    };
    expect(() => getStoredInviteIssues(bad)).not.toThrow();
    expect(getStoredInviteIssues(bad).length).toBeGreaterThan(0);
  });

  it("getDraftIssues reports hostile strings as ordinary field issues", () => {
    const config = blankConfig();
    config.hosts.person1 = SCRIPT_NAME;
    config.hosts.person2 = SVG_NAME;
    config.event.startIso = FUTURE;
    config.event.venueMapsUrl = "javascript:alert(1)";
    config.rsvp = { enabled: true, whatsapp: "javascript:alert(1)" };

    let fields: string[] = [];
    expect(() => {
      fields = getDraftIssues(config, NOW).map((issue) => issue.field);
    }).not.toThrow();
    // Names are inert data — present, so no name issues — while the
    // script-scheme link and the non-number are ordinary field issues.
    expect(fields).not.toContain("person1");
    expect(fields).not.toContain("person2");
    expect(fields).toContain("mapsUrl");
    expect(fields).toContain("whatsapp");
  });
});
