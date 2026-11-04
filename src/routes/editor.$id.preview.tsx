import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Invitation } from "@/components/invitation";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { getInviteById, toInvite } from "@/lib/invites-api";
import { collectInviteMediaPaths, signInviteMediaPaths, type MediaUrlMap } from "@/lib/media-url";
import { getTheme } from "@/themes";
import type { InviteRow } from "@/lib/supabase";

export const Route = createFileRoute("/editor/$id/preview")({
  head: () => ({
    meta: [
      { title: "Preview your invitation" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: EditorPreview,
});

/**
 * Same posture as editor.$id.tsx's INVITE_LOAD_ERROR: a nonexistent id
 * and another account's id must fail identically.
 */
const LOAD_ERROR =
  "This invitation could not be loaded. It may have been deleted, or it belongs to another account.";

/** Full-screen, read-only render of a signed-in owner's own draft or
 * published invite — the same content the editor's small phone mockup
 * shows, at real size. Reuses the editor's own owner-scoped media
 * signing (migration 0003's owner-read storage policy) rather than the
 * published-only server signer used by the public /i/$slug page. */
function EditorPreview() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const [row, setRow] = useState<InviteRow | null>(null);
  const [mediaUrlMap, setMediaUrlMap] = useState<MediaUrlMap>({});
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !session) void navigate({ to: "/login" });
  }, [loading, session, navigate]);

  useEffect(() => {
    if (!session) return;
    getInviteById(id)
      .then((found) => {
        if (!found) {
          setError(LOAD_ERROR);
          return;
        }
        setRow(found);
      })
      .catch(() => setError(LOAD_ERROR));
  }, [id, session]);

  useEffect(() => {
    if (!row) return;
    const paths = collectInviteMediaPaths(toInvite(row));
    if (paths.length === 0) return;
    void signInviteMediaPaths(supabase, paths).then(setMediaUrlMap);
  }, [row]);

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

  if (!row) return null;

  return (
    <>
      <Link
        to="/editor/$id"
        params={{ id: row.id }}
        className="preview-close"
        aria-label="Back to editor"
      >
        <X size={18} />
      </Link>
      <Invitation
        theme={getTheme(row.theme_id)}
        invite={toInvite(row)}
        mediaUrlMap={mediaUrlMap}
        watermark={row.status !== "published"}
      />
    </>
  );
}
