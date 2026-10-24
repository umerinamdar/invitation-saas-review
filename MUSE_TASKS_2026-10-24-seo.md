# Muse task brief — SEO/perf cleanup batch

**Date:** 2026-10-24 · **Repo:** `umerinamdar/invitation-saas-review` · **Base:** `main` (currently `0850be8`)
**Branch to create:** `muse-seo-batch-2026-10-24` off `main`. Never push to `main` directly — open a PR when done.

## Context

This is EasyInviteMaker, a wedding-invitation SaaS (TanStack Start + Vite + Cloudflare Workers + Supabase). The owner ran an SEO/launch-readiness audit against a generic 20-item checklist. Most items already exist (SSR, robots.txt, sitemap.xml, per-route titles/descriptions, 404 page, alt text, internal links, privacy policy). This batch covers the real, scoped gaps — additive markup/asset work only, nothing that touches payments, auth, or data.

**Rules (standing, same as prior batches):**
- Branch-only work. Never push to `main` directly. No force pushes, no history rewrites — this repo is Lovable-connected and a rewrite breaks their sync.
- No payment-code changes, no migrations, no `.env` changes, no secrets in code or chat.
- Before pushing: `npx vitest run` must stay green (currently 513/513), `npx tsc --noEmit` must be 0 errors, `npm run build` must stay green, and `npx eslint .` must not introduce new errors beyond the current baseline (currently 252 problems — compare file-by-file against pre-change state for any file you touch, the way prior verification reports have).
- Open a PR against `main` when done, with the gate numbers in the PR description.

## Tasks

### 1. Canonical tags
Every route already computes `OG_URL` via `absoluteUrl(path)` from `src/config/site.ts` and conditionally adds `og:url` only when `VITE_SITE_URL` is set (see `src/routes/index.tsx` for the pattern). Mirror that exact pattern to add `<link rel="canonical" href={OG_URL} />` to every route's `head()` `links` array, same null-guard (never emit a canonical pointing at a guessed/localhost URL). Do this for every route file under `src/routes/` that defines its own `head()`.

### 2. Open Graph image
No `og:image` or `twitter:image` exists anywhere today. Add one default site-wide OG image:
- Create a single static 1200×630 OG image (reuse/compose from existing brand assets already in `public/` — do not invent new brand art from scratch; keep it simple, e.g. the wordmark + a tagline on the existing background texture used elsewhere on the site).
- Save it as `public/og-default.jpg` (or `.png`), reasonable file size (<300KB).
- Add `og:image` and `twitter:image` meta tags in `src/routes/__root.tsx`'s `head()`, using `absoluteUrl()` so it's a full URL, with the same null-guard pattern as `og:url`.
- Per-route overrides are a nice-to-have, not required — the site-wide default is the actual gap.

### 3. Organization JSON-LD schema
Add a single `application/ld+json` `<script>` in `src/routes/__root.tsx`'s `head()` (TanStack Router's `head()` supports arbitrary `scripts` entries — check the API; if it doesn't support a script tag directly, render it in `RootComponent`'s `<head>`-adjacent output instead, wherever `HeadContent`/`Scripts` are rendered). Minimal `Organization` schema: name, url (via `absoluteUrl("/")`, guarded), logo (point at `/favicon.svg` or a proper logo asset if one exists), and `sameAs` omitted if no social profiles exist (don't invent any).

### 4. WebP images (scoped — do not touch all 56 images)
Convert only the images that matter for performance/LCP: the hero/demo images actually used on `/`, `/templates`, and the theme preview thumbnails (check `src/themes/*.ts` for which image paths are referenced by the marketing pages — not every theme asset, just what renders above the fold or in the gallery grid). For each:
- Generate a `.webp` version alongside the existing `.jpg`/`.png` (same directory, same basename, `.webp` extension) — use `sips` or an equivalent lossless-enough conversion, verify visually it matches.
- Update the `<img>` to a `<picture>` element with a `<source type="image/webp">` + the original `<img>` as fallback, OR confirm the project already has an image component that supports this pattern (check `src/components/invitation.tsx` and `src/components/site/theme-card.tsx` for how images are currently rendered) and extend that instead of hand-rolling `<picture>` everywhere.
- Do not touch audio files, document icons, or anything not visually above-the-fold/gallery-grid.

### 5. Lazy loading pass
Only 4 images currently have `loading="lazy"`. Audit all `<img>` tags across `src/routes` and `src/components` (excluding `src/components/invitation.tsx`'s hero/LCP images, which intentionally use `fetchPriority="high"` instead — do not change those) and add `loading="lazy"` to any below-the-fold image missing it (e.g. theme gallery cards beyond the first few, footer images if any).

### 6. Missing meta description
`src/routes/contact.tsx` has a title but no `description` meta. Add one (one sentence, matches the page's actual content — don't invent marketing copy, just describe what's on the page).

## Verification Muse must do before opening the PR

- Run the full gate suite (vitest, tsc, build, eslint) and report the four numbers.
- Visually confirm (screenshot or describe) that the OG image renders correctly by checking the actual meta tag output (e.g. via a social-share debugger or by reading the rendered HTML `<head>`) — not just that the file exists.
- Confirm the JSON-LD validates (no syntax errors) — e.g. paste it through a JSON validator or `JSON.parse()` check in a quick script.
- Confirm WebP files are visually identical to their JPG originals at a glance (no visible quality loss) and that the `<picture>` fallback still works for browsers that don't support WebP (i.e. the `<img>` fallback src is correct).

## Explicitly out of scope for this batch (owner will handle separately)

- Google Analytics / Search Console verification — needs the owner's own GA property ID / verification code.
- A real working contact form (currently just a `mailto:` link) — needs an email-sending service decision first.
- 301 redirects — no legacy URL structure exists yet to redirect from; nothing to do here.
- Breadcrumbs — the UI component exists unused; not applicable to this single-funnel site, skip it.
- Error tracking, CI/CD, monitoring, notifications — real infrastructure decisions, not overnight code tasks.
