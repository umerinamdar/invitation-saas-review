/**
 * Order-creation identity decision (Batch 2 / Task 4).
 *
 * /api/orders inserts with the service-role client, which bypasses RLS —
 * so the user id on the insert must come from a verified Supabase session
 * (the Authorization bearer token, checked via auth.getUser), never from
 * the request body. This pure helper is the decision seam the handler
 * executes after token verification:
 *
 * - No verified session → 401, regardless of any body userId.
 * - Session present, body userId absent → proceed under the session id
 *   (absent is tolerated for one release while older clients roll over).
 * - Session present, body userId equal → proceed under the session id.
 * - Session present, body userId different → 403. A client that names a
 *   different owner is never silently obeyed or silently overridden.
 */
export type OrderUserDecision =
  { ok: true; userId: string } | { ok: false; status: 401 | 403 };

export function decideOrderUser(input: {
  sessionUserId: string | null | undefined;
  bodyUserId: unknown;
}): OrderUserDecision {
  const { sessionUserId, bodyUserId } = input;

  if (!sessionUserId) {
    return { ok: false, status: 401 };
  }

  const claimed =
    typeof bodyUserId === "string" && bodyUserId.length > 0
      ? bodyUserId
      : undefined;

  if (claimed !== undefined && claimed !== sessionUserId) {
    return { ok: false, status: 403 };
  }

  return { ok: true, userId: sessionUserId };
}
