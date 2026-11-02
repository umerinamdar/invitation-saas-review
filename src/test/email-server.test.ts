import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// email-server.ts imports supabase-server.ts for getUserEmail, which
// throws at import time without real Supabase env vars — mocked here
// purely so the module can be imported; these tests exercise
// sendPaymentConfirmationEmail only (getUserEmail is a thin pass-through
// over the admin API with no interesting branches to unit-test beyond
// what the handler-level webhook tests already exercise).
vi.mock("@/lib/supabase-server", () => ({
  supabaseServer: { auth: { admin: { getUserById: vi.fn() } } },
}));

import { sendPaymentConfirmationEmail } from "@/lib/email-server";

// email-server.ts is best-effort by design: a missing RESEND_API_KEY or
// a failed send must never throw — the caller (the webhook handler)
// treats this as a side effect that cannot affect fulfilment.

let savedResendKey: string | undefined;
let savedEmailFrom: string | undefined;

beforeEach(() => {
  savedResendKey = process.env["RESEND_API_KEY"];
  savedEmailFrom = process.env["EMAIL_FROM"];
  delete process.env["RESEND_API_KEY"];
  delete process.env["EMAIL_FROM"];
});

afterEach(() => {
  if (savedResendKey === undefined) delete process.env["RESEND_API_KEY"];
  else process.env["RESEND_API_KEY"] = savedResendKey;
  if (savedEmailFrom === undefined) delete process.env["EMAIL_FROM"];
  else process.env["EMAIL_FROM"] = savedEmailFrom;
});

describe("sendPaymentConfirmationEmail", () => {
  it("returns not_configured and makes no network call when RESEND_API_KEY is unset", async () => {
    const fetchImpl = vi.fn();
    const result = await sendPaymentConfirmationEmail(
      {
        to: "guest@example.com",
        inviteUrl: null,
        amountMinor: 59900,
        currency: "INR",
      },
      { fetchImpl },
    );
    expect(result).toEqual({ ok: false, reason: "not_configured" });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("returns missing_recipient and makes no network call when `to` is empty", async () => {
    process.env["RESEND_API_KEY"] = "sentinel-key";
    const fetchImpl = vi.fn();
    const result = await sendPaymentConfirmationEmail(
      { to: "", inviteUrl: null, amountMinor: 59900, currency: "INR" },
      { fetchImpl },
    );
    expect(result).toEqual({ ok: false, reason: "missing_recipient" });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("posts to Resend with the configured key and recipient on success", async () => {
    process.env["RESEND_API_KEY"] = "sentinel-key";
    process.env["EMAIL_FROM"] =
      "EasyInviteMaker <notifications@easyinvitemaker.com>";
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(new Response("{}", { status: 200 }));

    const result = await sendPaymentConfirmationEmail(
      {
        to: "guest@example.com",
        inviteUrl: "https://easyinvitemaker.com/i/aarav-diya",
        amountMinor: 59900,
        currency: "INR",
      },
      { fetchImpl },
    );

    expect(result).toEqual({ ok: true });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [url, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.resend.com/emails");
    expect(init.method).toBe("POST");
    expect((init.headers as Record<string, string>)["Authorization"]).toBe(
      "Bearer sentinel-key",
    );
    const body = JSON.parse(init.body as string) as {
      from: string;
      to: string;
      subject: string;
      html: string;
    };
    expect(body.from).toBe(
      "EasyInviteMaker <notifications@easyinvitemaker.com>",
    );
    expect(body.to).toBe("guest@example.com");
    expect(body.html).toContain("https://easyinvitemaker.com/i/aarav-diya");
    expect(body.html).toContain("₹599.00");
  });

  it("omits the invite link entirely when inviteUrl is null", async () => {
    process.env["RESEND_API_KEY"] = "sentinel-key";
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(new Response("{}", { status: 200 }));

    await sendPaymentConfirmationEmail(
      {
        to: "guest@example.com",
        inviteUrl: null,
        amountMinor: 59900,
        currency: "INR",
      },
      { fetchImpl },
    );

    const [, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string) as { html: string };
    expect(body.html).not.toContain("<a href=");
  });

  it("returns http_error on a non-OK response, without throwing", async () => {
    process.env["RESEND_API_KEY"] = "sentinel-key";
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(new Response("{}", { status: 422 }));

    const result = await sendPaymentConfirmationEmail(
      {
        to: "guest@example.com",
        inviteUrl: null,
        amountMinor: 59900,
        currency: "INR",
      },
      { fetchImpl },
    );
    expect(result).toEqual({ ok: false, reason: "http_error" });
  });

  it("returns network_error when fetch rejects, without throwing", async () => {
    process.env["RESEND_API_KEY"] = "sentinel-key";
    const fetchImpl = vi.fn().mockRejectedValue(new Error("boom"));

    const result = await sendPaymentConfirmationEmail(
      {
        to: "guest@example.com",
        inviteUrl: null,
        amountMinor: 59900,
        currency: "INR",
      },
      { fetchImpl },
    );
    expect(result).toEqual({ ok: false, reason: "network_error" });
  });

  it("escapes HTML in the invite URL so a malicious slug cannot inject markup", async () => {
    process.env["RESEND_API_KEY"] = "sentinel-key";
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(new Response("{}", { status: 200 }));

    await sendPaymentConfirmationEmail(
      {
        to: "guest@example.com",
        inviteUrl: 'https://easyinvitemaker.com/i/"><script>alert(1)</script>',
        amountMinor: 59900,
        currency: "INR",
      },
      { fetchImpl },
    );

    const [, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string) as { html: string };
    expect(body.html).not.toContain("<script>");
  });
});
