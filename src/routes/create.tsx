import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Check, LoaderCircle } from "lucide-react";
import { BRAND } from "@/components/site/chrome";
import { InviteEditor } from "@/components/editor/invite-editor";
import { PUBLISH_PRICE_LABEL } from "@/config/site";
import { blankConfig, type InviteConfig } from "@/lib/invites-api";
import {
  getDraftIssues,
  type DraftIssue,
} from "@/lib/draft-validation";
import { clearLocalDraftData, readDraft, writeDraft } from "@/lib/local-draft";
import { DEFAULT_THEME_ID, themes } from "@/themes";

type Search = { theme?: string };

/**
 * Design an invitation with no account. The draft lives in the browser and
 * only moves to the database when they publish, so the first thing a visitor
 * does is see their own names on the page rather than fill in a signup form.
 */
export const Route = createFileRoute("/create")({
  validateSearch: (search: Record<string, unknown>): Search =>
    typeof search["theme"] === "string" ? { theme: search["theme"] } : {},
  head: () => ({
    meta: [
      { title: `Create your invitation — ${BRAND}` },
      // The editor works on a private draft — keep it out of search
      // indexes, like the other account/app routes.
      { name: "robots", content: "noindex" },
    ],
    links: themes.map((theme) => ({
      rel: "stylesheet",
      href: theme.typography.fontsHref,
    })),
  }),
  component: Create,
});

function Create() {
  const { theme: themeParam } = Route.useSearch();
  const navigate = useNavigate();
  const [config, setConfig] = useState<InviteConfig | null>(null);
  const [themeId, setThemeId] = useState(themeParam ?? DEFAULT_THEME_ID);
  const [draftMediaKey, setDraftMediaKey] = useState<string | undefined>();
  const [saved, setSaved] = useState(false);
  // Only shown after a Publish attempt — the editor itself stays
  // forgiving while someone is mid-draft.
  const [publishIssues, setPublishIssues] = useState<DraftIssue[]>([]);

  // Resume an earlier draft, but a theme in the URL is an explicit choice.
  useEffect(() => {
    const draft = readDraft();
    setConfig(draft?.config ?? blankConfig());
    if (!themeParam && draft?.themeId) setThemeId(draft.themeId);

    // The local draft is a singleton, so its media scope can be a stable
    // key held beside it. Uploaded draft media lives under
    // <userId>/draft-<key>/ until an invite row exists.
    try {
      const storageKey = "invite-draft-media-key";
      let mediaKey = localStorage.getItem(storageKey);
      if (!mediaKey) {
        mediaKey = globalThis.crypto?.randomUUID?.() ?? String(Date.now());
        localStorage.setItem(storageKey, mediaKey);
      }
      setDraftMediaKey(mediaKey);
    } catch {
      // Blocked storage still allows editing; uploads will ask for a
      // signed-in invite/draft scope rather than saving a blob URL.
    }
  }, [themeParam]);

  const first = useRef(true);
  useEffect(() => {
    if (!config) return;
    if (first.current) {
      first.current = false;
      return;
    }
    writeDraft({ themeId, config });
    setSaved(true);
    const id = setTimeout(() => setSaved(false), 1600);
    return () => clearTimeout(id);
  }, [config, themeId]);

  // Impl round 2 (Agent C, C-4): there was NO way to abandon a local
  // draft — clearDraft's only production caller was order-success —
  // so a stale or corrupt draft resurrected on every visit forever.
  // "Start new" clears the draft AND its media key, then resets the
  // editor to a blank design with a FRESH media key (the discarded
  // draft's uploads stay quarantined under the old key's folder).
  function startNew() {
    const confirmed = window.confirm(
      "Start a new design? This clears the invitation you've been working on from this device — it exists only here until you publish, and this can't be undone.",
    );
    if (!confirmed) return;
    clearLocalDraftData();
    try {
      const mediaKey = globalThis.crypto?.randomUUID?.() ?? String(Date.now());
      localStorage.setItem("invite-draft-media-key", mediaKey);
      setDraftMediaKey(mediaKey);
    } catch {
      setDraftMediaKey(undefined);
    }
    setPublishIssues([]);
    setThemeId(themeParam ?? DEFAULT_THEME_ID);
    setConfig(blankConfig());
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
      onChange={(next) => {
        setConfig(next);
        // Once a publish attempt has listed what's missing, keep the
        // list honest as they fix each item.
        if (publishIssues.length > 0) setPublishIssues(getDraftIssues(next));
      }}
      onThemeChange={setThemeId}
      draftMediaKey={draftMediaKey}
      toolbar={
        <>
          {/* Task 15: the editor pages had no h1 at all. */}
          <h1 className="sr-only">Create your invitation</h1>
          <header className="editor-bar">
            <Link to="/" className="brand">
              {BRAND}
            </Link>
            <span className="save-state">
              {saved ? (
                <>
                  <Check size={13} /> Saved on this device
                </>
              ) : (
                "Free to design"
              )}
            </span>
            <button
              type="button"
              className="btn btn-quiet btn-sm"
              onClick={startNew}
            >
              Start new
            </button>
            <button
              className="btn btn-solid btn-sm"
              onClick={() => {
                // Publish is gated on the same checks /publish itself
                // applies — an unfinished draft must be told what is
                // missing here, not carried silently to the pay step.
                const issues = getDraftIssues(config);
                setPublishIssues(issues);
                if (issues.length === 0) {
                  navigate({ to: "/publish" });
                }
              }}
            >
              Publish — {PUBLISH_PRICE_LABEL}
            </button>
          </header>
          {publishIssues.length > 0 && (
            <div className="publish-issues" role="alert">
              <p>Before you can publish:</p>
              <ul>
                {publishIssues.map((issue) => (
                  <li key={issue.field}>{issue.message}</li>
                ))}
              </ul>
            </div>
          )}
        </>
      }
    />
  );
}
