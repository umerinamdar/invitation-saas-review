# Opening-quality study: Ivory Silk & Pearls (owner's Lovable project)

**Date:** 2026-10-25. **Source:** the owner's own Lovable project
(`4b5fbdfc-c2af-4434-9b22-91b0b9648def`), read directly from its design
brief and edit history after the owner logged in and gave permission.
**Purpose:** this is the opening quality bar the owner confirmed is
right. The plan is to rework every other template one at a time to
this same *choreography* — not to copy Ivory Silk & Pearls' palette,
envelope-with-pearls design, or content onto other themes. Mechanic
and look stay distinct per theme; this document is about timing,
sequencing, and the text/background contrast technique only.

## The original design brief, opening section (verbatim)

> THE OPENING — the heart of this design, take the full time it needs:
> the closed cover is a still, precious hero. The whole opening lasts
> about 7000ms with ONE easing for everything,
> `cubic-bezier(0.42, 0, 0.58, 1)`, animating transform and opacity
> only — slow, steady, ceremonial, never snappy.
>
> **Beat 1 (0–2100ms):** the seal/medallion latch releases — a
> barely-there lift and a very slow fade to nothing; the "Tap to open"
> cue fades with it.
>
> **Beat 2 (starting ~1400ms, lasting ~5000–5600ms):** the main
> motion — moving slowly and continuously. **The card never moves** —
> only the cover pieces move around it.
>
> **Beat 3:** when the cover has fully cleared, the title TEXT
> (names, date, venue) fades in gently over the final 800ms — **the
> card and its frame are revealed first, the words appear last.**
>
> The cover root has a solid background colour from the very first
> paint (no flash of the page through it) and the cover artwork is
> preloaded.

This project's own mechanic (for reference only, not to be ported):
a wax-seal latch, then the top flap rotates on its top edge to about
`-172deg` (not a full 180 — stops just short, for depth), then the
side wings and bottom pocket fold outward together, uncovering a
stationary inner card.

## The three generalizable lessons

1. **Three-beat discipline, not one flat transform.** Every reveal
   mechanic in this engine (`src/components/reveals/index.tsx`)
   currently animates in one shot (~1.4–1.5s, everything moving and
   fading together, text included). The reference instead holds, then
   moves, then reveals text last — and the beats overlap deliberately
   (beat 2 starts while beat 1 is still fading, at ~1400ms). This
   structure is what reads as "ceremonial" rather than "quick."

2. **The content card is stationary during the cover's motion.** Only
   the cover (flap/doors/curtain/etc.) moves; the thing being revealed
   underneath does not translate, scale, or rotate until its own beat
   starts. (My current envelope mechanic violates this — the paper
   sheet itself lifts via `translateY(-65px)` *during* the flap's
   motion, not after.)

3. **Post-open "emerge into focus" transition.** After a later edit
   ("can you change transition please" → "Slow zoom blend"), the
   content doesn't just appear — it emerges from a soft blur at a
   slightly larger scale and settles to sharp/normal size while the
   backdrop behind it sharpens in sync. This engine's `CinematicInvite`
   component (in `invitation.tsx`) does a plainer version of "appear"
   today; it doesn't blur or zoom.

4. **Total duration is deliberately long: ~7000ms end to end**, vs.
   this engine's current ~1400–1500ms `openMs`. This is a pacing
   choice ("take the full time it needs"), not a bug to fix — a
   ceremonial open can and should feel unhurried, within reason for
   impatient guests (hence skip-on-second-tap, which this engine
   already has).

## Text/background contrast

No explicit technique was found written out in the brief text itself
(the Lovable chat/diff UI was not fully navigable for the raw CSS of
the later edits). What's confirmed from this engine's own existing
code, which already does something in the same spirit and should be
the shared baseline going forward rather than re-invented per theme:
`.family-block`'s semi-opaque scrim behind family-relation text, and
`invitation.tsx`'s `skyline-veil` dimming overlay under the hero
names. Treat "every theme must keep names/text readable over
whatever backdrop it has" as a standing rule to verify per theme
during rework, not a new system to build from scratch.

## What NOT to carry over

- The ivory/pearl/champagne-gold palette, the envelope-with-pearls
  art direction, the specific `-172deg` flap angle, the "Dubai
  interior" background experiment (a mid-build detour in that one
  project, not part of its real design) — none of this is meant to
  appear in other themes.
- The literal 7000ms number as a hardcoded constant — use it as a
  reference point for "how long is too fast," not a value every theme
  must hit exactly; different mechanics may warrant different pacing.

## Exact technical record (pulled from the live compiled build, 2026-10-25)

Read directly from the deployed preview's own CSS/JS
(`id-preview--4b5fbdfc-c2af-4434-9b22-91b0b9648def.lovable.app`), not
estimated from the brief. This is what beat 1/2/3 above actually compile
to — the real numbers, selectors and markup, for a faithful port.

**Shared easing (one var, used everywhere):**
`--ease-ceremony: cubic-bezier(.42, 0, .58, 1)`

**Cover markup** (`.cover-root`, a single clickable `role="button"`):
```html
<div class="cover-root" role="button" aria-label="Open the invitation">
  <div class="cover-underlay"></div>
  <div class="env-shadow"></div>
  <div class="env-piece env-bottom" style="background-image:url(envelope.jpg); clip-path:polygon(0 100%,50% 50%,100% 100%); transform-origin:50% 100%"></div>
  <div class="env-piece env-left"  style="background-image:url(envelope.jpg); clip-path:polygon(0 0,50% 50%,0 100%); transform-origin:0 50%"></div>
  <div class="env-piece env-right" style="background-image:url(envelope.jpg); clip-path:polygon(100% 0,100% 100%,50% 50%); transform-origin:100% 50%"></div>
  <div class="env-piece env-flap" style="transform-origin:50% 0; transform-style:preserve-3d; backface-visibility:visible">
    <div class="env-piece" style="background-image:url(envelope.jpg); clip-path:polygon(0 0,100% 0,50% 50%)"></div>
    <div class="env-lining" style="clip-path:polygon(0 100%,100% 100%,50% 50%)"></div>
  </div>
  <div class="env-seal"><span class="font-script text-3xl text-gold">C &amp; H</span></div>
  <p class="open-cue eyebrow">Tap to open</p>
</div>
```
One `envelope.jpg` texture is reused as the background-image for all
four flat pieces (bottom/left/right/flap-front), each cropped to its
own triangle via `clip-path` — the "envelope" is one photo cut into 4
pieces + a plain-color lining, not 4 separate images. `env-shadow` is
a `linear-gradient(180deg, foreground, transparent 65%)` dark wash,
not an image.

**Cover CSS, exact timings (all share `--ease-ceremony`, "both" fill mode):**
| Element | Property | Duration | Delay | Ends at |
|---|---|---|---|---|
| `.env-seal`, `.open-cue` | opacity+transform (lift, `translateY(-6px) scale(1.02)`→0) | 2.1s | 0 | 2.1s |
| `.cover-underlay` | opacity → 0 | 1.2s | 1.4s | 2.6s |
| `.env-flap` | `rotateX(-172deg)` (transform) | 5s | 1.4s | 6.4s |
| `.env-flap` | opacity → 0 | 1s | 5.4s | 6.4s |
| `.env-shadow` | `shadow-sweep` keyframe (opacity 0→.6→0, translateY -30%→40%) | 5s | 1.4s | 6.4s |
| `.env-left` | `rotateY(115deg)` + opacity → 0 | 2.8s | 3.4s | 6.2s |
| `.env-right` | `rotateY(-115deg)` + opacity → 0 | 2.8s | 3.4s | 6.2s |
| `.env-bottom` | `rotateX(115deg)` + opacity → 0 | 2.8s | 3.4s | 6.2s |

So: seal lifts and fades first (0–2.1s) → underlay clears (1.4–2.6s)
→ flap swings back almost flat, -172deg not -180 (1.4–6.4s, the
longest single motion) → the three remaining flaps (left/right/bottom)
fold away together starting mid-flap-swing (3.4–6.2s). The flap is the
last cover piece visually gone, at 6.4s. **The content card itself has
no CSS in any of this — it does not exist in the DOM until the cover's
click handler swaps it in**, which is what the study's lesson #2
("card never moves") actually means at the markup level: it isn't
restrained from moving, it simply isn't mounted yet.

**Post-open ("emerge into focus"), applied once `.invitation-revealed` is added:**
| Selector | Animation | Duration |
|---|---|---|
| `.backdrop-focus` (the interior/venue photo) | `backdrop-focus`: `blur(18px) scale(1.08)` → `blur(0) scale(1)` | 3.6s |
| `.invitation-revealed:not(.invitation-instant)` (the whole card) | `slow-zoom-blend`: `opacity:0, blur(8px), scale(.92)` → (55%) `opacity:1` → `opacity:1, blur(0), scale(1)` | 3.6s |
| `.invitation-revealed .title-text > *` (each name/date/venue line) | `invitation-detail`: `opacity:0, translateY(16px)` → `opacity:1, translateY(0)` | 1.4s each |

No explicit stagger value was found between the `title-text` children
(likely sequenced by React mount order / CSS `animation-delay` set
inline per child rather than in the stylesheet) — a faithful port
should re-check this on the actual rendered page rather than assume
a number.

**A mismatch found in the reference project itself (do not copy this
part):** the "interior/venue" backdrop image is literally named
`dubai-interior-*.jpg` — a Dubai skyline photo — while the card's own
text reads "Villa del Balbianello, Lake Como, Italy." This is the
"Dubai interior experiment" already flagged above as a stray detour;
confirmed now at the asset level, not just from the brief. A faithful
port needs its own correctly-matched backdrop image, not this one.

## Plan

Rework templates one at a time (see `src/themes/index.ts` for the
current catalog state — only Dubai Silk is active while this is
underway). Each rework should: restructure its mechanic's CSS in
`src/styles.css` / `src/components/reveals/index.tsx` into the
hold → move (card stationary) → text-last beats, add the blur/zoom
settle to its post-open moment, and get the owner's playback approval
before moving to the next theme — the standing rule already written
in `docs/motion-system.md` applies here too: **openings are judged on
playback, never on code or stills.**
