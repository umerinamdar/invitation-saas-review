import { useEffect, useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import type { GalleryImage, GallerySlot } from "@/invites/types";
import { supabase } from "@/lib/supabase";
import {
  uploadInviteMedia,
  validateInviteMediaFile,
  type MediaUploadScope,
} from "@/lib/media-upload";
import { resolveWithMediaUrlMap, type MediaUrlMap } from "@/lib/media-url";

type Props = {
  gallery: GalleryImage[];
  onChange: (gallery: GalleryImage[]) => void;
  /** Authenticated owner + invite/draft scope required by storage policy. */
  uploadScope?: MediaUploadScope | undefined;
  /**
   * Impl round 2 (E-6): signed URLs for the owner's own media, built
   * by the editor (see invite-editor.tsx). Thumbnails resolve
   * through it so they keep working once the bucket is private
   * (migration 0003); without it they use the public URL, as before.
   */
  mediaUrlMap?: MediaUrlMap | undefined;
};

const SLOTS: {
  slot: GallerySlot;
  label: string;
  hint: string;
  defaultAlt: string;
}[] = [
  {
    slot: "ring",
    label: "Ring ceremony",
    hint: "Shown after the family names",
    defaultAlt: "Photo from the ring ceremony",
  },
  {
    slot: "childhood",
    label: "A photo of you two",
    hint: "Shown beside your line to guests",
    defaultAlt: "Photo of the couple",
  },
  {
    slot: "forever",
    label: "Together",
    hint: "Shown in the Always and Forever section",
    defaultAlt: "Photo of the couple together",
  },
];

function naturalSize(file: File) {
  return new Promise<{ width: number; height: number }>((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => resolve({ width: 1200, height: 1200 });
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Three optional photos, each dropped into a specific place in the
 * invitation. A selected file is uploaded to invite-media and the
 * invitation stores the returned storage path. The local object URL is
 * only an instant preview while that upload completes; it is never the
 * saved value, because it cannot be opened by guests or another session.
 */
export function PhotoPicker({
  gallery,
  onChange,
  uploadScope,
  mediaUrlMap,
}: Props) {
  const [error, setError] = useState("");
  const [uploadingSlot, setUploadingSlot] = useState<GallerySlot | null>(null);
  const [previews, setPreviews] = useState<
    Partial<Record<GallerySlot, string>>
  >({});
  const previewUrls = useRef<Set<string>>(new Set());
  // The latest gallery, mirrored for upload completions. An upload
  // resolves after awaits, by which time the gallery may have changed
  // through another control (an alt edit, a removal); the completion
  // must merge into that newest value, not the gallery captured when
  // this render — and the upload — started.
  const galleryRef = useRef(gallery);
  useEffect(() => {
    galleryRef.current = gallery;
  }, [gallery]);

  useEffect(
    () => () => {
      for (const url of previewUrls.current) URL.revokeObjectURL(url);
    },
    [],
  );

  function setPreview(slot: GallerySlot, url: string | undefined) {
    setPreviews((current) => {
      const next = { ...current };
      if (url) next[slot] = url;
      else delete next[slot];
      return next;
    });
  }

  async function upload(slot: GallerySlot, file: File | undefined) {
    if (!file) return;
    setError("");
    try {
      validateInviteMediaFile(file, "photo");
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "That photo can't be used.",
      );
      return;
    }
    if (!uploadScope) {
      setError(
        "Sign in before uploading photos, so they can be saved for your guests.",
      );
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    previewUrls.current.add(previewUrl);
    setPreview(slot, previewUrl);
    setUploadingSlot(slot);

    try {
      const { width, height } = await naturalSize(file);
      const path = await uploadInviteMedia(supabase, {
        ...uploadScope,
        file,
        kind: "photo",
        fileKey: `${slot}-${globalThis.crypto?.randomUUID?.() ?? Date.now()}`,
      });
      const latest = galleryRef.current;
      const previous = latest.find((g) => g.slot === slot);
      const defaultAlt =
        SLOTS.find((s) => s.slot === slot)?.defaultAlt ?? "Photo";
      onChange([
        ...latest.filter((g) => g.slot !== slot),
        { slot, url: path, alt: previous?.alt || defaultAlt, width, height },
      ]);
    } catch (cause) {
      previewUrls.current.delete(previewUrl);
      URL.revokeObjectURL(previewUrl);
      setPreview(slot, undefined);
      setError(
        cause instanceof Error
          ? cause.message
          : "That photo could not be uploaded.",
      );
    } finally {
      setUploadingSlot(null);
    }
  }

  function setAlt(slot: GallerySlot, alt: string) {
    onChange(
      gallery.map((g) =>
        g.slot === slot
          ? {
              ...g,
              alt:
                alt ||
                SLOTS.find((s) => s.slot === slot)?.defaultAlt ||
                "Photo",
            }
          : g,
      ),
    );
  }

  function remove(slot: GallerySlot) {
    const previewUrl = previews[slot];
    if (previewUrl) {
      previewUrls.current.delete(previewUrl);
      URL.revokeObjectURL(previewUrl);
      setPreview(slot, undefined);
    }
    onChange(gallery.filter((g) => g.slot !== slot));
  }

  function displayUrl(image: GalleryImage) {
    return (
      previews[image.slot] ??
      resolveWithMediaUrlMap(image.url, mediaUrlMap, supabase)
    );
  }

  return (
    <div className="photo-picker">
      {SLOTS.map(({ slot, label, hint }) => {
        const image = gallery.find((g) => g.slot === slot);
        const uploading = uploadingSlot === slot;
        return (
          <div key={slot} className="photo-slot">
            {image || previews[slot] ? (
              <span className="photo-thumb">
                <img src={image ? displayUrl(image) : previews[slot]} alt="" />
              </span>
            ) : (
              <span className="photo-thumb is-empty" aria-hidden="true" />
            )}
            <div className="photo-slot-body">
              <p className="photo-slot-label">{label}</p>
              <p className="photo-slot-hint">{hint}</p>
              <div className="photo-slot-actions">
                <label className="btn btn-quiet btn-sm">
                  <Upload size={13} />{" "}
                  {uploading ? "Uploading…" : image ? "Replace" : "Upload"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                    className="sr-only"
                    // Every slot's input disables while any upload is in
                    // flight (the music picker's single-flag pattern):
                    // two overlapping uploads would race their gallery
                    // merges and the later finisher would silently drop
                    // the earlier photo from the saved config.
                    disabled={uploadingSlot !== null}
                    onChange={(e) => {
                      void upload(slot, e.target.files?.[0]);
                      e.target.value = "";
                    }}
                  />
                </label>
                {image && (
                  <button
                    type="button"
                    className="photo-remove"
                    onClick={() => remove(slot)}
                    aria-label={`Remove ${label} photo`}
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
              {image && (
                <label className="photo-slot-alt">
                  Describe this photo (for guests using a screen reader)
                  <input
                    type="text"
                    value={image.alt}
                    onChange={(e) => setAlt(slot, e.target.value)}
                    placeholder={SLOTS.find((s) => s.slot === slot)?.defaultAlt}
                  />
                </label>
              )}
            </div>
          </div>
        );
      })}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
