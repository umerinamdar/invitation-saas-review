import { hostNames } from "@/invites/types";
import type { Invite } from "@/invites/types";

/**
 * Share links for a published invitation (mission §6.1).
 *
 * The public URL is built from the app's own origin — the same base
 * every other guest link in the product uses (`window.location.origin`
 * in the browser) — never a hardcoded host, so a link copied from the
 * deployed site can never point at localhost or a dev server. Callers
 * in tests or server code may pass an explicit base URL.
 */
export interface ShareLinks {
  /** The guest-facing invitation URL, e.g. https://site.example/i/asha-vikram-x1 */
  publicUrl: string;
  /** wa.me link with the invitation message fully percent-encoded. */
  whatsappUrl: string;
  /** What a "copy link" action should put on the clipboard. */
  copyText: string;
}

function defaultBaseUrl(): string {
  return typeof window !== "undefined" ? window.location.origin : "";
}

export function buildShareLinks(
  invite: Invite,
  baseUrl: string = defaultBaseUrl(),
): ShareLinks {
  const publicUrl = `${baseUrl.replace(/\/+$/, "")}/i/${invite.slug}`;
  const names = hostNames(invite);
  const message = names
    ? `You're invited! ${names} — view the invitation: ${publicUrl}`
    : `You're invited! View the invitation: ${publicUrl}`;
  return {
    publicUrl,
    whatsappUrl: `https://wa.me/?text=${encodeURIComponent(message)}`,
    copyText: publicUrl,
  };
}
