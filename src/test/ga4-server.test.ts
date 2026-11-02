import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { getGa4VisitorStats } from "@/lib/ga4-server";

// ga4-server.ts is best-effort by design, like email-server.ts: a
// missing/incomplete service-account configuration or a failed Google
// call must return a typed failure, never throw — a broken analytics
// call must never take down the rest of /admin.

let savedEmail: string | undefined;
let savedKey: string | undefined;
let savedPropertyId: string | undefined;
let testPrivateKeyPem: string;

beforeAll(async () => {
  // A real (throwaway, test-only) RSA keypair so signServiceAccountJwt's
  // actual WebCrypto signing path runs end to end, same as production —
  // this is what the Google token endpoint would verify, just mocked
  // here instead of actually reaching Google.
  const keyPair = await crypto.subtle.generateKey(
    {
      name: "RSASSA-PKCS1-v1_5",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["sign", "verify"],
  );
  const pkcs8 = await crypto.subtle.exportKey("pkcs8", keyPair.privateKey);
  const base64 = Buffer.from(pkcs8).toString("base64");
  const lines = base64.match(/.{1,64}/g) ?? [];
  testPrivateKeyPem = [
    "-----BEGIN PRIVATE KEY-----",
    ...lines,
    "-----END PRIVATE KEY-----",
  ].join("\n");
});

beforeEach(() => {
  savedEmail = process.env["GA4_SERVICE_ACCOUNT_EMAIL"];
  savedKey = process.env["GA4_SERVICE_ACCOUNT_KEY"];
  savedPropertyId = process.env["GA4_PROPERTY_ID"];
  delete process.env["GA4_SERVICE_ACCOUNT_EMAIL"];
  delete process.env["GA4_SERVICE_ACCOUNT_KEY"];
  delete process.env["GA4_PROPERTY_ID"];
});

afterEach(() => {
  for (const [name, value] of [
    ["GA4_SERVICE_ACCOUNT_EMAIL", savedEmail],
    ["GA4_SERVICE_ACCOUNT_KEY", savedKey],
    ["GA4_PROPERTY_ID", savedPropertyId],
  ] as const) {
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  }
});

function configure() {
  process.env["GA4_SERVICE_ACCOUNT_EMAIL"] =
    "ga4-reader@project.iam.gserviceaccount.com";
  process.env["GA4_SERVICE_ACCOUNT_KEY"] = testPrivateKeyPem;
  process.env["GA4_PROPERTY_ID"] = "123456789";
}

function runReportResponse() {
  return new Response(
    JSON.stringify({
      rows: [
        {
          dimensionValues: [{ value: "last7" }],
          metricValues: [{ value: "42" }, { value: "100" }],
        },
        {
          dimensionValues: [{ value: "last30" }],
          metricValues: [{ value: "500" }, { value: "1200" }],
        },
      ],
    }),
    { status: 200 },
  );
}

describe("getGa4VisitorStats", () => {
  it("returns not_configured and makes no network call when env is unset", async () => {
    const fetchImpl = vi.fn();
    const result = await getGa4VisitorStats({ fetchImpl });
    expect(result).toEqual({ ok: false, reason: "not_configured" });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("signs a JWT, exchanges it, and returns both periods on success", async () => {
    configure();
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ access_token: "sentinel-token" }), {
          status: 200,
        }),
      )
      .mockResolvedValueOnce(runReportResponse());

    const result = await getGa4VisitorStats({ fetchImpl });

    expect(result).toEqual({
      ok: true,
      last7Days: { activeUsers: 42, pageViews: 100 },
      last30Days: { activeUsers: 500, pageViews: 1200 },
    });
    expect(fetchImpl).toHaveBeenCalledTimes(2);

    const [tokenUrl, tokenInit] = fetchImpl.mock.calls[0] as [
      string,
      RequestInit,
    ];
    expect(tokenUrl).toBe("https://oauth2.googleapis.com/token");
    const tokenBody = new URLSearchParams(tokenInit.body as string);
    expect(tokenBody.get("grant_type")).toBe(
      "urn:ietf:params:oauth:grant-type:jwt-bearer",
    );
    const jwt = tokenBody.get("assertion") ?? "";
    const [, claimsPart] = jwt.split(".");
    const claims = JSON.parse(
      Buffer.from(claimsPart ?? "", "base64url").toString(),
    ) as { iss: string; scope: string };
    expect(claims.iss).toBe("ga4-reader@project.iam.gserviceaccount.com");
    expect(claims.scope).toBe(
      "https://www.googleapis.com/auth/analytics.readonly",
    );

    const [reportUrl, reportInit] = fetchImpl.mock.calls[1] as [
      string,
      RequestInit,
    ];
    expect(reportUrl).toBe(
      "https://analyticsdata.googleapis.com/v1beta/properties/123456789:runReport",
    );
    expect(
      (reportInit.headers as Record<string, string>)["Authorization"],
    ).toBe("Bearer sentinel-token");
  });

  it("returns auth_error when the token exchange is not OK", async () => {
    configure();
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(new Response("denied", { status: 401 }));

    const result = await getGa4VisitorStats({ fetchImpl });
    expect(result).toEqual({ ok: false, reason: "auth_error" });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("returns api_error when runReport is not OK", async () => {
    configure();
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ access_token: "sentinel-token" }), {
          status: 200,
        }),
      )
      .mockResolvedValueOnce(new Response("boom", { status: 500 }));

    const result = await getGa4VisitorStats({ fetchImpl });
    expect(result).toEqual({ ok: false, reason: "api_error" });
  });

  it("returns api_error when the expected date-range rows are missing", async () => {
    configure();
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ access_token: "sentinel-token" }), {
          status: 200,
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ rows: [] }), { status: 200 }),
      );

    const result = await getGa4VisitorStats({ fetchImpl });
    expect(result).toEqual({ ok: false, reason: "api_error" });
  });

  it("returns network_error when the token fetch rejects, without throwing", async () => {
    configure();
    const fetchImpl = vi.fn().mockRejectedValue(new Error("offline"));

    const result = await getGa4VisitorStats({ fetchImpl });
    expect(result).toEqual({ ok: false, reason: "network_error" });
  });
});
