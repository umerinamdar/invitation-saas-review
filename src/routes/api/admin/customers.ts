import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { requireAdmin } from "@/lib/admin-auth-server";
import { listAdminUserEmails } from "@/lib/admin-customers-server";

/** id → email for every account, so /admin can show the real customer
 *  behind an invite/order instead of a truncated uuid. See
 *  requireAdmin for the access-boundary rationale. */
export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return json(
      { error: auth.status === 401 ? "Unauthorized" : "Forbidden" },
      { status: auth.status },
    );
  }

  try {
    const emails = await listAdminUserEmails();
    return json(emails, { headers: { "Cache-Control": "no-store" } });
  } catch (cause) {
    console.error("Failed to list admin user emails", {
      errorClass:
        cause instanceof Error ? cause.constructor.name : typeof cause,
    });
    return json({ error: "Failed to load customers" }, { status: 500 });
  }
}

export const Route = createFileRoute("/api/admin/customers")({
  server: {
    handlers: {
      GET: ({ request }) => GET(request),
    },
  },
});
