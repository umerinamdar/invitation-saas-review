import { describe, expect, it } from "vitest";
import { blankConfig, type InviteConfig } from "@/lib/invites-api";
import {
  getDraftIssues,
  isGoogleMapsUrl,
  isValidWhatsapp,
  mapsUrlWarning,
} from "@/lib/draft-validation";
import { hasValidEventDate, remainingTime } from "@/lib/invitation";

const NOW = Date.parse("2027-01-01T00:00:00+05:30");
const FUTURE = "2027-02-14T19:00:00+05:30";

function validDraft(): InviteConfig {
  const config = blankConfig();
  config.hosts.person1 = "Aarav";
  config.hosts.person2 = "Priya";
  config.event.startIso = FUTURE;
  return config;
}

const fields = (config: InviteConfig) =>
  getDraftIssues(config, NOW).map((issue) => issue.field);

describe("draft publish validation", () => {
  it("accepts a complete draft", () => {
    expect(getDraftIssues(validDraft(), NOW)).toEqual([]);
  });

  it("names both missing names on a blank draft", () => {
    const config = blankConfig();
    config.event.startIso = FUTURE;
    expect(fields(config)).toEqual(
      expect.arrayContaining(["person1", "person2"]),
    );
  });

  it("blocks a missing date and a past date", () => {
    const missing = validDraft();
    missing.event.startIso = "";
    expect(fields(missing)).toContain("date");

    const past = validDraft();
    past.event.startIso = "2026-12-01T19:00:00+05:30";
    expect(fields(past)).toContain("date");
  });

  it("rejects the audit's gibberish WhatsApp number and Maps link", () => {
    const config = validDraft();
    config.rsvp = { enabled: true, whatsapp: "abc-not-a-phone" };
    config.event.venueMapsUrl = "not-a-valid-url";
    expect(fields(config)).toEqual(
      expect.arrayContaining(["whatsapp", "mapsUrl"]),
    );
  });

  it("accepts real WhatsApp numbers in common formats", () => {
    expect(isValidWhatsapp("+91 98200 00000")).toBe(true);
    expect(isValidWhatsapp("9820000000")).toBe(true);
    expect(isValidWhatsapp("abc-not-a-phone")).toBe(false);
    expect(isValidWhatsapp("12345")).toBe(false);
  });

  it("recognises Google Maps links and warns about other links", () => {
    expect(isGoogleMapsUrl("https://maps.app.goo.gl/abc123")).toBe(true);
    expect(
      isGoogleMapsUrl("https://www.google.com/maps/search/?api=1&query=x"),
    ).toBe(true);
    const config = validDraft();
    config.event.venueMapsUrl = "https://example.com/somewhere";
    expect(mapsUrlWarning(config)).toMatch(/doesn't look like a Google Maps/);
  });
});

describe("countdown date safety", () => {
  it("never renders NaN for a missing or unparseable date", () => {
    expect(hasValidEventDate("")).toBe(false);
    expect(hasValidEventDate("not-a-date")).toBe(false);
    expect(hasValidEventDate(FUTURE)).toBe(true);
    expect(remainingTime(NOW, "")).toEqual([0, 0, 0, 0]);
    expect(remainingTime(NOW, "not-a-date")).toEqual([0, 0, 0, 0]);
  });
});
