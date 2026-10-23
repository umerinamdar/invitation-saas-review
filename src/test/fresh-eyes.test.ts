/**
 * Task 13 (fresh-eyes correctness).
 * Pure-function suite in the style of
 * src/test/invitation.test.ts. Every "desired" assertion below was
 * verified EMPIRICALLY against the current code before drafting
 * (invitation.ts transpiled standalone, run under node) — the tests
 * marked FAILS TODAY fail for the reason stated; the CHARACTERISATION
 * tests pass today and pin behaviour that must not be "fixed" away.
 */
import { describe, expect, it } from "vitest";
import {
  eventDayRelation,
  hasValidEventDate,
  musicFadeVolume,
  remainingTime,
  togetherDuration,
} from "@/lib/invitation";
import { buildShareLinks } from "@/lib/share";
import { makeSlug } from "@/lib/invites-api";
import type { Invite } from "@/invites/types";

const NOW = Date.parse("2026-01-01T00:00:00Z");

describe("impossible calendar dates (FAILS TODAY)", () => {
  // V8's Date.parse NORMALISES an out-of-range day-of-month instead of
  // rejecting it: "2027-02-30" parses as 2027-03-02, "2027-04-31" as
  // 2027-05-01. The module's date-only path (isoDateParts) validates
  // strictly, so a bare impossible date is "invalid" to
  // eventDayRelation — but hasValidEventDate, which only asks
  // Date.parse, calls the SAME string valid. The two gates disagree.
  it("hasValidEventDate rejects a date-only impossible date", () => {
    expect(hasValidEventDate("2027-02-30")).toBe(false); // today: true
    expect(hasValidEventDate("2027-04-31")).toBe(false); // today: true
    expect(hasValidEventDate("2027-13-01")).toBe(false); // already false
  });

  // A full ISO impossible date sails through BOTH gates and the
  // countdown silently targets the shifted day (Mar 2 / May 1).
  // Reachable via non-editor writers (the DB editor the codebase
  // already defends against — see safeExternalUrl's comment).
  it("a full-ISO impossible date is invalid, not a shifted real date", () => {
    expect(eventDayRelation(NOW, "2027-02-30T10:00:00+05:30")).toBe(
      "invalid",
    ); // today: "upcoming" (to Mar 2)
    expect(remainingTime(NOW, "2027-02-30T10:00:00+05:30")).toEqual([
      0, 0, 0, 0,
    ]); // today: counts down to Mar 2
    expect(hasValidEventDate("2027-04-31T10:00:00+05:30")).toBe(false);
  });
});

describe("offset-less datetimes honour the home anchor (FAILS TODAY)", () => {
  // The module's contract (and AGENTS.md): the countdown never reads
  // the guest's local clock. A datetime with NO offset suffix is the
  // one shape that breaks it — isoInstant falls back to Date.parse,
  // which reads the string in the BROWSER's timezone. Verified: the
  // same input yields [1,23,0,0] under America/New_York and
  // [1,12,30,0] under Asia/Kolkata. The editor always appends +05:30,
  // so this needs a non-editor writer — same reachability class as
  // the impossible-date finding. Desired: treat an offset-less
  // datetime like a bare date (anchor at the home offset, +05:30).
  it("an offset-less datetime counts down exactly like its +05:30 form", () => {
    const now = Date.parse("2027-02-11T00:00:00Z");
    expect(remainingTime(now, "2027-02-12T18:00:00")).toEqual(
      remainingTime(now, "2027-02-12T18:00:00+05:30"),
    );
    expect(eventDayRelation(now, "2027-02-12T18:00:00")).toBe(
      eventDayRelation(now, "2027-02-12T18:00:00+05:30"),
    );
  });
});

describe("musicFadeVolume degenerate fade (FAILS TODAY — latent)", () => {
  // fade(0, 0) is 0/0 = NaN; assigning NaN to player.volume throws in
  // browsers. Unreachable with shipped themes (all musicFadeMs 8000),
  // pinned so a future theme with musicFadeMs: 0 can't break the swell.
  it("a zero-length fade resolves to full volume, finitely", () => {
    const v = musicFadeVolume(0, 0, 0.6);
    expect(Number.isFinite(v)).toBe(true); // today: NaN
    expect(v).toBe(0.6);
  });
});

describe("CHARACTERISATION — verified correct, do not break", () => {
  // Empirically verified battery (node, 2026-10-23): 31st-of-month
  // clamping, leap-day starts, exact anniversaries all correct.
  it("togetherDuration handles month-end and leap edges", () => {
    const at = (s: string) => Date.parse(s);
    expect(
      togetherDuration(at("2023-04-30T12:00:00+05:30"), "2023-03-31"),
    ).toEqual([0, 0, 30]);
    expect(
      togetherDuration(at("2024-03-01T12:00:00+05:30"), "2024-01-31"),
    ).toEqual([0, 1, 1]);
    expect(
      togetherDuration(at("2025-03-01T12:00:00+05:30"), "2024-02-29"),
    ).toEqual([1, 0, 1]);
    expect(
      togetherDuration(at("2024-02-29T12:00:00+05:30"), "2023-10-31"),
    ).toEqual([0, 3, 29]);
    expect(
      togetherDuration(at("2026-06-15T12:00:00+05:30"), "2020-06-15"),
    ).toEqual([6, 0, 0]);
    expect(
      togetherDuration(at("2026-06-14T12:00:00+05:30"), "2020-06-15"),
    ).toEqual([5, 11, 30]);
  });

  it("a date-only event anchors its countdown to home-offset midnight", () => {
    // Feb 11 23:59 IST: one minute of Feb 11 remains before the day.
    expect(remainingTime(Date.parse("2027-02-11T18:29:00Z"), "2027-02-12"))
      .toEqual([0, 0, 1, 0]);
    // Feb 12 00:01 IST: the day has begun at the home offset.
    expect(remainingTime(Date.parse("2027-02-11T18:31:00Z"), "2027-02-12"))
      .toEqual([0, 0, 0, 0]);
  });

  it("share links round-trip names containing &, +, % and non-Latin text", () => {
    const invite = {
      slug: "asha-vikram-x1",
      hosts: { mode: "couple", person1: "A & B", person2: "C+D 100%" },
    } as Invite;
    const { whatsappUrl, publicUrl } = buildShareLinks(
      invite,
      "https://example.com",
    );
    expect(publicUrl).toBe("https://example.com/i/asha-vikram-x1");
    const text = new URL(whatsappUrl).searchParams.get("text")!;
    expect(text).toContain("A & B & C+D 100%");
    expect(text).toContain(publicUrl);
    const devanagari = {
      slug: "s",
      hosts: { mode: "couple", person1: "आशा", person2: "विक्रम" },
    } as Invite;
    const text2 = new URL(
      buildShareLinks(devanagari, "https://example.com").whatsappUrl,
    ).searchParams.get("text")!;
    expect(text2).toContain("आशा & विक्रम");
  });

  it("slugs transliterate Latin accents and fall back for non-Latin names", () => {
    expect(makeSlug("José", "María")).toMatch(/^jose-maria-[a-z0-9]+$/);
    // Non-Latin scripts produce the generic base — works, by design.
    expect(makeSlug("आशा", "विक्रम")).toMatch(/^invitation-[a-z0-9]+$/);
  });
});
