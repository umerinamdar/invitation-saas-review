# Motion system — EasyInviteMaker

Status: implemented 2026-10-23 (premium UI round). Source of truth in code:
`src/lib/motion.ts` (JS) mirrored as CSS custom properties in `src/site.css`
(storefront/editor) and as literal values in `src/styles.css` (invitation
engine, which is themed per-invitation and does not share the `.site` scope).

## Principles

1. **Smoothness is continuity, not effects.** From the TheDigitalYes
   research (see `reference-animation-audit.md`): their invitations feel
   premium because of one unbroken scroll inside a constant frame, with
   almost no transition animation between sections. We copy the principle,
   not the artwork.
2. **One orchestrated entrance per view.** A page gets one entrance
   sequence (staggered, ≤ ~700ms total). Sections below the fold reveal
   once, gently, via the existing `Reveal` component. Nothing else moves
   unless the user acts.
3. **Motion answers actions.** Filter changes, theme switches, menu opens,
   button presses — these animate because the user caused them and the
   motion shows what changed.
4. **Transform and opacity only.** No animated layout properties, no
   `will-change` left permanently on large subtrees.
5. **Reduced motion is a state change, not a slower animation.** With
   `prefers-reduced-motion: reduce`, durations collapse: content is simply
   there. This applies to JS timers as well as CSS (see `openingDurationMs`).

## Tokens

| Token (CSS / TS) | Value | Used for |
|---|---|---|
| `--dur-instant` / `MOTION.instant` | 120ms | Press feedback (`:active` scale) |
| `--dur-fast` / `MOTION.fast` | 180ms | Hovers, pills, inputs, header links |
| `--dur-base` / `MOTION.base` | 240ms | Menus, chevrons, badges |
| `--dur-slow` / `MOTION.slow` | 400ms | Cards, preview fade |
| `--dur-slower` / `MOTION.slower` | 700ms | Scroll reveals, card entrances, hero |
| `MOTION.opening` | 1700ms | Upper bound reference for invitation openings |

| Easing | Value | Used for |
|---|---|---|
| `--ease-out` / `EASE.out` | `cubic-bezier(0.22, 1, 0.36, 1)` | Entrances, reveals, hovers |
| `--ease-inout` / `EASE.inOut` | `cubic-bezier(0.42, 0, 0.58, 1)` | Openings, two-way state changes |

Stagger step: 70ms (`STAGGER_MS`), capped at 420ms in grouped entrances so
late items never wait.

### Why two easings, and why this inOut

Before this round the codebase used **six** different cubic-beziers across
`site.css`/`styles.css` plus bare `transition: 0.2s` (default `ease`) in
dozens of places — the same gesture felt different on every surface.

The openings specifically used front-loaded easings (e.g. curtain
`cubic-bezier(0.5, 0, 0.25, 1)`). A front-loaded 1.5s door is ~75–80% open
by 0.3s — playback-verified in the 2026-10-23 Lovable V4 rejection as
"too fast" even though the duration was in range. The symmetric
`cubic-bezier(0.42, 0, 0.58, 1)` is the easing the user playback-verified
as "slow, steady, smooth" on the V5 envelope (~3.5–4s total sequence).
All five reveal mechanics now share it; durations are unchanged
(1.4–1.5s, inside each theme's `openMs`).

## Patterns

- **Scroll reveal** — `src/components/site/reveal.tsx`: IntersectionObserver,
  once, `translateY(22px) → 0` + fade over `--dur-slower`/`--ease-out`,
  per-item `delay` for stagger. Renders visible immediately under
  reduced motion.
- **Card entrance (gallery)** — `.card-in` keyframes in `site.css`, grid
  keyed by filter category so filtering re-runs the entrance; result count
  announced via an `sr-only` live region.
- **Hero** — one Reveal entrance (the old double entrance — keyframe +
  transition on the same element — was removed); the three phones float
  with desynchronised periods (8.5s / 9.5s / 11s, phase-shifted) instead
  of one shared 7s loop.
- **Press feedback** — `.btn`, `.category-pill`, `.theme-choice` scale to
  0.97–0.98 on `:active`; arrows translate 2px on hover. Touch users get
  feedback hover never gave them.
- **Invitation openings** — CSS transitions in `styles.css`, one mechanic
  per theme (`envelope | doors | curtain | book | box`), single easing
  above, one moving part at a time (the envelope sheet now starts 0.3s
  after the flap, inside the existing 1.4s `openMs`). Content sections
  after the opening do **not** get per-section reveals — by design,
  per principle 1.
- **Editor** — deliberately quiet: token transitions on inputs/choices,
  a 400ms fade when the preview remounts on theme change. No decorative
  animation anywhere near the form; editing stays immediate.

## Reduced motion

- CSS: existing global rules in `styles.css` collapse invitation
  transitions; `site.css` disables `.reveal`, floats, card entrances,
  nav-sheet and preview animations under the media query.
- JS: `openingDurationMs(openMs)` returns 150ms under reduced motion so
  the sealed cover does not hold the guest for the full opening timer
  (fixed this round — previously the timer ignored the preference).
- `CinematicInvite` and `ConfettiBurst` already short-circuit under
  reduced motion; that behaviour is unchanged.

## Stack decision (Phase Three of the mission)

**No animation library was added.** Evaluated:

| Candidate | Verdict | Reason |
|---|---|---|
| Motion (motion.dev) | Deferred | Excellent, MIT, React 19-ready — but every pattern the references actually use (entrances, staggers, hover/tap, filter transitions, openings) is delivered by the CSS token system above with zero bundle cost. Revisit if a shared-element/layout transition (e.g. gallery → preview morph) is ever specified. Installing it in this round would also have been unverifiable: vite/vitest/build were environment-blocked during the round (see the verification section of the round report), and this project does not ship unbuild-verified dependencies. |
| Motion Primitives | Not adopted as a dependency | It is a copy-in component set, not a runtime; the two patterns worth taking (stagger, text reveal) were implemented locally in `Reveal`/`.card-in`. |
| React Bits | Not adopted | Effect demos aimed at portfolio sites; the distinctive ones (WebGL/OGL backgrounds) fight the invitations, which are the product. |
| GSAP | Rejected for now | Justified only for pinned/scrubbed scroll timelines. No such sequence exists in the product; the one cinematic sequence (invitation intro) already runs on a single rAF clock in `CinematicInvite`. |

Existing animation-adjacent dependencies kept: `tw-animate-css` (shadcn
utility animations), `embla-carousel-react`, CSS keyframes. No dependency
was removed.
