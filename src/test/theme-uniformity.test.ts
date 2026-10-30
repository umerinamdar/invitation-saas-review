import { describe, expect, it } from "vitest";
import { themes, getTheme } from "@/themes";
import { dubaiSilk } from "@/themes/dubai-silk";
import { demoWedding, getDemoInvite } from "@/invites/demo-wedding";
import { themeDefaultLabel } from "@/lib/music";

// Uniformity contract (2026-10-24): Dubai Silk is the reference theme.
// Every registered theme must expose the SAME field set and feature
// surface — same assets, same scratch/reveal machinery, same music
// behaviour, and a complete demo of its own — so a feature that exists
// on one design exists on all of them. Per-theme artwork, palette,
// typography and opening mechanic are identity, not fields, and are
// deliberately NOT compared here.

// Photography fields: required only for themes that use photography
// (ornamentation === "none"), exactly the shape of the original 14.
// A theme that names an ornamentation ships without any artwork at all
// by design (see Ornamentation in themes/types.ts) — requiring these on
// it would contradict the very feature that lets it exist without
// photography.
const PHOTO_ASSET_FIELDS = [
  "sealedBackdrop",
  "revealedBackdrop",
  "sectionBackdrop",
  "paperTexture",
] as const;

describe("theme uniformity (Dubai Silk is the reference)", () => {
  it("registers Dubai Silk and keeps it as the fallback theme", () => {
    // Catalog reset (2026-10-25): every other theme was unregistered
    // while each is reworked one at a time to Dubai Silk's opening
    // quality — see docs/ops/OPENING-STUDY-ivory-silk-pearls.md. The
    // count will climb back up as themes return; it must never be 0.
    expect(themes.length).toBeGreaterThanOrEqual(1);
    expect(themes.some((theme) => theme.id === dubaiSilk.id)).toBe(true);
    expect(getTheme("no-such-theme").id).toBe(dubaiSilk.id);
  });

  it("every theme populates its full asset set (photography or ornamentation, plus music for all)", () => {
    for (const field of PHOTO_ASSET_FIELDS) {
      expect(
        dubaiSilk.assets[field],
        `reference theme lacks ${field}`,
      ).toBeTruthy();
    }
    for (const theme of themes) {
      expect(
        theme.assets.defaultMusic,
        `${theme.id} is missing assets.defaultMusic`,
      ).toBeTruthy();
      if (theme.ornamentation === "none") {
        for (const field of PHOTO_ASSET_FIELDS) {
          expect(
            theme.assets[field],
            `${theme.id} uses photography (ornamentation: "none") but is missing assets.${field}`,
          ).toBeTruthy();
        }
      } else {
        for (const field of PHOTO_ASSET_FIELDS) {
          expect(
            theme.assets[field],
            `${theme.id} names an ornamentation but also sets assets.${field} — pick one art style, not both`,
          ).toBeFalsy();
        }
      }
    }
  });

  it("every theme carries the same feature surface as Dubai Silk", () => {
    for (const theme of themes) {
      expect(theme.features, `${theme.id} features`).toHaveLength(4);
      expect(
        theme.copy.scratchTitle.trim(),
        `${theme.id} scratchTitle`,
      ).not.toBe("");
      expect(theme.copy.scratchHint.trim(), `${theme.id} scratchHint`).not.toBe(
        "",
      );
      expect(theme.motion.reveal, `${theme.id} reveal`).toBeTruthy();
      expect(theme.motion.openMs, `${theme.id} openMs`).toBeGreaterThan(0);
      expect(
        theme.motion.scratchThreshold,
        `${theme.id} scratchThreshold`,
      ).toBeGreaterThan(0);
      expect(
        theme.motion.musicFadeMs,
        `${theme.id} musicFadeMs`,
      ).toBeGreaterThan(0);
      expect(theme.motion.maxVolume, `${theme.id} maxVolume`).toBeGreaterThan(
        0,
      );
      expect(theme.occasions.length, `${theme.id} occasions`).toBeGreaterThan(
        0,
      );
      expect(theme.thumbnail, `${theme.id} thumbnail`).toBeTruthy();
    }
  });

  it("every theme resolves music by the renderer's rule, with none left silent", () => {
    // Mirrors invitation.tsx: invite.music?.url ?? theme.assets.defaultMusic,
    // for an invite that sets no music of its own.
    const inviteMusic: string | undefined = undefined;
    for (const theme of themes) {
      const musicUrl = inviteMusic ?? theme.assets.defaultMusic;
      expect(Boolean(musicUrl), `${theme.id} would render without music`).toBe(
        true,
      );
      // And the editor must be able to call the default "theme music".
      expect(
        themeDefaultLabel(theme.name, Boolean(theme.assets.defaultMusic)),
      ).toBe(`${theme.name} theme music`);
    }
  });

  it("every theme's demo is complete and its own (not the reference couple)", () => {
    for (const theme of themes) {
      const demo = getDemoInvite(theme.id);
      expect(demo.themeId).toBe(theme.id);
      // The full section surface a demo must fill, same as Dubai Silk's.
      expect(demo.hosts.person1, `${theme.id} demo person1`).toBeTruthy();
      expect(demo.hosts.person2, `${theme.id} demo person2`).toBeTruthy();
      expect(demo.hosts.family1, `${theme.id} demo family1`).toBeTruthy();
      expect(demo.hosts.family2, `${theme.id} demo family2`).toBeTruthy();
      expect(
        demo.familyMembers?.length,
        `${theme.id} demo familyMembers`,
      ).toBeGreaterThan(0);
      expect(demo.event.venueName, `${theme.id} demo venue`).toBeTruthy();
      expect(
        demo.subEvents?.length,
        `${theme.id} demo subEvents`,
      ).toBeGreaterThan(0);
      expect(
        demo.logistics?.transport,
        `${theme.id} demo transport`,
      ).toBeTruthy();
      expect(
        demo.logistics?.accommodation,
        `${theme.id} demo accommodation`,
      ).toBeTruthy();
      expect(demo.rsvp?.email, `${theme.id} demo rsvp email`).toBeTruthy();
      expect(demo.hashtag, `${theme.id} demo hashtag`).toBeTruthy();
      if (theme.id !== dubaiSilk.id) {
        // A gallery of previews must read as different weddings: no
        // theme may silently fall back to the base couple or venue.
        // Checked as the full pair, not person1 alone — a 34-design
        // catalog can coincidentally reuse one real first name (e.g.
        // marigold-mandap's groom is also named Aarav) without that
        // meaning the override silently fell through to the reference.
        expect(
          `${demo.hosts.person1} & ${demo.hosts.person2}`,
          `${theme.id} demo still shows the Dubai Silk couple`,
        ).not.toBe(
          `${demoWedding.hosts.person1} & ${demoWedding.hosts.person2}`,
        );
        expect(
          demo.event.venueName,
          `${theme.id} demo still shows the Dubai Silk venue`,
        ).not.toBe(demoWedding.event.venueName);
      }
    }
  });

  it("no two theme demos share the same wedding date", () => {
    const dates = themes.map((theme) => getDemoInvite(theme.id).event.startIso);
    expect(new Set(dates).size).toBe(dates.length);
  });
});
