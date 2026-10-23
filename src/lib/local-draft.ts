import { blankConfig, type InviteConfig } from "./invites-api";

const KEY = "invite-draft";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type LocalDraft = {
  themeId: string;
  config: InviteConfig;
  updatedAt: number;
  /**
   * Release Fix 3 (D3): the invite row a publish attempt created from
   * this draft. A retry reuses that row instead of inserting a fresh
   * one every time (each orphan row could arm its own checkout), and
   * order-success clears the draft once THIS row's order completes.
   * Absent until the first publish attempt creates a row.
   */
  draftInviteId?: string;
};

/**
 * A draft held in the browser so someone can design an invitation before
 * creating an account. Asking for a signup before they have seen their own
 * names on the page loses most of them.
 */
export function readDraft(): LocalDraft | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LocalDraft;
    if (!parsed?.themeId || !parsed?.config) return null;
    // A stored id is only ever trusted as a UUID string; anything
    // else (hand-edited or corrupt storage) is dropped, never used.
    // Impl round 2 (Agent C, C-2): previously any string passed —
    // a malformed id then failed the reuse lookup in ways the
    // publish flow could not distinguish from "row is gone".
    const { draftInviteId: storedId, ...rest } = parsed;
    return {
      ...rest,
      ...(typeof storedId === "string" && UUID_RE.test(storedId)
        ? { draftInviteId: storedId }
        : {}),
      config: { ...blankConfig(), ...parsed.config },
    };
  } catch {
    // Private browsing, cleared storage or a half-written value: start fresh.
    return null;
  }
}

export function writeDraft(draft: Omit<LocalDraft, "updatedAt">) {
  if (typeof localStorage === "undefined") return;
  try {
    // The /create autosave writes { themeId, config } on every change
    // and knows nothing of the publish flow: a stored draftInviteId
    // survives those writes unless the caller sets one explicitly.
    const draftInviteId = draft.draftInviteId ?? readDraft()?.draftInviteId;
    localStorage.setItem(
      KEY,
      JSON.stringify({
        ...draft,
        ...(draftInviteId ? { draftInviteId } : {}),
        updatedAt: Date.now(),
      }),
    );
  } catch {
    // Storage can be full or blocked; the editor still works for this visit.
  }
}

/** Record the invite row created from this draft (Fix 3). */
export function setDraftInviteId(inviteId: string) {
  const current = readDraft();
  if (!current) return;
  writeDraft({
    themeId: current.themeId,
    config: current.config,
    draftInviteId: inviteId,
  });
}

export function clearDraft() {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* nothing to do */
  }
}

/** The media-scope key paired with the draft (create.tsx/publish.tsx). */
export const DRAFT_MEDIA_KEY = "invite-draft-media-key";

/**
 * Remove BOTH draft keys — the draft and its media-scope key. When the
 * departing user's id is known (the identity-change path in auth.tsx),
 * also remove that user's editor mirrors (`invite-editor-mirror:<uid>:*`
 * in editor.$id.tsx): a full copy of each edited invitation's config
 * otherwise survives sign-out on a shared browser indefinitely. Other
 * users' mirrors are theirs and stay.
 */
export function clearLocalDraftData(departingUserId?: string) {
  clearDraft();
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.removeItem(DRAFT_MEDIA_KEY);
    if (departingUserId) {
      const prefix = `invite-editor-mirror:${departingUserId}:`;
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) keys.push(key);
      }
      for (const key of keys) localStorage.removeItem(key);
    }
  } catch {
    /* nothing to do */
  }
}

/**
 * Impl round 2 (Agent C, C-1 — cross-account leak): the local draft
 * lives in ONE unscoped browser key, so on a shared browser account
 * B would see, edit, and even publish account A's design. The draft
 * is cleared when the signed-in identity CHANGES AWAY from a known
 * user — sign-out, or a different user signing in. Anonymous →
 * first sign-in keeps it (the draft is the pre-signup design), and
 * same-user refreshes/token renewals keep it.
 */
export function draftClearsOnUserChange(
  previousUserId: string | null,
  nextUserId: string | null,
): boolean {
  return previousUserId !== null && nextUserId !== previousUserId;
}
