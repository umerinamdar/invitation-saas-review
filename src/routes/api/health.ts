import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";

// Liveness probe for uptime monitoring and the release checklist.
//
// Deliberately LIVENESS, not readiness: this handler makes no database
// or gateway call. A transient Supabase or YouPI outage must not fail
// the probe — if it did, the host would restart healthy instances
// during exactly the incidents where restarts help least, and the
// monitor would cry wolf about the app instead of the dependency.
// Dependency trouble already surfaces in the orders/webhook logs; this
// endpoint only proves the worker is up and shows WHICH configuration
// is present, so an operator can spot a missing secret after a deploy
// without ever seeing its value.
//
// The response carries booleans only — never env values, URLs, or key
// material — so it is safe to expose unauthenticated. env is read at
// request time (not module load), both so the flags reflect the actual
// runtime configuration and so tests can stage env per-case. The
// request itself is accepted for parity with the other API handlers
// (and so tests drive it the same way) but never inspected.
export function GET(_request: Request) {
  const present = (name: string) => {
    const value = process.env[name];
    return typeof value === "string" && value.length > 0;
  };

  return json(
    {
      status: "ok",
      config: {
        supabaseUrl: present("VITE_SUPABASE_URL"),
        serviceRole: present("SUPABASE_SERVICE_ROLE_KEY"),
        youpiWebhook: present("YOUPI_WEBHOOK_SECRET"),
        youpiApiBase: present("YOUPI_API_BASE_URL"),
      },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

// Wiring (same R-1 pattern as /api/orders and /api/webhooks/youpi):
// TanStack's route generator only mounts route files that export a
// `Route` created with createFileRoute; in TanStack Start 1.168 a
// server handler receives a context object ({ request, params, ... }),
// so this registration is a thin adapter onto the GET handler above.
// Only GET is registered — other methods get the router's own
// method-not-allowed response rather than a handler.
export const Route = createFileRoute("/api/health")({
  server: {
    handlers: {
      GET: ({ request }) => GET(request),
    },
  },
});
