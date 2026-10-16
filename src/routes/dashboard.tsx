import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LoaderCircle, Plus } from "lucide-react";
import { BRAND, SiteFooter, SiteHeader } from "@/components/site/chrome";
import { useAuth } from "@/lib/auth";
import { createInvite, listInvites, toInvite } from "@/lib/invites-api";
import { getTheme } from "@/themes";
import { hostNames } from "@/invites/types";
import type { InviteRow } from "@/lib/supabase";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: `Your invitations — ${BRAND}` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const [rows, setRows] = useState<InviteRow[] | null>(null);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!loading && !session) void navigate({ to: "/login" });
  }, [loading, session, navigate]);

  useEffect(() => {
    if (!session) return;
    listInvites()
      .then(setRows)
      .catch((cause) =>
        setError(cause instanceof Error ? cause.message : "Could not load."),
      );
  }, [session]);

  async function startNew() {
    if (!session) return;
    setCreating(true);
    setError("");
    try {
      const row = await createInvite(session.user.id, "dubai-silk");
      await navigate({ to: "/editor/$id", params: { id: row.id } });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not create.");
      setCreating(false);
    }
  }

  if (loading || !session) {
    return (
      <div className="site">
        <SiteHeader />
        <section className="auth">
          <LoaderCircle className="loading-spinner" />
        </section>
      </div>
    );
  }

  return (
    <div className="site">
      <SiteHeader />
      <section className="page-head dash-head">
        <div>
          <p className="eyebrow">Your invitations</p>
          <h1>{session.user.email}</h1>
        </div>
        <button
          className="btn btn-solid"
          onClick={startNew}
          disabled={creating}
        >
          {creating ? (
            <LoaderCircle size={16} className="loading-spinner" />
          ) : (
            <Plus size={17} />
          )}
          New invitation
        </button>
      </section>

      <section className="dash">
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        {rows === null && !error && (
          <LoaderCircle className="loading-spinner" />
        )}

        {rows?.length === 0 && (
          <div className="dash-empty">
            <h2>No invitations yet</h2>
            <p>Start one and preview it free — you pay only to publish.</p>
            <button className="btn btn-solid" onClick={startNew}>
              <Plus size={17} /> Create your first
            </button>
          </div>
        )}

        {rows && rows.length > 0 && (
          <ul className="dash-list">
            {rows.map((row) => {
              const invite = toInvite(row);
              const theme = getTheme(row.theme_id);
              const names = hostNames(invite) || "Untitled invitation";
              return (
                <li key={row.id}>
                  <div>
                    <h3>{names}</h3>
                    <p>
                      {theme.name}
                      {invite.event.dateText && ` · ${invite.event.dateText}`}
                    </p>
                  </div>
                  <span className={`status status-${row.status}`}>
                    {row.status}
                  </span>
                  <div className="dash-actions">
                    <Link
                      to="/editor/$id"
                      params={{ id: row.id }}
                      className="btn btn-quiet btn-sm"
                    >
                      Edit
                    </Link>
                    {row.status === "published" && (
                      <a
                        href={`/i/${row.slug}`}
                        className="btn btn-quiet btn-sm"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open link
                      </a>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
      <SiteFooter />
    </div>
  );
}
