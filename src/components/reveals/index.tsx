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

const reveals: Record<Reveal, (props: RevealProps) => React.JSX.Element> = {
  envelope: EnvelopeReveal,
  doors: DoorsReveal,
  curtain: CurtainReveal,
  book: BookReveal,
  box: BoxReveal,
};

export function RevealStage({
  reveal,
  ...props
}: RevealProps & { reveal: Reveal }) {
  const Mechanic = reveals[reveal];
  return <Mechanic {...props} />;
}
