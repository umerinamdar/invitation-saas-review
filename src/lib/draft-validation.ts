import type { InviteConfig } from "./invites-api";

/**
 * Publish-readiness checks for a draft, shared by the /create editor
 * (the Publish button gate and the inline field errors) and the
 * /publish page itself, so a draft that reaches /publish by a saved
 * link or the back button is held to exactly the same rules.
 *
 * Before this module existed, an invitation with no date and a
 * WhatsApp number of "abc-not-a-phone" could be carried all the way
 * to the pay step, and its preview countdown rendered "NaN".
 * (Audit 2026-10-21, tasks 4 and 5.)
 */

export type DraftIssueField =
  "person1" | "person2" | "date" | "whatsapp" | "mapsUrl";

export type DraftIssue = {
  field: DraftIssueField;
  message: string;
};

/** Digits only, so "+91 98200 00000" and "919820000000" compare alike. */
export function whatsappDigits(value: string): string {
  return value.replace(/[^0-9]/g, "");
}

/**
 * A reachable WhatsApp number: 10 digits (an Indian mobile without the
 * country code) up to 15 (the international maximum), digits and the
 * usual separators/leading + only — letters can never be a number.
 */
export function isValidWhatsapp(value: string): boolean {
  if (!/^[+\d][\d\s()-]*$/.test(value.trim())) return false;
  const digits = whatsappDigits(value);
  return digits.length >= 10 && digits.length <= 15;
}

/** True when the value parses as an http(s) URL at all. */
export function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

/** Hosts a couple would actually paste for a venue pin. */
export function isGoogleMapsUrl(value: string): boolean {
  try {
    const { hostname } = new URL(value.trim());
    return (
      hostname === "maps.app.goo.gl" ||
      hostname === "goo.gl" ||
      hostname === "maps.google.com" ||
      ((hostname.endsWith("google.com") || hostname.endsWith("google.co.in")) &&
        value.includes("/maps"))
    );
  } catch {
    return false;
  }
}

/**
 * The countdown/scratch gate: a stored ISO string only counts as an
 * event date when it parses — "" and free text are not dates, and
 * must never reach the countdown maths (they produced literal "NaN").
 */
export function parseEventDate(startIso: string): number | null {
  if (!startIso) return null;
  const ms = Date.parse(startIso);
  return Number.isNaN(ms) ? null : ms;
}

/**
 * Everything that must be true before a draft may be published.
 * `now` is injectable so the rules are unit-testable.
 */
export function getDraftIssues(
  config: InviteConfig,
  now: number = Date.now(),
): DraftIssue[] {
  const issues: DraftIssue[] = [];

  if (!config.hosts.person1.trim()) {
    issues.push({ field: "person1", message: "Add the first name." });
  }
  if (config.hosts.mode === "couple" && !config.hosts.person2?.trim()) {
    issues.push({ field: "person2", message: "Add the partner's name." });
  }

  const eventMs = parseEventDate(config.event.startIso);
  if (eventMs === null) {
    issues.push({ field: "date", message: "Add the event date and time." });
  } else if (eventMs <= now) {
    issues.push({
      field: "date",
      message: "The event date is in the past — pick a future date.",
    });
  }

  const whatsapp = config.rsvp?.whatsapp?.trim() ?? "";
  if (whatsapp && !isValidWhatsapp(whatsapp)) {
    issues.push({
      field: "whatsapp",
      message:
        "That WhatsApp number doesn't look right — guests' replies would go nowhere. Use digits with the country code, e.g. +91 98200 00000.",
    });
  }

  const mapsUrl = config.event.venueMapsUrl?.trim() ?? "";
  if (mapsUrl && !isValidUrl(mapsUrl)) {
    issues.push({
      field: "mapsUrl",
      message:
        "That Google Maps link isn't a valid link — paste the full link Maps gives you, starting with https://.",
    });
  }

  // Sub-event venues follow exactly the same rule as the main venue:
  // a stored javascript:/data: link must never reach a guest's page.
  for (const sub of config.subEvents ?? []) {
    const subUrl = sub.venueMapsUrl?.trim() ?? "";
    if (subUrl && !isValidUrl(subUrl)) {
      issues.push({
        field: "mapsUrl",
        message: `That Google Maps link for ${sub.label || "a function"} isn't a valid link — paste the full link Maps gives you, starting with https://.`,
      });
    }
  }

  return issues;
}

/**
 * Server-side adapter over the rules above for a STORED invite config
 * (the invites.config jsonb, loaded with the service-role client in
 * /api/orders). The browser gates stop an incomplete draft from
 * reaching checkout, but the API must not trust that they ran: a
 * direct call could otherwise create — and pay for — an order against
 * the owner's own blank invite, which the webhook would then publish
 * (NF-3). Same rules, never forked: this only shape-guards the
 * untrusted JSON and delegates to getDraftIssues. Anything that is not
 * a recognisable config reads as not publish-ready.
 */
export function getStoredInviteIssues(config: unknown): DraftIssue[] {
  const notReady: DraftIssue[] = [
    { field: "person1", message: "Add the first name." },
  ];
  if (!config || typeof config !== "object") return notReady;
  const candidate = config as Partial<InviteConfig>;
  if (
    !candidate.hosts ||
    typeof candidate.hosts !== "object" ||
    !candidate.event ||
    typeof candidate.event !== "object"
  ) {
    return notReady;
  }
  try {
    return getDraftIssues(config as InviteConfig);
  } catch {
    return notReady;
  }
}

/** Non-blocking nudge: a valid link, but not one Maps issued. */
export function mapsUrlWarning(config: InviteConfig): string | null {
  const mapsUrl = config.event.venueMapsUrl?.trim() ?? "";
  if (mapsUrl && isValidUrl(mapsUrl) && !isGoogleMapsUrl(mapsUrl)) {
    return "That link works, but it doesn't look like a Google Maps link — double-check it's the venue pin you meant.";
  }
  return null;
}
