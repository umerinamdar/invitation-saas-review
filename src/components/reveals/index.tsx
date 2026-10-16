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

const reveals: Record<Reveal, (props: RevealProps) => React.JSX.Element> = {
  envelope: EnvelopeReveal,
  doors: DoorsReveal,
  // Not built yet — these fall back to the envelope until they are.
  curtain: EnvelopeReveal,
  book: EnvelopeReveal,
  box: EnvelopeReveal,
};

export function RevealStage({
  reveal,
  ...props
}: RevealProps & { reveal: Reveal }) {
  const Mechanic = reveals[reveal];
  return <Mechanic {...props} />;
}
