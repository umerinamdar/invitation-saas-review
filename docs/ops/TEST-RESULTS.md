# TEST RESULTS — EasyInviteMaker

Exact commands and actual results, recorded as run. Raw outputs: `mission/evidence/`
(workspace evidence archive — not shipped in the delivery package; this file
ships as `docs/TEST-RESULTS.md`, and its references to shipped documents use
their packaged `docs/…` paths per the Round-3 correction, 2026-10-22).

## Stage A baseline (2026-10-21)

Run in `~/workspace/invitation-saas-work/work/` on 2026-10-21 (production-ready mission, Stage A — fresh verification, nothing assumed from prior reports). Raw log: `mission/evidence/stageA-baseline.log`; full build log: `mission/evidence/stageA-build-full.log`.

| # | Command | Actual result |
|---|---|---|
| 1 | `npx tsc --noEmit` | **Exit 0 — 0 errors** |
| 2 | `npm test` (run 1) | **96/96 passed, 9 files** |
| 3 | `npm test` (run 2) | **96/96 passed, 9 files — identical to run 1** |
| 4 | `npm run build` | **Exit 0 — green.** No route-generation warnings (no "does not export a Route" for the API files). Only WARN: nitro `inlineDynamicImports option is ignored because the codeSplitting option is specified` (pre-existing, unrelated) |
| 5 | `npm run lint` | **406 problems (394 errors, 12 warnings)** — overwhelmingly pre-existing Prettier formatting debt |
| 6 | `npm audit --json` | **Blocked in this environment** — registry proxy returns `403 Forbidden … policy_denied` (`x-hatch-policy: zz_managed_internal_spaces_package_registries`), exit 1, same as Batch 2 Task 7. Substitute GHSA scan results from Batch 2 Task 7 stand: **0 Critical / 1 High / 2 Medium** (one launch-editor root cause via vite 8.1.5; the installed launch-editor is already the patched version; dev-only path). No authoritative `npm audit` numbers exist for this tree — owner-side item |

### Test detail (both runs identical)

| File | Tests |
|---|---|
| `src/test/webhook-fulfilment.test.ts` | 35 |
| `src/test/invitation.test.ts` | 15 |
| `src/test/orders-auth.test.ts` | 12 |
| `src/test/rate-limit.test.ts` | 11 |
| `src/test/draft-validation.test.ts` | 7 |
| `src/test/venue-url-safety.test.ts` | 6 |
| `src/test/order-success-state.test.ts` | 5 |
| `src/test/invite-bridge.test.ts` | 4 |
| `src/test/app-routing.test.tsx` | 1 |
| **Total** | **96** |

### Flake watch

A single intermittent failure was observed once historically during Batch 2 (84/85, test name not captured) and was never reproduced in 8 consecutive runs at that time. In this Stage A baseline **both runs were 96/96 and identical** — the flake did not appear. It remains **unidentified, not reproduced**; it is not claimed to be non-existent.

### Comparison vs Batch 2 final claims

| Gate | Batch 2 final claim | Stage A actual | Verdict |
|---|---|---|---|
| Tests | 96/96 | 96/96 (×2 runs) | ✅ matches |
| Typecheck | 0 errors | 0 errors | ✅ matches |
| Build | green | green, exit 0, no route warnings | ✅ matches |
| Lint | 406 | 406 | ✅ matches |
| Dependency audit | blocked (403); GHSA 0C/1H/2M | blocked again (same 403); GHSA results stand | ✅ consistent |

**No regressions found.** The Batch 2 + R-1 final state is exactly as reported.

---

## Production-ready mission — Waves 2–5 (2026-10-21)

Each wave ran its gates in the work copy; raw outputs are in the per-wave logs under
`mission/evidence/`. Counts grew wave by wave as tests were added tests-first; no wave
closed with a failing test, a typecheck error, or a broken build.

### Batch 2 + R-1 (historical, pre-mission — record carried forward)

| Item | Result | Evidence |
|---|---|---|
| Batch 2 Tasks 0–7 final gates | Tests **96/96** (9 files), tsc **0 errors**, build **green**, lint **406** | `mission/FINAL-REVIEW-batch2.md` |
| R-1 wiring fix gates (reviewer re-run) | Tests **96/96**, tsc **0**, build **green**; route tree hash-stable across rebuilds | `CHANGES-FOR-CLAUDE.md` (R-1 section; delivered at the package root); `mission/evidence/r1-gates.log` |
| R-1 live probes (production build, node:http harness) | `GET /` 200; `POST /api/orders` no-auth **401** `{"error":"Unauthorized"}` (was HTML 404 before R-1); `POST /api/webhooks/youpi` bogus signature **401** `{"error":"Invalid signature"}`; no headers **401** `{"error":"Missing timestamp"}` | `work/CHANGES-FOR-CLAUDE.md` (R-1 section) |

### Wave 2 — payments integrity, uploads (NF-1), product (NF-2/NF-6, share, "14+")

| Workstream | Final recorded result | Evidence |
|---|---|---|
| Payments (NF-3, NF-4, NF-5, NF-7) | Focused suites green; full suite **127/127 (14 files)** at that workstream's close, tsc 0, build exit 0 | `mission/evidence/stageB-payments.log` |
| Uploads (NF-1 real storage upload) | Full suite **131/131 (15 files)**, tsc 0, build exit 0; media-upload tests 8/8 at this wave (grew later) | `mission/evidence/stageBC-uploads.log` |
| Product (NF-2 editor→publish, NF-6 reason codes, share links, "14+" copy) | Full suite **131/131 (15 files)** (109 baseline at wave start → +15 own tests: publish-subject 4, share 7, order-failed 4), tsc 0, build green | `mission/evidence/stageC-product.log` |
| **Wave 2 end state** | **Tests 131/131, 15 files; tsc 0; build green** | logs above |

### Wave 3 — auth/ownership hardening (DB-1…DB-5), Gap-A, independent reviews

| Workstream | Final recorded result | Evidence |
|---|---|---|
| Hardening (DB-1, DB-2 code layer, DB-3, DB-5, Gap-A) | Full suite **146/146 (16 files)**, tsc 0, build green, eslint on touched files zero findings on changed lines | `mission/evidence/stageB-hardening.log` |
| Uploads fix round (F1 concurrent-upload race, F2 faq.a6 locales) | Suite green at 146/146 with the hardening wave; fix evidence in log | `mission/evidence/stageBC-uploads-fix.log` |
| Independent reviews | Payments review signed off; uploads review signed off after F1/F2 fixes | `mission/evidence/review-wave3-payments.md`; `mission/evidence/review-wave3-uploads.md` |
| **Wave 3 end state** | **Tests 146/146, 16 files; tsc 0; build green** | logs above |

### Wave 4 — dates/countdown, content honesty (NF-9/NF-10), SEO + security headers

| Workstream | Final recorded result | Evidence |
|---|---|---|
| Countdown/date edges + NF-8 music dock | Full suite **171/171 (20 files)**, tsc 0; invitation.test.ts grew 15 → 21 | `mission/evidence/stageC-dates.log` |
| Content (NF-9 locales disabled state, NF-10 per-theme demo couples) | Full suite **171/171 (20 files)**; new tests content-honesty 9, language-switcher 3 | `mission/evidence/stageD-content.log` |
| SEO + headers | tsc 0; build green (run 3× incl. a `VITE_SITE_URL` proof build); live probes: `/` 200 with title/OG correct, `og:url` correctly absent without config and present in the proof build, `/sitemap.xml` valid XML on request origin, all 5 security headers on responses incl. error path | `mission/evidence/stageD-seo-headers.log` |
| **Wave 4 end state** | **Tests 171/171, 20 files; tsc 0; build green** | logs above |

### Wave 5 — QR codes, print action, celebrity-name sweep

| Workstream | Final recorded result | Evidence |
|---|---|---|
| Final fixes (QR via `qrcode` dep, Save/Print button, name sweep) | Full suite **178/178 (21 files)**, build green; "Save / Print" + `.invitation-print` verified present in built assets; `grep -rn "Virat"/"Anushka"` over `src/` excluding the regression-guard test = **zero hits** | `mission/evidence/stageD-finalfixes.log` |
| **Wave 5 end state** | **Tests 178/178, 21 files** | log above |

---

## Stage E — whole-mission independent verification (2026-10-21)

Reviewer re-ran every gate personally on the final tree (reviewer wrote none of the
mission code). Full record: `docs/FINAL-REVIEW-mission.md`.

| # | Command | Actual result |
|---|---|---|
| 1 | `npm test` | **178/178 passed, 21 files** (single run, no failures) |
| 2 | `npx tsc --noEmit` | **Exit 0 — 0 errors** |
| 3 | `npm run build` | **Exit 0 — green** (qrcode chunk present in output; nitro cloudflare-module preset) |
| 4 | `npm run lint` | **405 problems (391 errors, 14 warnings)** — one *fewer* than the 406 Stage A baseline; net zero-new confirmed |

### Final per-file test table (21 files, 178 tests)

| File | Tests |
|---|---|
| `src/test/webhook-fulfilment.test.ts` | 37 |
| `src/test/invitation.test.ts` | 21 |
| `src/test/orders-auth.test.ts` | 16 |
| `src/test/media-upload.test.ts` | 14 |
| `src/test/data-access-scoping.test.ts` | 11 |
| `src/test/rate-limit.test.ts` | 11 |
| `src/test/content-honesty.test.ts` | 9 |
| `src/test/draft-validation.test.ts` | 7 |
| `src/test/qr.test.ts` | 7 |
| `src/test/share.test.ts` | 7 |
| `src/test/venue-url-safety.test.ts` | 6 |
| `src/test/order-success-state.test.ts` | 5 |
| `src/test/invite-bridge.test.ts` | 4 |
| `src/test/order-failed.test.ts` | 4 |
| `src/test/publish-subject.test.ts` | 4 |
| `src/test/security-headers.test.ts` | 4 |
| `src/test/language-switcher.test.tsx` | 3 |
| `src/test/photo-picker.test.tsx` | 3 |
| `src/test/sitemap.test.ts` | 3 |
| `src/test/app-routing.test.tsx` | 1 |
| `src/test/orders-server.test.ts` | 1 |
| **Total** | **178** |

### Stage E live probes (production build, node:http harness, placeholder server env)

Raw output: `mission/evidence/stageE-final-review-probes.log`.

| Probe | Actual |
|---|---|
| `GET /` | **200**; correct title; all 5 security headers present |
| `GET /templates` | **200**, title `Wedding invitation designs — EasyInviteMaker` |
| `GET /sitemap.xml` | **200**, `application/xml`, parser-verified well-formed; 6 `<loc>` entries all on the request origin (`/`, `/templates`, `/contact`, `/privacy`, `/terms`, `/refund`) |
| `POST /api/orders`, no auth | **401** `{"error":"Unauthorized"}` — the handler's own response |
| `POST /api/webhooks/youpi`, fresh timestamp + bogus signature | **401** `{"error":"Invalid signature"}` — the handler's own response |
| `GET /api/orders` (wrong method) | 200, app shell (only POST is registered on the route; recorded, not judged) |
| `GET /definitely-not-a-route` | **404** with branded title |

Known harness limitation (unchanged from prior stages): the harness has no
static-asset layer, so `/robots.txt` was not probed over HTTP; the SEO wave verified
the built `.output/public/robots.txt` content directly and the generated wrangler
config binds Workers Static Assets to it.

### Playwright / browser E2E — INFEASIBLE-HERE (NOT RUN)

`@playwright/test@1.64.1` is installed and one smoke spec exists
(`tests/smoke.spec.ts`), but no browser binaries are present and
`npx playwright install chromium` failed: 5 download attempts, each
`Request to https://storage.googleapis.com/chrome-for-testing-public/… timed out after 30000ms`,
`Failed to install browsers`, exit 1. **Verdict: INFEASIBLE-HERE** (browser download
blocked in this environment). Journeys — existing smoke spec, (a) home load,
(b) /templates 14 cards, (c) /create empty-submit validation, (d) invite/preview
render, and the headless print-to-PDF visual check — are all **NOT RUN**. Browser E2E
has never been executed in this environment and is not claimed anywhere; the
equivalent owner-side real-browser checks are in `docs/RELEASE-CHECKLIST.md` §5.
Evidence: `mission/evidence/stageE-playwright-exports.log`;
`mission/findings-exports.md`.

### Flake watch (updated)

The single historical Batch 2 flake (seen once, test name not captured) **did not
appear** in the Stage A baseline (two identical 96/96 runs), in any wave's gate runs,
or in the Stage E reviewer's 178/178 run — 10+ consecutive full-suite runs since it
was seen. It remains **unidentified, not reproduced**; it is not claimed to be
non-existent.
