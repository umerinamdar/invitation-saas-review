# RELEASE-CHECKLIST.md — Owner-side actions (EasyInviteMaker)

Status: **FINALISED — Stage F (2026-10-21). All items TODO(owner); nothing on this
list has been verified against a live system by the agent team.** Each item names
the dashboard area, the setting to inspect, the expected state, and a safe way to
verify it. Do not treat a checked migration file or a passing local test as proof a
live setting is correct. Sources: Batch 2 handoff + the production-ready mission
(Waves 2–5, Stage E review in `docs/FINAL-REVIEW-mission.md`).

Path convention (Round-3 correction, 2026-10-22): this checklist ships in
the delivery package as `docs/RELEASE-CHECKLIST.md`; `docs/…` paths below
are inside that package. Anything named as a workspace-only artifact is
not shipped and lives only in the project workspace's mission folder.

Legend: ☐ TODO(owner) · ✔ done (owner confirms) — the owner marks items off.

---

## 1. Supabase

- ☐ **TODO(owner) — Apply migration 0003** (`supabase/migrations/0003_invite_media_hardening.sql`)
  in the Supabase SQL Editor, after a backup. It makes the `invite-media` bucket
  private, sets a 10 MiB file-size limit and a MIME allowlist, and replaces the
  read-all policy with owner-read + published-invite-read policies. It has **not**
  been applied anywhere yet. A rollback SQL block is included in the file's comments.
  Before applying, record the bucket's current state (public flag, limits, policies)
  so the rollback can be checked against it.
  > ⚠️ **SEQUENCING WARNING (Gap-B) — do NOT apply 0003 as a standalone launch
  > step.** The moment 0003 is applied the bucket becomes private, and guest
  > rendering of stored photos/music currently resolves media through
  > `getPublicUrl`, which stops working for a private bucket. A signed-URL flow
  > for guest rendering must be built and scheduled **before** 0003 is applied,
  > or published invitations will lose their photos and music for guests. The
  > limitation is documented in the `resolveMediaUrl` doc comment in
  > `src/lib/media-upload.ts` and in `docs/SECURITY-REVIEW.md` (open finding
  > #2 — closed in code by Round 2; see its Round-3 section). The upload path scheme already matches 0003's policies (verified in
  > Stage E), so no data migration is needed when the signed-URL work lands.
  >
  > **UPDATE — Round 2 consolidation (2026-10-22): Gap-B is now BUILT.** The
  > signed-URL flow the warning above was waiting for has landed and is
  > independently verified (`src/lib/media-url.ts`, `src/lib/media-signing.ts`;
  > see `docs/PRODUCTION-READINESS-AUDIT.md` §E.3). The warning's precondition
  > is therefore satisfied **in code**; what remains is deployment order. Apply
  > 0003 in exactly this sequence:
  > 1. Deploy the current code (the cumulative Round-2 package) to production.
  > 2. Open one published invitation as a guest and confirm photos and music
  >    load (this still uses the pre-0003 public URLs — it proves the deploy).
  > 3. Apply 0003 in the SQL Editor (backup first; record the bucket's current
  >    public flag, limits and policies before applying).
  > 4. Run `docs/RLS-VERIFICATION.sql` — including the storage blocks,
  >    whose expected answers change after 0003.
  > 5. Re-open the same published invitation as a guest and confirm photos and
  >    music still load — they are now served by the signed URLs minted
  >    server-side — and confirm a draft's media is not guest-reachable.
  > No code change is needed at migration time, and no data migration is
  > needed (upload paths already match 0003's policies).
- ☐ **TODO(owner) — Confirm migrations 0001/0002 state.** In the SQL Editor, confirm
  whether 0001/0002 were previously applied to the live project (table list should
  show: profiles, invites, invite_assets, orders, invite_views, webhook_deliveries).
- ☐ **TODO(owner) — RLS verification (DB-2, the launch blocker).** Run the
  full pack `docs/RLS-VERIFICATION.sql` in the SQL Editor — **before
  launch, and again after applying 0003**. Its first block is:
  `select tablename, rowsecurity from pg_tables where schemaname = 'public';`
  Expected: all six tables report `rowsecurity = true`; the pack also checks
  the storage bucket and every policy, and includes the guided two-account
  manual test. Follow up in Authentication → Policies if anything FAILs.
- ☐ **TODO(owner) — Storage verification after 0003.** Storage → `invite-media` bucket:
  expected private (not public), file size limit 10 MiB, MIME allowlist present;
  policies show owner-scoped read/write plus published-invite read, and no
  read-all policy remains.
- ☐ **TODO(owner) — Auth settings sanity.** Authentication → Rate limits / settings:
  confirm sign-in/sign-up limits are enabled (values are the owner's choice) and the
  site URL / redirect URLs match the real deployed domain. The Redirect URLs
  allow-list must include **`<domain>/reset-password`** — the password-recovery
  page (emergency release Fix 2) is unreachable without it, because Supabase
  rejects any recovery redirect that is not allow-listed.
- ☐ **TODO(owner) — Migration 0004 (`settle_and_publish`) + Round-3.7 code, IN THIS
  ORDER.** The Round-3.7 webhook settles and publishes through the
  `settle_and_publish` database function (migration
  `supabase/migrations/0004_settle_and_publish.sql`). ⚠️ **The code REQUIRES 0004
  to be applied BEFORE it is deployed** — the reverse of 0003's sequence. If the
  code deploys first, webhook fulfilment fails CLOSED (PostgREST PGRST202 →
  handler 500 → nothing recorded, nothing falsely fulfilled; redeliveries recover
  once the function exists), but no payment will fulfil until the order below is
  completed:
  1. Confirm 0001/0002 are applied (item above).
  2. Apply 0004 in the SQL Editor (its header carries the full sequence,
     including the mandatory EXECUTE revoke — do not skip or alter it; without
     it any signed-in user could call the function and mark their own order paid).
  3. Smoke-check: `select public.settle_and_publish('00000000-0000-0000-0000-000000000000'::uuid, 'smoke');`
     — expected result `not_found`.
  4. Run the verification pack `docs/VERIFY-0004.sql` (V1–V3; its V4 is the
     same smoke call as step 3): **V1** existence + signature (exactly one
     function, `p_order_id uuid, p_gateway_payment_id text`, returns text,
     SECURITY INVOKER) and **V2** definition sanity (exactly two FOR UPDATE
     locks; the orders row is locked before the invites row) — existence
     alone does not prove the live definition is the reviewed one. **V3**
     ACL: `has_function_privilege` must return anon = **false**,
     authenticated = **false**, service_role = **true**. Any deviation =
     STOP — do not deploy the code.
  5. Deploy the Round-3.7 code.
  6. Watch the first webhook deliveries and run `docs/RECONCILIATION.sql`.
  Rollback is a code redeploy of the previous version (it never calls the
  function); the function itself may stay (unused, execute revoked) or be
  dropped per 0004's rollback block.
- ☐ **TODO(owner) — Q-16 decision D1 + migration 0005.** Decide the
  duplicate-checkout prevention (backlog Q-16, Round-3.7 update): approve
  migration `supabase/migrations/0005_orders_one_active_per_invite.sql` (partial
  unique index: at most one `created`/`paid` order per invite) AND its
  pre-flight cleanup rules. Steps: run the pre-flight conflict report in 0005's
  header on the live database → resolve every row per the cleanup rules in the
  same header (surplus `created` → retire as `failed`; paid+paid → STOP, real
  double-charge incident, runbook §2.1 first) → re-run the report (must be zero
  rows) → apply 0005. Also record decision **D2** (abandoned-checkout policy):
  the implemented default is *reuse the active order indefinitely*; the
  alternative is a staleness threshold after which a stale `created` order is
  retired and a fresh one issued. Without one of these decided, an abandoned
  checkout can block re-payment of that invite under the index — see the Q-16
  backlog entry for the trade-off, and YouPI question **G1** (one successful
  payment per order_id + `pay()` resume semantics), which gates calling Q-16
  fully fixed.
  > ⚠️ **SEQUENCING (G4): apply 0005 ONLY together with or after the
  > Round-3.7 code deploy.** The 23505 translation that makes this index
  > safe (`settleAndPublish` answering `duplicate_active_order`) lives in
  > the Round-3.7 code. Applying 0005 while older code is live recreates
  > the late-settlement brick the adversarial review found: a late
  > mark-paid hits 23505, is thrown as an unhandled error, and the
  > webhook 500s on every redelivery with nothing recorded.
  After applying, verify the index actually exists with the right
  definition:
  `select indexname, indexdef from pg_indexes where tablename = 'orders' and indexname = 'orders_one_active_per_invite';`
  Expected: one row whose definition is a UNIQUE index on
  `public.orders (invite_id)` with the partial predicate
  `WHERE invite_id IS NOT NULL AND status IN ('created', 'paid')`.
- ☐ **TODO(owner) — Migration 0006 (invite status guard) — before live
  payments.** Apply `supabase/migrations/0006_invite_status_guard.sql`
  (trigger forcing end-user invite writes to stay `draft` and blocking
  status/published_at changes from anon/authenticated roles — closes the
  self-publish bypass in migration 0001's ownership-only policy). It is
  independent of code and of 0003/0004/0005 and may be applied at any time,
  but it **must be live before payments are enabled**. After applying,
  run the two checks added for it in `docs/RLS-VERIFICATION.sql` Block D
  (**D9**: owner PATCH own invite `status='published'` must FAIL; **D10**:
  INSERT with `status='published'` must fail or land as draft).
- ☐ **TODO(owner) — Reconciliation cadence includes Q4/Q6a/Q6b/Q7.** When running
  the runbook §1 cadence, include `docs/RECONCILIATION.sql` Q4, Q6a, Q6b and
  Q7 as runbook §1.4 specifies (paid-without-delivery,
  refunded-but-published, multiple-paid-per-invite, late-settlement
  conflicts). Before Round 3.7 no documented cadence ran them, and Q7
  (added in the Round-3.7 review-fix pass) was missing from the cadence
  list until the emergency release.
- ☐ **TODO(owner) — Q-17 staging concurrency drill.** Before launch sign-off,
  run the drill in `docs/OPS-RUNBOOK.md` §6 against a staging project (never
  production data): redelivery idempotency, the archived conflict, the
  double-submit race, and the refund-vs-settlement lock drill against
  `settle_and_publish`. Record the date, build and outputs; mocked tests are
  not evidence for this item.

## 2. Cloudflare

- ☐ **TODO(owner) — WAF rate-limiting rule (the real rate-limit control).**
  Dashboard → select the site's domain → Security → WAF → Rate limiting rules →
  Create rule:
  - Rule 1: path equals `/api/orders` — threshold ≈ 20 requests per 10 seconds
    per IP — action: Block.
  - Rule 2: path starts with `/api/webhooks/` — threshold ≈ 300 requests per
    1 minute per IP — action: Block.
  The in-code limiter shipped in Batch 2 is a per-isolate backstop only; this rule
  is the production control.
- ☐ **TODO(owner) — Check plan tier.** Rate-limiting rule availability and the
  periods/thresholds above depend on the Cloudflare plan tier. Confirm the tier
  supports the rules; if the tier offers different period options, pick the
  closest equivalents and note what was actually set.
- ☐ **TODO(owner) — Deployment environment variables present** (names only — never
  paste values into chat or documents): `SUPABASE_SERVICE_ROLE_KEY`,
  `YOUPI_WEBHOOK_SECRET`, `YOUPI_API_BASE_URL` set as Worker secrets/vars for the
  production environment.
- ☐ **TODO(owner) — CSP Report-Only → enforcing (optional, deliberate).** The app
  ships a Content-Security-Policy in **Report-Only** mode (set in the server
  entry; an enforcing CSP today would break the YouPI checkout script, Google
  Fonts and inline theme styles). After the site is live, watch the reports for
  a while; only flip to enforcing once the reports are clean and the policy has
  been tightened deliberately. Leaving it Report-Only is acceptable — it is
  monitoring, not a hole.

## 3. YouPI (payment gateway instance)

- ☐ **TODO(owner) — Webhook URL.** In the YouPI merchant/admin settings, the webhook
  URL must point at the deployed site's `/api/webhooks/youpi` path on the real
  domain (not a tunnel or localhost URL).
- ☐ **TODO(owner) — Webhook secret match.** The secret configured in YouPI must
  match the `YOUPI_WEBHOOK_SECRET` value in the deployment environment (compare
  without sharing the value with anyone).
- ☐ **TODO(owner) — `YOUPI_API_BASE_URL`.** The deployment env var must point at
  the YouPI instance's API base so the server-side payment lookup
  (`GET /api/v1/payments/{id}`) can corroborate status, amount and currency.
- ☐ **TODO(owner) — `ADMIN_API_TOKEN` non-default.** Confirm the YouPI instance's
  admin API token is not the shipped default — per YouPI's own docs it unlocks
  every merchant's data.
- ☐ **TODO(owner) — INR-only configuration.** Confirm the merchant account /
  instance is configured for INR settlement only, matching the site's flat
  ₹599 pricing and the currency check the webhook performs.
- ☐ **TODO(owner) — Remaining instance settings.** Work through the six settings
  listed in `currency-investigation.md` §5 against the actual instance
  (workspace-only note — not shipped in the delivery package).

## 4. Deployment environment variables (names only)

Expected names — values live only in the deployment platform, never in the repo:

- Public (client-visible by design): `VITE_SUPABASE_URL`,
  `VITE_SUPABASE_PUBLISHABLE_KEY`, and the `VITE_YOUPI_*` public checkout values.
- Server-only: `SUPABASE_SERVICE_ROLE_KEY`, `YOUPI_WEBHOOK_SECRET`,
  `YOUPI_API_BASE_URL`.
- Build-time (public, not a secret): `VITE_SITE_URL` — set it to the real
  production origin (e.g. `https://www.yourdomain.com`) at deploy time to
  activate the `og:url` tags added by the SEO wave. Until it is set, `og:url`
  is cleanly omitted from pages rather than emitted with a wrong/localhost
  origin; all other Open Graph tags work without it.
- ☐ TODO(owner): confirm each name exists in the production environment and that
  no server-only value has ever been committed to the repo or shipped in a ZIP.

## 5. Pre-launch manual checks (owner, on the real deployment)

- ☐ **TODO(owner) — Real sign-in + order flow.** Sign in on the deployed site,
  create an invitation, and place an order up to the payment step; confirm the
  order appears with the correct ₹599 amount and the signed-in account as owner.
- ☐ **TODO(owner) — One real small payment, when the owner decides.** Complete a
  genuine payment end-to-end and confirm: the invitation publishes, the success
  page reflects the real paid state, and the webhook delivery + gateway lookup
  succeed. Capture the real webhook payload and lookup response as test fixtures
  for the project (redact secrets before saving).
- ☐ **TODO(owner) — Failed/interrupted payment recovery.** Abandon a payment
  midway and confirm the draft invitation is intact and checkout can be retried
  without a duplicate published invite.
- ☐ **TODO(owner) — Public link check.** Open the published `/i/<slug>` link in a
  private/incognito window (signed out) and confirm the invitation renders and
  that an unpublished invite's link does not.
- ☐ **TODO(owner) — Authoritative dependency audit.** Run `npm audit` once on a
  normal machine/CI (the agent workspace's registry proxy blocks it) and file the
  output; separately decide on the one-line vite pin change
  (`"vite": "8.1.5"` → `"^8.1.6"`) documented in the Batch 2 handoff.
- ☐ **TODO(owner) — Run `npm install` after applying the production-ready ZIP.**
  The mission changed `package.json`/`package-lock.json` (one new runtime
  dependency: `qrcode`, plus `@types/qrcode` for development — the QR code
  feature). Apply the ZIP, then run `npm install` before building, or the QR
  feature will fail to build.
- ☐ **TODO(owner) — Real-browser check (the journeys automation could not run).**
  Browser E2E could not be executed in the agent environment (Playwright's
  chromium download is blocked there — verdict INFEASIBLE-HERE in
  `docs/TEST-RESULTS.md`). On the real deployment, in a real browser,
  confirm by eye: the home page and `/templates` render (all 14 designs);
  `/create` shows inline validation errors on an empty submit; a published
  `/i/<slug>` invitation renders opened, with photos/music; the dashboard QR
  code displays and its PNG downloads; and Print / Save-as-PDF of an opened
  invitation looks clean (the new `@media print` rules hide the site chrome —
  never visually verified by an agent).
- ☐ **TODO(owner) — Quarantine the root probe scripts (NF-11).** The project
  root contains four pre-existing probe scripts from development —
  `check-storage.mjs`, `probe-supabase.mjs`, `test-auth-flow.mjs`,
  `test-db-only.mjs`. They embed the live publishable key and target the live
  Supabase project. Delete them or move them out of the project before any
  deployment packaging so they can never ship or be run against production by
  accident. (They are unchanged from the original download and are **not** in
  the Stage F delivery ZIP — listing-verified.)
