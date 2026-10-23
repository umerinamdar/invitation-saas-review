// Locks CODE-HEALTH finding TYPE-1: src/routes/index.tsx builds
// translation keys by string interpolation and casts them `as any`
// (10 sites), so tsc cannot check them. t() falls back to rendering
// the raw key string when a key is missing from the English
// dictionary (locale-context.tsx: `dictionary[key] ?? key`).
//
// Verified by hand on 2026-10-23: every REACHABLE constructed key
// exists in the English dictionary today. The 14 compare.row.*.paper /
// .digital keys for the boolean rows (animation, music, countdown,
// editable, maps, guests, whatsapp) do NOT exist — and are never
// requested, because those rows render <Check/>/<X/> icons instead.
// This test encodes exactly that contract so a future row/stem edit
// fails loudly instead of shipping a raw key to the landing page.
//
// NOTE: the route does not export STEP_KEYS / COMPARE_ROW_KEYS /
// COMPARE_BOOL_ROWS, so they are re-declared here by copy — the test
// pins the DICTIONARY side of the contract (every key the page can
// request must exist); exporting the arrays from the route remains a
// follow-up so the two lists cannot drift.

import { describe, expect, it } from "vitest";
import { getDictionary } from "@/i18n/translations";
// import { STEP_KEYS, COMPARE_ROW_KEYS, COMPARE_BOOL_ROWS } from "@/routes/index";

const STEP_KEYS = ["steps.1", "steps.2", "steps.3"] as const;
const COMPARE_ROW_KEYS = [
  "cost", "delivery", "animation", "music", "countdown",
  "editable", "maps", "guests", "whatsapp",
] as const;
const COMPARE_BOOL_ROWS = new Set([
  "animation", "music", "countdown", "editable", "maps", "guests", "whatsapp",
]);

describe("landing page constructed translation keys (draft)", () => {
  const en = getDictionary("en") as unknown as Record<string, string>;

  it("every step key the page requests exists", () => {
    for (const stem of STEP_KEYS) {
      expect(en[`${stem}.title`], `${stem}.title`).toBeTruthy();
      expect(en[`${stem}.body`], `${stem}.body`).toBeTruthy();
    }
  });

  it("every compare-row key the page actually requests exists", () => {
    for (const row of COMPARE_ROW_KEYS) {
      expect(en[`compare.row.${row}.feature`], row).toBeTruthy();
      if (COMPARE_BOOL_ROWS.has(row)) continue; // icons, never t()
      expect(en[`compare.row.${row}.paper`], row).toBeTruthy();
      expect(en[`compare.row.${row}.digital`], row).toBeTruthy();
    }
  });

  it("included.* and faq.* ranges match the dictionary", () => {
    for (let i = 0; i < 6; i++) expect(en[`included.${i}`]).toBeTruthy();
    for (let i = 0; i < 11; i++) {
      expect(en[`faq.q${i}`]).toBeTruthy();
      expect(en[`faq.a${i}`]).toBeTruthy();
    }
  });
});
