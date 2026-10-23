# Frontend UI audit — EasyInviteMaker

Date: 2026-10-23 (premium UI round). Codebase: TanStack Start (React 19,
file routes, Nitro), Tailwind 4 + two hand-written stylesheets
(`src/site.css` ≈2,300 lines for storefront/editor, `src/styles.css`
≈1,900 lines for the invitation engine), shadcn/ui primitives under
`src/components/ui/`, Supabase backend, 14 themes in `src/themes/`.
Baseline at audit time: 499/499 tests, tsc 0, build green
(branch tip `c9a154ac…`). Line references are to that baseline.

## 1. Major visual defects

1. **Hero entrance double-animates.** `src/routes/index.tsx` put both
   `Reveal` (transition) and `.animate-rise` (keyframe) on the hero block;
   two systems animating the same transform/opacity judder for the first
   ~200ms. *Fixed this round: Reveal alone owns the entrance.*
2. **Hero phones float in perfect sync** — one shared
   `float-slow 7s` loop on all three handsets reads as a screensaver.
   *Fixed: desynchronised 8.5/9.5/11s periods with phase offsets.*
3. **Gallery cards are the product but present as flat blocks on filter
   change** — filtering swapped the grid instantly with no entrance and
   no feedback. *Fixed: staggered `.card-in` entrance keyed by category
   + sr-only result count.*
4. **Sticky header floats over scrolled content with no separation**
   (blur only). *Fixed: `.is-scrolled` shadow after 8px of scroll.*
5. **Mobile nav sheet pops in instantly** while everything around it
   transitions. *Fixed: `sheet-in` 240ms entrance.*
6. **Editor theme switch hard-cuts the preview** (the invitation remounts
   by key with no fade). *Fixed: 400ms `preview-in` fade, editor-scoped.*
7. **FAQ chevron** used a bare `0.25s` default-ease transition, off-system.
   *Fixed: tokenised.* (The FAQ itself uses native `<details>`; height
   animation is not attempted — acceptable.)

Not defects, deliberately kept: the warm paper/ink/gold storefront
identity, Cormorant Garamond + Manrope pairing, the titanium handset
frames (high quality, distinctive), and the comparison/pricing sections'
restraint. The storefront's problem was motion consistency, not art
direction.

## 2. Animation deficiencies

1. **Six different easing curves** across the two stylesheets
   (`0.22,0.61,0.36,1` / `0.2,0,0.2,1` / `0.4,0,0.2,1` / `0.5,0,0.25,1` /
   `0.38,0,0.2,1` / `0.33,0,0.2,1`) plus dozens of bare
   `transition: 0.16s–0.2s` (default ease). Same gesture, different feel
   per surface. *Fixed: two-easing token system (docs/motion-system.md);
   storefront's main interactive surfaces and all five invitation
   mechanics migrated.*
2. **Invitation openings front-loaded.** Curtain/doors/book/box easings
   spend most of their travel in the first third — playback reads as
   "slams open, then waits" (same failure the user rejected in the
   Lovable V4 doors). *Fixed: all five mechanics now share
   `cubic-bezier(0.42, 0, 0.58, 1)`; envelope sheet sequenced 0.3s
   behind the flap (one moving part at a time).*
3. **No press feedback anywhere.** Buttons/pills/choices only changed
   colour on hover — invisible on touch, which is the primary device
   class for this product's guests *and* shoppers. *Fixed: `:active`
   scale on `.btn`, `.category-pill`, `.theme-choice`.*
4. **Reduced-motion gap in the opening timer.** CSS collapsed the visual
   opening for reduced-motion guests, but `invitation.tsx` still held
   them on the sealed cover for the full `openMs` (1.4–1.7s of nothing
   happening). *Fixed: `openingDurationMs()` → 150ms.*
5. **`will-change: opacity, transform` permanently on every `.reveal`** —
   a memory/compositing cost on long pages for a one-shot animation.
   *Fixed: removed.*
6. **No page/modal transition system** — dialogs are Radix defaults
   (fine), route changes are instant (acceptable for this app; no
   view-transition work attempted this round).

## 3. Inconsistent components and design patterns

- Two styling worlds: hand-written `.btn`/`.site` classes (site.css) vs
  shadcn/ui components (used inside the invitation + editor pickers).
  They coexist without clashing visually, but a new contributor cannot
  tell which to reach for. Not unified this round (too broad); the token
  layer now at least gives both worlds the same durations/easings to use.
- Editor form font is Jost (loaded where?) vs storefront Manrope vs
  per-theme invitation fonts — three sans systems. Flagged, not changed.
- `transition: <time>` shorthand (animating *all* properties) in ~10
  places in site.css; the main offenders (buttons, pills, choices,
  inputs, cards) were migrated to explicit property lists this round.

## 4. Performance and accessibility concerns

- `/templates` loads **all 14 themes' Google Fonts stylesheets** in the
  route head (`fontHrefs`) so cards can render in each theme's typeface.
  Legitimate design reason, real cost: 14 render-blocking stylesheet
  requests. Mitigation path (not done): `font-display: swap` is already
  in the Google URLs; a future round could self-host subsetted display
  fonts for the card names only.
- Invitation artwork preload: the engine preloads sealed/revealed/ring/
  childhood images with a 12s deadline and a slow-connection notice —
  good. Hero images are 1536px-wide JPEGs on a phone-width column —
  oversized for most guests; responsive sizes are a future win.
- `.reveal` starts `opacity: 0` — if JS/IO fails, content is invisible
  until the observer fires. Reveal sets shown immediately under reduced
  motion, but a no-JS/SSR-mismatch path would stay hidden. Low risk in
  practice (SSR renders the same initial state, hydration is required
  for the app anyway); flagged.
- A11Y wins this round: gallery result count announced (`role="status"`),
  theme-card preview badge now appears on keyboard focus too
  (`:focus-visible`/`:focus-within` parity with hover), header sheet
  and cards keep visible focus outlines.
- Known open A11Y items unchanged by this round: the palette contrast
  proposals in `docs/ops/A11Y-CONTRAST-PROPOSALS.md` (owner design calls).

## 5. Files and components requiring changes (as prioritised, with status)

| Priority | File(s) | Change | Status |
|---|---|---|---|
| P1 | `src/lib/motion.ts` (new) + `src/test/motion.test.ts` (new) | Central tokens, easings, reduced-motion helpers + tests | Done |
| P1 | `src/site.css` | Motion tokens; btn/pill/choice/input transitions + press feedback; reveal tokenised, will-change removed; card entrance; header scrolled state; nav sheet + preview fades; hero float desync | Done |
| P1 | `src/routes/index.tsx` | Remove double hero entrance | Done |
| P1 | `src/components/site/chrome.tsx` | Scroll-aware header | Done |
| P2 | `src/routes/templates.tsx` | Keyed staggered grid + live region | Done |
| P2 | `src/components/site/theme-card.tsx` | No change needed (CSS carries it) | — |
| P3 | editor (CSS only) | Theme-choice/input tokens, preview fade; autosave logic untouched | Done |
| P4 | `src/styles.css` + `src/components/invitation.tsx` | Opening easings unified; envelope sequencing; reduced-motion timer | Done |
| P5 | `src/routes/dashboard.tsx` etc. | Utility pages: intentionally un-animated beyond shared btn/header behaviour | Reviewed, no change |

## 6. Potential regressions and dependencies

- `invitation.tsx` now imports `openingDurationMs` from `lib/motion.ts`;
  behaviour is identical when reduced motion is off (returns `openMs`
  unchanged). Test setup mocks `matchMedia` to `matches:false`, so the
  existing suite's timing expectations are unaffected.
- Reveal-mechanics tests pin trigger contracts, not easings — CSS timing
  changes are outside their assertions by design.
- `invitation.test.ts` pins Dubai Silk `openMs` at 1400 (a user-requested
  1–1.5s range) — **not** changed this round; the fix was easing, not
  duration, precisely so that pin stays true.
- No dependencies added or removed (see motion-system.md stack decision).
- The parallel Save/Print removal (owner decision, same day) touched
  `invitation.tsx`/`styles.css`/`site.css` print rules; this round's
  edits were re-read against the current files before each edit to
  avoid colliding with it.

## 6b. Supplement — from the parallel deep-audit agent

Full evidence: `docs/frontend-ui-audit-draft.md` (32.5 KB, file:line
throughout) and `docs/theme-quality-audit-draft.md` (all 14 themes).
Findings from it that this summary folds in:

- **Font over-fetching is worse than §4 states**: `/create` and
  `/editor/$id` route heads *also* load all 14 themes' font stylesheets,
  where only one theme is visible at a time. `/i/$slug` and
  `/preview/$themeId` load exactly one — the pattern to copy. Ranked the
  #1 performance fix; **not** done this round because the editor's head
  is static while theme selection is state — the fix (dynamic per-theme
  font injection on switch) needs browser verification the environment
  currently blocks. Recorded as remaining defect R-1.
- **Theme features were doubly buried**: not only unrendered by
  `ThemeCard`, a `.feature-pills { display: none }` rule existed in
  site.css. *Fixed this round (rendered + styled).*
- **Three different device frames** exist (CSS `.handset` in gallery/
  hero, `.device` titanium, photographed `.phone-real` in the editor) —
  a design can look different in gallery, hero and editor. Unifying
  them is a design project, not a motion fix; recorded as R-6.
- **Publish reuses the narrow `.auth` column** for a ₹599 transaction;
  dashboard is a hairline list with no invitation thumbnails. Both are
  P5 polish items, recorded as R-7/R-8, untouched this round.
- **~41 of 46 shadcn/ui components are unused shelf-ware** (with their
  Radix/recharts/cmdk dependencies). Deletion is a separate deliberate
  change, never mixed into motion work. R-9.
- Countdown has no digit transition — **accepted as correct** after the
  Zareqia evidence (their countdown also ticks in place; see
  reference audit). Not a defect.
- Two-clock opening (openMs timer + cinematic rAF) and total
  time-to-content (≤1.7s gesture + 5–6s cinematic ≈ 6.4–7.7s vs the
  benchmark's ~3.5–4s *total*) is the deepest choreography item. This
  round fixed easing + duration source-of-truth; merging the two acts
  into one continuous opening requires playback verification (the
  user's standing rule after the V3/V4 rejections) and is R-2.

## 7. What must be preserved (verified present at audit)

Auth/publish flows, editor autosave hardening, orders/webhook security
fixes, the 499-test suite's pinned behaviours (reveal trigger contract,
i18n key parity, media signing order E-6), flat ₹599 pricing, and the
per-theme identities (14 themes, 5 mechanics). Nothing in this round
touches schema, env, payments, or API routes.
