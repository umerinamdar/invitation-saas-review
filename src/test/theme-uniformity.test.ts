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

const ASSET_FIELDS = [
  "sealedBackdrop",
  "revealedBackdrop",
  "sectionBackdrop",
  "paperTexture",
  "defaultMusic",
] as const;

describe("theme uniformity (Dubai Silk is the reference)", () => {
  it("registers Dubai Silk and keeps it as the fallback theme", () => {
    expect(themes.length).toBeGreaterThanOrEqual(14);
    expect(themes.some((theme) => theme.id === dubaiSilk.id)).toBe(true);
    expect(getTheme("no-such-theme").id).toBe(dubaiSilk.id);
  });

  it("every theme populates the full Dubai Silk asset set", () => {
    for (const field of ASSET_FIELDS) {
      expect(dubaiSilk.assets[field], `reference theme lacks ${field}`).toBeTruthy();
    }
    for (const theme of themes) {
      for (const field of ASSET_FIELDS) {
        expect(
          theme.assets[field],
          `${theme.id} is missing assets.${field} (Dubai Silk sets it)`,
        ).toBeTruthy();
      }
    }
  });

  it("every theme carries the same feature surface as Dubai Silk", () => {
    for (const theme of themes) {
      expect(theme.features, `${theme.id} features`).toHaveLength(4);
      expect(theme.copy.scratchTitle.trim(), `${theme.id} scratchTitle`).not.toBe("");
      expect(theme.copy.scratchHint.trim(), `${theme.id} scratchHint`).not.toBe("");
      expect(theme.motion.reveal, `${theme.id} reveal`).toBeTruthy();
      expect(theme.motion.openMs, `${theme.id} openMs`).toBeGreaterThan(0);
      expect(theme.motion.scratchThreshold, `${theme.id} scratchThreshold`).toBeGreaterThan(0);
      expect(theme.motion.musicFadeMs, `${theme.id} musicFadeMs`).toBeGreaterThan(0);
      expect(theme.motion.maxVolume, `${theme.id} maxVolume`).toBeGreaterThan(0);
      expect(theme.occasions.length, `${theme.id} occasions`).toBeGreaterThan(0);
      expect(theme.thumbnail, `${theme.id} thumbnail`).toBeTruthy();
    }
  });

  it("every theme resolves music by the renderer's rule, with none left silent", () => {
    // Mirrors invitation.tsx: invite.music?.url ?? theme.assets.defaultMusic,
    // for an invite that sets no music of its own.
    const inviteMusic: string | undefined = undefined;
    for (const theme of themes) {
      const musicUrl = inviteMusic ?? theme.assets.defaultMusic;
      expect(Boolean(musicUrl), `${theme.id} would render without music`).toBe(true);
      // And the editor must be able to call the default "theme music".
      expect(themeDefaultLabel(theme.name, Boolean(theme.assets.defaultMusic))).toBe(
        `${theme.name} theme music`,
      );
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
      expect(demo.familyMembers?.length, `${theme.id} demo familyMembers`).toBeGreaterThan(0);
      expect(demo.event.venueName, `${theme.id} demo venue`).toBeTruthy();
      expect(demo.subEvents?.length, `${theme.id} demo subEvents`).toBeGreaterThan(0);
      expect(demo.logistics?.transport, `${theme.id} demo transport`).toBeTruthy();
      expect(demo.logistics?.accommodation, `${theme.id} demo accommodation`).toBeTruthy();
      expect(demo.rsvp?.email, `${theme.id} demo rsvp email`).toBeTruthy();
      expect(demo.hashtag, `${theme.id} demo hashtag`).toBeTruthy();
      if (theme.id !== dubaiSilk.id) {
        // A gallery of previews must read as different weddings: no
        // theme may silently fall back to the base couple or venue.
        expect(
          demo.hosts.person1,
          `${theme.id} demo still shows the Dubai Silk couple`,
        ).not.toBe(demoWedding.hosts.person1);
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
