import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it, vi } from "vitest";

// The route tree now includes the /api server routes (R-1 wiring fix),
// whose modules import the service-role Supabase client — it throws at
// module load when server env vars are absent. Route matching never
// invokes the handlers, so stub the client out entirely, the same way
// orders-auth.test.ts and webhook-fulfilment.test.ts already do.
vi.mock("@/lib/supabase-server", () => ({ supabaseServer: {} }));

import { routeTree } from "@/routeTree.gen";

// Match routes without running loaders or rendering: loaders may need a server or
// network the test run lacks, and jsdom never loads the stylesheets React waits on.
describe("App routing", () => {
  it("matches a page for / instead of falling back to not found", () => {
    const router = createRouter({
      routeTree,
      context: { queryClient: new QueryClient() },
    });

    const matches = router.matchRoutes("/");

    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
  });
});
