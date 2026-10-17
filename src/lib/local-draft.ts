import { blankConfig, type InviteConfig } from "./invites-api";

const KEY = "invite-draft";

export type LocalDraft = {
  themeId: string;
  config: InviteConfig;
  updatedAt: number;
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
    return { ...parsed, config: { ...blankConfig(), ...parsed.config } };
  } catch {
    // Private browsing, cleared storage or a half-written value: start fresh.
    return null;
  }
}

export function writeDraft(draft: Omit<LocalDraft, "updatedAt">) {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(
      KEY,
      JSON.stringify({ ...draft, updatedAt: Date.now() }),
    );
  } catch {
    // Storage can be full or blocked; the editor still works for this visit.
  }
}

export function clearDraft() {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* nothing to do */
  }
}
