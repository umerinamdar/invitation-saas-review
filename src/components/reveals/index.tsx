import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Reveal } from "@/themes/types";

export type RevealProps = {
  /** Lettering pressed into the seal, e.g. "UM". */
  initials: string;
  /** A finished seal belonging to one host; overrides the monogram. */
  sealImage?: string;
  /** A blank wax disc from the theme; the monogram prints over it. */
  sealDisc?: string;
  label: string;
  hosts: string;
  opening: boolean;
  onOpen: () => void;
};

/** The wax seal: a host's own finished seal, or their initials on a disc. */
export function WaxSeal({
  initials,
  sealImage,
  sealDisc,
}: Pick<RevealProps, "initials" | "sealImage" | "sealDisc">) {
  if (sealImage) return <img src={sealImage} width={816} height={816} alt="" />;
  return (
    <span className="wax-seal">
      {sealDisc && <img src={sealDisc} width={816} height={816} alt="" />}
      <span className="wax-monogram">{initials}</span>
    </span>
  );
}

/** The call to action every mechanic carries, wherever it sits. */
export function OpenLabel({
  label,
  opening,
  onOpen,
  className = "envelope-label",
}: Pick<RevealProps, "label" | "opening" | "onOpen"> & { className?: string }) {
  return (
    <Button
      variant="ghost"
      className={className}
      onClick={onOpen}
      disabled={opening}
    >
      {label} <ArrowUpRight />
    </Button>
  );
}

export function EnvelopeReveal(props: RevealProps) {
  const { opening, onOpen, hosts } = props;
  return (
    <div className={`envelope ${opening ? "is-opening" : ""}`}>
      <div className="envelope-paper" />
      <div className="envelope-flap" />
      <div className="envelope-bottom" />
      <span className="envelope-line left-line" />
      <span className="envelope-line right-line" />
      <Button
        variant="ghost"
        className="seal-button"
        onClick={onOpen}
        disabled={opening}
        aria-label={`Break the wax seal and open the invitation from ${hosts}`}
      >
        <WaxSeal {...props} />
      </Button>
      <OpenLabel {...props} />
    </div>
  );
}

/**
 * Two carved panels swing inward on a shared hinge, the seal splitting
 * between them. Same gesture and timing contract as the envelope.
 */
export function DoorsReveal(props: RevealProps) {
  const { opening, onOpen, hosts } = props;
  return (
    <div className={`doors ${opening ? "is-opening" : ""}`}>
      <div className="door door-left">
        <span className="door-panel" />
      </div>
      <div className="door door-right">
        <span className="door-panel" />
      </div>
      <Button
        variant="ghost"
        className="seal-button doors-seal"
        onClick={onOpen}
        disabled={opening}
        aria-label={`Open the doors to the invitation from ${hosts}`}
      >
        <WaxSeal {...props} />
      </Button>
      <OpenLabel {...props} className="doors-label" />
    </div>
  );
}

/**
 * Velvet drapes part from the centre, weighted so they sweep rather than
 * slide — the heaviest-feeling of the mechanics.
 */
export function CurtainReveal(props: RevealProps) {
  const { opening, onOpen, hosts } = props;
  return (
    <div className={`curtain ${opening ? "is-opening" : ""}`}>
      <div className="drape drape-left" />
      <div className="drape drape-right" />
      <span className="curtain-rod" />
      <Button
        variant="ghost"
        className="seal-button curtain-seal"
        onClick={onOpen}
        disabled={opening}
        aria-label={`Draw the curtains on the invitation from ${hosts}`}
      >
        <WaxSeal {...props} />
      </Button>
      <OpenLabel {...props} className="curtain-label" />
    </div>
  );
}

/**
 * A folded card whose cover swings open on its spine, the seal riding the
 * cover as it turns.
 */
export function BookReveal(props: RevealProps) {
  const { opening, onOpen, hosts } = props;
  return (
    <div className={`book ${opening ? "is-opening" : ""}`}>
      <span className="book-page" />
      <div className="book-cover">
        <span className="book-plate" />
        <Button
          variant="ghost"
          className="seal-button book-seal"
          onClick={onOpen}
          disabled={opening}
          aria-label={`Open the invitation from ${hosts}`}
        >
          <WaxSeal {...props} />
        </Button>
        <OpenLabel {...props} className="book-label" />
      </div>
      <span className="book-spine" />
    </div>
  );
}

/**
 * A keepsake box whose lid lifts and floats away, carrying the seal with it.
 * The lightest-feeling mechanic, and the only one that moves upward.
 */
export function BoxReveal(props: RevealProps) {
  const { opening, onOpen, hosts } = props;
  return (
    <div className={`box ${opening ? "is-opening" : ""}`}>
      <span className="box-base" />
      <div className="box-lid">
        <span className="box-rim" />
        <Button
          variant="ghost"
          className="seal-button box-seal"
          onClick={onOpen}
          disabled={opening}
          aria-label={`Lift the lid on the invitation from ${hosts}`}
        >
          <WaxSeal {...props} />
        </Button>
      </div>
      <OpenLabel {...props} className="box-label" />
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
