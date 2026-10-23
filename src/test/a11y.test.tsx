/**
 * Task 15 (WCAG 2.1 AA static audit).
 * Three kinds of checks:
 *  1. Contrast invariants computed from the REAL theme palettes and
 *     the REAL stylesheet (the pairs styles.css actually paints).
 *     Ratios were computed independently during the audit (OKLCH/hex
 *     → linear sRGB → WCAG luminance); the numbers in the comments
 *     are the audit's, the tests recompute them from source.
 *  2. Heading-structure source checks in the style of
 *     content-honesty.test.ts.
 *  3. A rendered heading-order check for the guest invitation.
 * The defect tests were reproduced against the pre-fix code.
 * Not pinned here: muted-foreground contrast on 6 themes — the AA
 * numbers are in the overnight report; darkening brand tokens is a
 * design decision for the owner, not a mechanical fix.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Vitest here does not give import.meta.url a file:// URL, so source
// files are read relative to the repo root the suite runs from.
const readSrc = (relFromTestDir: string) =>
  readFileSync(resolve(process.cwd(), "src/test", relFromTestDir), "utf8");
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { themes } from "@/themes";
import type { Theme } from "@/themes";

/* ---------- colour math (WCAG 2.1 relative luminance) ---------- */

function oklchToLin(L: number, C: number, H: number): [number, number, number] {
  const h = (H * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);
  const l = L + 0.3963377774 * a + 0.2158037573 * b;
  const m = L - 0.1055613458 * a - 0.0638541728 * b;
  const s = L - 0.0894841775 * a - 1.291485548 * b;
  const L3 = l ** 3, M3 = m ** 3, S3 = s ** 3;
  return [
    4.0767416621 * L3 - 3.3077115913 * M3 + 0.2309699292 * S3,
    -1.2684380046 * L3 + 2.6097574011 * M3 - 0.3413193965 * S3,
    -0.0041960863 * L3 - 0.7034186147 * M3 + 1.707614701 * S3,
  ];
}

function hexToLin(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  const f = (v: number) => {
    const s = v / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return [f((n >> 16) & 255), f((n >> 8) & 255), f(n & 255)];
}

function toLin(value: string): [number, number, number] {
  const ok = /^oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\)$/.exec(value.trim());
  if (ok) {
    const [, l, c, h] = ok;
    return oklchToLin(Number(l), Number(c), Number(h));
  }
  return hexToLin(value.trim());
}

function contrast(a: string, b: string): number {
  const lum = ([r, g, b]: [number, number, number]) =>
    0.2126 * Math.max(0, r) + 0.7152 * Math.max(0, g) + 0.0722 * Math.max(0, b);
  const l1 = lum(toLin(a));
  const l2 = lum(toLin(b));
  const [hi, lo] = l1 >= l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

/** The palette token a CSS custom property is fed from (themes/types.ts). */
const VAR_TO_TOKEN: Record<string, keyof Theme["palette"]> = {
  "--background": "background",
  "--invitation-surface": "surface",
  "--paper": "paper",
  "--paper-light": "paperLight",
};

function musicErrorBackgroundToken(): keyof Theme["palette"] {
  const css = readSrc("../styles.css");
  const block = /\.music-error\s*\{([^}]*)\}/.exec(css);
  if (!block) throw new Error(".music-error rule not found in styles.css");
  const bg = /background:\s*var\((--[\w-]+)\)/.exec(block[1]!);
  if (!bg) throw new Error(".music-error has no var() background");
  const token = VAR_TO_TOKEN[bg[1]!];
  if (!token) throw new Error(`unmapped music-error background ${bg[1]}`);
  return token;
}

describe("music error bubble contrast", () => {
  // .music-error paints background: var(--background) and inherits
  // color: var(--foreground) from .new-invitation, at 12px (normal
  // text → AA bar 4.5). On the seven themes whose foreground is a
  // dark ink and whose background is a dark surround (golden-temple
  // 1.27, kesari-mandap 1.08, sarayu-ghat 1.02, madina 1.25, makkah
  // 1.31, vesper-chapel 1.31, ram-mandir 1.09) the "Music couldn't
  // play" message is effectively invisible. The one-line fix —
  // background: var(--invitation-surface) — passes everywhere,
  // because foreground-on-surface is ≥ 4.5 in all 14 themes; this
  // test reads whichever token the rule uses, so it follows the fix.
  it("the token .music-error paints pairs with --foreground at AA in every theme", () => {
    const token = musicErrorBackgroundToken();
    for (const theme of themes) {
      const ratio = contrast(
        theme.palette.foreground,
        theme.palette[token],
      );
      expect(
        ratio,
        `${theme.id}: foreground on ${token} (music-error)`,
      ).toBeGreaterThanOrEqual(4.5);
    }
  });
});

describe("heading structure", () => {
  const read = (rel: string) => readSrc(rel);

  it("the dashboard's h1 describes the page, not the account email", () => {
    const src = read("../routes/dashboard.tsx");
    const h1 = /<h1>(.*?)<\/h1>/s.exec(src);
    expect(h1).not.toBeNull();
    expect(h1![1]).not.toContain("session.user.email"); // today: the email IS the h1
  });

  it("/create and /editor pages expose an h1", () => {
    // Neither route (nor the shared InviteEditor) renders any h1
    // today — the pages jump straight into fieldset legends.
    const create = read("../routes/create.tsx");
    const editorRoute = read("../routes/editor.$id.tsx");
    const editor = read("../components/editor/invite-editor.tsx");
    expect(/<h1[\s>]/.test(create + editor)).toBe(true);
    expect(/<h1[\s>]/.test(editorRoute + editor)).toBe(true);
  });

  it("templates theme cards use h2 under the page h1 (audit A-2)", () => {
    // The cards were <h3> directly under the /templates <h1>, skipping
    // a heading level for screen-reader navigation.
    const card = read("../components/site/theme-card.tsx");
    expect(card).toContain("<h2>{theme.name}</h2>");
    expect(card).not.toContain("<h3>{theme.name}</h3>");
  });
});

describe("form focus indicator (A11Y-8)", () => {
  // site.css removed the outline on auth/editor inputs and replaced it
  // with a 1px border-color shift only; selects were not covered.
  it("auth/editor inputs and selects get a real outline on focus", () => {
    const css = readSrc("../site.css");
    const rule = /[^{}]*\.auth-form input:focus[^{}]*\{([^}]*)\}/.exec(css);
    expect(rule).not.toBeNull();
    expect(rule![1]).toContain("outline: 2px solid");
    expect(rule![0]).toContain("select:focus");
  });
});

describe("file upload keyboard reachability (A11Y-9)", () => {
  // Both pickers nested <input type="file" hidden> inside a
  // non-focusable <label> — keyboard users could not reach Upload /
  // Replace / "Use my own song" at all.
  it("picker file inputs are visually hidden but focusable, never `hidden`", () => {
    for (const rel of [
      "../components/editor/photo-picker.tsx",
      "../components/editor/music-picker.tsx",
    ]) {
      const src = readSrc(rel);
      expect(src, rel).not.toMatch(/type="file"[^>]*\shidden/);
      expect(src, rel).toContain('className="sr-only"');
    }
  });

  it("the wrapping label shows a focus outline while its input is focused", () => {
    const css = readSrc("../site.css");
    expect(css).toContain("label:focus-within");
  });
});

describe("visually-hidden inputs keep sr-only geometry (audit A-1)", () => {
  // The unlayered .auth-form/.editor-form input rule set width:100% +
  // padding + border, overriding Tailwind's layered sr-only utility, so
  // the pickers' hidden file inputs laid out ~1280px wide and defeated
  // the pages' no-horizontal-scroll geometry (masked visually by
  // clip-path + overflow-x: clip). The form-field rule must not apply
  // to .sr-only inputs at all. (The :focus rule is deliberately out of
  // scope: it sets no geometry, and A11Y-9 gives the wrapping label the
  // visible focus outline.)
  it("the base form-input rule excludes .sr-only inputs", () => {
    const css = readSrc("../site.css");
    const rule = /[^{}]*\.editor-form input[^{}]*\{/.exec(css);
    expect(rule).not.toBeNull();
    expect(rule![0]).toContain(".editor-form input:not(.sr-only)");
    expect(rule![0]).toContain(".auth-form input:not(.sr-only)");
  });
});

/* ---------- rendered heading order in the guest invitation ---------- */

vi.mock("@/components/scratch-invitation", () => ({
  ScratchInvitation: () => null,
}));
vi.mock("@/components/cinematic-invite", () => ({
  CinematicInvite: () => null,
}));
vi.mock("@/components/confetti-burst", () => ({
  ConfettiBurst: () => null,
}));
vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: { getUser: async () => ({ data: { user: null } }) },
    from: () => ({
      insert: async () => ({ error: null }),
      select: () => ({ data: [], error: null }),
    }),
  },
}));

// jsdom's HTMLMediaElement.play() returns undefined, and the
// invitation's open handler calls .catch() on the result — stub media
// playback so the envelope flow can run under jsdom at all.
Object.defineProperty(window.HTMLMediaElement.prototype, "play", {
  configurable: true,
  value: vi.fn(async () => {}),
});
Object.defineProperty(window.HTMLMediaElement.prototype, "pause", {
  configurable: true,
  value: vi.fn(() => {}),
});

import { Invitation } from "@/components/invitation";
import { dubaiSilk } from "@/themes/dubai-silk";
import { umerMaimoona } from "@/invites/umer-maimoona";
import type { Invite } from "@/invites/types";

describe("guest invitation heading order", () => {
  // The sub-events section has no h2: its per-event <h3>s follow the
  // title section's <h1> directly (invitation.tsx, .sub-events),
  // skipping a level — while every sibling section (family, forever,
  // getting-there, RSVP) is headed by an h2. Draft note: if the
  // opening flow needs different driving in the real harness, open
  // the invitation the way preview.$themeId does; the assertion is
  // the deliverable.
  it("heading levels never skip", async () => {
    const invite: Invite = {
      ...umerMaimoona,
      subEvents: [
        {
          label: "Haldi",
          dateText: "Thursday, 11 February 2027",
          timeText: "9 in the morning",
        },
        {
          label: "Sangeet",
          dateText: "Thursday, 11 February 2027",
          timeText: "7 in the evening",
        },
      ],
    };
    render(
      <Invitation theme={dubaiSilk} invite={invite} mediaUrlMap={{}} />,
    );
    fireEvent.click(
      screen.getByLabelText(/open the invitation from/i),
    );
    await screen.findByRole("heading", { name: "Haldi" }, { timeout: 10000 });
    const headings = Array.from(
      document.querySelectorAll("h1, h2, h3, h4, h5, h6"),
    ).map((h) => Number(h.tagName[1]));
    for (let i = 1; i < headings.length; i++) {
      expect(
        headings[i]! - headings[i - 1]!,
        `heading sequence ${headings.join(",")}`,
      ).toBeLessThanOrEqual(1);
    }
  });
});
