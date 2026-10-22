# PRODUCTION-READINESS-AUDIT.md — EasyInviteMaker

**Consolidated Round-2 audit + independent consolidation review — 2026-10-22 (Asia/Dubai)**
Reviewer: independent consolidation reviewer (did not implement any Round-2 workstream).
Scope: work copy `~/workspace/invitation-saas-work/work/` vs the untouched pristine original.
Method: hash inventory, full re-read of every Round-2 code change, focused tests re-run by the
reviewer, two defects found and fixed tests-first during consolidation, then a fresh full
verification (tests / types / build / lint / built-server probes / bundle inspection).
No live system was touched at any point. No secret values appear in this report — names and
counts only.

**Paths in this document (Round-3 correction, 2026-10-22).** This report
ships in the delivery package as `docs/PRODUCTION-READINESS-AUDIT.md`.
`docs/…` references are paths inside that package (the live verification
pack, for example, is `docs/RLS-VERIFICATION.sql`). `mission/…` references
denote the project workspace's evidence archive, which is **not** shipped
in the package: that covers `mission/evidence/…` (run logs),
`mission/PERF-DB.md`, `mission/PERF-FRONTEND.md`,
`mission/CACHE-HEADERS.md`, `mission/loadtests/`,
`mission/currency-investigation.md` and `mission/findings-*.md`. The
workspace creation paths in §B are kept as provenance.

---

## A. Executive summary

Round 2 closed the gaps the first production mission had honestly left open, and the
consolidation review independently verified that work rather than trusting the agents'
reports. Headline outcomes:

- **One real money bug was found and fixed** (Agent 4): a payment that succeeded while the
  publish step failed left the order paid and the invitation a draft *forever* — gateway
  redeliveries were answered "success" without publishing. The fulfilment plan now has a
  `publish_only` recovery action; proven by a failing test first, then fixed.
- **Gap-B is closed in code** (Agent 3): guest pages now receive short-lived (1 h) signed
  URLs for exactly the published invite's own media, minted server-side from the slug only,
  with a fail-soft fallback to today's public-URL behaviour. Migration 0003 (private bucket)
  can now be applied safely, in the sequence given in §I.
- **Defence-in-depth added and verified**: upload magic-byte verification (Agent 6),
  two-user authorization regression pack — no finding (Agent 5), startup env validation
  (Agent 7), `/api/health` liveness endpoint + ops runbook (Agent 8).
- **Consolidation found and fixed two further defects**: (1) the seal image was signed by
  the Gap-B loader but rendered *raw* — a stored seal path is not a URL, so uploaded seals
  rendered broken for guests; now resolved through the same signed-URL path as all other
  media. (2) Page HTML carried no `Cache-Control` at all; the server entry now applies
  per-family rules (public pages short-TTL, guest/auth pages `private, no-store`).
- **Final gates (reviewer's own runs)**: **277/277 tests (29 files), tsc 0 errors, build
  green, lint 381 problems (367 errors / 14 warnings) — below the 405-problem baseline.**
  Built-server probes all correct; bundle re-inspection clean (see §H).
- **Verdict: NO-GO for a production launch today** — not because of any code defect, but
  because the live-system evidence the launch depends on does not exist yet: the live
  Supabase RLS/migration state is unverified (DB-2), no real payment has ever run, and no
  real-browser pass has been done. §K states exactly what evidence flips this to GO; every
  item is owner-side and already written up as an exact procedure.

---

## B. Source & change inventory

This project has **no git repository in the work copy** — branch and commit are **N/A**,
stated plainly rather than invented. Change control is a hash inventory against the
untouched pristine original (`pristine/invitation-saas copy/`), the same mechanism used
for every prior delivery. Evidence: `mission/evidence/consolidation-inventory.log` and
`consolidation-inventory-final.log`.

| | Count |
|---|---|
| Pristine files | 273 |
| Work-copy files (final) | 294 (293 source files + this report) |
| Unchanged vs pristine | 210 |
| Changed vs pristine | 38 |
| Added vs pristine | 46 (45 + this report) |
| Removed vs pristine | 25 — **all** `.DS_Store` files, the original `audit/` screenshots and `test-results/` (pruned in earlier packaging rounds; no source file was removed by anyone) |

Every changed/added file reconciles against a claimed workstream: the priority round,
Batch 2, the R-1 wiring fix and the production mission (38 changed / most of the added
set), plus Round 2 + consolidation below. **Nothing unexplained was found.**

Round 2 + consolidation touched files:

- **Gap-B (Agent 3)**: NEW `src/lib/media-url.ts`, `src/lib/media-signing.ts`,
  `src/test/media-url.test.ts`; edited `src/routes/i.$slug.tsx`, `src/components/invitation.tsx`.
- **Webhook matrix (Agent 4)**: edited `src/lib/orders-server.ts`,
  `src/routes/api/webhooks/youpi.ts`; NEW `src/test/webhook-handler.test.ts`; extended
  `src/test/webhook-fulfilment.test.ts`; drafted `docs/RECONCILIATION.sql` (never executed).
- **Uploads (Agent 6)**: edited `src/lib/media-upload.ts`; NEW `src/test/input-safety.test.tsx`;
  extended `src/test/media-upload.test.ts`.
- **Authz pack (Agent 5)**: NEW `src/test/authz-two-user.test.ts`, `docs/RLS-VERIFICATION.sql`. No app code.
- **Artifacts/env (Agent 7)**: NEW `src/lib/env.ts`, `src/test/env.test.ts`; one call site in `src/server.ts`.
- **Ops (Agent 8)**: NEW `src/routes/api/health.ts`, `src/test/api-health.test.ts`, `docs/OPS-RUNBOOK.md`.
- **Read-only audits (Agents 1/2/10)**: `mission/PERF-DB.md`, `mission/PERF-FRONTEND.md`,
  `mission/CACHE-HEADERS.md`. No code.
- **Load tests (Agent 9)**: `mission/loadtests/` (5 k6 scripts + README + capacity notes). No code.
- **Consolidation (this review)**: NEW `src/lib/cache-headers.ts`, `src/test/cache-headers.test.ts`,
  `src/test/media-seal-resolution.test.tsx`, this report; edited `src/server.ts` (cache wiring),
  `src/components/invitation.tsx` (seal resolution); formatting-only `eslint --fix` on
  `src/routes/api/webhooks/youpi.ts`, `src/test/env.test.ts`, `src/test/webhook-handler.test.ts`.

---

## C. Security findings (consolidated)

Severity-ordered; status is the reviewer's verified state. Cross-references:
`docs/SECURITY-REVIEW.md` (20-point table, final), `mission/CACHE-HEADERS.md`,
`mission/PERF-DB.md`.

| # | Finding | Severity | Status |
|---|---|---|---|
| S-1 | **DB-2 — live Supabase RLS/migration state unverified.** Code-level ownership predicates exist and are regression-tested, but whether RLS is enabled on the live project and whether migrations 0001/0002 are applied has never been checked. This is the launch blocker. | **High (launch)** | **OPEN — owner action.** Exact pack: `docs/RLS-VERIFICATION.sql` (§I). |
| S-2 | **Paid-but-unpublished partial failure was unrecoverable** (Round 2, Agent 4). A SUCCESS delivery that marked the order paid and then failed the publish left the invite a draft forever; redeliveries no-oped. | **High → FIXED** | **Fixed + regression-tested** (`publish_only` plan action; handler test "scenario 14" asserts the order is written exactly once, the invite ends published, and the delivery is recorded only after the publish succeeds). Reviewer re-read the plan + handler: `publish_only` is reachable only for `status = "paid"` orders after payload amount/currency checks pass, never calls the mark-paid path, and throws before recording the delivery on publish error. |
| S-3 | **Seal image rendered raw** (consolidation finding). Gap-B signed the seal path, but `invitation.tsx` passed `invite.sealImage` to the wax-seal component unresolved — a stored path rendered as a broken relative URL for guests, and the signed URL was never used. | Medium → **FIXED** | Fixed in consolidation: seal resolves via `resolveWithMediaUrlMap` like every other media value; 2 new render tests (signed-URL case + public-URL fallback) failed before, pass after. |
| S-4 | **Upload content spoofing**: declared-MIME allowlist could be bypassed by renaming a file (Round 2, Agent 6). | Medium → **FIXED** | Magic-byte verification (`sniffMediaKind` + `verifyInviteMediaContent`) runs after the MIME allowlist and before any storage call; family must match the declared type exactly. SVG sniffs as null and stays rejected both ways. Spoof matrix pinned by tests (PNG-as-song, MP3-as-photo, text-as-.jpg all rejected, storage never called). |
| S-5 | **XSS via owner-supplied invitation fields** — tested, **no finding** (Agent 6). Script payloads in names/welcome/venue fields render as inert text; `javascript:` venue URLs never become hrefs (encoded search-URL fallback); obfuscated schemes (`java\nscript:`, mixed case, whitespace) rejected by `safeExternalUrl`; malformed stored configs hit validation without throwing. | — | **Verified safe** by `input-safety.test.tsx` (7 tests, re-run by reviewer). |
| S-6 | **Cross-user authorization** — tested, **no finding** (Agent 5). 26-test two-user matrix: user B cannot list/read/save/delete user A's invites (code predicate is the only filter the fake applies, and it suffices), anonymous fails closed with zero queries, order reads stay owner-scoped, the browser orders module exposes no status-flip function, route-level impersonation (B's session + A's userId in body) → 403, B ordering against A's invite → 404. | — | **Verified at code level.** The live-RLS half of this guarantee is S-1. |
| S-7 | **Missing server env discovered late** as per-request 500s (Agent 7). | Low → **FIXED** | `serverEnvStatus()` + one startup log line naming missing variables (names only). **Reviewer reproduced the artifact-level claim**: built server with one variable unset prints `[startup] Missing required server environment variables: YOUPI_API_BASE_URL. …` exactly once; with all set, no line. No-crash trade-off stands (a Workers boot throw would down every route; endpoints already fail closed). |
| S-8 | **Source maps / secrets in the shipped bundle** (Agent 7, re-inspected by reviewer on the post-Round-2 build). | — | **Verified clean.** 0 `.map` files in `.output`. Public chunks containing `SUPABASE_SERVICE_ROLE_KEY` / `YOUPI_WEBHOOK_SECRET` / `YOUPI_API_BASE_URL` / `service_role`: **0 each**. The single `sb_secret_` and `createSignedUrls` hits are both inside the supabase-js library chunk (key-format detection literal; the client library's own method) — not credentials and not our server code. The Gap-B server function's validator string appears in **0 public chunks, 2 server chunks**: signing is server-side only. |
| S-9 | **CSP remains Report-Only**; the enforcing draft is complete (directive-by-directive census incl. Supabase https+wss, the YouPI gateway origin, Google Fonts `googleapis`/`gstatic`) but **not shipped**. `script-src 'unsafe-inline'` is a hard ceiling (TanStack streams unhashable inline loader scripts; no nonce support in Start 1.168) — recorded honestly in CACHE-HEADERS.md (CACHE-7). | Low | **Owner decision + soak** (§J). Shipped policy unchanged by Round 2. |
| S-10 | **HSTS not set at the app layer** (CACHE-8) and **security headers never reach static-asset responses** (CACHE-4) — both are edge concerns on Cloudflare. | Low | **Owner edge action** (§I). |
| S-11 | **Root probe scripts** in the owner's project folder embed the *public* publishable key and hit the live DB (pre-existing owner files, byte-identical to the original download; excluded from every package). | Low | **Owner quarantine** (§I). |
| S-12 | Auth tokens in localStorage (Supabase default) — known, consciously retained trade-off from the first mission; unchanged. | Info | Accepted / parked (§J). |

No Critical findings. No Round-2 change weakened any existing control: the reviewer
confirmed the webhook handler still verifies signature → timestamp → delivery-id
idempotency → stored-order cross-checks → gateway lookup corroboration, in that order,
and that `markOrderPaid` is only reachable through a `mark_paid_and_publish` plan.

---

## D. Performance findings

### D.1 Database (`mission/PERF-DB.md` — workspace-only) — no blockers

0 Critical / 0 High / 0 Medium. The hot guest read (slug + published) is served exactly by
the partial `invites_live_idx`; all money-path lookups are PK/unique single-row; no N+1 in
any loader; both Supabase clients are module singletons over PostgREST (no app-side pool
to tune); zero `.rpc` calls. Lows, all **deferred with stated triggers** (§J):

- **PERF-DB-2** — `orders.invite_id` has no index; deleting an invite seq-scans `orders`.
  Add `orders_invite_idx` (as `(invite_id, status)`) only when order volume grows or a
  paid-lookup-by-invite lands.
- **PERF-DB-1** — `listInvites` is the only unbounded `SELECT *` (full `config` JSONB per
  invite, once per dashboard load). Code-side projection/bound first if it ever matters.
- **PERF-DB-4** — `currentUserId()` makes an Auth network round trip before every
  owner-surface query (dashboard = 2 trips, each autosave = auth + update). Any change
  needs security sign-off because it touches the DB-2 backstop shape.
- Housekeeping: one redundant duplicate index on `webhook_deliveries.delivery_id`;
  `webhook_deliveries` grows one full-payload row per delivery with no retention
  mechanism (its `created_at` index already supports a purge); `invite_views`,
  `invite_assets`, `profiles` are schema-only today (zero writers in app code).

### D.2 Frontend (`mission/PERF-FRONTEND.md` — workspace-only) — measured, from the production build

- **≈ 2.9 MB must download before a guest can even open an invitation** (code ≈ 274 KB gz
  + fonts + 2.48 MB of envelope art on the measured theme); ≈ 4.1 MB for the full theme
  experience; ≈ 9–10 MB for the demo invitation scrolled fully.
- **PERF-FE-1 (High)** — all 13 themes' `seal.png` are 1024×1024 PNGs of 0.92–2.14 MB
  (**18.09 MB total**) rendered at ≤130 CSS px. Re-encoding saves **~0.84–2.06 MB per
  invitation view** (~17 MB across the set).
- **PERF-FE-2 (High)** — 10 files (17.41 MB) are PNG photographs wearing `.jpg` names;
  the Dubai Silk skyline alone is a 2.06 MB "JPEG" (~200 KB as a real one, **~1.86 MB
  saved**); the demo photo set saves **~4.30 MB**.
- **PERF-FE-3 (High, customer-dependent)** — uploads are never downscaled client-side; a
  phone photo up to the 8 MiB cap is what every guest downloads.
- **PERF-FE-4/FE-5 (Medium)** — `/themes/*` (34 MB) and `/demo/*` carried **no cache
  lifetime at all** (CACHE-1, §I — the HTML half is fixed, see §C/§F; the asset half is an
  owner edge rule because `_headers` is build-generated with no source file); gallery
  cards render full 1536×1024 heroes at ~230 px (~2.99 MB saveable per full scroll).
- Root JS floor is 790 KB raw / 228 KB gz on *every* route including text-only legal
  pages; 5 render-blocking Google Fonts stylesheets with no `preconnect` (FE-6).
- **None of the asset re-encodes were implemented** — by design (§J): visual quality
  cannot be verified in this environment, and shipping unverifiable artwork changes to a
  wedding product would trade a measured byte saving for an unmeasured quality risk.

---

## E. Payment & authorization review

### E.1 Webhook torture matrix (Agent 4; reviewer re-ran all payment tests: 74/74)

16/16 scenarios resolved. Covered before Round 2: invalid signature, wrong amount
(payload + lookup), wrong currency (payload + lookup), wrong order id, wrong merchant
context (lookup `orderId` mismatch → reject), FAILED/PENDING handling, out-of-order events
both directions, provider outage (lookup failure → 500, nothing recorded, redelivery
succeeds), browser-success-without-payment (order-success renders `pending`/`unverified`,
never success). **Gaps found and pinned in Round 2**: duplicate delivery (same id →
`already_processed`, order marked exactly once), replay with a new delivery id
(`orderWrites` stays 1), DB failure during fulfilment (no delivery row recorded; the same
delivery id retries successfully). **One real bug**: scenario 14, partial failure — see
S-2. **Pinned at code level only**: true concurrent delivery — the guards (delivery-id
pre-check, already-paid no-op, record-after-fulfilment, migration 0002's
`delivery_id UNIQUE`) are tested against a fake that enforces the UNIQUE constraint;
**real row-lock interleaving can only be proven on a live Postgres** and is stated as
such, not faked.

Reconciliation support: `docs/RECONCILIATION.sql` (paid-but-unpublished,
pending > 24 h, deliveries without fulfilment, paid-with-no-delivery cross-check) —
**drafted, never executed anywhere**; the runbook procedure is in
`docs/OPS-RUNBOOK.md` §1.

### E.2 Authorization

Two-user pack: no finding (S-6). Ownership is enforced twice by design — code-level
predicates (fail-closed, regression-tested here) in front of Supabase RLS (the live half
is S-1, owner-verified via `docs/RLS-VERIFICATION.sql`).

### E.3 Gap-B signed URLs (Agent 3) — reviewer verdict: sound, one defect fixed

Design verified line-by-line: the server function takes **only the slug**, re-loads the
invite with the service-role client, requires `status = "published"`, collects paths
from that invite's own config, keeps only paths whose second segment equals that
invite's id (the exact join key of 0003's published-read policy), signs exactly those
(TTL 1 h), and fails soft to an empty map on any error — so pre-0003 rendering can
never regress, drafts are never signed, and the function cannot be used to sign another
customer's objects because paths never come from the request. Client bundle contains no
service-role reference and no server-function code (§C S-8). Test quality: 15 tests pin
exact-path signing, fallback on map-miss/failure, no storage call for empty path sets,
TTL bounds (10 min–24 h), and draft-path exclusion. **Defect found by consolidation**:
the seal image — although correctly included in the signing set — was rendered raw
(S-3); fixed with render tests. Signed URLs are **never
cached and never shared**: they are minted per request for one invite, expire
after 1 h, and the guest page that carries them is served `private, no-store`
(consolidation cache fix, §F) — a shared cache can never replay one response's
ageing URLs to a later guest, and the CACHE-2 edge-caching fix for public
pages deliberately excludes `/i/*` for exactly this reason.

---

## F. Operations

### F.1 Health endpoint (Agent 8) — reviewer verdict: sound

`GET /api/health` (`src/routes/api/health.ts`, R-1 `createFileRoute` wiring,
GET only) returns `200 {"status":"ok","config":{…}}` where `config` holds
**booleans only** — presence/absence of the four server variables
(`supabaseUrl`, `serviceRole`, `youpiWebhook`, `youpiApiBase`) — with
`Cache-Control: no-store`. It makes **no database or gateway call**: it is a
liveness probe, not readiness, so a dependency outage cannot restart healthy
workers, and the booleans expose nothing usable (no values, no URLs, no key
material). Probe-verified on the built server (§H). It is not behind the
POST rate limiters (those guard `/api/orders` and the webhook), and it is
the first check in the runbook's incident response (§F.3).

### F.2 Startup env validation (Agent 7) — artifact-proven

See S-7. Recorded here because it is an operational control: the built
server, run with `YOUPI_API_BASE_URL` unset, printed
`[startup] Missing required server environment variables: YOUPI_API_BASE_URL. …`
exactly once, before the first response; with all variables set it printed
no line (probe log, §H). Post-deploy verification is therefore mechanical:
no `[startup]` line in the deploy logs + `/api/health` reporting all four
booleans `true` means the environment is complete.

### F.3 Cache headers for page HTML (consolidation fix)

Page HTML previously carried no `Cache-Control` at all (CACHE-2/CACHE-3).
`src/lib/cache-headers.ts`, wired into both branches of `src/server.ts`
beside the security headers and the env check, now applies per-family rules:

| Paths | `Cache-Control` |
|---|---|
| `/`, `/templates`, `/terms`, `/privacy`, `/refund`, `/contact`, `/preview/*` | `public, max-age=60, stale-while-revalidate=300` |
| `/i/*` (guest pages) | `private, no-store` — the HTML embeds per-request signed media URLs (1 h TTL); a shared cache would serve ageing URLs and a frozen first render (§E.3) |
| `/dashboard`, `/create`, `/login`, `/order-success`, `/order-failed`, `/publish`, `/publish/*`, `/editor/*` | `private, no-store` (defence-in-depth, CACHE-3) |
| `/api/*`, `/sitemap.xml` | Untouched by the wrapper — `/api/health` sets its own `no-store`, the sitemap its own TTL, POSTs are not cached |

Only GET/HEAD HTML responses without an existing `Cache-Control` are
touched; an existing header is never overwritten, and redirects, non-HTML
responses and POSTs pass through unchanged. 10 tests
(`src/test/cache-headers.test.ts`); probe-verified per family on the built
server (§H). The remaining halves are owner-edge: the CACHE-1 asset rule
and the edge half of CACHE-2 (§I) — `_headers` exists only as a
build-generated file with no source-controlled source, so no mechanism was
invented in code.

### F.4 Runbook, reconciliation, monitoring — and their honesty labels

`docs/OPS-RUNBOOK.md` is the operating companion to this report:

- **Reconciliation (§1 of the runbook)** — three read-only SQL checks with
  a suggested cadence (daily until the first real payments have settled
  cleanly, then weekly): paid-but-unpublished (§1.1), stale pending orders
  > 24 h (§1.2), deliveries without fulfilment (§1.3). The same queries
  are in `docs/RECONCILIATION.sql` — **drafted, never executed
  anywhere**.
- **Stuck-order recovery (§2)** — corroborate with the gateway lookup
  first (`GET /api/v1/payments/{id}`, the same lookup the webhook itself
  performs); if the gateway confirms paid, recover by **panel
  redelivery** — the designed, idempotent retry path — never by hand.
  The NEVER list is explicit: no hand-flipping `orders`/`invites` status
  without a gateway lookup, no editing or deleting `webhook_deliveries`
  rows, no re-running a migration as a fix, refunds executed at the
  gateway first and the database follows.
- **Monitoring (§4)** — app logs are deliberately sanitized (handlers log
  `errorClass`, `deliveryId`, `orderId` — never payloads, signatures or
  secrets; **Verified**). Alert on: any 5xx from `POST /api/webhooks/youpi`
  (run §1.1 the same day), any 5xx from `POST /api/orders`,
  paid-but-unpublished count > 0, `/api/health` non-200 or a config flag
  unexpectedly `false` after a deploy, webhook 401 spikes. Watch weekly:
  rate-limiter 429s (the in-code limiter is a per-isolate backstop;
  sustained 429s mean the Cloudflare WAF rule in §I is missing or
  mis-sized).
- **Incident first response (§5)** — health check → logs → §1.1 query →
  §2 recovery → check the YouPI instance before touching app code → write
  the incident note (identifiers only, never secrets or payloads).

**Backup/DR honesty labels (runbook §3, stated plainly):** nothing in this
area has been exercised — no backup has been taken, restored, or even
confirmed to exist by the agent team.

| Item | State |
|---|---|
| Supabase automated DB backups | **UNVERIFIED.** Platform-default: plan-dependent (free tier: none; paid: daily; point-in-time recovery is a separate add-on). Owner confirms in Dashboard → Database → Backups. |
| Supabase restore procedure | **UNVERIFIED** — never test-restored; confirm the plan's restore path before an incident forces the question. |
| Storage (`invite-media`) recovery | **UNVERIFIED** — a database restore does not by itself prove media objects are recoverable. |
| Cloudflare Workers rollback | Platform-default, **UNVERIFIED on this account** — confirm the deployments list exists after the first real deploy. |
| Source-code recovery | **Verified (local)** — pristine original + hash-verified cumulative changes-only ZIPs rebuild the exact shipped codebase. |
| RPO / RTO targets | **Not established — UNVERIFIED.** Any number written before the backup row is confirmed would be invented. |

---

## G. Load testing

> ## Status: **NOT MEASURED — no load test has been run**
>
> k6 is **not installed** in the agent workspace (checked 2026-10-21:
> `command -v k6` → not found) and was deliberately not installed there.
> All five scripts in `mission/loadtests/` are **unrun** — validated by
> parse/syntax check only. There are no baseline numbers, no percentiles
> and no pass/fail results; anyone quoting figures for these scenarios is
> inventing them. A second, independent caution: production is Cloudflare
> Workers + Supabase, so even a future *local* run measures the laptop and
> the local network far more than the production architecture — local runs
> are for script validation and gross regression spotting; meaningful
> capacity numbers need staging or the real deployment, with the owner's
> approval (the standing rule: never heavy-load production).

Script inventory (`mission/loadtests/` — workspace-only, not shipped; master-prompt §9.1 scenarios):

| Script | Scenario | What it does | Needs |
|---|---|---|---|
| `browse.js` | 1, 2 (+ preview) | Homepage → `/templates` → one theme preview, with think time; ramp 1 → 25 → 50 VUs | nothing |
| `guest-invite.js` | 3, 4, 10 | The wedding-day spike: up to **100 concurrent guests on the same published invite**, plus its media from Supabase Storage when configured; refuses to run without `SLUG` (no measuring 404s) | `SLUG`; media optional |
| `dashboard-read.js` | 5 | Authenticated `GET /dashboard` renders at low VU; skips gracefully with no token (dashboard data reads go browser → Supabase directly, so this measures the authenticated SSR render) | `TEST_AUTH_TOKEN` (throwaway account only) |
| `webhook-harness.js` | 8 | Synthetic YouPI deliveries to local/staging targets only — hard target guard, production refused unless `ALLOW_PROD_LOAD=1`. Placeholder signature by default (expects correct 401s); real HMAC only with a **local** dev secret. A 200 for synthetic orders is a stop-and-investigate event | nothing (optional local secret) |
| `orders-local.js` | 7 | Order creation against a local instance at 1–5 VUs; amount hardcoded to the real 59900 paise (the server rejects anything else by design); same target guard (it mutates state) | test-account token; test invite id |

Scenarios 6 (draft saving) and 9 (abuse) deliberately have no script:
draft saving is browser → Supabase directly (there is no app endpoint to
load), and deliberately tripping rate limits is observed through the
webhook/orders runs plus the owner's WAF configuration — the in-code
limiter is a per-isolate backstop, so abusing it locally would measure
almost nothing about production. All scripts use warning-only thresholds
(no `abortOnFail`); the README's abort conditions are: error rate > 5%,
any sustained 5xx on a read path, p95 doubling stage-over-stage and still
climbing, cost risk on metered targets, wrong target, or a synthetic
webhook returning 200 / an order created for an invite the test account
does not own.

**Capacity notes summary** (`mission/loadtests/CAPACITY-NOTES.md` —
reasoning, not measurements): this product's traffic is *events*, not a
steady load. Baseline ≈ zero; the binding scenario is per-wedding — a
large wedding (≈ 500–800 guests, half opening within the same 10 minutes
after the WhatsApp share) gives a design peak of **~50–100 concurrent
guests on a single invite**, which is why the spike script tops out at
100 VUs on one slug. Media egress (Supabase Storage) dominates bytes and
will bite before compute does; writes are a human-paced trickle plus the
webhook. Eight plan limits are listed to verify — Cloudflare Workers tier
+ request/CPU allowance, static-asset cache behaviour, Supabase
connections/pooler mode, Storage egress allowance, Auth MAU limits,
Storage per-file/bucket limits as applied, YouPI host capacity,
domain/DNS + TLS basics — **all UNVERIFIED**. Architecture is revisited
only on a *measured* signal (sustained between-event load, a staging
latency knee traced to the Worker, pooler saturation, egress trending to
the allowance, observed WAF defeat, webhook volume) — fix order is
configuration and caching first; no Redis/Kubernetes pre-emptively, per
the owner's lean guardrail.

---

## H. Test results — reviewer's own fresh runs on the final tree

Exact commands, run by the consolidation reviewer in the work copy after
all Round-2 changes and both consolidation fixes were in. Evidence:
`mission/evidence/consolidation-gates-1.log`, `consolidation-gates-2.log`,
`consolidation-probes.log`, `consolidation-bundle.log`.

| Command | Result |
|---|---|
| `npm test` | **277 passed (277), 29 test files passed (29)** — vitest, duration 26.39 s. Baseline before Round 2: 178. |
| `npx tsc --noEmit` | **0 errors** |
| `npm run build` | **Green** (exit 0; Nitro build, `.output` + generated `_headers` produced) |
| `npm run lint` | **381 problems (367 errors, 14 warnings)** — below the 405-problem baseline (391 errors / 14 warnings). Path, recorded honestly: the first post-consolidation full lint read 422 because Round-2 files added `prettier/prettier` formatting problems only; a formatting-only `eslint --fix` on exactly the six Round-2/consolidation files brought it to 381, with tests and types re-verified after. All remaining problems are pre-existing style debt; zero new on touched files. |

Built-server probes (production build, harness; the startup runs also
re-proved S-7):

| Check | Result |
|---|---|
| Startup with `YOUPI_API_BASE_URL` unset | `[startup] Missing required server environment variables: YOUPI_API_BASE_URL. …` printed exactly once, before the first response |
| Startup with all variables set | 0 startup lines |
| `GET /` | 200 · `cache-control: public, max-age=60, stale-while-revalidate=300` · `text/html` |
| `GET /templates` | 200 · same public short-TTL |
| `GET /preview/dubai-silk` | 200 · same public short-TTL |
| `GET /dashboard` | 200 · `cache-control: private, no-store` |
| `GET /login` | 200 · `cache-control: private, no-store` |
| `GET /api/health` | 200 · `cache-control: no-store` · body `{"status":"ok","config":{"supabaseUrl":true,"serviceRole":true,"youpiWebhook":true,"youpiApiBase":true}}` (booleans only) |
| `POST /api/orders` (no auth) | **401** |
| `POST /api/webhooks/youpi` (bogus signature) | **401** |
| `GET /i/<slug>` | **Not probeable in this harness** — the loader waits on a live Supabase read and timed out. Its `private, no-store` status is code-proven (`cache-headers.ts` family rule + tests) and is labelled as such, not claimed as probed. |

Bundle re-inspection on the post-Round-2 build (names/counts only; see
also S-8): source maps in `.output`: **0**. Of 114 public chunks, those
containing `SUPABASE_SERVICE_ROLE_KEY`: **0**; `YOUPI_WEBHOOK_SECRET`:
**0**; `YOUPI_API_BASE_URL`: **0**; `service_role`: **0**; the Gap-B
server-function name (`loadPublishedInviteMediaUrlMap`): **0**;
`media-signing`: **0**. The single `sb_secret_` hit and the single
`createSignedUrls` hit are both inside the supabase-js library chunk (a
key-format detection literal; the client library's own method name) — not
credentials and not app server code. Server chunks containing
`SUPABASE_SERVICE_ROLE_KEY`: 3 — expected, server-only.

---

## I. Deployment checklist

Status labels: **Implemented and verified** (code-level, by the runs in
§H) · **Implemented, owner verification pending** (the artifact exists;
only the owner can run/confirm it live) · **Owner action required before
launch** · **Recommended after launch** · **Backlog** (§J).

### Implemented and verified

- Flat ₹599 pricing from a single config; `/api/orders` session auth,
  completeness gate and amount rejection; webhook signature → timestamp →
  idempotency → cross-checks → gateway-lookup corroboration, incl. the
  `publish_only` recovery (S-2) — 74/74 payment tests.
- Gap-B signed URLs for guest media (S-8, §E.3) incl. the consolidation
  seal fix (S-3); magic-byte upload verification (S-4); input-safety
  rendering (S-5); code-level ownership predicates (S-6).
- Startup env validation (S-7, §F.2); `/api/health` liveness (§F.1);
  page `Cache-Control` families (§F.3); shipped security headers with CSP
  **Report-Only** (S-9).
- Full gates on the final tree: 277/277 tests, tsc 0, build green, lint
  381 ≤ 405 baseline (§H).

### Implemented, owner verification pending

- `docs/RLS-VERIFICATION.sql` — the live verification pack (six-table
  rowsecurity check, storage bucket/policies with both pre- and
  post-0003 expected answers, full policy inventory with hard FAILs,
  guided two-account REST test). Written and reviewed; **never run** —
  running it is the launch blocker (§K).
- `docs/RECONCILIATION.sql` + `docs/OPS-RUNBOOK.md` §1–§2 — drafted,
  reviewed, **never executed** against live data.
- `mission/loadtests/` — scripts + README + capacity notes prepared
  (workspace-only; not shipped in the package);
  **NOT MEASURED** (§G).
- Backup/DR position (runbook §3) — platform-default claims
  **UNVERIFIED** on the live accounts (§F.4).

### Owner action required before launch (in order)

1. **Run `docs/RLS-VERIFICATION.sql`** (Supabase SQL Editor). Expected: all
   six tables `rowsecurity = true`, storage answers matching the
   pre-0003 state, no hard FAILs in the policy inventory. Fix anything
   that FAILs before continuing. **(DB-2 — the launch blocker.)**
2. **Confirm migrations 0001/0002 are applied** — the live project must
   have all six tables (`profiles`, `invites`, `invite_assets`,
   `orders`, `invite_views`, `webhook_deliveries`).
3. **Deploy this code** — apply the cumulative package, run
   `npm install` (the mission's one dependency change: `qrcode` +
   `@types/qrcode`; Round 2 adds no dependencies), re-run the gates,
   deploy.
4. **Guest check #1** — open one published invitation signed-out; confirm
   photos and music load (still via pre-0003 public URLs — this proves
   the deploy).
5. **Apply migration 0003** in the SQL Editor — backup first, and record
   the bucket's current public flag, limits and policies before applying.
6. **Re-run `docs/RLS-VERIFICATION.sql`** — the storage blocks' expected
   answers change after 0003; expected now: bucket private, 10 MiB
   limit, MIME allowlist, owner-read + published-read policies, no
   read-all policy remaining.
7. **Guest check #2** — re-open the same published invitation; photos and
   music must still load (now served by server-minted signed URLs), and
   a draft's media must **not** be guest-reachable.
8. **Environment variables set** (names only — values never in chat or
   documents). Server-only: `SUPABASE_SERVICE_ROLE_KEY`,
   `YOUPI_WEBHOOK_SECRET`, `YOUPI_API_BASE_URL`. Public (build-time):
   `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`,
   `VITE_YOUPI_CHECKOUT_URL`, `VITE_YOUPI_MERCHANT_PUBLIC_KEY`.
   Build-time: `VITE_SITE_URL` = the real production origin (activates
   `og:url`). Verify: no `[startup] Missing required server environment
   variables` line in the deploy logs, and `GET /api/health` reports all
   four booleans `true`.
9. **Cloudflare WAF rate-limiting rule** (the real rate control; the
   in-code limiter is a per-isolate backstop): ≈ 20 requests / 10 s per
   IP on `/api/orders`; ≈ 300 requests / min per IP on `/api/webhooks/*`
   — action Block. Confirm the plan tier supports the rule shapes.
10. **Cloudflare cache rules (CACHE-1 + the edge half of CACHE-2).**
    Exact CACHE-1 rule (from `mission/CACHE-HEADERS.md` — workspace-only): `/themes/*`,
    `/audio/*`, `/demo/*`, `/devices/*` → `public, max-age=2592000`
    (30 days — **not** immutable; filenames are stable, raise toward
    1 year only if files are version-renamed when replaced);
    `/favicon.svg` → `public, max-age=604800`. Plus a Cache Rule that
    actually caches the public HTML paths (`/`, `/templates`,
    `/preview/*`) at the edge with the short TTL the origin now sends —
    Cloudflare does not cache worker HTML by default. **Exclude `/i/*`**
    (signed URLs; `private, no-store` by design, §E.3/§F.3).
11. **HSTS at the edge (CACHE-8)** — Cloudflare → SSL/TLS → Edge
    Certificates → HSTS (edge, because app-side would miss static
    assets): start `max-age=2592000` (30 days); `includeSubDomains` only
    after confirming every subdomain is HTTPS-only; **no preload** until
    the setup has survived a few weeks.
12. **YouPI portal checks** — webhook URL points at the real domain's
    `/api/webhooks/youpi` (not a tunnel/localhost); webhook secret
    matches the deployment env (compare without sharing the value);
    `YOUPI_API_BASE_URL` points at the instance; `ADMIN_API_TOKEN` is
    **not** the shipped default; instance is INR-only; work through the
    remaining instance settings in `mission/currency-investigation.md`
    §5 (workspace-only note — not shipped in the package).
13. **Vite one-line decision + authoritative audit** — decide
    `"vite": "8.1.5"` → `"^8.1.6"` (the launch-editor fix) and run
    `npm audit` once on a normal machine/CI (blocked in the agent
    workspace; GHSA substitute scan stood at 0 Critical / 1 High /
    2 Medium). Never `npm audit fix --force`.
14. **Quarantine the root probe scripts** — delete or move out of the
    project: `check-storage.mjs`, `probe-supabase.mjs`,
    `test-auth-flow.mjs`, `test-db-only.mjs` (S-11; excluded from every
    package; byte-identical to the original download).
15. **First real ₹599 payment** end-to-end on the deployed site:
    invitation publishes, success page reflects the real paid state,
    webhook delivery + gateway lookup succeed. Capture the real webhook
    payload and lookup response as test fixtures (redact secrets before
    saving).
16. **Real-browser pass** on the real deployment (no agent has ever run
    one): home + all 14 designs on `/templates`; `/create` inline
    validation on an empty submit; a published `/i/<slug>` rendered
    opened, with photos/music; dashboard QR displays and its PNG
    downloads; print / Save-as-PDF of an opened invitation looks clean;
    **mobile eyeball** (no mobile or accessibility pass has ever run —
    §J).

### Recommended after launch

- **CSP Report-Only soak → enforcing decision** (S-9): serve the
  CACHE-HEADERS.md §3 draft as Report-Only via a Cloudflare Transform
  Rule on the real domain, exercise the full journey list incl. one
  YouPI **test-mode** checkout, settle unknowns U1–U4, then enforce the
  clean directives. The `script-src 'unsafe-inline'` ceiling is a
  framework fact (CACHE-7), and the owner's risk call on it is part of
  the decision.
- **CACHE-4** — a Cloudflare Transform Rule applying the same 5-header
  security set to `/assets/*`, `/themes/*` and the other public static
  paths (the worker never sees those responses).
- **Confirm the backup position** (runbook §3): plan + retention in
  Supabase → Database → Backups, the restore path the plan offers, and
  only then set RPO/RTO targets.
- **Reconciliation cadence** — run runbook §1 daily until the first real
  payments settle cleanly, then weekly.
- **Run the load pack against staging** when a staging deployment
  exists (README rules; never production without explicit approval),
  and replace the §G assumptions with the results.

---

## J. Remaining work & backlog

Ordered by value. Nothing here blocks the code side of launch; the
launch-gating items are the owner actions in §I.

**Asset re-encodes (recipes from `mission/PERF-FRONTEND.md` — workspace-only; measured,
NOT implemented).** Gate for all of them: visual quality can only be
verified by the owner in a real browser, which is why no agent shipped
them (§D.2).

1. **FE-1 — seals.** Re-encode each theme's `seal.png` at 320×320 (2.5×
   the ≤130 CSS px display cap) as WebP-with-alpha, or palette-quantized
   PNG-8 to keep the pipeline PNG-only; the flat line-art lands at
   ~30–80 KB per file. Saving: **~0.84–2.06 MB per invitation view,
   ~17.0 MB across the 13 files**. Keep a 2× margin for the
   `--seal-scale` zoom themes; do not touch the artwork, the monogram
   overlay or the reveal animation.
2. **FE-2 — PNG photographs wearing `.jpg` names.** Convert to true
   JPEG (q80) or WebP at identical dimensions; fix the extensions
   honestly. Saving: Dubai Silk skyline **~1.86 MB** (2.06 MB → ~200 KB);
   demo photo set **~4.30 MB** (4,989,604 B → ~690 KB); the demo custom
   seal (816×816, 1,132,317 B) is FE-1's fix and saves a further
   **~1.05 MB** — ≈ **6.2 MB** across the set. Keep PNG masters outside
   `public/` if archival quality is wanted.
3. **FE-5 — gallery card derivatives.** Cards render full 1536×1024
   heroes at ~230 px display; generate ~480 w derivatives for
   `/templates` + homepage cards. Saving: **~2.99 MB per full gallery
   scroll**. Keep lazy loading as-is — the fix is derivative size, not
   loading strategy.
4. **FE-3 — upload downscale.** Client-side downscale before upload
   (max edge ~1600 px, JPEG/WebP q ≈ 0.82) in the existing upload path;
   prevents **~1.5–7 MB per customer phone photo** from reaching every
   guest. Keep the current caps (photo 8 MiB / song 10 MiB) as the guard.
   This is the largest *customer-dependent* win — one published invite
   with 3 un-resized phone photos can add 6–24 MB of guest payload.

**Database deferrals (from PERF-DB.md, each with its trigger):**

- **`orders_invite_idx`** — add as `(invite_id, status)` only when order
  volume grows or a paid-lookup-by-invite feature lands; until then the
  invite-delete seq-scan is harmless at this scale.
- **`listInvites` bound/projection** — the one unbounded `SELECT *`:
  add a column projection/bound if a many-invite dashboard ever feels
  slow; the composite-index variant stays conditional because its write
  cost lands on the editor-autosave path.
- **`currentUserId()` round trip (PERF-DB-4)** — deriving the id from the
  already-held session saves one Auth round trip per owner call, but any
  change needs security sign-off first: it touches the DB-2 backstop
  shape.
- **`webhook_deliveries` retention** — one full-payload row per delivery,
  no purge exists; the `created_at` index already supports one. Add a
  purge when row volume becomes material. The redundant duplicate index
  on `delivery_id` is cosmetic cleanup for whenever a future migration
  touches that table.

**Security/product decisions:**

- **CSP enforcing** — soak first (§I, Recommended after launch); blocked
  on U1–U4 evidence + the owner's `'unsafe-inline'` risk call, not on
  drafting.
- **CACHE-9 product decision** — `resolveMediaUrl` passes absolute URLs
  through, so a saved invite can load guest media from any `https:`
  host, which forces the CSP draft's permissive `img-src`/`media-src`.
  Tightening means a product change (reject or proxy remote media URLs
  at save time) — owner's call.
- **Auth tokens in localStorage (S-12)** — accepted trade-off, parked;
  revisit only if the session model changes (it would also change the
  CACHE-3 calculus).

**Verification that still needs a live system or a browser:**

- **True-concurrency webhook check** — the code-level guards + 0002's
  `delivery_id UNIQUE` are pinned (E.1); real row-lock interleaving can
  only be proven on a live Postgres, e.g. a panel-redelivery drill
  during the first-payment window, watched with runbook §1.
- **Mobile / accessibility pass** — never ran (backlog D-4): no viewport
  emulation exists in the agent environment and Playwright is infeasible
  here (Chromium download blocked). Owner real-browser/mobile pass is
  §I item 16.
- **Load pack execution** — §G; staging-first, measured signals only.
- **`invite_views` / `invite_assets` / `profiles`** are schema-only
  today (zero writers in app code) — decide whether view tracking is a
  wanted feature before building writers for it.

---

## K. Final verdict

## **NO-GO — for launching today**

The code side is launch-ready. Every launch-critical control that can be
verified without live systems has been — by tests the reviewer re-ran,
by probes against the production build, and by a bundle re-inspection —
and this round *improved* the position: one real money bug found and
fixed (S-2), the Gap-B privacy blocker closed in code (§E.3), upload
spoofing closed (S-4), and two further consolidation defects found and
fixed (S-3, §F.3). The final gates stand at **277/277 tests, tsc 0,
build green, lint 381 against a 405 baseline**.

The verdict is NO-GO because the strict rule forbids GO while live RLS,
migration state, or payment fulfilment remain materially unverified —
and all three do. The live Supabase RLS state (DB-2, S-1) has never been
checked; whether migrations 0001/0002 are applied live is unconfirmed
and 0003 is unapplied; no real ₹599 payment has ever run end-to-end; and
no real-browser or mobile pass has ever been done. None of these is a
code defect, and none can be closed from this environment — but a launch
verdict that ignored them would be claiming evidence that does not
exist.

**The verdict flips to GO — with no further code change expected — when
the owner returns this evidence** (the full procedures are §I):

1. A passing `RLS-VERIFICATION.sql` run: all six tables
   `rowsecurity = true`, no hard FAILs — run before launch **and**
   again after 0003.
2. Confirmation that 0001/0002 are applied on the live project.
3. This code deployed (gates re-run green on the owner's machine) and
   guest check #1 passing.
4. Migration 0003 applied in the §I sequence, with guest check #2
   passing — media served via signed URLs, draft media not
   guest-reachable.
5. All env vars present: startup log clean, `/api/health` reporting all
   four booleans `true`.
6. Cloudflare WAF rule, CACHE-1/CACHE-2 edge cache rules and edge HSTS
   in place.
7. YouPI portal checks passing (webhook URL + secret match, API base,
   non-default admin token, INR-only).
8. One real ₹599 payment completed end-to-end — publish, success page,
   webhook delivery and gateway lookup all succeeding — and a clean
   real-browser pass, mobile included.

The §I hygiene items (vite one-line decision, authoritative `npm audit`,
probe-script quarantine) close alongside the same owner pass. Until that
evidence exists, the honest status is: **code ready, launch not yet
proven — NO-GO.**

---

## Appendix — Round 3 (2026-10-22)

Round 3 was commissioned from an external review of this repository,
which re-raised four payment/publishing suspicions against the Round-2
state and added a documentation-correction workstream. All four
suspicions were investigated against the actual code before any change
was made. Every suspicion was **confirmed real** and fixed; a fifth
defect was found by the consolidation review. This appendix records
the outcomes; nothing in it changes the §K verdict. All results below
are from the consolidation reviewer's own fresh runs and code re-reads
(evidence: `mission/evidence/round3-*.log` in the workspace), not from
the implementing agents' reports.

### Outcomes per workstream

- **Order-status protection (WS1) — CONFIRMED + FIXED.** The order API
  genuinely did not check invitation status: a direct API call could
  create a payable order for a published or archived invite, relying
  on the UI to never offer it. `POST /api/orders` now rejects any
  non-draft invite with `409 invite_not_publishable` (the status is
  read from the same invite row the ownership check uses) and any
  invite with an existing paid order with `409 invite_already_paid`.
  Check order: auth 401 → body-userId mismatch 403 → ownership 404 →
  status 409 → paid-guard 409 → completeness 422 → insert 201. The
  ₹599 fixed price, session-derived identity and the legitimate
  draft → payment → publication flow are unchanged.
- **Webhook state handling (WS2) — CONFIRMED + FIXED.** Fulfilment
  previously treated "not published" as publishable, so a webhook
  could resurrect an archived invite. Invite states are now explicit
  in `fulfilmentPlan`: paid + draft → `publish_only` (the Round-2
  partial-failure recovery, preserved); paid + archived → a recorded
  **conflict** outcome (`200 {"status":"conflict",
  "reason":"invite_archived"}`) — the order is marked paid through the
  same atomic transition (gateway corroboration still runs first for
  an unpaid order), the invite is never touched, the delivery is
  recorded, and the case is findable by `RECONCILIATION.sql` Q5 for a
  human decision. Publication itself is now a conditional update that
  applies only while the invite is still a draft, so an invite
  archived mid-flight also lands in the conflict outcome. No payment
  record is deleted and no refund is pretended.
- **Webhook concurrency (WS3) — CONFIRMED + FIXED.** The mark-paid
  decision previously rested on an earlier read (check-then-act), so
  two deliveries with different ids could both proceed as winners.
  `markOrderPaid` is now an atomic conditional update
  (`status IN ('created','failed')`, returning the row): exactly one
  racing delivery wins; the loser records its delivery and answers the
  same idempotent success without publishing. A handler-level race
  test with distinct delivery ids settles exactly once (one paid
  transition, one publish). Honesty boundary: mocked concurrency
  proves the code's winner/loser behaviour, not live Postgres
  row-lock timing — that still needs a live-database drill.
- **Media-failure surfacing (WS4) — CONFIRMED + FIXED.** A signed-URL
  shortfall was previously silent, indistinguishable from success —
  invisible before migration 0003, undiagnosable broken guest media
  after it. Media values are now classified explicitly
  (`classifyMediaValue`: storage-path / external-url / session-url /
  app-asset / empty; only storage paths are ever signed), and the
  signing server function reports any shortfall once per batch via
  `reportMediaSigningShortfall` — one server-log error carrying the
  invite id, the failed count and file names only (never full paths,
  never signed URLs). The fail-soft fallback behaviour is deliberately
  unchanged, because it is what keeps pre-0003 rendering working; the
  seal-image fix and upload validation are preserved.
- **Consolidation finding (verification round) — CONFIRMED + FIXED.**
  The verification re-read found a state the Round-3 fixes did not
  cover: `refunded`. `markOrderPaid`'s predicate already treated it as
  terminal, but the plan had no refunded case, so a late FAILED
  delivery would have overwritten a refunded order's status to
  `failed` via the unconditional mark-failed update. Reproduced with
  failing tests first (plan + handler), then fixed: a refunded order
  is now an idempotent no-op for every later event
  (`ignore / already_refunded`, answered `200 {"status":"refunded"}`),
  and its delivery is recorded so the gateway stops retrying.
- **Security/policy re-inspection** — completed as part of Round 3; the
  verdict table and findings F1–F4 are in `docs/SECURITY-REVIEW.md`
  (Round-3 section). F1–F3 are the payment items above, F4 the media
  item. No additional code-level finding survived inspection.
- **Documentation corrections** — completed as part of Round 3: stale
  `mission/…` references to shipped files were corrected to their
  packaged `docs/…` paths in this report, `docs/RELEASE-CHECKLIST.md`
  and `docs/SECURITY-REVIEW.md`, and workspace-only artifacts are now
  annotated as such (see the paths note at the head of this report).
  The ops runbook's stuck-order recovery section was reconciled with
  the new behaviour during consolidation: redelivery republishes
  **drafts only**; a paid order on an archived invite ends in the
  recorded conflict outcome and a `RECONCILIATION.sql` Q5 human
  decision. The canonical migration-0003 sequence — deploy the
  signed-URL code → verify a guest page → apply 0003 → run
  `docs/RLS-VERIFICATION.sql` → re-verify the guest page — is stated
  identically in §I and in the release checklist, together with the
  warning that applying 0003 **before** the code makes the bucket
  private while guests still resolve media through public URLs,
  breaking published invitations' photos and music.

### Verification results (consolidation reviewer, fresh runs)

- `npm test` — **316/316 passed (30 files)**: the Round-3 suite (312)
  plus 4 consolidation regression tests for the refunded finding,
  which were RED before the fix and GREEN after.
- `npx tsc --noEmit` — **0 errors**.
- `npm run build` — **green**.
- `npm run lint` — **381 problems (367 errors, 14 warnings)**, exactly
  the Round-2 baseline; no increase.
- Built-server probes (production build, placeholder env): `GET /` →
  200 with the short-TTL public cache header; `GET /api/health` → 200,
  booleans only, `no-store`; `POST /api/orders` without auth → 401;
  `POST /api/webhooks/youpi` with a bogus signature → 401.
- Bundle re-inspection on the new build: **0 source maps**;
  `SUPABASE_SERVICE_ROLE_KEY` / `YOUPI_WEBHOOK_SECRET` /
  `YOUPI_API_BASE_URL` appear in **0 public chunks** (the single
  `sb_secret_` string in the public bundle is supabase-js's bare
  key-format prefix literal, not a credential).

### Residual risks (unchanged honesty boundaries)

- Two concurrent checkouts on one draft can both create `created`
  orders. They are inert until paid; the paid-order guard plus the
  atomic webhook transition cap the money risk at one settled
  publication. A customer who completes two separate gateway checkouts
  would be charged twice at the gateway — the second settlement is
  visible in reconciliation and refundable at the gateway; preventing
  the second checkout is a gateway-session concern.
- Live Postgres row-lock timing, live RLS state, live migration
  state, a real ₹599 payment and the real-browser guest pass all
  remain **unverified** — they are owner-side and are exactly the §K
  flip conditions.

**Code verification: PASS — Production readiness: NO-GO pending live
verification.**

### Round 3.5 — payment-integrity follow-up (2026-10-22)

A re-review of the Round-3 code confirmed two remaining fail-open /
non-atomic spots in the payment paths. Both were reproduced with
failing tests first, then fixed; no migration was needed.

1. **Order API paid-order lookup failed open** (`src/routes/api/orders.ts`).
   The Round-3 paid-order guard destructured only `data` from its
   Supabase lookup and never read `error`: on a lookup failure the
   handler proceeded as if no paid order existed and inserted a new
   payable order. The lookup now fails closed — the error is thrown
   into the handler's existing catch, which logs the error class only
   (NF-7 discipline) and returns the generic `500 Failed to create
   order`: no insert, no checkout, no database detail in the
   response. The `409 invite_already_paid` / `409
   invite_not_publishable` behaviour and the check order are
   unchanged. (The handler's invite fetch also ignores its `error`,
   but there an error yields `null` → 404 with no insert — fail-closed
   in effect; recorded, deliberately not churned.)
2. **`markOrderFailed` was not atomic** (`src/lib/orders-server.ts`,
   handler case in `src/routes/api/webhooks/youpi.ts`). It updated by
   id alone, so a FAILED transition planned from a stale `created`
   read could overwrite an order that had since become `refunded`
   (or `paid`) — the plan-level no-ops only guard the read snapshot.
   It is now a conditional update in the same style as
   `markOrderPaid`, restricted to the eligible source states
   (`created`, `failed`), returning the row on success and `null`
   when no row matched. On a null outcome the handler re-reads the
   order and answers with the outcome that is actually true —
   `refunded` → the `refunded` response, `paid` → the idempotent
   success response — recording the delivery either way; an
   unresolvable state records nothing and returns the generic 500 so
   the delivery stays retryable. A transition that did not happen is
   never reported as `failed`.

Regression tests added (10): paid-lookup error → 500 + zero inserts +
error-class-only logging, plus a 201 control (`orders-auth.test.ts`);
`markOrderFailed` predicate / row / null unit pins
(`orders-server.test.ts`); handler-level deterministic race tests
that flip the stored order to `refunded` — and separately to `paid` —
between the handler's read and its update, asserting the terminal
state survives, no `failed` write lands, and the response is the
deliberate terminal outcome (`webhook-handler.test.ts`, via a new
`flipStatusAfterRead` interleave in the fake). The race tests were
RED against the pre-fix update (the refunded order ended `failed`)
and are GREEN after.

Verification (fresh runs on the final tree): `npm test` —
**326/326 passed (30 files)** (316 Round-3 baseline + the 10 above);
targeted payment files 129/129. `npx tsc --noEmit` — **0 errors**.
`npm run build` — **green**. `npm run lint` on the six touched files
— **0 problems**. No live system was contacted by any test.

Remaining limitation, stated plainly: the mocked race tests prove
the code-level predicate behaviour — the update's status predicate
is evaluated against the row's state at write time in the fake, as
PostgREST evaluates it inside the single UPDATE statement. They do
not prove live Postgres row-lock timing; that remains the owner-side
live-database drill already recorded in §J/Q-17.

**Code verification: PASS — Production readiness: NO-GO pending live
verification.**

### Round 3.6 — payment state-machine race closure (2026-10-22)

A further re-review identified a separate race in the SUCCESS path.
It was confirmed in the code, reproduced with failing handler tests,
and fixed; a full transition audit of the payment state machine
accompanied it. No migration was needed.

1. **A zero-row `markOrderPaid` was assumed to mean settlement**
   (`src/routes/api/webhooks/youpi.ts`, `mark_paid_and_publish`
   case). The conditional transition also matches nothing when the
   order became **refunded** (an out-of-band gateway/admin action)
   or otherwise left the fulfillable states after the handler's
   read — and the handler recorded the delivery and answered
   `200 {"status":"success"}` regardless, falsely acknowledging a
   fulfilment that never happened. The handler now re-reads the
   order on a null transition and classifies the state that is
   actually true, mirroring the Round-3.5 `mark_failed` convention:
   `paid` → the concurrent settlement is real — no re-marking; any
   outstanding publication is completed exactly as `publish_only`
   would (conditional, draft-only; an invite that left the draft
   state yields the conflict outcome), the delivery is recorded,
   and the idempotent success is answered; `refunded` → the
   truthful terminal `{"status":"refunded"}` outcome, delivery
   recorded, never a publish and never a success claim;
   `failed` / `created` / missing / re-read error → nothing is
   claimed and nothing is recorded — the generic 500 keeps the
   delivery retryable.
2. **The archived-conflict branch ignored the transition result**
   (same file, `conflict` case). It claimed a paid-and-archived
   conflict even when its `markOrderPaid` call had matched nothing
   because a refund won. The same re-read classification now gates
   the claim: genuinely paid (transition row, or re-read) → the
   Round-3 conflict outcome, unchanged; refunded → the refunded
   outcome, no conflict claimed; unresolved → retryable 500,
   nothing recorded.
3. **Additional defect found by the transition audit: the
   `publish_only` recovery published on a stale premise** (same
   file). The branch's premise — "this order is paid" — rested on
   the request's initial read; an order refunded between that read
   and the publish was still published by a recovery redelivery.
   The branch now re-reads and classifies before the publish side
   effect (refunded → terminal refunded outcome, no publish; any
   other non-paid state or a failed re-read → retryable 500,
   nothing recorded). The scenario-14 recovery itself is unchanged.

Transition matrix: the full order-state × event matrix was rebuilt
from the code and is recorded in the Round-3.6 evidence
(`mission/evidence/round36-fixes.log` in the workspace). In compact
form: `refunded` is terminal for every webhook event; `paid` is
never downgraded; both mark transitions are conditional updates
whose zero-row results are always classified by re-read, never
assumed; publication is only ever the conditional draft→published
update; deliveries are recorded exactly once, only after the
outcome is classified, and never for rejects/retries.

Regression tests added (7, `src/test/webhook-handler.test.ts`, via
new fake interleaves — a failing Nth order select and a one-shot
failing delivery insert): **A** SUCCESS races a refund (zero-row
transition answered as refunded, no paid write, no publish);
**B** SUCCESS races a concurrent settlement (no duplicate
transition, the outstanding publish completes exactly once);
**C** archived-conflict races a refund (no false conflict claimed);
**C2** pin — the conflict stays genuine when a concurrent delivery
recorded the payment first (already the outcome pre-fix, kept
honest); **D** zero-row transition whose re-read fails (500,
nothing recorded, delivery retryable); the `publish_only`
premise-race test for item 3; and a delivery-record-failure pin
(fulfilment succeeds, the record insert fails → error answered,
redelivery completes the recording with no repeated side effect).
A, B, C, D and the premise test were **RED against the pre-fix
handler** and are GREEN after; C2 and the record-failure pin passed
before and after (already-correct behaviour).

Duplicate checkouts (Q-16) were investigated and deliberately **not**
changed: order creation always inserts a new `created` order and
each checkout opens a fresh gateway modal under the new order id,
so two completed gateway checkouts can charge a customer twice (the
settlement side remains capped at one publication and is
reconciliation-visible/refundable). A robust prevention needs
either a partial-unique-index migration plus an API conflict
response, or order reuse — and reuse's safety depends on YouPI's
re-pay behaviour for a single order id, which cannot be verified
from this repository. The full analysis, options and the required
owner approvals are recorded in the Q-16 backlog entry. Duplicate
charges remain possible; they are not claimed impossible.

The order API was re-checked after these changes (Task 5 of the
brief): the paid-order lookup still fails closed (generic 500, no
insert, error-class-only logging), both 409 gates, session-derived
ownership, the fixed ₹599 validation and the check ordering are
intact, and no other fail-open query pattern was found. No change
was made to `src/routes/api/orders.ts`.

Verification (fresh runs on the final tree): targeted payment
files — **107/107 passed**; full `npm test` — **333/333 passed
(30 files)** (326 Round-3.5 baseline + the 7 above).
`npx tsc --noEmit` — **0 errors**. `npm run build` — **green**.
`npm run lint` — **381 problems (367 errors, 14 warnings)**,
exactly the standing baseline; the two touched files are clean.
No live system was contacted by any test.

Remaining limitations, stated plainly: the mocked race tests prove
code-level classification behaviour — the fake evaluates each
conditional update's status predicate against the row's state at
write time, as PostgREST does inside the single UPDATE statement.
They do not prove live PostgreSQL row-lock timing; that remains
the owner-side live-database drill (Q-17). Two single-request
micro-windows are documented rather than rewritten: a refund
landing between a *won* mark-paid and the conditional publish, and
plan-level terminal answers (already-paid/conflict for an order
read as paid) resting on the request's initial read — both perform
no unclassified side effect, and both are reconciliation-visible.

**Code verification: PASS — Production readiness: NO-GO pending live
verification.**

### Round 3.7 — atomic settlement + duplicate-order prevention (2026-10-22)

A further re-review raised two issues and re-opened the Q-16
decision. All were investigated by parallel read-only agents
(evidence: `mission/evidence/round37-agent1/2/3/6.log` in the
workspace), confirmed or refined against the code, and then fixed
tests-first. Two migrations were PREPARED as files; **neither is
applied anywhere**, and no live system was contacted.

1. **`publishInvite`'s fallback read ignored its error** —
   **FIXED.** (`src/lib/orders-server.ts`.) When the conditional
   draft→published update matched no row, the fallback status read
   destructured only `data`: a failed read fell through to
   `not_draft`, and every caller mapped that to a recorded terminal
   conflict outcome for an invitation whose state was never
   established. The fallback now throws on error, so the delivery
   stays retryable with nothing recorded; genuine reads keep their
   exact semantics (`published` → `already_published`,
   archived/missing → `not_draft`). Six unit tests (the helper had
   none): the error case was RED before the fix.
2. **The webhook's invite pre-read ignored its error** — **FIXED.**
   (`src/routes/api/webhooks/youpi.ts`.) The same class of defect
   one level up: a failed invite-status read produced the same null
   as a missing row, so the fulfilment plan was computed on an
   "unknown" invite state — for a paid order whose invite was
   really still a draft, the plan degraded to a *recorded* ignore,
   consuming the delivery id the scenario-14 recovery depends on.
   The read now throws → retryable 500, nothing recorded. A
   successful read with no row keeps the previous null semantics.
   Handler test RED before the fix.
3. **The refund/publication window (Part 2)** — **FIXED in code;
   NOT VERIFIED on real PostgreSQL.** Settlement and publication
   were separate PostgREST statements, so a refund landing between
   a *won* mark-paid and the publish still published (the publish
   inspected only the invite). A staged handler test proved it
   against the old flow (refund flipped in after the won transition
   → success + published). No re-read can close that gap, and no
   code-only fix exists on PostgREST (Agent-2 analysis). The fix
   is migration `0004_settle_and_publish.sql` (NOT applied): a
   plpgsql function that locks the order row, classifies and marks
   it under that lock, and publishes under the same lock (fixed
   lock order orders → invites), with EXECUTE revoked from
   public/anon/authenticated and granted to service_role only —
   without the revoke any signed-in user could settle their own
   order unpaid. All three webhook fulfil paths now call it via a
   typed wrapper (`settleAndPublish` in `orders-server.ts`, which
   throws on RPC error or any unrecognized outcome) and map its
   outcomes onto the established vocabulary: `settled_*` → recorded
   success; `conflict_archived` → the recorded conflict;
   `refunded` → the recorded truthful refunded outcome, never a
   publish; `not_found` / `not_paid` / `retryable` → retryable 500,
   nothing recorded. Design + guarantee + deploy order:
   `mission/ADR-settle-and-publish.md`. **Deploy consequence,
   stated prominently: the Round-3.7 code REQUIRES 0004 to be
   applied BEFORE the code deploys** (the reverse of 0003's
   sequence); mis-sequencing fails closed (PGRST202 → 500s, nothing
   recorded) and rollback is a code redeploy. What the guarantee
   does NOT cover: a refund landing *after* a legitimate
   publication — unpreventable publish-side, an owner policy
   decision (recommendation: no auto-unpublish; Q6a + runbook §2.2
   are the response). The mocked tests model the function's
   outcome contract and the interleaves around the call; live
   row-lock behaviour remains the owner-side Q-17 staging drill
   (runbook §6), so this item's live status is NOT VERIFIED.
   Of the two Round-3.6 micro-windows: (i) is closed by this item
   once 0004 is live; (ii) — plan-level terminal answers resting on
   the request's initial read — is **unchanged by design** (the
   brief's explicit idempotent-terminal contract; it performs no
   unclassified side effect).
4. **Q-16 duplicate checkouts** — **PARTIALLY FIXED.** Option D
   (Agent-3 analysis) implemented in code: `POST /api/orders` now
   resolves the invite's ACTIVE order (`created` or `paid`, newest
   first; the lookup fails closed exactly like Round 3.5's)
   before inserting — `paid` → the existing `409
   invite_already_paid`; `created` → the existing order is
   returned (201) instead of a duplicate. Migration
   `0005_orders_one_active_per_invite.sql` (NOT applied) adds the
   partial unique index as the database backstop; an insert losing
   the race (Postgres 23505) is resolved from the winning order by
   a fresh lookup (paid → 409; created → returned; unresolvable →
   generic 500). `failed`/`refunded` orders never block a retry.
   Seven new tests plus the rewritten concurrent-attempts
   characterization, RED→GREEN. Precisely what this does and does
   not prove: duplicate ORDERS are prevented once 0005 is applied
   and the code deployed; duplicate CHARGES are **not** proven
   prevented — reuse presents one order_id to the gateway, and
   whether a second `pay()` on it can collect again is YouPI's
   semantics (owner question **G1**, Q1–Q4 in the backlog entry),
   unverifiable from this repository. Owner decisions remaining:
   **D1** (approve 0005 + its pre-flight cleanup rules) and **D2**
   (abandoned-checkout policy; the implemented default is
   reuse-indefinitely, with the staleness trade-off stated in the
   backlog).
5. **Reconciliation / ops wiring** — **FIXED.** `Q6a` gained the
   surviving-paid-order guard (without it, the resolved
   duplicate-charge case — duplicate refunded, invite legitimately
   published under the surviving order — was a false positive whose
   action text would have taken down a funded invitation) plus
   corrected action text; `Q5` gained `DISTINCT` (it emitted one
   row per recorded SUCCESS delivery); the file header's
   verification claim was corrected (payload keys rest on the
   handler code, not the migrations). Q6a/Q6b are labelled
   detection controls, not prevention. The runbook gained the
   matching procedures (§1.4 cadence for Q4/Q6a/Q6b — no documented
   cadence ran them before; §2.1 duplicate-charge, §2.2
   refunded-but-published, §2.3 delivery-recording failure, §2.4
   gateway ambiguity, §6 the Q-17 drill incl. the 0004 lock test)
   and its §1.1 query was aligned to Q1's LEFT JOIN semantics.
   The release checklist gained the 0004 deploy sequence, the
   0005/Q-16 decision item, the reconciliation cadence and the
   Q-17 drill.

Transition-matrix annotations (from the Round-3.6 matrix review):
(1) every `not_draft → conflict` cell was polluted by item 1 —
resolved: the helper throws on unknown state, and the handler no
longer composes it (the RPC classifies instead); (2) the
paid/SUCCESS "invite published/unknown/none → ignore" row
conflated a missing row with a failed read — resolved by item 2
(a failed read is now a retryable 500; only a genuinely missing
row yields the null path); (3) deliveries WITHOUT an
`x-gateway-delivery-id` header get no pre-check and no recording
in any branch — unchanged; their side effects remain exactly-once
via the conditional transitions and now the RPC. The matrix
itself is otherwise unchanged: `refunded` terminal for every
event, `paid` never downgraded, deliveries recorded once, only
after classification.

Files changed: `src/lib/orders-server.ts` (fallback fix;
`settleAndPublish` + outcome type; helper retained and documented),
`src/routes/api/webhooks/youpi.ts` (pre-read fix; three fulfil
paths rewired to the RPC behind a shared outcome mapping),
`src/routes/api/orders.ts` (active-order lookup/reuse, 23505
translation), `supabase/migrations/0004_settle_and_publish.sql`
(new, NOT applied), `supabase/migrations/0005_orders_one_active_per_invite.sql`
(new, NOT applied), tests (`orders-server.test.ts` +12,
`webhook-handler.test.ts` +4 net with scenario-14/test-D/Part-2
stagings reworked for the atomic flow, `orders-auth.test.ts` +7
with the Q-16 fake + the concurrent-attempts test rewritten,
`authz-two-user.test.ts` fake extended), and the mission docs
(ADR, RECONCILIATION.sql, OPS-RUNBOOK.md, RELEASE-CHECKLIST.md,
AUTONOMOUS-BACKLOG.md).

Verification (fresh runs on the final tree): targeted payment
files — **130/130 passed** (orders-server 19, orders-auth 32,
webhook-fulfilment 49, webhook-handler 30; 159/159 including the
two-user authz suite); full `npm test` — **356/356 passed (30
files)** (333 Round-3.6 baseline + 23 new). `npx tsc --noEmit` —
**0 errors**. `npm run build` — **green**. `npm run lint` —
**381 problems (367 errors, 14 warnings)**, exactly the standing
baseline, and the touched files are clean. No live system was
contacted by any test; no migration was executed anywhere — the
SQL in 0004/0005 is reviewed-only, like the reconciliation pack.

Remaining owner decisions: **D1** (apply 0005 + cleanup rules),
**D2** (abandoned-checkout staleness policy), **G1** (YouPI
re-pay semantics, Q1–Q4), and the refund-after-publication policy
(auto-unpublish or not). §K is untouched.

**Code verification: PASS — Production readiness: NO-GO pending live verification.**

#### Round 3.7 — adversarial review outcomes (2026-10-22)

Two reviewers who did not author the Round-3.7 changes re-examined
them adversarially (Reviewer A: PostgreSQL / state-machine;
Reviewer B: webhook/API error handling + regression coverage —
evidence: `mission/evidence/round37-reviewA.log`,
`round37-reviewB.log`). The migration-0004 outcome grid, the ACL
lockdown reasoning, the Q6a guard and the Part-2 guarantee itself
survived falsification. Four findings came out of the reviews; all
are now closed:

1. **Reviewer A (HIGH) — migration 0005 vs. late settlement** —
   **FIXED.** A `failed` order whose payment genuinely settles late,
   after a successor active order exists for the same invite, made
   the settle RPC's mark-paid UPDATE violate 0005's partial unique
   index (23505): the RPC aborted, the handler answered 500 on
   every redelivery, the delivery was never recorded, and no
   reconciliation query could see the order — a settled charge
   bricked invisibly. `settleAndPublish` now translates an RPC
   error with `code === "23505"` into a dedicated
   `duplicate_active_order` outcome (attribution is safe: the RPC
   writes nothing else unique-constrained), and the handler maps it
   to a recorded `200` conflict with reason
   `duplicate_active_order` — terminal for that delivery; recovery
   is an owner action (runbook §2.1). Migration 0005's header claim
   that late settlement always fulfils was corrected (it fulfils
   only when no other active order exists for the invite), and
   `RECONCILIATION.sql` gained **Q7** (orders still
   `failed`/`created` with a recorded SUCCESS delivery — Q3 cannot
   see the `failed` case). **Caveat:** that the 23505 code actually
   survives the plpgsql → PostgREST → supabase-js boundary intact
   is itself an unverified live behaviour — it is now Q-17 drill
   step 8 in runbook §6 (staging only). Until that step passes, the
   translation is verified against the mocked PostgREST error shape
   only, and this item's live status is **NOT VERIFIED**.
2. **Reviewer B — order reuse bypassed the completeness gate** —
   **FIXED** (by the reviewer, tests-first). The created-order
   reuse return in `POST /api/orders` sat before the NF-3
   completeness check, so a retry against an invite whose stored
   config had been emptied returned a payable checkout the
   pre-3.7 flow would have answered `422 invitation_incomplete`.
   The completeness check now runs before the reuse return (the
   `paid` → `409 invite_already_paid` precedence is preserved).
   Owner-self-scoped, no money impact; two tests added.
3. **Q5 DISTINCT correction** (Reviewer A) — item 5 above said Q5
   "gained DISTINCT" to collapse per-delivery rows; with
   `delivery_id`/`created_at` in the select list a plain DISTINCT
   could never collapse them (and the UNIQUE delivery_id already
   forbids exact duplicates, so it was a no-op). Q5 now uses
   `DISTINCT ON (o.id)` with the most recent recorded SUCCESS
   delivery as the representative — one row per paid-but-archived
   order, as originally intended.
4. **ADR precision corrections** (Reviewer A) — the ADR's "no lock
   cycle can form" claim was false as stated: the shipped FK
   referential actions (invite delete → orders `SET NULL`; profile
   cascade) are multi-row and CAN form a cycle with the RPC;
   Postgres aborts one side with 40P01 (retryable 500, or the
   owner's delete failing loudly) — no invariant breaks, but the
   claim is corrected. The ADR also now states explicitly that
   RETURN outcomes after a mark (`conflict_archived`, and the
   defensive `retryable` cells) COMMIT that mark: "one
   transaction" never meant "non-settled outcomes write nothing",
   and the retryable-after-mark residue (paid + unrecorded
   delivery) self-heals on redelivery in the scenario-14 shape.

Review fixes were made tests-first (the four new tests failed
against the pre-fix code for the stated reasons; the no-successor
control passed throughout). Updated verification (fresh runs on
the final tree): targeted payment files **137/137**
(orders-server 21, orders-auth 34, webhook-fulfilment 49,
webhook-handler 33); full `npm test` — **363/363 passed (30
files)** (356 Round-3.7 implementation + 2 Reviewer-B tests = 358
when this review-fix pass opened, + 5 review-fix tests). `npx tsc --noEmit` — **0 errors**.
`npm run build` — **green**. `npm run lint` — **381 problems (367
errors, 14 warnings)**, exactly the standing baseline; every
touched file is lint-clean. §K untouched; the closing status is
unchanged.

**Code verification: PASS — Production readiness: NO-GO pending live verification.**
