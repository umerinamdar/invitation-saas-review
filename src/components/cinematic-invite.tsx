import { useEffect, useRef } from 'react';
import { INTRO_SECONDS } from '@/lib/invitation';

/** One clock stages the inline reveal; completion leaves the same page scrollable. */
export function CinematicInvite({ running, onComplete }: { running: boolean; onComplete: () => void }) {
  const element = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!running) return;
    let frame = 0;
    let elapsed = 0;
    let previous = performance.now();
    const tick = (now: number) => {
      elapsed += Math.min((now - previous) / 1000, 0.1);
      previous = now;
      if (element.current) element.current.dataset['stage'] = elapsed < 1.2 ? 'skyline' : elapsed < 3 ? 'names' : 'invitation';
      if (elapsed >= INTRO_SECONDS) onComplete();
      else frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [running, onComplete]);
  return <div ref={element} className={`cinematic-reveal ${running ? 'intro-running' : 'intro-complete'}`} data-stage={running ? 'skyline' : 'invitation'} aria-hidden="true" />;
}
