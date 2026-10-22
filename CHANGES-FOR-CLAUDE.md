## R-1 follow-up (2026-10-21)

This zip (`easyinvitemaker-r1-wiring-fix.zip`) applies **after** `easyinvitemaker-batch2-fixes.zip`. It registers the two API routes (`/api/orders`, `/api/webhooks/youpi`) that Batch 2's handlers were unreachable without — handler logic is unchanged. Live probes now return the handlers' own 401s instead of the app's 404. Full detail: see the "R-1 wiring fix — REVIEWED + CLOSED" section at the end of this file.

# Changes for Claude Code — EasyInviteMaker (invitation-saas)

## Header

- **Date:** 2026-10-21
- **Made by:** Muse (implementing subagent), priority round only
- **Project:** EasyInviteMaker — `invitation-saas`
- **Base state:** the pristine project copy the owner uploaded on 2026-10-21
  (no `.git` in the working copy; nothing was committed or rewritten)
- **Scope:** ONLY the priority fixes — audit Task 3 (price) and Tasks 4–5
  (create/publish validation + NaN countdown). Everything else from the
  29-task audit list and the security/scalability programme is parked and
  was NOT touched.

## OWNER CONFIRMATION — flat ₹599 (read this first)

The ₹999 on `/publish` was **not** a stray typo: it came from a tier
mechanism in the code — `theme.tier === "royal"` → ₹999, `"classic"` →
₹599. 12 of the 14 themes are `"royal"`; only `monochrome-vow` and
`phulkari-anand` are `"classic"`.

**The owner was shown this tier discovery and confirmed on 2026-10-21:
flat ₹599 for every design.** This round implements exactly that:

- Price no longer depends on `tier` anywhere.
- The `tier` field in every theme config is **preserved untouched** —
  theme data was not edited; tier is now metadata only.
- The single price source is `src/config/site.ts`
  (`PUBLISH_PRICE_INR = 599`, `PUBLISH_PRICE_PAISE = 59900`,
  `PUBLISH_PRICE_LABEL = "₹599"`).
- If the owner later chooses tiered pricing, the revert is a one-config
  change in `src/config/site.ts` plus marketing-copy updates — no theme
  files need to change back.

## Summary of changes (grouped by area)

### Pricing & payments

- One price source of truth: new `src/config/site.ts`. Every price
  display and the charge amount now derive from it.
- `/publish` no longer computes `tier === "royal" ? "₹999" : "₹599"`.
- YouPI checkout no longer branches its amount on tier; it sends
  `PUBLISH_PRICE_PAISE` (59900).
- **Server-side (security-relevant):** `POST /api/orders` previously
  accepted any client-supplied `amountMinor` between ₹100 and ₹10,000.
  It now requires the amount to be exactly `PUBLISH_PRICE_PAISE` and
  returns `400 Invalid amount` otherwise — the price is no longer the
  client's choice. This partially addresses security critical #1
  (client-set price). Session authentication for `/api/orders` was
  deliberately NOT added in this round (separate owner-approved step).
- **Checkout ↔ API contract fixed:** the checkout component used to POST
  `{ invite_id, tier, amountMinor }` while `/api/orders` expects
  `{ userId, inviteId, tier, amountMinor }`, so every UI order failed
  with 400. The component now takes a required `userId` prop (passed
  from `publish.tsx`, where the signed-in user is already known) and
  posts the exact field names the API expects.

### Create flow & validation (`/create`, `/publish`)

- New shared validation module `src/lib/draft-validation.ts`:
  `getDraftIssues(config)` returns named issues for: missing first name,
  missing partner name (couple mode), missing/unparseable event date,
  past event date, invalid WhatsApp number (when filled in), invalid
  Maps URL (when filled in). Also `mapsUrlWarning()` (valid URL that
  doesn't look like Google Maps → non-blocking warning),
  `isValidWhatsapp()` (10–15 digits, allows `+`, spaces, brackets,
  hyphens — the audit's `abc-not-a-phone` fails), `isValidUrl()`,
  `isGoogleMapsUrl()`, `parseEventDate()`.
- `/create`: the Publish button now runs `getDraftIssues` first. With
  issues present it stays on the page and shows a "Before you can
  publish:" list naming each missing/invalid item; the list refreshes
  live as fields are fixed. With zero issues it navigates to `/publish`
  as before.
- Editor (`invite-editor.tsx`): inline errors under the date field
  (invalid/past), the WhatsApp field (invalid number), and the Maps
  field (invalid URL error; non-Maps URL warning). Empty fields in a
  fresh draft are not nagged inline — the publish gate names them.
- `/publish`: re-validates on entry — if issues exist it lists them,
  disables the pay button, and does not render the checkout at all.
  The summary now includes a **"WhatsApp for replies"** row (audit
  Task 5 — it was previously invisible at final check).

### Invitation previews / countdown

- `src/lib/invitation.ts`: new `hasValidEventDate()`; `remainingTime()`
  now returns `[0, 0, 0, 0]` instead of NaN components when the date
  is empty/unparseable.
- `src/components/invitation.tsx`: the countdown block and the
  scratch-to-reveal block render only when the event date is valid.
  This component is shared by the editor live preview and the guest
  invitation page, so both are fixed. A literal `NaN` countdown can
  no longer appear.
- Post-verification cleanup: the story counters in
  `src/lib/invitation.ts` (`togetherDays`, `togetherElapsed`,
  `togetherDuration`) got the same NaN guard — they previously parsed
  `togetherSinceIso` unguarded, so a bad value could still print
  "NaN" in the "time together" counters. They now return zeroes for
  an unparseable date, covered by a new test in
  `src/test/invitation.test.ts`. The component needed no change.

### Other touched areas

- Homepage, Terms §3, Refund page, and the root meta description now
  render the price from `PUBLISH_PRICE_LABEL` instead of hard-coded
  strings (values unchanged: ₹599).
- `src/site.css`: two small additions — `.field-error` (inline field
  error, same red family as the existing `.form-error`) and
  `.publish-issues` (the issue list box). No design changes.
- New tests: `src/test/draft-validation.test.ts` (7 tests).

## File-by-file change table

| File | What changed | Why | Audit task |
|---|---|---|---|
| `src/config/site.ts` | NEW. `PUBLISH_PRICE_INR`, `PUBLISH_PRICE_PAISE`, `PUBLISH_PRICE_LABEL` | Single price source of truth | 3 |
| `src/routes/publish.tsx` | Price from config (tier branch removed); re-validates draft, blocks pay + hides checkout when issues exist; WhatsApp row added to summary; passes `userId` to checkout | ₹999 bug; publish gate; summary gap; contract fix | 3, 4, 5 |
| `src/components/youpi-checkout.tsx` | Amount + button label from config; required `userId` prop; POST body now `{ userId, inviteId, tier, amountMinor }` | Tier-priced charge; UI↔API field-name mismatch made every order 400 | 3 |
| `src/routes/api/orders.ts` | `amountMinor` must equal `PUBLISH_PRICE_PAISE` exactly (was: any value ₹100–₹10,000) | Server must not trust client-set price (security critical #1, partial) | 3 |
| `src/routes/create.tsx` | Publish button validates via `getDraftIssues`, shows issue list, navigates only when clean; button label from config | No validation existed | 4 |
| `src/components/editor/invite-editor.tsx` | Inline errors for date / WhatsApp / Maps fields; Maps non-Google warning | Clear inline feedback | 4 |
| `src/routes/index.tsx` | Pricing amount from `PUBLISH_PRICE_LABEL` | Single source | 3 |
| `src/routes/terms.tsx` | §3 price from `PUBLISH_PRICE_LABEL` | Single source | 3 |
| `src/routes/refund.tsx` | Charge amount from `PUBLISH_PRICE_LABEL` | Single source | 3 |
| `src/routes/__root.tsx` | Meta description built from `PUBLISH_PRICE_LABEL` | Single source | 3 |
| `src/lib/draft-validation.ts` | NEW. Draft validation + WhatsApp/URL/date helpers | Shared by editor, create, publish | 4, 5 |
| `src/lib/invitation.ts` | `hasValidEventDate()` added; `remainingTime()` NaN-guarded; story counters (`togetherDays`, `togetherElapsed`, `togetherDuration`) NaN-guarded the same way (post-verification cleanup) | Countdown rendered literal "NaN"; a bad `togetherSinceIso` could print "NaN" in the story counters | 4 |
| `src/components/invitation.tsx` | Countdown + scratch blocks render only with a valid date | NaN / scratch card for a non-existent date | 4 |
| `src/site.css` | `.field-error`, `.publish-issues` styles | Validation UI | 4 |
| `src/test/draft-validation.test.ts` | NEW. 7 tests incl. the audit's exact bad inputs | Regression coverage | 4 |
| `src/test/invitation.test.ts` | Extended with 1 test: story counters return zeroes, never NaN, for an unparseable `togetherSinceIso` (post-verification cleanup) | Regression coverage | 4 |
| `CHANGES-FOR-CLAUDE.md` | NEW. This document | Hand-back record | — |

**Change set: 17 files** — the 17 rows above, including this document.

Theme files (`src/themes/*.ts`): **not modified** — `tier` metadata
preserved exactly as delivered.

## Config / environment changes

- **No new environment variables.**
- New shared config file: `src/config/site.ts` (price constants only).
- **No Supabase changes** — no migrations added or edited.
- **No dependency changes** — `package.json` and `bun.lock` are
  unchanged. `package-lock.json` picked up a metadata-only diff
  (npm-install `libc` entries) while the working copy was installed;
  no dependency was added, removed, or re-versioned. It was **restored
  byte-identical to the owner's original after verification**, so it is
  NOT part of this change set.
- `.env` exists in the local working copy only. It must be excluded
  from any returned package; its values were never printed or recorded.

## Decisions on record

- Flat **₹599** for every design — owner-confirmed 2026-10-21, after
  being shown the royal/classic tier mechanism (see OWNER CONFIRMATION
  above). ₹999 was a tier-derived price, not the intended price.
- Price lives in `src/config/site.ts` only. Do not reintroduce price
  literals or tier-based pricing without an owner decision.
- The editor does not use react-hook-form/Zod (they exist elsewhere in
  the project), so validation was implemented as a small shared module
  matching the editor's controlled-state pattern instead.

## What was tested, and how

Baseline (before any change, in the working copy):

- `npm install --no-audit --no-fund` — success, 529 packages.
- `npx tsc --noEmit` — **RED before changes**: exactly one pre-existing
  error, `src/routes/publish.tsx(122,26) TS2322` (navigate target
  `"/order-success?order_id=success"` not assignable to the route
  type). Recorded, not fixed (out of scope).
- `npm run build` — **GREEN**.
- Baseline `npm test` was **not** run before changes. Stated honestly.

After changes:

- `npm test` — **PASS**: 3 test files, 21 tests (13 pre-existing
  invitation tests, 1 routing test, 7 new draft-validation/countdown
  tests — including the audit's exact inputs `abc-not-a-phone` and
  `not-a-valid-url`, and empty/invalid dates returning `[0,0,0,0]`).
- `npx tsc --noEmit` — exit 2 with **only the same pre-existing**
  publish.tsx navigate error (now at line 146 after added lines).
  No new TypeScript errors.
- `npm run build` — **GREEN** (exit 0), same as baseline.
- `npm run lint` — **RED**: 375 problems (364 errors, 11 warnings)
  across the whole repo, dominated by Prettier formatting. Verified
  against the pristine copy: the touched files (e.g.
  `src/routes/api/orders.ts`, `src/components/youpi-checkout.tsx`,
  `src/routes/terms.tsx`, `src/routes/refund.tsx`) already fail
  Prettier in their pristine state, so this is pre-existing formatting
  debt, not introduced by this round. No baseline full-lint run was
  done before changes, so the 375 figure cannot be split precisely.
  The three brand-new files were formatted with Prettier and are
  clean. A repo-wide `prettier --write` was deliberately NOT run — it
  would create a huge unrelated diff.
- Price acceptance grep (`999` / `99900` across `src`, `supabase`,
  public text): **no ₹999 / 99900 price references remain.** The only
  remaining `999` hits are `zIndex: 99999` in
  `src/components/dev/seal-position-editor.tsx` (a dev tool, not a
  price) and an explanatory comment in `src/config/site.ts`. ₹599
  strings remain in `src/i18n/translations.ts` as translated marketing
  copy (already ₹599 in every locale; left as copy, not code).

Post-verification cleanup (after independent sign-off, 2026-10-21):

- Story-counter NaN guards + 1 new test (see above), and
  `package-lock.json` restored byte-identical to the owner's original.
- Gates re-run after the cleanup, with the restored lockfile in place
  and no reinstall: `npm test` — **PASS, 22/22** (14 invitation incl.
  the new story-counter test, 1 routing, 7 draft-validation);
  `npm run build` — **GREEN** (exit 0).

NOT tested by this round (do not assume):

- No live payment was attempted; the YouPI scaffold is not proven live.
- No live Supabase publish, no browser click-through of the changed
  flow, no real photo/music upload, no post-payment flow, no mobile
  layout check.

## What was NOT done / open items

- **Pre-existing TypeScript error** in `publish.tsx` (navigate target
  type) — still present, unchanged, needs a proper fix with the
  router's typed navigation.
- **`/api/orders` still has no session authentication** — only the
  price-derivation half of security critical #1 was fixed. Auth is a
  separate owner-approved step.
- **Webhook fulfilment** uses the browser anon client and, per the
  security scan, a paid order may never be marked paid under the
  project's own RLS — not touched in this round.
- Full lint remains red (pre-existing Prettier debt, see above).
- All other audit tasks (the remaining items of the 29-task list) and
  the full 20-point security audit + scalability programme are parked
  per the owner's "priority ones first" decision.
- Whether Supabase migration 0001 has been run on the live project is
  still unknown (unchanged from before this round).

## Notes & warnings for Claude Code

- Read the OWNER CONFIRMATION section before touching pricing. If the
  owner ever asks for tiered pricing again, change `src/config/site.ts`
  only — the `tier` field is still present in every theme config.
- Do not run a repo-wide formatter as part of reviewing this change;
  the resulting diff would bury these edits.
- The working copy has no `.git` and no history was rewritten; review
  against your own committed backup with `git diff` as per the
  hand-back steps.

---

## Batch 2 — reconciliation (Task 0) — 2026-10-21

This section was added by the Batch 2 Task 0 implementer under the
owner-approved plan `mission/MASTER-PLAN-batch2.md` (§3 Task 0). It
documents changes that landed in the work copy BEFORE the plan existed
and were not recorded anywhere at the time. Earlier sections of this
file describe the priority round only; where they conflict with this
section about current state, this section is newer.

### What had landed undocumented (Batch 2 landings)

Three implementer agents were started on Batch 2 and stopped by the
owner minutes later in favour of plan-first. Two of them had already
written their changes (the payment-server agent wrote nothing —
`src/routes/api/webhooks/youpi.ts` and `src/lib/orders-api.ts` remain
byte-identical to the pristine original). The landed work:

- **Draft → invite bridge** (`src/lib/invites-api.ts`,
  `src/routes/publish.tsx`): new `buildInviteInsert` helper and
  `createInvite(userId, themeId, config?)` — the publish step now
  passes the full `draft.config` into the created invite instead of a
  blank config, so the couple's names/date/venue survive publishing.
  `publish.tsx` also navigates to order success with the REAL
  `order_id` returned by the orders API (the literal placeholder
  `?order_id=success` is gone — this also removed the pre-existing
  `publish.tsx` TS2322 type error noted in the priority-round section
  above; that error no longer exists).
- **Order-success honesty** (`src/routes/order-success.tsx`): rewritten
  around a pure `orderSuccessState()` — the page claims "published"
  only for a paid order AND a published invite, verifies via the
  browser client, and degrades to a neutral "We're confirming your
  payment" state on any lookup failure (fail-safe under SELECT-own
  RLS: it can under-claim, never over-claim).
- **Venue-link allowlist** (`src/lib/invitation.ts`,
  `src/components/invitation.tsx`, `src/lib/draft-validation.ts`):
  new `safeExternalUrl()` (http/https only, otherwise null) used at
  both venue render spots, and `getDraftIssues` now validates
  sub-event venue URLs with the same rule (security finding X-1).
  Accepted residual: scheme is checked, host is not.
- **Migration file** (`supabase/migrations/0003_invite_media_hardening.sql`):
  invite-media bucket → private, 10 MiB limit, image/audio MIME
  allowlist, read-all policy dropped. **Not applied to any database.**
  Its review is Batch 2 Task 2 (including a recommendation to remove
  the `orders_invite_idx` index — see the master plan).
- **Three new test files**: `src/test/invite-bridge.test.ts` (3 tests),
  `src/test/order-success-state.test.ts` (5 tests),
  `src/test/venue-url-safety.test.ts` (6 tests).

### Baseline BEFORE Task 0 (lead-verified 2026-10-21)

- `npx tsc --noEmit` — exactly 1 error:
  `src/test/venue-url-safety.test.ts(52,7)` TS2375 (test fixture).
- `npm test` — 36/36 passing, 6 files.
- `npm run build` — green.
- `npm run lint` — never run on this tree; no lint baseline existed.

### Task 0 fix (this task)

- `src/test/venue-url-safety.test.ts` fixture ONLY: the `withSubUrl`
  helper now omits `venueMapsUrl` entirely when the argument is
  undefined (previously it passed `venueMapsUrl` explicitly as
  `string | undefined`, which `exactOptionalPropertyTypes` rejects
  against `SubEvent.venueMapsUrl?: string`). No test case, assertion
  or meaning changed; no production code or types were touched.
- This documentation section. Nothing else.

### NEW baseline AFTER Task 0 (gates run 2026-10-21, this task)

Full outputs: `mission/evidence/task0-gates.log`.

- `npx tsc --noEmit` — **0 errors** (exit 0).
- `npm test` — **36/36 passing**, 6 files (invitation 14,
  draft-validation 7, venue-url-safety 6, order-success-state 5,
  invite-bridge 3, app-routing 1).
- `npm run build` — **green** (Nitro/Cloudflare output).
- `npm run lint` — **408 problems (396 errors, 12 warnings)**, 42 files
  with findings. Of these, **120 are in the 23 changed files** of the
  combined priority-round + Batch 2 inventory and **288 are in the
  untouched rest of the tree**. This is the established lint baseline:
  overwhelmingly pre-existing Prettier formatting debt. No lint
  findings were fixed in Task 0, and no task may be judged against a
  worse-than-408 total (per-file detail is in the evidence log).

### Still open after Task 0 (unchanged, per the master plan)

- Payment-server chain is UNTOUCHED and its defects are still present:
  webhook fulfilment (wrong client, no amount check, delivery recorded
  before fulfilment, signature logging, verbose 500s) = Task 3;
  `/api/orders` session authentication = Task 4; rate limiting =
  Task 5; fabricated story counters = Task 6; dependency audit =
  Task 7. Do not read this reconciliation as fixing any of them.
- Migration 0003 remains unapplied; applying it is owner-side only.

## Batch 2 — Task 1 review (independent reviewer, 2026-10-21)

Review of the landed frontend work (bridge, order-success, venue allowlist)
by a reviewer who did not write it. All three items: **SIGNED OFF**.

- **Bridge (invites-api.ts + publish.tsx):** call-site inventory complete —
  `publish.tsx:49` passes `user.id` (Supabase session user, via `useUser`)
  + `draft.themeId` + `draft.config`; `dashboard.tsx:46` passes
  `session.user.id` with no config, which is the deliberate
  create-blank-then-edit flow and is pinned by test. `buildInviteInsert`
  stores the draft config verbatim, derives the slug from the couple's
  names via `makeSlug`, and mirrors `event_date` from `event.startIso`
  only when a date exists. The insert's `user_id` comes from the
  signed-in session argument, never from the draft/config. One test gap
  found and closed by the reviewer: a named draft whose date is still
  empty must omit `event_date` entirely — added to
  `src/test/invite-bridge.test.ts` (now 4 tests).
- **Order-success (order-success.tsx):** `orderSuccessState()` claims
  "published" only for a paid order AND a published invite; missing,
  placeholder (`order_id=success`) or unfound orders are "unverified";
  failed lookups degrade to the neutral state, never to success. The 5
  tests pin the dangerous cases (unpaid order, paid-but-draft invite,
  bogus id, placeholder id).
- **Venue allowlist (invitation.ts + invitation.tsx + draft-validation.ts):**
  `safeExternalUrl()` (http/https only) guards both render spots — main
  venue falls back to the generated search link, sub-events fall back to
  plain text — and `getDraftIssues` validates sub-event URLs with the
  same rule as the main venue. Full href sweep of components/routes:
  the only other config-derived hrefs are scheme-fixed (`wa.me/` with a
  digits-only value, `tel:`, `mailto:`), which cannot change scheme or
  execute script; config-derived media `src` values are inert in modern
  browsers. No other unchecked config-derived URL reaches a guest page.
  The 6 venue-url-safety tests pin `javascript:` (incl. mixed case),
  `data:`, protocol-relative and valid http/https cases.
- **Gates after the test addition:** `npm test` 37/37 passing (6 files);
  `npx tsc --noEmit` 0 errors. Outputs saved to
  `mission/evidence/task1-gates.log` in the work folder's parent project.

## Batch 2 — Task 3 review: SIGNED OFF (2026-10-21, independent reviewer)

Webhook fulfilment repair + gateway verification reviewed against the
actual diff vs the pristine tree and re-gated by the reviewer
(`npm test` 72/72, 7 files; `npx tsc --noEmit` 0 errors).

- **orders-server.ts (new):** `getOrderById` / `markOrderPaid` /
  `markOrderFailed` run on `supabaseServer` (service-role), so
  fulfilment no longer depends on the browser client that RLS blocks
  from updating orders. `src/lib/orders-api.ts` is byte-identical to
  pristine (cmp-verified) — browser callers unaffected. The extracted
  `verifyWebhookSignature` is scheme-identical to the original
  ("sha256=" + HMAC-SHA256 over the raw body, length check,
  `timingSafeEqual`); header names and the 5-minute timestamp window
  in the handler are unchanged.
- **Handler flow (youpi.ts):** signature is verified before any state
  change; the order is loaded via the server client; for SUCCESS the
  gateway's own record (`GET /api/v1/payments/{id}`,
  `X-Merchant-Key`) is fetched BEFORE mark-paid/publish and must
  corroborate order id, status, amount and currency; a payload
  currency mismatch short-circuits before the lookup. The
  `webhook_deliveries` row is inserted ONLY after fulfilment succeeds
  in every branch — reject paths record nothing and return a generic
  400, transient verification failures a generic 500, so redelivery
  can retry (the old record-first ordering permanently bricked failed
  fulfilments). The `already_processed` pre-check is preserved. No log
  line contains signature material or payload dumps (the old
  `{ signature, expected }` log is gone); 500 bodies carry no error
  details (the old `details: String(error)` leak is gone).
- **Tests:** 35 new tests in `src/test/webhook-fulfilment.test.ts`
  assert the dangerous cases with concrete expectations — USD payload
  currency (even when the lookup passes), USD gateway currency,
  payload and gateway amount mismatch, lookup failure → fail-closed
  retry, already-paid replay with the gateway down, FAILED never
  un-paying a paid order, and the gateway-fetch contract (URL,
  merchant-key header, failure modes). The delivery-insert ordering
  itself is handler structure, verified by inspection; the test file
  states that boundary honestly.
- **.env.example:** diff vs pristine is exactly the added documented
  `YOUPI_API_BASE_URL` placeholder block; no placeholder values
  changed, no real secret present.
- **Judgement call (a) — `verificationLevel` check omitted: ACCEPTED.**
  The currency investigation specified it as optional. Its semantics
  are gateway-configuration-dependent and there is no live gateway to
  calibrate against; requiring `>= 1` on an uncalibrated assumption
  risks permanently rejecting legitimate payments. Status, amount,
  currency and order-id corroboration against the gateway's
  authenticated record is the substantive check; the level check can
  be tightened once a real gateway response has been observed.
- **Judgement call (b) — a `failed` order may be fulfilled by a later
  fully verified SUCCESS: ACCEPTED.** Failure marking is reachable
  from transient verification timeouts and UPI payments can settle
  late; the later SUCCESS must still pass signature verification,
  payload amount/currency checks and full gateway corroboration, and
  there is no reconciliation job to recover a stranded paid order
  otherwise. The dangerous reverse (FAILED un-paying a paid order) is
  prevented and pinned by a test. Also accepted: the new shape-guard
  400 on a missing/empty `orderId` (runs after signature verification,
  generic body, no state change — replaces the old record-then-404
  path that fed the retry trap).
- **Live behaviour remains NOT TESTED:** no live YouPI gateway exists
  in this environment, so real payload shape, redelivery policy and
  the lookup response are unverified until the owner's first live
  test. The pure decision seam localises that risk.

## Batch 2 — Task 4 review: SIGNED OFF (2026-10-21, independent reviewer)

Independent review of the /api/orders session-authentication change
(`src/routes/api/orders.ts`, `src/components/youpi-checkout.tsx`, new
`src/lib/orders-auth.ts` + `src/test/orders-auth.test.ts`). The
reviewer did not write this code; the diff was verified against
pristine and against this batch's priority-round ZIP, and the gates
were re-run independently: **tests 84/84 (8 files), `npx tsc
--noEmit` 0 errors** — matching the implementer's claims (lint 406 vs
the 408 baseline, net −2, was accepted from the implementer's
evidence log).

- **Handler:** authentication runs before the body is even parsed —
  the `Authorization: Bearer` token is verified via
  `supabaseServer.auth.getUser()` and a missing/invalid token returns
  a generic 401. The body's `userId` reaches exactly one place,
  `decideOrderUser` as a claim to be checked; the invite-ownership
  check and the order insert use only the verified session id
  (`ownerId`). Exact-amount enforcement is unchanged
  (`amountMinor !== PUBLISH_PRICE_PAISE` → 400, price from
  `src/config/site.ts` only), so no path accepts a client-chosen
  amount; tier validation, error shapes and the 201 response are
  otherwise as before.
- **Helper + tests:** `decideOrderUser` implements the contract —
  no session → 401; body id absent/empty → session id; equal →
  session id; different → 403. The 6 handler tests drive the real
  `POST` handler with only `@/lib/supabase-server` mocked: no header
  → 401, bad token → 401, mismatched body id → 403 (no insert in any
  rejection), body omits `userId` → 201 with the inserted row's
  `user_id` equal to the session id, wrong amount → 400, another
  user's invite → 404.
- **Checkout:** the diff vs the priority-round copy is only the
  session-token change — `supabase.auth.getSession()` at click time,
  the `Authorization` header, and the no-session guard, which shows
  "Your session has expired — please sign in again." and does not
  POST. Amount and the YouPI gateway flow are untouched.
  `youpi-checkout.tsx` is the only caller of `POST /api/orders`.
- **Deviation — mismatch returns 403, not the plan text's 400:
  ACCEPTED.** The request is authenticated; the failure is that the
  authenticated caller names a different owner — the textbook 403
  case, and it leaks nothing (the caller already knows their own
  session id; the separate existence-hiding concern is why invite
  ownership still returns 404). The security property is identical
  either way — rejection before any state change, the body id never
  used — and the checkout treats every non-OK response uniformly, so
  the code is not client-visible. 400 in the plan was a design-phase
  choice; the implementation brief's 401/403 contract is the better
  semantics and stands.
- **Rollback (verified, with the implementer's addition):** restore
  `src/routes/api/orders.ts` and `src/components/youpi-checkout.tsx`
  from the priority-round ZIP
  (`~/workspace/your_files/easyinvitemaker-priority-fixes/easyinvitemaker-priority-fixes.zip`)
  and redeploy, AND delete the two files this task added —
  `src/lib/orders-auth.ts` and `src/test/orders-auth.test.ts` — for
  an exact tree (nothing else imports the helper). Spot-check: the
  ZIP copies differ from pristine only by the priority-round changes
  and from the current files only by Task 4, and they carry the exact
  pre-Task-4 lint fingerprints recorded in the baseline (one-line 404
  return, missing final newline in orders.ts), corroborating that
  they are byte-identical to the pre-Task-4 work files. No
  data/schema involvement.
- **Not verified (unchanged honesty boundary):** no live Supabase or
  browser run — real Auth-server token verification and the
  signed-in/signed-out click flows rest on the mocked handler tests,
  typecheck, build and inspection. Live payment remains NOT TESTED.

## Batch 2 — Tasks 5+6 review: SIGNED OFF (2026-10-21, independent reviewer)

Reviewed by an agent that wrote neither task; verdicts rest on the
actual diffs vs pristine, the implementer evidence logs
(`mission/evidence/task5-gates.log`, `task6-gates.log` incl. the
red-run files), and the reviewer's own gate re-runs.

- **Task 5 — rate limiting (SIGNED OFF).** `src/lib/rate-limit.ts` is
  a dependency-free fixed-window limiter with an injectable clock.
  Verified by reading: exactly `limit` requests pass per window;
  blocked requests neither consume quota nor move the window (fixed
  window, pinned by test); `Retry-After` is the true remaining window
  time (ceil, 1 s floor); the bucket map is swept of expired entries
  whenever a fresh window starts, so it cannot grow without bound.
  Wiring: `/api/orders` — 10/min keyed on `IP:sessionUserId`, checked
  AFTER authentication (unauthenticated requests never consume quota);
  `/api/webhooks/youpi` — 120/min per IP, checked as the first
  statement before the body is read. Both return 429 + `Retry-After`
  with the generic body `{ error: "Too many requests" }`. The webhook
  429 path changes NO state and records NO delivery, so the gateway's
  ordinary retry-on-non-2xx redelivers later — a genuine payment
  notification is deferred, never lost. Task 3's webhook flow
  (timestamp window → signature → already-processed pre-check → plan →
  delivery recorded only after fulfilment) and Task 4's orders flow
  (auth before any body trust, session-only identity, exact ₹59900)
  are undisturbed in both files. Honesty: the header of
  `rate-limit.ts` and both wiring-site comments state plainly that
  this is a per-isolate BACKSTOP, not a complete production control —
  Workers isolates share no memory — and that the real control is the
  owner-configured Cloudflare WAF rate-limiting rule (plan-3 §4.3).
  No comment or doc oversells it (reviewer grepped every rate-limit
  mention in `src/`). The 11 tests assert real behaviour with exact
  expected values (57 s remaining at 3 s into a 60 s window, map size
  50 → 1 after sweep, header precedence) against the real
  implementation — no self-mocks.
- **Task 6 — fabricated story counters (SIGNED OFF).** New
  `hasValidTogetherDate()` in `src/lib/invitation.ts` sits beside
  `hasValidEventDate` and reuses the module's `Date.parse` approach.
  Both gates verified in `src/components/invitation.tsx`: the counter
  effect (:202) and the `together-milestone` render block (:607) now
  require a parseable date. Missing/empty/garbage/`2024-13-40` ⇒ the
  counters block is not rendered at all — no zeros, no fallback date,
  no placeholder text — and `duration`/`elapsed` state is only ever
  set inside the gated effect and rendered only inside the gated
  block (no second display path). For any valid date the gate passes
  exactly where the old truthiness check did, so valid-config
  rendering is unchanged. The lib's `together*` zero-guards are
  untouched by this task (their "zero, never NaN" contract stands for
  other callers). The new test pins garbage/""/undefined/null/
  `2024-13-40` → false and date-only + offset forms → true.
- **Reviewer gates:** `npm test` 96/96 (9 files) on each of THREE
  consecutive full runs; `npx tsc --noEmit` exit 0 (0 errors). Build
  and lint accepted from the evidence logs (build green; lint 406,
  zero new findings — the one youpi.ts finding is the pre-existing
  stale-timestamp prettier line documented since Task 3).
- **Flake observation status (for the Final review):** Task 5's
  implementer recorded ONE intermittent failure in a pre-change run
  (84/85, failing test's name cut off in the captured output), with
  three subsequent pre-change runs green. The reviewer did NOT
  reproduce it: 96/96 on all three runs above. The flaky test remains
  UNIDENTIFIED; it predates Tasks 5–6 and is not attributable to
  either. The Final review should keep watching for it.

---

## Batch 2 — COMPLETE (2026-10-21)

Batch 2 (Tasks 0–7 + Final whole-batch review) is finished. This
section is the batch record: the open item that outranks everything
else in it, per-task results, final gates, the exact file inventory,
migration 0003's final state, the owner-side checklists, dependency
residuals, rollback instructions, and the honest NOT TESTED list.
Earlier sections (priority round, Task 0 reconciliation, per-task
review notes) are unchanged and remain the detailed evidence for the
summaries below.

### ⚠️ OPEN ITEM #1 — R-1: API ROUTES NOT MOUNTED (read first)

**Finding.** `src/routes/api/orders.ts` and
`src/routes/api/webhooks/youpi.ts` export only a bare `POST`
function. They do not export a TanStack `Route` (`createFileRoute`),
so TanStack's route generation excludes both files from the served
application. Against the **production build**:

- `POST /api/orders` returns the app's HTML **404** (not the
  handler's 401);
- `POST /api/webhooks/youpi` returns the app's HTML **404** (not the
  handler's 401);
- `GET /` and `GET /templates` return 200 and `GET /nonexistent`
  returns the same HTML 404, so the app itself serves fine — only
  the two API handlers are missing from it.

**Evidence** (Final review, `mission/FINAL-REVIEW-batch2.md` §4):
the build prints, verbatim, for both files: `Warning: Route file
"…/src/routes/api/orders.ts" does not export a Route. This file
will not be included in the route tree.`; `src/routeTree.gen.ts`
contains no api entries; the build's TanStack start manifest
contains no api routes; nothing in `src/` imports either handler
except the Task 4 test file. The probes were run with curl against
the built Worker's fetch handler (the agent browser cannot open
localhost).

**This is PRE-EXISTING, not a Batch 2 regression.** Pristine's two
files have the identical unmounted shape, and the route tree is
byte-identical to the delivered original — the handlers were never
mounted in any state of this project that this workspace has seen.
The batch's own documents disclosed the boundary in advance (route
mounting was an explicitly unverified assumption until the Final
review's probes); the Final review closed that item **negatively**.

**What it blocks.** Checkout's `fetch("/api/orders")` and YouPI's
webhook deliveries both 404 against this build, so **no live payment
can run end-to-end until this is fixed**, regardless of how correct
the handler code is.

**The fix is a separate, owner-approved task — it is NOT part of
this batch and was NOT done here.** Shape of the fix: register both
handlers as TanStack server routes (`createFileRoute("/api/orders")`
/ `createFileRoute("/api/webhooks/youpi")` with server handlers
wrapping the existing `POST` logic) or mount them as Nitro server
handlers, then re-run the Final review's probe set and confirm the
expected live responses (401 without a token / with a bogus
signature, instead of 404).

**Until that fix lands: Tasks 3–5 code is correct-but-unreachable.**
The webhook fulfilment rework, the orders session auth and the rate
limiter are implemented, unit/handler-tested by direct import, and
independently reviewed — but no live request can reach them. **Do
not test live payments before the wiring fix.**

### Per-task results (Tasks 0–7 + Final)

| Task | Result | Verdict |
|---|---|---|
| 0 — Reconcile baseline | Undocumented landings documented (see the Task 0 section above); test-fixture TS2375 fixed (test file only); true baselines established: tsc 1 → **0 errors**, tests 36/36, build green, lint **408** recorded as the batch baseline | SIGNED OFF |
| 1 — Review-and-accept landed work | Draft→invite bridge, order-success honesty, venue-URL allowlist reviewed against the actual code by an independent reviewer; one missing regression test added by the reviewer (`invite-bridge.test.ts` now 4 tests). Detail in the Task 1 review section above | SIGNED OFF (all three items) |
| 2 — Migration 0003 review | Line-by-line review; `orders_invite_idx` removed (rationale below); rollback block added; file finalised. **Migration NOT applied** — owner-side only | Reviewed — NOT APPLIED |
| 3 — Webhook fulfilment | New `src/lib/orders-server.ts` (service-role client) + handler rework: signature → server-side order load → gateway lookup corroboration (order id, status, amount, **currency**) before fulfilment; delivery row recorded only after fulfilment succeeds; signature material out of logs; generic error bodies; 35 tests. Detail in the Task 3 review section above | SIGNED OFF |
| 4 — Orders session auth | `/api/orders` verifies the caller's Supabase session token before trusting anything; body `userId` is only a checked claim via `decideOrderUser` (`src/lib/orders-auth.ts`); checkout sends the session Bearer token; 12 tests. Detail in the Task 4 review section above | SIGNED OFF |
| 5 — Rate limiting | Dependency-free fixed-window limiter (`src/lib/rate-limit.ts`): `/api/orders` 10/min per IP+user after auth; webhook 120/min per IP before body read, state-free 429 so gateway redelivery still works; 11 tests. **It is a per-isolate backstop only** — the real control is the owner-configured Cloudflare WAF rule (checklist (b) below) | SIGNED OFF |
| 6 — Story counters | `hasValidTogetherDate()` gates the counter effect and the render block: missing/empty/garbage date ⇒ the counters block is not rendered at all (no fabricated numbers, no zeros, no fallback date); valid-date rendering unchanged | SIGNED OFF |
| 7 — Dependency audit | Report only (`mission/plan-3/dependency-audit-results.md`). **No fix was eligible** under the four-clause rule, so no dependency changed — `package.json` / `package-lock.json` / `bun.lock` are byte-identical to pristine. Residuals in the dependency section below | Report delivered; 0 fixes applied |
| Final — Whole-batch review | Full combined diff read (every file), gates re-run, 5-run flake hunt, local-server HTTP probes. Everything signed off **except R-1 above, which was RETURNED** as a pre-existing defect needing its own approved task | RETURNED on R-1 only |

Two review judgements are on record and were **accepted** by the
independent reviewers (full reasoning in the per-task sections):

- **403 vs 400 (Task 4).** The plan text said a session/body
  `userId` mismatch should return 400; the implementation returns
  **403**. Accepted: the caller is authenticated and names a
  different owner — the textbook 403 case; it leaks nothing, the
  security property (rejection before any state change, body id
  never used) is identical, and the checkout treats all non-OK
  responses uniformly, so it is not client-visible.
- **`verificationLevel` omission (Task 3).** The gateway lookup
  corroborates order id, status, amount and currency, but does
  **not** additionally require YouPI's `verificationLevel >= 1` —
  the currency investigation specified that check as optional. Its
  semantics are gateway-configuration-dependent and there is no live
  gateway to calibrate against; requiring it on an uncalibrated
  assumption risks permanently rejecting legitimate payments. It can
  be tightened once a real gateway response has been observed.
  Also accepted in Task 3: a `failed` order may still be fulfilled
  by a later fully verified SUCCESS (failure marking is reachable
  from transient timeouts and UPI settles late; the dangerous
  reverse — FAILED un-paying a paid order — is prevented and
  test-pinned), and the shape-guard generic 400 on a missing/empty
  `orderId` (after signature verification, no state change).

### Final gate results (whole-batch review, re-run on the final tree)

- `npx tsc --noEmit` — **0 errors**.
- `npm test` — **96/96 passing** (9 test files).
- `npm run build` — **green** (exit 0).
- `npm run lint` — **406 problems (394 errors, 12 warnings)**.
  Trajectory: **408** (Task 0 baseline) → **406**; the reduction came
  from files Batch 2 rewrote, and the Final review confirms **zero
  new findings attributable to Batch 2 code**. The remaining 406 are
  the pre-existing Prettier/formatting debt recorded at baseline —
  no repo-wide formatter was run, deliberately.
- **Flake note.** One intermittent test failure was observed **once**
  historically (Task 5 implementer, pre-change run at the 85-test
  tree: 84/85, the failing test's name was cut off in the captured
  output). It was **not reproduced in 8 consecutive full runs since**
  (3 by the Tasks 5+6 reviewer + 5 by the Final reviewer, all
  96/96). The flaky test remains **unidentified**; its existence is
  not denied. If it recurs, capture the failing test's name from the
  vitest output before anything else.

### Changed-file inventory — Batch 2 delivery (31 files)

Cumulative vs the original project as delivered: **17 modified +
14 added, zero deleted.** This is exactly the contents of
`easyinvitemaker-batch2-fixes.zip` (this document sits at the zip
root; every other file at its project-relative path). Each file maps
to the priority round or a Task 0–7 row — no file outside that
scope changed. `src/lib/orders-api.ts`, `dashboard.tsx` and all
other project files are byte-identical to the original;
`package.json`, `package-lock.json` and `bun.lock` are
byte-identical to the original; `.env` is byte-identical and is
**not** in the zip.

**Modified (17)**

| File | Purpose (one line) |
|---|---|
| `.env.example` | Documents the new server-only `YOUPI_API_BASE_URL` placeholder (Task 3); no values changed |
| `src/components/editor/invite-editor.tsx` | Inline draft-validation errors (date / WhatsApp / Maps) in the editor (priority round) |
| `src/components/invitation.tsx` | NaN render gates; venue links via the allowlist; story counters gated on a valid together-date (Tasks 1, 6) |
| `src/components/youpi-checkout.tsx` | Price/field contract fixed; sends the session Bearer token to `/api/orders` and refuses to POST without a session (Task 4) |
| `src/lib/invitation.ts` | NaN guards; `hasValidEventDate`, `safeExternalUrl` (Task 1), `hasValidTogetherDate` (Task 6) |
| `src/lib/invites-api.ts` | `buildInviteInsert` + `createInvite(userId, themeId, config?)` — the draft→invite bridge (Task 1) |
| `src/routes/__root.tsx` | Price label rendered from the single config source |
| `src/routes/api/orders.ts` | Exact ₹599 enforcement; session authentication (Task 4); rate limiter (Task 5) |
| `src/routes/api/webhooks/youpi.ts` | Fulfilment rework with gateway corroboration, retry-safe delivery recording (Task 3); rate limiter (Task 5) |
| `src/routes/create.tsx` | Publish button validates the draft and names every issue before navigating |
| `src/routes/index.tsx` | Price label rendered from the single config source |
| `src/routes/order-success.tsx` | Honest success state — claims "published" only for a paid order AND a published invite (Task 1) |
| `src/routes/publish.tsx` | Price + re-validation; passes `draft.config` into the created invite; navigates with the real `order_id` (Task 1) |
| `src/routes/refund.tsx` | Price label rendered from the single config source |
| `src/routes/terms.tsx` | Price label rendered from the single config source |
| `src/site.css` | `.field-error` and `.publish-issues` styles for the validation UI |
| `src/test/invitation.test.ts` | NaN-guard and together-date regression tests |

**Added (14)**

| File | Purpose (one line) |
|---|---|
| `CHANGES-FOR-CLAUDE.md` | This document (priority round + Batch 2 record) |
| `src/config/site.ts` | Single flat-₹599 price source (`PUBLISH_PRICE_PAISE = 59900`) |
| `src/lib/draft-validation.ts` | Shared draft validation (names, date, WhatsApp, Maps URL, sub-event URLs) |
| `src/lib/orders-auth.ts` | `decideOrderUser` — session-vs-body identity decision for `/api/orders` (Task 4) |
| `src/lib/orders-server.ts` | Server-client order helpers, gateway payment lookup, `fulfilmentPlan` decision seam (Task 3) |
| `src/lib/rate-limit.ts` | Dependency-free fixed-window in-isolate limiter — a backstop, honestly labelled (Task 5) |
| `src/test/draft-validation.test.ts` | 7 tests (priority round) |
| `src/test/invite-bridge.test.ts` | 4 tests — the bridge stores the draft, incl. omitting `event_date` when dateless (Task 1) |
| `src/test/order-success-state.test.ts` | 5 tests — success claimed only for paid + published (Task 1) |
| `src/test/venue-url-safety.test.ts` | 6 tests — `javascript:`/`data:`/protocol-relative rejected, http/https pass (Tasks 0, 1) |
| `src/test/webhook-fulfilment.test.ts` | 35 tests — signature, amount/currency corroboration, fail-closed and retry behaviour (Task 3) |
| `src/test/orders-auth.test.ts` | 12 tests — real `POST` handler: 401 / 403 / 201-with-session-id / 400 / 404 matrix (Task 4) |
| `src/test/rate-limit.test.ts` | 11 tests — window, quota, eviction and IP-precedence behaviour (Task 5) |
| `supabase/migrations/0003_invite_media_hardening.sql` | Invite-media bucket hardening — file only, **NOT APPLIED** (Task 2) |

### Migration 0003 — final reviewed state

File: `supabase/migrations/0003_invite_media_hardening.sql`
(included in the zip). Reviewed line-by-line against 0001 in Task 2.
Final content, in full:

- **Bucket:** `invite-media` set `public = false`,
  `file_size_limit = 10485760` (10 MiB — matches the app's
  client-side limits: photos ≤ 8 MB, music ≤ 10 MB), and
  `allowed_mime_types` restricted to five image types
  (`image/jpeg`, `image/png`, `image/webp`, `image/gif`,
  `image/avif`) and five audio types (`audio/mpeg`, `audio/mp4`,
  `audio/wav`, `audio/x-wav`, `audio/ogg`).
- **Read policies:** the 0001 read-all policy `"invite media is
  readable"` is dropped and replaced by two policies —
  `"owners read their media"` (authenticated; first path segment =
  the caller's uid) and `"media of published invites is readable"`
  (the invite named by the second path segment has
  `status = 'published'`). The 0001 write policy
  (`"owners write their media"`) is untouched. Private is safe
  today because no application code references public bucket URLs
  or Storage at all (uploads are still browser-only object URLs);
  drafts become private, published invites' media stays readable
  for guest pages once uploads are wired.
- **Index removal:** the draft's `orders_invite_idx` was **removed**
  in review. Rationale: no live query filters `orders` by
  `invite_id` — its only justifying function,
  `hasInvitePaidOrder`, has zero callers in `src/` — so the index
  would be write overhead guarding a query that does not exist. If
  that query pattern is ever wired in, a composite
  `(invite_id, status)` index is the right shape, added by that
  task. The migration's closing comment records the lookup facts
  (invites by PK/slug/preview_token, orders by PK/`user_id`,
  webhook_deliveries by `delivery_id`, invite_assets by
  `invite_id`) so the decision is auditable.
- **Rollback block present:** the end of the file carries the full
  rollback as commented SQL — drop the two new read policies,
  recreate `"invite media is readable"` under its exact 0001 name,
  and return the bucket to `public = true` with null size limit and
  null MIME allowlist (the exact 0001 state), plus a guarded
  `drop index if exists orders_invite_idx` for the case where the
  pre-review draft was ever applied.
- **Status: NOT APPLIED** — not by this batch, not anywhere in this
  workspace. The file's header banner says so. The owner applies it
  manually in the Supabase SQL Editor, after 0001/0002 — see
  checklist (a).

### Owner-side checklists (only the owner can do these)

Nothing below can be done from this workspace — no live Supabase
session, Cloudflare login or YouPI portal access exists here.
**Never send secret values back** — names and yes/no only.

**(a) Supabase — backup, migration 0003, live RLS**

1. **Backup commit before unzipping Batch 2.** In Claude Code on
   the Mac: commit everything as-is ("Backup: state before Muse's
   Batch 2 changes") and keep the returned hash; `git status`
   should be clean.
2. **Before applying 0003, record the current bucket state** for
   comparison: Dashboard → **Storage → invite-media** — note
   public/private, file size limit, allowed MIME types (expected
   pre-0003 state per 0001: public, no size limit, no MIME
   allowlist).
3. **Apply migration 0003** (only after the backup commit):
   Dashboard → **SQL Editor** → New query → paste the full contents
   of the delivered `supabase/migrations/0003_invite_media_hardening.sql`
   → **Run**. The run should report success.
4. **Verify storage after applying:** Dashboard → **Storage →
   invite-media → Policies** — the policy names must match, name
   for name, what the migration creates/drops: `"owners read their
   media"` and `"media of published invites is readable"` present;
   the read-all `"invite media is readable"` gone; the bucket now
   **private** with the 10 MiB limit and the image/audio MIME
   allowlist from step 2's comparison. If any name differs, stop
   and report the exact list — do not improvise a fix in the
   dashboard.
5. **Verify live RLS matches the migrations.** SQL Editor → run:

   `select tablename, rowsecurity from pg_tables where schemaname = 'public' order by tablename;`

   *Expected:* six rows — `invite_assets`, `invite_views`,
   `invites`, `orders`, `profiles`, `webhook_deliveries` — **every
   one `rowsecurity = true`**. Any missing table or `false` means
   the live database is not in the state the code assumes; report
   the exact output before anything else goes live. Follow-up:
   `select tablename, policyname from pg_policies where schemaname = 'public' order by 1, 2;`
   — the names should correspond to those defined in
   `0001_init.sql` / `0002_webhook_deliveries.sql` (plus 0003's
   storage policies, visible under Storage). While there:
   **Authentication → Rate Limits** — confirm Supabase Auth's
   built-in limits are at their defaults or saner (they protect the
   login surface only; they do not cover this app's custom API
   routes).

**(b) Cloudflare — WAF rate-limiting rule (the real control) + env**

The in-code limiter from Task 5 is a **backstop only**: Workers
isolates are ephemeral and numerous with no shared memory, so its
counts reset and multiply unpredictably. The primary control is
the edge rule below — configure it in the dashboard:

1. Cloudflare Dashboard → select the site's domain (zone) →
   **Security → WAF → Rate limiting rules → Create rule**.
2. **Rule 1 — orders:** *When incoming requests match:*
   `http.request.uri.path eq "/api/orders"` (add
   `and http.request.method eq "POST"` if the form offers it).
   *Characteristics:* IP. *Rate:* **20 requests per 10 seconds per
   IP** (a human creates a handful of orders; the in-code 10/min is
   the tighter backstop behind it) — if the tier only offers a
   1-minute period, use **100 requests per 1 minute per IP**.
   *Action:* **Block** (or Managed Challenge, if offered and
   preferred). *Duration/mitigation timeout:* the shortest the
   tier offers (10 seconds–1 minute).
3. **Rule 2 — webhook:** same shape for
   `http.request.uri.path starts_with "/api/webhooks/"`, set
   **generously — ~300 per 1 minute per IP**: the goal is only to
   cut off floods, never to interfere with YouPI's legitimate
   retries. If the tier allows only one free rule, create Rule 1
   and let the webhook rely on its signature verification + the
   in-code backstop.
4. **Check your plan tier while you are there.** Rule counts,
   counting periods (10-second windows are not on every tier) and
   available actions differ between Free and paid plans; this
   batch does not know your tier. Configure the closest available
   equivalent to the shapes above and note what was actually set.
   If the tier permits **no** rate-limiting rules, report that —
   it is a finding, not a blocker; the in-code backstop ships
   regardless, labelled as such.
5. **Environment variables (names only):** Dashboard → **Workers &
   Pages** → the project → **Settings → Environment Variables** —
   confirm present, by name, the variables in checklist (d).
   `VITE_*` values are baked in at build time: after setting or
   changing one, **redeploy** before expecting it to take effect.

**(c) YouPI — portal / instance settings**

1. **Portal webhook settings:** the webhook URL is
   `https://<the site's domain>/api/webhooks/youpi`; the portal's
   webhook secret is the **same value** as the `YOUPI_WEBHOOK_SECRET`
   deployment env var (compare in place — copy neither value
   anywhere); the merchant/checkout key matches
   `VITE_YOUPI_MERCHANT_PUBLIC_KEY`. The same webhook secret doubles
   as the `X-Merchant-Key` credential for the Task 3 lookup — if it
   is ever rotated, both sides change together.
2. **Set `YOUPI_API_BASE_URL`** in the deployment environment to
   the base URL of your own YouPI instance's Payment API (the
   `:6100` core service, or the `pay.*` production domain serving
   the same API). Task 3's currency/amount corroboration fails
   closed without it: an unset base URL means no fulfilment.
3. **Currency / instance settings** (from the currency
   investigation, §5 — verify by hand in the Merchant Admin Panel
   and gateway host config regardless of the code checks):
   - The receiving bank account / UPI VPA bound to the merchant is
     the intended **INR** account, and it is the only receiving
     account for this merchant.
   - The merchant record's webhook URL points at this app's
     `/api/webhooks/youpi`, and the merchant webhook secret in
     YouPI equals `YOUPI_WEBHOOK_SECRET` in the app's deployment
     env.
   - The merchant's default currency in the admin/branding
     configuration is **INR**, and no second storefront/merchant on
     the same instance shares this merchant record.
   - **`ADMIN_API_TOKEN` on the gateway host is set to a recorded,
     non-default value** — it grants full access to *every*
     merchant's payment data on the instance.
   - `CHECKOUT_FRAME_ANCESTORS` is set to this app's real
     origin(s) if the checkout modal is embedded cross-origin, so
     the portal isn't frameable by arbitrary sites.
   - At the first live test: capture one real webhook payload and
     confirm whether `currency` is actually present in deliveries
     from this instance, and one real
     `GET /api/v1/payments/{paymentId}` response with
     `X-Merchant-Key` — file both as fixtures for the Task 3 tests.
4. If the portal offers a test/sandbox mode, note it: one
   test-mode ₹599 payment, owner-triggered, is the only way the
   fulfilment chain ever gets a live end-to-end verdict — and only
   **after** the R-1 wiring fix above.

**(d) Deployment environment variables — checklist (names only)**

Confirm each of these is present in the deployment environment.
**Names only — no value is recorded here or should be sent
anywhere.**

- `SUPABASE_SERVICE_ROLE_KEY` (server-only)
- `YOUPI_WEBHOOK_SECRET` (server-only)
- `YOUPI_API_BASE_URL` (server-only; new with Task 3 — see (c)2)
- `VITE_YOUPI_CHECKOUT_URL` (public, build-time)
- `VITE_YOUPI_MERCHANT_PUBLIC_KEY` (public, build-time)
- …plus the two public Supabase variables the site already uses
  (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`).

### Dependency residuals — owner decisions (Task 7)

Full report: `mission/plan-3/dependency-audit-results.md`. The
audit's totals, from a GitHub Advisory Database (GHSA) scan of all
589 unique packages in the lockfile with every match re-verified
locally against the installed versions: **0 Critical, 1 High,
2 Medium, 0 Low** — all three advisories are one root cause
(**launch-editor**, via `vite@8.1.5`). The actually-vulnerable
component is **not** present at a vulnerable version: the installed
`launch-editor` is **2.14.2, the first patched version**; the path
is dev-server-only, two of the three issues are Windows-specific,
and none of it is reachable from production code paths. An
authoritative `npm audit` could not be run in this workspace — the
environment's registry proxy rejects the npm security endpoints
(403 `policy_denied`) for npm and bun alike, and OSV was
unreachable — so "dependencies are clean" is **not** claimed; the
GHSA-equivalent result above is what the evidence supports.
**Zero fixes were applied**: the one candidate failed the fix rule
(see #1), and lockfiles ship byte-identical to the original.

| # | Item | Decision needed |
|---|---|---|
| 1 | `vite@8.1.5` — nominal High (launch-editor root cause; component already patched, dev-only path, low practical risk). The fix (vite ≥ 8.1.6) requires editing the exact pin `"vite": "8.1.5"` in `package.json`, which the batch's fix rule forbids without owner approval | **Owner:** approve a one-line manifest change `"vite": "8.1.5"` → `"^8.1.6"` (or newer 8.x) + lockfile refresh, then re-run gates. Low urgency; do it before the next production deploy |
| 2 | No authoritative `npm audit` report exists for this tree (endpoints blocked in this workspace) | **Owner:** run `npm audit` once on your own machine or in CI, file the output, and if it flags anything, `npm audit fix` there — **never `--force`** — with `npm test`, `npm run build` and `npx tsc --noEmit` re-run before shipping |
| 3 | Four in-range patch updates available, no advisories against any of them: `@hookform/resolvers` 5.9.2, `@tanstack/react-query` 5.104.5, `react-resizable-panels` 4.14.8, `typescript-eslint` 8.72.0 | **Owner (optional):** routine `npm update` for these four with gates re-run. Hygiene only — not a security action |

### Rollback instructions

Three independent layers exist; use the narrowest one that fits.

1. **Owner's backup commit (primary).** Before unzipping this
   batch, commit the project's current state as-is in Claude Code
   (checklist (a)1). Restoring any file — or abandoning the whole
   batch — is a checkout away.
2. **Pristine tree (this workspace).**
   `~/workspace/invitation-saas-work/pristine/` is byte-for-byte the
   project as originally delivered and was never edited by any
   task. Any single file can be restored from it.
3. **Per-batch changes-only zips.** The priority-round zip is
   retained alongside this batch's zip; each contains only its own
   batch's files, so reverting one batch restores exactly those
   files without touching the other batch's work.

**Per-task rollbacks (for surgical reverts):**

- **Task 4 (orders session auth):** restore
  `src/routes/api/orders.ts` and `src/components/youpi-checkout.tsx`
  from the priority-round zip
  (`~/workspace/your_files/easyinvitemaker-priority-fixes/easyinvitemaker-priority-fixes.zip`),
  **delete** the two files Task 4 added — `src/lib/orders-auth.ts`
  and `src/test/orders-auth.test.ts` — and redeploy. (Verified in
  review: the zip copies are byte-identical to the pre-Task-4 work
  files; nothing else imports the helper. No data/schema
  involvement.) Note Task 5's limiter also lives in `orders.ts` —
  restoring from the priority zip removes both tasks' changes to
  that file.
- **Task 3 (webhook fulfilment):** restore
  `src/routes/api/webhooks/youpi.ts` from the pristine tree and
  **delete** `src/lib/orders-server.ts` and
  `src/test/webhook-fulfilment.test.ts`. (This also removes Task
  5's limiter wiring in that file.) The `.env.example`
  `YOUPI_API_BASE_URL` block is documentation-only and may stay.
- **Task 5 (rate limiting):** remove the limiter check hunks from
  `src/routes/api/orders.ts` (the check after authentication) and
  `src/routes/api/webhooks/youpi.ts` (the check at the top of the
  handler), and **delete** `src/lib/rate-limit.ts` and
  `src/test/rate-limit.test.ts`. The handlers then behave exactly
  as their post-Task-3/4 states.
- **Task 6 (story counters):** revert the two gate hunks in
  `src/components/invitation.tsx` and the `hasValidTogetherDate`
  helper in `src/lib/invitation.ts` from the pristine tree (both
  files also carry earlier-batch changes — restore by hunk, not by
  whole file, unless reverting those too).

**Simplest global rollback:** re-extract the **original project
zip** you uploaded (the untouched delivered state), then re-apply
**only** the priority-round zip
(`easyinvitemaker-priority-fixes.zip`). That yields exactly the
pre-Batch-2 state: priority fixes in, every Batch 2 change out.
Migration 0003 was never applied, so no database rollback is
needed for this batch; if you apply 0003 later and need to reverse
it, the migration file itself carries the rollback SQL (see the
migration section above).

### NOT TESTED — do not assume (Batch 2)

- **Live payment end-to-end** — no real or test-mode payment was
  attempted; the fulfilment chain has never run against a live
  gateway. (Also blocked by R-1 until the wiring fix lands.)
- **API handlers as served** — disproven by probe, see R-1: the
  handlers' behaviour is verified by direct-import tests only.
- **Live Supabase / RLS state** — whether migrations 0001/0002 are
  applied live, whether RLS is actually on, and the live bucket's
  real configuration are unknown from this workspace; checklist
  (a) is the verification path.
- **Browser click-through** — no browser end-to-end pass over the
  changed flows (create → publish → checkout → success) was run;
  there is no Playwright setup in this workspace and the agent
  browser cannot open localhost.
- **Mobile layout** — not checked (no viewport emulation available
  to the auditing browser).
- **Real YouPI payload / lookup shapes** — no live gateway exists
  for this project yet; the webhook field list (incl. whether
  `currency` is present in real deliveries — YouPI's own docs
  disagree) and the lookup response shape are documented but not
  live-verified. Capture both as test fixtures at the first live
  test (checklist (c)3).
- **Authoritative `npm audit`** — blocked in this workspace (see
  the dependency section); the GHSA-equivalent scan stands in its
  place, and the owner-side run in residual #2 is still owed.
- **The one historical test flake** — observed once, never
  reproduced in 8 consecutive runs, still unidentified (see the
  flake note under Final gate results).

---

## R-1 wiring fix — REVIEWED + CLOSED (2026-10-21, independent review)

The open item #1 above is fixed and independently verified. Both API
route files now register themselves with TanStack's route generator
via an appended adapter block (plus one import line each):

```ts
export const Route = createFileRoute("/api/orders")({
  server: { handlers: { POST: ({ request }) => POST(request) } },
});
```

(same shape in `api/webhooks/youpi.ts` with its own path). The
one-line adapter exists because in TanStack Start 1.168 a server
handler receives a context object (`{ request, ... }`), not the
Request directly (RouteMethodHandlerFn in
@tanstack/start-client-core).

Reviewer verification, all against the Batch-2-final zip copies:

- **Handler bodies byte-identical.** Diffing both route files against
  the copies in `easyinvitemaker-batch2-fixes.zip` shows ONLY the
  `createFileRoute` import line and the appended Route block with its
  R-1 comment — zero changes inside the POST handlers. Tasks 3–5
  logic stands exactly as signed off. `orders-auth.test.ts` and
  `webhook-fulfilment.test.ts` are also byte-identical to the zip.
- **Test stub.** `src/test/app-routing.test.tsx` gained only the
  `vi.mock("@/lib/supabase-server", ...)` stub (same pattern as the
  orders-auth / webhook-fulfilment tests) — needed because the
  regenerated route tree now imports the api modules, which load the
  service-role client. No assertion in any test file changed.
- **Route tree is build-generated, not hand-edited.**
  `src/routeTree.gen.ts` now contains `/api/orders` and
  `/api/webhooks/youpi`; its SHA-256 was identical before and after
  the reviewer re-ran `npm run build`, and the build prints no
  "does not export a Route" warnings.
- **Gates (reviewer re-run):** `npm test` 96/96 (9 files),
  `npx tsc --noEmit` 0 errors, `npm run build` green.
- **Live probes (production build under the /tmp node:http harness,
  reviewer-run; before-R-1 results from FINAL-REVIEW in brackets):**

  | Probe | Result |
  |---|---|
  | GET / | 200 — real SSR HTML [was 200] |
  | POST /api/orders, no Authorization | 401 `{"error":"Unauthorized"}` [was 404 HTML] |
  | POST /api/webhooks/youpi, fresh timestamp + bogus signature | 401 `{"error":"Invalid signature"}` [was 404 HTML] |
  | POST /api/webhooks/youpi, no headers | 401 `{"error":"Missing timestamp"}` [not probed before] |

**R-1 is CLOSED at the wiring level:** both endpoints are mounted and
reachable in the served production build and reject at their own
first checks. What remains untested is unchanged from the NOT TESTED
list: behaviour past those first rejections — a real end-to-end
payment still needs live Supabase + a real YouPI instance.

---

## Production-ready mission — Waves 2–5 + Stages E/F (2026-10-21)

Everything above this section (priority round, Batch 2, R-1) is unchanged history.
This section records the autonomous production-ready mission that followed. The
mission worked only in a copy; the delivered ZIP
(`easyinvitemaker-production-ready.zip`) is **cumulative against the ORIGINAL
project** and supersedes the priority, Batch 2 and R-1 ZIPs — apply it alone, on a
backup, then run `npm install` (see the checklist). Full mission record:
`mission/FINAL-REVIEW-mission.md` (independent review), `mission/TEST-RESULTS.md`,
`mission/SECURITY-REVIEW.md`, `mission/RELEASE-CHECKLIST.md`,
`mission/AUTONOMOUS-BACKLOG.md` (in the mission folder, not in the ZIP).

### What changed, grouped by area

- **Payments integrity:** NF-3 — `/api/orders` now re-validates invite
  completeness server-side (shared `getDraftIssues` adapter in
  `src/lib/draft-validation.ts`); an incomplete invite gets `422
  invitation_incomplete` (issue count only) before any insert. NF-7 — the orders
  route logs `errorClass` only.
- **Webhook:** NF-4 — `markOrderPaid` writes `gateway_payment_id` only; the UTR is
  preserved in the `webhook_deliveries` payload instead of overwriting
  `gateway_order_id`. NF-5 — a SUCCESS delivery without `paymentId` is now a
  definitive `missing_payment_id` reject (400) instead of an endless 500 loop.
  All Batch 2 protections stand (signature, timestamp window, gateway
  status+amount+currency corroboration, delivery recorded only after fulfilment).
- **Auth & ownership hardening (DB-1…DB-5):** dead privileged write helpers
  deleted from the browser `orders-api.ts` (DB-1); `invites-api.ts` gained
  code-level ownership predicates (`.eq("user_id", …)` on list/get/save/delete,
  fail-closed when signed out, public slug path untouched) as a backstop behind
  RLS (DB-2 code layer); the editor shows a fixed load-error message instead of
  the raw PostgREST error (DB-3); order-success no longer parses or renders the
  `?utr=` parameter — the reference comes only from the verified order row
  (DB-5). DB-4 (dead `getByPreviewToken`) was deliberately left; it is recorded
  as an open INFO item.
- **Uploads (NF-1 + Gap-A):** new `src/lib/media-upload.ts` — editor photo/music
  pickers upload to the `invite-media` bucket and persist storage paths
  (`<userId>/<inviteId>/<kind>-<unique>.<ext>`), never `blob:` URLs; MIME lists
  are string-identical to migration 0003, caps sit inside the bucket's 10 MiB
  limit, `upsert:false`. A concurrent-upload race in the photo picker was found
  in review and fixed with regression tests. Gap-A —
  `copyDraftMediaToInvite` copies draft-folder media into the invite's folder at
  publish and rewrites the config paths before checkout can arm; a copy/save
  failure blocks checkout rather than selling an invite with broken media.
  **Gap-B is OPEN:** after migration 0003 is applied (private bucket), guest
  rendering needs a signed-URL flow — see the release checklist warning.
- **Product:** NF-2 — the DB editor is no longer a dead end: a Publish action
  flushes the pending save and routes to `/publish?invite=<id>`;
  `resolvePublishSubject` makes foreign invites forbidden, published invites a
  live-link shell with no pay button, and drafts arm checkout on the EXISTING
  invite (no duplicate). NF-6 — `/order-failed` maps the `reason` parameter
  through a fixed message table; raw input never reaches the DOM. Dashboard
  share: `src/lib/share.ts` builds the public URL once and fully-encoded
  WhatsApp text; published rows gained Share + Copy-link with feedback.
- **Dates & countdown:** calendar-based day math; bare dates are read as Indian
  calendar dates (IST) instead of UTC midnight; a past event hides the countdown
  block; a future "together" date hides the story counters; leap-year and
  month-boundary behaviour pinned by tests. NF-8 — the music dock renders only
  when a playable track exists (13 silent themes no longer show an empty shell).
- **Content honesty:** NF-9 — non-live locales in the language switcher are now
  truly disabled (no click handler, `aria-disabled`); all 13 live locales were
  verified complete. NF-10 — every theme now has its own fictional demo couple
  (`DEMO_OVERRIDES` + `getDemoInvite` in `src/invites/demo-wedding.ts`); gallery
  cards and previews agree; the celebrity names were swept from demo data,
  editor placeholders and comments (zero hits left outside the regression-guard
  test that asserts their absence). The "14+" copy was corrected to the true
  registry count (exactly 14) in all 13 locales.
- **SEO & discovery:** truthful meta/Open Graph on home and `/templates`;
  per-invite OG on `/i/<slug>`; `robots noindex` added to `/create` (the one
  private route missing it); `public/robots.txt` rewritten; a dynamic
  `/sitemap.xml` route builds URLs from the request origin. `og:url` is emitted
  only when the owner sets `VITE_SITE_URL` to the real production origin.
- **Security headers:** `src/lib/security-headers.ts` is applied in the server
  entry on every response path: `X-Content-Type-Options: nosniff`,
  `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options:
  SAMEORIGIN`, `Permissions-Policy` (camera/mic/geolocation off), and CSP in
  **Report-Only** mode (an enforcing CSP would break the YouPI checkout script
  and inline theme styles; tightening is an owner decision).
- **QR codes:** new dependency `qrcode` (+ `@types/qrcode`) — the only
  dependency change in the whole cumulative set. `src/lib/qr.ts` renders the QR
  from exactly the share URL (`buildShareLinks(...).publicUrl`, spy-pinned by
  tests); the dashboard shows it for published invites with a PNG download.
  Client-side only.
- **Print:** a Save / Print button appears on the opened invitation and calls
  `window.print()`; `@media print` rules hide the site chrome and keep
  invitation sections intact. This is a browser print path, not a generated PDF
  file. Video export was assessed and deliberately NOT built (decision recorded
  in `mission/findings-exports.md`).
- **Dependency note:** `package.json`/`package-lock.json` differ from the
  original ONLY by `qrcode` + `@types/qrcode` and qrcode's transitive packages
  (Stage E-verified). Run `npm install` after applying the ZIP.

### Review verdicts

- Wave 3 independent reviews: payments SIGNED OFF; uploads SIGNED OFF after the
  F1/F2 fix round.
- Stage E whole-mission independent review (`mission/FINAL-REVIEW-mission.md`):
  **code SOUND in every area** — gates re-run by the reviewer (tests 178/178 in
  21 files, tsc 0, build green, lint 405 vs the 406 baseline), full 71-file diff
  inventory mapped to claimed waves with zero deletions, the eight
  money/auth/media/share claims re-read in the final code, live probes green.
  The review's only RETURN was documentation, closed in Stage F.

### Owner actions (summary — the full list is `mission/RELEASE-CHECKLIST.md`)

1. Apply migration 0003 in the Supabase SQL Editor — **but read the Gap-B
   sequencing warning first** (checklist §1): the signed-URL guest-rendering
   work must be scheduled before 0003 makes the bucket private.
2. Confirm the live migration/RLS state (checklist §1 query — all six tables
   `rowsecurity = true`). **Live RLS is unverified and is the launch blocker.**
3. Configure the Cloudflare WAF rate-limiting rule (checklist §2) — the in-code
   limiter is a per-isolate backstop only.
4. YouPI instance checks (checklist §3): webhook URL/secret match,
   `YOUPI_API_BASE_URL`, `ADMIN_API_TOKEN` non-default, INR-only.
5. Deployment env vars (checklist §4), including `VITE_SITE_URL` for `og:url`.
6. After applying the ZIP: `npm install`; run an authoritative `npm audit`;
   decide the one-line vite pin (`"8.1.5"` → `"^8.1.6"`); quarantine the four
   root probe scripts (NF-11); do the real-browser checks and the first live
   payment test (checklist §5).

### Rollback

Take a full backup/commit of the project before applying the ZIP (the standing
hand-back method). To roll back a group, restore that group's files from the
backup: payments/webhook (`src/routes/api/`, `src/lib/orders-server.ts`,
`src/lib/orders-auth.ts`, `src/lib/rate-limit.ts`), uploads
(`src/lib/media-upload.ts`, the two pickers), product/routes (`src/routes/`),
invitation rendering (`src/components/invitation.tsx`, `src/lib/invitation.ts`),
SEO/headers (`src/server.ts`, `src/lib/security-headers.ts`,
`src/lib/sitemap.ts`, `src/routes/sitemap[.]xml.tsx`, `public/robots.txt`),
QR (`src/lib/qr.ts` + the two package files, then `npm install`). Migration
0003 was never applied by the agents — nothing to roll back in the database;
its file carries its own rollback SQL block for after the owner applies it.

### NOT TESTED (unchanged honesty list)

Live Supabase (migrations/RLS/storage behaviour on the real project), a real
YouPI payment end-to-end, live storage upload/download against the real bucket,
anything past the API handlers' first rejections on a live deployment, browser
E2E (Playwright is infeasible in the agent environment — chromium download
blocked; all journeys NOT RUN), the print-to-PDF visual result, and mobile
viewport layout (no dedicated mobile/accessibility pass ran — backlog row D-4
remains open). One historical test flake from Batch 2 remains unidentified and
unreproduced in 10+ full runs; it is not claimed non-existent.
