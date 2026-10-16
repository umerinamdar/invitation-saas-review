import type { Invite } from "./types";
import { demoWedding } from "./demo-wedding";
import { umerMaimoona } from "./umer-maimoona";

/**
 * Stand-in for the invites table until phase 3. `demo` is public; personal
 * invites live here too but are never listed in the template gallery.
 */
const invites: Invite[] = [demoWedding, umerMaimoona];

export const invitesBySlug = new Map(
  invites.map((invite) => [invite.slug, invite]),
);

/** Invites safe to show publicly as template previews. */
export const PREVIEW_SLUG = demoWedding.slug;

export function getInvite(slug: string): Invite | undefined {
  return invitesBySlug.get(slug);
}

export * from "./types";
