/**
 * Shared invitation module: pure time and audio maths for the invite engine.
 *
 * Every milestone is anchored to the offset written into the host's own ISO
 * timestamp, never to the guest's clock, so a guest abroad sees the same
 * countdown the couple does.
 */

/** Minutes east of UTC encoded in an ISO string's suffix; 0 for `Z`. */
export function offsetMinutes(iso: string): number {
  const match = /([+-])(\d{2}):(\d{2})$/.exec(iso);
  if (!match) return 0;
  const [, sign, hours, minutes] = match;
  return (sign === "-" ? -1 : 1) * (Number(hours) * 60 + Number(minutes));
}

/** Smoothstep swell so the entrance never jumps in volume. */
export function musicFadeVolume(
  elapsedMs: number,
  fadeMs: number,
  maxVolume: number,
) {
  const progress = Math.max(0, Math.min(1, elapsedMs / fadeMs));
  return maxVolume * progress * progress * (3 - 2 * progress);
}

/** Days, hours, minutes, seconds until the event; zeroes once it has started. */
export function remainingTime(now: number, eventIso: string) {
  const seconds = Math.max(0, Math.floor((Date.parse(eventIso) - now) / 1000));
  return [
    Math.floor(seconds / 86400),
    Math.floor(seconds / 3600) % 24,
    Math.floor(seconds / 60) % 60,
    seconds % 60,
  ];
}

/** Whole days since the milestone began. */
export function togetherDays(now: number, sinceIso: string) {
  return Math.max(0, Math.floor((now - Date.parse(sinceIso)) / 86400000));
}

/** Total days, hours and minutes elapsed — a running tally, not calendar units. */
export function togetherElapsed(
  now: number,
  sinceIso: string,
): [number, number, number] {
  const minutes = Math.max(0, Math.floor((now - Date.parse(sinceIso)) / 60000));
  return [
    Math.floor(minutes / 1440),
    Math.floor(minutes / 60) % 24,
    minutes % 60,
  ];
}

/** Completed calendar years, months and remaining days — no decimal-year approximations. */
export function togetherDuration(
  now: number,
  sinceIso: string,
): [number, number, number] {
  const since = Date.parse(sinceIso);
  if (now < since) return [0, 0, 0];

  const offset = offsetMinutes(sinceIso) * 60000;
  const local = new Date(now + offset);
  const start = new Date(since + offset);

  const year = local.getUTCFullYear();
  const month = local.getUTCMonth();
  const day = local.getUTCDate();
  const startYear = start.getUTCFullYear();
  const startMonth = start.getUTCMonth();
  const startDay = start.getUTCDate();

  const completeMonths =
    (year - startYear) * 12 + (month - startMonth) - (day < startDay ? 1 : 0);

  // A 31st anniversary date would otherwise spill into the next month.
  const anniversary = Math.min(
    Date.UTC(startYear, startMonth + completeMonths, startDay),
    Date.UTC(startYear, startMonth + completeMonths + 1, 0),
  );
  const days = Math.floor(
    (Date.UTC(year, month, day) - anniversary) / 86400000,
  );

  return [Math.floor(completeMonths / 12), completeMonths % 12, days];
}
