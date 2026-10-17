import { useEffect, useRef, useState } from "react";

/**
 * Two party poppers either side of the scratch card, fired once the date is
 * revealed. They throw a short arc of foil, and the petal shower takes over
 * as they settle — a burst first, then something continuous, rather than
 * petals simply appearing.
 *
 * Purely decorative and hidden from assistive tech; it unmounts itself once
 * the pieces have landed so nothing keeps animating behind the page.
 */
const PIECES = 26;
const LIFETIME_MS = 2200;

export function ConfettiBurst({ onSettled }: { onSettled?: () => void }) {
  const [gone, setGone] = useState(false);
  const settled = useRef(onSettled);
  settled.current = onSettled;

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setGone(true);
      settled.current?.();
      return;
    }
    const id = setTimeout(() => {
      setGone(true);
      settled.current?.();
    }, LIFETIME_MS);
    return () => clearTimeout(id);
  }, []);

  if (gone) return null;

  return (
    <div className="popper-burst" aria-hidden="true">
      {(["left", "right"] as const).map((side) => (
        <span key={side} className={`popper popper-${side}`}>
          {Array.from({ length: PIECES }, (_, i) => {
            // Fanned upward and inward, with enough scatter to look thrown.
            const spread = (i / (PIECES - 1)) * 76 - 38;
            const distance = 120 + ((i * 37) % 150);
            return (
              <i
                key={i}
                className={`popper-bit bit-${i % 4}`}
                style={
                  {
                    "--angle": `${spread}deg`,
                    "--distance": `${distance}px`,
                    "--delay": `${(i % 7) * 26}ms`,
                    "--spin": `${((i * 97) % 720) - 360}deg`,
                  } as React.CSSProperties
                }
              />
            );
          })}
        </span>
      ))}
    </div>
  );
}
