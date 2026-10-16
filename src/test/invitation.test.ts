import { describe, expect, it } from "vitest";
import {
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
