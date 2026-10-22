import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Check,
  Copy,
  Download,
  LoaderCircle,
  Plus,
  QrCode,
  Share2,
} from "lucide-react";
import { BRAND, SiteFooter, SiteHeader } from "@/components/site/chrome";
import { useAuth } from "@/lib/auth";
import { createInvite, listInvites, toInvite } from "@/lib/invites-api";
import { qrDataUrlForInvite } from "@/lib/qr";
import { buildShareLinks } from "@/lib/share";
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
  const [copied, setCopied] = useState<{ id: string; ok: boolean } | null>(
    null,
  );
  const [qr, setQr] = useState<{ id: string; dataUrl: string } | null>(null);
  const [qrBusyId, setQrBusyId] = useState<string | null>(null);
  const [qrFailedId, setQrFailedId] = useState<string | null>(null);

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

  async function showQr(row: InviteRow, invite: ReturnType<typeof toInvite>) {
    if (qr?.id === row.id) {
      setQr(null);
      return;
    }
    setQrBusyId(row.id);
    setQrFailedId(null);
    try {
      // Generated lazily in the browser on first click — no server call.
      const dataUrl = await qrDataUrlForInvite(invite);
      setQr({ id: row.id, dataUrl });
    } catch {
      setQrFailedId(row.id);
    } finally {
      setQrBusyId(null);
    }
  }

  async function startNew() {
    if (!session || creating) return;
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
        <main className="auth">
          <LoaderCircle className="loading-spinner" />
        </main>
      </div>
    );
  }

  return (
    <div className="site">
      <SiteHeader />
      <main>
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
              <button
                className="btn btn-solid"
                onClick={startNew}
                disabled={creating}
              >
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
                const shareLinks = buildShareLinks(invite);
                return (
                  <li key={row.id}>
                    <div>
                      <h3>{names}</h3>
                      <p>
                        {theme.name}
                        {invite.event.dateText &&
                          ` · ${invite.event.dateText}`}
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
                        <>
                          <a
                            href={`/i/${row.slug}`}
                            className="btn btn-quiet btn-sm"
                            target="_blank"
                            rel="noreferrer"
                          >
                            Open link
                          </a>
                          <a
                            href={shareLinks.whatsappUrl}
                            className="btn btn-quiet btn-sm"
                            target="_blank"
                            rel="noreferrer"
                            aria-label="Share on WhatsApp"
                          >
                            <Share2 size={14} /> Share
                          </a>
                          <button
                            type="button"
                            className="btn btn-quiet btn-sm"
                            onClick={async () => {
                              try {
                                await navigator.clipboard.writeText(
                                  shareLinks.copyText,
                                );
                                setCopied({ id: row.id, ok: true });
                              } catch {
                                setCopied({ id: row.id, ok: false });
                              }
                            }}
                          >
                            {copied?.id === row.id ? (
                              copied.ok ? (
                                <>
                                  <Check size={14} /> Copied
                                </>
                              ) : (
                                "Copy failed"
                              )
                            ) : (
                              <>
                                <Copy size={14} /> Copy link
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            className="btn btn-quiet btn-sm"
                            onClick={() => void showQr(row, invite)}
                            aria-expanded={qr?.id === row.id}
                          >
                            {qrBusyId === row.id ? (
                              <LoaderCircle
                                size={14}
                                className="loading-spinner"
                              />
                            ) : (
                              <QrCode size={14} />
                            )}{" "}
                            QR code
                          </button>
                        </>
                      )}
                    </div>
                    {row.status === "published" && qrFailedId === row.id && (
                      <p className="dash-qr-error" role="alert">
                        Couldn’t generate the QR code — please try again.
                      </p>
                    )}
                    {row.status === "published" && qr?.id === row.id && (
                      <div className="dash-qr">
                        <img
                          src={qr.dataUrl}
                          alt={`QR code linking to ${names}’s invitation`}
                          width={192}
                          height={192}
                        />
                        <div className="dash-qr-actions">
                          <a
                            className="btn btn-quiet btn-sm"
                            href={qr.dataUrl}
                            download={`invitation-${row.slug}.png`}
                          >
                            <Download size={14} /> Download PNG
                          </a>
                          <button
                            type="button"
                            className="btn btn-quiet btn-sm"
                            onClick={() => setQr(null)}
                          >
                            Hide
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
