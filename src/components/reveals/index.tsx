import type { Reveal } from "@/themes/types";

export type RevealProps = {
  label: string;
  hosts: string;
  /**
   * The sealed scene. When a theme supplies one, the painting itself is what
   * opens — two halves of it swing or sweep apart — rather than CSS panels
   * drawn on top of it, which would cover the doors someone painted.
   */
  backdrop?: string;
  opening: boolean;
  onOpen: () => void;
};

/**
 * The whole sealed stage is the trigger — no seal, no separate visible
 * button or label pill sitting on top of the artwork. Keyboard-activatable
 * (Enter/Space) the same way the scratch-reveal card elsewhere in this app
 * is, so dropping the visible control doesn't drop accessibility with it.
 */
function openTriggerProps(hosts: string, opening: boolean, onOpen: () => void) {
  return {
    role: "button" as const,
    tabIndex: 0,
    "aria-label": `Open the invitation from ${hosts}`,
    "aria-disabled": opening,
    onClick: () => {
      if (!opening) onOpen();
    },
    onKeyDown: (e: React.KeyboardEvent) => {
      if (opening) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onOpen();
      }
    },
  };
}

export function EnvelopeReveal(props: RevealProps) {
  const { opening, onOpen, hosts } = props;
  return (
    <div
      className={`envelope ${opening ? "is-opening" : ""}`}
      {...openTriggerProps(hosts, opening, onOpen)}
    >
      <div className="envelope-paper" />
      <div className="envelope-flap" />
      <div className="envelope-bottom" />
      <span className="envelope-line left-line" />
      <span className="envelope-line right-line" />
    </div>
  );
}

/**
 * Two carved panels swing inward on a shared hinge. Same gesture and
 * timing contract as the envelope.
 */
export function DoorsReveal(props: RevealProps) {
  const { opening, onOpen, hosts, backdrop } = props;
  const painted = Boolean(backdrop);
  const half = (side: "left" | "right") =>
    backdrop
      ? ({
          backgroundImage: `url('${backdrop}')`,
          backgroundSize: "200% 100%",
          backgroundPosition: side === "left" ? "left center" : "right center",
        } as React.CSSProperties)
      : undefined;
  return (
    <div
      className={`doors ${opening ? "is-opening" : ""} ${painted ? "is-painted" : ""}`}
      {...openTriggerProps(hosts, opening, onOpen)}
    >
      <div className="door door-left">
        <span className="door-panel" style={half("left")} />
      </div>
      <div className="door door-right">
        <span className="door-panel" style={half("right")} />
      </div>
    </div>
  );
}

/**
 * Velvet drapes part from the centre, weighted so they sweep rather than
 * slide — the heaviest-feeling of the mechanics.
 */
export function CurtainReveal(props: RevealProps) {
  const { opening, onOpen, hosts, backdrop } = props;
  const painted = Boolean(backdrop);
  const half = (side: "left" | "right") =>
    backdrop
      ? ({
          backgroundImage: `url('${backdrop}')`,
          backgroundSize: "200% 100%",
          backgroundPosition: side === "left" ? "left center" : "right center",
        } as React.CSSProperties)
      : undefined;
  return (
    <div
      className={`curtain ${opening ? "is-opening" : ""} ${painted ? "is-painted" : ""}`}
      {...openTriggerProps(hosts, opening, onOpen)}
    >
      <div className="drape drape-left" style={half("left")} />
      <div className="drape drape-right" style={half("right")} />
      <span className="curtain-rod" />
    </div>
  );
}

/**
 * A folded card whose cover swings open on its spine.
 */
export function BookReveal(props: RevealProps) {
  const { opening, onOpen, hosts, backdrop } = props;
  const painted = Boolean(backdrop);
  return (
    <div
      className={`book ${opening ? "is-opening" : ""} ${painted ? "is-painted" : ""}`}
      {...openTriggerProps(hosts, opening, onOpen)}
    >
      <span className="book-page" />
      <div
        className="book-cover"
        style={
          backdrop
            ? ({
                backgroundImage: `url('${backdrop}')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              } as React.CSSProperties)
            : undefined
        }
      >
        {!painted && <span className="book-plate" />}
      </div>
      <span className="book-spine" />
    </div>
  );
}

/**
 * A keepsake box whose lid lifts and floats away. The lightest-feeling
 * mechanic, and the only one that moves upward.
 */
export function BoxReveal(props: RevealProps) {
  const { opening, onOpen, hosts, backdrop } = props;
  const painted = Boolean(backdrop);
  return (
    <div
      className={`box ${opening ? "is-opening" : ""} ${painted ? "is-painted" : ""}`}
      {...openTriggerProps(hosts, opening, onOpen)}
    >
      {!painted && <span className="box-base" />}
      <div
        className="box-lid"
        style={
          backdrop
            ? ({
                backgroundImage: `url('${backdrop}')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              } as React.CSSProperties)
            : undefined
        }
      >
        {!painted && <span className="box-rim" />}
      </div>
    </div>
  );
}

/**
 * A circular shutter dissolves open from the centre, like a camera iris
 * letting light in. The single moving part is the shutter disc itself.
 */
export function IrisReveal(props: RevealProps) {
  const { opening, onOpen, hosts, backdrop } = props;
  const painted = Boolean(backdrop);
  return (
    <div
      className={`iris ${opening ? "is-opening" : ""} ${painted ? "is-painted" : ""}`}
      {...openTriggerProps(hosts, opening, onOpen)}
    >
      <div
        className="iris-shutter"
        style={
          backdrop
            ? ({
                backgroundImage: `url('${backdrop}')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              } as React.CSSProperties)
            : undefined
        }
      />
      <span className="iris-ring" />
    </div>
  );
}

/**
 * Four quarter-panels, each sliding away to its own diagonal corner —
 * the "four panels to corners" gesture.
 */
export function QuadrantReveal(props: RevealProps) {
  const { opening, onOpen, hosts, backdrop } = props;
  const painted = Boolean(backdrop);
  const quarter = (corner: "tl" | "tr" | "bl" | "br") =>
    backdrop
      ? ({
          backgroundImage: `url('${backdrop}')`,
          backgroundSize: "200% 200%",
          backgroundPosition:
            corner === "tl"
              ? "left top"
              : corner === "tr"
                ? "right top"
                : corner === "bl"
                  ? "left bottom"
                  : "right bottom",
        } as React.CSSProperties)
      : undefined;
  return (
    <div
      className={`quadrant ${opening ? "is-opening" : ""} ${painted ? "is-painted" : ""}`}
      {...openTriggerProps(hosts, opening, onOpen)}
    >
      <span className="quadrant-panel tl" style={quarter("tl")} />
      <span className="quadrant-panel tr" style={quarter("tr")} />
      <span className="quadrant-panel bl" style={quarter("bl")} />
      <span className="quadrant-panel br" style={quarter("br")} />
    </div>
  );
}

/** Five blades sharing one pivot, fanning open at staggered angles. */
const FAN_BLADE_ANGLES = [-72, -36, 0, 36, 72] as const;

export function FanReveal(props: RevealProps) {
  const { opening, onOpen, hosts, backdrop } = props;
  const painted = Boolean(backdrop);
  return (
    <div
      className={`fan ${opening ? "is-opening" : ""} ${painted ? "is-painted" : ""}`}
      {...openTriggerProps(hosts, opening, onOpen)}
    >
      {FAN_BLADE_ANGLES.map((angle, i) => (
        <span
          key={angle}
          className="fan-blade"
          style={
            {
              "--fan-angle": `${angle}deg`,
              transitionDelay: `${i * 60}ms`,
              ...(backdrop
                ? {
                    backgroundImage: `url('${backdrop}')`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }
                : {}),
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

/**
 * Top and bottom halves slide away vertically, opposite directions —
 * the "wrap slides vertically" gesture.
 */
export function WrapReveal(props: RevealProps) {
  const { opening, onOpen, hosts, backdrop } = props;
  const painted = Boolean(backdrop);
  const half = (side: "top" | "bottom") =>
    backdrop
      ? ({
          backgroundImage: `url('${backdrop}')`,
          backgroundSize: "100% 200%",
          backgroundPosition: side === "top" ? "center top" : "center bottom",
        } as React.CSSProperties)
      : undefined;
  return (
    <div
      className={`wrap ${opening ? "is-opening" : ""} ${painted ? "is-painted" : ""}`}
      {...openTriggerProps(hosts, opening, onOpen)}
    >
      <span className="wrap-half wrap-top" style={half("top")} />
      <span className="wrap-half wrap-bottom" style={half("bottom")} />
    </div>
  );
}

/** Six horizontal slats flipping open in a staggered cascade. */
const BLIND_SLAT_COUNT = 6;

export function BlindsReveal(props: RevealProps) {
  const { opening, onOpen, hosts, backdrop } = props;
  const painted = Boolean(backdrop);
  return (
    <div
      className={`blinds ${opening ? "is-opening" : ""} ${painted ? "is-painted" : ""}`}
      {...openTriggerProps(hosts, opening, onOpen)}
    >
      {Array.from({ length: BLIND_SLAT_COUNT }, (_, i) => (
        <span
          key={i}
          className="blind-slat"
          style={
            {
              transitionDelay: `${i * 70}ms`,
              ...(backdrop
                ? {
                    backgroundImage: `url('${backdrop}')`,
                    backgroundSize: `100% ${BLIND_SLAT_COUNT * 100}%`,
                    backgroundPosition: `center ${(i * 100) / (BLIND_SLAT_COUNT - 1)}%`,
                  }
                : {}),
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

/**
 * The sheet rolls up and away past a decorative rod, like a parchment
 * scroll — the "scroll rolls up" gesture.
 */
export function ScrollReveal(props: RevealProps) {
  const { opening, onOpen, hosts, backdrop } = props;
  const painted = Boolean(backdrop);
  return (
    <div
      className={`scroll-cover ${opening ? "is-opening" : ""} ${painted ? "is-painted" : ""}`}
      {...openTriggerProps(hosts, opening, onOpen)}
    >
      <div
        className="scroll-sheet"
        style={
          backdrop
            ? ({
                backgroundImage: `url('${backdrop}')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              } as React.CSSProperties)
            : undefined
        }
      />
      <span className="scroll-rod" />
    </div>
  );
}

/**
 * Ivory Silk & Pearls' own mechanic, ported literally from its Lovable
 * build (see docs/ops/OPENING-STUDY-ivory-silk-pearls.md) — one envelope
 * texture cut into four clipped pieces (the flap, two side wings and the
 * bottom pocket), not a shared/reused gesture.
 *
 * No wax-seal graphic here (owner request, 2026-10-26): a plain
 * "You're Invited" line stands in its place. Dubai Silk keeps its own
 * seal image — this request was specific to the mechanics that didn't
 * already have an owner-made seal of their own.
 */
export function IvorySilkEnvelopeReveal(props: RevealProps) {
  const { opening, onOpen, hosts, backdrop } = props;
  const piece = backdrop
    ? ({ backgroundImage: `url('${backdrop}')` } as React.CSSProperties)
    : undefined;
  return (
    <div
      className={`isp-cover ${opening ? "is-opening" : ""}`}
      {...openTriggerProps(hosts, opening, onOpen)}
    >
      <div className="isp-underlay" />
      <div className="isp-shadow" />
      <div className="isp-piece isp-bottom" style={piece} />
      <div className="isp-piece isp-left" style={piece} />
      <div className="isp-piece isp-right" style={piece} />
      <div className="isp-flap">
        <div className="isp-piece isp-flap-face" style={piece} />
        <div className="isp-lining" />
      </div>
      <p className="isp-invited" aria-hidden="true">
        You&rsquo;re Invited
      </p>
      <p className="isp-cue">Tap to open</p>
    </div>
  );
}

/**
 * Ram Mandir's own mechanic, built directly in this engine (no Lovable
 * component existed to port — see Reveal's comment in themes/types.ts):
 * the sealedBackdrop photo itself — carved temple doors — split down
 * its own centre seam into two panels that swing open on their outer
 * edges, in the same three-beat spirit as Ivory Silk & Pearls'
 * envelope (a held glow, then one continuous swing with the card never
 * moving, text last) but built for a door rather than ported from one.
 */
export function RamMandirDoorsReveal(props: RevealProps) {
  const { opening, onOpen, hosts, backdrop } = props;
  const half = (side: "left" | "right") =>
    backdrop
      ? ({
          backgroundImage: `url('${backdrop}')`,
          backgroundSize: "200% 100%",
          backgroundPosition: side === "left" ? "left center" : "right center",
        } as React.CSSProperties)
      : undefined;
  return (
    <div
      className={`rmd-cover ${opening ? "is-opening" : ""}`}
      {...openTriggerProps(hosts, opening, onOpen)}
    >
      <div className="rmd-underlay" />
      <div className="rmd-door rmd-door-left" style={half("left")} />
      <div className="rmd-door rmd-door-right" style={half("right")} />
      <div className="rmd-glow" aria-hidden="true" />
      <p className="rmd-invited" aria-hidden="true">
        You&rsquo;re Invited
      </p>
      <p className="rmd-cue">Tap to open</p>
    </div>
  );
}

const reveals: Record<Reveal, (props: RevealProps) => React.JSX.Element> = {
  envelope: EnvelopeReveal,
  doors: DoorsReveal,
  curtain: CurtainReveal,
  book: BookReveal,
  box: BoxReveal,
  iris: IrisReveal,
  quadrant: QuadrantReveal,
  fan: FanReveal,
  wrap: WrapReveal,
  blinds: BlindsReveal,
  scroll: ScrollReveal,
  ivorySilkEnvelope: IvorySilkEnvelopeReveal,
  ramMandirDoors: RamMandirDoorsReveal,
};

export function RevealStage({
  reveal,
  ...props
}: RevealProps & { reveal: Reveal }) {
  const Mechanic = reveals[reveal];
  return <Mechanic {...props} />;
}
