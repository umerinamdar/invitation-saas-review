import { describe, expect, it } from "vitest";
import { themes } from "@/themes";
import { demoWedding, getDemoInvite } from "@/invites/demo-wedding";
import { LIVE_LOCALES, LOCALES, REGIONS } from "@/i18n/locales";
import { dictionaries } from "@/i18n/translations";

/**
 * NF-10: every theme's preview used to show the same demo couple — two
 * real celebrities' names, on all 14 cards. These tests pin the fix:
 * each theme has its own invented couple and its own date, and no
 * celebrity names survive anywhere in the demo data.
 */
describe("per-theme demo invitations (NF-10)", () => {
  const demos = themes.map((theme) => getDemoInvite(theme.id));

  it("gives every registered theme a demo couple", () => {
    expect(demos).toHaveLength(themes.length);
    for (const [i, invite] of demos.entries()) {
      expect(invite.themeId).toBe(themes[i]!.id);
      expect(invite.hosts.person1?.trim()).toBeTruthy();
      expect(invite.hosts.person2?.trim()).toBeTruthy();
    }
  });

  it("never repeats a couple across themes", () => {
    const pairs = demos.map(
      (invite) => `${invite.hosts.person1} & ${invite.hosts.person2}`,
    );
    expect(new Set(pairs).size).toBe(themes.length);
  });

  it("never repeats an event date across themes", () => {
    const dates = demos.map((invite) => invite.event.startIso.slice(0, 10));
    expect(new Set(dates).size).toBe(themes.length);
  });

  it("keeps each demo's written date and weekday consistent with its ISO date", () => {
    const weekdayFmt = new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      timeZone: "Asia/Kolkata",
    });
    const dateFmt = new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    });
    for (const invite of demos) {
      const when = new Date(invite.event.startIso);
      expect(invite.event.dayText).toBe(weekdayFmt.format(when));
      expect(invite.event.dateText).toBe(dateFmt.format(when));
    }
  });

  it("puts the couple's own names in the page title and hashtag", () => {
    for (const invite of demos) {
      expect(invite.meta.title).toContain(invite.hosts.person1);
      expect(invite.meta.title).toContain(invite.hosts.person2);
      expect(invite.hashtag).toContain(invite.hosts.person1);
    }
  });

  it("contains no real celebrity names anywhere in the demo data", () => {
    const everything = JSON.stringify([demoWedding, ...demos]);
    expect(everything).not.toMatch(/Virat|Anushka/);
  });
});

/**
 * NF-9: the language switcher must never present a language as available
 * when it has no real translation. LIVE_LOCALES is the switcher's
 * availability list; `dictionaries` is what actually gets rendered. Pin
 * the two to each other: a locale is "live" exactly when a complete
 * dictionary exists for it.
 */
describe("language availability honesty (NF-9)", () => {
  it("marks a locale live exactly when a dictionary exists for it", () => {
    const translated = Object.keys(dictionaries).sort();
    expect([...LIVE_LOCALES].sort()).toEqual(translated);
  });

  it("gives every live locale a complete dictionary, not a stub", () => {
    const englishKeys = Object.keys(dictionaries.en ?? {}).length;
    expect(englishKeys).toBeGreaterThan(0);
    for (const code of LIVE_LOCALES) {
      expect(Object.keys(dictionaries[code] ?? {})).toHaveLength(englishKeys);
    }
  });

  it("only offers locales the catalog actually defines", () => {
    const offered = ["en", ...REGIONS.flatMap((region) => region.codes)];
    for (const code of offered) {
      expect(LOCALES[code as keyof typeof LOCALES]).toBeDefined();
    }
  });
});
