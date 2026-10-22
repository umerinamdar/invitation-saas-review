import { describe, expect, it } from "vitest";

import { blankConfig, buildInviteInsert, type InviteConfig } from "@/lib/invites-api";

// Batch 2 / W1: the publish bridge. createInvite used to insert
// blankConfig() under a generic slug, so the draft a customer had just
// validated and paid for never reached the database. These tests pin
// the row that createInvite now builds (createInvite itself needs a
// live Supabase client, so the insert mapping is tested as a pure
// function — the same pattern as the other unit tests in this repo).

function draftConfig(): InviteConfig {
  const config = blankConfig();
  config.hosts = { mode: "couple", person1: "Aisha Khan", person2: "Omar Farouk" };
  config.event = {
    ...config.event,
    startIso: "2027-02-14T16:00:00+05:30",
    dateText: "14 February 2027",
    venueName: "The Rosewood Lawns",
  };
  return config;
}

describe("buildInviteInsert", () => {
  it("saves the full draft config — names, date and venue — not a blank one", () => {
    const config = draftConfig();
    const insert = buildInviteInsert("user-1", "dubai-silk", config);

    expect(insert.user_id).toBe("user-1");
    expect(insert.theme_id).toBe("dubai-silk");
    expect(insert.config).toBe(config);
    expect(insert.config.hosts.person1).toBe("Aisha Khan");
    expect(insert.config.hosts.person2).toBe("Omar Farouk");
    expect(insert.config.event.startIso).toBe("2027-02-14T16:00:00+05:30");
    expect(insert.config.event.venueName).toBe("The Rosewood Lawns");
  });

  it("derives the slug from the couple's names and the event_date from the draft", () => {
    const insert = buildInviteInsert("user-1", "dubai-silk", draftConfig());

    expect(insert.slug).toMatch(/^aisha-khan-omar-farouk-[a-z0-9]{4}$/);
    expect(insert.event_date).toBe("2027-02-14T16:00:00+05:30");
  });

  it("omits event_date when the draft config has no date yet", () => {
    // A real draft (names + venue filled in) whose date is still empty:
    // the insert must not carry an event_date key at all — mirroring
    // saveInvite — while the names and slug still come from the draft.
    const config = draftConfig();
    config.event.startIso = "";

    const insert = buildInviteInsert("user-1", "dubai-silk", config);

    expect(insert.config.hosts.person1).toBe("Aisha Khan");
    expect(insert.slug).toMatch(/^aisha-khan-omar-farouk-[a-z0-9]{4}$/);
    expect(insert.event_date).toBeUndefined();
    expect("event_date" in insert).toBe(false);
  });

  it("keeps the old dashboard behaviour when no config is passed", () => {
    const insert = buildInviteInsert("user-1", "dubai-silk");

    expect(insert.config).toEqual(blankConfig());
    expect(insert.slug).toMatch(/^invitation-[a-z0-9]{4}$/);
    expect(insert.event_date).toBeUndefined();
  });
});
