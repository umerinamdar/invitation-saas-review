import { useEffect, useRef, useState } from "react";
import { ConfettiBurst } from "@/components/confetti-burst";
import { OrnateFrame, PatternBackdrop } from "@/components/ornament";
import { RevealStage } from "@/components/reveals";
import { ScratchInvitation } from "@/components/scratch-invitation";
import { getDemoInvite } from "@/invites/demo-wedding";
import { hostNames } from "@/invites/types";
import { paletteVariables, type Theme } from "@/themes/types";

/** A realistic phone width/height to lay the scene out at — the scratch
 * card and its canvas-drawn text are sized in real pixels (150px tall,
 * 27px/20px/11px text) designed for a phone this size, not for the tiny
 * handset mockup. Rendering at this size first, then scaling the whole
 * scene down as one piece, keeps every proportion correct; shrinking
 * the pieces individually would leave the canvas's own drawn text
 * looking oversized relative to its shrunk card. */
const VIRTUAL_WIDTH = 390;
const VIRTUAL_HEIGHT = 845;

/**
 * Timings deliberately slower than the real engine's own defaults — this
 * plays unattended, on a loop, so each beat needs a moment to actually
 * read before the next one starts.
 */
const SEALED_HOLD_MS = 1600;
const OPENING_MS = 1600;
const NAMES_HOLD_MS = 1300;
const PETALS_HOLD_MS = 4000;

type Stage = "sealed" | "opening" | "opened";

/**
 * The homepage hero's one featured phone: a purpose-built loop of the
 * theme's own envelope-opening mechanic, scratch reveal, confetti and
 * petals — reusing the same self-contained pieces the real invitation
 * engine uses (RevealStage, ScratchInvitation, ConfettiBurst), but NOT
 * the real engine's own page (<Invitation>).
 *
 * An earlier version scaled the whole guest-facing page down to fit the
 * phone frame, and that page sizes itself off the browser's actual
 * viewport height (100svh/94svh, meant for a guest's own full screen).
 * What ended up visible inside the tiny scaled frame depended on the
 * HOST's screen, not on anything controlled here — on one screen it
 * cropped right after the scratch card, on another it exposed the
 * countdown and function cards hundreds of pixels further down the
 * real page. This scene has none of that: no viewport units anywhere
 * in what it renders, and nothing below the scratch card exists to
 * accidentally show.
 */
export function HeroLivePreview({ theme }: { theme: Theme }) {
  const container = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    const el = container.current;
    if (!el) return;
    const measure = () => setScale(el.clientWidth / VIRTUAL_WIDTH);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="hero-live-preview" ref={container}>
      <div
        className="hero-live-preview-stage"
        style={{
          width: VIRTUAL_WIDTH,
          height: VIRTUAL_HEIGHT,
          transform: `scale(${scale})`,
        }}
      >
        <HeroLivePreviewScene
          key={cycle}
          theme={theme}
          onDone={() => setCycle((c) => c + 1)}
        />
      </div>
    </div>
  );
}

function HeroLivePreviewScene({
  theme,
  onDone,
}: {
  theme: Theme;
  onDone: () => void;
}) {
  const [stage, setStage] = useState<Stage>("sealed");
  const [startScratch, setStartScratch] = useState(false);
  const [popped, setPopped] = useState(false);
  const [flowers, setFlowers] = useState(false);
  const done = useRef(onDone);
  done.current = onDone;

  const invite = getDemoInvite(theme.id);
  const names = hostNames(invite);
  const { sealedBackdrop, revealedBackdrop } = theme.assets;
  const { ornamentation } = theme;
  const { reveal, petals } = theme.motion;
  const open = stage === "opened";
  const vars = paletteVariables(theme) as React.CSSProperties;

  useEffect(() => {
    const t = setTimeout(() => setStage("opening"), SEALED_HOLD_MS);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (stage !== "opening") return;
    const t = setTimeout(() => setStage("opened"), OPENING_MS);
    return () => clearTimeout(t);
  }, [stage]);

  useEffect(() => {
    if (stage !== "opened") return;
    const t = setTimeout(() => setStartScratch(true), NAMES_HOLD_MS);
    return () => clearTimeout(t);
  }, [stage]);

  useEffect(() => {
    if (!flowers) return;
    const t = setTimeout(() => done.current(), PETALS_HOLD_MS);
    return () => clearTimeout(t);
  }, [flowers]);

  return (
    <div className="hero-live-preview-scene" style={vars}>
      {open ? (
        revealedBackdrop && (
          <img
            className="hero-live-preview-backdrop"
            src={revealedBackdrop}
            alt=""
          />
        )
      ) : sealedBackdrop ? (
        <img
          className="hero-live-preview-backdrop"
          src={sealedBackdrop}
          alt=""
        />
      ) : (
        <PatternBackdrop kind={ornamentation} />
      )}
      <OrnateFrame kind={ornamentation} />
      {!open ? (
        <div className="hero-live-preview-envelope">
          <RevealStage
            reveal={reveal}
            label={invite.event.typeLabel}
            hosts={names}
            opening={stage === "opening"}
            onOpen={() => {}}
            {...(sealedBackdrop ? { backdrop: sealedBackdrop } : {})}
          />
        </div>
      ) : (
        <div className="hero-live-preview-opened">
          <p className="hero-live-preview-label">{invite.event.typeLabel}</p>
          <div className="hero-live-preview-names">
            <h2>{invite.hosts.person1}</h2>
            {invite.hosts.person2 && (
              <>
                <span aria-hidden="true">&amp;</span>
                <h2>{invite.hosts.person2}</h2>
              </>
            )}
          </div>
          {popped && !flowers && (
            <ConfettiBurst onSettled={() => setFlowers(true)} />
          )}
          <div className="invitation-date">
            <ScratchInvitation
              theme={theme}
              event={invite.event}
              onReveal={() => setPopped(true)}
              autoScratch={startScratch}
            />
          </div>
          {flowers && petals !== "none" && (
            <div
              className={`flower-shower petals petals-${petals}`}
              aria-hidden="true"
            >
              {Array.from({ length: 14 }, (_, i) => (
                <i key={i} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
