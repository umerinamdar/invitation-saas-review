import { createServerFn } from "@tanstack/react-start";
import { toInvite } from "./invites-api";
import type { InviteRow } from "./supabase";
import { supabaseServer } from "./supabase-server";
import {
  collectInviteMediaPaths,
  pathsBelongingToInvite,
  reportMediaSigningShortfall,
  signInviteMediaPaths,
  type MediaUrlMap,
} from "./media-url";

/**
 * Gap-B server half: mint signed URLs for one PUBLISHED invite's own
 * media, for the guest page at /i/<slug>.
 *
 * The only input is the slug — never paths. The handler re-loads the
 * invite with the service-role client, requires status "published",
 * collects the stored-media paths from that invite's own config, keeps
 * only the paths whose second segment is that invite's id (the join
 * key migration 0003's published-read policy uses), and signs exactly
 * those. Signing authority therefore derives from the published invite
 * row itself: this function cannot be used to sign draft media or
 * another customer's objects, because the paths are never taken from
 * the request.
 *
 * Fail-soft: every failure mode returns an empty map, and the caller
 * falls back to public URLs — exactly the pre-0003 behaviour. But a
 * signing shortfall is never silent: the paths that were asked for
 * and not signed are reported to the server log (invite id, count,
 * file names only) via reportMediaSigningShortfall, because after
 * migration 0003 the public-URL fallback is dead and an unreported
 * shortfall would be undiagnosable broken guest media.
 */
export const loadPublishedInviteMediaUrlMap = createServerFn({
  method: "GET",
})
  .inputValidator((slug: unknown) => {
    if (typeof slug !== "string" || slug.length === 0 || slug.length > 128) {
      throw new Error("A valid invitation slug is required.");
    }
    return slug;
  })
  .handler(async ({ data: slug }): Promise<MediaUrlMap> => {
    const { data: row, error } = await supabaseServer
      .from("invites")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();
    if (error || !row) return {};

    const inviteRow = row as InviteRow;
    const invite = toInvite(inviteRow);
    const paths = pathsBelongingToInvite(
      collectInviteMediaPaths(invite),
      inviteRow.id,
    );
    if (paths.length === 0) return {};

    const map = await signInviteMediaPaths(supabaseServer, paths);
    reportMediaSigningShortfall(inviteRow.id, paths, map);
    return map;
  });
