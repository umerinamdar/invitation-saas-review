import { supabaseServer } from "./supabase-server";

/**
 * Shared admin gate for the server-only /api/admin/* routes (analytics,
 * customers, ...). These routes have no RLS of their own to fall back
 * on — they call Google or the service-role Supabase client, bypassing
 * RLS entirely — so this check IS the access boundary, same bearer-
 * token pattern as /api/orders: identity comes only from a verified
 * Supabase session, never from the request itself.
 */
export type AdminAuthResult =
  { ok: true; userId: string } | { ok: false; status: 401 | 403 };

export async function requireAdmin(request: Request): Promise<AdminAuthResult> {
  const authHeader = request.headers.get("authorization");
  const accessToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : null;
  if (!accessToken) return { ok: false, status: 401 };

  const { data: authData, error: authError } =
    await supabaseServer.auth.getUser(accessToken);
  if (authError || !authData.user) return { ok: false, status: 401 };

  const { data: profile, error: profileError } = await supabaseServer
    .from("profiles")
    .select("is_admin")
    .eq("id", authData.user.id)
    .maybeSingle();
  if (profileError || profile?.is_admin !== true)
    return { ok: false, status: 403 };

  return { ok: true, userId: authData.user.id };
}
