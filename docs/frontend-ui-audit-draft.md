# EasyInviteMaker — Frontend UI Audit (Draft)

> Scope: read-only audit of `~/workspace/overnight/repo` (TanStack Start, React 19, Tailwind 4, file routes). No code was changed for this draft. Line references are to the tree as audited 2026-10-23. Test baseline referenced throughout: **499 tests passing, tsc 0, build green** (per MEMORY / overnight verification) — do not regress this.

---

## 1. Major visual defects

1. **Two competing visual systems on one page.** `src/styles.css:1-3` imports Tailwind 4 + `tw-animate-css` and defines a shadcn token set (`:root` `--background: oklch(0.27 0.043 245)` — a blue-grey foreground, `src/styles.css:71-72`), while `src/site.css:7-50` defines a second, warm system (`.site, .editor { --ink: oklch(0.2 0.02 35); --gold …; font-family: "Manrope" }`). Both stylesheets are loaded globally in `src/routes/__root.tsx` (`appCss` + `siteCss`). Result: invitation surfaces use `--font-serif/--font-sans` injected per-theme (`src/themes/types.ts:paletteVariables`), the storefront hard-codes Cormorant Garamond + Manrope (`src/site.css:57-67`), and `styles.css @layer base` sets `body { font-family: "Montserrat" }` (`src/styles.css:158-163`) — three body-font declarations, winner depends on cascade order, not intent.
2. **Landing hero has no hierarchy anchor beyond type.** `src/routes/index.tsx:88-122`: hero is text + three fanned `ThemePhone`s. All three phones run the identical `.animate-float` (`src/site.css:121`) with no stagger, delay, or `--r` differentiation, so they bob in sync — reads as a screensaver, not a composed showcase. The centre phone is only `52%` vs `44%` wide (`src/site.css:.hero-phone-3`); there is no shadow/scale depth cue beyond overlap.
3. **Gallery cards hide the actual product.** `src/components/site/theme-card.tsx:14-38` (`ThemePhoneScreen`) renders only backdrop image + names + date inside a handset. The opening mechanic — the product's differentiator — is reduced to a 0.56rem uppercase text label (`.theme-card-reveal`, `src/site.css`) at the top-right. `theme.features[4]` defined in every theme (`src/themes/types.ts`) is never rendered: `.feature-pills { display: none }` in `site.css`. Shoppers compare 14 near-identical phones.
4. **Flat section rhythm on the landing page.** `index.tsx` stacks `designs → how → compare → pricing → faq → closing-cta`, all using the same `.section-head` + `Reveal` fade-up. No pinned, horizontal, or image-led break; `compare` and `faq` are bordered 1px tables/lists (`site.css .compare-table, .faq-list { gap:1px; background: var(--line) }`) that read as admin UI next to the gold-foil hero.
5. **Editor preview fidelity vs. chrome mismatch.** The preview uses a photographed iPhone frame (`.phone-real`, `site.css`, image `/devices/iphone-promax-frame.png`) while the gallery/hero use a completely different CSS-drawn `.handset` / `.device` titanium frame (`site.css` `.handset*` and `.device*` — two more frame implementations). Three device frames, three bezel/radius/island treatments; a design looks different in gallery, hero, and editor.
6. **Invitation long-scroll still flattens after the hero.** Acknowledged in-code (`src/styles.css` comment above `.opened-invitation`): sections after `.skyline-invitation` share one continuous backdrop, but typographic scale collapses — `.family-section h2 / .rsvp-section h2` are a fixed `36px` (`styles.css`), `.forever-section h2` is `48px`, venue link is `31px` serif — no fluid `clamp()` scale as on the storefront, so desktop invitations feel small and mobile ones feel cramped in the same build.
7. **Dashboard is a bordered list, not a product surface.** `src/routes/dashboard.tsx` + `.dash-list` in `site.css`: rows are `gap:1px; background: var(--line-soft)` hairline rows with a 24px serif name and text buttons. No thumbnail of the customer's own invitation (despite `ThemePhone` existing), no status colour system beyond `.status-published` green text.
8. **Publish / auth pages reuse `.auth` (max-width 410px, centred) for a transaction.** `src/routes/publish.tsx` renders price, summary `dl`, and YouPI checkout inside `.auth.publish` (`site.css .publish { max-width: 470px }`). A ₹599 checkout gets the same narrow centred column as login (`src/routes/login.tsx`) — no order-summary card, trust, or preview affordance at the pay moment.

## 2. Animation deficiencies — inventory of what exists

There is **no JS animation library** in `package.json` (verified: no `motion`, `framer-motion`, or `gsap`; dependencies are Radix ×~26, `tw-animate-css@1.3.4`, `embla-carousel-react`, `vaul`). All motion is CSS transitions/keyframes + two JS timers. That is the deficiency and the opportunity: the vocabulary is tiny and inconsistent.

### 2a. The only scroll-reveal primitive

`src/components/site/reveal.tsx:1-55` — `Reveal`: `IntersectionObserver`, `rootMargin: 0px 0px -12%`, one-shot (`observer.disconnect()` after first intersect), adds `.is-shown`, stagger is manual via `style={{ transitionDelay }}` prop. No exit animation, no `AnimatePresence` equivalent, no variants. Used on landing only; **not used at all** in `templates.tsx`, `dashboard.tsx`, `editor`, or `publish.tsx` — those routes have zero entrance motion.

CSS side, `src/site.css` (`.reveal` block, ~L1870):

```css
.reveal { opacity:0; transform: translateY(22px);
  transition: opacity .85s cubic-bezier(.22,.61,.36,1), transform .85s cubic-bezier(.22,.61,.36,1);
  will-change: opacity, transform; }
```

`will-change` is never removed after reveal — every revealed block keeps a compositor layer for the page lifetime.

### 2b. Keyframe inventory (complete)

| Keyframe | File | Duration / easing | Used by |
|---|---|---|---|
| `float-slow` | `site.css:101` | `7s ease-in-out infinite`, `translateY(-12px)` | `.animate-float` — hero phones only |
| `rise` | `site.css:110` | `0.9s cubic-bezier(0.2,0.7,0.2,1) both`, `translateY(18px)→0` | `.animate-rise` — hero copy only |
| `invitation-appear` | `styles.css:1319` | `1s ease both` (and `0.8s` variant for revealed date) | `.opened-invitation`, `.date-revealed .revealed-date` — opacity only, no transform |
| `loading-spin` | `styles.css:1036` | `1s linear infinite` | `.loading-spinner` (Lucide `LoaderCircle`) everywhere |
| `petal-fall` | `styles.css:1304` | `var(--petal-dur, 9s) linear infinite`, 18 hand-written `nth-child` rules, `--petal-drift/--petal-spin/--petal-scale` per petal | `.petals i` flower shower |
| `popper-fly` | `styles.css:1781` | `1.5s cubic-bezier(0.16,0.75,0.3,1) forwards` | `ConfettiBurst` hand-off to petals |

Plus `tw-animate-css` keyframes, but they fire **only inside unused shadcn primitives** (`src/components/ui/*`: accordion, dialog, sheet, popover, etc. use `animate-in/out`, `fade-*`, `zoom-*`, `slide-*`). No product surface uses a shadcn Dialog/Sheet/Accordion — FAQ uses native `<details>` (`index.tsx`), nav uses a hand-rolled sheet (`.nav-sheet`, no enter/exit transition at all — it mounts/unmounts instantly in `chrome.tsx`).

### 2c. Invitation opening transitions (the best motion in the codebase)

All in `src/styles.css`, all `transform`-only, each with a *different* easing — no shared token:

| Mechanic | Selector | Duration | Easing |
|---|---|---|---|
| Envelope flap + paper | `.envelope-flap, .envelope-paper` | `1.4s` | `cubic-bezier(0.22,0.61,0.36,1)` |
| Doors | `.door` | `1.4s` | `cubic-bezier(0.4,0,0.2,1)` |
| Curtain drapes | `.drape` | `1.5s` | `cubic-bezier(0.5,0,0.25,1)` |
| Book cover | `.book-cover` | `1.5s` | `cubic-bezier(0.38,0,0.2,1)` |
| Box lid | `.box-lid` | `1.5s` (+ opacity `1.5s`, no easing named) | `cubic-bezier(0.33,0,0.2,1)` |

JS timing in themes is decoupled from CSS: `Theme.motion.openMs` is `1400–1700` varying per theme (`src/themes/*.ts`), `introSeconds` is **uniformly `6` for every theme**, `musicFadeMs` uniformly `8000`. `src/components/invitation.tsx:openEnvelope()` waits `openMs` on a `setTimeout`, then mounts the opened invitation; `src/components/cinematic-invite.tsx` runs a second, independent `requestAnimationFrame` clock staging `skyline (<1.2s) → names (<3s) → invitation` via `data-stage` + `:has()` selectors in `styles.css` (`.skyline-invitation:has(.intro-running[…])`). Two clocks, no shared timeline — drift between `openMs`, CSS `1.4/1.5s`, and the cinematic stages is possible on slow devices.

### 2d. Interaction feedback inventory

- Buttons (`.btn`, `site.css`): `transition: 0.2s` (all properties), hover is background colour only. **No `:active` / tap scale anywhere in `site.css` or `styles.css`.**
- Nav links: `transition: 0.18s`, hover = opacity `0.68→1` only.
- Category pills (`templates.tsx`): `transition: 0.16s`, no layout animation — filtering swaps the grid instantly, no FLIP/stagger; cards have no entrance at all on this route.
- Theme card: `.theme-phone { transition: transform .6s cubic-bezier(.2,0,.2,1) }`, hover `translateY(-8px)`; hover badge `0.25s`. Desktop-only — no touch equivalent, and hover lift does not fire in the editor's theme chooser (`.theme-choice` is a flat pill, `transition: 0.16s`, colour only).
- FAQ chevron: `transform .25s` rotate on `[open]`, but the `<details>` body itself has no height/opacity animation (native snap).
- Countdown (`invitation.tsx`): numbers replace every `1000ms` via `setInterval` with no digit transition, roll, or tabular pulse — the most-watched element on the page is the least animated.
- Editor: **zero transitions** on panel/fieldset changes, preview theme switching remounts `Invitation` via `key={previewKey}` (`invite-editor.tsx`) so the opening replays from black with no crossfade; autosave state text swaps instantly.
- Page transitions: none. TanStack Router navigations are hard cuts everywhere, including gallery → `/preview/$themeId` where a shared-element (phone → full invitation) transition is the obvious premium move.
- Double entrance bug: hero copy in `index.tsx` is both `<Reveal>` (IntersectionObserver fade-up, `.85s`) **and** `.animate-rise` (`0.9s` keyframe) — two overlapping entrances on the same element with different curves.

## 3. Inconsistent components & design patterns

1. **Stylesheet split with no contract.** `site.css` (2,208 lines, hand-written BEM-ish classes: `.btn`, `.theme-card`, `.editor-form`) owns storefront + editor + dashboard. `styles.css` (1,927 lines, Tailwind entry + hand-written invitation classes: `.envelope`, `.countdown`, `.music-dock`) owns the invitation engine + shadcn tokens. The same concept is styled twice: `.btn` (site) vs shadcn `Button` (`src/components/ui/button.tsx`, CVA variants) — `Button` is used in exactly **one** product file (`src/components/invitation.tsx`, for the music dock + retry) and inside other unused `ui/*` files; every other CTA in the app is `<Link className="btn btn-solid">` or `<button className="btn …">`.
2. **46 shadcn files, ~5 used.** `src/components/ui/` ships accordion, calendar, chart, sidebar, table, command, menubar, etc. `package.json` carries their Radix deps + `recharts`, `react-day-picker`, `cmdk`, `input-otp` for surfaces that do not exist in the product. This is bundle and maintenance weight with zero visual payoff, and its blue-grey token set (see §1.1) actively conflicts with the warm brand tokens.
3. **Three button vocabularies.** (a) `.btn/.btn-solid/.btn-quiet/.btn-ghost/.btn-text/.btn-sm` (site.css), (b) shadcn `Button variant="ghost|outline" size="icon"` (invitation dock), (c) ad-hoc: `.track`, `.theme-choice`, `.category-pill`, `.row-remove`, `.photo-remove`, `.rsvp-actions a` — all pill/button-shaped, all with different padding, radius (`999px` vs `1px` vs `10px`), and hover rules.
4. **Radius chaos.** Storefront: cards `border-radius: 2px` (`.theme-card-top`), buttons `999px`, inputs `1px` (`.auth-form input`), price card `0` with an inset gold outline, compare table `12px`, photo slots `10px`. Invitation: envelope `4px`, scratch canvas `4px`, family scrim `10px`. No `--radius` token is shared — shadcn's `--radius: 0.5rem` (`styles.css:69`) is ignored by all hand-written CSS.
5. **Type stacks diverge per surface.** Storefront: Cormorant Garamond + Manrope. Invitation fallback: Cormorant Garamond + Montserrat (`styles.css :root --font-serif/--font-sans`). Editor form inputs: `"Jost", sans-serif` hard-coded (`site.css .auth-form input, .editor-form input`). `.publish .price span`: Jost again. Four sans faces (Manrope, Montserrat, Jost, + per-theme sans) for one product.
6. **Spacing is per-component magic numbers.** Every section re-declares `padding: clamp(64px,9vw,120px) clamp(18px,5vw,64px)` (designs/how/pricing/compare/faq/closing in `site.css`) instead of a section token; editor uses `clamp(24px,3vw,38px)`; invitation sections use fixed `46px/60px/55px` px values with separate mobile overrides.
7. **Icons:** Lucide throughout (consistent), but sizes are inline magic numbers (`size={13…22}`) with no scale, and the invitation dock mixes Lucide-in-shadcn-Button with custom hint spans while storefront uses raw Lucide in `.btn`.

## 4. Performance & accessibility concerns

### Performance

1. **Font over-fetching is the #1 perf defect.** `src/routes/templates.tsx:23,45-52`: `fontHrefs = [...new Set(themes.map(t => t.typography.fontsHref))]` — loads **every theme's Google Fonts stylesheet** (4 distinct family combos across 14 themes: Cormorant+Inter, Cormorant+Jost, Cormorant+Montserrat, Playfair+Inter, each with 5–7 weights) plus the storefront sheet, as render-blocking `<link rel=stylesheet>` with `display=swap` but no `preload`/`preconnect` strategy per route. Worse: `src/routes/create.tsx` head and `src/routes/editor.$id.tsx` head both do `links: themes.map(theme => fontsHref)` — **all 14 themes' fonts in the editor too**, where only the selected theme is visible at a time. By contrast `/i/$slug` and `/preview/$themeId` correctly load exactly one theme's fonts — the pattern to copy.
2. **Image weight.** `public/themes/dubai-silk/skyline.jpg` is **2.0 MB**; theme folders are 0.7–3.1 MB each (sealed + hero + section-bg, ~280–360 KB per JPG). Demo gallery images `public/demo/umer-maimoona/{childhood,ring,forever}.jpg` are actually PNGs at ~1.6 MB each (known incident, re-encode deferred). `invitation.tsx` preloads sealed + revealed + ring + childhood with `new Image()` and gates the whole opening on them (5s "slow" notice, 12s hard error in `invitation.tsx`) — a 2 MB hero on a guest's mobile data directly delays the reveal moment.
3. **No responsive images.** All theme/demo `<img>`s are single-src, no `srcSet`/`sizes`, no WebP/AVIF variants. Gallery `ThemePhoneScreen` img (`theme-card.tsx:19`) has no width/height (see CLS below) and loads the full `revealedBackdrop` into a ~260px card.
4. **Continuous compositing cost.** `.petals i` runs 18 infinite `petal-fall` animations (`styles.css`), hero phones run 3 infinite `float-slow`, `.reveal` keeps `will-change` forever, `.music-dock`/`.family-block` use `backdrop-filter: blur()` — individually fine, together a steady GPU/battery cost on low-end Android, which is the primary guest device. Petals at least are gated behind the scratch reveal; hero floats are not gated at all.
5. **Editor re-render surface.** `InviteEditor` (`invite-editor.tsx`, 673 lines) re-renders the full `Invitation` preview on every keystroke via `onChange → setConfig`; the preview `useMemo` depends on the whole `config` object. No debounce/memo boundary between form and preview — typing latency risk grows with gallery/music state. (Autosave itself is correctly debounced/chained — see §7 — this is render, not network.)

### Accessibility

1. **Reduced-motion coverage is partial, and inconsistent by layer.** Good: `styles.css` has the nuclear `@media (prefers-reduced-motion: reduce) { * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important } }`, `Reveal` JS-checks the media query, `CinematicInvite` and `ConfettiBurst` JS-check and skip, `site.css` disables `.reveal`/float/rise and `popper-burst`. Gaps: the JS clocks do **not** check it — `invitation.tsx openEnvelope()` still waits full `openMs` (1.4–1.7s) before mounting content, and the music fade/`requestAnimationFrame` swell still runs; the scratch canvas still requires a drag gesture (mitigated: it is keyboard-activatable, Enter/Space reveals — `scratch-invitation.tsx` — preserve this).
2. **Focus visibility is invitation-only.** Envelope/doors/curtain/book/box get `outline: 2px solid var(--gold)` (`styles.css`), form inputs/selects got the A11Y-8 gold outline fix (`site.css`), file-picker labels use `:focus-within` (A11Y-9). But `.btn`, nav links, `.category-pill`, `.theme-choice`, `.theme-card` phone link, and dashboard actions have **no `:focus-visible` style** in `site.css` — keyboard users on the storefront rely on the browser default, which the pill/outline button styles largely erase.
3. **CLS risks.** (a) `ThemePhoneScreen` backdrop `<img>` has no dimensions — the handset's `aspect-ratio: 9/19.5` contains most of it, but the img itself is absolutely positioned into an unsized span. (b) Fonts: four display families swap in with `display=swap` and no `size-adjust`/fallback metrics — names in `.theme-card-names` are sized in `cqw` container units, so a font swap visibly reflows card text. (c) `SiteHeader` renders auth controls only after `useAuth` resolves (`chrome.tsx`: "render nothing until session resolves") — the header gains/loses "Sign in / Dashboard / Sign out" inline, shifting the CTA on every page load. (d) Editor preview: `.phone` scale `--s` changes at the 900px breakpoint with a sticky reposition — a layout jump on resize/rotate.
4. **Heading/semantics debt (partly paid).** `sr-only` h1s were added to `/create` + `/editor/$id` (Task 15) and an `sr-only` h2 parents the sub-event h3s (`invitation.tsx`). Remaining: dashboard h1 exists, but `templates.tsx` page-head is the only h1 with three competing visual h1 styles (`.page-head h1`, `.hero-inner h1`, `.auth h1`); `Reveal as="li"` inside `<ol className="steps">` renders extra wrapper semantics worth re-checking after any motion refactor.
5. **Touch targets & hover-only affordances.** Gallery "Preview" affordance is hover-only (`.theme-phone-hover`, opacity 0 until `:hover`) — on touch the whole phone is the link (good) but there is no visible cue (bad). `.row-remove` is 32×32px, `.photo-remove` 24×24px, `.track-play` 26×26px — all under the 44px guideline, in the editor parents actually use on phones. Music dock buttons are 42px (shadcn icon buttons inside are smaller).
6. **Contrast carry-overs.** The A11Y contrast proposals doc (`docs/ops/A11Y-CONTRAST-PROPOSALS.md`, 6 muted + 3 accent failures across themes) is still **proposals only — no palette has been changed**. `--ink-faint: oklch(0.62 …)` on `--sheet` is used for kickers, dates, and `.theme-card-reveal` at 0.56rem — small, low-contrast text carrying real information.

## 5. Files / components requiring changes, ranked

| Rank | File | Why | Size/risk |
|---|---|---|---|
| 1 | `src/routes/templates.tsx` + `src/routes/create.tsx` + `src/routes/editor.$id.tsx` (head links) | All-themes font loading (§4.1). Load storefront fonts + selected theme only; lazy-load on theme switch. | Small, high payoff, low risk |
| 2 | `src/site.css` (2,208 lines) | Owns all storefront motion tokens (none), `.reveal`, `.btn`, frames, focus gaps. Needs a token block (durations/easings/springs), `:focus-visible` system, removal of permanent `will-change`. | Large file, medium risk — visual regression surface |
| 3 | `src/components/site/reveal.tsx` | Single primitive for the whole marketing site; needs variants (fade/slide/scale), stagger children, exit support, `will-change` cleanup. Every landing section depends on it. | Small file, high leverage |
| 4 | `src/routes/index.tsx` | Hero double-entrance bug, synced float, flat section rhythm, native `<details>` FAQ. | Medium |
| 5 | `src/components/site/theme-card.tsx` + `.theme-card*` CSS | Gallery must sell the mechanic: render `theme.features`, show reveal-type affordance without hover, add image dimensions. | Medium |
| 6 | `src/components/site/chrome.tsx` + `.site-header/.nav-sheet` CSS | No mobile-sheet transition, auth-state CLS, no focus styles, no scroll-state (header is sticky+blur but never changes on scroll). | Small-medium |
| 7 | `src/styles.css` (1,927 lines) | Invitation easings ×5 inconsistent, countdown has no digit motion, `invitation-appear` is opacity-only. Tokenise easings here or in a shared file — do not unify with site.css blindly (see §6). | Large, high risk — 44 reveal-mechanics tests pin behaviour |
| 8 | `src/components/invitation.tsx` (827 lines) | Two-clock opening, reduced-motion gap in `openMs` wait, per-second countdown re-render of the whole tree. | High risk — most-tested surface |
| 9 | `src/components/editor/invite-editor.tsx` (673 lines) | No panel/preview transitions, full-preview re-render per keystroke, sub-44px targets. Performance fix (memo boundary) before any decoration. | High risk — autosave hardening tests |
| 10 | `src/routes/dashboard.tsx`, `src/routes/publish.tsx`, `src/routes/login.tsx` | No thumbnails/transitions/states; publish reuses auth column. Polish after P1–P3. | Medium, low risk |
| 11 | `src/components/ui/*` (46 files) + `package.json` | Delete or fence off unused shadcn shelf-ware in a separate, deliberate PR — not mixed into motion work. | Deletion risk if imports hide in tests |
| 12 | `public/themes/*/skyline.jpg` etc., `public/demo/umer-maimoona/*.jpg` | 2 MB hero, mislabelled PNG-as-JPG demo images (~1.6 MB ×3). Re-encode + responsive variants. Asset-guard test exists for this exact failure mode. | Asset-only, needs visual QA |

## 6. Potential regressions / dependencies if adding the `motion` package

Context: mission proposes Motion for React (`motion` package, successor to Framer Motion). Current state: **zero JS animation deps**, React 19.2, TanStack Start (SSR via Nitro), Tailwind 4, Vitest + jsdom (46 test files).

1. **SSR / hydration.** TanStack Start server-renders every route. Motion's `initial`/`animate` must not produce server/client markup divergence — use `initial={false}` or `useReducedMotion`-safe defaults on first paint, especially inside `Invitation`, which already manages its own mount gating (`artState`, `open`, cinematic clock). A hydration mismatch here breaks the guest link (`/i/$slug`), the highest-value route.
2. **Collision with the CSS opening mechanics.** The five reveals (`reveals/index.tsx` + `styles.css` transitions) are CSS-class driven (`.is-opening`) and **pinned by `src/test/reveal-mechanics.test.tsx` (44 tests)** plus `historical-regressions.test.ts`. Re-implementing them in Motion will fail those tests by design; the correct move is Motion for *storefront + gallery + editor chrome*, CSS retained for invitation openings, until/unless the test suite is deliberately rewritten with the mechanics re-verified frame-by-frame (the user has rejected look-alike openings before — see templates-10 rework history).
3. **Bundle.** `motion` is ~35–50 KB gz for the core (`motion/react` tree-shaken, `LazyMotion` + `domAnimation` less). Acceptable **only** if loaded on marketing routes; it must not enter the `/i/$slug` guest bundle, where every KB delays the opening on mobile data. Verify with the Vite/Nitro chunk output per route — TanStack code-splitting is per-route, so import discipline is the whole game. Do **not** also add GSAP or React Bits wholesale: three engines for one site is the exact bloat the owner has repeatedly rejected. GSAP only if a pinned/cinematic landing sequence is approved that Motion's scroll APIs genuinely cannot do.
4. **Reduced-motion duplication.** Motion has its own `MotionConfig reducedMotion="user"` + `useReducedMotion`. If not wired, Motion animations will **bypass** the existing CSS nuclear override and the JS checks in `Reveal`/`CinematicInvite` — an accessibility regression disguised as an upgrade. Wire it at the app root (`__root.tsx`) in the same PR that adds the dependency.
5. **Test environment.** jsdom has no `IntersectionObserver`/`matchMedia` layout — existing tests already mock around `Reveal`. Motion components in tested trees (`site-header-auth.test.tsx`, `create-start-new.test.tsx`, editor autosave suites) will need `motion`'s test behaviour checked; `AnimatePresence` exit animations keep unmounting components alive, which can break tests that assert immediate removal (nav sheet, publish issues list) and can delay route transitions in the editor's save-flush-on-unmount path (`editor.$id.tsx` — an exit animation must never hold the pending-save flush hostage).
6. **Version/peer risk.** Pin a Motion version with explicit React 19 support; the repo pins aggressively elsewhere (`rolldown` override, TanStack exact versions in `package.json`). Add the dep, run the full 499-test gate + `tsc` + build before any component uses it — dependency-first, usage-second, in separate commits.
7. **What Motion genuinely buys here** (worth the dep): gallery filter FLIP/layout animation (`templates.tsx` — impossible in current CSS), `AnimatePresence` for nav sheet / modals / publish-issues, shared-element gallery→preview transition, editor preview crossfade, scroll-linked hero parallax. What it does **not** buy: invitation openings (CSS already good), countdown (needs a tiny digit component, not a library), hover states (CSS).

## 7. What must be preserved

- **Guest invitation flow, byte-for-byte behaviour:** sealed → opening (`openMs`) → cinematic stages → scrollable page, in **one** continuous page (AGENTS.md: details mount only after opening; no second modal). Audio priming: music is gesture-primed muted on the open click, unmuted only after opening; seal click plays on a **separate** `<audio>` element so it cannot restart the music (`invitation.tsx`). Scratch canvas stays separate from artwork, keyboard-activatable with no visible reveal button, and is removed after reveal so native scrolling resumes.
- **Countdown correctness:** explicit event timezone (`+05:30` anchoring), never guest-local; impossible/offset-less dates must not render `NaN` (guards in `lib/invitation.ts`, pinned by fresh-eyes + invitation tests). Together-milestone maths = completed calendar years/months/days, not decimal approximations (AGENTS.md).
- **Editor autosave system** (`editor.$id.tsx`): module-scope save chains keyed by invite, frozen snapshots + generations, local mirror (keyed user+invite) restored over blank config, unmount flush, `goPublish` loop-until-landed. Pinned by `editor-autosave.test.tsx` + `editor-autosave-hardening.test.tsx`. Any editor UI work goes *around* this, never through it. Same for `/create` local-draft singleton + draft media key + "Start new" clearing (`create-start-new.test.tsx`, `local-draft.test.ts`).
- **Publish/payment integrity:** flat **₹599 for every design** (`PUBLISH_PRICE_LABEL`, single source `src/config/site.ts`); `/api/orders` rejects any amount ≠ 59900; publish-subject/reuse logic (`publish.tsx: resolvePublishSubject, draftInviteReuse` — fail-closed on non-PGRST116 errors, id recorded before insert) pinned by `publish-subject.test.ts` + `publish-reuse.test.tsx`. No UI change may reintroduce a tier-based price label (the checkout "tier" label was deliberately removed).
- **Media signing order (E-6):** editor media-signing code must be live **before** migration 0003 is applied, or editor previews/thumbnails break. `invite-editor.tsx` signing effect + `/i/$slug` server-signed `mediaUrlMap` are load-bearing; motion work must not move these components' mount order.
- **Reveal mechanics contract:** 5 mechanics × painted/unpainted variants, `openTriggerProps` keyboard behaviour (whole stage is the button, Enter/Space, `aria-disabled` while opening) — `reveal-mechanics.test.tsx` 44/44.
- **Content & i18n:** 13 locales × 146 keys at parity (`i18n-constructed-keys.test.ts` pins constructed keys — `steps.*`, `faq.q/a*`, `compare.row.*`, `included.*` in `index.tsx` are built by string interpolation; renaming keys breaks the pin). Header auth states pinned by `site-header-auth.test.tsx`. Historical pins in `historical-regressions.test.ts` exist because each was a real shipped bug — read before "cleaning up".
- **Accessibility wins already landed:** A11Y-8 gold focus outlines on form controls, A11Y-9 `:focus-within` on hidden file inputs, music-error surface contrast fix (`--invitation-surface`), `sr-only` h1s, sub-event `sr-only` h2, scratch keyboard path. Do not regress while adding the missing storefront focus system.
- **Repo hygiene:** Lovable-connected branch (AGENTS.md) — no force-push/history rewrite; pristine/work-copy conventions; no live migrations, deploys, or payments as part of frontend work. Production remains NO-GO on the owner list (migrations 0001–0006 order, RLS D1–D13, Q-17, YouPI G1, one real payment, real-browser pass) regardless of UI state.

## 8. Prioritized implementation plan

### P1 — Landing page (Checkpoint 2)
Tokenise motion in `site.css` (`--dur-fast/med/slow`, `--ease-out`, `--ease-sheet`, stagger step) and rebuild `Reveal` with variants + stagger-children on top of the tokens (CSS-first; Motion only if variants prove insufficient). Fix hero double-entrance (drop `.animate-rise` where `Reveal` wraps), de-sync hero floats (per-phone delay/`--r`), add scroll-state to `SiteHeader`, animate `.nav-sheet` in/out, give FAQ an animated disclosure (keep `<details>` semantics or move to a tested accordion pattern). Verify: 499 tests, real-browser pass on desktop + mobile widths.

### P2 — Template gallery (Checkpoint 3)
Fix font loading first (§5 rank 1 — pure win, do it inside P1 if time allows). Then: Motion `layout` FLIP on category filter, card entrance stagger, render `theme.features` + reveal-type badge visibly (not hover-only), add img dimensions + responsive sizes, tap feedback (`:active` scale) for touch. Verify filtering/selection tests + gallery visual QA per category (all/traditional/modern/religion filters in `templates.tsx`).

### P3 — Editor & live preview (Checkpoint 4)
Render-performance first: memoise `Invitation` preview boundary so keystrokes don't re-render the whole engine; then preview crossfade on theme switch (opacity, ≤200ms, never blocking input), panel/fieldset micro-transitions, 44px touch targets for remove/play controls. **Do not touch** autosave chain, mirror, or publish flush. Verify: both autosave suites + `create-start-new` + typing-latency spot check.

### P4 — Invitation themes in batches (Checkpoint 5)
Tokenise the five opening easings in `styles.css` to two shared curves (mechanic-specific durations stay per-theme via `openMs`), add countdown digit roll (transform/opacity only, `tabular-nums` retained), respect reduced-motion in the `openMs` JS wait (skip to ≤50ms), apply the already-written A11Y contrast proposals theme-by-theme with owner sign-off per palette. Batch: flagship (Dubai Silk) → Hindu group → Muslim/Sikh/Christian groups → uncategorised. Each batch: reveal-mechanics suite + per-theme opening screenshot QA (closed/mid/settled), mobile 375px pass. **No mechanic may change its motion verb** (user's standing rejection criterion).

### P5 — Dashboard & supporting pages (Checkpoint 6)
Dashboard invitation thumbnails (reuse `ThemePhone` at small size), publish page summary card + preview thumb (outside the `.auth` column), login/publish/dashboard entrance consistency using the P1 tokens, empty/loading state polish (replace bare `LoaderCircle` pages with skeleton-or-message states). Finish with: full gate (499+ tests, tsc, build, lint), asset re-encode pass (§5 rank 12) behind the asset-guard test, and a remaining-defects list. Lovable follow-up: **not required** for any of the above — all of it is plain code in this repo; Lovable is only needed if the owner wants template *artwork* regenerated.

---

*Evidence note: every claim above traces to a file read in full for this audit (`package.json`, both stylesheets, all listed routes, `chrome/reveal/theme-card`, `invite-editor`, `invitation`, `cinematic-invite`, `scratch-invitation`, `reveals/index`, `ornament`, `themes/types+index`) plus directory/asset/test listings. Reference-site animation findings belong in the companion `docs/reference-animation-audit.md`, not this file.*
