import { supabaseServer } from "./supabase-server";

/**
 * Payment confirmation email, sent via Resend's HTTP API (no SMTP —
 * Cloudflare Workers cannot open raw TCP sockets, so a provider with
 * a plain HTTPS API is required).
 *
 * This is deliberately best-effort: a missing RESEND_API_KEY or a
 * failed send is logged by the caller and never thrown. The payment
 * is already settled and the invite already published by the time
 * this runs (see the webhook's settled_published branch) — a flaky
 * email provider must never fail closed on money that already moved.
 */

export type SendEmailFailureReason =
  "not_configured" | "missing_recipient" | "http_error" | "network_error";

export type SendEmailResult =
  { ok: true } | { ok: false; reason: SendEmailFailureReason };

export interface PaymentConfirmationEmailParams {
  to: string;
  inviteUrl: string | null;
  amountMinor: number;
  currency: string;
}

export interface SendPaymentConfirmationEmailOptions {
  /** Injectable for tests; defaults to the global fetch. */
  fetchImpl?: typeof fetch;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatAmount(amountMinor: number, currency: string): string {
  const major = (amountMinor / 100).toFixed(2);
  return currency === "INR" ? `₹${major}` : `${major} ${currency}`;
}

function buildHtml(params: PaymentConfirmationEmailParams): string {
  const amount = escapeHtml(formatAmount(params.amountMinor, params.currency));
  const linkHtml = params.inviteUrl
    ? `<p><a href="${escapeHtml(params.inviteUrl)}" style="color:#5B1A2B;">${escapeHtml(params.inviteUrl)}</a></p>`
    : "";
  return `
    <div style="font-family:Georgia,serif;color:#1a1a1a;max-width:480px;margin:0 auto;">
      <h1 style="color:#5B1A2B;font-size:20px;">Payment received</h1>
      <p>Thank you — your payment of ${amount} was successful and your invitation is now published.</p>
      ${linkHtml}
      <p style="color:#666;font-size:13px;">EasyInviteMaker</p>
    </div>
  `.trim();
}

/**
 * Send the post-payment confirmation email via Resend
 * (https://resend.com/docs/api-reference/emails/send-email). Returns
 * a result instead of throwing — the caller decides how to log a
 * failure; the webhook's fulfilment outcome never depends on this.
 */
export async function sendPaymentConfirmationEmail(
  params: PaymentConfirmationEmailParams,
  options: SendPaymentConfirmationEmailOptions = {},
): Promise<SendEmailResult> {
  const apiKey = process.env["RESEND_API_KEY"];
  if (!apiKey) {
    return { ok: false, reason: "not_configured" };
  }
  if (!params.to) {
    return { ok: false, reason: "missing_recipient" };
  }

  const from =
    process.env["EMAIL_FROM"] || "EasyInviteMaker <onboarding@resend.dev>";
  const fetchImpl = options.fetchImpl ?? fetch;

  let response: Response;
  try {
    const init: RequestInit = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: params.to,
        subject: "Payment received — your invitation is published",
        html: buildHtml(params),
      }),
    };
    if (typeof AbortSignal !== "undefined" && "timeout" in AbortSignal) {
      init.signal = AbortSignal.timeout(10_000);
    }
    response = await fetchImpl("https://api.resend.com/emails", init);
  } catch {
    return { ok: false, reason: "network_error" };
  }

  if (!response.ok) {
    return { ok: false, reason: "http_error" };
  }
  return { ok: true };
}

/**
 * Look up a user's email by id via the Supabase Auth admin API
 * (service-role only — never exposed to the browser client). Returns
 * null on any failure or missing email so callers can skip the send
 * rather than throw on what is, again, a best-effort notification.
 */
export async function getUserEmail(userId: string): Promise<string | null> {
  try {
    const { data, error } = await supabaseServer.auth.admin.getUserById(userId);
    if (error || !data?.user?.email) return null;
    return data.user.email;
  } catch {
    return null;
  }
}
