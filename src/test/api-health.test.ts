import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { GET, Route } from "@/routes/api/health";

// The health handler reads process.env at request time and imports no
// server clients, so these tests drive it directly with plain Requests
// and staged env vars — the same direct-handler style as
// orders-auth.test.ts, minus the Supabase stub.
const ENV_KEYS = [
  "VITE_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "VITE_RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET",
  "RAZORPAY_WEBHOOK_SECRET",
] as const;

const SENTINELS: Record<(typeof ENV_KEYS)[number], string> = {
  VITE_SUPABASE_URL: "https://sentinel-supabase-url.invalid",
  SUPABASE_SERVICE_ROLE_KEY: "sentinel-service-role-value",
  VITE_RAZORPAY_KEY_ID: "sentinel-razorpay-key-id",
  RAZORPAY_KEY_SECRET: "sentinel-razorpay-key-secret",
  RAZORPAY_WEBHOOK_SECRET: "sentinel-webhook-secret-value",
};

let savedEnv: Record<string, string | undefined>;

function healthRequest(): Request {
  return new Request("http://localhost/api/health", { method: "GET" });
}

beforeEach(() => {
  savedEnv = {};
  for (const key of ENV_KEYS) {
    savedEnv[key] = process.env[key];
    delete process.env[key];
  }
});

afterEach(() => {
  for (const key of ENV_KEYS) {
    if (savedEnv[key] === undefined) delete process.env[key];
    else process.env[key] = savedEnv[key];
  }
});

describe("GET /api/health", () => {
  it("returns 200 with status ok and all config flags false when unset", async () => {
    const res = await GET(healthRequest());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({
      status: "ok",
      config: {
        supabaseUrl: false,
        serviceRole: false,
        razorpayKeyId: false,
        razorpayKeySecret: false,
        razorpayWebhook: false,
      },
    });
  });

  it("flags each config item true only while its env var is present", async () => {
    for (const key of ENV_KEYS) process.env[key] = SENTINELS[key];
    const res = await GET(healthRequest());
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      config: Record<string, boolean>;
    };
    expect(body.config).toEqual({
      supabaseUrl: true,
      serviceRole: true,
      razorpayKeyId: true,
      razorpayKeySecret: true,
      razorpayWebhook: true,
    });
  });

  it("reflects a partial configuration per-variable", async () => {
    process.env["VITE_SUPABASE_URL"] = SENTINELS.VITE_SUPABASE_URL;
    process.env["RAZORPAY_WEBHOOK_SECRET"] = SENTINELS.RAZORPAY_WEBHOOK_SECRET;
    const body = (await (await GET(healthRequest())).json()) as {
      config: Record<string, boolean>;
    };
    expect(body.config).toEqual({
      supabaseUrl: true,
      serviceRole: false,
      razorpayKeyId: false,
      razorpayKeySecret: false,
      razorpayWebhook: true,
    });
  });

  it("never leaks an env value into the serialized response", async () => {
    for (const key of ENV_KEYS) process.env[key] = SENTINELS[key];
    const res = await GET(healthRequest());
    const text = await res.clone().text();
    for (const key of ENV_KEYS) {
      expect(text).not.toContain(SENTINELS[key]);
    }
    // The config object carries booleans only — no strings at all.
    const body = (await res.json()) as { config: Record<string, unknown> };
    for (const value of Object.values(body.config)) {
      expect(typeof value).toBe("boolean");
    }
  });

  it("treats an empty-string env var as absent", async () => {
    process.env["SUPABASE_SERVICE_ROLE_KEY"] = "";
    const body = (await (await GET(healthRequest())).json()) as {
      config: { serviceRole: boolean };
    };
    expect(body.config.serviceRole).toBe(false);
  });

  it("sends Cache-Control: no-store", async () => {
    const res = await GET(healthRequest());
    expect(res.headers.get("cache-control")).toBe("no-store");
  });

  it("registers only a GET handler, so other methods get no handler", () => {
    const handlers = (
      Route as unknown as {
        options: { server: { handlers: Record<string, unknown> } };
      }
    ).options.server.handlers;
    expect(Object.keys(handlers)).toEqual(["GET"]);
  });
});
