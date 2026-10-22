import type { InviteConfig } from "./invites-api";
import {
  INVITE_MEDIA_BUCKET,
  isStoredMediaPath,
  resolveMediaUrl,
  type MediaStorageClient,
} from "./media-upload";

/**
 * Gap-B — the guest media access model.
 *
 * Why this module exists: migration 0003 makes the `invite-media`
 * bucket private. Supabase serves the plain public URL only while a
 * bucket is public, so the moment 0003 is applied, `resolveMediaUrl`'s
 * getPublicUrl fallback stops working for guests — even though 0003's
 * "media of published invites is readable" policy (no TO clause, so it
 * covers the public role) still authorises reads of objects whose
 * second path segment is a published invite's id.
 *
 * The model: the public invitation's loader asks the server to mint
 * short-lived signed URLs for exactly that published invite's own
 * stored media (see media-signing.ts) and hands the component a
 * path → signedUrl map. Resolution consults the map first and falls
 * back per path to the existing public-URL behaviour, so nothing
 * changes before 0003 is applied and a signing failure degrades to
 * today's rendering instead of a broken page. Draft and editor
 * surfaces never receive a map and never sign anything.
 *
 * Round 3 honesty fix: the fallback stays (it is what keeps pre-0003
 * rendering working), but a signing shortfall is no longer silent —
 * the server function reports it via reportMediaSigningShortfall, so
 * after 0003 — when the fallback URL is dead and a shortfall means
 * broken guest media — the failure is diagnosable from server logs.
 */

/** One hour: long enough for a guest session, short enough to expire. */
export const MEDIA_SIGNED_URL_TTL_SECONDS = 60 * 60;

/** Storage path → ready-to-render URL, minted server-side per invite. */
export type MediaUrlMap = Readonly<Record<string, string>>;

/** The config fields that can carry a stored media path. */
export type MediaConfigLike = Pick<InviteConfig, "gallery" | "music">;

/**
 * The explicit media-kind classification the signing design depends
 * on. Only "storage-path" values are Supabase Storage objects and the
 * only ones ever signed or resolved through the signed-URL map; every
 * other kind passes through byte-for-byte, exactly as it always has:
 *
 * - "external-url": an absolute URL (http/https or another scheme) —
 *   never treated as a storage path, never signed.
 * - "session-url": a blob: or data: value — a browser-session preview
 *   (e.g. a just-picked song in the editor), meaningless to guests.
 * - "app-asset": an app-relative asset shipped with the site (demo
 *   photos, theme tracks).
 * - "storage-path": a stored object path in the invite-media bucket.
 *   Classification says nothing about OWNERSHIP — a draft-scoped path
 *   is a storage path too; pathsBelongingToInvite decides whose paths
 *   may be signed.
 */
export type MediaValueKind =
  "empty" | "external-url" | "session-url" | "app-asset" | "storage-path";

export function classifyMediaValue(
  value: string | undefined | null,
): MediaValueKind {
  if (!value) return "empty";
  if (value.startsWith("blob:") || value.startsWith("data:")) {
    return "session-url";
  }
  if (isStoredMediaPath(value)) return "storage-path";
  if (/^[A-Za-z][A-Za-z0-9+.-]*:/.test(value)) return "external-url";
  return "app-asset";
}

/**
 * Every stored-media path a config references — gallery images and the
 * song — deduped, in config order. Legacy values (blob:, remote URLs,
 * app-relative demo assets) are not storage paths and are left out: they
 * resolve exactly as they always have.
 */
export function collectInviteMediaPaths(config: MediaConfigLike): string[] {
  const values: (string | undefined)[] = [];
  for (const image of config.gallery) values.push(image.url);
  values.push(config.music?.url);

  const seen = new Set<string>();
  const paths: string[] = [];
  for (const value of values) {
    if (!value || classifyMediaValue(value) !== "storage-path") continue;
    if (seen.has(value)) continue;
    seen.add(value);
    paths.push(value);
  }
  return paths;
}

/**
 * Keep only paths whose second segment is the given invite id — the
 * exact join key migration 0003's published-read policy matches on.
 * Draft-prefixed paths (segment two is `draft-<key>`) and any other
 * invite's paths are dropped, so a published invite's page can never
 * be used to sign media that does not belong to that invite.
 */
export function pathsBelongingToInvite(
  paths: readonly string[],
  inviteId: string,
): string[] {
  return paths.filter(
    (path) => isStoredMediaPath(path) && path.split("/")[1] === inviteId,
  );
}

type SignedUrlEntry = {
  path?: string | null;
  signedUrl?: string | null;
  error?: unknown;
};

type CreateSignedUrlsResult = {
  data: SignedUrlEntry[] | null;
  error: unknown;
};

/** The small part of a Supabase client that can mint signed URLs. */
export type MediaSigningClient = {
  storage: {
    from: (bucket: string) => {
      createSignedUrls: (
        paths: string[],
        expiresIn: number,
      ) => Promise<CreateSignedUrlsResult>;
    };
  };
};

/**
 * Mint signed URLs for the given paths in one storage round trip and
 * return the path → signedUrl map. Fail-soft by design: a storage
 * error, a thrown request, or a per-object failure simply leaves that
 * path out of the map, and the resolver falls back to the public URL
 * for it. Paths that were never requested are ignored even if the
 * storage response includes them.
 */
export async function signInviteMediaPaths(
  client: MediaSigningClient,
  paths: readonly string[],
  ttlSeconds: number = MEDIA_SIGNED_URL_TTL_SECONDS,
): Promise<Record<string, string>> {
  const unique = [...new Set(paths)].filter(isStoredMediaPath);
  if (unique.length === 0) return {};

  try {
    const { data, error } = await client.storage
      .from(INVITE_MEDIA_BUCKET)
      .createSignedUrls(unique, ttlSeconds);
    if (error || !data) return {};

    const requested = new Set(unique);
    const map: Record<string, string> = {};
    for (const entry of data) {
      if (!entry.path || !entry.signedUrl || entry.error) continue;
      if (!requested.has(entry.path)) continue;
      map[entry.path] = entry.signedUrl;
    }
    return map;
  } catch {
    return {};
  }
}

/**
 * Surface a signing shortfall in the server logs — once per batch.
 *
 * signInviteMediaPaths is deliberately fail-soft, but until Round 3
 * every failure mode was also silent: a shortfall looked exactly like
 * success-with-fallback. That was invisible before migration 0003
 * (the public-URL fallback still served the media), but after 0003
 * the fallback URL is dead, so an unlogged shortfall is undiagnosable
 * broken guest media. The caller (the guest-media server function)
 * passes the paths it asked to sign and the map that came back; any
 * requested path missing from the map is reported here.
 *
 * The diagnostic carries the invite id, the failed count and the
 * failed file NAMES only — never signed URLs (they embed access
 * tokens) and never full storage paths (their first segment is the
 * owner's user id). Returns the failed paths for callers/tests.
 */
export function reportMediaSigningShortfall(
  inviteId: string,
  requestedPaths: readonly string[],
  signedMap: MediaUrlMap,
): string[] {
  const failed = requestedPaths.filter((path) => !signedMap[path]);
  if (failed.length === 0) return failed;
  console.error("Signed URL minting incomplete for published invite media", {
    inviteId,
    failedCount: failed.length,
    failedFiles: failed.map((path) => path.split("/").at(-1) ?? path),
  });
  return failed;
}

/**
 * Resolve a config media value for display, preferring a server-minted
 * signed URL from the map. Only storage paths consult the map at all —
 * external URLs, session (blob:/data:) values and app assets pass
 * through untouched, map or no map. Anything the map does not cover —
 * drafts, editor previews, a path whose signing failed — resolves
 * through the original `resolveMediaUrl` behaviour unchanged; a
 * signing failure is reported server-side by the signing function
 * (reportMediaSigningShortfall), never disguised here as a success.
 */
export function resolveWithMediaUrlMap(
  value: string | undefined | null,
  mediaUrlMap?: MediaUrlMap,
  client?: MediaStorageClient,
) {
  if (value && mediaUrlMap && classifyMediaValue(value) === "storage-path") {
    const signed = mediaUrlMap[value];
    if (signed) return signed;
  }
  return resolveMediaUrl(value, client);
}
