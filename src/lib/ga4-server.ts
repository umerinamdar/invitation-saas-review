/**
 * Server-only read access to GA4 visitor counts via the Google
 * Analytics Data API (https://developers.google.com/analytics/devguides/reporting/data/v1),
 * authenticated as a service account.
 *
 * GA4's own dashboard already shows this; the only reason this exists
 * is so /admin can show it in the same place as signups/invites/
 * orders, instead of a second site the owner has to remember to open.
 *
 * Deliberately best-effort, like email-server.ts: a missing/incomplete
 * service-account configuration or a failed Google call returns a
 * typed failure instead of throwing, so one broken analytics call
 * never takes down the rest of the admin dashboard.
 *
 * Auth flow: Cloudflare Workers have no Node `crypto`/OAuth client
 * libraries, so the service-account JWT (RFC 7523) is built and
 * RS256-signed by hand with WebCrypto (available in both Workers and
 * Node 22+, used here and in tests identically) rather than pulling
 * in Google's Node SDK.
 */

export interface Ga4Options {
  /** Injectable for tests; defaults to the global fetch. */
  fetchImpl?: typeof fetch;
}

export type Ga4FailureReason =
  "not_configured" | "auth_error" | "api_error" | "network_error";

export interface Ga4PeriodStats {
  activeUsers: number;
  pageViews: number;
}

export type Ga4StatsResult =
  | { ok: true; last7Days: Ga4PeriodStats; last30Days: Ga4PeriodStats }
  | { ok: false; reason: Ga4FailureReason };

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SCOPE = "https://www.googleapis.com/auth/analytics.readonly";

function base64UrlEncode(data: ArrayBuffer | string): string {
  const bytes =
    typeof data === "string"
      ? new TextEncoder().encode(data)
      : new Uint8Array(data);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function pemToPkcs8(pem: string): ArrayBuffer {
  const base64 = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s+/g, "");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

async function signServiceAccountJwt(
  email: string,
  privateKeyPem: string,
): Promise<string> {
  const header = { alg: "RS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const claims = {
    iss: email,
    scope: SCOPE,
    aud: TOKEN_URL,
    exp: now + 3600,
    iat: now,
  };
  const unsigned = `${base64UrlEncode(JSON.stringify(header))}.${base64UrlEncode(
    JSON.stringify(claims),
  )}`;
  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToPkcs8(privateKeyPem),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(unsigned),
  );
  return `${unsigned}.${base64UrlEncode(signature)}`;
}

async function getAccessToken(
  email: string,
  privateKeyPem: string,
  fetchImpl: typeof fetch,
): Promise<string | null> {
  const jwt = await signServiceAccountJwt(email, privateKeyPem);
  const response = await fetchImpl(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }).toString(),
  });
  if (!response.ok) return null;
  const data = (await response.json()) as { access_token?: string };
  return data.access_token ?? null;
}

interface RunReportResponse {
  rows?: {
    dimensionValues?: { value: string }[];
    metricValues?: { value: string }[];
  }[];
}

/**
 * Active users + page views for the trailing 7 and 30 days, read as
 * two named date ranges in a single runReport call so both periods
 * come from one consistent snapshot.
 */
export async function getGa4VisitorStats(
  options: Ga4Options = {},
): Promise<Ga4StatsResult> {
  const email = process.env["GA4_SERVICE_ACCOUNT_EMAIL"];
  const privateKeyRaw = process.env["GA4_SERVICE_ACCOUNT_KEY"];
  const propertyId = process.env["GA4_PROPERTY_ID"];
  if (!email || !privateKeyRaw || !propertyId) {
    return { ok: false, reason: "not_configured" };
  }
  const privateKey = privateKeyRaw.replace(/\\n/g, "\n");
  const fetchImpl = options.fetchImpl ?? fetch;

  let accessToken: string | null;
  try {
    accessToken = await getAccessToken(email, privateKey, fetchImpl);
  } catch {
    return { ok: false, reason: "network_error" };
  }
  if (!accessToken) return { ok: false, reason: "auth_error" };

  let response: Response;
  try {
    response = await fetchImpl(
      `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dateRanges: [
            { startDate: "7daysAgo", endDate: "today", name: "last7" },
            { startDate: "30daysAgo", endDate: "today", name: "last30" },
          ],
          dimensions: [{ name: "dateRange" }],
          metrics: [{ name: "activeUsers" }, { name: "screenPageViews" }],
        }),
      },
    );
  } catch {
    return { ok: false, reason: "network_error" };
  }
  if (!response.ok) return { ok: false, reason: "api_error" };

  const data = (await response.json()) as RunReportResponse;
  const rowFor = (name: string) =>
    data.rows?.find((row) => row.dimensionValues?.[0]?.value === name);
  const last7 = rowFor("last7");
  const last30 = rowFor("last30");
  if (!last7 || !last30) return { ok: false, reason: "api_error" };

  const toStats = (row: NonNullable<typeof last7>): Ga4PeriodStats => ({
    activeUsers: Number(row.metricValues?.[0]?.value ?? 0),
    pageViews: Number(row.metricValues?.[1]?.value ?? 0),
  });

  return {
    ok: true,
    last7Days: toStats(last7),
    last30Days: toStats(last30),
  };
}
