import "./lib/error-capture";

import { applyCacheHeaders } from "./lib/cache-headers";
import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { serverEnvStatus } from "./lib/env";
import { maintenanceGate } from "./lib/maintenance";
import { applySecurityHeaders } from "./lib/security-headers";

// Startup configuration check (Round 2, §7.1): ONE loud line naming any
// missing required server env vars — names only, never values — instead
// of each endpoint discovering the problem as a late per-request 500.
// Deliberately not a throw: on Workers a boot throw takes every route
// down on cold start, including pages that never need the missing
// variable; the affected endpoints already fail closed per request
// (see src/lib/env.ts).
const envStatus = serverEnvStatus();
if (!envStatus.ok) {
  console.error(
    `[startup] Missing required server environment variables: ${envStatus.missing.join(", ")}. Dependent features will fail until these are set.`,
  );
}

type ServerEntry = {
  fetch: (
    request: Request,
    env: unknown,
    ctx: unknown,
  ) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(
  response: Response,
): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(
    consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`),
  );
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as {
      unhandled?: unknown;
      message?: unknown;
    };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    // Owner decision 2026-10-24: the site is not ready for real
    // visitors while development continues. Checked before anything
    // else — SSR, Supabase, YouPI never run for a gated request.
    const maintenance = maintenanceGate(request);
    if (maintenance) return applySecurityHeaders(maintenance);

    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return applyCacheHeaders(
        applySecurityHeaders(await normalizeCatastrophicSsrResponse(response)),
        request,
      );
    } catch (error) {
      console.error(error);
      return applyCacheHeaders(
        applySecurityHeaders(
          new Response(renderErrorPage(), {
            status: 500,
            headers: { "content-type": "text/html; charset=utf-8" },
          }),
        ),
        request,
      );
    }
  },
};
