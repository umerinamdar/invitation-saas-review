import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Check, LoaderCircle } from "lucide-react";
import { BRAND } from "@/components/site/chrome";
import { PUBLISH_PRICE_LABEL } from "@/config/site";
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

/**
 * DB-3: the load failure UI never shows the raw PostgREST message —
 * a nonexistent id and another account's id fail identically, and the
 * customer only needs to know the invitation isn't available to them.
 * The raw error goes to the console for diagnostics only.
 */
const INVITE_LOAD_ERROR =
  "This invitation could not be loaded. It may have been deleted, or it belongs to another account.";

/**
 * Impl round 2 (Agent C, C-7): a synchronous local mirror of the
 * latest editor snapshot, keyed by user + invite. The debounced
 * server save cannot survive a hard refresh or tab close (the
 * unmount flush dies with the document), so every scheduled save
 * also lands here instantly; the editor load path restores it when
 * it is newer than the server row, and a successful save clears it.
 */
type EditorMirror = {
  config: InviteConfig;
  themeId: string;
  savedAt: number;
};

function editorMirrorKey(userId: string, inviteId: string) {
  return `invite-editor-mirror:${userId}:${inviteId}`;
}

function readEditorMirror(
  userId: string,
  inviteId: string,
): EditorMirror | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(editorMirrorKey(userId, inviteId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as EditorMirror;
    if (!parsed?.config || !parsed?.themeId || !parsed?.savedAt) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeEditorMirror(
  userId: string,
  inviteId: string,
  mirror: EditorMirror,
) {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(
      editorMirrorKey(userId, inviteId),
      JSON.stringify(mirror),
    );
  } catch {
    /* storage full/blocked — the server save still proceeds */
  }
}

function clearEditorMirror(userId: string, inviteId: string) {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.removeItem(editorMirrorKey(userId, inviteId));
  } catch {
    /* nothing to do */
  }
}

/** One scheduled save: everything a single PATCH needs, frozen. */
type SaveSnapshot = {
  inviteId: string;
  userId: string;
  config: InviteConfig;
  themeId: string;
  slug: string;
  generation: number;
  state: "pending" | "saving" | "failed" | "saved";
};

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
        if (!found) {
          setError(INVITE_LOAD_ERROR);
          return;
        }
        setRow(found);
        // Impl round 2 (Agent C, C-7): if a previous editor session
        // on this browser mirrored edits that never reached the
        // server (hard refresh / tab close inside the debounce or
        // mid-PATCH), and that mirror is NEWER than the loaded row,
        // restore it and queue it as a pending save (below) instead
        // of silently dropping the customer's last edits.
        const mirror = readEditorMirror(session.user.id, found.id);
        if (mirror && mirror.savedAt > Date.parse(found.updated_at)) {
          first.current = false;
          setThemeId(mirror.themeId);
          setConfig(mirror.config);
        } else {
          if (mirror) clearEditorMirror(session.user.id, found.id);
          setThemeId(found.theme_id);
          setConfig(toInvite(found));
        }
      })
      .catch((cause) => {
        console.error("Editor invite load failed", cause);
        setError(INVITE_LOAD_ERROR);
      });
  }, [id, session]);

  /* Trailing-edge debounce: typing a name should not be one request per
   * keystroke. */
  const pending = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Release Fix 4 (D4): the latest scheduled save, kept beside the
  // timer so unmount can FLUSH it (below) instead of discarding the
  // last <900 ms of edits the way the old cleanup did.
  const pendingSave = useRef<(() => void) | null>(null);
  const first = useRef(true);
  // Impl round 2 (Agent C, C-5/C-6): saves now run through a promise
  // CHAIN (never two PATCHes in flight, so an older save can never
  // land after a newer one), each save is a frozen snapshot with a
  // generation number (only the latest generation may update the
  // row/save UI on completion), and the latest snapshot is RETAINED
  // until it succeeds — a failed save stays pending so the unmount
  // flush / next edit retries it instead of dropping the edits.
  const saveChain = useRef<Promise<unknown>>(Promise.resolve());
  const generation = useRef(0);
  const pendingSnapshot = useRef<SaveSnapshot | null>(null);
  const userIdRef = useRef("");
  useEffect(() => {
    userIdRef.current = session?.user?.id ?? "";
  }, [session]);

  const executeSave = (snap: SaveSnapshot): Promise<boolean> => {
    const task = saveChain.current.then(async () => {
      snap.state = "saving";
      if (snap.generation === generation.current) setSave("saving");
      try {
        const updated = await saveInvite(snap.inviteId, {
          config: snap.config,
          theme_id: snap.themeId,
          slug: snap.slug,
        });
        snap.state = "saved";
        if (pendingSnapshot.current === snap) {
          pendingSnapshot.current = null;
          if (snap.userId) clearEditorMirror(snap.userId, snap.inviteId);
        }
        if (snap.generation === generation.current) {
          setRow(updated);
          setSave("saved");
        }
        return true;
      } catch {
        snap.state = "failed";
        // C-6: pendingSnapshot keeps pointing at this snapshot (it
        // is only replaced by a NEWER edit), so the unmount flush
        // and goPublish can retry it.
        if (snap.generation === generation.current) setSave("error");
        return false;
      }
    });
    saveChain.current = task.then(
      () => undefined,
      () => undefined,
    );
    return task;
  };
  const executeSaveRef = useRef(executeSave);
  executeSaveRef.current = executeSave;

  useEffect(() => {
    if (!config || !row) return;
    if (first.current) {
      first.current = false;
      return;
    }
    if (pending.current) clearTimeout(pending.current);
    const slug =
      row.slug.startsWith("invitation-") && config.hosts.person1
        ? makeSlug(config.hosts.person1, config.hosts.person2)
        : row.slug;
    const snap: SaveSnapshot = {
      inviteId: row.id,
      userId: userIdRef.current,
      config,
      themeId,
      slug,
      generation: ++generation.current,
      state: "pending",
    };
    pendingSnapshot.current = snap;
    // C-7: mirror synchronously, before the debounce fires, so even
    // a hard refresh inside the window keeps the edits recoverable.
    if (snap.userId) {
      writeEditorMirror(snap.userId, snap.inviteId, {
        config,
        themeId,
        savedAt: Date.now(),
      });
    }
    const start = () => {
      if (pendingSave.current === start) pendingSave.current = null;
      void executeSaveRef.current(snap);
    };
    pendingSave.current = start;
    pending.current = setTimeout(start, 900);
    return () => {
      if (pending.current) clearTimeout(pending.current);
    };
  }, [config, themeId, row?.id]);

  /* Fix 4 (D4): on unmount, flush the pending save rather than
   * dropping it. Fire-and-forget — its completion handlers only set
   * state, a harmless no-op once unmounted — and nothing here blocks
   * the page going away. Impl round 2 (C-6): if the latest save
   * already ran and FAILED, retry its retained snapshot here too. */
  useEffect(() => {
    return () => {
      if (pending.current) clearTimeout(pending.current);
      const flush = pendingSave.current;
      pendingSave.current = null;
      if (flush) {
        flush();
        return;
      }
      const snap = pendingSnapshot.current;
      if (snap && snap.state === "failed") {
        void executeSaveRef.current(snap);
      }
    };
  }, []);

  /* NF-2: Publish used to be unreachable from this editor — the only
   * pay path acted on the localStorage draft, so a dashboard-created
   * invitation could be edited here but never paid for. Flush any
   * pending save first so /publish sees the exact config on screen,
   * then hand off to /publish?invite=<id>, which runs the same
   * validation and checkout against this invite. */
  async function goPublish() {
    if (!config || !row) return;
    if (pending.current) {
      clearTimeout(pending.current);
      pending.current = null;
    }
    // goPublish performs this save itself; the unmount flush must
    // not repeat it when navigation tears the page down.
    pendingSave.current = null;
    const snap = pendingSnapshot.current;
    if (snap) {
      if (snap.state === "saving") {
        await saveChain.current;
        // Read through a call so the compiler doesn't narrow the
        // mutable state field across the await.
        const landed = (s: SaveSnapshot) => s.state === "saved";
        if (!landed(snap)) {
          setSave("error");
          return;
        }
      } else {
        const ok = await executeSave(snap);
        if (!ok) {
          setSave("error");
          return;
        }
      }
    } else {
      // No unsaved snapshot: still let any in-flight save land first.
      await saveChain.current;
    }
    await navigate({ to: "/publish", search: { invite: row.id } });
  }

  if (error) {
    return (
      <div className="site">
        <main className="auth">
          <p className="form-error" role="alert">
            {error}
          </p>
          <Link to="/dashboard" className="btn btn-quiet">
            Back to your invitations
          </Link>
        </main>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="site">
        <main className="auth">
          <LoaderCircle className="loading-spinner" />
        </main>
      </div>
    );
  }

  return (
    <InviteEditor
      config={config}
      themeId={themeId}
      onChange={setConfig}
      onThemeChange={setThemeId}
      inviteId={id}
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
          {row && row.status === "draft" && (
            <button
              type="button"
              className="btn btn-solid btn-sm"
              onClick={goPublish}
              disabled={save === "saving"}
            >
              Publish — {PUBLISH_PRICE_LABEL}
            </button>
          )}
          {row && row.status === "published" && (
            <a
              href={`/i/${row.slug}`}
              className="btn btn-quiet btn-sm"
              target="_blank"
              rel="noreferrer"
            >
              View live
            </a>
          )}
          <Link to="/dashboard" className="btn btn-quiet btn-sm">
            Done
          </Link>
        </header>
      }
    />
  );
}
