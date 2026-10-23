import {
  createFileRoute,
  Link,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Check } from "lucide-react";
import { BRAND, SiteFooter, SiteHeader } from "@/components/site/chrome";
import { absoluteUrl, PUBLISH_PRICE_LABEL } from "@/config/site";
import { getDraftIssues } from "@/lib/draft-validation";
import { readDraft, setDraftInviteId } from "@/lib/local-draft";
import { getTheme } from "@/themes";
import { hostNames } from "@/invites/types";
import type { LocalDraft } from "@/lib/local-draft";
import { YouPiCheckout } from "@/components/youpi-checkout";
import { useAuth } from "@/lib/auth";
import {
  createInvite,
  getInviteById,
  saveInvite,
  toInvite,
} from "@/lib/invites-api";
import { supabase } from "@/lib/supabase";
import { copyDraftMediaToInvite } from "@/lib/media-upload";
import type { InviteConfig } from "@/lib/invites-api";
import type { InviteRow } from "@/lib/supabase";

interface PublishSearch {
  invite?: string | undefined;
}

/** This page's absolute URL — null until the canonical origin is set. */
const OG_URL = absoluteUrl("/publish");

export const Route = createFileRoute("/publish")({
  validateSearch: (search: Record<string, unknown>): PublishSearch => ({
    invite: (search["invite"] as string | undefined) || undefined,
  }),
  head: () => ({
    meta: [
      { title: `Publish your invitation — ${BRAND}` },
      { name: "robots", content: "noindex" },
    ],
    links: [
      // Canonical — only once VITE_SITE_URL is configured, never a
      // guessed or localhost URL (same guard as the public routes).
      ...(OG_URL ? [{ rel: "canonical", href: OG_URL }] : []),
    ],
  }),
  component: Publish,
});

/**
 * What /publish?invite=<id> may do with a database invite (NF-2: the
 * DB editor had no path to payment, so dashboard-created invitations
 * could be edited but never published). The row is fetched through the
 * owner's own client (RLS-scoped), and ownership is still checked
 * explicitly here — a published row is anonymously readable, so a
 * signed-in stranger must never reach its checkout.
 */
export type PublishSubject =
  | { kind: "forbidden" }
  | { kind: "unavailable" }
  | { kind: "published"; slug: string }
  | { kind: "draft"; inviteId: string; themeId: string; config: InviteConfig };

export function resolvePublishSubject(
  row: InviteRow,
  sessionUserId: string,
): PublishSubject {
  if (row.user_id !== sessionUserId) return { kind: "forbidden" };
  if (row.status === "published") return { kind: "published", slug: row.slug };
  if (row.status !== "draft") return { kind: "unavailable" };
  const { slug, themeId, ...config } = toInvite(row);
  return { kind: "draft", inviteId: row.id, themeId: row.theme_id, config };
}

/**
 * Release Fix 3 (D3): what a publish RETRY may do with the invite row
 * an earlier attempt created from this same local draft (its id is
 * stored on the draft record — see local-draft.ts). Before this, every
 * attempt inserted a new row, and each abandoned row could arm its
 * own ₹599 checkout, defeating the per-invite order guard. A row that
 * is not the user's own is never reused and never blocks: a published
 * row is anonymously readable, so a stored id can point at a stranger's
 * invite (shared browser, hand-copied storage) — that case just
 * creates fresh, like no stored id at all.
 */
export type DraftInviteReuse = "reuse" | "create" | "published";

export function draftInviteReuse(
  row: InviteRow | null,
  sessionUserId: string,
): DraftInviteReuse {
  if (!row || row.user_id !== sessionUserId) return "create";
  if (row.status === "published") return "published";
  if (row.status !== "draft") return "create";
  return "reuse";
}

/**
 * The /create flow persists a stable draft media key beside the draft
 * (see create.tsx); media uploaded before an invite row existed lives
 * under that key's draft folder. Read failures just skip the Gap A
 * copy — the publish itself must not hinge on localStorage access.
 */
const DRAFT_MEDIA_KEY_STORAGE = "invite-draft-media-key";

function readDraftMediaKey(): string | null {
  try {
    return localStorage.getItem(DRAFT_MEDIA_KEY_STORAGE);
  } catch {
    return null;
  }
}

function Publish() {
  const search = useSearch({ from: "/publish" });
  const inviteParam = search.invite;
  const [draft, setDraft] = useState<LocalDraft | null | undefined>(undefined);
  const [existingRow, setExistingRow] = useState<InviteRow | null | undefined>(
    undefined,
  );
  const [existingFailed, setExistingFailed] = useState(false);
  const [inviteId, setInviteId] = useState<string | null>(null);
  const [isCreatingInvite, setIsCreatingInvite] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { session, loading: authLoading } = useAuth();
  const user = session?.user ?? null;
  const navigate = useNavigate();

  useEffect(() => setDraft(readDraft()), []);

  // NF-2: with ?invite=<id> the subject is an existing database invite
  // (created on the dashboard, edited in /editor/$id), loaded through
  // the owner's own RLS-scoped client.
  useEffect(() => {
    if (!inviteParam) return;
    let active = true;
    getInviteById(inviteParam)
      .then((row) => {
        if (active) setExistingRow(row);
      })
      .catch(() => {
        if (active) {
          setExistingRow(null);
          setExistingFailed(true);
        }
      });
    return () => {
      active = false;
    };
  }, [inviteParam]);

  const handlePublish = async () => {
    if (!user || !draft) return;
    // Same gate as the /create Publish button: nothing incomplete or
    // invalid may reach the pay step from here either.
    if (getDraftIssues(draft.config).length > 0) return;

    setIsCreatingInvite(true);
    setError(null);

    try {
      // Fix 3 (D3): reuse the row an earlier attempt created from
      // this draft when it is still the user's own draft — syncing
      // the latest reviewed config onto it — instead of inserting a
      // new row per attempt. If that row has been published since,
      // there is nothing to pay for again: stop, with no insert and
      // no checkout.
      let invite: InviteRow;
      // Impl round 2 (Agent C, C-2): the reuse lookup must fail
      // CLOSED. It used to convert EVERY error to null (= "create"),
      // so a transient network/DB/auth failure inserted a duplicate
      // row. Only a genuine not-found (PostgREST PGRST116 — which is
      // also what RLS invisibility and another account's row produce
      // through the user-scoped query) means create; anything else
      // rethrows into the publish error path below.
      const storedRow = draft.draftInviteId
        ? await getInviteById(draft.draftInviteId).catch((err: unknown) => {
            if ((err as { code?: string } | null)?.code === "PGRST116") {
              return null;
            }
            throw err;
          })
        : null;
      const decision = draftInviteReuse(storedRow, user.id);
      if (decision === "published") {
        setError(
          "This invitation is already published — you'll find its live link on your dashboard. There's nothing more to pay for.",
        );
        return;
      }
      if (decision === "reuse" && storedRow) {
        await saveInvite(storedRow.id, {
          config: draft.config,
          theme_id: draft.themeId,
        });
        invite = storedRow;
      } else {
        // Save the draft the customer just reviewed — names, date,
        // venue — as the invite's config. This used to pass only the
        // theme, so createInvite stored a blank config and the
        // paid-for invitation was published empty.
        // Impl round 2 (Agent C, C-3): the row's id is generated
        // HERE and recorded on the draft BEFORE the insert. If the
        // insert succeeds but its response is lost, a retry looks
        // the id up, finds its own row, and reuses it (the C-2 path)
        // instead of inserting a duplicate.
        const newInviteId = crypto.randomUUID();
        setDraftInviteId(newInviteId);
        invite = await createInvite(
          user.id,
          draft.themeId,
          draft.config,
          newInviteId,
        );
      }

      // Gap A: uploads made while the draft had no invite row live
      // under <userId>/draft-<key>/, which migration 0003's
      // published-read policy cannot match. Copy them under the new
      // invite's own folder and save the rewritten config BEFORE
      // checkout arms — a copy failure lands in the catch below, so
      // the customer sees the error instead of paying for an
      // invitation whose photos and song point at the draft folder.
      const draftKey = readDraftMediaKey();
      if (draftKey) {
        const copiedConfig = await copyDraftMediaToInvite(supabase, {
          userId: user.id,
          draftKey,
          inviteId: invite.id,
          config: draft.config,
        });
        if (copiedConfig !== draft.config) {
          await saveInvite(invite.id, { config: copiedConfig });
        }
      }

      setInviteId(invite.id);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create invite";
      setError(message);
    } finally {
      setIsCreatingInvite(false);
    }
  };

  // The publish subject: either the localStorage draft (the /create
  // flow) or, with ?invite=<id>, an existing database invite. Both are
  // rendered and validated identically below; the invite flow differs
  // only in that the invite already exists, so no createInvite call
  // stands between the customer and checkout.
  let subject: {
    config: InviteConfig;
    themeId: string;
    existingInviteId: string | null;
  } | null = null;

  if (inviteParam) {
    if (authLoading || existingRow === undefined) return null;

    if (existingFailed || !existingRow) {
      return (
        <div className="site">
          <SiteHeader />
          <main className="auth">
            <h1>We couldn’t find that invitation</h1>
            <p className="auth-sub">
              It may have been deleted, or it belongs to another account.
            </p>
            <Link to="/dashboard" className="btn btn-solid">
              Back to your invitations
            </Link>
          </main>
          <SiteFooter />
        </div>
      );
    }

    if (!user) {
      return (
        <div className="site">
          <SiteHeader />
          <main className="auth">
            <h1>Sign in to publish</h1>
            <p className="auth-sub">
              You need to be signed in as the invitation’s owner to publish it.
            </p>
            <Link to="/login" className="btn btn-solid">
              Sign in
            </Link>
          </main>
          <SiteFooter />
        </div>
      );
    }

    const resolved = resolvePublishSubject(existingRow, user.id);

    if (resolved.kind === "forbidden" || resolved.kind === "unavailable") {
      return (
        <div className="site">
          <SiteHeader />
          <main className="auth">
            <h1>This invitation can’t be published</h1>
            <p className="auth-sub">
              {resolved.kind === "forbidden"
                ? "It belongs to another account."
                : "It is archived, so it can no longer be published."}
            </p>
            <Link to="/dashboard" className="btn btn-solid">
              Back to your invitations
            </Link>
          </main>
          <SiteFooter />
        </div>
      );
    }

    if (resolved.kind === "published") {
      return (
        <div className="site">
          <SiteHeader />
          <main className="auth">
            <h1>Already published</h1>
            <p className="auth-sub">
              This invitation is live — anyone with the link can view it. There
              is nothing left to pay for.
            </p>
            <a
              href={`/i/${resolved.slug}`}
              className="btn btn-solid"
              target="_blank"
              rel="noreferrer"
            >
              Open your invitation
            </a>
            <p className="auth-back">
              <Link to="/dashboard">Back to your invitations</Link>
            </p>
          </main>
          <SiteFooter />
        </div>
      );
    }

    subject = {
      config: resolved.config,
      themeId: resolved.themeId,
      existingInviteId: resolved.inviteId,
    };
  } else {
    if (draft === undefined) return null;

    if (!draft) {
      return (
        <div className="site">
          <SiteHeader />
          <main className="auth">
            <h1>Nothing to publish yet</h1>
            <p className="auth-sub">Design your invitation first.</p>
            <Link to="/templates" className="btn btn-solid">
              Choose a design
            </Link>
          </main>
          <SiteFooter />
        </div>
      );
    }

    subject = {
      config: draft.config,
      themeId: draft.themeId,
      existingInviteId: null,
    };
  }

  const theme = getTheme(subject.themeId);
  const names = hostNames({ ...subject.config, slug: "", themeId: theme.id });
  const tier = theme.tier;
  // One flat price for every design, from the single source in
  // src/config/site.ts — a theme's tier no longer changes the price.
  const price = PUBLISH_PRICE_LABEL;
  const issues = getDraftIssues(subject.config);
  // Draft flow: the primary button first saves the draft as an invite
  // (handlePublish). Invite flow: the invite already exists — the
  // button simply arms checkout for that same invite id.
  const onPrimary = subject.existingInviteId
    ? () => setInviteId(subject.existingInviteId)
    : handlePublish;

  return (
    <div className="site">
      <SiteHeader />
      <main className="auth publish">
        <p className="eyebrow">Almost there</p>
        <h1>Publish your invitation</h1>

        <dl className="publish-summary">
          <div>
            <dt>Names</dt>
            <dd>{names || "Not filled in yet"}</dd>
          </div>
          <div>
            <dt>Design</dt>
            <dd>{theme.name}</dd>
          </div>
          <div>
            <dt>Date</dt>
            <dd>{subject.config.event.dateText || "Not filled in yet"}</dd>
          </div>
          <div>
            <dt>Venue</dt>
            <dd>{subject.config.event.venueName || "Not filled in yet"}</dd>
          </div>
          <div>
            <dt>WhatsApp for replies</dt>
            <dd>{subject.config.rsvp?.whatsapp || "Not filled in yet"}</dd>
          </div>
        </dl>

        {issues.length > 0 && (
          <div className="publish-issues" role="alert">
            <p>Before you can publish:</p>
            <ul>
              {issues.map((issue) => (
                <li key={issue.field}>{issue.message}</li>
              ))}
            </ul>
          </div>
        )}

        <ul className="publish-gets">
          {[
            "Your own link to share on WhatsApp",
            "Edit anytime before the wedding",
            "No watermark",
          ].map((item) => (
            <li key={item}>
              <Check size={15} /> {item}
            </li>
          ))}
        </ul>

        <p className="price">
          {price} <span>once</span>
        </p>

        {error && <div className="error-message">{error}</div>}

        {inviteId && user && issues.length === 0 ? (
          <YouPiCheckout
            inviteId={inviteId}
            userId={user.id}
            tier={tier}
            onSuccess={(response) => {
              // The real order id from the gateway response — this used
              // to navigate with the literal placeholder
              // `order_id=success`, which the success page could not
              // (and must not) treat as proof of payment. The gateway's
              // UTR is deliberately NOT passed along (DB-5): the
              // success page shows a transaction reference only from
              // the verified order row, never from the URL.
              navigate({
                to: "/order-success",
                search: { order_id: response.order_id },
              });
            }}
          />
        ) : (
          <button
            className="btn btn-solid"
            disabled={isCreatingInvite || !user || issues.length > 0}
            onClick={onPrimary}
          >
            {isCreatingInvite ? "Creating booking..." : `Pay ${price} to Publish`}
          </button>
        )}

        <p className="price-note">
          {issues.length > 0
            ? "Fix the items above in the editor, then come back to publish."
            : !user
              ? "Sign in to publish your invitation."
              : "Your design is saved. Payment is secured by YouPI PG."}
        </p>

        <p className="auth-back">
          {subject.existingInviteId ? (
            <Link to="/editor/$id" params={{ id: subject.existingInviteId }}>
              <ArrowLeft size={14} /> Back to editing
            </Link>
          ) : (
            <Link to="/create">
              <ArrowLeft size={14} /> Back to editing
            </Link>
          )}
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}