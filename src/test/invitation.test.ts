import { describe, expect, it } from "vitest";
import {
  eventDayRelation,
  hasValidTogetherDate,
  musicFadeVolume,
  offsetMinutes,
  remainingTime,
  togetherDays,
  togetherDuration,
  togetherElapsed,
} from "@/lib/invitation";
import { dubaiSilk } from "@/themes/dubai-silk";
import { umerMaimoona } from "@/invites/umer-maimoona";

const EVENT_TIME = umerMaimoona.event.startIso;
const TOGETHER_SINCE = umerMaimoona.story!.togetherSinceIso!;
const { musicFadeMs, maxVolume, openMs, introSeconds } = dubaiSilk.motion;
const fade = (ms: number) => musicFadeVolume(ms, musicFadeMs, maxVolume);

describe("Engagement details", () => {
  it("fades the music in slowly with a smooth quiet entrance", () => {
    expect(musicFadeMs).toBe(8000);
    expect(fade(0)).toBe(0);
    expect(fade(2000)).toBeCloseTo(0.09375);
    expect(fade(4000)).toBeCloseTo(0.3);
    expect(fade(8000)).toBe(0.6);
    expect(fade(9000)).toBe(0.6);
  });
  it("counts elapsed days, hours and minutes from the supplied date start", () => {
    expect(
      togetherElapsed(Date.parse("2024-08-12T03:42:59+05:30"), TOGETHER_SINCE),
    ).toEqual([1, 3, 42]);
    expect(
      togetherElapsed(Date.parse("2024-08-12T00:00:00+05:30"), TOGETHER_SINCE),
    ).toEqual([1, 0, 0]);
    expect(
      togetherElapsed(Date.parse("2024-08-10T00:00:00+05:30"), TOGETHER_SINCE),
    ).toEqual([0, 0, 0]);
  });
  it("shows completed calendar years, months and remaining days since 11 August 2024", () => {
    expect(
      togetherDuration(Date.parse("2026-10-15T20:57:00Z"), TOGETHER_SINCE),
    ).toEqual([2, 2, 5]);
    expect(
      togetherDuration(Date.parse("2026-10-15T00:00:00+05:30"), TOGETHER_SINCE),
    ).toEqual([2, 2, 4]);
    expect(
      togetherDuration(Date.parse("2026-08-11T00:00:00+05:30"), TOGETHER_SINCE),
    ).toEqual([2, 0, 0]);
    expect(
      togetherDuration(Date.parse("2026-10-10T23:59:59+05:30"), TOGETHER_SINCE),
    ).toEqual([2, 1, 29]);
    expect(
      togetherDuration(Date.parse("2026-10-11T00:00:00+05:30"), TOGETHER_SINCE),
    ).toEqual([2, 2, 0]);
    expect(
      togetherDuration(Date.parse("2024-08-10T00:00:00+05:30"), TOGETHER_SINCE),
    ).toEqual([0, 0, 0]);
  });
  it("counts days together from 11 August 2024 in the invitation timezone", () => {
    expect(TOGETHER_SINCE).toBe("2024-08-11T00:00:00+05:30");
    expect(
      togetherDays(Date.parse("2024-08-11T23:59:59+05:30"), TOGETHER_SINCE),
    ).toBe(0);
    expect(
      togetherDays(Date.parse("2024-08-12T00:00:00+05:30"), TOGETHER_SINCE),
    ).toBe(1);
    expect(
      togetherDays(Date.parse("2026-10-15T00:00:00+05:30"), TOGETHER_SINCE),
    ).toBe(795);
    expect(
      togetherDays(Date.parse("2024-08-10T00:00:00+05:30"), TOGETHER_SINCE),
    ).toBe(0);
  });
  it("never returns NaN story counters for an unparseable together-since date", () => {
    const now = Date.parse("2026-10-15T00:00:00+05:30");
    expect(togetherDays(now, "not-a-date")).toBe(0);
    expect(togetherDays(now, "")).toBe(0);
    expect(togetherElapsed(now, "not-a-date")).toEqual([0, 0, 0]);
    expect(togetherDuration(now, "not-a-date")).toEqual([0, 0, 0]);
  });
  it("does not treat an unparseable together-since date as a story start", () => {
    expect(hasValidTogetherDate("not-a-date")).toBe(false);
    expect(hasValidTogetherDate("")).toBe(false);
    expect(hasValidTogetherDate(undefined)).toBe(false);
    expect(hasValidTogetherDate(null)).toBe(false);
    expect(hasValidTogetherDate("2024-13-40")).toBe(false);
    expect(hasValidTogetherDate("2024-08-11")).toBe(true);
    expect(hasValidTogetherDate("2024-08-11T00:00:00+05:30")).toBe(true);
  });
  it("opens the envelope smoothly within the requested 1–1.5 seconds", () => {
    expect(openMs).toBe(1400);
    expect(openMs).toBeGreaterThanOrEqual(1000);
    expect(openMs).toBeLessThanOrEqual(1500);
  });
  it("uses an introduction shorter than the previous 24 seconds", () => {
    expect(introSeconds).toBe(6);
    expect(introSeconds).toBeLessThan(24);
  });
  it("counts down to November 22 2026 at 7 PM India time", () => {
    expect(EVENT_TIME).toBe("2026-11-22T19:00:00+05:30");
    expect(
      remainingTime(Date.parse("2026-11-21T19:00:00+05:30"), EVENT_TIME),
    ).toEqual([1, 0, 0, 0]);
  });
  it("stops the countdown at the ceremony", () => {
    expect(
      remainingTime(Date.parse("2026-11-23T19:00:00+05:30"), EVENT_TIME),
    ).toEqual([0, 0, 0, 0]);
  });
  it("uses the supplied venue destination", () => {
    expect(umerMaimoona.event.venueMapsUrl).toBe(
      "https://maps.app.goo.gl/ZvBLCsdqbGWogDo98",
    );
  });
});

describe("Countdown day edges", () => {
  const EVENT = "2026-11-22T19:00:00+05:30";
  it("relates today to the event day in the event's own timezone", () => {
    expect(
      eventDayRelation(Date.parse("2026-11-21T23:00:00+05:30"), EVENT),
    ).toBe("upcoming");
    expect(
      eventDayRelation(Date.parse("2026-11-22T09:00:00+05:30"), EVENT),
    ).toBe("today");
    expect(
      eventDayRelation(Date.parse("2026-11-22T23:59:59+05:30"), EVENT),
    ).toBe("today");
    expect(
      eventDayRelation(Date.parse("2026-11-23T00:00:00+05:30"), EVENT),
    ).toBe("past");
    expect(
      eventDayRelation(Date.parse("2026-11-25T12:00:00+05:30"), EVENT),
    ).toBe("past");
    expect(eventDayRelation(Date.parse("2026-11-22T00:00:00+05:30"), "")).toBe(
      "invalid",
    );
    expect(
      eventDayRelation(Date.parse("2026-11-22T00:00:00+05:30"), "not-a-date"),
    ).toBe("invalid");
  });
  it("counts down within the event day without going negative or NaN", () => {
    // Two hours before a 7 PM ceremony on the day itself: 0 days, live clock.
    expect(
      remainingTime(Date.parse("2026-11-22T17:00:00+05:30"), EVENT),
    ).toEqual([0, 2, 0, 0]);
    // After the ceremony the tally rests at zero — never negative, never NaN.
    expect(
      remainingTime(Date.parse("2026-11-22T21:00:00+05:30"), EVENT),
    ).toEqual([0, 0, 0, 0]);
    expect(
      remainingTime(Date.parse("2026-12-22T19:00:00+05:30"), EVENT),
    ).toEqual([0, 0, 0, 0]);
  });
  it("treats a bare event date as an Indian calendar date, not UTC midnight", () => {
    // 7 PM IST on 11 Feb 2027: the 12th begins in five hours,
    // not the ten and a half a UTC-midnight reading would claim.
    expect(
      remainingTime(Date.parse("2027-02-11T19:00:00+05:30"), "2027-02-12"),
    ).toEqual([0, 5, 0, 0]);
    // A full day earlier the tally reads one day and five hours.
    expect(
      remainingTime(Date.parse("2027-02-10T19:00:00+05:30"), "2027-02-12"),
    ).toEqual([1, 5, 0, 0]);
    expect(
      eventDayRelation(Date.parse("2027-02-11T19:00:00+05:30"), "2027-02-12"),
    ).toBe("upcoming");
    // Half past midnight IST on the 12th is already the day itself,
    // where a UTC reading would still call it the 11th.
    expect(
      eventDayRelation(Date.parse("2027-02-12T00:30:00+05:30"), "2027-02-12"),
    ).toBe("today");
    expect(
      eventDayRelation(Date.parse("2027-02-13T00:30:00+05:30"), "2027-02-12"),
    ).toBe("past");
  });
});

describe("Together-date sanity", () => {
  const NOW = Date.parse("2026-10-21T12:00:00+05:30");
  it("does not treat a future together-since date as a story start", () => {
    // A typo'd year is the usual cause; the counters would fabricate a story.
    expect(hasValidTogetherDate("2999-01-01", NOW)).toBe(false);
    expect(hasValidTogetherDate("2027-08-11T00:00:00+05:30", NOW)).toBe(false);
    // Tomorrow in India is still the future, even as a bare date.
    expect(hasValidTogetherDate("2026-10-22", NOW)).toBe(false);
    // Today and the past are real starts and stay valid.
    expect(hasValidTogetherDate("2026-10-21", NOW)).toBe(true);
    expect(hasValidTogetherDate("2024-08-11", NOW)).toBe(true);
  });
  it("counts calendar days together across leap day and month boundaries", () => {
    // 2028 is a leap year: 28 Feb → 1 Mar spans the 29th, so two days.
    expect(
      togetherDays(
        Date.parse("2028-03-01T00:00:00+05:30"),
        "2028-02-28T00:00:00+05:30",
      ),
    ).toBe(2);
    expect(
      togetherDays(
        Date.parse("2028-03-01T00:00:00+05:30"),
        "2028-02-29T00:00:00+05:30",
      ),
    ).toBe(1);
    // Month boundary: 31 Jan → 1 Feb is a single calendar day.
    expect(
      togetherDays(
        Date.parse("2027-02-01T00:00:00+05:30"),
        "2027-01-31T00:00:00+05:30",
      ),
    ).toBe(1);
  });
  it("does not shift a bare together date by a day for Indian readers", () => {
    // Half past midnight IST on 12 Aug 2024: one calendar day since 11 Aug,
    // where a UTC-midnight reading of the bare date would still say zero.
    expect(
      togetherDays(Date.parse("2024-08-12T00:30:00+05:30"), "2024-08-11"),
    ).toBe(1);
    expect(
      togetherDays(Date.parse("2024-08-11T23:59:59+05:30"), "2024-08-11"),
    ).toBe(0);
    // The calendar duration agrees: the bare date is an Indian calendar date.
    expect(
      togetherDuration(Date.parse("2026-10-15T00:30:00+05:30"), "2024-08-11"),
    ).toEqual([2, 2, 4]);
    // The running tally starts at Indian midnight too, not UTC midnight.
    expect(
      togetherElapsed(Date.parse("2024-08-12T00:30:00+05:30"), "2024-08-11"),
    ).toEqual([1, 0, 30]);
  });
});

describe("Theme portability", () => {
  it("anchors milestones to the offset written into the host’s own timestamp", () => {
    expect(offsetMinutes("2026-11-22T19:00:00+05:30")).toBe(330);
    expect(offsetMinutes("2026-11-22T19:00:00+04:00")).toBe(240);
    expect(offsetMinutes("2026-11-22T19:00:00-05:00")).toBe(-300);
    expect(offsetMinutes("2026-11-22T19:00:00Z")).toBe(0);
  });
  it("counts the same calendar months for a Dubai host as an Indian one", () => {
    const dubai = "2024-08-11T00:00:00+04:00";
    expect(
      togetherDuration(Date.parse("2026-10-15T00:00:00+04:00"), dubai),
    ).toEqual([2, 2, 4]);
  });
  it("keeps a month-end start date inside its own month", () => {
    const since = "2024-01-31T00:00:00+05:30";
    // 29 Feb 2024 is one complete month minus two days, not a spill into March.
    expect(
      togetherDuration(Date.parse("2024-02-29T00:00:00+05:30"), since),
    ).toEqual([0, 0, 29]);
    expect(
      togetherDuration(Date.parse("2024-03-31T00:00:00+05:30"), since),
    ).toEqual([0, 2, 0]);
  });
  it("lets a theme drive the fade without touching the engine", () => {
    expect(musicFadeVolume(2000, 4000, 1)).toBeCloseTo(0.5);
    expect(musicFadeVolume(4000, 4000, 1)).toBe(1);
  });
});
