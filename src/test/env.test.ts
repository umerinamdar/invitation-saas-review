import { afterEach, describe, expect, it } from "vitest";
import { REQUIRED_SERVER_ENV, serverEnvStatus } from "@/lib/env";

// Round 2 (§7.1): startup configuration validation. serverEnvStatus()
// reports WHICH required server env vars are missing — names only, never
// values — so src/server.ts can log one loud startup line instead of
// each endpoint discovering the problem as a late per-request 500.
describe("serverEnvStatus", () => {
  const fullEnv = Object.fromEntries(
    REQUIRED_SERVER_ENV.map((name) => [name, "set"]),
  );

  it("requires exactly the server env vars the code reads", () => {
    expect([...REQUIRED_SERVER_ENV]).toEqual([
      "VITE_SUPABASE_URL",
      "SUPABASE_SERVICE_ROLE_KEY",
      "VITE_RAZORPAY_KEY_ID",
      "RAZORPAY_KEY_SECRET",
      "RAZORPAY_WEBHOOK_SECRET",
    ]);
  });

  it("is ok when every required variable is present", () => {
    const status = serverEnvStatus(fullEnv);
    expect(status.ok).toBe(true);
    expect(status.missing).toEqual([]);
  });

  it("lists exactly the missing names, in canonical order", () => {
    const status = serverEnvStatus({
      RAZORPAY_KEY_SECRET: "set",
      VITE_SUPABASE_URL: "set",
    });
    expect(status.ok).toBe(false);
    expect(status.missing).toEqual([
      "SUPABASE_SERVICE_ROLE_KEY",
      "VITE_RAZORPAY_KEY_ID",
      "RAZORPAY_WEBHOOK_SECRET",
    ]);
  });

  it("treats empty and whitespace-only values as missing", () => {
    const status = serverEnvStatus({
      ...fullEnv,
      SUPABASE_SERVICE_ROLE_KEY: "",
      RAZORPAY_WEBHOOK_SECRET: "   ",
    });
    expect(status.ok).toBe(false);
    expect(status.missing).toEqual([
      "SUPABASE_SERVICE_ROLE_KEY",
      "RAZORPAY_WEBHOOK_SECRET",
    ]);
  });

  it("never includes env values in the result", () => {
    const sentinel = "sentinel-value-must-not-leak";
    const status = serverEnvStatus({
      VITE_SUPABASE_URL: sentinel,
      SUPABASE_SERVICE_ROLE_KEY: sentinel,
    });
    expect(JSON.stringify(status)).not.toContain(sentinel);
    // Missing entries are bare names, nothing else.
    expect(status.missing).toEqual([
      "VITE_RAZORPAY_KEY_ID",
      "RAZORPAY_KEY_SECRET",
      "RAZORPAY_WEBHOOK_SECRET",
    ]);
    for (const name of status.missing) {
      expect(REQUIRED_SERVER_ENV).toContain(name);
    }
  });

  describe("default argument (process.env)", () => {
    const saved = { ...process.env };

    afterEach(() => {
      for (const key of Object.keys(process.env)) {
        if (!(key in saved)) delete process.env[key];
      }
      Object.assign(process.env, saved);
    });

    it("reads process.env when no argument is given", () => {
      for (const name of REQUIRED_SERVER_ENV) {
        process.env[name] = "set";
      }
      delete process.env["RAZORPAY_WEBHOOK_SECRET"];
      const status = serverEnvStatus();
      expect(status.ok).toBe(false);
      expect(status.missing).toEqual(["RAZORPAY_WEBHOOK_SECRET"]);
    });
  });
});
