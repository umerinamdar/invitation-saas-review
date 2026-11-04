import { useEffect, useRef, useState } from "react";
import { Invitation } from "@/components/invitation";
import { getDemoInvite } from "@/invites/demo-wedding";
import type { Theme } from "@/themes/types";

/**
 * A mobile width/height to lay the real engine out at, then scale down
 * to fit the handset frame. Wider than an actual phone (390-430px) on
 * purpose: the hero frame is short and wide names + family-lineage text
 * push the scratch card and confetti well past a real phone's first
 * screen (measured ~1080px down before the card finishes, with the
 * confetti burst lower still) — a true 390px mockup would crop the
 * reveal before it ever showed. 520 buys enough visible virtual height
 * to keep the whole open -> scratch -> confetti sequence in frame.
 */
const VIRTUAL_WIDTH = 520;
const VIRTUAL_HEIGHT = 1800;

/** Generous estimate of one full open -> scratch -> confetti -> petals
 * sequence for this theme's timings, plus a hold on the finished state,
 * before the demo remounts and starts over. */
const CYCLE_MS = 17000;

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
          height: VIRTUAL_HEIGHT,
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
