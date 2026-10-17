import { useEffect, useRef, useState } from "react";
import { Music, Pause, Play, Upload, X } from "lucide-react";
import { LANGUAGES, LIBRARY, tracksByLanguage } from "@/lib/music";

type Props = {
  /** The chosen track's url, or undefined to use the theme's default. */
  value: string | undefined;
  onChange: (url: string | undefined) => void;
  themeTrackName: string;
};

const MAX_BYTES = 10 * 1024 * 1024;

/**
 * Pick a track from the library, or play one of your own.
 *
 * An uploaded file stays in this browser as an object URL — nothing is sent
 * anywhere until the invitation is published, so a customer can audition a
 * track without it being stored.
 */
export function MusicPicker({ value, onChange, themeTrackName }: Props) {
  const [uploadName, setUploadName] = useState("");
  const [error, setError] = useState("");
  const [playing, setPlaying] = useState<string | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);
  const objectUrl = useRef<string | null>(null);

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

  function upload(file: File | undefined) {
    if (!file) return;
    setError("");
    if (!file.type.startsWith("audio/")) {
      setError("That is not an audio file.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Please choose a file under 10 MB.");
      return;
    }
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    const url = URL.createObjectURL(file);
    objectUrl.current = url;
    setUploadName(file.name);
    onChange(url);
  }

  function clearUpload() {
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    objectUrl.current = null;
    setUploadName("");
    onChange(undefined);
  }

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
              </div>
            ))}
          </div>
        );
      })}

      <div className="track-upload">
        <label className="btn btn-quiet btn-sm">
          <Upload size={14} /> Use my own song
          <input
            type="file"
            accept="audio/*"
            hidden
            onChange={(e) => upload(e.target.files?.[0])}
          />
        </label>
        {uploadName && (
          <p className="track-upload-name">
            {uploadName}
            <button type="button" onClick={clearUpload} aria-label="Remove">
              <X size={13} />
            </button>
          </p>
        )}
      </div>

      {error && <p className="form-error">{error}</p>}
      {LIBRARY.length < 2 && (
        <p className="editor-note">
          More tracks are being added. You can upload your own in the meantime.
        </p>
      )}
    </div>
  );
}
