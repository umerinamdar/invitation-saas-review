import { useEffect, useState } from "react";
import type { Reveal } from "@/themes/types";
import {
  NOOR_OPENING,
  noorOpeningMilestones,
  prefersReducedMotion,
  type NoorOpeningPhase,
} from "@/lib/motion";

export type RevealProps = {
  label: string;
  hosts: string;
  /**
   * The sealed scene. When a theme supplies one, the painting itself is what
   * opens — two halves of it swing or sweep apart — rather than CSS panels
   * drawn on top of it, which would cover the doors someone painted.
   */
  backdrop?: string;
  /**
   * Floor scene the sealed book sits on during a painted opening.
   * Omit it and the mechanic uses `backdrop` as the floor. When it
   * differs from `backdrop` and fails to load, the floor falls back
   * to `backdrop`, so the code is safe to ship before the file
   * itself lands.
   */
  floor?: string;
  /**
   * Illuminated inside-page art for a book opening, painted over the
   * paper texture on both inside pages. Omit it and the pages stay
   * paper-textured. When it fails to load, the image hides itself and
   * the paper shows, so the code is safe to ship before the file
   * itself lands.
   */
  pageArt?: string;
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

/**
 * Golden Temple's own mechanic — the same split-in-two-halves markup,
 * glow beat and outer-hinge swing as ramMandirDoors above (built
 * directly in this engine, not ported). Two earlier variants (a
 * slide-apart push, then a centre hinge) were each tried and rejected
 * in turn; the owner's final word (2026-10-27) was to make it exactly
 * like Ram Mandir's own doors. Once they clear, the revealed hero
 * scene dollies forward via the post-open .gtd-dolly-in keyframes
 * (see styles.css for both).
 */
export function GoldenTempleDoorsReveal(props: RevealProps) {
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
      className={`gtd-cover ${opening ? "is-opening" : ""}`}
      {...openTriggerProps(hosts, opening, onOpen)}
    >
      <div className="gtd-underlay" />
      <div className="gtd-door gtd-door-left" style={half("left")} />
      <div className="gtd-door gtd-door-right" style={half("right")} />
      <div className="gtd-glow" aria-hidden="true" />
      <p className="gtd-invited" aria-hidden="true">
        You&rsquo;re Invited
      </p>
      <p className="gtd-cue">Tap to open</p>
    </div>
  );
}

/**
 * Noor Invitation's own mechanic — a CONVERSION of the owner's
 * Lovable project "Noor Invitation" (054990d9), not a re-authoring.
 * The design lands in the site intact inside the site's container
 * (this RevealStage component + the theme definition + the branch
 * asset paths); the design itself is Lovable's, preserved exactly:
 * its OpeningBook structure, its manuscript geometry, its timeline
 * and its verse/flash rendering, ported from
 * src/components/invite/OpeningBook.tsx, opening-timeline.ts and
 * the manuscript block of styles.css. Only the container adapts:
 * class names are prefixed noor- (manuscript-* would collide in
 * the shared stylesheet), Lovable's CSS variables map onto the
 * site's identical palette variables (accent -> --gold,
 * accent-soft -> --gold-light, highlight -> --ink-light, the rest
 * already share names and values), the manuscript's fixed
 * positioning becomes absolute inside the site's sealed stage, and
 * the Tap-to-open control is a text pill rather than a nested
 * <button> because the site's shared trigger IS this root element.
 * The Lovable-only tokens (--book-navy, --book-scene,
 * --book-shadow, --ease-weighted) are carried scoped on .noor-cover
 * with Lovable's exact values. No seal anywhere, no names on the
 * cover. Timeline (noorOpeningMilestones, lib/motion.ts, Lovable's
 * exact numbers): sealed -> 1.2s hold -> 4.5s left-hinged swing
 * into the flat two-page spread -> 1.0s flash alone -> Ar-Rum
 * 30:21 readable on the spread for 5.2s -> 1.0s settled fade
 * (openMs 12900). Flash and quote are conditionally rendered
 * phases, so they can never overlap.
 */
export function NoorBookReveal(props: RevealProps) {
  const { opening, onOpen, hosts, backdrop, floor, pageArt } = props;
  const [phase, setPhase] = useState<NoorOpeningPhase>("sealed");

  useEffect(() => {
    if (!opening) return;
    if (prefersReducedMotion()) {
      setPhase("settled");
      return;
    }
    const milestones = noorOpeningMilestones(false);
    // Synchronous: the 1.2s hold lives in the CSS swing delay, not
    // in this phase — "opening" only gates what is rendered.
    setPhase("opening");
    const timers = [
      setTimeout(() => setPhase("flash"), milestones.flashAt),
      setTimeout(() => setPhase("quote"), milestones.quoteAt),
      setTimeout(() => setPhase("settled"), milestones.welcomeAt),
    ];
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [opening]);

  const painted = Boolean(backdrop);
  const started = phase !== "sealed";
  const floorSrc = floor ?? backdrop;
  const floorDiffers = Boolean(floor && backdrop && floor !== backdrop);
  const onFloorError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    // The floor file lands separately from this code (binary files
    // cannot travel through the connector push). Until it does, fall
    // back to the cover instead of a broken image.
    const img = event.currentTarget;
    if (backdrop && !img.dataset["floorFallback"]) {
      img.dataset["floorFallback"] = "true";
      img.src = backdrop;
    }
  };
  const onPageArtError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    // The page file lands separately from this code (binary files
    // cannot travel through the connector push). Until it does, hide
    // the image and let the paper texture underneath show instead of
    // a broken-image icon.
    event.currentTarget.style.display = "none";
  };

  return (
    <div
      className={`noor-cover ${opening ? "is-opening" : ""} ${painted ? "is-painted" : ""} is-${phase} ${started ? "has-started" : ""} ${phase === "settled" ? "has-finished" : ""}`}
      data-phase={phase}
      style={
        {
          "--book-hold": `${NOOR_OPENING.hold}ms`,
          "--book-swing": `${NOOR_OPENING.swing}ms`,
          "--book-flash-duration": `${NOOR_OPENING.flash}ms`,
        } as React.CSSProperties
      }
      {...openTriggerProps(hosts, opening, onOpen)}
    >
      {floorSrc && (
        <img
          className="noor-floor"
          src={floorSrc}
          alt=""
          width={1536}
          height={1024}
          aria-hidden="true"
          {...(floorDiffers ? { onError: onFloorError } : {})}
        />
      )}
      <div className="noor-stage">
        <div className="noor-camera">
          <div className="noor-volume">
            <div className="noor-page noor-right">
              <div className="noor-paper-art" aria-hidden="true" />
              {pageArt && (
                <img
                  className="noor-page-art"
                  src={pageArt}
                  alt=""
                  aria-hidden="true"
                  onError={onPageArtError}
                />
              )}
              <div className="noor-turn-shadow" />
            </div>
            <div className="noor-page-edges" aria-hidden="true" />
            <div className="noor-spine" aria-hidden="true" />
            <div className="noor-manuscript-cover">
              <div className="noor-front">
                {backdrop ? (
                  <img
                    src={backdrop}
                    alt="Navy keepsake book with gold ornament"
                    width={1024}
                    height={1536}
                  />
                ) : (
                  <div className="noor-front-fallback" aria-hidden="true" />
                )}
              </div>
              <div className="noor-back">
                <div className="noor-paper-art" aria-hidden="true" />
                {pageArt && (
                  <img
                    className="noor-page-art"
                    src={pageArt}
                    alt=""
                    aria-hidden="true"
                    onError={onPageArtError}
                  />
                )}
              </div>
              <div className="noor-cover-edge" aria-hidden="true" />
            </div>
            {(phase === "quote" || phase === "settled") && (
              <div className="noor-verse" role="status">
                <div className="noor-verse-page noor-translation-page">
                  <p className="noor-verse-label">Surah Ar-Rum · 30:21</p>
                  <div className="noor-gold-rule" />
                  <p className="noor-english">
                    &ldquo;And among His signs is that He created for you
                    spouses from among yourselves, that you may find
                    tranquillity in them; and He placed between you affection
                    and mercy. Indeed in that are signs for a people who give
                    thought.&rdquo;
                  </p>
                </div>
                <div className="noor-verse-page noor-arabic-page">
                  <p className="noor-verse-label" lang="ar" dir="rtl">
                    سورة الروم · ٣٠:٢١
                  </p>
                  <div className="noor-gold-rule" />
                  <p dir="rtl" lang="ar" className="noor-arabic">
                    وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ
                    أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم
                    مَّوَدَّةً وَرَحْمَةً ۚ إِنَّ فِي ذَٰلِكَ لَآيَاتٍ لِّقَوْمٍ
                    يَتَفَكَّرُونَ
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {phase === "sealed" && (
        <div className="noor-controls">
          <p className="noor-open">Tap to open</p>
          <p className="noor-invited">You&rsquo;re invited</p>
        </div>
      )}
      {phase === "flash" && (
        <div className="noor-flash" aria-hidden="true">
          <div className="noor-light" />
          <div className="noor-light-ray" />
        </div>
      )}
    </div>
  );
}

export function CathedralDoorsReveal(props: RevealProps) {
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
      className={`ctd-cover ${opening ? "is-opening" : ""} ${backdrop ? "is-painted" : ""}`}
      {...openTriggerProps(hosts, opening, onOpen)}
    >
      <div className="ctd-underlay" />
      <div className="ctd-door ctd-door-left" style={half("left")} />
      <div className="ctd-door ctd-door-right" style={half("right")} />
      <div className="ctd-glow" aria-hidden="true" />
      <svg className="ctd-seal" viewBox="0 0 200 200" aria-hidden="true">
        <defs>
          <radialGradient id="ctd-wax" cx="35%" cy="30%" r="80%">
            <stop offset="0%" stopColor="#f8e0d3" />
            <stop offset="55%" stopColor="#ecc2ac" />
            <stop offset="100%" stopColor="#d6a18a" />
          </radialGradient>
          <linearGradient id="ctd-gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f9e7a8" />
            <stop offset="45%" stopColor="#d4af37" />
            <stop offset="75%" stopColor="#a67c00" />
            <stop offset="100%" stopColor="#f1d97a" />
          </linearGradient>
          <g
            id="ctd-leaf"
            fill="url(#ctd-gold)"
            stroke="#8a6d1f"
            strokeWidth="0.6"
          >
            <path d="M 0 -14 Q 7 -6 0 14 Q -7 -6 0 -14" />
          </g>
          <g
            id="ctd-lily"
            fill="url(#ctd-gold)"
            stroke="#8a6d1f"
            strokeWidth="0.75"
          >
            <path d="M 0 0 C 6 -8 6 -20 0 -28 C -6 -20 -6 -8 0 0" />
            <path
              d="M 0 0 C 6 -8 6 -20 0 -28 C -6 -20 -6 -8 0 0"
              transform="rotate(-42) scale(0.8)"
            />
            <path
              d="M 0 0 C 6 -8 6 -20 0 -28 C -6 -20 -6 -8 0 0"
              transform="rotate(42) scale(0.8)"
            />
            <circle cx="0" cy="-5" r="2.2" fill="#8a6d1f" stroke="none" />
          </g>
        </defs>
        <path
          d="M 185.3 83.0 Q 197.0 100.0 185.3 117.0 Q 189.6 137.1 172.3 148.3 Q 168.6 168.6 148.3 172.3 Q 137.1 189.6 117.0 185.3 Q 100.0 197.0 83.0 185.3 Q 62.9 189.6 51.7 172.3 Q 31.4 168.6 27.7 148.3 Q 10.4 137.1 14.7 117.0 Q 3.0 100.0 14.7 83.0 Q 10.4 62.9 27.7 51.7 Q 31.4 31.4 51.7 27.7 Q 62.9 10.4 83.0 14.7 Q 100.0 3.0 117.0 14.7 Q 137.1 10.4 148.3 27.7 Q 168.6 31.4 172.3 51.7 Q 189.6 62.9 185.3 83.0 Z"
          fill="url(#ctd-wax)"
          stroke="#b98a76"
          strokeWidth="1"
        />
        <circle
          cx="100"
          cy="100"
          r="80"
          fill="none"
          stroke="url(#ctd-gold)"
          strokeWidth="1.5"
          opacity="0.8"
        />
        <g>
          <use
            href="#ctd-leaf"
            transform="translate(166.0 100.0) rotate(180)"
          />
          <use
            href="#ctd-leaf"
            transform="translate(161.0 125.3) rotate(202.5)"
          />
          <use
            href="#ctd-leaf"
            transform="translate(146.7 146.7) rotate(225)"
          />
          <use
            href="#ctd-leaf"
            transform="translate(125.3 161.0) rotate(247.5)"
          />
          <use
            href="#ctd-leaf"
            transform="translate(100.0 166.0) rotate(270)"
          />
          <use
            href="#ctd-leaf"
            transform="translate(74.7 161.0) rotate(292.5)"
          />
          <use href="#ctd-leaf" transform="translate(53.3 146.7) rotate(315)" />
          <use
            href="#ctd-leaf"
            transform="translate(39.0 125.3) rotate(337.5)"
          />
          <use href="#ctd-leaf" transform="translate(34.0 100.0) rotate(360)" />
          <use
            href="#ctd-leaf"
            transform="translate(39.0 74.7) rotate(382.5)"
          />
          <use href="#ctd-leaf" transform="translate(53.3 53.3) rotate(405)" />
          <use
            href="#ctd-leaf"
            transform="translate(74.7 39.0) rotate(427.5)"
          />
          <use href="#ctd-leaf" transform="translate(100.0 34.0) rotate(450)" />
          <use
            href="#ctd-leaf"
            transform="translate(125.3 39.0) rotate(472.5)"
          />
          <use href="#ctd-leaf" transform="translate(146.7 53.3) rotate(495)" />
          <use
            href="#ctd-leaf"
            transform="translate(161.0 74.7) rotate(517.5)"
          />
        </g>
        <g>
          <use
            href="#ctd-lily"
            transform="translate(100.0 40.0) rotate(360) scale(0.9)"
          />
          <use
            href="#ctd-lily"
            transform="translate(160.0 100.0) rotate(90) scale(0.9)"
          />
          <use
            href="#ctd-lily"
            transform="translate(100.0 160.0) rotate(180) scale(0.9)"
          />
          <use
            href="#ctd-lily"
            transform="translate(40.0 100.0) rotate(270) scale(0.9)"
          />
        </g>
        <circle cx="100" cy="100" r="34" fill="#f3d7c8" opacity="0.75" />
        <use href="#ctd-lily" transform="translate(100 110) scale(1.3)" />
        <ellipse
          cx="72"
          cy="56"
          rx="48"
          ry="20"
          fill="#ffffff"
          opacity="0.16"
          transform="rotate(-28 72 56)"
        />
        <ellipse
          cx="58"
          cy="42"
          rx="18"
          ry="8"
          fill="#ffffff"
          opacity="0.22"
          transform="rotate(-28 58 42)"
        />
      </svg>
      <p className="ctd-cue">Tap to open</p>
      <p className="ctd-invited" aria-hidden="true">
        You&rsquo;re Invited
      </p>
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
  goldenTempleDoors: GoldenTempleDoorsReveal,
  noorBook: NoorBookReveal,
  cathedralDoors: CathedralDoorsReveal,
};

export function RevealStage({
  reveal,
  ...props
}: RevealProps & { reveal: Reveal }) {
  const Mechanic = reveals[reveal];
  return <Mechanic {...props} />;
}
