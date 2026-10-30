import { useEffect, useRef, useState } from "react";
import type { Theme } from "@/themes/types";
import type { Invite } from "@/invites/types";

type Props = {
  theme: Theme;
  event: Invite["event"];
  onReveal: () => void;
};

export function ScratchInvitation({ theme, event, onReveal }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const dragging = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const scratched = useRef(false);
  const [revealed, setRevealed] = useState(false);

  const { paperTexture } = theme.assets;
  const { scratchTitle, scratchHint } = theme.copy;
  const { scratchThreshold } = theme.motion;

  function reveal() {
    if (revealed) return;
    setRevealed(true);
    onReveal();
  }

  useEffect(() => {
    const element = canvas.current;
    if (!element || revealed) return;
    let oldWidth = 0;
    let disposed = false;
    const texture = new Image();
    const draw = () => {
      const bounds = element.getBoundingClientRect();
      if (Math.round(bounds.width) === oldWidth) return;
      oldWidth = Math.round(bounds.width);
      const dpr = window.devicePixelRatio || 1;
      // Preserve scratched areas across a resize instead of repainting the foil.
      const previous = document.createElement("canvas");
      previous.width = element.width;
      previous.height = element.height;
      previous.getContext("2d")?.drawImage(element, 0, 0);
      element.width = Math.round(bounds.width * dpr);
      element.height = Math.round(bounds.height * dpr);
      const ctx = element.getContext("2d");
      if (!ctx) return;
      if (scratched.current) {
        ctx.drawImage(previous, 0, 0, element.width, element.height);
        return;
      }
      ctx.scale(dpr, dpr);
      const styles = getComputedStyle(element);
      const token = (name: string) => styles.getPropertyValue(name).trim();
      const fill = ctx.createLinearGradient(0, 0, bounds.width, bounds.height);
      fill.addColorStop(0, token("--paper-light"));
      fill.addColorStop(0.45, token("--scratch"));
      fill.addColorStop(1, token("--paper-dark"));
      ctx.fillStyle = fill;
      ctx.fillRect(0, 0, bounds.width, bounds.height);
      if (texture.complete && texture.naturalWidth > 0) {
        ctx.globalAlpha = 0.42;
        ctx.drawImage(texture, 0, 0, bounds.width, bounds.height);
        ctx.globalAlpha = 1;
      }
      ctx.fillStyle = token("--scratch-ink");
      ctx.globalAlpha = 0.14;
      for (let x = 12; x < bounds.width; x += 18)
        for (let y = 12; y < bounds.height; y += 18) {
          ctx.beginPath();
          ctx.arc(x, y, 0.7, 0, Math.PI * 2);
          ctx.fill();
        }
      ctx.globalAlpha = 0.8;
      ctx.strokeStyle = token("--gold");
      ctx.lineWidth = 0.7;
      ctx.strokeRect(10, 10, bounds.width - 20, bounds.height - 20);
      ctx.globalAlpha = 0.35;
      ctx.strokeRect(14, 14, bounds.width - 28, bounds.height - 28);
      ctx.globalAlpha = 0.8;
      for (const [x, y, directionX, directionY] of [
        [22, 22, 1, 1],
        [bounds.width - 22, 22, -1, 1],
        [22, bounds.height - 22, 1, -1],
        [bounds.width - 22, bounds.height - 22, -1, -1],
      ]) {
        if (
          x === undefined ||
          y === undefined ||
          directionX === undefined ||
          directionY === undefined
        )
          continue;
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(directionX, directionY);
        ctx.beginPath();
        ctx.moveTo(0, 26);
        ctx.bezierCurveTo(0, 7, 7, 0, 26, 0);
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(8, 8, 4, 9, -Math.PI / 4, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
      const center = bounds.width / 2;
      ctx.beginPath();
      ctx.moveTo(center - 4, 35);
      ctx.lineTo(center, 30);
      ctx.lineTo(center + 4, 35);
      ctx.lineTo(center, 40);
      ctx.closePath();
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.textAlign = "center";
      ctx.font = `italic 26px ${token("--font-serif")}`;
      ctx.fillText(scratchTitle, bounds.width / 2, bounds.height / 2 - 4);
      ctx.font = `500 11px ${token("--font-sans")}`;
      ctx.fillText(scratchHint, bounds.width / 2, bounds.height / 2 + 25);
    };
    texture.onload = () => {
      if (!disposed && !scratched.current) {
        oldWidth = 0;
        draw();
      }
    };
    // A theme without a grain paints the foil as a flat gradient instead.
    if (paperTexture) texture.src = paperTexture;
    document.fonts.ready.then(() => {
      if (!disposed && !scratched.current) {
        oldWidth = 0;
        draw();
      }
    });
    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(element);
    return () => {
      disposed = true;
      observer.disconnect();
    };
  }, [revealed, paperTexture, scratchTitle, scratchHint]);

  function scratch(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!dragging.current) return;
    const element = event.currentTarget;
    const ctx = element.getContext("2d");
    if (!ctx) return;
    scratched.current = true;
    const box = element.getBoundingClientRect();
    const sx = element.width / box.width;
    const sy = element.height / box.height;
    const point = {
      x: (event.clientX - box.left) * sx,
      y: (event.clientY - box.top) * sy,
    };
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineWidth = 44 * sx;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(last.current?.x ?? point.x, last.current?.y ?? point.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(point.x, point.y, 22 * sx, 0, Math.PI * 2);
    ctx.fill();
    last.current = point;
    const pixels = ctx.getImageData(0, 0, element.width, element.height).data;
    let clear = 0,
      total = 0;
    for (let i = 3; i < pixels.length; i += 64) {
      total++;
      if ((pixels[i] ?? 255) < 30) clear++;
    }
    if (clear / total > scratchThreshold) {
      dragging.current = false;
      last.current = null;
      reveal();
    }
  }

  function finish() {
    dragging.current = false;
    last.current = null;
  }

  return (
    <div className={`date-reveal ${revealed ? "date-revealed" : ""}`}>
      <div className="date-scratch">
        <div className="revealed-date" aria-hidden={!revealed}>
          <h2>{event.dateText}</h2>
          <p>{event.dayText}</p>
          <h3>{event.timeText}</h3>
        </div>
        {!revealed && (
          <canvas
            ref={canvas}
            tabIndex={0}
            role="button"
            aria-label="Scratch to reveal the date and time"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                reveal();
              }
            }}
            onPointerDown={(e) => {
              dragging.current = true;
              e.currentTarget.setPointerCapture(e.pointerId);
              scratch(e);
            }}
            onPointerMove={scratch}
            onPointerUp={finish}
            onPointerCancel={finish}
          />
        )}
      </div>
    </div>
  );
}
