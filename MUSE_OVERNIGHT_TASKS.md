# Overnight task brief for Muse — 2026-10-23/24

Written by Claude Code after re-verifying current `main` state. Baseline confirmed
moments ago on the owner's Mac: `main` @ `f46770a9b046d101fef8f837a18a98bf36558c2a`,
working tree clean, `npm test` → **418/418 passed (39 files)**, `npx tsc --noEmit` → **0
errors**. (Test count is 418, not the handoff's 420 — 2 tests were deliberately removed
this session along with the wax-seal UI feature; see "What changed since the handoff"
below. Treat 418/0/clean as tonight's ground truth, not 420.)

`docs/ops/` now holds the reference docs from Muse's Round-3.8 handoff bundle
(`ADR-settle-and-publish.md`, `DEPLOYMENT.md`, `G1-SANDBOX-PROTOCOL.md`,
`MEDIA-DEPLOY-SEQUENCE.md`, `OPS-RUNBOOK.md`, `PRODUCTION-READINESS-AUDIT.md`,
`RELEASE-CHECKLIST.md`, `SECURITY-REVIEW.md`, `TEST-RESULTS.md`, and the SQL packs
`CONCURRENCY-DRILL.sql` / `RECONCILIATION.sql` / `RLS-VERIFICATION.sql` /
`VERIFY-0004.sql`) so you have them without needing anything outside this repo.
`CLAUDE_CODE_HANDOFF.md` is not in the repo (it lived one level up on the Mac) — this
brief restates everything from it that's relevant to tonight's scope.

## Hard rules for tonight — read before touching anything

These are inherited from the handoff and from the owner directly; they do not expire
because it's an overnight run:

1. **No live infrastructure action of any kind.** No applying migrations to any real
   Supabase project, no deploys, no DNS/hosting/Worker changes, no real or sandbox
   payment calls, no changes to `.env` or any secret. Everything in the handoff's §F
   that requires live Supabase/YouPI/Cloudflare access (F-1, F-5, F-6, F-7's live half,
   F-8's live half, F-12, Q-17) is **owner-only** — read and summarize it if useful, but
   do not attempt to execute any of it, sandboxed or not.
2. **No GitHub push to `main` without it being asked for by name.** Work on a branch;
   open a PR if your platform supports it, or stop and report findings as a
   `docs/ops/OVERNIGHT-REPORT-<date>.md` commit on a branch for review in the morning.
   Do not force-push, do not touch `claude-reconciled-2026-10-23` (leave it exactly as
   is), do not merge anything into `main` yourself.
3. **Never rewrite the three payment files** (`src/lib/orders-server.ts`,
   `src/routes/api/orders.ts`, `src/routes/api/webhooks/youpi.ts`) without a concrete,
   test-reproduced defect and a minimal fix — they've been byte-identical across every
   round since 3.6 and that's load-bearing. If you find something there, write it up as
   a finding for the morning rather than editing live overnight.
4. **Never run `npm audit fix --force`.**
5. **Don't mass-fix the lint baseline** (currently ~383 pre-existing problems per the
   handoff — re-measure, don't assume). It's a known, accepted baseline, not a backlog.
6. **Test-first discipline stays**, per the handoff's house rules: reproduce a defect
   with a focused test before changing code; run the full suite + tsc + build after any
   change; keep changes reviewable and attributable to a specific finding.
7. If you're unsure whether something crosses into "owner decision" territory, it
   probably does — write it up as a question in the report instead of guessing.

## What changed since the handoff (so you're not surprised by the diff)

The Mac tree was reconciled with your Round-3.8 `SOURCE/` tree and pushed to `main`
earlier today, plus some owner-requested frontend work done directly in this session:

- **The wax-seal UI feature was removed entirely** — no seal graphic, no separate
  "open" text button. Each reveal mechanic's own container (`.envelope`, `.doors`,
  `.curtain`, `.book`, `.box` in `src/components/reveals/index.tsx`) is now the click/
  tap/keyboard trigger itself (`role="button"`, `tabIndex`, `aria-label`, Enter/Space
  handling). All `sealImage`/`sealScale`/`sealPosition`/`sealDisc` fields were removed
  from `Theme`, `ThemeAssets`, and `Invite` types, from all 14 theme files, and from
  `src/invites/umer-maimoona.ts`. `src/components/dev/seal-position-editor.tsx` was
  renamed to `theme-tuner.tsx` and stripped of seal logic (keeps only the names/family
  color+scale dev controls). This is why the test count dropped 420 → 418
  (`src/test/media-seal-resolution.test.tsx` was deleted, it only tested the removed
  feature).
- The bottom-right music dock was restyled (square → pill); **no music content was
  added** — silent themes stay silent, this was explicitly deferred by the owner.
- All 12 non-English locales' `faq.a6` were updated to match the English honesty fix
  from Round 3.8 (D.7 / F-10 in the handoff) — **F-10 should now be considered DONE**,
  but please verify this yourself (see Task 1) rather than taking this note's word for
  it, per the handoff's own "trust but verify" rule.
- `playwright.config.ts` was added (the spec was orphaned per the handoff's F-8 note);
  `tests/smoke.spec.ts` was fixed to use relative URLs and the real demo-name
  placeholders (`Aarav`/`Diya`, not `Virat`/`Anushka`).
- The four root probe scripts (`check-storage.mjs`, `probe-supabase.mjs`,
  `test-auth-flow.mjs`, `test-db-only.mjs`) flagged in handoff §F-11 are **not present**
  in this tree — either already removed or never carried over in reconciliation. Confirm
  with a repo-wide search as part of Task 1; if you find any trace of them (even in
  git history) flag it, don't resurrect them.

## Tonight's scope: code-only, no live infra, no owner decisions

Everything below can be done by reading and editing the repo alone. Work top to bottom;
stop and write up rather than guess on anything in the "stop here" list at the end.

### Task 1 — Verify this brief against the actual tree (do this first)
Don't trust the claims above. Confirm:
- `npm test`, `npx tsc --noEmit`, `npm run build` all still match 418/0/green before you
  change anything. If they don't, stop and report the discrepancy before proceeding —
  same discipline as the Round-3.8 handoff's own "if you get something else, stop and
  find out why" rule.
- Grep for any remaining `seal`/`wax` references (CSS, components, themes, docs, tests)
  that the removal might have missed — dead CSS classes, stale comments, leftover
  assets in `public/themes/*/seal*.png` that are now unreferenced.
- Grep for the 4 probe-script filenames across the whole repo and its history
  (`git log --all --full-history -- '**/check-storage.mjs' ...` etc.) to confirm they
  never leaked into git.
- Spot-check 3–4 of the 12 non-English `faq.a6` locale strings against the English one
  to confirm the translation is accurate, not just present (you read/write these
  languages better than this note can verify).

### Task 2 — Full regression sweep on the reveal-mechanics rewrite
This was the biggest structural change since your last full review. For each of the 5
mechanics (`envelope`, `doors`, `curtain`, `book`, `box` in
`src/components/reveals/index.tsx`):
- Confirm keyboard activation (Enter and Space) and click both fire `onOpen` exactly
  once and are inert while `opening` is true (`aria-disabled`).
- Confirm no regression in `src/test/input-safety.test.tsx` (the XSS/hostile-input
  suite) — it depends on the container's `aria-label` carrying `/open the invitation
  from/i`, which moved during the rewrite.
- Check `src/styles.css` for the mechanic-specific rules (`.envelope`, `.doors`,
  `.curtain`, `.book`, `.box`) — confirm `cursor: pointer` and the shared
  `:focus-visible` outline are present and not fighting with any `is-opening`/`is-
  painted` state transitions, and that no orphaned CSS classes remain from the two
  removal passes (seal CSS, then open-label CSS).
- Add any test coverage that's missing — e.g. explicit per-mechanic keyboard-trigger
  tests if they don't already exist as a set (there's XSS coverage via
  `input-safety.test.tsx` but confirm basic interaction coverage exists for all 5, not
  just the one exercised there).

### Task 3 — General gap-finding pass over `src/`
A fresh, careful read-through — not a rubber-stamp of what's already tested. Look for:
- Dead code / unused exports (the `openTriggerProps` refactor and the seal-field
  removals are exactly the kind of change that leaves orphaned helpers behind — check
  `src/lib/media-url.ts`, `src/lib/media-upload.ts`, `src/invites/types.ts`,
  `src/themes/types.ts` for anything seal-adjacent that's now unused but wasn't
  deleted).
- Type gaps: anywhere a field removal (`sealImage`, `sealScale`, `sealPosition`,
  `sealDisc`) might have left a now-always-false conditional or an `any`/unsafe cast
  papering over a narrowed type.
- Genuine correctness bugs anywhere in `src/` — this is an open invitation to find real
  defects, not just seal-removal fallout. Favor concrete, reproducible findings (a
  failing test you can write) over stylistic opinions.
- Don't touch `src/lib/orders-server.ts`, `src/routes/api/orders.ts`,
  `src/routes/api/webhooks/youpi.ts` beyond reading them (rule 3 above) — if something
  looks wrong there, write it up, don't fix it tonight.

### Task 4 — `docs/ops/` cross-check against current code
Now that the ops docs are in the repo, do a quick pass checking they still match
reality post-reconciliation — e.g. does `RELEASE-CHECKLIST.md` or `DEPLOYMENT.md`
mention the wax seal, the old test count (420), or anything else this session changed?
Flag drift; don't rewrite these documents without noting what changed and why in the
report (they're historical records of what Muse verified, not living docs to silently
edit).

### Task 5 — `tests/smoke.spec.ts` / Playwright sanity
This was just wired up this session (`playwright.config.ts` added, fixture mismatches
fixed) and has not been run by anyone other than this Mac. If your environment can run
a headless Chromium against a local dev server (the handoff's §B.12 says your usual VM
can't — if that's still true, skip this task entirely and say so in the report rather
than fighting it), run `npm run test:e2e` and report pass/fail. If it can't run, just
read the spec for obvious staleness (selectors, copy) against the current tree.

## Format for your report

Commit a dated report to `docs/ops/OVERNIGHT-REPORT-<date>.md` on a branch (not
`main`), evidence-log style like the handoff's own rounds: what you ran, exact
command output (including failures), what you changed and why, and a short list of
findings that need an owner decision or live-infra access, clearly separated from
things you actually fixed. End it with the same gate line format the handoff uses —
`npm test` / `tsc` / `build` results after your changes, compared to tonight's 418/0/
green baseline.

## Stop here — do not attempt, just flag in the report if relevant

Everything in handoff §F that needs real Supabase/YouPI/Cloudflare access or an owner
decision: F-1 (migration 0006 live), F-2/F-3/F-4 decisions, F-5 (G1 gateway sandbox),
F-6 (live migration sequencing), F-7's live auth E2E, F-8's live browser journey on
staging, F-9 (exports — new feature, not owed), F-11's Worker rename/error-reporting
(fine to note current state, not to act), F-12 (all four owner decisions), F-14's "more
music" content work. These are correctly marked owner-only in the handoff and that
hasn't changed overnight.
