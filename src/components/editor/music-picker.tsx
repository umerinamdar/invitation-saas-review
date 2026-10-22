import { useEffect, useRef, useState } from "react";
import { Check, Music, Pause, Play, Upload, X } from "lucide-react";
import { LANGUAGES, LIBRARY, tracksByLanguage } from "@/lib/music";
import { supabase } from "@/lib/supabase";
import {
  isStoredMediaPath,
  uploadInviteMedia,
  validateInviteMediaFile,
  type MediaUploadScope,
} from "@/lib/media-upload";

type Props = {
  /** The chosen track's url/path, or undefined to use the theme's default. */
  value: string | undefined;
  onChange: (url: string | undefined) => void;
  themeTrackName: string;
  /** Authenticated owner + invite/draft scope required by storage policy. */
  uploadScope?: MediaUploadScope | undefined;
};

/**
 * Pick a track from the library, or use one of your own.
 *
 * An uploaded file is sent to invite-media and the invitation stores the
 * returned storage path. A local object URL is used only to preview the
 * file in this session while the upload completes; it is never saved,
 * because guests and later sessions cannot open another session's blob.
 */
export function MusicPicker({
  value,
  onChange,
  themeTrackName,
  uploadScope,
}: Props) {
  const [uploadName, setUploadName] = useState("");
  const [error, setError] = useState("");
  const [playing, setPlaying] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const audio = useRef<HTMLAudioElement | null>(null);
  const objectUrl = useRef<string | null>(null);
  const uploadGeneration = useRef(0);

  // Revoking on unmount keeps a long editing session from leaking blobs.
  useEffect(
    () => () => {
      audio.current?.pause();
      if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    },
    [],
  );

  function audition(url: string) {
    if (playing === url) {
      audio.current?.pause();
      setPlaying(null);
      return;
    }
    audio.current?.pause();
    const player = new Audio(url);
    player.volume = 0.6;
    player.onended = () => setPlaying(null);
    void player.play().catch(() => setError("That track could not play."));
    audio.current = player;
    setPlaying(url);
  }

  async function upload(file: File | undefined) {
    if (!file) return;
    setError("");
    try {
      validateInviteMediaFile(file, "song");
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "That song can't be used.",
      );
      return;
    }
    if (!uploadScope) {
      setError(
        "Sign in before uploading a song, so it can be saved for your guests.",
      );
      return;
    }

    const previousName = uploadName;
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    const previewUrl = URL.createObjectURL(file);
    objectUrl.current = previewUrl;
    const generation = ++uploadGeneration.current;
    setUploadName(file.name);
    setUploading(true);

    try {
      const path = await uploadInviteMedia(supabase, {
        ...uploadScope,
        file,
        kind: "song",
        fileKey: `custom-${globalThis.crypto?.randomUUID?.() ?? Date.now()}`,
      });
      // A default/library click while the file was uploading wins; do not
      // let the late completion overwrite that newer choice.
      if (uploadGeneration.current !== generation) return;
      onChange(path);
    } catch (cause) {
      if (uploadGeneration.current !== generation) return;
      if (objectUrl.current === previewUrl) {
        URL.revokeObjectURL(previewUrl);
        objectUrl.current = null;
      }
      setUploadName(previousName);
      setError(
        cause instanceof Error
          ? cause.message
          : "That song could not be uploaded.",
      );
    } finally {
      if (uploadGeneration.current === generation) setUploading(false);
    }
  }

  function clearUpload() {
    uploadGeneration.current += 1;
    setUploading(false);
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    objectUrl.current = null;
    setUploadName("");
    onChange(undefined);
  }

  const hasUploadedSong = Boolean(
    uploadName || isStoredMediaPath(value) || value?.startsWith("blob:"),
  );

  return (
    <div className="music-picker">
      <button
        type="button"
        className={`track ${!value ? "is-active" : ""}`}
        onClick={() => {
          clearUpload();
          onChange(undefined);
        }}
      >
        <Music size={14} />
        <span className="track-title">{themeTrackName}</span>
        <span className="track-tag">Default</span>
        {!value && (
          <Check size={14} className="track-selected" aria-hidden="true" />
        )}
      </button>

      {LANGUAGES.map((language) => {
        const tracks = tracksByLanguage(language);
        if (tracks.length === 0) return null;
        return (
          <div key={language} className="track-group">
            <p className="track-group-name">{language}</p>
            {tracks.map((track) => (
              <div
                key={track.id}
                className={`track ${value === track.url ? "is-active" : ""}`}
              >
                <button
                  type="button"
                  className="track-play"
                  aria-label={`${playing === track.url ? "Stop" : "Hear"} ${track.title}`}
                  onClick={() => audition(track.url)}
                >
                  {playing === track.url ? (
                    <Pause size={13} />
                  ) : (
                    <Play size={13} />
                  )}
                </button>
                <button
                  type="button"
                  className="track-title"
                  onClick={() => {
                    clearUpload();
                    onChange(track.url);
                  }}
                >
                  {track.title}
                </button>
                {value === track.url && (
                  <Check
                    size={14}
                    className="track-selected"
                    aria-hidden="true"
                  />
                )}
              </div>
            ))}
          </div>
        );
      })}

      <div className="track-upload">
        <label className="btn btn-quiet btn-sm">
          <Upload size={14} /> {uploading ? "Uploading…" : "Use my own song"}
          <input
            type="file"
            accept="audio/mpeg,audio/mp4,audio/wav,audio/x-wav,audio/ogg"
            hidden
            disabled={uploading}
            onChange={(e) => {
              void upload(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </label>
        {hasUploadedSong && (
          <p className="track-upload-name">
            {uploadName || "Your uploaded song"}
            {uploading ? " — uploading…" : ""}
            <button
              type="button"
              onClick={clearUpload}
              aria-label="Remove uploaded song"
            >
              <X size={13} />
            </button>
          </p>
        )}
      </div>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {LIBRARY.length < 2 && (
        <p className="editor-note">
          More tracks are being added. You can upload your own in the meantime.
        </p>
      )}
    </div>
  );
}
