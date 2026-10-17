import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Check, LoaderCircle } from "lucide-react";
import { BRAND } from "@/components/site/chrome";
import { InviteEditor } from "@/components/editor/invite-editor";
import { blankConfig, type InviteConfig } from "@/lib/invites-api";
import { readDraft, writeDraft } from "@/lib/local-draft";
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
    meta: [{ title: `Create your invitation — ${BRAND}` }],
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
  const [saved, setSaved] = useState(false);

  // Resume an earlier draft, but a theme in the URL is an explicit choice.
  useEffect(() => {
    const draft = readDraft();
    setConfig(draft?.config ?? blankConfig());
    if (!themeParam && draft?.themeId) setThemeId(draft.themeId);
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
            className="btn btn-solid btn-sm"
            onClick={() => navigate({ to: "/publish" })}
          >
            Publish — ₹599
          </button>
        </header>
      }
    />
  );
}
