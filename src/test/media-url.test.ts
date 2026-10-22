import { afterEach, describe, expect, it, vi } from "vitest";
import {
  MEDIA_SIGNED_URL_TTL_SECONDS,
  classifyMediaValue,
  collectInviteMediaPaths,
  pathsBelongingToInvite,
  reportMediaSigningShortfall,
  resolveWithMediaUrlMap,
  signInviteMediaPaths,
  type MediaSigningClient,
} from "@/lib/media-url";
import type { MediaStorageClient } from "@/lib/media-upload";
import type { InviteConfig } from "@/lib/invites-api";

const RING = "user-1/invite-2/photo-ring.jpg";
const FOREVER = "user-1/invite-2/photo-forever.png";
const SONG = "user-1/invite-2/song-custom.mp3";

function configWith(overrides: Partial<InviteConfig>): InviteConfig {
  return {
    occasion: "wedding",
    hosts: { mode: "couple", person1: "Asha", person2: "Ravi" },
    event: {
      typeLabel: "Wedding Ceremony",
      startIso: "",
      dateText: "",
      dayText: "",
      timeText: "",
      venueName: "",
    },
    gallery: [],
    meta: { title: "", description: "" },
    ...overrides,
  };
}

function fakeSigningClient(createSignedUrls: ReturnType<typeof vi.fn>) {
  const from = vi.fn(() => ({ createSignedUrls }));
  return {
    client: { storage: { from } } as unknown as MediaSigningClient,
    from,
  };
}

function fakeBrowserClient() {
  const getPublicUrl = vi.fn((path: string) => ({
    data: {
      publicUrl: `https://project.supabase.co/storage/v1/object/public/invite-media/${path}`,
    },
  }));
  const from = vi.fn(() => ({ getPublicUrl }));
  return {
    client: { storage: { from } } as unknown as MediaStorageClient,
    getPublicUrl,
  };
}

describe("collectInviteMediaPaths", () => {
  it("collects stored paths from gallery and music, deduped", () => {
    const config = configWith({
      gallery: [
        { slot: "ring", url: RING, alt: "", width: 1, height: 1 },
        { slot: "forever", url: FOREVER, alt: "", width: 1, height: 1 },
        { slot: "childhood", url: RING, alt: "", width: 1, height: 1 },
      ],
      music: { url: SONG },
    });

    expect(collectInviteMediaPaths(config)).toEqual([RING, FOREVER, SONG]);
  });

  it("skips legacy blob, remote and app-relative values", () => {
    const config = configWith({
      gallery: [
        {
          slot: "ring",
          url: "blob:https://example.test/123",
          alt: "",
          width: 1,
          height: 1,
        },
        {
          slot: "forever",
          url: "https://cdn.example.test/photo.jpg",
          alt: "",
          width: 1,
          height: 1,
        },
        {
          slot: "childhood",
          url: "/demo/sample-couple/together.jpg",
          alt: "",
          width: 1,
          height: 1,
        },
      ],
      music: { url: "/themes/dubai-silk/track.mp3" },
    });

    expect(collectInviteMediaPaths(config)).toEqual([]);
  });

  it("returns an empty list for a media-free config", () => {
    expect(collectInviteMediaPaths(configWith({}))).toEqual([]);
  });
});

describe("pathsBelongingToInvite", () => {
  it("keeps only paths whose second segment is the invite id", () => {
    const paths = [
      RING,
      SONG,
      "user-1/invite-9/photo-other.jpg",
      "user-1/draft-3/photo-draft.jpg",
      "user-2/invite-2/photo-same-invite-id.jpg",
    ];

    // "user-2/invite-2/..." shares the invite id segment but a different
    // owner segment; publish only ever writes <owner>/<inviteId>/ for
    // the invite's owner, so segment two is the policy join key 0003
    // uses and the filter this design signs by.
    expect(pathsBelongingToInvite(paths, "invite-2")).toEqual([
      RING,
      SONG,
      "user-2/invite-2/photo-same-invite-id.jpg",
    ]);
  });

  it("drops draft-prefixed paths — drafts are never signed for guests", () => {
    expect(
      pathsBelongingToInvite(["user-1/draft-3/photo-draft.jpg"], "invite-2"),
    ).toEqual([]);
  });
});

describe("signInviteMediaPaths", () => {
  it("requests signing for exactly the given paths, once, with the TTL", async () => {
    const createSignedUrls = vi.fn(async (paths: string[]) => ({
      data: paths.map((path) => ({
        path,
        signedUrl: `https://project.supabase.co/storage/v1/object/sign/invite-media/${path}?token=tok`,
        error: null,
      })),
      error: null,
    }));
    const { client, from } = fakeSigningClient(createSignedUrls);

    const map = await signInviteMediaPaths(client, [RING, SONG]);

    expect(from).toHaveBeenCalledWith("invite-media");
    expect(createSignedUrls).toHaveBeenCalledTimes(1);
    expect(createSignedUrls).toHaveBeenCalledWith(
      [RING, SONG],
      MEDIA_SIGNED_URL_TTL_SECONDS,
    );
    expect(map).toEqual({
      [RING]: `https://project.supabase.co/storage/v1/object/sign/invite-media/${RING}?token=tok`,
      [SONG]: `https://project.supabase.co/storage/v1/object/sign/invite-media/${SONG}?token=tok`,
    });
  });

  it("makes no storage call at all when there is nothing to sign", async () => {
    const createSignedUrls = vi.fn();
    const { client } = fakeSigningClient(createSignedUrls);

    await expect(signInviteMediaPaths(client, [])).resolves.toEqual({});
    expect(createSignedUrls).not.toHaveBeenCalled();
  });

  it("omits entries that errored or came back without a signed URL", async () => {
    const createSignedUrls = vi.fn(async () => ({
      data: [
        {
          path: RING,
          signedUrl: "https://signed.example/ring",
          error: null,
        },
        { path: FOREVER, signedUrl: null, error: "not_found" },
        { path: SONG, signedUrl: null, error: null },
      ],
      error: null,
    }));
    const { client } = fakeSigningClient(createSignedUrls);

    await expect(
      signInviteMediaPaths(client, [RING, FOREVER, SONG]),
    ).resolves.toEqual({ [RING]: "https://signed.example/ring" });
  });

  it("ignores signed results for paths that were never requested", async () => {
    const createSignedUrls = vi.fn(async () => ({
      data: [
        { path: RING, signedUrl: "https://signed.example/ring", error: null },
        {
          path: "user-9/invite-9/photo-secret.jpg",
          signedUrl: "https://signed.example/secret",
          error: null,
        },
      ],
      error: null,
    }));
    const { client } = fakeSigningClient(createSignedUrls);

    await expect(signInviteMediaPaths(client, [RING])).resolves.toEqual({
      [RING]: "https://signed.example/ring",
    });
  });

  it("fails soft to an empty map when the signing request errors", async () => {
    const failing = vi.fn(async () => ({
      data: null,
      error: new Error("storage unavailable"),
    }));
    const { client } = fakeSigningClient(failing);
    await expect(signInviteMediaPaths(client, [RING])).resolves.toEqual({});

    const throwing = vi.fn(async () => {
      throw new Error("network down");
    });
    const { client: client2 } = fakeSigningClient(throwing);
    await expect(signInviteMediaPaths(client2, [RING])).resolves.toEqual({});
  });

  it("uses a sane signed-URL lifetime: at least 10 minutes, at most a day", () => {
    expect(MEDIA_SIGNED_URL_TTL_SECONDS).toBeGreaterThanOrEqual(600);
    expect(MEDIA_SIGNED_URL_TTL_SECONDS).toBeLessThanOrEqual(86_400);
  });
});

describe("resolveWithMediaUrlMap", () => {
  it("uses the signed URL when the map has the path", () => {
    const { client, getPublicUrl } = fakeBrowserClient();
    const map = { [RING]: "https://signed.example/ring" };

    expect(resolveWithMediaUrlMap(RING, map, client)).toBe(
      "https://signed.example/ring",
    );
    expect(getPublicUrl).not.toHaveBeenCalled();
  });

  it("falls back to the public URL when the map lacks the path", () => {
    const { client } = fakeBrowserClient();

    expect(resolveWithMediaUrlMap(RING, {}, client)).toBe(
      `https://project.supabase.co/storage/v1/object/public/invite-media/${RING}`,
    );
  });

  it("behaves exactly like the plain resolver when no map is supplied", () => {
    const { client } = fakeBrowserClient();

    expect(resolveWithMediaUrlMap(RING, undefined, client)).toBe(
      `https://project.supabase.co/storage/v1/object/public/invite-media/${RING}`,
    );
    expect(
      resolveWithMediaUrlMap(undefined, undefined, client),
    ).toBeUndefined();
  });

  it("passes legacy values through even when a map is supplied", () => {
    const { client } = fakeBrowserClient();
    const map = { [RING]: "https://signed.example/ring" };

    expect(
      resolveWithMediaUrlMap("blob:https://example.test/123", map, client),
    ).toBe("blob:https://example.test/123");
    expect(resolveWithMediaUrlMap("/demo/sample.jpg", map, client)).toBe(
      "/demo/sample.jpg",
    );
  });

  it("passes an external https URL through untouched — never signed, never public-URL rewritten", () => {
    const { client, getPublicUrl } = fakeBrowserClient();
    const map = { [RING]: "https://signed.example/ring" };
    const external = "https://cdn.example.test/couple-photo.jpg";

    expect(resolveWithMediaUrlMap(external, map, client)).toBe(external);
    expect(getPublicUrl).not.toHaveBeenCalled();
  });
});

describe("classifyMediaValue", () => {
  // Round 3: the media-kind separation the signing design depends on
  // was implicit in isStoredMediaPath. classifyMediaValue names it:
  // ONLY "storage-path" values are ever signed or map-resolved; every
  // other kind passes through byte-for-byte.
  it("classifies absolute external URLs as external — never storage paths", () => {
    expect(classifyMediaValue("https://cdn.example.test/photo.jpg")).toBe(
      "external-url",
    );
    expect(classifyMediaValue("http://cdn.example.test/song.mp3")).toBe(
      "external-url",
    );
  });

  it("classifies blob: and data: values as session URLs", () => {
    expect(classifyMediaValue("blob:https://example.test/123")).toBe(
      "session-url",
    );
    expect(classifyMediaValue("data:image/png;base64,AAAA")).toBe(
      "session-url",
    );
  });

  it("classifies stored object paths as storage paths — including draft-scoped ones", () => {
    expect(classifyMediaValue(RING)).toBe("storage-path");
    // Classification is about KIND, not ownership: a draft path is a
    // storage path too. Ownership is pathsBelongingToInvite's job —
    // it is what keeps draft paths out of the signing set.
    expect(classifyMediaValue("user-1/draft-3/photo-draft.jpg")).toBe(
      "storage-path",
    );
  });

  it("classifies app-relative assets as app assets", () => {
    expect(classifyMediaValue("/demo/sample-couple/together.jpg")).toBe(
      "app-asset",
    );
    expect(classifyMediaValue("/themes/dubai-silk/track.mp3")).toBe(
      "app-asset",
    );
  });

  it("classifies missing values as empty", () => {
    expect(classifyMediaValue(undefined)).toBe("empty");
    expect(classifyMediaValue(null)).toBe("empty");
    expect(classifyMediaValue("")).toBe("empty");
  });
});

describe("reportMediaSigningShortfall", () => {
  // Round 3: before this, every signing failure collapsed silently
  // into the public-URL fallback. Pre-0003 that fallback works, so the
  // silence was invisible; post-0003 the fallback URL is dead and the
  // failure MUST be diagnosable from production logs. The reporter is
  // the server function's one place to say so — once per batch, with
  // the invite id, the failed count and file names only: never signed
  // URLs (they carry tokens) and never full storage paths (they carry
  // the owner's user id segment).
  afterEach(() => {
    vi.restoreAllMocks();
  });

  function spyOnConsoleError() {
    return vi.spyOn(console, "error").mockImplementation(() => {});
  }

  it("stays silent when every requested path was signed", () => {
    const error = spyOnConsoleError();
    const map = {
      [RING]: "https://signed.example/ring",
      [SONG]: "https://signed.example/song",
    };

    expect(reportMediaSigningShortfall("invite-2", [RING, SONG], map)).toEqual(
      [],
    );
    expect(error).not.toHaveBeenCalled();
  });

  it("stays silent for an empty request set", () => {
    const error = spyOnConsoleError();

    expect(reportMediaSigningShortfall("invite-2", [], {})).toEqual([]);
    expect(error).not.toHaveBeenCalled();
  });

  it("logs a partial shortfall once, with invite id, count and file names only", () => {
    const error = spyOnConsoleError();
    const map = { [RING]: "https://signed.example/ring?token=sekret" };

    const failed = reportMediaSigningShortfall(
      "invite-2",
      [RING, FOREVER, SONG],
      map,
    );

    expect(failed).toEqual([FOREVER, SONG]);
    expect(error).toHaveBeenCalledTimes(1);
    const [message, payload] = error.mock.calls[0] as [
      string,
      Record<string, unknown>,
    ];
    expect(typeof message).toBe("string");
    expect(payload["inviteId"]).toBe("invite-2");
    expect(payload["failedCount"]).toBe(2);
    expect(payload["failedFiles"]).toEqual([
      "photo-forever.png",
      "song-custom.mp3",
    ]);
    // Nothing sensitive rides along: no owner segment from the full
    // paths, no signed URL, no token.
    const logged = JSON.stringify(error.mock.calls);
    expect(logged).not.toContain("user-1");
    expect(logged).not.toContain("signed.example");
    expect(logged).not.toContain("sekret");
  });

  it("logs a total shortfall (empty map) once for the whole batch", () => {
    const error = spyOnConsoleError();

    const failed = reportMediaSigningShortfall("invite-2", [RING, SONG], {});

    expect(failed).toEqual([RING, SONG]);
    expect(error).toHaveBeenCalledTimes(1);
    const [, payload] = error.mock.calls[0] as [
      string,
      Record<string, unknown>,
    ];
    expect(payload["failedCount"]).toBe(2);
  });
});
