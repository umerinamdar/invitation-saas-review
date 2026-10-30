/**
 * Central motion system — one place for durations, easings and the
 * reduced-motion rule, shared by the marketing site, the gallery and
 * the editor chrome. The invitation engine itself stays CSS-driven
 * (see docs/motion-system.md for why), but it uses the same easing
 * and duration tokens defined here and mirrored in site.css /
 * styles.css as CSS custom properties.
 *
 * Design rules (from the reference audit, docs/reference-animation-audit.md):
 * - One orchestrated entrance per view, not scattered effects.
 * - Motion answers an action (open, filter, select) or guides the eye
 *   once on first view. Nothing loops except the single hero float.
 * - Transform and opacity only. Never animate layout properties.
 * - `prefers-reduced-motion: reduce` collapses every duration to an
 *   instant state change — content is never hidden behind an animation
 *   a guest has opted out of.
 */

export const MOTION = {
  /** Press / hover feedback. */
  instant: 120,
  /** Pills, links, small state changes. */
  fast: 180,
  /** Default component transition. */
  base: 240,
  /** Panels, cards, dialogs. */
  slow: 400,
  /** Scroll reveals and section entrances. */
  slower: 700,
  /**
   * Invitation openings. The mechanic itself runs 1.4–1.7s per theme
   * (`theme.motion.openMs`); this token is the CSS transition duration
   * the reveal mechanics in styles.css share, kept in step with the
   * slowest openMs so no mechanic finishes early and sits static.
   */
  opening: 1700,
} as const;

/**
 * The two easings the whole product uses. Everything else found in the
 * old CSS (six different cubic-beziers across site.css/styles.css) is
 * being migrated to these two:
 *
 * - `out` — entrances and reveals: starts moving, settles gently.
 * - `inOut` — openings and two-way state changes: slow start AND slow
 *   end. This is the easing the user playback-verified as "slow,
 *   steady, smooth" on the envelope work (2026-10-23); front-loaded
 *   easings made a 1.5s door read as ~0.3s, which is why openings felt
 *   abrupt even at correct durations.
 */
export const EASE = {
  out: "cubic-bezier(0.22, 1, 0.36, 1)",
  inOut: "cubic-bezier(0.42, 0, 0.58, 1)",
} as const;

/** Stagger step for grouped entrances (hero pieces, gallery cards). */
export const STAGGER_MS = 70;

/**
 * Noor Invitation's opening timeline, converted exactly from the
 * owner's Lovable project "Noor Invitation" (054990d9) and its
 * opening-timeline.ts (same constants, same milestone arithmetic).
 * The keepsake book is sealed, holds 1.2s
 * after TAP TO OPEN, swings open horizontally over 4.5s into a flat
 * two-page spread, then a 1.0s warm flash bursts from the centre on
 * its own, then the Ar-Rum 30:21 quote sits readable on the spread
 * for 5.2s, then a 1.0s fade carries the guest into the courtyard
 * welcome. Total 12.9s — the theme's openMs must equal removeAt, so
 * the parent's unmount timer fires exactly as the fade completes.
 * Flash and quote are separate phases, never rendered together.
 */
export const NOOR_OPENING = {
  /** Hold on the sealed cover after TAP TO OPEN. */
  hold: 1200,
  /** The horizontal book swing into the flat spread. */
  swing: 4500,
  /** The warm light burst from the centre of the open book. */
  flash: 1000,
  /** How long the quote sits readable on the spread. */
  quote: 5200,
  /** Fade from the spread into the courtyard welcome. */
  exit: 1000,
} as const;

export type NoorOpeningPhase =
  "sealed" | "opening" | "flash" | "quote" | "settled";

export function noorOpeningMilestones(reduced = false) {
  const flashAt = reduced ? 0 : NOOR_OPENING.hold + NOOR_OPENING.swing;
  const quoteAt = reduced ? 100 : flashAt + NOOR_OPENING.flash;
  const welcomeAt = quoteAt + NOOR_OPENING.quote;
  return {
    flashAt,
    quoteAt,
    welcomeAt,
    removeAt: welcomeAt + (reduced ? 50 : NOOR_OPENING.exit),
  };
}

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * How long an invitation opening should actually take for this guest.
 * Reduced-motion guests get the state change almost immediately —
 * the CSS already collapses the visual transition for them, so the
 * JS timer must not keep them waiting on a sealed cover either.
 */
export function openingDurationMs(openMs: number): number {
  return prefersReducedMotion() ? 150 : openMs;
}
