import { fireEvent, render, screen } from "@testing-library/react";
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
  CurtainReveal,
  DoorsReveal,
  EnvelopeReveal,
  NoorBookReveal,
  RevealStage,
  type RevealProps,
} from "@/components/reveals";
import type { Reveal } from "@/themes/types";

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
