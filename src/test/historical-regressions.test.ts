import { describe, expect, it } from "vitest";

import {
  PUBLISH_PRICE_INR,
  PUBLISH_PRICE_LABEL,
  PUBLISH_PRICE_PAISE,
} from "@/config/site";
import { hasValidEventDate, remainingTime } from "@/lib/invitation";
import { MEDIA_SIGNED_URL_TTL_SECONDS } from "@/lib/media-url";
import { themes } from "@/themes";

// Task 14 (overnight 2026-10-24) — direct pins for historical bugs whose
// existing coverage was indirect. Each describe names the original bug
// from the handoff (§B.1–§B.11) so a future regression points straight
// at the incident it re-opens. Handler-level pins that need the orders
// harness live in orders-auth.test.ts ("historical B.1 — ₹999 tier
// pricing at the API"); live-only items (0006 trigger execution, RLS
// enforcement) are deliberately NOT pinned here — see the overnight
// report's Task 14 table.

describe("historical B.1 — the ₹999 tier-pricing bug (2026-10-21 QA)", () => {
  it("the publish price is exactly ₹599, in rupees, paise and label", () => {
    expect(PUBLISH_PRICE_INR).toBe(599);
    expect(PUBLISH_PRICE_PAISE).toBe(59900);
    expect(PUBLISH_PRICE_LABEL).toBe("₹599");
  });

  it("every active theme's tier is valid, and price is not derived from either", () => {
    // The original defect: 'royal' themes charged ₹999 while 'classic'
    // charged ₹599. The price constant above is the ONLY price, for
    // every theme, regardless of which tier(s) are active. Catalog
    // reset (2026-10-25): only Dubai Silk (royal) is registered while
    // every other theme is reworked one at a time — see
    // docs/ops/OPENING-STUDY-ivory-silk-pearls.md — so this no longer
    // asserts both tiers are simultaneously present, only that every
    // theme that IS active has a valid tier and no price of its own.
    expect(themes.length).toBeGreaterThanOrEqual(1);
    for (const theme of themes) {
      expect(theme.tier === "royal" || theme.tier === "classic").toBe(true);
      // No theme carries its own price — a per-theme price field is how
      // the ₹999 bug was expressed.
      expect(theme).not.toHaveProperty("price");
      expect(theme).not.toHaveProperty("pricePaise");
      expect(theme).not.toHaveProperty("amountMinor");
    }
  });
});

describe("historical B.1 — the 'NaN' countdown on an undated draft", () => {
  const NOW = Date.parse("2026-10-24T12:00:00.000Z");

  it("an empty event date yields zeroes, never NaN, in every countdown field", () => {
    const parts = remainingTime(NOW, "");
    expect(parts).toEqual([0, 0, 0, 0]);
    for (const part of parts) expect(Number.isNaN(part)).toBe(false);
    expect(hasValidEventDate("")).toBe(false);
  });

  it("an unparseable event date also yields zeroes, never NaN", () => {
    const parts = remainingTime(NOW, "not-a-date");
    expect(parts).toEqual([0, 0, 0, 0]);
    for (const part of parts) expect(Number.isNaN(part)).toBe(false);
    expect(hasValidEventDate("not-a-date")).toBe(false);
  });
});

describe("historical B.4 — Gap-B guest signed URLs live for one hour", () => {
  it("the signed-URL TTL is exactly 3600 seconds (Round 2 Gap-B)", () => {
    // /i/$slug mints signed URLs server-side so guests can load media
    // from the private bucket (migration 0003). The lifetime was
    // specified as 1 hour; media-url.test.ts pins only a sane range
    // (10 min – 1 day), so the exact historical value is pinned here.
    expect(MEDIA_SIGNED_URL_TTL_SECONDS).toBe(3600);
  });
});
