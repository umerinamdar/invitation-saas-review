import { describe, expect, it } from "vitest";
import { openSync, readSync, closeSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

// Asset sanity guard for public/ (MUSE_TASKS_2026-10-23).
//
// Production incident behind this test: public/themes/dubai-silk/skyline.jpg
// was PNG data saved with a .jpg extension — 2 MB instead of a few hundred
// KB — which blew the 12 s preview-art-load deadline in
// src/components/invitation.tsx for real visitors. The file is fixed; this
// guard stops the class of bug from recurring.
//
// Two rules, both cheap (stat + a few header bytes per file, no decoding,
// no network):
//   1. Format/extension match, everywhere under public/: a .jpg/.jpeg
//      file must really be JPEG and a .png file must really be PNG,
//      sniffed from magic bytes.
//   2. Size budget, scoped to public/themes/**: images at or under
//      600 KB, .mp3 audio at or under 2 MB. A file that legitimately
//      needs more goes in SIZE_ALLOWLIST by exact path with a reason —
//      do not loosen the ceilings instead.

const REPO_ROOT = path.resolve(__dirname, "..", "..");
const PUBLIC_DIR = path.join(REPO_ROOT, "public");
const THEMES_DIR = path.join(PUBLIC_DIR, "themes");

const IMAGE_SIZE_LIMIT = 600 * 1024; // 600 KB
const AUDIO_SIZE_LIMIT = 2 * 1024 * 1024; // 2 MB

// Exact repo-relative paths exempt from the size budget, each with its
// reason. Empty today: every themes image/audio file fits the budget.
const SIZE_ALLOWLIST: Record<string, string> = {
  // "public/themes/<theme>/<file>": "why this file legitimately exceeds the budget",
};

const JPEG_MAGIC = [0xff, 0xd8, 0xff];
const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.isFile()) out.push(full);
  }
  return out;
}

function readHeader(file: string, bytes: number): Buffer {
  const fd = openSync(file, "r");
  try {
    const buf = Buffer.alloc(bytes);
    const read = readSync(fd, buf, 0, bytes, 0);
    return buf.subarray(0, read);
  } finally {
    closeSync(fd);
  }
}

function hasMagic(header: Buffer, magic: number[]): boolean {
  return magic.every((byte, i) => header[i] === byte);
}

function rel(file: string): string {
  return path.relative(REPO_ROOT, file).split(path.sep).join("/");
}

const allFiles = walk(PUBLIC_DIR);
const imageFiles = allFiles.filter((f) => /\.(jpe?g|png)$/i.test(f));
const themeFiles = allFiles.filter((f) => f.startsWith(THEMES_DIR));

describe("public/ asset guard", () => {
  it("finds the assets it is meant to guard (no silent empty walk)", () => {
    expect(imageFiles.length).toBeGreaterThan(0);
    expect(themeFiles.some((f) => /\.(jpe?g|png)$/i.test(f))).toBe(true);
    expect(themeFiles.some((f) => /\.mp3$/i.test(f))).toBe(true);
  });

  it("every .jpg/.jpeg under public/ is really JPEG, every .png really PNG", () => {
    const violations: string[] = [];
    for (const file of imageFiles) {
      const header = readHeader(file, PNG_MAGIC.length);
      if (/\.png$/i.test(file)) {
        if (!hasMagic(header, PNG_MAGIC)) violations.push(rel(file));
      } else if (!hasMagic(header, JPEG_MAGIC)) {
        violations.push(rel(file));
      }
    }
    expect(
      violations,
      `format/extension mismatch (content is not what the extension claims): ${violations.join(", ")}`,
    ).toEqual([]);
  });

  it("themes images stay within the 600 KB budget", () => {
    const violations: string[] = [];
    for (const file of themeFiles) {
      if (!/\.(jpe?g|png)$/i.test(file)) continue;
      if (rel(file) in SIZE_ALLOWLIST) continue;
      const size = statSync(file).size;
      if (size > IMAGE_SIZE_LIMIT) {
        violations.push(`${rel(file)} (${size} bytes)`);
      }
    }
    expect(
      violations,
      `themes image(s) over ${IMAGE_SIZE_LIMIT} bytes: ${violations.join(", ")}`,
    ).toEqual([]);
  });

  it("themes audio stays within the 2 MB budget", () => {
    const violations: string[] = [];
    for (const file of themeFiles) {
      if (!/\.mp3$/i.test(file)) continue;
      if (rel(file) in SIZE_ALLOWLIST) continue;
      const size = statSync(file).size;
      if (size > AUDIO_SIZE_LIMIT) {
        violations.push(`${rel(file)} (${size} bytes)`);
      }
    }
    expect(
      violations,
      `themes audio over ${AUDIO_SIZE_LIMIT} bytes: ${violations.join(", ")}`,
    ).toEqual([]);
  });
});
