import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Handler-level tests for loadPublishedInviteMediaUrlMap (Round 3).
//
// Round 2 built the Gap-B server function: slug in, signed-URL map out,
// fail-soft to an empty map so the guest page falls back to public URLs.
// Round 3 makes the failures VISIBLE: when signing comes back short for
// a published invite, the handler must emit one server-side diagnostic
// (invite id, failed count, file names only) — because after migration
// 0003 the public-URL fallback is dead and a silent shortfall would be
// undiagnosable broken guest media.
//
// createServerFn is mocked down to the bare handler so the test drives
// the REAL handler logic; the Supabase server client is a controllable
// fake in the house pattern (see webhook-handler.test.ts).

const RING = "user-1/invite-2/photo-ring.jpg";
const SONG = "user-1/invite-2/song-custom.mp3";

const mockState = vi.hoisted(() => ({
  inviteRow: null as Record<string, unknown> | null,
  createSignedUrls: vi.fn(),
}));

vi.mock("@tanstack/react-start", () => ({
  createServerFn: () => ({
    inputValidator: () => ({
      handler: (handlerFn: unknown) => handlerFn,
    }),
  }),
}));

vi.mock("@/lib/supabase", () => ({ supabase: {} }));

vi.mock("@/lib/supabase-server", () => ({
  supabaseServer: {
    from: () => ({
      select: () => ({
        eq: () => ({
          eq: () => ({
            maybeSingle: async () => ({
              data: mockState.inviteRow,
              error: null,
            }),
          }),
        }),
      }),
    }),
    storage: {
      from: () => ({ createSignedUrls: mockState.createSignedUrls }),
    },
  },
}));

import { loadPublishedInviteMediaUrlMap } from "@/lib/media-signing";

type Handler = (input: { data: string }) => Promise<Record<string, string>>;
const handler = loadPublishedInviteMediaUrlMap as unknown as Handler;

function publishedRowWithMedia() {
  return {
    id: "invite-2",
    user_id: "user-1",
    slug: "asha-ravi-x1",
    theme_id: "dubai-silk",
    occasion: "wedding",
    status: "published",
    event_date: null,
    published_at: "2026-10-01T00:00:00Z",
    created_at: "2026-09-01T00:00:00Z",
    updated_at: "2026-10-01T00:00:00Z",
    config: {
      gallery: [
        { slot: "ring", url: RING, alt: "", width: 1, height: 1 },
        {
          slot: "draft",
          url: "user-1/draft-abc/photo-draft.jpg",
          alt: "",
          width: 1,
          height: 1,
        },
        {
          slot: "other",
          url: "user-1/invite-9/photo-other.jpg",
          alt: "",
          width: 1,
          height: 1,
        },
        {
          slot: "remote",
          url: "https://cdn.example.test/couple.jpg",
          alt: "",
          width: 1,
          height: 1,
        },
      ],
      music: { url: SONG },
    },
  };
}

function signedOk(paths: string[]) {
  return {
    data: paths.map((path) => ({
      path,
      signedUrl: `https://project.supabase.co/storage/v1/object/sign/invite-media/${path}?token=tok`,
      error: null,
    })),
    error: null,
  };
}

describe("loadPublishedInviteMediaUrlMap diagnostics", () => {
  let consoleError: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    mockState.inviteRow = publishedRowWithMedia();
    mockState.createSignedUrls = vi.fn(async (paths: string[]) =>
      signedOk(paths),
    );
    consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("signs only the invite's own stored paths and stays silent on success", async () => {
    const map = await handler({ data: "asha-ravi-x1" });

    // Draft-scoped, other-invite and external values in the same config
    // are never put to the signing call.
    expect(mockState.createSignedUrls).toHaveBeenCalledTimes(1);
    expect(mockState.createSignedUrls).toHaveBeenCalledWith(
      [RING, SONG],
      expect.any(Number),
    );
    expect(Object.keys(map).sort()).toEqual([RING, SONG].sort());
    expect(consoleError).not.toHaveBeenCalled();
  });

  it("returns an empty map AND logs one diagnostic when signing fails outright", async () => {
    mockState.createSignedUrls = vi.fn(async () => ({
      data: null,
      error: new Error("storage unavailable"),
    }));

    const map = await handler({ data: "asha-ravi-x1" });

    expect(map).toEqual({});
    expect(consoleError).toHaveBeenCalledTimes(1);
    const [, payload] = consoleError.mock.calls[0] as [
      string,
      Record<string, unknown>,
    ];
    expect(payload["inviteId"]).toBe("invite-2");
    expect(payload["failedCount"]).toBe(2);
    expect(payload["failedFiles"]).toEqual([
      "photo-ring.jpg",
      "song-custom.mp3",
    ]);
    // The diagnostic never carries a signed URL or the owner segment.
    const logged = JSON.stringify(consoleError.mock.calls);
    expect(logged).not.toContain("token");
    expect(logged).not.toContain("user-1");
  });

  it("logs only the missing paths when signing partially succeeds", async () => {
    mockState.createSignedUrls = vi.fn(async () => ({
      data: [
        {
          path: RING,
          signedUrl: "https://signed.example/ring",
          error: null,
        },
        { path: SONG, signedUrl: null, error: "not_found" },
      ],
      error: null,
    }));

    const map = await handler({ data: "asha-ravi-x1" });

    expect(map).toEqual({ [RING]: "https://signed.example/ring" });
    expect(consoleError).toHaveBeenCalledTimes(1);
    const [, payload] = consoleError.mock.calls[0] as [
      string,
      Record<string, unknown>,
    ];
    expect(payload["failedCount"]).toBe(1);
    expect(payload["failedFiles"]).toEqual(["song-custom.mp3"]);
  });

  it("stays silent and signs nothing when the invite row is not found", async () => {
    mockState.inviteRow = null;

    const map = await handler({ data: "no-such-slug" });

    expect(map).toEqual({});
    expect(mockState.createSignedUrls).not.toHaveBeenCalled();
    expect(consoleError).not.toHaveBeenCalled();
  });

  it("stays silent when the published invite has no stored media", async () => {
    mockState.inviteRow = {
      ...publishedRowWithMedia(),
      config: { gallery: [], music: undefined },
    };

    const map = await handler({ data: "asha-ravi-x1" });

    expect(map).toEqual({});
    expect(mockState.createSignedUrls).not.toHaveBeenCalled();
    expect(consoleError).not.toHaveBeenCalled();
  });
});
