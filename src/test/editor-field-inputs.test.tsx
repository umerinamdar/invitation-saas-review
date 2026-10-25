import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

// Editor-inputs round (2026-10-24): the renderer already displayed a set
// of invite fields the shared editor gave the host no way to type —
// venue address, muhurat, dress codes, sub-event venue/maps/dress/note,
// family relation, family members, RSVP phone/email, single-host mode
// and the link-preview meta. These tests pin the new inputs: each one
// exists in the editor, writes the exact schema path, and the value
// comes back out of the rendered invitation (or, for meta, out of the
// invite object the guest route's head() reads).

// invitation.tsx and the pickers import the browser Supabase client; it
// throws at module load without env vars and is never exercised here.
vi.mock("@/lib/supabase", () => ({ supabase: {} }));

// Signed out: no user, so the editor's media-signing effect is inert
// and the pickers explain uploads instead of touching storage.
vi.mock("@/lib/auth", () => ({
  useAuth: () => ({ session: null, loading: false }),
  useUser: () => null,
  signOut: vi.fn(async () => {}),
}));

// jsdom media elements cannot play; the preview invitation primes
// audio on the opening gesture (same shims as input-safety.test.tsx).
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
import { Invitation } from "@/components/invitation";
import { LocaleProvider } from "@/i18n/locale-context";
import { blankConfig, toInvite, type InviteConfig } from "@/lib/invites-api";
import type { InviteRow } from "@/lib/supabase";
import { getTheme } from "@/themes";

const FUTURE = "2027-02-14T19:00:00+05:30";

function baseConfig(): InviteConfig {
  const config = blankConfig();
  config.hosts = { mode: "couple", person1: "Asha", person2: "Vikram" };
  config.event = {
    ...config.event,
    startIso: FUTURE,
    dateText: "14 February 2027",
    dayText: "Sunday",
    timeText: "7:00 PM onwards",
    venueName: "The Grand Pavilion",
  };
  return config;
}

/** Renders the real editor statefully and records every onChange. */
function renderEditor(initial: InviteConfig) {
  const seen: InviteConfig[] = [];
  function Harness() {
    const [config, setConfig] = useState(initial);
    return (
      <LocaleProvider>
        <InviteEditor
          config={config}
          themeId="dubai-silk"
          onChange={(next) => {
            seen.push(next);
            setConfig(next);
          }}
          onThemeChange={() => {}}
          toolbar={null}
        />
      </LocaleProvider>
    );
  }
  const utils = render(<Harness />);
  return { ...utils, latest: () => seen[seen.length - 1]! };
}

describe("editor inputs for renderer-supported fields", () => {
  it("renders an input for every previously uneditable field", () => {
    renderEditor(baseConfig());
    expect(screen.getByLabelText("Venue address")).toBeTruthy();
    expect(screen.getByLabelText("Muhurat (auspicious time)")).toBeTruthy();
    expect(screen.getByLabelText("Dress code")).toBeTruthy();
    expect(screen.getAllByLabelText("Relation")).toHaveLength(2);
    expect(screen.getByLabelText("Phone number")).toBeTruthy();
    expect(screen.getByLabelText("Email address")).toBeTruthy();
    expect(screen.getByLabelText("Page title")).toBeTruthy();
    expect(screen.getByLabelText("Page description")).toBeTruthy();
    expect(screen.getByText("Family members")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Add a family member" }),
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: "Just me" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Two of us" })).toBeTruthy();
  });

  it("the-day inputs write event.venueAddress / muhuratText / dressCode", () => {
    const { latest } = renderEditor(baseConfig());
    fireEvent.change(screen.getByLabelText("Venue address"), {
      target: { value: "21 Lake Palace Road" },
    });
    fireEvent.change(screen.getByLabelText("Muhurat (auspicious time)"), {
      target: { value: "Shubh muhurat 10:15 AM" },
    });
    fireEvent.change(screen.getByLabelText("Dress code"), {
      target: { value: "Traditional or cocktail" },
    });
    expect(latest().event.venueAddress).toBe("21 Lake Palace Road");
    expect(latest().event.muhuratText).toBe("Shubh muhurat 10:15 AM");
    expect(latest().event.dressCode).toBe("Traditional or cocktail");
  });

  it("relation inputs write hosts.family1.relation and family2.relation", () => {
    const { latest } = renderEditor(baseConfig());
    const [first, second] = screen.getAllByLabelText("Relation");
    fireEvent.change(first!, { target: { value: "Daughter of" } });
    fireEvent.change(second!, { target: { value: "Son of" } });
    expect(latest().hosts.family1?.relation).toBe("Daughter of");
    expect(latest().hosts.family2?.relation).toBe("Son of");
  });

  it("phone and email write rsvp.phone / rsvp.email and switch RSVP on", () => {
    const { latest } = renderEditor(baseConfig());
    fireEvent.change(screen.getByLabelText("Phone number"), {
      target: { value: "+91 98200 11111" },
    });
    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "asha@example.com" },
    });
    expect(latest().rsvp?.phone).toBe("+91 98200 11111");
    expect(latest().rsvp?.email).toBe("asha@example.com");
    expect(latest().rsvp?.enabled).toBe(true);
  });

  it("meta inputs write config.meta and survive toInvite (the route head source)", () => {
    const { latest } = renderEditor(baseConfig());
    fireEvent.change(screen.getByLabelText("Page title"), {
      target: { value: "Asha & Vikram — Wedding" },
    });
    fireEvent.change(screen.getByLabelText("Page description"), {
      target: { value: "Join us in Udaipur on 14 February 2027." },
    });
    expect(latest().meta).toEqual({
      title: "Asha & Vikram — Wedding",
      description: "Join us in Udaipur on 14 February 2027.",
    });
    const invite = toInvite({
      slug: "asha-vikram-x1",
      theme_id: "dubai-silk",
      config: latest(),
    } as unknown as InviteRow);
    expect(invite.meta.title).toBe("Asha & Vikram — Wedding");
    expect(invite.meta.description).toBe(
      "Join us in Udaipur on 14 February 2027.",
    );
  });

  it("sub-event detail inputs write venueName / venueMapsUrl / dressCode / note", () => {
    const { latest } = renderEditor(baseConfig());
    fireEvent.click(screen.getByRole("button", { name: "Add a function" }));
    fireEvent.change(screen.getByPlaceholderText("Venue"), {
      target: { value: "Courtyard Lawn" },
    });
    fireEvent.change(screen.getByPlaceholderText("Maps link"), {
      target: { value: "https://maps.app.goo.gl/meh" },
    });
    fireEvent.change(screen.getByPlaceholderText("Dress code"), {
      target: { value: "Bright colours" },
    });
    fireEvent.change(screen.getByPlaceholderText("Note for guests"), {
      target: { value: "Henna artists provided" },
    });
    expect(latest().subEvents?.[0]).toMatchObject({
      venueName: "Courtyard Lawn",
      venueMapsUrl: "https://maps.app.goo.gl/meh",
      dressCode: "Bright colours",
      note: "Henna artists provided",
    });
  });

  it("family members can be added, edited and removed", () => {
    const { latest } = renderEditor(baseConfig());
    fireEvent.click(
      screen.getByRole("button", { name: "Add a family member" }),
    );
    fireEvent.change(screen.getByPlaceholderText("Priya Sharma"), {
      target: { value: "Priya Sharma" },
    });
    fireEvent.change(screen.getByPlaceholderText("Sister of the bride"), {
      target: { value: "Sister of the bride" },
    });
    expect(latest().familyMembers).toEqual([
      { name: "Priya Sharma", role: "Sister of the bride" },
    ]);
    fireEvent.click(
      screen.getByRole("button", { name: "Remove Priya Sharma" }),
    );
    expect(latest().familyMembers).toEqual([]);
  });

  it("single-host mode drops person2, hides the partner + second family, and restores", () => {
    const { latest } = renderEditor(baseConfig());
    expect(screen.getByLabelText("Partner's name")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Just me" }));
    expect(latest().hosts.mode).toBe("single");
    expect(latest().hosts.person2).toBeUndefined();
    expect(screen.queryByLabelText("Partner's name")).toBeNull();
    expect(screen.getAllByLabelText("Relation")).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: "Two of us" }));
    expect(latest().hosts.mode).toBe("couple");
    expect(screen.getByLabelText("Partner's name")).toBeTruthy();
    expect(screen.getAllByLabelText("Relation")).toHaveLength(2);
  });
});

describe("the new fields in the rendered invitation", () => {
  function fullInvite() {
    const config = baseConfig();
    config.hosts = {
      mode: "couple",
      person1: "Asha",
      person2: "Vikram",
      family1: { relation: "Daughter of", parents: "Mr. & Mrs. Rao" },
      family2: { relation: "Son of", parents: "Mr. & Mrs. Iyer" },
    };
    config.event = {
      ...config.event,
      venueAddress: "21 Lake Palace Road",
      muhuratText: "Shubh muhurat 10:15 AM",
      dressCode: "Traditional or cocktail",
    };
    config.subEvents = [
      {
        label: "Mehendi",
        dateText: "12 February",
        timeText: "6:00 PM",
        venueName: "Courtyard Lawn",
        venueMapsUrl: "https://maps.app.goo.gl/meh",
        dressCode: "Bright colours",
        note: "Henna artists provided",
      },
    ];
    config.familyMembers = [
      { name: "Priya Sharma", role: "Sister of the bride" },
    ];
    config.rsvp = {
      enabled: true,
      whatsapp: "+91 98200 00000",
      phone: "+91 98200 11111",
      email: "asha@example.com",
      byDateText: "20 January 2027",
    };
    return { ...config, slug: "test", themeId: "dubai-silk" };
  }

  it("renders every newly editable field after opening", async () => {
    const { container } = render(
      <Invitation theme={getTheme("dubai-silk")} invite={fullInvite()} />,
    );
    fireEvent.click(
      screen.getByRole("button", { name: /open the invitation from/i }),
    );
    await waitFor(
      () =>
        expect(container.querySelector(".opened-invitation")).not.toBeNull(),
      { timeout: 5000 },
    );

    expect(container.querySelector(".venue-address")?.textContent).toBe(
      "21 Lake Palace Road",
    );
    expect(container.querySelector(".venue-muhurat")?.textContent).toBe(
      "Shubh muhurat 10:15 AM",
    );
    expect(container.querySelector(".venue-dress")?.textContent).toBe(
      "Dress code · Traditional or cocktail",
    );

    const subVenue = container.querySelector(".sub-event-venue");
    expect(subVenue?.tagName).toBe("A");
    expect(subVenue?.getAttribute("href")).toBe("https://maps.app.goo.gl/meh");
    expect(subVenue?.textContent).toContain("Courtyard Lawn");
    expect(container.querySelector(".sub-event-dress")?.textContent).toBe(
      "Bright colours",
    );
    expect(container.querySelector(".sub-event-note")?.textContent).toBe(
      "Henna artists provided",
    );

    // The typed relation replaces the renderer's "Child of" default.
    const families = container.querySelector(".families, .hosts-families");
    const bodyText = container.textContent ?? "";
    expect(bodyText).toContain("Daughter of Mr. & Mrs. Rao");
    expect(bodyText).toContain("Son of Mr. & Mrs. Iyer");
    expect(bodyText).not.toContain("Child of");
    void families;

    expect(container.querySelector(".family-section")?.textContent).toContain(
      "Priya Sharma",
    );
    expect(container.querySelector(".family-section")?.textContent).toContain(
      "Sister of the bride",
    );

    const tel = container.querySelector('a[href^="tel:"]');
    expect(tel?.getAttribute("href")).toBe("tel:+919820011111");
    const mail = container.querySelector('a[href^="mailto:"]');
    expect(mail?.getAttribute("href")).toBe("mailto:asha@example.com");
  });

  it("single-host invites render one name only", async () => {
    const invite = fullInvite();
    invite.hosts = {
      mode: "single",
      person1: "Asha",
      family1: { relation: "Daughter of", parents: "Mr. & Mrs. Rao" },
    };
    delete invite.familyMembers;
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
    const heading = container.querySelector(".invitation-names h1");
    expect(heading?.textContent).toContain("Asha");
    expect(heading?.textContent).not.toContain("Vikram");
    expect(container.textContent).toContain("Daughter of Mr. & Mrs. Rao");
  });
});
