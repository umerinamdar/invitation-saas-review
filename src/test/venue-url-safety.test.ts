import { describe, expect, it } from "vitest";
import { blankConfig, type InviteConfig } from "@/lib/invites-api";
import { getDraftIssues } from "@/lib/draft-validation";
import { safeExternalUrl } from "@/lib/invitation";

/**
 * Stored-XSS-by-link regression coverage (security finding X-1):
 * a venue URL is guest-facing href data. Only http(s) may ever render
 * as a link, no matter which write path stored it.
 */

const NOW = Date.parse("2027-01-01T00:00:00+05:30");
const FUTURE = "2027-02-14T19:00:00+05:30";

function validDraft(): InviteConfig {
  const config = blankConfig();
  config.hosts.person1 = "Aarav";
  config.hosts.person2 = "Priya";
  config.event.startIso = FUTURE;
  return config;
}

describe("safeExternalUrl render allowlist", () => {
  it("rejects script and data schemes", () => {
    expect(safeExternalUrl("javascript:alert(1)")).toBeNull();
    expect(safeExternalUrl("JaVaScRiPt:alert(1)")).toBeNull();
    expect(safeExternalUrl("data:text/html,<script>alert(1)</script>")).toBeNull();
  });

  it("rejects protocol-relative and unparseable values", () => {
    expect(safeExternalUrl("//evil.example/phish")).toBeNull();
    expect(safeExternalUrl("not-a-valid-url")).toBeNull();
    expect(safeExternalUrl("")).toBeNull();
    expect(safeExternalUrl(undefined)).toBeNull();
    expect(safeExternalUrl(null)).toBeNull();
  });

  it("passes http and https links through untouched", () => {
    expect(safeExternalUrl("https://maps.app.goo.gl/ZvBLCsdqbGWogDo98")).toBe(
      "https://maps.app.goo.gl/ZvBLCsdqbGWogDo98",
    );
    expect(safeExternalUrl("http://example.com/venue")).toBe(
      "http://example.com/venue",
    );
  });
});

describe("sub-event venue URL validation", () => {
  const withSubUrl = (venueMapsUrl?: string): InviteConfig => {
    const config = validDraft();
    const subEvent = {
      label: "Mehendi",
      dateText: "12 February 2027",
      timeText: "4 PM",
      venueName: "Palm Grove",
    };
    // Omit venueMapsUrl entirely when undefined: SubEvent declares it as
    // `venueMapsUrl?: string`, and exactOptionalPropertyTypes rejects an
    // explicitly-undefined value.
    config.subEvents = [
      venueMapsUrl === undefined ? subEvent : { ...subEvent, venueMapsUrl },
    ];
    return config;
  };

  it("blocks a javascript: link on a sub-event", () => {
    const issues = getDraftIssues(withSubUrl("javascript:alert(1)"), NOW);
    expect(issues.map((issue) => issue.field)).toContain("mapsUrl");
    expect(issues.find((issue) => issue.field === "mapsUrl")?.message).toMatch(
      /Mehendi/,
    );
  });

  it("blocks data: and protocol-relative links on a sub-event", () => {
    for (const bad of ["data:text/html,hello", "//evil.example/phish"]) {
      const fields = getDraftIssues(withSubUrl(bad), NOW).map(
        (issue) => issue.field,
      );
      expect(fields).toContain("mapsUrl");
    }
  });

  it("accepts a real Maps link and an empty sub-event link", () => {
    expect(
      getDraftIssues(withSubUrl("https://maps.app.goo.gl/abc123"), NOW),
    ).toEqual([]);
    expect(getDraftIssues(withSubUrl(""), NOW)).toEqual([]);
    expect(getDraftIssues(withSubUrl(undefined), NOW)).toEqual([]);
  });
});
