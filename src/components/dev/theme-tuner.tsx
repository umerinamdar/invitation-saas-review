import { useEffect, useRef, useState } from "react";

type Overrides = {
  namesColor: string;
  namesScale: number;
  familyColor: string;
  familyScale: number;
};

const ROWS: {
  key: "names" | "family";
  label: string;
  colorVar: string;
  scaleVar: string;
}[] = [
  {
    key: "names",
    label: "Names heading",
    colorVar: "--names-color",
    scaleVar: "--names-scale",
  },
  {
    key: "family",
    label: "Family lines",
    colorVar: "--family-color",
    scaleVar: "--family-scale",
  },
];

/**
 * Dev-only tool: open any /preview/:themeId with ?edit=seal and tune the
 * names heading and the parent/family lines (colour + size) live, then
 * copy the exact namesColor/namesScale/familyColor/familyScale fields to
 * paste into the theme file. Everything here reads and writes the SAME
 * CSS custom properties paletteVariables() emits (src/themes/types.ts) —
 * what you see while tuning is exactly what the CSS will do once the
 * numbers are in the theme. Never rendered outside `import.meta.env.DEV`
 * — dead code in a production build.
 *
 * The theme-provided wax seal was removed from the UI entirely (it had
 * no reliable position/size across differently-composed backdrop photos
 * and was expensive to keep tuning) — this tool no longer references it.
 */
export function ThemeTuner() {
  const [enabled] = useState(
    () =>
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("edit") === "seal",
  );
  const [ready, setReady] = useState(false);
  const [copied, setCopied] = useState(false);
  const rootRef = useRef<HTMLElement | null>(null);
  const valuesRef = useRef<Overrides>({
    namesColor: "#ffffff",
    namesScale: 1,
    familyColor: "#ffffff",
    familyScale: 1,
  });
  const [, forceRender] = useState(0);

  useEffect(() => {
    if (!enabled || !import.meta.env.DEV) return;

    const root = document.querySelector<HTMLElement>(".new-invitation");
    if (!root) return;
    rootRef.current = root;

    const cs = getComputedStyle(root);
    function readNum(name: string, fallback: number) {
      const v = cs.getPropertyValue(name).trim();
      const n = parseFloat(v);
      return Number.isFinite(n) ? n : fallback;
    }
    function readColor(name: string, el: HTMLElement | null) {
      const v = cs.getPropertyValue(name).trim();
      if (v) return rgbToHex(v) ?? "#ffffff";
      if (el) return rgbToHex(getComputedStyle(el).color) ?? "#ffffff";
      return "#ffffff";
    }

    valuesRef.current = {
      namesColor: readColor(
        "--names-color",
        document.querySelector<HTMLElement>(".invitation-names h1"),
      ),
      namesScale: readNum("--names-scale", 1),
      familyColor: readColor(
        "--family-color",
        document.querySelector<HTMLElement>(".family-block p"),
      ),
      familyScale: readNum("--family-scale", 1),
    };
    setReady(true);
    forceRender((n) => n + 1);
  }, [enabled]);

  if (!enabled || !import.meta.env.DEV || !ready) return null;

  const v = valuesRef.current;

  function setVar(name: string, value: string) {
    rootRef.current?.style.setProperty(name, value);
    setCopied(false);
    forceRender((n) => n + 1);
  }

  const code = [
    `namesColor: "${v.namesColor}",`,
    `namesScale: ${v.namesScale.toFixed(2)},`,
    `familyColor: "${v.familyColor}",`,
    `familyScale: ${v.familyScale.toFixed(2)},`,
  ].join("\n  ");

  return (
    <div
      style={{
        position: "fixed",
        bottom: 14,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 99999,
        background: "rgba(18, 16, 14, 0.94)",
        color: "#f5efe4",
        padding: "12px 16px",
        borderRadius: 14,
        fontFamily:
          "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
        fontSize: 12.5,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        boxShadow: "0 8px 28px rgba(0,0,0,0.45)",
        width: "min(92vw, 560px)",
      }}
    >
      {ROWS.map((row) => {
        const colorVal = row.key === "names" ? v.namesColor : v.familyColor;
        const scaleVal = row.key === "names" ? v.namesScale : v.familyScale;
        return (
          <div
            key={row.key}
            style={{ display: "flex", alignItems: "center", gap: 10 }}
          >
            <span style={{ width: 96 }}>{row.label}</span>
            <input
              type="color"
              value={colorVal}
              onChange={(e) => {
                setVar(row.colorVar, e.target.value);
                if (row.key === "names") v.namesColor = e.target.value;
                else v.familyColor = e.target.value;
              }}
              style={{
                width: 28,
                height: 24,
                padding: 0,
                border: "none",
                borderRadius: 4,
                background: "none",
                cursor: "pointer",
              }}
            />
            <input
              type="range"
              min={0.5}
              max={1.6}
              step={0.02}
              value={scaleVal}
              onChange={(e) => {
                const n = parseFloat(e.target.value);
                setVar(row.scaleVar, n.toFixed(2));
                if (row.key === "names") v.namesScale = n;
                else v.familyScale = n;
              }}
              style={{ flex: 1 }}
            />
            <span style={{ width: 36, textAlign: "right" }}>
              {scaleVal.toFixed(2)}x
            </span>
          </div>
        );
      })}

      <button
        type="button"
        onClick={() => {
          navigator.clipboard.writeText(code).catch(() => {});
          setCopied(true);
        }}
        style={{
          alignSelf: "flex-end",
          background: copied ? "#4a9c82" : "#fff",
          color: "#111",
          border: "none",
          borderRadius: 8,
          padding: "6px 14px",
          cursor: "pointer",
          fontFamily: "inherit",
          fontWeight: 600,
        }}
      >
        {copied ? "Copied!" : "Copy all code"}
      </button>
    </div>
  );
}

/** Best-effort rgb()/rgba() -> #hex for seeding a native colour input. */
function rgbToHex(input: string): string | null {
  const m = input.match(/rgba?\(([^)]+)\)/);
  if (!m?.[1]) return input.startsWith("#") ? input : null;
  const parts = m[1].split(",").map((s) => parseFloat(s.trim()));
  if (parts.length < 3 || parts.some((n) => Number.isNaN(n))) return null;
  const [r, g, b] = parts as [number, number, number];
  const toHex = (n: number) =>
    Math.max(0, Math.min(255, Math.round(n)))
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
