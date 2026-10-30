import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Check, LoaderCircle } from "lucide-react";
import { BRAND } from "@/components/site/chrome";
import { Logo } from "@/components/site/logo";
import { absoluteUrl, PUBLISH_PRICE_LABEL } from "@/config/site";
import { InviteEditor } from "@/components/editor/invite-editor";
import { useAuth } from "@/lib/auth";
import {
  blankConfig,
  getInviteById,
  makeSlug,
  saveInvite,
  toInvite,
  type InviteConfig,
} from "@/lib/invites-api";
import { themes } from "@/themes";
import type { InviteRow } from "@/lib/supabase";

export const Route = createFileRoute("/editor/$id")({
  head: ({ params }) => {
    // Canonical for this concrete editor URL — only when the owner has
    // configured the canonical origin (VITE_SITE_URL).
    const ogUrl = absoluteUrl(`/editor/${params.id}`);
    return {
      meta: [
        { title: `Edit your invitation — ${BRAND}` },
        { name: "robots", content: "noindex" },
      ],
      links: [
        ...(ogUrl ? [{ rel: "canonical", href: ogUrl }] : []),
        ...themes.map((theme) => ({
          rel: "stylesheet",
          href: theme.typography.fontsHref,
        })),
      ],
    };
  },
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
    // Task 9: a mirror written by an older build may be missing whole
    // branches the editor dereferences. Give it the same treatment as
    // a server row (toInvite merges over blankConfig there): fill the
    // missing top-level branches from a blank config instead of
    // trusting the mirrored JSON wholesale.
    return {
      ...parsed,
      config: { ...blankConfig(), ...parsed.config },
    };
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

/**
 * Task 9: save chains live at module scope, keyed by invite — not in a
 * per-mount ref. Unmounting and remounting the editor (leave to the
 * dashboard, reopen the same invite) must not mint a fresh chain: a
 * PATCH still in flight from the first mount would otherwise race the
 * remounted editor's newer save, reviving the stale-overwrite C-5
 * killed within one mount. The module outlives both mounts in the
 * same document, so the chain does too.
 */
const saveChainsByInvite = new Map<string, Promise<void>>();

function saveChainFor(inviteId: string): Promise<void> {
  return saveChainsByInvite.get(inviteId) ?? Promise.resolve();
}

function recordSaveChain(inviteId: string, task: Promise<unknown>) {
  saveChainsByInvite.set(
    inviteId,
    task.then(
      () => undefined,
      () => undefined,
    ),
  );
}

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
  const generation = useRef(0);
  const pendingSnapshot = useRef<SaveSnapshot | null>(null);
  const userIdRef = useRef("");
  useEffect(() => {
    userIdRef.current = session?.user?.id ?? "";
  }, [session]);

  const executeSave = (snap: SaveSnapshot): Promise<boolean> => {
    const task = saveChainFor(snap.inviteId).then(async () => {
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
    recordSaveChain(snap.inviteId, task);
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
    // Task 9: the editor stays interactive while a save is awaited,
    // so an edit made in that window schedules a NEWER snapshot this
    // function has not seen yet. Loop until the snapshot current at
    // click time — and any snapshot that replaces it while waiting —
    // has landed; only then is the server row the config on screen.
    while (true) {
      const snap = pendingSnapshot.current;
      if (snap) {
        if (snap.state === "saving") {
          await saveChainFor(row.id);
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
        continue;
      }
      // No unsaved snapshot: still let any in-flight save land first,
      // then re-check — an edit during that wait starts the loop again.
      await saveChainFor(row.id);
      if (!pendingSnapshot.current) break;
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
    // Skeleton shaped like the editor form (fieldset blocks with
    // input-sized rows), replacing the bare spinner so the form
    // doesn't pop in once the invite loads.
    return (
      <div className="site">
        <main className="auth">
          <p className="sr-only" role="status">
            Loading editor…
          </p>
          <div className="editor-skeleton" aria-hidden="true">
            {[0, 1, 2].map((group) => (
              <div key={group} className="skeleton-fieldset">
                <div className="skeleton skeleton-legend" />
                <div className="skeleton skeleton-field" />
                <div className="skeleton skeleton-field" />
              </div>
            ))}
          </div>
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
      watermark={row?.status !== "published"}
      toolbar={
        <>
          {/* Task 15: the editor pages had no h1 at all. */}
          <h1 className="sr-only">Edit your invitation</h1>
          <header className="editor-bar">
          <Link to="/dashboard" className="brand">
            <Logo tone="light" />
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
        </>
      }
    />
  );
}
