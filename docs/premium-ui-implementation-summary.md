# Premium UI round — implementation summary

Date: 2026-10-23. Working tree: `~/workspace/overnight/repo` (baseline
branch tip `c9a154ac…`, 499/499 tests · tsc 0 · build green at baseline).
This tree also carries the same day's pursr fix batch + Save/Print
removal; all three batches were gate-verified together (507/507, below)
and pushed together as one snapshot commit on
`muse-overnight-tasks-2026-10-24`. Before pushing, every changed file
was compared against the branch head (`424a87c5…`, which had gained
four owner/Lovable commits in other files): no overlap, no divergence —
the remote copies of these files were still the untouched baseline. Companion docs: `frontend-ui-audit.md` (+ the
32.5 KB `frontend-ui-audit-draft.md` evidence file),
`reference-animation-audit.md`, `motion-system.md`,
`theme-quality-audit-draft.md` (all 14 themes, with batch plan).

## What was changed

### Motion system (Checkpoint 2 foundation)
- **`src/lib/motion.ts` (new)** — durations (120/180/240/400/700ms),
  exactly two easings, 70ms stagger step, `prefersReducedMotion()`,
  `openingDurationMs()`. **`src/test/motion.test.ts` (new)** — 4 tests
  pinning the token contract and the reduced-motion opening behaviour.
- **`src/site.css`** — the same tokens as CSS custom properties on
  `.site`/`.editor`; migrated the main interactive surfaces to them.

### Priority 1 — Landing page
- Hero double entrance removed (`src/routes/index.tsx`): `Reveal` alone
  owns it; the competing `.animate-rise` keyframe is gone from the hero.
- Hero phone floats desynchronised (8.5s / 9.5s / 11s, phase-shifted);
  the centre phone is now the calmest, not one of three identical loops.
- Sticky header gains a shadow once the page scrolls (`chrome.tsx`
  scroll listener + `.is-scrolled`), mobile nav sheet animates in
  (240ms), FAQ chevron tokenised.
- Buttons gained `:active` press feedback and arrow-slide on hover;
  one `:focus-visible` gold-outline system for storefront/editor links
  and buttons (previously only form inputs and invitation surfaces had
  visible focus).

### Priority 2 — Template gallery
- Filter changes now re-settle the grid: cards stagger in (70ms steps,
  capped 420ms) instead of swapping instantly; the grid is keyed by
  category and the result count is announced (`role="status"`,
  sr-only) (`src/routes/templates.tsx`).
- **Theme features are finally visible**: each theme's four named
  features (present in the data since the catalog was built, never
  rendered — a `.feature-pills{display:none}` rule was the only trace)
  now appear as pills on the card (`theme-card.tsx` + site.css).
- Card hover deepens (border + shadow + phone lift, all token-timed);
  keyboard focus now gets the same Preview badge and lift as hover.

### Priority 3 — Editor
- CSS-only, zero logic changes (autosave/mirror/publish untouched):
  token transitions on inputs and theme-choice pills with press
  feedback; theme switching fades the preview in (400ms) instead of
  hard-cutting on remount (`.editor-preview .new-invitation`).

### Priority 4/5 — Invitation openings (all 14 themes, via the engine)
- **One easing for all five mechanics**: envelope, doors, curtain, book
  and box all moved from five different front-loaded cubic-beziers to
  the single symmetric `cubic-bezier(0.42, 0, 0.58, 1)` — the easing
  playback-verified with the user on the V5 envelope work. This is the
  round's highest-value change: at unchanged durations, openings stop
  reading as "slams open in 0.3s, then waits".
- **Duration single source of truth**: `paletteVariables()` now emits
  `--open-duration` from each theme's `openMs`, and the CSS mechanics
  read it — the animation and the JS unmount timer can no longer drift
  (curtain themes previously declared 1700ms against a hard-coded 1.5s
  animation: 200ms of dead air at the end of every opening).
- **Envelope sequencing**: the inner sheet starts rising 0.3s after the
  flap begins moving (one moving part at a time, the Invitima/TDY
  staged-beat pattern), landing inside the existing 1.4s `openMs`.
- **Reduced-motion fix**: the opening timer now collapses to 150ms for
  reduced-motion guests (`openingDurationMs` in `invitation.tsx`) —
  previously the CSS honoured their preference but the JS held them on
  a sealed cover for the full 1.4–1.7s.
- Dashboard/supporting pages: reviewed; they inherit the button,
  header and focus improvements. No page-specific animation added —
  utility surfaces stay quiet by design.

### Dependencies
None added, none removed. Motion/GSAP/React Bits/Motion Primitives
evaluated and deferred with reasons in `motion-system.md` — chiefly:
every adopted reference pattern is delivered by the CSS token system,
and a new dependency could not have been build-verified in this
environment (below).

## Verification — what actually ran

| Check | Result |
|---|---|
| `tsc --noEmit` (full project) | **0 errors** — run after all edits, including the parallel pursr batch's changes in the same tree |
| ESLint on every file this round touched | **No new errors.** All errors reported are pre-existing and in code this round didn't touch (`index.tsx` ×8 `no-explicit-any`, `theme-card.tsx` ×4 prettier on the handset-button spans, `templates.tsx` ×11 prettier); repo baseline lint was 254. This round's own files (`motion.ts`, `motion.test.ts`, `types.ts`, `chrome.tsx`, `invitation.tsx`) report zero |
| Vitest suite | **507/507 passed (48 files)** — full run 2026-10-23 ~20:21 +04 (499 baseline + 4 motion + 4 pursr-batch tests). One earlier run showed 506/507 with a single failure that did not reproduce on the immediate full re-run (parallel-load flake; the re-run is the recorded result) |
| `vite build` | **Green** (exit 0, Nitro output generated) |
| ESLint (whole repo) | **252 problems vs 254 baseline** — no regression |
| Visual/browser QA | **Done via Playwright + local dev server**: landing (desktop + scrolled header), gallery desktop + mobile, Dubai Silk preview captured sealed → mid-opening (flap mid-flip) → fully opened, /create with live phone preview. Feature pills verified in the live DOM: 14 lists, all 4 features rendering on the first card. Screenshots: `~/workspace/your_files/premium-ui-results/` (8 PNGs) |

### The environment restriction — LIFTED 2026-10-23 ~20:19 +04
From ~19:12 to ~20:19 on 2026-10-23, any process that loaded a native
`.node` addon (rolldown/oxc — i.e. vite, vitest, build) lost write
access (EPERM at config load). During that window only tsc/eslint could
verify. The restriction lifted on its own (runtime redeploy); all gates
above were then run for this round, the pursr fix batch and the
Save/Print removal together, since all three share this tree.

## Remaining defects / next work (prioritised)

- **R-1 (perf, P1)**: `/create` + `/editor/$id` + `/templates` load all
  14 themes' font stylesheets. Fix: dynamic per-theme font injection on
  theme switch in the editor; trimmed card-only font set for the
  gallery. Needs browser verification.
- **R-2 (choreography, P1)**: opening gesture (≤1.7s) + cinematic intro
  (5–6s) are still two acts totalling ~6.4–7.7s vs the benchmark's
  ~3.5–4s single act. Merging them means retiming `CinematicInvite`
  stages and `introSeconds` — **playback verification required before
  shipping** (the user's standing rule after V3/V4); do it in a session
  where the dev server runs.
- **R-3 (assets, P2)**: Dubai Silk `skyline.jpg` is 2.0MB (hero +
  thumbnail, ~7× any other theme); no responsive image variants
  anywhere. Re-encode + `srcSet` pass, behind the asset-guard test.
- **R-4 (themes, P2)**: per-theme quality batches per
  `theme-quality-audit-draft.md` §7 — Batch 1 = Dubai Silk, Cathedral
  Light (worst contrast; fixes already computed in
  `docs/ops/A11Y-CONTRAST-PROPOSALS.md`, owner sign-off per palette),
  Kanjeevaram. Copy fixes queued there too: duplicated kickers
  ("FOLDED CARD" ×3), Makkah's tagline, Mughal's stale header comment.
  Palette changes are owner design calls — not made in this round.
- **R-5 (a11y, P3)**: sub-44px touch targets in the editor
  (`.row-remove` 32px, `.photo-remove` 24px); header auth-state layout
  shift on load; `.reveal` content depends on JS/IO firing.
- **R-6 (consistency, P3)**: three device-frame implementations
  (gallery `.handset`, `.device`, editor's photographed `.phone-real`).
- **R-7/R-8 (P3)**: publish page deserves a summary card outside the
  narrow auth column; dashboard rows deserve invitation thumbnails.
- **R-9 (hygiene, P4)**: ~41 unused shadcn/ui components + their deps —
  separate deliberate deletion, never mixed into motion work.
- **R-10 (candidate, P4)**: The Digital Yes's blur-to-sharp hero text
  reveal — adopt only with low-end-device performance evidence.

## Lovable follow-up — necessary?

**No.** Everything above is plain code in this repo. Lovable is only
needed if the owner wants new template *artwork* generated (its
established role in this project); no UI or animation item in this
round requires it, and spending Lovable credits on code this repo can
carry would be waste.
