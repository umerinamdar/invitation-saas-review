export const EVENT_TIME = '2026-11-22T19:00:00+05:30';
export const VENUE_URL = 'https://maps.app.goo.gl/ZvBLCsdqbGWogDo98';
export const ENVELOPE_OPEN_MS = 1400;
export const INTRO_SECONDS = 6;
export const MUSIC_FADE_MS = 8000;
export function musicFadeVolume(elapsedMs: number) {
  const progress = Math.max(0, Math.min(1, elapsedMs / MUSIC_FADE_MS));
  return 0.6 * progress * progress * (3 - 2 * progress);
}
// A date-only milestone, anchored to the invitation's timezone, not a guessed meeting hour.
export const TOGETHER_SINCE = '2024-08-11T00:00:00+05:30';
export function togetherDays(now: number) {
  return Math.max(0, Math.floor((now - Date.parse(TOGETHER_SINCE)) / 86400000));
}
export function togetherElapsed(now: number): [number, number, number] {
  const minutes = Math.max(0, Math.floor((now - Date.parse(TOGETHER_SINCE)) / 60000));
  return [Math.floor(minutes / 1440), Math.floor(minutes / 60) % 24, minutes % 60];
}
export function togetherDuration(now: number): [number, number, number] {
  if (now < Date.parse(TOGETHER_SINCE)) return [0, 0, 0];
  const local = new Date(now + 330 * 60000);
  const year = local.getUTCFullYear();
  const month = local.getUTCMonth();
  const day = local.getUTCDate();
  const completeMonths = (year - 2024) * 12 + month - 7 - (day < 11 ? 1 : 0);
  const anniversary = Date.UTC(2024, 7 + completeMonths, 11);
  const days = Math.floor((Date.UTC(year, month, day) - anniversary) / 86400000);
  return [Math.floor(completeMonths / 12), completeMonths % 12, days];
}
export function remainingTime(now: number) {
  const seconds = Math.max(0, Math.floor((Date.parse(EVENT_TIME) - now) / 1000));
  return [Math.floor(seconds / 86400), Math.floor(seconds / 3600) % 24, Math.floor(seconds / 60) % 60, seconds % 60];
}