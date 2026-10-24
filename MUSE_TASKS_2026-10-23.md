# Muse task — 2026-10-23

## Context

A production bug was just found and fixed: `public/themes/dubai-silk/skyline.jpg`
was actually PNG data saved with a `.jpg` extension, making it 2MB instead of a
few hundred KB. On a slow connection that was enough to blow past the 12s
preview-art-load deadline in `src/components/invitation.tsx`, showing
"Invitation artwork couldn't load." to real visitors. It's already fixed
(re-encoded as a real JPEG, committed, deployed) — this task is to stop the
*class* of bug from recurring.

## Rules (same as every other task handed to you on this repo)

- Branch only. Open a PR against `main`. Do not push to `main` directly.
- No live infra changes (Supabase, Cloudflare, Resend, YouPI). This is a
  pure code/test task.
- No mass reformatting of unrelated files.
- Keep the PR scoped to exactly this task.

## Task: asset sanity guard for `public/`

Add an automated check (a vitest test is simplest, since the suite already
runs in CI) that fails when:

1. **Format/extension mismatch** — any file under `public/` with a
   `.jpg`/`.jpeg` extension whose actual content isn't JPEG, or a `.png`
   extension whose actual content isn't PNG. Sniff the real format from the
   file's magic bytes (don't shell out to `file`; read the first few bytes
   in Node and check the standard JPEG/PNG signatures) so it works in CI
   without relying on a system binary being present.
2. **Size budget** — flag (fail) any image over a reasonable ceiling, e.g.
   600KB for `public/themes/**/*.{jpg,jpeg,png}` (the real skyline.jpg is
   now ~480KB at 1264×848, so that's a fair ceiling with headroom — don't
   set it so tight the test becomes flaky busywork), and audio over 2MB
   for `public/themes/**/*.mp3`. If a specific existing file legitimately
   needs to be bigger, that's fine — add a narrow, explicit allowlist
   (by exact path, with a one-line comment saying why) rather than loosening
   the general ceiling.

Keep it to one new test file (e.g. `src/test/asset-budget.test.ts`). It
should need no network access and run fast (it's just stat + reading a few
header bytes per file, not decoding full images).

## Done means

- `npx vitest run` passes, including the new test.
- The new test actually fails on a deliberately mislabeled/oversized fixture
  while you're writing it (prove it catches the bug class), then passes
  again once you revert the fixture — show this in the PR description, not
  just asserted in prose.
- PR opened against `main` with a short description of what the test checks
  and why (link back to this file's context section).
