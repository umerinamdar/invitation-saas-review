import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Check, LoaderCircle } from "lucide-react";
import { BRAND } from "@/components/site/chrome";
import { InviteEditor } from "@/components/editor/invite-editor";
import { useAuth } from "@/lib/auth";
import {
  getInviteById,
  makeSlug,
  saveInvite,
  toInvite,
  type InviteConfig,
} from "@/lib/invites-api";
import { themes } from "@/themes";
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

/** The same editor as /create, backed by the database instead of the browser. */
function Editor() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { session, loading } = useAuth();

  const [row, setRow] = useState<InviteRow | null>(null);
  const [config, setConfig] = useState<InviteConfig | null>(null);
  const [themeId, setThemeId] = useState("dubai-silk");
  const [save, setSave] = useState<SaveState>("idle");
  const [error, setError] = useState("");

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

  /* Trailing-edge debounce: typing a name should not be one request per
   * keystroke. */
  const pending = useRef<ReturnType<typeof setTimeout> | null>(null);
  const first = useRef(true);
  useEffect(() => {
    if (!config || !row) return;
    if (first.current) {
      first.current = false;
      return;
    }
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

  if (!config) {
    return (
      <div className="site">
        <section className="auth">
          <LoaderCircle className="loading-spinner" />
        </section>
      </div>
    );
  }

  return (
    <InviteEditor
      config={config}
      themeId={themeId}
      onChange={setConfig}
      onThemeChange={setThemeId}
      toolbar={
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
      }
    />
  );
}
