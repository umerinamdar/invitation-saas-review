import { describe, expect, it } from "vitest";
import { maintenanceGate } from "@/lib/maintenance";

// Owner decision 2026-10-24: the site is not ready for real visitors
// while development continues. src/server.ts calls maintenanceGate()
// before anything else touches the request — this pins the contract so
// that check never silently drifts.
describe("maintenanceGate", () => {
  const ON = {
    MAINTENANCE_MODE: "true",
    MAINTENANCE_BYPASS_TOKEN: "secret123",
  };
  const OFF = {
    MAINTENANCE_MODE: "false",
    MAINTENANCE_BYPASS_TOKEN: "secret123",
  };

  it("does nothing when MAINTENANCE_MODE is unset or false", () => {
    expect(maintenanceGate(new Request("https://example.com/"), {})).toBeNull();
    expect(
      maintenanceGate(new Request("https://example.com/"), OFF),
    ).toBeNull();
  });

  it("serves a 503 maintenance page for an ordinary request when enabled", async () => {
    const response = maintenanceGate(new Request("https://example.com/"), ON);
    expect(response).not.toBeNull();
    expect(response!.status).toBe(503);
    expect(response!.headers.get("retry-after")).toBeTruthy();
    expect(response!.headers.get("content-type")).toContain("text/html");
    const body = await response!.text();
    expect(body).toContain("still building");
  });

  it("gates every path, not just the homepage", () => {
    const response = maintenanceGate(
      new Request("https://example.com/templates"),
      ON,
    );
    expect(response?.status).toBe(503);
  });

  it("a correct bypass query param redirects and sets the cookie, stripping the token from the URL", () => {
    const response = maintenanceGate(
      new Request("https://example.com/create?preview_token=secret123"),
      ON,
    );
    expect(response).not.toBeNull();
    expect(response!.status).toBe(302);
    expect(response!.headers.get("location")).toBe(
      "https://example.com/create",
    );
    const setCookie = response!.headers.get("set-cookie") ?? "";
    expect(setCookie).toContain("eim_preview=secret123");
    expect(setCookie).toContain("Secure");
  });

  it("a wrong bypass token is treated as no bypass at all", () => {
    const response = maintenanceGate(
      new Request("https://example.com/?preview_token=wrong"),
      ON,
    );
    expect(response?.status).toBe(503);
  });

  it("a request carrying the bypass cookie reaches the real app", () => {
    const response = maintenanceGate(
      new Request("https://example.com/dashboard", {
        headers: { cookie: "eim_preview=secret123" },
      }),
      ON,
    );
    expect(response).toBeNull();
  });

  it("a wrong cookie value does not bypass", () => {
    const response = maintenanceGate(
      new Request("https://example.com/dashboard", {
        headers: { cookie: "eim_preview=wrong" },
      }),
      ON,
    );
    expect(response?.status).toBe(503);
  });

  it("with no bypass token configured, no query param or cookie can ever bypass", () => {
    const response = maintenanceGate(
      new Request("https://example.com/?preview_token=anything"),
      { MAINTENANCE_MODE: "true" },
    );
    expect(response?.status).toBe(503);
  });
});
