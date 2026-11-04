import { useEffect, useRef, useState } from "react";
import { Invitation } from "@/components/invitation";
import { getDemoInvite } from "@/invites/demo-wedding";
import type { Theme } from "@/themes/types";

/**
 * The width to lay the real engine out at, then scale down to fit the
 * handset frame. Wider than an actual phone (390-430px) on purpose:
 * this theme's names + family-lineage text push the scratch card and
 * confetti to roughly 1000-1080px down, and the measured visible crop
 * height scales with this width (~2.2x it, from this container's own
 * shape) — a true 390px width only clears about 870px, cropping the
 * reveal before it ever shows. 520 clears enough headroom for the
 * whole sequence; MAX_CROP_HEIGHT below is what actually prevents
 * showing too much, not this number.
 */
const VIRTUAL_WIDTH = 520;

/**
 * Hard ceiling on how much of the page this ever shows, in the same
 * virtual pixels as VIRTUAL_WIDTH — independent of the handset frame's
 * own shape. The names + family-lineage text push the scratch card and
 * confetti to roughly 950-1000px down, and the venue section (first
 * line "The Grand Pavilion") starts right at ~1080 — measured by
 * raising this cap until that heading became visible, then backing
 * off. This is what actually prevents the bug an aspect-ratio-only
 * crop had: on some screens the handset frame's own visible height,
 * converted to virtual pixels, was larger than expected and exposed
 * the countdown and function cards further down the real page. Capping
 * the crop box itself — not just trusting the frame's shape — means
 * that can't happen regardless of screen size.
 */
const MAX_CROP_HEIGHT = 1040;

/** One open -> scratch -> confetti -> petals sequence plus a hold on the
 * finished state, before the demo remounts and starts over. Paced about
 * 1.25x faster than the engine's own hands-off defaults, on top of the
 * (unchanged) theme timings a real guest also sees. */
const CYCLE_MS = 13600;

/**
 * The homepage hero's one featured phone: mounts the real invitation
 * engine (not a mockup) and drives it through its own opening, scratch
 * reveal, confetti and petals automatically, on a loop — exactly what a
 * guest sees, minus the tap and the sound. Purely decorative: its
 * ancestor is aria-hidden and this never receives pointer events, so it
 * can't intercept a click meant for the real page.
 */
export function HeroLivePreview({ theme }: { theme: Theme }) {
  const container = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [cropHeight, setCropHeight] = useState(MAX_CROP_HEIGHT);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    const el = container.current;
    if (!el) return;
    const measure = () => {
      const nextScale = el.clientWidth / VIRTUAL_WIDTH;
      setScale(nextScale);
      // Exactly how much virtual height this container actually shows,
      // not an estimate from the handset frame's declared aspect ratio —
      // then capped, so neither a measurement surprise nor an unusually
      // tall frame can ever reveal more of the real page than intended.
      const visible = nextScale > 0 ? el.clientHeight / nextScale : 0;
      setCropHeight(Math.min(visible || MAX_CROP_HEIGHT, MAX_CROP_HEIGHT));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const id = setInterval(() => setCycle((c) => c + 1), CYCLE_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="hero-live-preview" ref={container}>
      <div
        className="hero-live-preview-stage"
        style={{
          width: VIRTUAL_WIDTH,
          height: cropHeight,
          transform: `scale(${scale})`,
        }}
      >
        <Invitation
          key={cycle}
          theme={theme}
          invite={getDemoInvite(theme.id)}
          autoplayDemo
        />
      </div>
    </div>
  );
}
