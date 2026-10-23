import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { supabaseServer } from "@/lib/supabase-server";
import { decideOrderUser } from "@/lib/orders-auth";
import { getStoredInviteIssues } from "@/lib/draft-validation";
import { clientIpFromRequest, createRateLimiter } from "@/lib/rate-limit";
import { PUBLISH_PRICE_PAISE } from "@/config/site";

// Batch 2 / Task 5: per-isolate rate-limit backstop for order creation
// — 10 requests/minute per client IP + session user. NOT a complete
// production control: Workers isolates share no memory, so counts are
// per-isolate only (see the honesty note in src/lib/rate-limit.ts).
// The real control is the owner's Cloudflare WAF rate-limiting rule.
const ordersRateLimiter = createRateLimiter({ limit: 10, windowMs: 60_000 });

// Batch 2 / Task 4: this handler and src/components/youpi-checkout.tsx
// are ONE contract — the checkout sends the caller's session access
// token and this handler requires it. Ship them together; roll back
// together (restore both files to their priority-round state, remove
// src/lib/orders-auth.ts, redeploy).
export async function POST(request: Request) {
  try {
    // Authenticate first. Identity comes only from the verified Supabase
    // session behind the bearer token — never from the request body.
    // supabaseServer.auth.getUser asks the Auth server to validate the
    // token (signature + expiry) and returns the authoritative user.
    const authHeader = request.headers.get("authorization");
    const accessToken = authHeader?.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length)
      : null;
    if (!accessToken) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }
    const { data: authData, error: authError } =
      await supabaseServer.auth.getUser(accessToken);
    if (authError || !authData.user) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }
    const sessionUserId = authData.user.id;

    // Rate-limit AFTER authentication, so the key binds the verified
    // session user to the client IP: burning this quota takes one
    // account AND one address, and unauthenticated requests (already
    // rejected above) never consume it.
    const rate = ordersRateLimiter.check(
      `${clientIpFromRequest(request)}:${sessionUserId}`,
    );
    if (!rate.allowed) {
      return json(
        { error: "Too many requests" },
        {
          status: 429,
          headers: { "Retry-After": String(rate.retryAfterSeconds) },
        },
      );
    }

    // API-ORDERS-1 (owner-approved follow-up, 2026-10-23): guard the
    // body parse. request.json() throws on malformed JSON and returns
    // null for a "null" body; both used to land in the catch-all below
    // as a 500. A body that is not a JSON object is a client error —
    // 400 with the route's machine-code style (orderErrorMessage maps
    // unknown codes to a generic message, so no raw code can render).
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return json({ error: "invalid_json" }, { status: 400 });
    }
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return json({ error: "invalid_json" }, { status: 400 });
    }
    const { userId, inviteId, tier, amountMinor } = body as {
      userId?: unknown;
      inviteId?: string;
      tier?: string;
      amountMinor?: number;
    };

    if (!inviteId || !tier || amountMinor === undefined) {
      return json({ error: "Missing fields" }, { status: 400 });
    }

    // The body may still carry userId for one release, but it is only
    // ever checked against the session: a mismatch is rejected, an
    // absent value is tolerated, and the session id is the only id
    // ever used for the ownership check and the insert.
    const decision = decideOrderUser({
      sessionUserId,
      bodyUserId: userId,
    });
    if (!decision.ok) {
      const message = decision.status === 401 ? "Unauthorized" : "Forbidden";
      return json({ error: message }, { status: decision.status });
    }
    const ownerId = decision.userId;

    if (!["classic", "royal"].includes(tier)) {
      return json({ error: "Invalid tier" }, { status: 400 });
    }
    // The price is never the client's choice: it must be exactly the
    // single publish price from the shared config. (A client-chosen
    // amount in a loose range would let anyone pay ₹100 instead.)
    if (amountMinor !== PUBLISH_PRICE_PAISE) {
      return json({ error: "Invalid amount" }, { status: 400 });
    }

    // Verify invite belongs to the session user. The same fetch also
    // yields the invite's status for the state gate below — no extra
    // round trip.
    const { data: inviteRow } = await supabaseServer
      .from("invites")
      .select("user_id, config, status")
      .eq("id", inviteId)
      .maybeSingle();

    if (!inviteRow || inviteRow.user_id !== ownerId) {
      return json(
        { error: "Invite not found or unauthorized" },
        { status: 404 },
      );
    }

    // Round 3 / WS1: the publication state machine is enforced HERE,
    // not only in the /publish UI (resolvePublishSubject) — a direct
    // API call must not be able to buy what the UI would never offer.
    // Only a draft may initiate a publication payment: a published
    // invite must not trigger a second ₹599 charge for the same
    // publication, and an archived invite is retired. Unknown states
    // fail closed (a real row always carries one of the three —
    // 0001 CHECK constraint).
    if (inviteRow.status !== "draft") {
      return json({ error: "invite_not_publishable" }, { status: 409 });
    }

    // Round 3 / WS1: never sell a second publication for an invite
    // that already has a paid order. This also closes the
    // partial-failure residue window (order paid, publish still
    // outstanding, invite still a draft): recovery of that
    // publication belongs to the webhook's publish_only path, not to
    // a second checkout.
    //
    // Round 3.7 / Q-16 (Option D): the lookup now covers the invite's
    // ACTIVE orders — status "created" or "paid", newest first.
    // "paid" keeps the WS1 guard above. "created" means a checkout
    // for this invite is already open: the existing order is
    // RETURNED (same 201 shape as a fresh insert) instead of
    // inserting a duplicate — two orders for one invite were two
    // independent gateway checkouts under two order ids, and a
    // customer completing both was charged twice. "failed" and
    // "refunded" are deliberately NOT active: a failed payment never
    // blocks a retry, and a refunded order's invite is gated by its
    // own state above. Migration 0005's partial unique index is the
    // database backstop for the race this lookup cannot see (see
    // the insert's 23505 handling below).
    //
    // Round 3.5 (unchanged discipline): the lookup's error is
    // checked explicitly and thrown — a failed lookup is NEVER read
    // as "no active order". The throw lands in the catch below,
    // which logs the error class only (NF-7) and returns the
    // generic 500: no insert, no checkout, no DB detail in the
    // response.
    const lookupActiveOrder = async (): Promise<
      { kind: "paid" } | { kind: "created"; orderId: string } | { kind: "none" }
    > => {
      const { data: activeRows, error: activeLookupError } =
        await supabaseServer
          .from("orders")
          .select("id, status")
          .eq("invite_id", inviteId)
          .in("status", ["created", "paid"])
          .order("created_at", { ascending: false });

      if (activeLookupError) throw activeLookupError;

      const rows = (activeRows ?? []) as Array<{
        id: string;
        status: string;
      }>;
      if (rows.some((row) => row.status === "paid")) {
        return { kind: "paid" };
      }
      const created = rows.find((row) => row.status === "created");
      if (created) {
        return { kind: "created", orderId: created.id };
      }
      return { kind: "none" };
    };

    const active = await lookupActiveOrder();
    if (active.kind === "paid") {
      return json({ error: "invite_already_paid" }, { status: 409 });
    }

    // NF-3: re-check publish-readiness server-side. The /publish UI
    // gates on getDraftIssues, but that is a browser check — a direct
    // API call could otherwise create (and pay for) an order against
    // the owner's own blank invite, which the webhook would publish.
    // The stored config is held to exactly the same rules here; only
    // the issue COUNT leaves the server, never the config contents.
    //
    // Round 3.7 (adversarial review B): this gate runs BEFORE the
    // reuse return below, not only before the insert. The stored
    // config is re-read on every request, and an invite can be edited
    // after its order was created — returning the existing order
    // unchecked would hand back a payable checkout for an invite
    // that no longer passes the very check the order was created
    // under. The paid 409 above keeps its historical precedence.
    const issues = getStoredInviteIssues(inviteRow.config);
    if (issues.length > 0) {
      return json(
        { error: "invitation_incomplete", issues: issues.length },
        { status: 422 },
      );
    }

    if (active.kind === "created") {
      console.log("Reusing the invite's existing active order", {
        inviteId,
      });
      return json(
        { order_id: active.orderId, status: "created" },
        { status: 201 },
      );
    }

    const { data: order, error } = await supabaseServer
      .from("orders")
      .insert({
        user_id: ownerId,
        invite_id: inviteId,
        tier,
        amount_minor: amountMinor,
        currency: "INR",
        gateway: "youpi",
        status: "created",
      })
      .select()
      .single();

    if (error) {
      // Round 3.7 / Q-16: Postgres 23505 here means migration
      // 0005's partial unique index fired — a concurrent request
      // created (or already held) the invite's one active order in
      // the window between our lookup and our insert. Resolve from
      // that winning order exactly as the pre-insert lookup would
      // have (a dedicated log line keeps these translations
      // countable in production logs; ids only, nothing sensitive).
      // If the re-lookup finds nothing the state is unresolvable —
      // fall through to the generic 500 rather than guessing.
      if (error.code === "23505") {
        console.log(
          "Order insert conflicted with the invite's active order; resolving from it",
          { inviteId },
        );
        const raced = await lookupActiveOrder();
        if (raced.kind === "paid") {
          return json({ error: "invite_already_paid" }, { status: 409 });
        }
        if (raced.kind === "created") {
          return json(
            { order_id: raced.orderId, status: "created" },
            { status: 201 },
          );
        }
      }
      throw error;
    }
    return json({ order_id: order.id, status: "created" }, { status: 201 });
  } catch (err) {
    // Log the error class only (NF-7): the raw object can carry
    // Supabase internals into server logs. The webhook handler follows
    // the same discipline; the response stays generic either way.
    console.error("Order creation failed", {
      errorClass: err instanceof Error ? err.name : typeof err,
    });
    return json({ error: "Failed to create order" }, { status: 500 });
  }
}

// R-1 wiring fix (owner-approved follow-up to Batch 2, 2026-10-21):
// TanStack's route generator only mounts route files that export a
// `Route` created with createFileRoute — with only the bare POST export
// above, this file was excluded from the route tree and the production
// build answered POST /api/orders with the app's HTML 404. In TanStack
// Start 1.168 a server handler receives a context object
// ({ request, params, ... }) rather than the Request itself (see
// RouteMethodHandlerFn in @tanstack/start-client-core), so this
// registration is a thin adapter onto the existing POST(request)
// handler: its logic is unchanged, and the named POST export stays for
// src/test/orders-auth.test.ts, which imports it directly.
export const Route = createFileRoute("/api/orders")({
  server: {
    handlers: {
      POST: ({ request }) => POST(request),
    },
  },
});
