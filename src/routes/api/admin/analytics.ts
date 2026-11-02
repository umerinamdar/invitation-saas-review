import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { requireAdmin } from "@/lib/admin-auth-server";
import { getGa4VisitorStats } from "@/lib/ga4-server";

/** GA4 visitor stats for the admin dashboard — see requireAdmin for the
 *  access-boundary rationale shared with /api/admin/customers. */
export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return json(
      { error: auth.status === 401 ? "Unauthorized" : "Forbidden" },
      { status: auth.status },
    );
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
