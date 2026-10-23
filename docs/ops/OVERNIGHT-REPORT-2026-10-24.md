# Overnight report — 2026-10-24

Branch: `muse-overnight-tasks-2026-10-24`. One lead integrator edited the
tree; six investigator clusters audited read-only in parallel and their
findings were re-verified against the code before anything was changed.
Hard rules held throughout: no live Supabase/YouPI/Cloudflare action, no
migrations applied, no deploys, the payment trio
(`src/lib/orders-server.ts`, `src/routes/api/orders.ts`,
`src/routes/api/webhooks/youpi.ts`) untouched, no `npm audit fix --force`,
no mass lint fix. Baseline at start (coordinator-verified):
**418/418 tests (39 files), tsc 0, build green, lint 383** (handoff figure).

## Closing gate line

`npm test` **495/495 (45 files)** · `npx tsc --noEmit` **0 errors** ·
`npm run build` **green** · `npm run lint` **254 problems (237 errors,
17 warnings)** — vs the 418/0/green/383 baseline. Net change: **+77 tests,
+6 test files**, zero regressions. The lint drop is mostly tree difference
(the reconciled tree is smaller than the one the 383 was measured on);
229 of the 254 are prettier formatting — see Task 11. Nothing was
mass-fixed.

---

## Fixes applied (each test-first: failing test → fix → focused run)

### Task 2 — Reveal mechanics regression sweep
Investigators found all 5 reveal mechanics correct (exactly-once on
click/Enter/Space via the shared `openTriggerProps`, Space preventDefault,
inert while opening, aria-label `Open the invitation from {hosts}`) but
with **zero test coverage**. Integrated the drafted suite as
`src/test/reveal-mechanics.test.tsx`: **44/44 passed as placed** — the
draft was right, no defect found. Coverage gap closed.

### Task 7 — Theme assets / checkout copy
- **D7-1 (customer-facing):** the YouPI checkout still described the
  purchase as `` `${tier} tier invitation` `` although price is flat
  ₹599 and tier no longer affects it. Changed the label to
  `"Invitation publication"` (`src/components/youpi-checkout.tsx:94`,
  label only, no behaviour change; no test pinned the old label).
  Stale "Classic tier" comments in `ornament.tsx` reworded.
- **Deleted 15 orphaned seal PNGs, 4,638,705 bytes total**, after
  re-verifying zero references across src/tests/config/docs (14 themes'
  `seal.png`, `public/themes/dubai-silk/wax-seal.png`,
  `public/demo/umer-maimoona/seal.png` 1,132,317 B). Per-file sizes in
  the evidence log. `public/audio/seal-click.wav` is LIVE and was kept.
- **theme-tuner:** the dead `?edit=seal` affordance (leftover of the
  removed seal editor) renamed to `?edit=theme`; the tool itself is
  live for name/family tuning.
- All 71 theme-referenced asset paths exist (0 would-404s);
  `defaultMusic` only on Dubai Silk, correct.

### Task 9 — Editor autosave deep dive
Four defects reproduced pre-fix, all pinned in the new
`src/test/editor-autosave-hardening.test.tsx` (4/4 post-fix; existing
autosave suite 6/6 unaffected):
1. **Cross-remount save race:** the C-5 promise chain lived in per-mount
   refs, so a PATCH in flight at unmount could land *after* a remounted
   editor's newer save. Chains moved to module scope, keyed by invite
   (`src/routes/editor.$id.tsx`).
2. **goPublish race:** the investigator's original hypothesis was
   **refuted** (the Publish button is disabled while a save is in
   flight, and the failed-save path is correct — checked clean). During
   integration, however, the adjacent reachable window reproduced:
   Publish clicked while a snapshot is still *pending* makes goPublish
   execute that save itself, and an edit made during that await was
   raced past. goPublish now loops until the current snapshot — and any
   snapshot replacing it during the await — has landed.
3. **Mirror restore trusted wholesale:** a partial/older mirror reached
   the editor missing whole config branches. `readEditorMirror` now
   merges over `blankConfig()`, same as the server path.
4. **Editor mirrors survived identity change:** the C-1 clear never
   touched `invite-editor-mirror:<uid>:*`. `clearLocalDraftData` now
   takes the departing user id and sweeps exactly that user's mirrors;
   `auth.tsx` passes it. (Data residue, not a live leak — mirrors are
   keyed by user id; another account could never restore one.)

### Task 12 — Root docs reconciliation
- SUPERSEDED banners added to `NEXT-STEPS.md` (claimed Razorpay,
  0001-only DB, "send music files" — the most dangerous stale doc),
  `BUILD-PLAN.md` (`/api/webhooks/razorpay`, Razorpay/Stripe table,
  ₹999–1,499 pricing), `HANDOFF-SPEC.md` ("ZERO payment code today")
  and `SESSION-SUMMARY.md` (15 themes incl. nonexistent azure-vows).
  Banner states current truth: YouPI, migrations 0001–0006, flat ₹599,
  14 themes, see `docs/ops/`. Bodies preserved as project history.
- `AGENTS.md` (a living doc): the stale "custom audio is session-only,
  do not upload" rule corrected minimally — owner uploads *are*
  persisted per the shipped music picker; guest playback choices stay
  session-only. The (true) seal-audio rule untouched.
- README's stock Lovable framing: report-only, untouched.
- `docs/ops/` files were **not** edited (historical records). Drift
  found there is listed under Findings.

### Task 13 — Fresh-eyes correctness (`src/lib/invitation.ts`)
Pinned in `src/test/fresh-eyes.test.ts` (8/8; 4 defect tests failed
pre-fix, 4 characterisation tests passed throughout — month-end/leap
`tog
...[truncated 11076 chars]erDuration edges, date-only home-anchor, share-link
round-trips, slug transliteration all verified correct and locked in):
- **F13-1:** impossible calendar dates (`2027-02-30`, `2027-04-31`)
  silently shifted to a real day (Mar 2 / May 1) because `Date.parse`
  normalises them; the module's own gates disagreed about validity.
  Fixed with a strict ISO parser that rejects impossible dates/times.
- **F13-2:** offset-less datetimes fell back to `Date.parse` and were
  read in the *guest's* timezone, breaking the module's home-anchor
  contract. They now anchor to +05:30 like bare dates.
- **F13-3:** `musicFadeVolume(0, 0)` was NaN (0/0) — assigning NaN to
  `player.volume` throws in browsers. A zero/invalid fade now resolves
  to full volume. Latent only: all shipped themes use 8000 ms.
- Severity: **LOW / defence-in-depth** for F13-1/F13-2 — the editor
  always writes valid, offset-carrying values; reachability needs a
  non-editor writer (the DB-editor path the codebase already defends
  against elsewhere).

### Task 14 — Historical regression pins
New direct pins added where coverage was indirect or missing:
`src/test/historical-regressions.test.ts` (5) and a new describe in
`src/test/orders-auth.test.ts` (5). Focused run 44/44.

| Historical bug | Class | Pin |
|---|---|---|
| ₹999 tier pricing (B.1) | DIRECT + new | config constants (599/59900/₹599, no per-theme price); 99900 rejected for royal **and** classic, 59900 accepted for both |
| NaN countdown on empty date (B.1) | was INDIRECT → DIRECT | `remainingTime`/`hasValidEventDate` on empty **and** unparseable values |
| Unauthenticated `/api/orders` (B.2) | DIRECT | orders-auth suite |
| Checkout↔API contract mismatch (B.2) | new DIRECT | exact body `{userId, inviteId, tier, amountMinor}` → 201 |
| Anon-client webhook fulfilment (B.3) | INDIRECT | covered via the service-role stub architecture of the orders-server/webhook suites; no honest unit-level direct pin exists |
| Partial-failure recovery gap (B.4) | DIRECT | `fulfilmentPlan.publish_only` suite |
| Gap-B signed URLs (B.4) | DIRECT + new | media-signing suite; `MEDIA_SIGNED_URL_TTL_SECONDS === 3600` pinned |
| Round 3 F1/F2/F3 (status gates, archived conflict, atomic mark-paid) | DIRECT | orders-auth / webhook suites |
| Late FAILED overwriting `refunded` | DIRECT | webhook suites |
| Round 3.5 T1/T2 (fail-closed lookups, atomic mark-failed) | DIRECT | orders-server suite |
| Round 3.6 zero-row re-read + classify | DIRECT | webhook handler tests A–D |
| Round 3.7 pre-read throws, settle wrapper, 23505 translation, Q-16 reuse + completeness-on-reuse | DIRECT | orders-server / orders-auth suites |
| 0006 free-publish hole | LIVE-ONLY | trigger execution cannot be unit-tested (no local Postgres); migration + RLS pack D9–D13 are the verification path |
| Round 3.8 draft reuse/clear, autosave, cross-account matrix, E-6 owner signing, auth/reset flows | DIRECT | publish-reuse, editor-autosave, local-draft, media-signing, password-reset suites |

### Task 15 — WCAG 2.1 AA audit (low-risk fixes only)
Pinned in `src/test/a11y.test.tsx` (7 tests; all defect tests failed
pre-fix):
- **A11Y-1 FIXED:** `.music-error` painted the foreground ink on
  `var(--background)` — contrast 1.02–1.31 on 7 themes, effectively
  invisible. Background is now `var(--invitation-surface)`; the test
  recomputes WCAG ratios from the real palettes + stylesheet and
  requires ≥4.5 in all 14 themes.
- **A11Y-5 FIXED:** dashboard h1 was the account email. Now h1 "Your
  invitations", email demoted to a small `.dash-email` line.
- **A11Y-6 FIXED:** `/create` and `/editor/$id` had no h1. Screen-reader
  h1s added ("Create your invitation" / "Edit your invitation").
- **A11Y-7 FIXED:** sub-event h3s followed the title h1 directly
  (rendered sequence 1,3,3,2). An sr-only h2 "Celebrations" now parents
  them; rendered heading-order test proves no skips.
- **A11Y-8 FIXED:** form focus was `outline: none` + border-color only;
  selects uncovered. Auth/editor inputs, selects and textareas now get
  `outline: 2px solid var(--gold)` with offset — the same indicator
  the envelope/scratch surfaces already use.
- **A11Y-9 FIXED:** both pickers' file inputs were `hidden` inside a
  non-focusable label — keyboard-unreachable. Inputs are now `sr-only`
  (visually hidden, focusable) and the wrapping label shows a
  `:focus-within` gold outline.
- Checked clean (not re-reported): reveal trigger semantics, scratch
  canvas keyboard path, countdown/music-dock aria labels, form labels,
  image alts, one-h1-per-route elsewhere, DOM order, `lang` handling.

### Task 18 — Security re-review
Re-review **clean**: neither the seal removal nor the
`openTriggerProps` refactor weakened any SECURITY-REVIEW control. One
low gap closed test-first:
- **RSVP href injection surface:** `rsvp.phone` / `rsvp.email` were
  interpolated raw into `tel:`/`mailto:` hrefs (the WhatsApp path was
  already digit-stripped). A hostile test (appended to
  `src/test/input-safety.test.tsx`) failed pre-fix — the tel href
  contained the payload `tel:+91 98200 12345" onclick="alert(9)`
  verbatim. Fix: tel href digit-stripped preserving a leading `+`;
  mailto href strips whitespace/quotes/angle brackets. Visible link
  text unchanged; suite 8/8 post-fix. Platform-mitigated beforehand
  (React escapes quotes / blocks dangerous schemes) — worst case was
  a malformed link, not script execution.
- ~25 untested text fields noted as coverage gaps only; the
  React-escaped render path is proven end-to-end.

### Task 6 — i18n (structure flawless: 143 keys × 13 locales, 0 missing/extra, placeholder parity)
- **FIX 1:** `faq.a0` in all 12 non-English locales still promised
  photos+music "all free" with no account requirement — the English
  fix from the release round never propagated. Re-translated per
  locale from the drafted corrections.
- **FIX 2:** `editor.previewNote` in all 12 locales lacked the
  sample-photo disclosure sentence (they still claimed no placeholders
  ever appear). Drafted sentences appended; existing text untouched.
- **FIX 3:** the site header hard-coded "Sign in / Dashboard /
  Sign out" while the rest of the nav was translated. New keys
  `nav.signIn` / `nav.dashboard` / `nav.signOut` added to all 13
  locales and `chrome.tsx` wired to `t()` (6 spots). These are
  **agent translations** of standard short UI strings — a native skim
  is advisable before launch.
- **FIX 4:** the `translations.ts` header comment understated the
  file's scope; corrected (146 keys: chrome, homepage, editor, FAQ,
  comparison).
- Machine parity re-checked after the edits: **146 keys × 13 locales,
  0 missing, 0 extra**; full suite green.
- **F-10 CONFIRMED DONE:** `faq.a6` is accurate in all 12 locales
  (independently verified, substance preserved everywhere).

### Task 19 — Architecture doc
`docs/ARCHITECTURE.md` written from the current code with file
citations and mermaid diagrams: (1) order → payment → webhook →
`settle_and_publish` → publish, (2) auth (signup/login/reset/session,
the two Supabase clients, cross-account local clearing), (3) media
upload → private storage → signed URLs (owner editor path, guest
server-signed path, and the deploy-order warning for migration 0003).

### Task 5 — Playwright spec (read-only audit + one stale fix)
Chromium in this VM refuses local-network navigation (proven
repeatedly), so the E2E still cannot run here — recorded, not fought.
The spec itself was audited against the tree: baseURL/webServer
handling sane, demo names current, one provably stale selector fixed —
`tests/smoke.spec.ts` waited for a "Break the wax seal" button; the
trigger's aria-label is now `Open the invitation from {hosts}`
(`src/components/reveals/index.tsx`), and the spec now targets that.

### Task 10 — Dead code
Verified-dead items from the investigator's list were re-grepped
before acting: `src/invites/index.ts`, the orphaned `Host` type and
`trackById` are **already absent** from this branch tree (the
investigator audited a pre-reconciliation tree) — nothing to delete.
Seal leftovers in the suspect files: none. Also deleted (docs relay):
`src/assets/music/seal-click.wav` (52,998 B, an unreferenced duplicate;
the live copy is `public/audio/seal-click.wav`). Its `.asset.json`
manifest remains, noted.

### Task 8 — Error paths / type safety
- The 10 `as any` constructed `t()` keys in `src/routes/index.tsx` are
  hand-verified complete today and now pinned by
  `src/test/i18n-constructed-keys.test.ts` (3/3): any future key drift
  fails loudly instead of rendering a raw key to the landing page.
  One provably redundant cast (`closing.createYours`) removed; the
  rest stay (documented above). Note: the test re-declares the route's
  key arrays by copy — exporting them from the route remains a
  follow-up so the two lists cannot drift.
- Webhook + health route error paths verified correct. The orders-API
  gap below was found here and is a **finding, not a fix** (protected
  file).

### Task 4 — docs/ops cross-check (drift list; files unedited by design)
- `MEDIA-DEPLOY-SEQUENCE.md`: dead "seal image" verification steps
  remain.
- `PRODUCTION-READINESS-AUDIT.md`: stale seal items, plus a PERF line
  still saying 13 themes (there are 14).
- `TEST-RESULTS.md`: stops at Stage E, 178/178 — long superseded.

### Tasks 1, 3, 16, 17, 20 — verification, gap pass, perf, CSS, keep-going
- Task 1: brief verified against the tree at baseline (418/0/green).
  Two brief claims did not survive contact with the tree and were
  corrected in this report: the code-health deletion list (already
  absent) and the goPublish hypothesis (refuted as stated; adjacent
  window found and fixed under Task 9).
- Task 3 gap pass produced the orders-API finding and the TYPE-1 pin
  (Task 8) and fed the security relay (Task 18).
- Task 16/17 findings are in the Findings section — nothing in them
  justified a code change tonight.

---

## Findings — NOT fixed (separated from the fixes above)

1. **Orders API malformed-body → 500 instead of 400.** A malformed-JSON
   or JSON-null/array body to `POST /api/orders` throws inside
   `request.json()` and lands in the catch-all: 500 "Failed to create
   order". The fix touches the protected `src/routes/api/orders.ts`,
   so per the brief it is a written finding only. Exact minimal fix:
   guard the parse and return 400 on failure. A failing-test draft is
   preserved at `~/workspace/overnight/evidence/drafts/orders-malformed-body.test.ts`
   (kept out of the suite so the gates stay green).
2. **P-1 (perf, unproven):** `Invitation`'s 1-second interval
   re-renders the whole unmemoized tree every tick
   (`src/components/invitation.tsx` ~L226; zero `React.memo` in
   `src/components/`). Not refactored on suspicion — recorded as a
   profiler-confirmation item: if a render profile confirms the cost,
   the contained fix is extracting the ticking countdown into a leaf
   component.
3. **A11Y-2 (design call):** muted-foreground on paper fails AA in 6
   themes (cathedral-light 3.62, ram-mandir 4.10, madina 4.37,
   golden-temple 4.44, phulkari-anand 4.46, mayura-mahal on paperLight
   4.08). Darkening brand tokens is the owner's call; palettes untouched.
4. **A11Y-3 (design call):** gold accent text below 3:1 in 3 themes.
   Same reasoning — report only.
5. **A11Y-4 (unverifiable):** scratch-date contrast is not statically
   determinable (canvas over artwork). No failure claimed; needs a
   visual/staging check.
6. **CSS staging-visual list (Task 17):** F17-1/F17-2/F17-4/F17-6 are
   breakpoint/visual flags with no provable CSS logic error behind
   them, and no seal residue exists in CSS. They belong on a staging
   visual pass, not in code changes made blind.
7. **Bundle:** the lucide chunk (236 KB) is the biggest lever; the
   shadcn/ui long tail is unimported scaffold with zero guest cost.
   Dependencies deliberately not pruned tonight.
8. **shadcn shelf-ware (owner's call):** 37 unimported
   `src/components/ui/` files + `hooks/use-mobile.tsx` are verified
   unused (including `ui/chart.tsx`, the only
   `dangerouslySetInnerHTML` in src, with zero importers). Safe to
   delete as a deliberate owner decision; left in place tonight.
9. **Theme data nits (report-only):** the `ram-mandir` file/id vs its
   "Ayodhya Ram Mandir" display name (D7-2, cosmetic); five themes
   borrowing another theme's `paper.jpg` is documented and intentional
   (D7-3, do not touch); `features[0]` "Wax Seal Envelope" in 3 themes
   is inert data with no renderer in src (the *kicker*, which does
   render, was fixed under Task 12's relay); theme taglines still
   describe a "wax-sealed envelope" opening — the envelope mechanic
   itself still exists.
10. **i18n native-review list:** German du/Sie register split across
    sections; haldi-vs-mehendi terminology (the English source itself
    uses both — source drift, owner call); `faq.a6` ×12 compressing
    the "free account" clause to "uploads are saved in your account"
    (substance preserved); `compare.row.music.feature` / `included.2`
    ×12 dropping "— yours or ours" (uniform, likely deliberate); plus
    the 36 new agent-translated strings from Task 6 (faq.a0 ×12,
    previewNote sentences ×12, nav keys ×12) deserve a native skim.
11. **README** still carries stock Lovable framing (report-only per
    Task 12 instructions).

## Owner decisions / live-only items (unchanged by this run)

Nothing here was attempted; all need owner action or live access:
run `RLS-VERIFICATION.sql` live (incl. D9–D13) → confirm 0001/0002 →
apply **0004** → `VERIFY-0004.sql` → deploy current code → guest check
→ apply **0003** (current code, incl. the E-6 editor-signing fix, must
deploy *before* 0003) → apply **0005** (only with/after the 3.7 code) →
apply **0006** (before payments) → allow-list `/reset-password` in
Supabase Auth → Cloudflare: rename the Worker (still the template name
`tanstack-start-ts`), bind the domain, set the 4 server secrets →
register the webhook URL in the YouPI panel → Q-17 live concurrency
drill → G1 sandbox protocol T0–T5 or written YouPI answers → Q-16
D1/D2 decisions + refund-after-publication policy → quarantine the 4
root probe scripts on the Mac copy → first real ₹599 payment +
real-browser pass (Playwright E2E has never run; this VM's chromium
refuses local-network navigation).

Live-only test gaps (Task 14): 0006 trigger execution, RLS enforcement,
live 0004 RPC / 0005 index behaviour, the Q-17 drill, G1 gateway
behaviour. No unit test can substitute for these.

**Production verdict unchanged: code PASS — production NO-GO pending
the live list above.**

## Gate line (final)

Baseline 418/418 · tsc 0 · build green · lint 383 →
**495/495 tests (45 files) · tsc 0 · build green · lint 254
(237 errors / 17 warnings, 229 of them prettier formatting)**.
