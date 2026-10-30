import { act, fireEvent, render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

// Task 2 (overnight 2026-10-24) — reveal mechanics regression sweep.
//
// Why this file exists: all five reveal mechanics share one trigger
// helper (openTriggerProps in src/components/reveals/index.tsx), but
// until now the ONLY exercise of any reveal trigger in the whole suite
// was a single mouse click on the envelope, inside the full Invitation
// render in input-safety.test.tsx. No test touched the keyboard path
// for any mechanic, and doors/curtain/book/box were never rendered by
// a test at all. These tests pin, per mechanic:
//   - role/tabIndex/aria-label contract (input-safety.test.tsx finds
//     the trigger by /open the invitation from/i — keep that true)
//   - click fires onOpen exactly once
//   - Enter fires onOpen exactly once
//   - Space fires onOpen exactly once AND swallows the default (a
//     keydown Space that is not preventDefaulted scrolls the page)
//   - while `opening`, click/Enter/Space are all inert and the
//     trigger reports aria-disabled
//   - a click+Enter+Space barrage against a stateful parent (the
//     real Invitation contract) still produces exactly one onOpen
import {
  BookReveal,
  BoxReveal,
  CathedralDoorsReveal,
  CurtainReveal,
  DoorsReveal,
  EnvelopeReveal,
  NoorBookReveal,
  RevealStage,
  type RevealProps,
} from "@/components/reveals";
import type { Reveal } from "@/themes/types";
import { noorOpeningMilestones } from "@/lib/motion";
import { noorInvitation } from "@/themes/noor-invitation";

const HOSTS = "Aisha & Rohan";
const LABEL = "Wedding";

type MechanicCase = {
  reveal: Reveal;
  Component: (props: RevealProps) => React.JSX.Element;
  rootClass: string;
  painted: boolean;
};

const MECHANICS: MechanicCase[] = [
  { reveal: "envelope", Component: EnvelopeReveal, rootClass: ".envelope", painted: false },
  { reveal: "doors", Component: DoorsReveal, rootClass: ".doors", painted: true },
  { reveal: "curtain", Component: CurtainReveal, rootClass: ".curtain", painted: true },
  { reveal: "book", Component: BookReveal, rootClass: ".book", painted: true },
  { reveal: "box", Component: BoxReveal, rootClass: ".box", painted: true },
  {
    reveal: "noorBook",
    Component: NoorBookReveal,
    rootClass: ".noor-cover",
    painted: true,
  },
  {
    reveal: "cathedralDoors",
    Component: CathedralDoorsReveal,
    rootClass: ".ctd-cover",
    painted: true,
  },
];

function baseProps(onOpen: () => void, opening = false): RevealProps {
  return { label: LABEL, hosts: HOSTS, opening, onOpen };
}

/** Mirrors the real parent contract in invitation.tsx: the first
 *  activation flips `opening`, which is what makes later activations
 *  inert — so the barrage test measures the composed behaviour, not
 *  just the helper in isolation. */
function StatefulStage({ reveal }: { reveal: Reveal }) {
  const [opening, setOpening] = useState(false);
  const onOpen = () => {
    onOpenSpy();
    setOpening(true);
  };
  return (
    <RevealStage
      reveal={reveal}
      label={LABEL}
      hosts={HOSTS}
      opening={opening}
      onOpen={onOpen}
    />
  );
}
const onOpenSpy = vi.fn();

describe.each(MECHANICS)(
  "$reveal reveal trigger",
  ({ Component, rootClass, painted }) => {
    it("exposes the shared button contract", () => {
      const { container } = render(<Component {...baseProps(vi.fn())} />);
      const trigger = screen.getByRole("button", {
        name: `Open the invitation from ${HOSTS}`,
      });
      expect(trigger).toBe(container.querySelector(rootClass));
      expect(trigger).toHaveAttribute("tabindex", "0");
      expect(trigger).not.toHaveAttribute("aria-disabled", "true");
    });

    it("fires onOpen exactly once on click", () => {
      const onOpen = vi.fn();
      render(<Component {...baseProps(onOpen)} />);
      const trigger = screen.getByRole("button");
      fireEvent.click(trigger);
      expect(onOpen).toHaveBeenCalledTimes(1);
    });

    it("fires onOpen exactly once on Enter", () => {
      const onOpen = vi.fn();
      render(<Component {...baseProps(onOpen)} />);
      const trigger = screen.getByRole("button");
      fireEvent.keyDown(trigger, { key: "Enter" });
      expect(onOpen).toHaveBeenCalledTimes(1);
    });

    it("fires onOpen exactly once on Space and prevents the page scroll", () => {
      const onOpen = vi.fn();
      render(<Component {...baseProps(onOpen)} />);
      const trigger = screen.getByRole("button");
      // fireEvent returns false when a handler called preventDefault —
      // a Space keydown that is not swallowed scrolls the page, and on
      // a native button would ALSO synthesise a click on keyup; the
      // div trigger must do the whole job itself, exactly once.
      const notPrevented = fireEvent.keyDown(trigger, { key: " " });
      expect(notPrevented).toBe(false);
      expect(onOpen).toHaveBeenCalledTimes(1);
      // No second activation arrives via a synthesised click on keyup.
      fireEvent.keyUp(trigger, { key: " " });
      expect(onOpen).toHaveBeenCalledTimes(1);
    });

    it("ignores unrelated keys", () => {
      const onOpen = vi.fn();
      render(<Component {...baseProps(onOpen)} />);
      const trigger = screen.getByRole("button");
      fireEvent.keyDown(trigger, { key: "Tab" });
      fireEvent.keyDown(trigger, { key: "a" });
      fireEvent.keyDown(trigger, { key: "Escape" });
      expect(onOpen).not.toHaveBeenCalled();
    });

    it("is inert while opening: click, Enter and Space all swallowed", () => {
      const onOpen = vi.fn();
      render(<Component {...baseProps(onOpen, true)} />);
      const trigger = screen.getByRole("button");
      expect(trigger).toHaveAttribute("aria-disabled", "true");
      expect(trigger).toHaveClass("is-opening");
      fireEvent.click(trigger);
      fireEvent.keyDown(trigger, { key: "Enter" });
      fireEvent.keyDown(trigger, { key: " " });
      expect(onOpen).not.toHaveBeenCalled();
    });

    it("a click+Enter+Space barrage against the stateful parent opens once", () => {
      onOpenSpy.mockClear();
      const { container } = render(<StatefulStage reveal={MECHANICS.find((m) => m.Component === Component)!.reveal} />);
      const trigger = screen.getByRole("button");
      fireEvent.click(trigger);
      fireEvent.keyDown(trigger, { key: "Enter" });
      fireEvent.keyDown(trigger, { key: " " });
      fireEvent.click(trigger);
      expect(onOpenSpy).toHaveBeenCalledTimes(1);
      expect(container.querySelector(rootClass)).toHaveClass("is-opening");
    });

    if (painted) {
      it("paints the two halves of the backdrop when one is supplied", () => {
        const { container } = render(
          <Component {...baseProps(vi.fn())} backdrop="/themes/x/sealed.jpg" />,
        );
        expect(container.querySelector(rootClass)).toHaveClass("is-painted");
      });
    }
  },
);

/**
 * Noor Invitation's fixed opening sequence (conversion 2026-10-29
 * of the Lovable project's OpeningBook + opening-timeline):
 * sealed book with TAP TO OPEN + You're invited → 1.2s hold →
 * 4.5s left-hinged swing with the camera reframing into a flat
 * two-page spread → 1.0s warm flash from the centre ON ITS OWN →
 * Ar-Rum 30:21 quote readable on the spread for 5.2s → 1.0s
 * settled fade. Flash and quote are conditionally rendered
 * phases, so they must NEVER coexist — every step below asserts
 * that mutual exclusion, not just the happy path. Timings are
 * pinned against noorOpeningMilestones so the CSS swing (1.2s
 * hold + 4.5s in styles.css) and the JS phases cannot drift.
 */
describe("noorBook opening sequence", () => {
  it("sealed: cover, cue and invited line, no flash, no quote", () => {
    const { container } = render(<NoorBookReveal {...baseProps(vi.fn())} />);
    const root = container.querySelector(".noor-cover")!;
    expect(root).toHaveAttribute("data-phase", "sealed");
    expect(screen.getByText("Tap to open")).not.toBeNull();
    expect(screen.getByText("You’re invited")).not.toBeNull();
    expect(container.querySelector(".noor-flash")).toBeNull();
    expect(screen.queryByText("Surah Ar-Rum · 30:21")).toBeNull();
  });

  it("walks sealed → spread → flash → quote → settled, flash and quote never overlapping", () => {
    vi.useFakeTimers();
    try {
      const { container, rerender } = render(
        <NoorBookReveal {...baseProps(vi.fn())} />,
      );
      const root = () => container.querySelector(".noor-cover")!;
      rerender(<NoorBookReveal {...baseProps(vi.fn(), true)} />);
      expect(root()).toHaveAttribute("data-phase", "opening");
      expect(root()).toHaveClass("is-opening");
      // Mid-opening: Lovable's manuscript structure is in the DOM —
      // camera reframing the volume, cover turning on its left
      // spine, right page + page edges + spine beneath it.
      expect(root()).toHaveClass("has-started");
      expect(container.querySelector(".noor-camera")).not.toBeNull();
      expect(container.querySelector(".noor-volume")).not.toBeNull();
      expect(container.querySelector(".noor-manuscript-cover")).not.toBeNull();
      expect(container.querySelector(".noor-page.noor-right")).not.toBeNull();
      expect(container.querySelector(".noor-page-edges")).not.toBeNull();
      expect(container.querySelector(".noor-spine")).not.toBeNull();
      // The cue leaves with the sealed state; nothing rides the cover.
      expect(screen.queryByText("Tap to open")).toBeNull();
      expect(container.querySelector(".noor-flash")).toBeNull();
      expect(screen.queryByText("Surah Ar-Rum · 30:21")).toBeNull();

      // 1.2s hold + 4.5s swing: flash, alone — no quote under it.
      act(() => {
        vi.advanceTimersByTime(5700);
      });
      expect(root()).toHaveAttribute("data-phase", "flash");
      expect(container.querySelector(".noor-flash")).not.toBeNull();
      expect(screen.queryByText("Surah Ar-Rum · 30:21")).toBeNull();

      // Flash fades, quote appears on the spread — flash gone.
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(root()).toHaveAttribute("data-phase", "quote");
      expect(container.querySelector(".noor-flash")).toBeNull();
      expect(screen.getByText("Surah Ar-Rum · 30:21")).not.toBeNull();
      expect(
        screen.getByText(/that you may find tranquillity in them/),
      ).not.toBeNull();
      // Lovable's verse sits inside the volume AFTER the cover, so
      // it paints above the cover's ivory back (the spread's left
      // page) instead of being covered by it.
      const coverEl = container.querySelector(".noor-manuscript-cover")!;
      const verseEl = container.querySelector(".noor-verse")!;
      expect(verseEl.closest(".noor-volume")).not.toBeNull();
      expect(
        coverEl.compareDocumentPosition(verseEl) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).not.toBe(0);

      // Quote sits readable for 5.2s, then the settled fade.
      act(() => {
        vi.advanceTimersByTime(5200);
      });
      expect(root()).toHaveAttribute("data-phase", "settled");
      expect(root()).toHaveClass("is-settled");
      expect(root()).toHaveClass("has-finished");
      expect(container.querySelector(".noor-flash")).toBeNull();
      expect(screen.getByText("Surah Ar-Rum · 30:21")).not.toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });

  it("paints Lovable's book from the backdrop: floor scene and cover face", () => {
    const { container } = render(
      <NoorBookReveal
        {...baseProps(vi.fn())}
        backdrop="/themes/noor-invitation/sealed.jpg"
      />,
    );
    expect(container.querySelector(".noor-cover")).toHaveClass("is-painted");
    const floor = container.querySelector(
      ".noor-floor",
    ) as HTMLImageElement | null;
    const coverImg = container.querySelector(
      ".noor-front img",
    ) as HTMLImageElement | null;
    expect(floor?.getAttribute("src")).toBe(
      "/themes/noor-invitation/sealed.jpg",
    );
    expect(coverImg?.getAttribute("src")).toBe(
      "/themes/noor-invitation/sealed.jpg",
    );
  });

  it("uses the floor image when the theme supplies one, cover stays the backdrop", () => {
    const { container } = render(
      <NoorBookReveal
        {...baseProps(vi.fn())}
        backdrop="/themes/noor-invitation/sealed.jpg"
        floor="/themes/noor-invitation/floor.jpg"
      />,
    );
    const floor = container.querySelector(
      ".noor-floor",
    ) as HTMLImageElement | null;
    const coverImg = container.querySelector(
      ".noor-front img",
    ) as HTMLImageElement | null;
    expect(floor?.getAttribute("src")).toBe(
      "/themes/noor-invitation/floor.jpg",
    );
    expect(coverImg?.getAttribute("src")).toBe(
      "/themes/noor-invitation/sealed.jpg",
    );
  });

  it("falls back to the backdrop if the floor image fails to load", () => {
    const { container } = render(
      <NoorBookReveal
        {...baseProps(vi.fn())}
        backdrop="/themes/noor-invitation/sealed.jpg"
        floor="/themes/noor-invitation/floor.jpg"
      />,
    );
    const floor = container.querySelector(
      ".noor-floor",
    ) as HTMLImageElement | null;
    expect(floor).not.toBeNull();
    fireEvent.error(floor!);
    expect(floor?.getAttribute("src")).toContain("sealed.jpg");
  });

  it("pins the theme's floor backdrop to Lovable's book-setting placement", () => {
    expect(noorInvitation.assets.floorBackdrop).toBe(
      "/themes/noor-invitation/floor.jpg",
    );
  });

  it("paints the illuminated inside pages when the theme supplies page art", () => {
    const { container } = render(
      <NoorBookReveal
        {...baseProps(vi.fn())}
        backdrop="/themes/noor-invitation/sealed.jpg"
        pageArt="/themes/noor-invitation/page.jpg"
      />,
    );
    const pages = container.querySelectorAll(".noor-page-art");
    expect(pages).toHaveLength(2);
    expect(pages[0]?.getAttribute("src")).toBe(
      "/themes/noor-invitation/page.jpg",
    );
    expect(pages[1]?.getAttribute("src")).toBe(
      "/themes/noor-invitation/page.jpg",
    );
    expect(container.querySelector(".noor-right .noor-page-art")).not.toBeNull();
    expect(container.querySelector(".noor-back .noor-page-art")).not.toBeNull();
  });

  it("keeps plain paper pages without page art", () => {
    const { container } = render(
      <NoorBookReveal
        {...baseProps(vi.fn())}
        backdrop="/themes/noor-invitation/sealed.jpg"
      />,
    );
    expect(container.querySelector(".noor-page-art")).toBeNull();
    expect(container.querySelectorAll(".noor-paper-art")).toHaveLength(2);
  });

  it("hides a missing page image and keeps the paper underneath", () => {
    const { container } = render(
      <NoorBookReveal
        {...baseProps(vi.fn())}
        backdrop="/themes/noor-invitation/sealed.jpg"
        pageArt="/themes/noor-invitation/page.jpg"
      />,
    );
    const art = container.querySelector(
      ".noor-page-art",
    ) as HTMLImageElement | null;
    expect(art).not.toBeNull();
    fireEvent.error(art!);
    expect(art!.style.display).toBe("none");
  });

  it("pins the theme's page artwork to Lovable's illuminated page", () => {
    expect(noorInvitation.assets.pageArtwork).toBe(
      "/themes/noor-invitation/page.jpg",
    );
  });

  it("pins the stage-relative sizing that keeps the editor phone honest", () => {
    // The editor renders the invitation into a fixed 375px phone canvas
    // inside a desktop viewport, while vw/dvh still resolve against
    // that viewport: the old seal (11vw, capped 136px) and book
    // (84vw/52dvh = 468px) both blew past the canvas, so the seal
    // looked huge and the sealed cover looked zoomed and cropped.
    // Both must size against their own stage, not the viewport.
    const css = readFileSync(
      resolve(process.cwd(), "src", "styles.css"),
      "utf8",
    );
    expect(css).toMatch(/\.ctd-seal\s*\{[^}]*width:\s*min\(20%, 96px\)/);
    expect(css).toMatch(/\.noor-cover\s*\{[^}]*container-type:\s*size/);
    expect(css).toMatch(/--noor-page-width:\s*min\(84cqw, 52cqh, 680px\)/);
    // The spread scale must come from a container query, not a viewport
    // media query: the old @media (min-width: 900px) rule gave the
    // editor's 375px canvas the desktop 0.88 scale, so the quote
    // spread rendered 554px wide and cropped at both edges.
    expect(css).not.toMatch(
      /@media\s*\(min-width:\s*900px\)\s*\{[^}]*--noor-spread-scale/,
    );
    expect(css).toMatch(
      /@container\s*\(min-width:\s*900px\)\s*\{[^}]*--noor-spread-scale:\s*0\.88/,
    );
  });

  it("pins Noor's light hero ink for the dark night courtyard", () => {
    // In the editor, hero fields render as real inputs and
    // .editable-field-input sets color: inherit (later than the field
    // classes), so the names, blessing and welcome inputs take the
    // section's colour, not their own class colour — and the section
    // inherited the theme's dark ink, so all three vanished on the
    // night hero while the heading (coloured on its container) stayed
    // visible. The section rule fixes the editor inputs; the welcome
    // rule fixes the guest line, which the shared rule colours with
    // the theme's dark muted ink.
    const css = readFileSync(
      resolve(process.cwd(), "src", "styles.css"),
      "utf8",
    );
    expect(css).toMatch(
      /\[data-theme-id="noor-invitation"\]\s*\.skyline-invitation\s*\{[^}]*color:\s*var\(--paper-light\)/,
    );
    expect(css).toMatch(
      /\[data-theme-id="noor-invitation"\]\s*\.invitation-welcome\s*\{[^}]*color:\s*var\(--paper-light\)/,
    );
  });

  it("pins phone hero sizes and Noor's tightened names spacing", () => {
    // On phones the shared ≤640px rule halved the hero names (76px
    // desktop → 38px) and set family lines to 12px, so every theme's
    // phone hero read small next to Lovable's 60px names — and Noor's
    // names block also absorbed all free vertical space (margin auto),
    // leaving a large empty middle between the welcome line and the
    // names. Names go to Lovable's 60px, the & scales with them,
    // and Noor's names block sits a fixed 24px under the
    // welcome with the leftover space below it instead.
    const css = readFileSync(
      resolve(process.cwd(), "src", "styles.css"),
      "utf8",
    );
    expect(css).not.toMatch(/calc\(38px \* var\(--names-scale, 1\)\)/);
    expect(css).toMatch(/calc\(60px \* var\(--names-scale, 1\)\)/);
    expect(css).toMatch(
      /\[data-theme-id="noor-invitation"\]\s*\.invitation-names\s*\{[^}]*margin:\s*24px 0 auto/,
    );
    expect(css).toMatch(
      /\[data-theme-id="noor-invitation"\]\s*\.invitation-names\s*\{[^}]*padding-top:\s*24px/,
    );
    // Editor hero inputs collapse to the inherited 16px because
    // .editable-field-input sets `font: inherit` and no hero container
    // sets a size — so the phone canvas gets the phone sizes back.
    expect(css).toMatch(
      /\.phone-screen\s+\.invitation-person-name\.editable-field-input\s*\{[^}]*font-size:\s*calc\(60px \* var\(--names-scale, 1\)\)/,
    );
    expect(css).toMatch(
      /\.phone-screen\s+\.invitation-and\s*\{[^}]*font-size:\s*calc\(32px \* var\(--names-scale, 1\)\)/,
    );
    expect(css).toMatch(
      /\.phone-screen\s+\.invitation-heading\s+\.editable-field-input\s*\{[^}]*font-size:\s*22px/,
    );
    expect(css).toMatch(
      /\.phone-screen\s+\.invitation-blessing\s+\.editable-field-input\s*\{[^}]*font-size:\s*17px/,
    );
    expect(css).toMatch(
      /\.phone-screen\s+\.invitation-welcome\.editable-field-input\s*\{[^}]*font-size:\s*15px/,
    );
  });

  it("pins the milestone arithmetic and the theme's openMs to it", () => {
    const milestones = noorOpeningMilestones(false);
    expect(milestones.flashAt).toBe(5700);
    expect(milestones.quoteAt).toBe(6700);
    expect(milestones.welcomeAt).toBe(11900);
    expect(milestones.removeAt).toBe(12900);
    // The parent unmounts the reveal at openMs; if this drifts from
    // removeAt, guests lose either the quote or the settled fade.
    expect(noorInvitation.motion.openMs).toBe(milestones.removeAt);
  });

  it("pins the volume flat rule that keeps the English verse visible", () => {
    // Site-only regression (caught 2026-10-29 by staged render):
    // inside the site's sealed stage the verse's translateZ is
    // flattened, so the cover-back — 3px proud of the cover plane
    // after the swing — occludes the translation page and the
    // English verse renders blank while the Arabic page shows. The
    // volume must stay flat so its children paint in DOM order and
    // the verse, which mounts last, lands on top. If this rule is
    // removed, the English page goes blank again with no test
    // failure anywhere else (jsdom cannot see 3D paint order).
    const css = readFileSync(
      resolve(process.cwd(), "src", "styles.css"),
      "utf8",
    );
    expect(css).toMatch(
      /\.noor-cover\s+\.noor-volume\s*\{[^}]*transform-style:\s*flat[^}]*\}/,
    );
  });

  it("reduced-motion guests settle immediately, never waiting out the swing", () => {
    vi.spyOn(window, "matchMedia").mockImplementation((query: string) => ({
      matches: query.includes("prefers-reduced-motion"),
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }));
    try {
      const { container } = render(
        <NoorBookReveal {...baseProps(vi.fn(), true)} />,
      );
      expect(container.querySelector(".noor-cover")).toHaveAttribute(
        "data-phase",
        "settled",
      );
    } finally {
      vi.restoreAllMocks();
    }
  });
});

describe("RevealStage dispatch", () => {
  it.each(MECHANICS)("renders the $reveal mechanic for reveal=$reveal", ({ reveal, rootClass }) => {
    const { container } = render(
      <RevealStage reveal={reveal} {...baseProps(vi.fn())} />,
    );
    expect(container.querySelector(rootClass)).not.toBeNull();
    expect(
      screen.getByRole("button", {
        name: `Open the invitation from ${HOSTS}`,
      }),
    ).not.toBeNull();
  });
});
