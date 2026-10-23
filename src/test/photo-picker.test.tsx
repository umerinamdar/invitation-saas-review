import { useState } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { GalleryImage } from "@/invites/types";

// The picker imports the browser Supabase client, which throws at module
// load without env vars. It is never exercised here: uploads are mocked
// at the media-upload boundary, the same seam media-upload.test.ts uses.
vi.mock("@/lib/supabase", () => ({ supabase: {} }));

const hoisted = vi.hoisted(() => ({
  calls: [] as { resolve: (path: string) => void }[],
}));

vi.mock("@/lib/media-upload", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/media-upload")>();
  return {
    ...actual,
    uploadInviteMedia: vi.fn(
      () =>
        new Promise<string>((resolve) => {
          hoisted.calls.push({ resolve });
        }),
    ),
    resolveMediaUrl: (value: string | undefined) => value,
  };
});

import { PhotoPicker } from "@/components/editor/photo-picker";

// jsdom never loads images; stand in one that "loads" immediately so
// naturalSize() can resolve with fixed dimensions.
class FakeImage {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  naturalWidth = 800;
  naturalHeight = 600;
  _src = "";
  get src() {
    return this._src;
  }
  set src(value: string) {
    this._src = value;
    queueMicrotask(() => this.onload?.());
  }
}

function Harness() {
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  return (
    <>
      <PhotoPicker
        gallery={gallery}
        onChange={setGallery}
        uploadScope={{ userId: "user-1", inviteId: "invite-1" }}
      />
      <output data-testid="gallery">
        {gallery.map((g) => `${g.slot}:${g.url}`).join(" ")}
      </output>
    </>
  );
}

function fileInputs(container: HTMLElement) {
  return container.querySelectorAll<HTMLInputElement>('input[type="file"]');
}

function pickFile(container: HTMLElement, index: number, name: string) {
  const input = fileInputs(container)[index];
  if (!input) throw new Error(`no file input at index ${index}`);
  const file = new File(["photo"], name, { type: "image/png" });
  fireEvent.change(input, { target: { files: [file] } });
}

function resolveUpload(index: number, path: string) {
  const call = hoisted.calls[index];
  if (!call) throw new Error(`upload ${index} never started`);
  call.resolve(path);
}

beforeEach(() => {
  hoisted.calls.length = 0;
  vi.stubGlobal("Image", FakeImage);
  URL.createObjectURL = vi.fn(() => "blob:preview");
  URL.revokeObjectURL = vi.fn(() => {});
});

describe("PhotoPicker uploads", () => {
  it("disables every slot's input while an upload is in flight", async () => {
    const { container } = render(<Harness />);

    pickFile(container, 0, "ring.png");
    await waitFor(() => expect(hoisted.calls).toHaveLength(1));

    for (const input of fileInputs(container)) {
      expect(input).toBeDisabled();
    }

    resolveUpload(0, "user-1/invite-1/photo-ring-fixed.png");
    await waitFor(() =>
      expect(screen.getByTestId("gallery")).toHaveTextContent(
        "ring:user-1/invite-1/photo-ring-fixed.png",
      ),
    );
    for (const input of fileInputs(container)) {
      expect(input).not.toBeDisabled();
    }
  });

  it("keeps both photos when two slots are picked in quick succession", async () => {
    const { container } = render(<Harness />);

    pickFile(container, 0, "ring.png");
    await waitFor(() => expect(hoisted.calls).toHaveLength(1));
    resolveUpload(0, "user-1/invite-1/photo-ring-fixed.png");
    await waitFor(() =>
      expect(screen.getByTestId("gallery")).toHaveTextContent("ring:"),
    );

    pickFile(container, 1, "childhood.png");
    await waitFor(() => expect(hoisted.calls).toHaveLength(2));
    resolveUpload(1, "user-1/invite-1/photo-childhood-fixed.png");

    await waitFor(() => {
      const text = screen.getByTestId("gallery").textContent ?? "";
      expect(text).toContain("ring:user-1/invite-1/photo-ring-fixed.png");
      expect(text).toContain(
        "childhood:user-1/invite-1/photo-childhood-fixed.png",
      );
    });
  });

  it("merges an upload completion into the latest gallery, not the captured one", async () => {
    const { container } = render(<Harness />);

    pickFile(container, 0, "ring.png");
    await waitFor(() => expect(hoisted.calls).toHaveLength(1));
    resolveUpload(0, "user-1/invite-1/photo-ring-fixed.png");
    await waitFor(() =>
      expect(screen.getByTestId("gallery")).toHaveTextContent("ring:"),
    );

    // Start the childhood upload, then remove the ring photo while it is
    // still in flight. The completion must not resurrect the ring photo
    // from the gallery it captured when the upload started.
    pickFile(container, 1, "childhood.png");
    await waitFor(() => expect(hoisted.calls).toHaveLength(2));
    fireEvent.click(
      screen.getByRole("button", { name: "Remove Image 1 photo" }),
    );
    expect(screen.getByTestId("gallery")).toHaveTextContent("");

    resolveUpload(1, "user-1/invite-1/photo-childhood-fixed.png");
    await waitFor(() => {
      const text = screen.getByTestId("gallery").textContent ?? "";
      expect(text).toContain(
        "childhood:user-1/invite-1/photo-childhood-fixed.png",
      );
      expect(text).not.toContain("ring:");
    });
  });
});

describe("PhotoPicker thumbnails with a signed media map (impl round 2, E-6)", () => {
  const stored: GalleryImage = {
    slot: "ring",
    url: "user-1/invite-1/ring.jpg",
    alt: "Ring ceremony",
    width: 800,
    height: 600,
  };

  it("renders the SIGNED url for a stored path when the map has one", () => {
    const { container } = render(
      <PhotoPicker
        gallery={[stored]}
        onChange={() => {}}
        uploadScope={{ userId: "user-1", inviteId: "invite-1" }}
        mediaUrlMap={{
          "user-1/invite-1/ring.jpg":
            "https://storage.example/signed/ring.jpg?token=abc",
        }}
      />,
    );
    const img = container.querySelector(".photo-thumb img");
    expect(img?.getAttribute("src")).toBe(
      "https://storage.example/signed/ring.jpg?token=abc",
    );
  });

  it("without a map, falls back to the plain resolver exactly as before", () => {
    const { container } = render(
      <PhotoPicker
        gallery={[stored]}
        onChange={() => {}}
        uploadScope={{ userId: "user-1", inviteId: "invite-1" }}
      />,
    );
    const img = container.querySelector(".photo-thumb img");
    // The test seam mocks resolveMediaUrl as identity.
    expect(img?.getAttribute("src")).toBe("user-1/invite-1/ring.jpg");
  });
});
