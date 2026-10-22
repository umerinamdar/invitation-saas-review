# SECURITY-REVIEW.md — EasyInviteMaker Production-Ready Mission

Status: **FINAL — Stage F (2026-10-21).** Built only from verified findings:
`mission/findings-stageA-security.md` (8 claims re-verified in code),
`mission/findings-stageB-auth.md` (auth/ownership audit, DB-1…DB-5), the wave
evidence logs in `mission/evidence/`, and the Stage E independent review
(`docs/FINAL-REVIEW-mission.md`). No claim below lacks a file, test, or probe
pointer. Live-system state (Supabase/Cloudflare/YouPI dashboards) is owner-side and
is never asserted here.

## Scope

- Server routes and data-access paths: `/api/orders`, `/api/webhooks/youpi`, all Supabase
  CRUD paths (browser client, server client), editor and dashboard flows.
- Payment integrity: YouPI checkout + webhook fulfilment, order state transitions,
  flat ₹599 (59,900 paise) enforcement, currency verification via gateway lookup.
- Authentication & ownership: session-based identity, cross-user access, RLS design
  (code-verifiable facts only; live state is owner-side).
- Database & storage: migrations 0001–0003, invite-media bucket policies and limits.
- Input safety: user-controlled fields, external URLs, rendering surfaces.
- Abuse prevention: rate limiting (in-code backstop + owner-side Cloudflare rule).
- Secrets & logging: bundle, logs, error messages, delivery ZIPs.
- Dependencies: audit results with the environment limitation noted below.

Out of scope: live Supabase / Cloudflare / YouPI configuration (owner-side only, see
`docs/RELEASE-CHECKLIST.md`); real payments; production deployment.

## Method

1. Read the actual current code in the work copy (no reliance on prior summaries).
2. Trace each security property to the code that enforces it; note file and line.
3. Pin properties with tests where a test seam exists (tests-first for fixes).
4. Independent reviewer inspects the diff for every security-sensitive change.
5. Separate three classes of statement throughout: **verified in code**,
   **verified by test/probe**, **requires owner-side dashboard confirmation**.

## The 20-point check table

The owner's 20-point audit list (mapped to this stack in `SECURITY-PLAN.md` §1),
dispositioned against verified mission evidence only. "Code-verified" means the
property was traced in the final tree and, where a seam exists, pinned by a test or
probe; it does not assert anything about the live deployment.

| # | Check | Verdict | Evidence |
|---|---|---|---|
| 1 | SQL injection | **No surface found (code-verified).** All data access is supabase-js/PostgREST with bound values (`.eq(...)` predicates); no string-built filters or raw SQL in app code were found in the data-access reviews. Live two-account DB matrix not run (needs live DB) | `mission/findings-stageB-auth.md` (query-site inventory); `mission/findings-stageA-security.md` claims 2–3 |
| 2 | XSS | **Verified in code.** React escapes rendered text by default; no `dangerouslySetInnerHTML` path in the invitation render; config-derived hrefs pass the http/https allowlist (`safeExternalUrl`); NF-6 fixed the one verbatim-reflection surface (`reason` param) | `mission/findings-stageA-security.md` claim 5 + NF-6; fix pinned by `src/test/order-failed.test.ts`, `src/test/venue-url-safety.test.ts` |
| 3 | CSRF | **Not applicable by design.** Auth is `Authorization: Bearer` header-based (Supabase session token), not ambient cookies; no cookie-authenticated state changer exists in the app | `src/routes/api/orders.ts` Bearer extraction; `mission/findings-stageA-security.md` claim 2 |
| 4 | Insecure file uploads | **WAS DEFECTIVE (NF-1, HIGH) → FIXED.** Uploads now go to Supabase Storage with a MIME allowlist string-identical to migration 0003, size caps inside the bucket limit, owner-scoped paths, `upsert:false`. Residual: Gap-B (below) | `mission/findings-stageA-security.md` NF-1; `src/lib/media-upload.ts`; `src/test/media-upload.test.ts` (14); Stage E §3e |
| 5 | IDOR / broken object-level authorization | **Code layer FIXED; live layer owner-side.** `/api/orders` verifies invite ownership server-side (404 on mismatch); browser invite paths gained `.eq("user_id", …)` predicates + fail-closed signed-out behaviour (DB-2 fix); publish resolves foreign invites to a forbidden shell. Underlying enforcement for browser reads is RLS → see #14 | `mission/findings-stageB-auth.md` DB-2; `src/test/data-access-scoping.test.ts` (11); `src/test/publish-subject.test.ts`; Stage E §3d/§3f |
| 6 | Missing rate limiting | **Present (code-verified), honestly bounded.** Orders 10/min per IP+user (after auth), webhook 120/min per IP; per-isolate backstop only — the production control is the owner's Cloudflare WAF rule | `mission/findings-stageA-security.md` claim 8; `src/lib/rate-limit.ts`; `src/test/rate-limit.test.ts` (11); checklist §2 |
| 7 | Insecure JWT secrets | **No finding (code-verified).** No JWT-shaped tokens anywhere in app code (Stage E regex scan); signing secrets are read from server env only | `docs/FINAL-REVIEW-mission.md` §2 (secret scan method + result) |
| 8 | Exposed API secrets | **No service secret exposed.** `.env` is byte-identical to the original and never packaged; server-only values appear only as `process.env` reads + placeholders in `.env.example`. One pre-existing note: the *public* publishable key literal sits in four owner probe scripts at the project root (NF-11, byte-identical to the original download; excluded from the delivery ZIP; owner quarantine item) | Stage E §2 + note N-1; `docs/RELEASE-CHECKLIST.md` §5 |
| 9 | Weak password hashing | **Not applicable — no hand-rolled auth.** All password handling is Supabase Auth's; no custom hashing code exists in the app | `mission/findings-stageB-auth.md` (all auth flows via `supabase.auth`) |
| 10 | Missing MFA | **Not implemented — consciously parked (owner scope decision).** Recorded as an accepted gap for this product's scale, not an oversight; no MFA enrolment exists in the auth flows | Owner lean-scope decision (mission brief); grep: no MFA code in `src/` (only an unused OTP input UI primitive) |
| 11 | Overly permissive CORS | **No CORS configuration exists in the app code** (zero `cors`/`access-control` occurrences in `src/` and build config — grep-verified in Stage F). The app is same-origin; any edge CORS policy is Cloudflare-side (owner) | Stage F grep, `mission/evidence/stageF-packaging.log` |
| 12 | Auth tokens in localStorage | **Known trade-off, retained.** Supabase browser client default storage; consciously not migrated in this mission (parked extra). See residual risk 5 | Residual risks §5 below |
| 13 | Client-side-only permission enforcement | **WAS PARTIAL → FIXED at the API layer.** Server now re-checks what the UI gates: order creation requires session auth + exact amount + ownership (claim 2) and, since NF-3, server-side invite completeness (422 before insert); browser data paths carry code-level ownership predicates (DB-2 fix) | `mission/findings-stageA-security.md` claim 4 (PARTIAL → closed by NF-3); `src/test/orders-auth.test.ts` (16); Stage E §3a |
| 14 | Missing row-level security (RLS) | **Design verified in migrations; LIVE STATE UNVERIFIED — LAUNCH BLOCKER (owner-side).** 0001's policies are the enforcement layer for browser reads/writes; whether they are live on the owner's project cannot be confirmed from code | `mission/findings-stageB-auth.md` DB-2 + §6; checklist §1 (RLS verification query) |
| 15 | Unverified webhook signatures | **Verified + corroborated.** HMAC-SHA256 with `timingSafeEqual`, ±5-minute timestamp window, delivery idempotency, and a server-side gateway lookup corroborating status + amount + currency before fulfilment; fail-closed on every mismatch | `mission/findings-stageA-security.md` claim 3; `src/test/webhook-fulfilment.test.ts` (37); Stage E §3b |
| 16 | SSRF | **No user-controlled server fetch.** The only server-side outbound fetch is to the configured `YOUPI_API_BASE_URL` with a payment id from a signature-verified payload; user-supplied URLs are rendered (allowlisted), never fetched server-side | `src/lib/orders-server.ts` (`fetchGatewayPayment`); `mission/findings-stageA-security.md` claim 5 |
| 17 | Exposed source maps | **No finding recorded; not separately verified.** No source-map setting exists in the build config reviewed; the mission made no build-config change here. A live-deployment check (fetch a built asset's `.map`) remains an owner-side spot check — not claimed either way | Stage F grep of `vite.config.ts`/`package.json` (no sourcemap config), `mission/evidence/stageF-packaging.log` |
| 18 | Default credentials | **None in this codebase.** The one default-credential risk in the system is the *gateway instance's* `ADMIN_API_TOKEN` — an explicit owner checklist item, not app code | Checklist §3 (`ADMIN_API_TOKEN` non-default) |
| 19 | Sensitive data in logs | **FIXED + verified.** NF-7 removed the last raw-error log in the money path; `orders-server.ts` contains zero `console.*` calls; handler catches log `errorClass` only; signature material is never logged; error responses are generic | `mission/findings-stageA-security.md` NF-7 + claim 3; Stage E §3a/§3b |
| 20 | Vulnerable dependencies | **Partially assessed — `npm audit` blocked in this environment (registry proxy 403).** GHSA substitute scan (Batch 2): 0 Critical / 1 High / 2 Medium, one launch-editor root cause via vite 8.1.5 (installed copy already patched; dev-only path). This mission's only dependency change: `qrcode` + `@types/qrcode` (Stage E-verified diff). Authoritative audit + the vite one-line pin decision are owner-side | `docs/TEST-RESULTS.md` (Stage A §6); Stage E §2/§6; checklist §5 |

## Verified-fixed table

Every row was implemented tests-first and (for the mission waves) confirmed by the
Stage E independent reviewer's own code re-read — `docs/FINAL-REVIEW-mission.md` §3.

| # | Finding | Severity | Status | Evidence |
|---|---|---|---|---|
| 1 | Batch 2: client-set price trusted by `/api/orders` | Critical | FIXED (pre-mission) — exact 59,900 paise enforced server-side | `mission/FINAL-REVIEW-batch2.md`; pinned by `src/test/orders-auth.test.ts` |
| 2 | Batch 2: webhook fulfilment via browser client could never succeed under the project's own RLS | Critical | FIXED (pre-mission) — service-role server client | `mission/FINAL-REVIEW-batch2.md` |
| 3 | Batch 2: checkout UI ↔ API contract mismatch (UI orders always 400) | High | FIXED (pre-mission) | `mission/FINAL-REVIEW-batch2.md` |
| 4 | Batch 2: webhook payload trusted without gateway corroboration | High | FIXED (pre-mission) — status+amount+currency lookup, fail-closed | `mission/FINAL-REVIEW-batch2.md`; `src/test/webhook-fulfilment.test.ts` |
| 5 | Batch 2: `/api/orders` unauthenticated | High | FIXED (pre-mission) — session Bearer verified server-side; body-userId mismatch → 403 | `mission/FINAL-REVIEW-batch2.md` |
| 6 | Batch 2: no rate limiting on money endpoints | Medium | FIXED (pre-mission) — per-isolate backstop shipped, honestly labelled | `mission/FINAL-REVIEW-batch2.md`; `src/test/rate-limit.test.ts` |
| 7 | R-1: API routes not mounted in the production build (endpoints returned the app's HTML 404) | High | FIXED (pre-mission) — `createFileRoute` adapters; handler bodies byte-identical; probes flipped to the handlers' own 401s | `work/CHANGES-FOR-CLAUDE.md` (R-1 section); Stage E §3c/§4 |
| 8 | NF-3: no server-side invite-completeness check before payment | Medium | FIXED (Wave 2) — 422 `invitation_incomplete` (count only) before insert | `mission/evidence/stageB-payments.log`; `src/test/orders-auth.test.ts`; Stage E §3a |
| 9 | NF-4: UTR stored in the `gateway_order_id` column | Low/Medium | FIXED (Wave 2) — `markOrderPaid` writes `gateway_payment_id` only; UTR preserved in `webhook_deliveries` payload | `mission/evidence/stageB-payments.log`; Stage E §3b |
| 10 | NF-5: SUCCESS delivery without `paymentId` looped on 500 forever | Low | FIXED (Wave 2) — definitive `missing_payment_id` reject (400) after the already-paid no-op | `mission/evidence/stageB-payments.log`; `src/test/webhook-fulfilment.test.ts`; Stage E §3b |
| 11 | NF-7: orders route logged the raw error object | Low | FIXED (Wave 2) — `errorClass`-only logging | `mission/evidence/stageB-payments.log`; Stage E §3a |
| 12 | NF-1: uploaded photos/music stored as session-only `blob:` URLs; published invites broken for guests | High | FIXED (Wave 2, fixes Wave 3) — real Supabase Storage upload; storage paths in config; concurrent-upload race fixed with regression tests | `mission/evidence/stageBC-uploads.log`; `mission/evidence/stageBC-uploads-fix.log`; `src/test/media-upload.test.ts` |
| 13 | DB-1: dead privileged write helpers in the browser orders module | Low | FIXED (Wave 3) — deleted; only types + `getOrderById` remain | `mission/evidence/stageB-hardening.log`; Stage E §3f |
| 14 | DB-2 (code layer): browser invite paths delegated ownership entirely to RLS | Medium | FIXED (Wave 3) — `.eq("user_id", …)` predicates + fail-closed signed-out behaviour, no query issued when signed out | `mission/evidence/stageB-hardening.log`; `src/test/data-access-scoping.test.ts` (11); Stage E §3d |
| 15 | DB-3: editor rendered the raw PostgREST error | Low | FIXED (Wave 3) — fixed user message; raw error to `console.error` only | `mission/evidence/stageB-hardening.log`; Stage E §3f |
| 16 | DB-5: order-success rendered the `?utr=` URL parameter verbatim | Low | FIXED (Wave 3) — reference shown only from the verified order row's `gateway_payment_id`; param no longer parsed | `mission/evidence/stageB-hardening.log`; Stage E §3f |
| 17 | Gap-A: draft-uploaded media would be orphaned when publish created the real invite | Medium | FIXED (Wave 3) — media copied to the invite's folder before checkout arms; failure blocks checkout | `mission/evidence/stageB-hardening.log`; `src/test/media-upload.test.ts`; Stage E §3f |
| 18 | Missing security headers | Low | FIXED (Wave 4) — `nosniff`, `Referrer-Policy`, `X-Frame-Options: SAMEORIGIN`, `Permissions-Policy` applied in the server entry on all response paths; CSP Report-Only (see open table) | `src/lib/security-headers.ts`; `src/test/security-headers.test.ts` (4); Stage E §3g + probe P1 |
| 19 | QR code trust: QR must encode exactly the shared public URL | Info | VERIFIED (Wave 5) — single source: `qr.ts` passes only `buildShareLinks(...).publicUrl` to the renderer; spy-pinned by tests | `src/test/qr.test.ts` (7); Stage E §3h |

## Open findings & residuals

| # | Finding | Severity | Disposition |
|---|---|---|---|
| 1 | DB-2 layer 1: whether RLS (migrations 0001/0002) is actually live on the owner's Supabase project is unverified — browser data paths ultimately rely on it | **LAUNCH BLOCKER** | OWNER-side: run the RLS verification query + confirm migration state (checklist §1). No agent can verify this from code |
| 2 | Gap-B: after the owner applies migration 0003 (bucket becomes private), guest rendering of stored media resolves through `getPublicUrl` and will break — a signed-URL flow is required | Medium (post-0003) | OPEN — design/implementation task; **do not apply 0003 as a standalone launch step** (sequencing warning in checklist §1); documented in the `resolveMediaUrl` doc comment in `src/lib/media-upload.ts` |
| 3 | DB-4: dead `getByPreviewToken` lookup remains in `invites-api.ts` (zero callers, RLS-carried) | Info | OPEN — deliberately left by the hardening wave (outside its brief); delete in a future cleanup so no future route wires it up unsafely. Not a live exposure |
| 4 | vite 8.1.5 → `^8.1.6` one-line manifest change (GHSA High root cause is dev-only launch-editor; installed copy already patched) | Low | OWNER decision — not applied by agents (checklist §5) |
| 5 | NF-11: four root probe scripts embed the live *publishable* key and target the live project | Info | OWNER-side quarantine/removal before any deployment packaging (checklist §5); verified byte-identical to the original download and **excluded from the Stage F delivery ZIP** (listing-verified, `mission/evidence/stageF-packaging.log`) |
| 6 | CSP is Report-Only | Low | OWNER decision: tighten to enforcing after observing reports on the real deployment (checklist §2). Enforcing today would break the YouPI checkout script + inline theme styles |
| 7 | Rate limiter is per-isolate | Medium (bounded) | Accepted design with the real control owner-side: Cloudflare WAF rule (checklist §2) |
| 8 | AGENTS.md tension: the project's own `AGENTS.md` says custom audio is session-only "without an explicit persistence request"; NF-1's fix persists uploads to Storage | Info | Recorded, not a defect: the owner's production-ready mission brief is that explicit persistence request (mission lead's record, repeated in Stage E §6). Flagged so the owner can amend `AGENTS.md` if they wish |

## Residual risks (already documented before this mission)

These are carried in from earlier verified work and remain true until the owner-side
actions in `docs/RELEASE-CHECKLIST.md` are completed. They are **not** new findings
of this mission.

1. **Live Supabase state unknown.** Whether migrations 0001/0002 are applied on the
   live project, and the live RLS/storage state, can only be confirmed in the owner's
   Supabase dashboard. All RLS statements in project documents describe the migration
   files, not a verified live database.
2. **YouPI live behaviour untested.** No live payment has ever been processed in this
   environment. Real webhook payload shape, redelivery policy and gateway-lookup
   responses are documented-but-not-live-verified; fixtures should be captured at the
   owner's first live test. Currency protection rests on the gateway lookup
   corroborating status + amount + currency server-side; the gateway's own records
   are the authority.
3. **In-code rate limiter is a per-isolate backstop.** Cloudflare Workers isolates
   are ephemeral and numerous with no shared memory, so the in-code limiter
   (orders 10/min per IP+user, webhook 120/min per IP) does not provide a global
   limit. The real production control is the owner-configured Cloudflare WAF
   rate-limiting rule (see release checklist).
4. **`npm audit` is blocked in this workspace.** The managed registry proxy rejects
   npm's security endpoints (403). Dependency assessment used a GitHub Advisory
   Database (GHSA) scan of all installed packages as a substitute (Batch 2 Task 7:
   0 Critical / 1 High / 2 Medium, one launch-editor root cause via vite 8.1.5, with
   the installed launch-editor already at its patched version and a dev-only path).
   An authoritative `npm audit` run remains an owner-side item; "dependencies are
   clean" is not claimed.
5. **Session tokens in localStorage.** Earlier scans noted the Supabase browser
   client's default token storage (localStorage). This is the standard Supabase SPA
   posture and was consciously not migrated in Batch 2 (parked as an enterprise
   extra for this product's scale); recorded here so the trade-off stays visible.
6. **Gap-B — signed-URL guest rendering after migration 0003 (mission-born).**
   The NF-1 fix stores media in the `invite-media` bucket and the published-read
   policy in 0003 is written against the same path scheme (Stage E §3e verified the
   alignment). But 0003 also makes the bucket **private**: once the owner applies
   it, `getPublicUrl`-based guest rendering stops working until a signed-URL flow
   is built. Until then, applying 0003 trades a hardening for broken guest media —
   the sequencing warning lives in `docs/RELEASE-CHECKLIST.md` §1, and the
   limitation is stated in the `resolveMediaUrl` doc comment rather than claimed
   working.
7. **Persisted custom audio vs the project's AGENTS.md house rule (mission-born
   record).** See open table #8: the mission brief stands as the explicit
   persistence request the house rule requires; recorded here so the decision is
   visible rather than silent.

---

## Round-3 review (2026-10-22) — WS5 security/policy re-inspection + status updates

Commissioned after an external code review raised four payment/publishing
suspicions (order-API invite status, webhook republication of archived
invites, webhook concurrency, signed-URL fallback). Method: full re-read of
the current work-copy source (read-only — this review changed no app code),
plus grep verification of service-role importers, env reads, and preview-token
callers. Evidence: `mission/evidence/round3-review-docs.log`. Statements below
distinguish **verified by inspection (Round 3)** from **previously tested**
(Round 1/2 results carried forward, not re-run by this review). Live-system
state remains owner-side throughout; nothing here changes the launch blocker
(open finding #1) or the NO-GO verdict.

**Path convention for this whole document (Round-3 correction).** In the
packaged layout this review ships as `docs/SECURITY-REVIEW.md`, and the
release documents it references ship alongside it under `docs/`
(`docs/RELEASE-CHECKLIST.md`, `docs/TEST-RESULTS.md`,
`docs/FINAL-REVIEW-mission.md`, `docs/RLS-VERIFICATION.sql`).
`mission/…` references denote the project workspace's evidence archive
(findings notes and run logs), which is **not** shipped in the package.

### Status updates to earlier sections (supersede where they conflict)

- **Open finding #2 (Gap-B) is CLOSED in code.** Round 2 built the signed-URL
  flow (`src/lib/media-url.ts`, `src/lib/media-signing.ts`; guest loader in
  `src/routes/i.$slug.tsx`), independently verified in consolidation
  (audit §E.3, S-8). What remains is only the owner deployment sequence for
  0003 (checklist §1 / audit §I) — the finding's "do not apply 0003 before
  the code" precondition is now satisfiable. The §C/§20 table entries that
  cite Gap-B as a residual predate Round 2 and are superseded by this note.
- **Check #17 (source maps) is resolved.** The Stage-F text said "not
  separately verified". Round 2 (Agent 7) + consolidation re-inspection
  verified the built output: **0 `.map` files in `.output`** and 0
  server-secret names in public chunks (audit S-8). A live-host fetch of a
  built asset's `.map` remains an owner spot check.
- **Check #4 (uploads) strengthened in Round 2:** magic-byte content
  verification now runs after the MIME allowlist and before any storage
  call (audit S-4); spoof matrix pinned by tests (previously tested).

### Round-3 verdict table

| # | Area | Verdict | Basis |
|---|---|---|---|
| R3-1 | Owner-only invite reads/writes (`invites-api.ts`) | **Sound** | Inspection: every owner-surface query carries `.eq("user_id", …)`; signed-out fails closed ([] / null / throw, no query issued). Previously tested: data-access-scoping + two-user pack |
| R3-2 | Anonymous access limited to published invites | **Sound** | Inspection: `getPublishedBySlug` filters `status = "published"` in code in front of 0001's public-read policy; `media-signing.ts` re-requires `published` server-side before signing. Live RLS half remains open finding #1 |
| R3-3 | Preview-token handling | **Sound — no such access path exists** | Explicit statement: the design has **no preview-token flow**. The only preview route is `/preview/$themeId` (public theme demo, no invite data); owner previews run under the owner session in the editor; drafts are local or owner-scoped. `getByPreviewToken` still exists with **zero callers** (grep, Round 3) — the standing DB-4 Info item (open finding #3) is re-confirmed, not a live exposure |
| R3-4 | Order ownership & session derivation (`/api/orders`) | **Sound** | Inspection: identity only from `supabaseServer.auth.getUser(bearer)`; body `userId` cross-checked, never trusted; ownership mismatch → 404; exact ₹599 amount; completeness 422 before insert |
| R3-5 | Order API invite-status enforcement | **FINDING F1** | See below |
| R3-6 | Webhook signature + timestamp validation | **Sound + Note N1** | Inspection: HMAC-SHA256 + `timingSafeEqual`, fail-closed; timestamp header required, ±5 min window. N1: the timestamp is not itself signed (HMAC covers the body only) and is checked pre-signature — freshness is heuristic; real replay protection is delivery-id dedup + plan idempotency |
| R3-7 | Webhook delivery uniqueness (schema) | **Sound** | Inspection: migration 0002 — `delivery_id text not null unique`, RLS on, no policies (service-role only). Real path confirmed: `supabase/migrations/0002_webhook_deliveries.sql` |
| R3-8 | Webhook concurrency / atomicity | **FINDING F3** | See below |
| R3-9 | Webhook invite-state handling (publish decisions) | **FINDING F2** | See below |
| R3-10 | Storage policies (0001 vs 0003) | **Sound (design) + Note N3** | Inspection: 0001 public bucket + read-all policy; 0003 (unapplied) private bucket, 10 MiB, MIME allowlist, owner-read + published-read policies keyed on the same path segments the app writes. N3: 0003's header rationale is stale (claims no Storage code exists yet — predates the NF-1/Gap-B work); the SQL is unaffected, but the header should get a comment-only correction so an owner reading it is not misled about the deploy-code-first dependency |
| R3-11 | Service-role usage | **Sound** | Inspection (grep, Round 3): exactly two `createClient` sites; `supabaseServer` is imported only by server routes, `orders-server.ts`, and the `media-signing.ts` server function — never by a component. Previously verified: Round-2 bundle inspection (0 public chunks carry it) |
| R3-12 | Environment-variable validation | **Sound** | Inspection (grep, Round 3): every server `process.env` read in `src/` is covered by `REQUIRED_SERVER_ENV`; startup logs missing NAMES only; non-throwing trade-off documented in `env.ts` |
| R3-13 | API error hygiene | **Sound** | Inspection: generic error bodies on all three API routes; logs carry `errorClass` + ids only; SSR catastrophic errors normalised to a generic page in `src/server.ts`; no stack/secret/signature material in responses |
| R3-14 | Rate limiting | **Sound (bounded, as documented)** | Inspection: orders 10/min per IP+user after auth; webhook 120/min per IP pre-body; health unlimited by design (liveness). Per-isolate backstop only — production control remains the owner's Cloudflare WAF rule (residual risk 3, unchanged) |
| R3-15 | Cache-Control + security headers | **Sound** | Inspection: `src/server.ts` applies both wrappers to every response incl. error paths; `/i/*` and app pages `private, no-store` (signed-URL rationale), public pages short-TTL; CSP stays Report-Only (open finding #6, owner soak). Static-asset header gap (CACHE-4) remains an owner edge item |
| R3-16 | `/api/health` exposure | **Sound + Note N5** | Inspection: GET-only liveness, no DB/gateway call, `no-store`, four presence booleans — never values. N5: unauthenticated config-presence disclosure is a deliberate, documented trade-off in the file header |
| R3-17 | Media signing failure surfacing | **FINDING F4** | See below |

### Round-3 findings (full detail — fixes are owned by the Round-3 WS1–WS4 agents, not by this review)

**F1 — `/api/orders` does not check invitation status (WS1). Medium.**
`src/routes/api/orders.ts`: the invite lookup (lines 90–95) selects only
`user_id, config`, and the handler never reads the invite's `status` before
inserting the order (lines 115–127). A payable ₹599 order (status `created`)
can therefore be created against an invitation that is already `published`
or `archived`, if the owner (or a stale browser tab) posts the request —
the UI's state gating is the only thing preventing it, and server-side
rules must not rely on the UI. Session/ownership/amount/completeness
checks are all present and correct; only the status gate is missing.
Required behaviour: reject non-draft invites before any order row exists.

**F2 — Webhook fulfilment republishes `archived` invitations (WS2). Medium.**
`src/lib/orders-server.ts` `fulfilmentPlan`: the `publish_only` recovery
branch (lines 388–393) fires for any invite status `!== "published"`, and
`mark_paid_and_publish` computes `publishInvite` the same way (line 449).
The handler's publish updates (`src/routes/api/webhooks/youpi.ts`,
publish_only and mark_paid_and_publish cases) set `status = "published"`
with only an id predicate. An `archived` invite therefore satisfies both
publish paths: a late-settling or redelivered SUCCESS — including the
partial-failure recovery path — silently reactivates an invite the owner
deliberately archived. `draft` (intended) and `published` (excluded) are
handled; `archived` is not distinguished from `draft`. Combined with F1,
such an order can also be newly created against an archived invite.
Required behaviour: explicit state handling — publish only from `draft`;
`archived` gets a deliberate, auditable non-publish outcome (the paid
order stays paid; reconciliation surfaces it), never a silent republish.

**F3 — Paid-state transitions are not atomic (WS3). Medium.**
`markOrderPaid` (`src/lib/orders-server.ts` lines 53–79) and
`markOrderFailed` (lines 81–88) update with only `.eq("id", orderId)` —
no status predicate — and the handler's flow is read-order → plan →
write, with no transaction or conditional update. Two SUCCESS deliveries
with **different** delivery ids for the same order can both read
`created` and both execute `mark_paid_and_publish`; a FAILED that read
`created` can likewise land after a concurrent SUCCESS and un-pay a paid
order at the row level (the plan's already-paid guard is evaluated on
the stale read). For a single payment the double write is
content-idempotent; with two distinct settled payments against one
order, the order row retains only the last-processed
`gateway_payment_id` and the other payment is visible only in
`webhook_deliveries` payloads. Migration 0002's `delivery_id UNIQUE`
covers same-id redelivery only. Mocked concurrency tests pin the code
guards against a fake that enforces the UNIQUE constraint; they do not
prove live Postgres serialization (audit §E.1 already states this).
Required behaviour: an atomic/conditional transition (e.g. update …
where status is still the expected pre-state, treat 0-rows-updated as
the already-settled outcome) compatible with Supabase/PostgREST.

**F4 — Signed-URL failures are silent; post-0003 they are disguised as
successful resolution (WS4). Low (availability/diagnosability — no
confidentiality impact).**
`signInviteMediaPaths` (`src/lib/media-url.ts`) returns `{}` on a storage
error (line 166) and on a thrown error (catch, line 177), logging
nothing; the server function (`src/lib/media-signing.ts` line 45)
conflates invite-not-found with DB/storage error in the same silent
`{}`; the guest loader (`src/routes/i.$slug.tsx` lines 26–33) catches
and falls back silently. Pre-0003 this degrades to public URLs and is
harmless. Post-0003 the bucket is private, the public-URL fallback
cannot serve the object, and a signing outage or misconfiguration
presents as silently broken guest photos/music with **zero** server-side
signal — the failure is indistinguishable from success in the resolver
contract. (No private media leaks either way: the private bucket denies
the public URL.) Required behaviour: log signing failures server-side
(error class + invite id, never the signed URL or key material) so the
failure is diagnosable, per the WS4 brief.

### Migration paths — confirmed in this repo (Round 3)

- `supabase/migrations/0001_init.sql` — tables, RLS policies, public bucket.
- `supabase/migrations/0002_webhook_deliveries.sql` — delivery idempotency.
- `supabase/migrations/0003_invite_media_hardening.sql` — private bucket
  hardening, **not applied** (owner-side, sequence in checklist §1).

