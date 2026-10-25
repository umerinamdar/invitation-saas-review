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
