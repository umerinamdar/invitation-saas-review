import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, AlertCircle, Clock } from "lucide-react";
import { BRAND, SiteFooter, SiteHeader } from "@/components/site/chrome";
import { getOrderById, type OrderRow } from "@/lib/orders-api";
import { getInviteById, toInvite } from "@/lib/invites-api";
import type { InviteRow } from "@/lib/supabase";
import { buildShareLinks, type ShareLinks } from "@/lib/share";
import { clearDraft, readDraft } from "@/lib/local-draft";

interface OrderSuccessSearch {
  order_id?: string | undefined;
}

export const Route = createFileRoute("/order-success")({
  validateSearch: (search: Record<string, unknown>): OrderSuccessSearch => ({
    order_id: (search["order_id"] as string | undefined) || undefined,
  }),
  head: () => ({
    meta: [
      { title: `Payment status — ${BRAND}` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrderSuccess,
});

export type OrderSuccessState = "published" | "pending" | "failed" | "unverified";

/**
 * What this page is allowed to claim, given what was actually verified.
 * "published" requires BOTH a paid order and a published invite —
 * anything else (no id, the old placeholder id, an unknown order, an
 * order still awaiting its webhook) must not be presented as success.
 * Pure so it can be unit-tested without rendering the route.
 */
export function orderSuccessState(
  orderId: string | undefined,
  order: OrderRow | null,
  inviteStatus: string | null,
): OrderSuccessState {
  if (!orderId || orderId === "success" || !order) return "unverified";
  if (order.status === "failed") return "failed";
  if (order.status === "paid" && inviteStatus === "published") return "published";
  return "pending";
}

/**
 * Release Fix 3 (D3): the local draft that produced an invite row is
 * finished once THAT row's order is verified published — only then is
 * it cleared, so the next /create visit doesn't resurrect an
 * already-paid design into a fresh publish attempt. The match is on
 * the draft's stored invite id against the order's invite id: the
 * ?invite= account flow stores no draft id, and an unrelated order
 * must never wipe a draft still being designed.
 */
export function shouldClearLocalDraft(
  state: OrderSuccessState,
  draftInviteId: string | undefined,
  orderInviteId: string | null,
): boolean {
  return (
    state === "published" &&
    Boolean(draftInviteId) &&
    draftInviteId === orderInviteId
  );
}

/**
 * Release Fix 8 (Agent C, C-1): the WhatsApp share links for this
 * page, built from the VERIFIED invite row via the same
 * buildShareLinks helper the dashboard uses — the button previously
 * hardcoded a wa.me link whose text contained no invitation URL at
 * all. Links exist only in the verified published state with a
 * published row in hand; anything else gets no share button rather
 * than a bare-text share.
 */
export function publishedShareLinks(
  state: OrderSuccessState,
  invite: InviteRow | null,
  baseUrl?: string,
): ShareLinks | null {
  if (state !== "published" || !invite || invite.status !== "published") {
    return null;
  }
  if (!invite.slug) return null;
  return buildShareLinks(toInvite(invite), baseUrl);
}

function OrderSuccess() {
  const search = useSearch({ from: "/order-success" });
  const orderId = search["order_id"];
  const [order, setOrder] = useState<OrderRow | null>(null);
  // Fix 8: the verified invite ROW is kept (not just its status) so
  // the published branch can build real share links from its slug.
  const [invite, setInvite] = useState<InviteRow | null>(null);
  const [checked, setChecked] = useState(false);
  const inviteStatus = invite?.status ?? null;

  useEffect(() => {
    let cancelled = false;
    async function verify() {
      // A missing or placeholder id can never be verified — don't even
      // attempt a lookup with it.
      if (!orderId || orderId === "success") {
        setChecked(true);
        return;
      }
      try {
        const found = await getOrderById(orderId);
        if (cancelled) return;
        setOrder(found);
        if (found?.invite_id) {
          const inviteRow = await getInviteById(found.invite_id).catch(
            () => null,
          );
          if (cancelled) return;
          setInvite(inviteRow);
        }
      } catch {
        // A failed lookup is not a failed payment — fall through to the
        // neutral state rather than claiming either way.
        if (!cancelled) setOrder(null);
      } finally {
        if (!cancelled) setChecked(true);
      }
    }
    void verify();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  const state: OrderSuccessState = !checked
    ? "pending"
    : orderSuccessState(orderId, order, inviteStatus);

  // Fix 3 (D3): clear the originating local draft once its own order
  // is verified published (see shouldClearLocalDraft).
  useEffect(() => {
    if (state !== "published" || !order) return;
    const draft = readDraft();
    if (shouldClearLocalDraft(state, draft?.draftInviteId, order.invite_id)) {
      clearDraft();
    }
  }, [state, order]);

  // DB-5: the transaction reference is shown ONLY when it comes from
  // the verified order row fetched above. A ?utr= URL parameter is
  // never rendered — anyone can craft a link carrying an invented
  // reference, and this page must not lend it the brand's credibility.
  const transactionRef =
    state === "published" || state === "pending"
      ? (order?.gateway_payment_id ?? undefined)
      : undefined;

  // Fix 8 (C-1): real share links for the verified published invite,
  // or no share button at all.
  const shareLinks = publishedShareLinks(state, invite);

  return (
    <div className="site">
      <SiteHeader />
      <main className="auth status-page">
        {state === "published" ? (
          <>
            <div className="status-icon success">
              <Check size={48} />
            </div>
            <h1>Payment received!</h1>
            <p className="lede">
              Your invitation has been published and is ready to share.
            </p>

            {transactionRef && (
              <div className="order-details">
                <p className="detail-label">Transaction reference:</p>
                <p className="detail-value">{transactionRef}</p>
              </div>
            )}

            <div className="status-page-actions">
              <Link to="/dashboard" className="btn btn-solid">
                Go to dashboard
              </Link>
              {shareLinks && (
                <a href={shareLinks.whatsappUrl} className="btn btn-quiet">
                  Share on WhatsApp
                </a>
              )}
            </div>

            <p className="status-note">
              Your invitation link has been added to your dashboard. You can edit it anytime.
            </p>
          </>
        ) : state === "failed" ? (
          <>
            <div className="status-icon">
              <AlertCircle size={48} />
            </div>
            <h1>Payment didn't go through</h1>
            <p className="lede">
              We couldn't confirm a successful payment for this order, so your
              invitation hasn't been published. You can try publishing again
              from your dashboard.
            </p>

            <div className="status-page-actions">
              <Link to="/dashboard" className="btn btn-solid">
                Go to dashboard
              </Link>
            </div>
          </>
        ) : state === "unverified" ? (
          <>
            <div className="status-icon">
              <AlertCircle size={48} />
            </div>
            <h1>No payment to confirm here</h1>
            <p className="lede">
              This page shows your payment status right after checkout. If
              you've just paid, open the link from your payment confirmation —
              or check your dashboard for your invitation's live link.
            </p>

            <div className="status-page-actions">
              <Link to="/dashboard" className="btn btn-solid">
                Go to dashboard
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="status-icon">
              <Clock size={48} />
            </div>
            <h1>We're confirming your payment</h1>
            <p className="lede">
              We're confirming your payment — this can take a moment. Check
              your dashboard for the live link.
            </p>

            {transactionRef && (
              <div className="order-details">
                <p className="detail-label">Transaction reference:</p>
                <p className="detail-value">{transactionRef}</p>
              </div>
            )}

            <div className="status-page-actions">
              <Link to="/dashboard" className="btn btn-solid">
                Go to dashboard
              </Link>
            </div>
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
