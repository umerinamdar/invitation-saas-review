import { supabase } from "./supabase";

/**
 * Read-only admin data access (admin dashboard v1, migration 0007).
 *
 * The security boundary here is RLS, not this file: the queries below
 * deliberately carry NO owner predicate (unlike invites-api's DB-2
 * backstop), because widening is exactly the feature — migration 0007
 * adds SELECT-only "admin reads all ..." policies keyed on
 * public.is_admin(). For a non-admin caller the database still
 * narrows every result to what the pre-0007 policies already let
 * them see (their own orders/invites, published invites), so calling
 * these functions early can only ever return the caller's own data,
 * never someone else's. The /admin route nevertheless calls them
 * only after isCurrentUserAdmin() resolves true, so non-admins never
 * trigger the queries at all.
 *
 * is_admin itself can never be set through this client: 0007 revokes
 * the table-level UPDATE grant on profiles from `authenticated` and
 * grants back only (full_name, phone) at the column level, so a
 * self-flag PATCH fails with permission denied before RLS runs.
 */

export interface AdminOverview {
  /** Money actually taken: SUM(orders.amount_minor) over paid orders.
   *  amount_minor is integer paise (0001) — never a float. */
  totalRevenuePaise: number;
  ordersByStatus: Record<string, number>;
  totalInvites: number;
  totalUsers: number;
}

/** The orders columns the admin table displays — explicit list, no
 *  select('*'): the gateway ids and config-adjacent fields the page
 *  does not show are not fetched. */
export interface AdminOrderRow {
  id: string;
  user_id: string;
  invite_id: string | null;
  amount_minor: number;
  currency: string;
  status: string;
  created_at: string;
  paid_at: string | null;
}

export interface AdminInviteRow {
  id: string;
  user_id: string;
  slug: string;
  theme_id: string;
  status: string;
  created_at: string;
}

/** Same session-user lookup shape as invites-api's DB-2 helper. */
async function currentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

/**
 * Whether the signed-in user is flagged admin. Reads the caller's OWN
 * profile row, which the pre-existing 0001 "own profile" policy
 * already permits — this call needs no policy from 0007 and fails
 * closed (false) when signed out.
 */
export async function isCurrentUserAdmin(): Promise<boolean> {
  const userId = await currentUserId();
  if (!userId) return false;
  const { data, error } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return data?.is_admin === true;
}

export async function getAdminOverview(): Promise<AdminOverview> {
  // One read of (amount_minor, status) feeds both the revenue sum and
  // the per-status counts, so the two can never disagree about which
  // orders existed. Revenue = SUM(amount_minor) WHERE status='paid':
  // created/failed/refunded orders never took (or no longer hold)
  // the customer's money.
  const { data, error } = await supabase
    .from("orders")
    .select("amount_minor, status");
  if (error) throw error;

  const ordersByStatus: Record<string, number> = {};
  let totalRevenuePaise = 0;
  for (const row of data ?? []) {
    const status = row.status as string;
    ordersByStatus[status] = (ordersByStatus[status] ?? 0) + 1;
    if (status === "paid") totalRevenuePaise += row.amount_minor as number;
  }

  const invitesCount = await supabase
    .from("invites")
    .select("id", { count: "exact", head: true });
  if (invitesCount.error) throw invitesCount.error;

  const usersCount = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true });
  if (usersCount.error) throw usersCount.error;

  return {
    totalRevenuePaise,
    ordersByStatus,
    totalInvites: invitesCount.count ?? 0,
    totalUsers: usersCount.count ?? 0,
  };
}

export async function listRecentOrders(limit = 50): Promise<AdminOrderRow[]> {
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, user_id, invite_id, amount_minor, currency, status, created_at, paid_at",
    )
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as AdminOrderRow[];
}

export async function listRecentInvites(limit = 50): Promise<AdminInviteRow[]> {
  const { data, error } = await supabase
    .from("invites")
    .select("id, user_id, slug, theme_id, status, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as AdminInviteRow[];
}
