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

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const ISO_DATE_TIME =
  /^(\d{4})-(\d{2})-(\d{2})(?:[Tt ](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d+))?)?\s*(Z|[+-]\d{2}:?\d{2})?)?$/;

/** India — the audience's home timezone, for values that carry no offset. */
const HOME_OFFSET_MINUTES = 330;

type IsoDateTimeParts = {
  date: [number, number, number];
  time: [number, number, number, number];
  offset: number | null;
};

/**
 * Strictly parse the ISO shapes the invitation data uses. `Date.parse`
 * alone is not a validator here: it normalises an impossible day such as
 * 2027-02-30 into 2027-03-02 instead of rejecting it. A missing offset
 * is kept distinct (`offset: null`) so callers can anchor the value at
 * home instead of silently using the reader's local timezone.
 */
function isoDateTimeParts(iso: string): IsoDateTimeParts | null {
  const match = ISO_DATE_TIME.exec(iso);
  if (!match) return null;
  const [, yearText, monthText, dayText, hourText, minuteText, secondText, fractionText, zone] =
    match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const probe = new Date(Date.UTC(year, month - 1, day));
  if (
    probe.getUTCFullYear() !== year ||
    probe.getUTCMonth() !== month - 1 ||
    probe.getUTCDate() !== day
  ) {
    return null;
  }

  const hour = hourText === undefined ? 0 : Number(hourText);
  const minute = minuteText === undefined ? 0 : Number(minuteText);
  const second = secondText === undefined ? 0 : Number(secondText);
  const millisecond =
    fractionText === undefined
      ? 0
      : Number((fractionText + "000").slice(0, 3));
  if (hour > 23 || minute > 59 || second > 59) return null;

  let offset: number | null = null;
  if (zone === "Z") {
    offset = 0;
  } else if (zone) {
    const sign = zone.startsWith("-") ? -1 : 1;
    const digits = zone.slice(1).replace(":", "");
    const offsetHour = Number(digits.slice(0, 2));
    const offsetMinute = Number(digits.slice(2, 4));
    if (offsetHour > 23 || offsetMinute > 59) return null;
    offset = sign * (offsetHour * 60 + offsetMinute);
  }

  return {
    date: [year, month - 1, day],
    time: [hour, minute, second, millisecond],
    offset,
  };
}

/**
 * The offset a stored value's calendar dates are read in: its own suffix
 * when it carries one. A bare date (`2027-02-12`) or an offset-less
 * datetime carries none, and `Date.parse` would read those shapes using
 * UTC or the reader's local clock — neither is the home anchor — so
 * offset-less values are read at the home offset instead.
 */
function anchorOffsetMinutes(iso: string): number {
  if (DATE_ONLY.test(iso)) return HOME_OFFSET_MINUTES;
  const parsed = isoDateTimeParts(iso);
  if (parsed) return parsed.offset ?? HOME_OFFSET_MINUTES;
  return offsetMinutes(iso);
}

/**
 * The instant a stored value names; NaN when it names none. A bare date
 * names the start of that calendar day at home offset, not UTC midnight.
 */
function isoInstant(iso: string): number {
  if (DATE_ONLY.test(iso)) {
    const parts = isoDateParts(iso);
    if (!parts) return Number.NaN;
    return Date.UTC(parts[0], parts[1], parts[2]) - HOME_OFFSET_MINUTES * 60000;
  }
  const parsed = isoDateTimeParts(iso);
  if (parsed) {
    const [year, month, day] = parsed.date;
    const [hour, minute, second, millisecond] = parsed.time;
    return (
      Date.UTC(year, month, day, hour, minute, second, millisecond) -
      (parsed.offset ?? HOME_OFFSET_MINUTES) * 60000
    );
  }
  if (/^\d{4}-\d{2}-\d{2}(?:[Tt ]|$)/.test(iso)) return Number.NaN;
  return Date.parse(iso);
}

/** Calendar date parts of an instant, read at the given offset. */
function datePartsAt(
  epochMs: number,
  offsetMin: number,
): [number, number, number] {
  const date = new Date(epochMs + offsetMin * 60000);
  return [date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()];
}

/**
 * The calendar date a stored value names, in its own anchor zone; null
 * when it names none. A bare date names its literal date; an impossible
 * one (`2024-13-40`) names nothing, however date-shaped it looks.
 */
function isoDateParts(iso: string): [number, number, number] | null {
  if (DATE_ONLY.test(iso) || ISO_DATE_TIME.test(iso)) {
    return isoDateTimeParts(iso)?.date ?? null;
  }
  const parsed = Date.parse(iso);
  if (Number.isNaN(parsed)) return null;
  return datePartsAt(parsed, offsetMinutes(iso));
}

/** Whole calendar days from date `a` to date `b` (b − a); exact, no 24h drift. */
function calendarDayDiff(
  a: [number, number, number],
  b: [number, number, number],
): number {
  return Math.round(
    (Date.UTC(b[0], b[1], b[2]) - Date.UTC(a[0], a[1], a[2])) / 86400000,
  );
}

/** Smoothstep swell so the entrance never jumps in volume. */
export function musicFadeVolume(
  elapsedMs: number,
  fadeMs: number,
  maxVolume: number,
) {
  // A zero-length fade is already complete; dividing by it would make
  // the volume NaN, which browsers reject when assigned to a player.
  if (!Number.isFinite(fadeMs) || fadeMs <= 0) return maxVolume;
  const progress = Math.max(0, Math.min(1, elapsedMs / fadeMs));
  return maxVolume * progress * progress * (3 - 2 * progress);
}

/** True when a stored string is a date the countdown can count to. */
export function hasValidEventDate(eventIso: string): boolean {
  return Boolean(eventIso) && !Number.isNaN(isoInstant(eventIso));
}

/**
 * True when a stored together-since string is a date the story
 * counters can count from. Presence alone is not enough: the counters
 * zero-guard an unparseable value into a displayed "0 Years / 0 Months
 * / 0 Days", so the milestone block gates on this and hides instead.
 * A date that has not happened yet — a typo'd year is the usual cause —
 * is not a story start either: the counters would fabricate one.
 */
export function hasValidTogetherDate(
  sinceIso: string | undefined | null,
  now: number = Date.now(),
): sinceIso is string {
  if (!sinceIso) return false;
  const parts = isoDateParts(sinceIso);
  if (!parts) return false;
  const today = datePartsAt(now, anchorOffsetMinutes(sinceIso));
  return calendarDayDiff(parts, today) >= 0;
}

/**
 * Where today stands against the event's calendar day, in the event's
 * own timezone: before it ("upcoming"), on it ("today"), after it
 * ("past"), or no readable date at all ("invalid"). The guest page
 * counts down while the day is upcoming or today; once the day has
 * passed the countdown hides and the date itself stays on display.
 */
export function eventDayRelation(
  now: number,
  eventIso: string,
): "invalid" | "past" | "today" | "upcoming" {
  const parts = isoDateParts(eventIso);
  if (!parts) return "invalid";
  const today = datePartsAt(now, anchorOffsetMinutes(eventIso));
  const diff = calendarDayDiff(parts, today);
  return diff > 0 ? "past" : diff === 0 ? "today" : "upcoming";
}

/**
 * Days, hours, minutes, seconds until the event; zeroes once it has
 * started — and zeroes, never NaN, when the date is missing or
 * unparseable. (An undated draft once rendered a literal "NaN"
 * countdown; the date-driven modules are also hidden in that case.)
 */
export function remainingTime(now: number, eventIso: string) {
  const parsed = isoInstant(eventIso);
  const seconds = Number.isNaN(parsed)
    ? 0
    : Math.max(0, Math.floor((parsed - now) / 1000));
  return [
    Math.floor(seconds / 86400),
    Math.floor(seconds / 3600) % 24,
    Math.floor(seconds / 60) % 60,
    seconds % 60,
  ];
}

/**
 * Whole calendar days since the milestone began — a difference of date
 * parts in the milestone's own zone, not elapsed 24-hour periods, so
 * the count turns over at local midnight. Zero, never NaN, for a bad
 * date or one that has not begun.
 */
export function togetherDays(now: number, sinceIso: string) {
  const parts = isoDateParts(sinceIso);
  if (!parts) return 0;
  const today = datePartsAt(now, anchorOffsetMinutes(sinceIso));
  return Math.max(0, calendarDayDiff(parts, today));
}

/** Total days, hours and minutes elapsed — a running tally, not calendar units. */
export function togetherElapsed(
  now: number,
  sinceIso: string,
): [number, number, number] {
  const parsed = isoInstant(sinceIso);
  const minutes = Number.isNaN(parsed)
    ? 0
    : Math.max(0, Math.floor((now - parsed) / 60000));
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
  const since = isoInstant(sinceIso);
  if (Number.isNaN(since) || now < since) return [0, 0, 0];

  const offset = anchorOffsetMinutes(sinceIso) * 60000;
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

/**
 * A guest tapping the venue name should always land somewhere useful, even
 * when the couple never went looking for a maps link themselves — most
 * won't. An explicit link they did paste in always wins; otherwise this
 * builds a Google Maps search straight from the name and address they
 * already typed for the invitation itself.
 */
/**
 * Render-side allowlist for a stored venue link. Draft validation gates
 * the /create path, but invites can also be written through the database
 * editor, which it does not govern — so the guest page must never hand a
 * stored string to an anchor unchecked: only http(s) URLs may become a
 * link. Anything else (`javascript:`, `data:`, protocol-relative,
 * unparseable) returns null and the caller falls back to plain text or
 * a generated link.
 */
export function safeExternalUrl(value?: string | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" || url.protocol === "http:"
      ? value.trim()
      : null;
  } catch {
    return null;
  }
}

export function venueMapsHref(venueName: string, venueAddress?: string) {
  const query = [venueName, venueAddress].filter(Boolean).join(", ");
  // A plain web search, not a Maps deep link: a couple's own typed venue
  // name is often not exactly how Maps indexes the place, and a Maps query
  // that doesn't match anything lands a guest on a dead end. Google's own
  // search results page surfaces the Maps listing (and alternates) as a
  // guest can pick from, rather than betting everything on one exact-match
  // lookup.
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}
