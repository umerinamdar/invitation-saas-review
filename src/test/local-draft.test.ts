import { beforeEach, describe, expect, it } from "vitest";

import { blankConfig } from "@/lib/invites-api";
import {
  clearDraft,
  readDraft,
  setDraftInviteId,
  writeDraft,
} from "@/lib/local-draft";

// Release Fix 3 (Agent A, D3): the local draft now remembers the
// invite row created from it (draftInviteId), so a publish retry
// reuses that row instead of inserting a fresh one on every attempt —
// and order-success can tell when the draft's own order completed and
// the draft should be cleared. The /create autosave writes
// { themeId, config } on every change and must never wipe the stored
// id; these tests pin that contract.
describe("local draft invite id (Fix 3 / D3)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("round-trips theme and config with no invite id at first", () => {
    writeDraft({ themeId: "dubai-silk", config: blankConfig() });
    const draft = readDraft();
    expect(draft?.themeId).toBe("dubai-silk");
    expect(draft?.draftInviteId).toBeUndefined();
  });

  it("setDraftInviteId persists the row id into the stored draft", () => {
    writeDraft({ themeId: "dubai-silk", config: blankConfig() });
    setDraftInviteId("11111111-1111-4111-8111-111111111111");
    expect(readDraft()?.draftInviteId).toBe(
      "11111111-1111-4111-8111-111111111111",
    );
  });

  it("a later config-only writeDraft (the /create autosave) preserves the stored id", () => {
    writeDraft({ themeId: "dubai-silk", config: blankConfig() });
    setDraftInviteId("11111111-1111-4111-8111-111111111111");
    const edited = blankConfig();
    edited.event.venueName = "Palm Grove";
    writeDraft({ themeId: "kesari-mandap", config: edited });
    const draft = readDraft();
    expect(draft?.draftInviteId).toBe("11111111-1111-4111-8111-111111111111");
    expect(draft?.themeId).toBe("kesari-mandap");
    expect(draft?.config.event.venueName).toBe("Palm Grove");
  });

  it("setDraftInviteId is a no-op when no draft exists", () => {
    setDraftInviteId("11111111-1111-4111-8111-111111111111");
    expect(readDraft()).toBeNull();
  });

  it("clearDraft removes the whole record, invite id included", () => {
    writeDraft({ themeId: "dubai-silk", config: blankConfig() });
    setDraftInviteId("11111111-1111-4111-8111-111111111111");
    clearDraft();
    expect(readDraft()).toBeNull();
    expect(localStorage.getItem("invite-draft")).toBeNull();
  });

  it("a malformed stored invite id is dropped on read, not trusted", () => {
    localStorage.setItem(
      "invite-draft",
      JSON.stringify({
        themeId: "dubai-silk",
        config: blankConfig(),
        draftInviteId: 42,
        updatedAt: 1,
      }),
    );
    expect(readDraft()?.draftInviteId).toBeUndefined();
  });
});

describe("draft invite id validation + account scoping (impl round 2, C-1/C-2)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("a non-UUID string stored id is dropped on read, never trusted (C-2)", () => {
    localStorage.setItem(
      "invite-draft",
      JSON.stringify({
        themeId: "dubai-silk",
        config: blankConfig(),
        draftInviteId: "not-a-uuid",
        updatedAt: 1,
      }),
    );
    expect(readDraft()?.draftInviteId).toBeUndefined();
  });

  it("user-change matrix: anon→A keep, A→A keep, A→sign-out clear, A→B clear (C-1)", async () => {
    const { draftClearsOnUserChange } = await import("@/lib/local-draft");
    expect(draftClearsOnUserChange(null, "user-a")).toBe(false);
    expect(draftClearsOnUserChange(null, null)).toBe(false);
    expect(draftClearsOnUserChange("user-a", "user-a")).toBe(false);
    expect(draftClearsOnUserChange("user-a", null)).toBe(true);
    expect(draftClearsOnUserChange("user-a", "user-b")).toBe(true);
  });

  it("clearLocalDraftData removes BOTH the draft and its media key (C-1)", async () => {
    const { clearLocalDraftData } = await import("@/lib/local-draft");
    writeDraft({ themeId: "dubai-silk", config: blankConfig() });
    localStorage.setItem("invite-draft-media-key", "some-key");
    clearLocalDraftData();
    expect(localStorage.getItem("invite-draft")).toBeNull();
    expect(localStorage.getItem("invite-draft-media-key")).toBeNull();
  });
});
