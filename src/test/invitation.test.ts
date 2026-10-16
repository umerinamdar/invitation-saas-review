import { describe, expect, it } from 'vitest';
import { EVENT_TIME, VENUE_URL, ENVELOPE_OPEN_MS, INTRO_SECONDS, remainingTime, TOGETHER_SINCE, togetherDays, togetherDuration, togetherElapsed, MUSIC_FADE_MS, musicFadeVolume } from '@/lib/invitation';
describe('Engagement details', () => {
  it('fades the music in slowly with a smooth quiet entrance', () => {
    expect(MUSIC_FADE_MS).toBe(8000);
    expect(musicFadeVolume(0)).toBe(0);
    expect(musicFadeVolume(2000)).toBeCloseTo(0.09375);
    expect(musicFadeVolume(4000)).toBeCloseTo(0.3);
    expect(musicFadeVolume(8000)).toBe(0.6);
    expect(musicFadeVolume(9000)).toBe(0.6);
  });
  it('counts elapsed days, hours and minutes from the supplied date start', () => {
    expect(togetherElapsed(Date.parse('2024-08-12T03:42:59+05:30'))).toEqual([1, 3, 42]);
    expect(togetherElapsed(Date.parse('2024-08-12T00:00:00+05:30'))).toEqual([1, 0, 0]);
    expect(togetherElapsed(Date.parse('2024-08-10T00:00:00+05:30'))).toEqual([0, 0, 0]);
  });
  it('shows completed calendar years, months and remaining days since 11 August 2024', () => {
    expect(togetherDuration(Date.parse('2026-10-15T20:57:00Z'))).toEqual([2, 2, 5]);
    expect(togetherDuration(Date.parse('2026-10-15T00:00:00+05:30'))).toEqual([2, 2, 4]);
    expect(togetherDuration(Date.parse('2026-08-11T00:00:00+05:30'))).toEqual([2, 0, 0]);
    expect(togetherDuration(Date.parse('2026-10-10T23:59:59+05:30'))).toEqual([2, 1, 29]);
    expect(togetherDuration(Date.parse('2026-10-11T00:00:00+05:30'))).toEqual([2, 2, 0]);
    expect(togetherDuration(Date.parse('2024-08-10T00:00:00+05:30'))).toEqual([0, 0, 0]);
  });
  it('counts days together from 11 August 2024 in the invitation timezone', () => {
    expect(TOGETHER_SINCE).toBe('2024-08-11T00:00:00+05:30');
    expect(togetherDays(Date.parse('2024-08-11T23:59:59+05:30'))).toBe(0);
    expect(togetherDays(Date.parse('2024-08-12T00:00:00+05:30'))).toBe(1);
    expect(togetherDays(Date.parse('2026-10-15T00:00:00+05:30'))).toBe(795);
    expect(togetherDays(Date.parse('2024-08-10T00:00:00+05:30'))).toBe(0);
  });
  it('opens the envelope smoothly within the requested 1–1.5 seconds', () => {
    expect(ENVELOPE_OPEN_MS).toBe(1400);
    expect(ENVELOPE_OPEN_MS).toBeGreaterThanOrEqual(1000);
    expect(ENVELOPE_OPEN_MS).toBeLessThanOrEqual(1500);
  });
  it('uses an introduction shorter than the previous 24 seconds', () => {
    expect(INTRO_SECONDS).toBe(6);
    expect(INTRO_SECONDS).toBeLessThan(24);
  });
  it('counts down to November 22 2026 at 7 PM India time', () => {
    expect(EVENT_TIME).toBe('2026-11-22T19:00:00+05:30');
    expect(remainingTime(Date.parse('2026-11-21T19:00:00+05:30'))).toEqual([1, 0, 0, 0]);
  });
  it('stops the countdown at the ceremony', () => {
    expect(remainingTime(Date.parse('2026-11-23T19:00:00+05:30'))).toEqual([0, 0, 0, 0]);
  });
  it('uses the supplied venue destination', () => {
    expect(VENUE_URL).toBe('https://maps.app.goo.gl/ZvBLCsdqbGWogDo98');
  });
});