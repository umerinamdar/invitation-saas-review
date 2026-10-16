import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Check, LoaderCircle } from "lucide-react";
import { BRAND } from "@/components/site/chrome";
import { Invitation } from "@/components/invitation";
import { useAuth } from "@/lib/auth";
import {
  getInviteById,
  makeSlug,
  saveInvite,
  toInvite,
  type InviteConfig,
} from "@/lib/invites-api";
import { getTheme, themes } from "@/themes";
import type { InviteRow } from "@/lib/supabase";

export const Route = createFileRoute("/editor/$id")({
  head: () => ({
    meta: [
      { title: `Edit your invitation — ${BRAND}` },
      { name: "robots", content: "noindex" },
    ],
    links: themes.map((theme) => ({
      rel: "stylesheet",
      href: theme.typography.fontsHref,
    })),
  }),
  component: Editor,
});

type SaveState = "idle" | "saving" | "saved" | "error";

function Editor() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { session, loading } = useAuth();

  const [row, setRow] = useState<InviteRow | null>(null);
  const [config, setConfig] = useState<InviteConfig | null>(null);
  const [themeId, setThemeId] = useState("dubai-silk");
  const [save, setSave] = useState<SaveState>("idle");
  const [error, setError] = useState("");
  // Remounts the preview so a guest-facing animation replays from the start.
  const [previewKey, setPreviewKey] = useState(0);

  useEffect(() => {
    if (!loading && !session) void navigate({ to: "/login" });
  }, [loading, session, navigate]);

  useEffect(() => {
    if (!session) return;
    getInviteById(id)
      .then((found) => {
        setRow(found);
        setThemeId(found.theme_id);
        setConfig(toInvite(found));
      })
      .catch((cause) =>
        setError(cause instanceof Error ? cause.message : "Could not load."),
      );
  }, [id, session]);

  /* Autosave, trailing-edge debounced: typing a name should not fire a
   * request per keystroke. */
  const pending = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!config || !row) return;
    if (pending.current) clearTimeout(pending.current);
    pending.current = setTimeout(() => {
      setSave("saving");
      const slug =
        row.slug.startsWith("invitation-") && config.hosts.person1
          ? makeSlug(config.hosts.person1, config.hosts.person2)
          : row.slug;
      saveInvite(row.id, { config, theme_id: themeId, slug })
        .then((updated) => {
          setRow(updated);
          setSave("saved");
        })
        .catch(() => setSave("error"));
    }, 900);
    return () => {
      if (pending.current) clearTimeout(pending.current);
    };
  }, [config, themeId, row?.id]);

  const theme = useMemo(() => getTheme(themeId), [themeId]);
  const preview = useMemo(
    () => (config && row ? { ...config, slug: row.slug, themeId } : null),
    [config, row, themeId],
  );

  function patch(next: Partial<InviteConfig>) {
    setConfig((current) => (current ? { ...current, ...next } : current));
  }
  function patchEvent(next: Partial<InviteConfig["event"]>) {
    setConfig((current) =>
      current ? { ...current, event: { ...current.event, ...next } } : current,
    );
  }
  function patchHosts(next: Partial<InviteConfig["hosts"]>) {
    setConfig((current) =>
      current ? { ...current, hosts: { ...current.hosts, ...next } } : current,
    );
  }

  if (error) {
    return (
      <div className="site">
        <section className="auth">
          <p className="form-error">{error}</p>
          <Link to="/dashboard" className="btn btn-quiet">
            Back to your invitations
          </Link>
        </section>
      </div>
    );
  }

  if (!config || !preview) {
    return (
      <div className="site">
        <section className="auth">
          <LoaderCircle className="loading-spinner" />
        </section>
      </div>
    );
  }

  return (
    <div className="editor">
      <header className="editor-bar">
        <Link to="/dashboard" className="brand">
          {BRAND}
        </Link>
        <span className={`save-state save-${save}`}>
          {save === "saving" && (
            <>
              <LoaderCircle size={13} className="loading-spinner" /> Saving
            </>
          )}
          {save === "saved" && (
            <>
              <Check size={13} /> Saved
            </>
          )}
          {save === "error" && "Could not save"}
        </span>
        <Link to="/dashboard" className="btn btn-quiet btn-sm">
          Done
        </Link>
      </header>

      <div className="editor-body">
        <form className="editor-form" onSubmit={(e) => e.preventDefault()}>
          <fieldset>
            <legend>Design</legend>
            <div className="theme-choices">
              {themes.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={`theme-choice ${option.id === themeId ? "is-active" : ""}`}
                  onClick={() => {
                    setThemeId(option.id);
                    setPreviewKey((k) => k + 1);
                  }}
                >
                  {option.name}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend>Who</legend>
            <label>
              First name
              <input
                value={config.hosts.person1}
                onChange={(e) => patchHosts({ person1: e.target.value })}
                placeholder="Aarav"
              />
            </label>
            <label>
              Partner's name
              <input
                value={config.hosts.person2 ?? ""}
                onChange={(e) => patchHosts({ person2: e.target.value })}
                placeholder="Anaya"
              />
            </label>
          </fieldset>

          <fieldset>
            <legend>The day</legend>
            <label>
              Occasion
              <input
                value={config.event.typeLabel}
                onChange={(e) => patchEvent({ typeLabel: e.target.value })}
                placeholder="Wedding Ceremony"
              />
            </label>
            <label>
              Date and time
              <input
                type="datetime-local"
                value={config.event.startIso.slice(0, 16)}
                onChange={(e) => {
                  const value = e.target.value;
                  if (!value) return patchEvent({ startIso: "" });
                  // Anchored to IST so every guest sees the couple's clock.
                  const startIso = `${value}:00+05:30`;
                  const date = new Date(startIso);
                  patchEvent({
                    startIso,
                    dateText: date.toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }),
                    dayText: date.toLocaleDateString("en-GB", {
                      weekday: "long",
                    }),
                    timeText: `${date.toLocaleTimeString("en-GB", {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })} onwards`,
                  });
                }}
              />
            </label>
            <label>
              Venue
              <input
                value={config.event.venueName}
                onChange={(e) => patchEvent({ venueName: e.target.value })}
                placeholder="The Grand Pavilion"
              />
            </label>
            <label>
              Google Maps link
              <input
                value={config.event.venueMapsUrl ?? ""}
                onChange={(e) => patchEvent({ venueMapsUrl: e.target.value })}
                placeholder="https://maps.app.goo.gl/..."
              />
            </label>
          </fieldset>

          <fieldset>
            <legend>Your story</legend>
            <label>
              A line for your guests
              <textarea
                rows={2}
                value={config.story?.quote ?? ""}
                onChange={(e) =>
                  patch({ story: { ...config.story, quote: e.target.value } })
                }
                placeholder="Two families, one celebration."
              />
            </label>
          </fieldset>

          <p className="editor-note">
            Changes save as you type. You can share it once you publish.
          </p>
        </form>

        <div className="editor-preview">
          <div className="phone">
            <Invitation key={previewKey} theme={theme} invite={preview} />
          </div>
          <button
            type="button"
            className="btn btn-quiet btn-sm"
            onClick={() => setPreviewKey((k) => k + 1)}
          >
            Replay the opening
          </button>
        </div>
      </div>
    </div>
  );
}
