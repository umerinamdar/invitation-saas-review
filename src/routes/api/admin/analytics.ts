import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { supabaseServer } from "@/lib/supabase-server";
import { getGa4VisitorStats } from "@/lib/ga4-server";

/**
 * GA4 visitor stats for the admin dashboard. Same bearer-token pattern
 * as /api/orders: identity comes only from a verified Supabase session
 * (supabaseServer.auth.getUser), never from the request itself. Unlike
 * /api/orders this also checks is_admin — this route has no RLS of its
 * own to fall back on (it calls Google, not the database), so the
 * admin check here IS the access boundary.
 */
export async function GET(request: Request) {
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

  const { data: profile, error: profileError } = await supabaseServer
    .from("profiles")
    .select("is_admin")
    .eq("id", authData.user.id)
    .maybeSingle();
  if (profileError || profile?.is_admin !== true) {
    return json({ error: "Forbidden" }, { status: 403 });
  }

  const stats = await getGa4VisitorStats();
  return json(stats, { headers: { "Cache-Control": "no-store" } });
}

export const Route = createFileRoute("/api/admin/analytics")({
  server: {
    handlers: {
      GET: ({ request }) => GET(request),
    },
  },
});
