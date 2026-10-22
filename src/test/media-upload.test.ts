import { describe, expect, it, vi } from "vitest";
import {
  buildInviteMediaPath,
  copyDraftMediaToInvite,
  resolveMediaUrl,
  sniffMediaKind,
  uploadInviteMedia,
  type MediaStorageClient,
} from "@/lib/media-upload";
import type { InviteConfig } from "@/lib/invites-api";

/** Real signature bytes for each supported family — content fixtures,
 * not placeholder text, now that uploads verify magic bytes. */
const JPEG_BYTES = new Uint8Array([
  0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
]);
const PNG_BYTES = new Uint8Array([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
]);
const GIF_BYTES = new Uint8Array([
  0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x00, 0x00,
]);
const WEBP_BYTES = new Uint8Array([
  0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
]);
const WAV_BYTES = new Uint8Array([
  0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00, 0x57, 0x41, 0x56, 0x45,
]);
const MP3_ID3_BYTES = new Uint8Array([
  0x49, 0x44, 0x33, 0x03, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
]);
const MP3_FRAME_BYTES = new Uint8Array([0xff, 0xfb, 0x90, 0x64, 0x00, 0x00]);
const M4A_BYTES = new Uint8Array([
  0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70, 0x4d, 0x34, 0x41, 0x20,
]);
const AVIF_BYTES = new Uint8Array([
  0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70, 0x61, 0x76, 0x69, 0x66,
]);
const OGG_BYTES = new Uint8Array([
  0x4f, 0x67, 0x67, 0x53, 0x00, 0x02, 0x00, 0x00, 0x00, 0x00,
]);
const SVG_TEXT =
  '<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"></svg>';

function fakeClient(
  upload: ReturnType<typeof vi.fn>,
  publicUrl = "https://project.supabase.co/storage/v1/object/public/invite-media/",
) {
  const getPublicUrl = vi.fn((path: string) => ({
    data: { publicUrl: `${publicUrl}${path}` },
  }));
  const from = vi.fn(() => ({ upload, getPublicUrl }));
  return {
    client: { storage: { from } } as unknown as MediaStorageClient,
    from,
    getPublicUrl,
  };
}

describe("invite media uploads", () => {
  it("builds the policy-aligned invite path with the owner in segment one", () => {
    const file = new File(["photo"], "camera pic.jpg", {
      type: "image/jpeg",
    });

    expect(
      buildInviteMediaPath({
        userId: "user-1",
        inviteId: "invite-2",
        file,
        kind: "photo",
        fileKey: "ring-fixed",
      }),
    ).toBe("user-1/invite-2/photo-ring-fixed.jpg");
  });

  it("builds a stable draft-prefixed path for signed-in local drafts", () => {
    const file = new File(["song"], "track.mp3", { type: "audio/mpeg" });

    expect(
      buildInviteMediaPath({
        userId: "user-1",
        draftKey: "3",
        file,
        kind: "song",
        fileKey: "custom",
      }),
    ).toBe("user-1/draft-3/song-custom.mp3");
    expect(
      buildInviteMediaPath({
        userId: "user-1",
        draftKey: "draft-3",
        file,
        kind: "song",
        fileKey: "custom",
      }),
    ).toBe("user-1/draft-3/song-custom.mp3");
  });

  it("uploads to invite-media and returns only the storage path", async () => {
    const upload = vi.fn(async (path: string) => ({
      data: { path },
      error: null,
    }));
    const { client, from } = fakeClient(upload);
    const file = new File([PNG_BYTES], "image.png", { type: "image/png" });

    await expect(
      uploadInviteMedia(client, {
        userId: "user-1",
        inviteId: "invite-2",
        file,
        kind: "photo",
        fileKey: "forever-fixed",
      }),
    ).resolves.toBe("user-1/invite-2/photo-forever-fixed.png");
    expect(from).toHaveBeenCalledWith("invite-media");
    expect(upload).toHaveBeenCalledWith(
      "user-1/invite-2/photo-forever-fixed.png",
      file,
      { contentType: "image/png", upsert: false },
    );
  });

  it("rejects oversize files before contacting storage", async () => {
    const upload = vi.fn();
    const { client } = fakeClient(upload);
    const photo = new File([new Uint8Array(8 * 1024 * 1024 + 1)], "big.jpg", {
      type: "image/jpeg",
    });
    const song = new File([new Uint8Array(10 * 1024 * 1024 + 1)], "big.mp3", {
      type: "audio/mpeg",
    });

    await expect(
      uploadInviteMedia(client, {
        userId: "user-1",
        inviteId: "invite-2",
        file: photo,
        kind: "photo",
      }),
    ).rejects.toThrow("8 MB");
    await expect(
      uploadInviteMedia(client, {
        userId: "user-1",
        inviteId: "invite-2",
        file: song,
        kind: "song",
      }),
    ).rejects.toThrow("10 MB");
    expect(upload).not.toHaveBeenCalled();
  });

  it("rejects MIME types outside migration 0003's allowlist", async () => {
    const upload = vi.fn();
    const { client } = fakeClient(upload);

    await expect(
      uploadInviteMedia(client, {
        userId: "user-1",
        inviteId: "invite-2",
        file: new File(["svg"], "image.svg", { type: "image/svg+xml" }),
        kind: "photo",
      }),
    ).rejects.toThrow("isn't a supported photo type");
    await expect(
      uploadInviteMedia(client, {
        userId: "user-1",
        inviteId: "invite-2",
        file: new File(["webm"], "song.webm", { type: "audio/webm" }),
        kind: "song",
      }),
    ).rejects.toThrow("isn't a supported song type");
    expect(upload).not.toHaveBeenCalled();
  });

  it("propagates storage errors instead of returning a local URL", async () => {
    const upload = vi.fn(async () => ({
      data: null,
      error: new Error("storage denied"),
    }));
    const { client } = fakeClient(upload);

    await expect(
      uploadInviteMedia(client, {
        userId: "user-1",
        inviteId: "invite-2",
        file: new File([JPEG_BYTES], "photo.jpg", { type: "image/jpeg" }),
        kind: "photo",
      }),
    ).rejects.toThrow("storage denied");
  });
});

function fakeCopyClient(
  copy: ReturnType<typeof vi.fn> = vi.fn(
    async (fromPath: string, toPath: string) => ({
      data: { path: toPath },
      error: null,
    }),
  ),
) {
  const from = vi.fn(() => ({ copy }));
  return {
    client: { storage: { from } } as unknown as MediaStorageClient,
    from,
    copy,
  };
}

function draftConfigWith(media: Partial<InviteConfig>): InviteConfig {
  return {
    occasion: "wedding",
    hosts: { mode: "couple", person1: "Aisha", person2: "Omar" },
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
    ...media,
  };
}

describe("copyDraftMediaToInvite (Gap A)", () => {
  it("copies draft gallery + music objects into the invite scope and rewrites their paths", async () => {
    const { client, from, copy } = fakeCopyClient();
    const config = draftConfigWith({
      gallery: [
        {
          slot: "ring",
          url: "user-1/draft-3/photo-ring.jpg",
          alt: "Ring",
          width: 100,
          height: 100,
        },
      ],
      music: { url: "user-1/draft-3/song-custom.mp3" },
    });

    const result = await copyDraftMediaToInvite(client, {
      userId: "user-1",
      draftKey: "3",
      inviteId: "invite-9",
      config,
    });

    expect(from).toHaveBeenCalledWith("invite-media");
    expect(copy).toHaveBeenCalledTimes(2);
    expect(copy).toHaveBeenCalledWith(
      "user-1/draft-3/photo-ring.jpg",
      "user-1/invite-9/photo-ring.jpg",
    );
    expect(copy).toHaveBeenCalledWith(
      "user-1/draft-3/song-custom.mp3",
      "user-1/invite-9/song-custom.mp3",
    );
    expect(result.gallery[0]?.url).toBe("user-1/invite-9/photo-ring.jpg");
    expect(result.music?.url).toBe("user-1/invite-9/song-custom.mp3");
    // The caller's config object is not mutated.
    expect(config.gallery[0]?.url).toBe("user-1/draft-3/photo-ring.jpg");
    expect(config.music?.url).toBe("user-1/draft-3/song-custom.mp3");
  });

  it("accepts a draftKey that already carries the draft- prefix", async () => {
    const { client, copy } = fakeCopyClient();
    const config = draftConfigWith({
      music: { url: "user-1/draft-3/song-custom.mp3" },
    });

    const result = await copyDraftMediaToInvite(client, {
      userId: "user-1",
      draftKey: "draft-3",
      inviteId: "invite-9",
      config,
    });

    expect(copy).toHaveBeenCalledTimes(1);
    expect(result.music?.url).toBe("user-1/invite-9/song-custom.mp3");
  });

  it("leaves invite-scoped, legacy and remote values untouched and copies nothing", async () => {
    const { client, copy } = fakeCopyClient();
    const config = draftConfigWith({
      gallery: [
        {
          slot: "ring",
          url: "user-1/invite-9/photo-ring.jpg",
          alt: "Ring",
          width: 100,
          height: 100,
        },
        {
          slot: "forever",
          url: "blob:https://example.test/123",
          alt: "Legacy",
          width: 100,
          height: 100,
        },
      ],
      music: { url: "https://cdn.example.test/track.mp3" },
    });

    const result = await copyDraftMediaToInvite(client, {
      userId: "user-1",
      draftKey: "3",
      inviteId: "invite-9",
      config,
    });

    expect(copy).not.toHaveBeenCalled();
    expect(result).toBe(config);
  });

  it("ignores draft paths that belong to a different user", async () => {
    const { client, copy } = fakeCopyClient();
    const config = draftConfigWith({
      music: { url: "user-2/draft-3/song-custom.mp3" },
    });

    const result = await copyDraftMediaToInvite(client, {
      userId: "user-1",
      draftKey: "3",
      inviteId: "invite-9",
      config,
    });

    expect(copy).not.toHaveBeenCalled();
    expect(result).toBe(config);
  });

  it("copies an object referenced twice only once, and rewrites both references", async () => {
    const { client, copy } = fakeCopyClient();
    const shared = "user-1/draft-3/photo-shared.jpg";
    const config = draftConfigWith({
      gallery: [
        { slot: "ring", url: shared, alt: "One", width: 100, height: 100 },
        { slot: "forever", url: shared, alt: "Two", width: 100, height: 100 },
      ],
    });

    const result = await copyDraftMediaToInvite(client, {
      userId: "user-1",
      draftKey: "3",
      inviteId: "invite-9",
      config,
    });

    expect(copy).toHaveBeenCalledTimes(1);
    expect(result.gallery.map((image) => image.url)).toEqual([
      "user-1/invite-9/photo-shared.jpg",
      "user-1/invite-9/photo-shared.jpg",
    ]);
  });

  it("propagates storage copy failures instead of returning a broken config", async () => {
    const copy = vi.fn(async () => ({
      data: null,
      error: new Error("copy denied"),
    }));
    const { client } = fakeCopyClient(copy);
    const config = draftConfigWith({
      music: { url: "user-1/draft-3/song-custom.mp3" },
    });

    await expect(
      copyDraftMediaToInvite(client, {
        userId: "user-1",
        draftKey: "3",
        inviteId: "invite-9",
        config,
      }),
    ).rejects.toThrow("copy denied");
  });
});

describe("sniffMediaKind", () => {
  it("identifies each supported family from its signature bytes", () => {
    expect(sniffMediaKind(JPEG_BYTES)).toBe("jpeg");
    expect(sniffMediaKind(PNG_BYTES)).toBe("png");
    expect(sniffMediaKind(GIF_BYTES)).toBe("gif");
    expect(sniffMediaKind(AVIF_BYTES)).toBe("avif");
    expect(sniffMediaKind(MP3_ID3_BYTES)).toBe("mp3");
    expect(sniffMediaKind(MP3_FRAME_BYTES)).toBe("mp3");
    expect(sniffMediaKind(M4A_BYTES)).toBe("m4a");
    expect(sniffMediaKind(WAV_BYTES)).toBe("wav");
    expect(sniffMediaKind(OGG_BYTES)).toBe("ogg");
  });

  it("distinguishes WebP from WAV inside the shared RIFF container", () => {
    expect(sniffMediaKind(WEBP_BYTES)).toBe("webp");
    expect(sniffMediaKind(WAV_BYTES)).toBe("wav");
  });

  it("distinguishes AVIF from M4A inside the shared ftyp container", () => {
    expect(sniffMediaKind(AVIF_BYTES)).toBe("avif");
    expect(sniffMediaKind(M4A_BYTES)).toBe("m4a");
  });

  it("returns null for text, markup, empty and truncated content", () => {
    expect(sniffMediaKind(new TextEncoder().encode("just some text"))).toBe(
      null,
    );
    expect(sniffMediaKind(new TextEncoder().encode(SVG_TEXT))).toBe(null);
    expect(sniffMediaKind(new Uint8Array([]))).toBe(null);
    expect(sniffMediaKind(new Uint8Array([0xff]))).toBe(null);
    // A RIFF header with an unknown form type is not media we accept.
    expect(
      sniffMediaKind(
        new Uint8Array([
          0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00, 0x41, 0x56, 0x49,
          0x20,
        ]),
      ),
    ).toBe(null);
  });
});

describe("uploadInviteMedia content verification (magic bytes)", () => {
  function okClient() {
    const upload = vi.fn(async (path: string) => ({
      data: { path },
      error: null,
    }));
    const { client } = fakeClient(upload);
    return { client, upload };
  }

  it("accepts a real JPEG photo and returns the storage path", async () => {
    const { client, upload } = okClient();
    await expect(
      uploadInviteMedia(client, {
        userId: "user-1",
        inviteId: "invite-2",
        file: new File([JPEG_BYTES], "photo.jpg", { type: "image/jpeg" }),
        kind: "photo",
        fileKey: "real",
      }),
    ).resolves.toBe("user-1/invite-2/photo-real.jpg");
    expect(upload).toHaveBeenCalledTimes(1);
  });

  it("accepts real MP3, WAV, M4A and OGG songs and an AVIF photo", async () => {
    const { client } = okClient();
    const songs: [Uint8Array<ArrayBuffer>, string, string][] = [
      [MP3_ID3_BYTES, "track.mp3", "audio/mpeg"],
      [MP3_FRAME_BYTES, "track.mp3", "audio/mpeg"],
      [WAV_BYTES, "track.wav", "audio/wav"],
      [M4A_BYTES, "track.m4a", "audio/mp4"],
      [OGG_BYTES, "track.ogg", "audio/ogg"],
    ];
    for (const [bytes, name, type] of songs) {
      await expect(
        uploadInviteMedia(client, {
          userId: "user-1",
          inviteId: "invite-2",
          file: new File([bytes], name, { type }),
          kind: "song",
          fileKey: "real",
        }),
      ).resolves.toMatch(/^user-1\/invite-2\/song-real\./);
    }
    await expect(
      uploadInviteMedia(client, {
        userId: "user-1",
        inviteId: "invite-2",
        file: new File([AVIF_BYTES], "photo.avif", { type: "image/avif" }),
        kind: "photo",
        fileKey: "real",
      }),
    ).resolves.toBe("user-1/invite-2/photo-real.avif");
  });

  it("rejects PNG bytes declared as a song — a renamed photo is not audio", async () => {
    const { client, upload } = okClient();
    await expect(
      uploadInviteMedia(client, {
        userId: "user-1",
        inviteId: "invite-2",
        file: new File([PNG_BYTES], "song.mp3", { type: "audio/mpeg" }),
        kind: "song",
      }),
    ).rejects.toThrow("isn't a supported song type");
    expect(upload).not.toHaveBeenCalled();
  });

  it("rejects MP3 bytes declared as a photo", async () => {
    const { client, upload } = okClient();
    await expect(
      uploadInviteMedia(client, {
        userId: "user-1",
        inviteId: "invite-2",
        file: new File([MP3_ID3_BYTES], "photo.jpg", {
          type: "image/jpeg",
        }),
        kind: "photo",
      }),
    ).rejects.toThrow("isn't a supported photo type");
    expect(upload).not.toHaveBeenCalled();
  });

  it("rejects a WebP photo declared as PNG — the sniffed family must match the declared one", async () => {
    const { client, upload } = okClient();
    await expect(
      uploadInviteMedia(client, {
        userId: "user-1",
        inviteId: "invite-2",
        file: new File([WEBP_BYTES], "photo.png", { type: "image/png" }),
        kind: "photo",
      }),
    ).rejects.toThrow("isn't a supported photo type");
    expect(upload).not.toHaveBeenCalled();
  });

  it("rejects a text file renamed to .jpg", async () => {
    const { client, upload } = okClient();
    await expect(
      uploadInviteMedia(client, {
        userId: "user-1",
        inviteId: "invite-2",
        file: new File(["definitely not a photo"], "photo.jpg", {
          type: "image/jpeg",
        }),
        kind: "photo",
      }),
    ).rejects.toThrow("isn't a supported photo type");
    expect(upload).not.toHaveBeenCalled();
  });

  it("rejects SVG — declared as SVG, and disguised as a PNG", async () => {
    const { client, upload } = okClient();
    await expect(
      uploadInviteMedia(client, {
        userId: "user-1",
        inviteId: "invite-2",
        file: new File([SVG_TEXT], "image.svg", { type: "image/svg+xml" }),
        kind: "photo",
      }),
    ).rejects.toThrow("isn't a supported photo type");
    // SVG is XML text: it has no binary signature, so the magic-byte
    // check must refuse it even when the declared type claims PNG.
    await expect(
      uploadInviteMedia(client, {
        userId: "user-1",
        inviteId: "invite-2",
        file: new File([SVG_TEXT], "image.png", { type: "image/png" }),
        kind: "photo",
      }),
    ).rejects.toThrow("isn't a supported photo type");
    expect(upload).not.toHaveBeenCalled();
  });
});

describe("resolveMediaUrl", () => {
  it("passes legacy blob, remote and app-relative values through unchanged", () => {
    const { client } = fakeClient(vi.fn());

    expect(resolveMediaUrl("blob:https://example.test/123", client)).toBe(
      "blob:https://example.test/123",
    );
    expect(resolveMediaUrl("https://cdn.example.test/photo.jpg", client)).toBe(
      "https://cdn.example.test/photo.jpg",
    );
    expect(resolveMediaUrl("/demo/sample-couple/together.jpg", client)).toBe(
      "/demo/sample-couple/together.jpg",
    );
    expect(resolveMediaUrl(undefined, client)).toBeUndefined();
  });

  it("resolves stored invite-media paths through getPublicUrl", () => {
    const { client, from, getPublicUrl } = fakeClient(vi.fn());
    const path = "user-1/invite-2/photo-ring-fixed.jpg";

    expect(resolveMediaUrl(path, client)).toBe(
      `https://project.supabase.co/storage/v1/object/public/invite-media/${path}`,
    );
    expect(from).toHaveBeenCalledWith("invite-media");
    expect(getPublicUrl).toHaveBeenCalledWith(path);
  });
});
