import type { InviteConfig } from "./invites-api";

export const INVITE_MEDIA_BUCKET = "invite-media";

export type InviteMediaKind = "photo" | "song";

type StorageUploadResult = {
  data: { path: string } | null;
  error: unknown;
};

type StorageCopyResult = {
  data: { path: string } | null;
  error: unknown;
};

type StorageBucketClient = {
  upload: (
    path: string,
    file: File,
    options: { contentType: string; upsert: boolean },
  ) => Promise<StorageUploadResult>;
  copy: (fromPath: string, toPath: string) => Promise<StorageCopyResult>;
  getPublicUrl: (path: string) => { data: { publicUrl: string } };
};

/** The small part of the browser Supabase client this module needs. */
export type MediaStorageClient = {
  storage: {
    from: (bucket: string) => StorageBucketClient;
  };
};

export type MediaUploadScope = {
  userId: string;
  inviteId?: string;
  draftKey?: string;
};

export type UploadInviteMediaOptions = MediaUploadScope & {
  file: File;
  kind: InviteMediaKind;
  /** Deterministic filename token, mainly for tests and slot replacements. */
  fileKey?: string;
};

const PHOTO_MAX_BYTES = 8 * 1024 * 1024;
const SONG_MAX_BYTES = 10 * 1024 * 1024;

const EXTENSION_BY_MIME: Record<InviteMediaKind, Record<string, string>> = {
  photo: {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/avif": "avif",
  },
  song: {
    "audio/mpeg": "mp3",
    "audio/mp4": "m4a",
    "audio/wav": "wav",
    "audio/x-wav": "wav",
    "audio/ogg": "ogg",
  },
};

const STORED_EXTENSIONS = new Set([
  ...Object.values(EXTENSION_BY_MIME.photo),
  ...Object.values(EXTENSION_BY_MIME.song),
]);

function cleanSegment(value: string, label: string) {
  const segment = value.trim();
  if (!/^[A-Za-z0-9_-]+$/.test(segment)) {
    throw new Error(`A valid ${label} is required before uploading media.`);
  }
  return segment;
}

function cleanFileKey(value: string | undefined) {
  const cleaned = value
    ?.trim()
    .replace(/[^A-Za-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  if (cleaned) return cleaned;
  return (
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
}

function scopeSegment(options: MediaUploadScope) {
  if (options.inviteId) return cleanSegment(options.inviteId, "invite id");
  if (options.draftKey) {
    const draftKey = cleanSegment(options.draftKey, "draft key");
    return draftKey.startsWith("draft-") ? draftKey : `draft-${draftKey}`;
  }
  throw new Error("An invite or draft is required before uploading media.");
}

function unsupportedTypeError(kind: InviteMediaKind) {
  return new Error(
    kind === "photo"
      ? "That file isn't a supported photo type. Use JPG, PNG, WebP, GIF or AVIF."
      : "That file isn't a supported song type. Use MP3, M4A, WAV or OGG.",
  );
}

/** Validate against the same MIME allowlist and size caps migration 0003 sets. */
export function validateInviteMediaFile(file: File, kind: InviteMediaKind) {
  const extension = EXTENSION_BY_MIME[kind][file.type];
  if (!extension) {
    throw unsupportedTypeError(kind);
  }

  const maxBytes = kind === "photo" ? PHOTO_MAX_BYTES : SONG_MAX_BYTES;
  if (file.size > maxBytes) {
    throw new Error(
      kind === "photo"
        ? "Please choose a photo under 8 MB."
        : "Please choose a song under 10 MB.",
    );
  }
  return extension;
}

/**
 * Build an invite-media object path.
 *
 * Migration 0001's write policy decides ownership from segment one, so it
 * must be the authenticated user's id. Segment two is the invite id when a
 * row exists (the shape migration 0003's published-read policy matches);
 * signed-in browser drafts use draft-<key> until an invite row exists.
 */
export function buildInviteMediaPath(options: UploadInviteMediaOptions) {
  const extension = validateInviteMediaFile(options.file, options.kind);
  const userId = cleanSegment(options.userId, "user id");
  const scope = scopeSegment(options);
  const filename = `${options.kind}-${cleanFileKey(options.fileKey)}.${extension}`;
  return `${userId}/${scope}/${filename}`;
}

/** Storage errors arrive in several shapes; surface a real Error either way. */
function rethrowStorageError(error: unknown, fallback: string): never {
  if (error instanceof Error) throw error;
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    throw new Error(error.message);
  }
  throw new Error(fallback);
}

/** Media families the magic-byte check can identify. */
export type MediaSniffFamily =
  "jpeg" | "png" | "webp" | "gif" | "avif" | "mp3" | "m4a" | "wav" | "ogg";

function asciiAt(bytes: Uint8Array, offset: number, text: string) {
  if (bytes.length < offset + text.length) return false;
  for (let i = 0; i < text.length; i++) {
    if (bytes[offset + i] !== text.charCodeAt(i)) return false;
  }
  return true;
}

/**
 * Identify a media file from its first bytes — the file signature, not
 * the browser-reported type, which is only the file name's claim and
 * can be spoofed by renaming. Returns the matched family or null when
 * the bytes match nothing we accept.
 *
 * SVG deliberately has no signature here: it is XML text (scriptable),
 * so it sniffs as null and stays rejected even when a file claims to
 * be a PNG. The RIFF container is shared by WebP images and WAVE
 * audio, and the ISO-BMFF `ftyp` box by AVIF images and M4A audio —
 * the form/brand bytes decide, not the container.
 */
export function sniffMediaKind(bytes: Uint8Array): MediaSniffFamily | null {
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return "png";
  }
  // JPEG: FF D8 FF
  if (
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  ) {
    return "jpeg";
  }
  // GIF: "GIF8" (87a and 89a share the prefix)
  if (asciiAt(bytes, 0, "GIF8")) return "gif";
  // RIFF container: the form type at bytes 8–11 decides image vs audio.
  if (asciiAt(bytes, 0, "RIFF")) {
    if (asciiAt(bytes, 8, "WEBP")) return "webp";
    if (asciiAt(bytes, 8, "WAVE")) return "wav";
    return null;
  }
  // OGG container: "OggS" capture pattern.
  if (asciiAt(bytes, 0, "OggS")) return "ogg";
  // ISO-BMFF: "ftyp" box at bytes 4–7; the major brand at 8–11 decides.
  if (asciiAt(bytes, 4, "ftyp")) {
    if (asciiAt(bytes, 8, "avif") || asciiAt(bytes, 8, "avis")) {
      return "avif";
    }
    return "m4a";
  }
  // MP3: an ID3 tag, or an MPEG audio frame sync (FF followed by 111xxxxx).
  if (asciiAt(bytes, 0, "ID3")) return "mp3";
  const second = bytes[1];
  if (
    bytes.length >= 2 &&
    bytes[0] === 0xff &&
    second !== undefined &&
    (second & 0xe0) === 0xe0
  ) {
    return "mp3";
  }
  return null;
}

/** The signature family each allowlisted declared type must match. */
const SNIFF_FAMILY_BY_MIME: Record<string, MediaSniffFamily> = {
  "image/jpeg": "jpeg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
  "audio/mpeg": "mp3",
  "audio/mp4": "m4a",
  "audio/wav": "wav",
  "audio/x-wav": "wav",
  "audio/ogg": "ogg",
};

/** How many head bytes the signature check reads — signatures fit in 12. */
const MEDIA_SNIFF_BYTES = 32;

/**
 * Read a blob's first bytes via FileReader — the one head-reading API
 * every browser (and the jsdom test environment) provides; the newer
 * Blob.arrayBuffer() is not universal enough to rely on here.
 */
function readHeadBytes(blob: Blob, count: number): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(new Uint8Array(reader.result));
      } else {
        reject(new Error("The file could not be read."));
      }
    };
    reader.onerror = () =>
      reject(reader.error ?? new Error("The file could not be read."));
    reader.readAsArrayBuffer(blob.slice(0, count));
  });
}

/**
 * Content check behind the declared-type allowlist: read the file's
 * head bytes and require the sniffed family to equal the family the
 * declared MIME type claims. A renamed file (PNG bytes in song.mp3,
 * a text file in photo.jpg, an SVG claiming to be a PNG) contradicts
 * its declaration and is rejected with the same unsupported-type error
 * the allowlist uses, before anything reaches storage.
 */
export async function verifyInviteMediaContent(
  file: File,
  kind: InviteMediaKind,
) {
  const expected = SNIFF_FAMILY_BY_MIME[file.type];
  if (!expected) throw unsupportedTypeError(kind);
  const head = await readHeadBytes(file, MEDIA_SNIFF_BYTES);
  if (sniffMediaKind(head) !== expected) throw unsupportedTypeError(kind);
}

/**
 * Upload one editor file and return its storage path — never a blob URL.
 * A blob URL only identifies memory in the browser session that created
 * it, so saving one in an invitation makes the media invisible to guests.
 */
export async function uploadInviteMedia(
  client: MediaStorageClient,
  options: UploadInviteMediaOptions,
) {
  const path = buildInviteMediaPath(options);
  await verifyInviteMediaContent(options.file, options.kind);
  const { error } = await client.storage
    .from(INVITE_MEDIA_BUCKET)
    .upload(path, options.file, {
      contentType: options.file.type,
      upsert: false,
    });

  if (error) rethrowStorageError(error, "The file could not be uploaded.");
  return path;
}

export type CopyDraftMediaOptions = {
  userId: string;
  draftKey: string;
  inviteId: string;
  config: InviteConfig;
};

/**
 * Gap A: media uploaded while a localStorage draft has no invite row
 * lives under <userId>/draft-<key>/, but migration 0003's published-read
 * policy only matches objects whose second segment is an invite id —
 * draft-prefixed media would become unreadable to guests the moment
 * 0003 is applied. At publish, copy every draft-scoped object into
 * <userId>/<inviteId>/ and return a config whose media paths point at
 * the copies. Values that are already invite-scoped, legacy (blob:,
 * remote, app-relative) or another user's are left untouched, each
 * object is copied at most once, and a failed copy throws so the
 * publish flow can show the error instead of saving a config whose
 * media silently points at the draft folder.
 */
export async function copyDraftMediaToInvite(
  client: MediaStorageClient,
  options: CopyDraftMediaOptions,
): Promise<InviteConfig> {
  const userId = cleanSegment(options.userId, "user id");
  // Same draft-segment normalisation scopeSegment applies at upload.
  const rawDraftKey = cleanSegment(options.draftKey, "draft key");
  const draftSegment = rawDraftKey.startsWith("draft-")
    ? rawDraftKey
    : `draft-${rawDraftKey}`;
  const inviteSegment = cleanSegment(options.inviteId, "invite id");
  const draftPrefix = `${userId}/${draftSegment}/`;
  const invitePrefix = `${userId}/${inviteSegment}/`;

  const rewrite = (value: string | undefined): string | undefined => {
    if (!value || !isStoredMediaPath(value)) return value;
    if (!value.startsWith(draftPrefix)) return value;
    return `${invitePrefix}${value.slice(draftPrefix.length)}`;
  };

  const { config } = options;
  const copies = new Map<string, string>();
  const collect = (value: string | undefined) => {
    const next = rewrite(value);
    if (value && next && next !== value) copies.set(value, next);
  };
  for (const image of config.gallery) collect(image.url);
  collect(config.music?.url);

  if (copies.size === 0) return config;

  const bucket = client.storage.from(INVITE_MEDIA_BUCKET);
  for (const [fromPath, toPath] of copies) {
    const { error } = await bucket.copy(fromPath, toPath);
    if (error) {
      rethrowStorageError(error, "A photo or song could not be copied.");
    }
  }

  return {
    ...config,
    gallery: config.gallery.map((image) => {
      const url = rewrite(image.url);
      return url && url !== image.url ? { ...image, url } : image;
    }),
    ...(config.music
      ? {
          music: {
            ...config.music,
            url: rewrite(config.music.url) ?? config.music.url,
          },
        }
      : {}),
  };
}

/** True only for the path shape uploadInviteMedia stores in invite config. */
export function isStoredMediaPath(value: string | undefined | null) {
  if (!value || value.startsWith("/")) return false;
  if (/^[A-Za-z][A-Za-z0-9+.-]*:/.test(value)) return false;
  const segments = value.split("/");
  if (segments.length < 3 || segments.some((segment) => !segment)) {
    return false;
  }
  const extension = segments.at(-1)?.split(".").at(-1)?.toLowerCase();
  return Boolean(extension && STORED_EXTENSIONS.has(extension));
}

/**
 * Resolve a config media value for display.
 *
 * Legacy values (blob:, data:, absolute URLs and app-relative assets)
 * pass through unchanged. Stored paths use Supabase's public URL for the
 * bucket's current public configuration. Migration 0003 makes the bucket
 * private; after the owner applies it, guest rendering for private
 * objects needs a signed-URL flow rather than this public URL — see the
 * Stage B/C evidence note rather than treating getPublicUrl as magic.
 */
export function resolveMediaUrl(
  value: string | undefined | null,
  client?: MediaStorageClient,
) {
  if (!value || !isStoredMediaPath(value)) return value ?? undefined;
  if (client) {
    return client.storage.from(INVITE_MEDIA_BUCKET).getPublicUrl(value).data
      .publicUrl;
  }

  const base = import.meta.env["VITE_SUPABASE_URL"] as string | undefined;
  if (!base) return value;
  const encodedPath = value.split("/").map(encodeURIComponent).join("/");
  return `${base.replace(/\/$/, "")}/storage/v1/object/public/${INVITE_MEDIA_BUCKET}/${encodedPath}`;
}
