import { defineConfig, devices } from "@playwright/test";

/**
 * A fixed, dedicated port (not the dev-server's auto-incrementing 8080+)
 * so this config never collides with a dev server already running for
 * manual testing, and smoke.spec.ts's BASE_URL always resolves correctly.
 */
const PORT = 4173;

export default defineConfig({
  testDir: "./tests",
  // Serial, not parallel: these tests share one Vite dev server, which
  // compiles each route on first hit (dev-mode SSR) — concurrent workers
  // hitting different routes simultaneously caused real contention/
  // timeouts here, not a genuine app bug (every test passes reliably in
  // isolation). A 5-test smoke suite doesn't need the parallelism badly
  // enough to trade away that stability.
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `npm run dev -- --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
