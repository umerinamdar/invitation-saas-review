# EasyInviteMaker SEO runbook — manually triggered, for Muse

**How this works:** no scheduler, no CI, no API key. You open Muse's workspace yourself and paste this file (or say "run the SEO runbook") whenever you want a cycle to happen. Muse reads the persisted state in `seo-ops/`, does the checks below, updates that state, and reports back. Because it's a real interactive session, billing is whatever your normal Muse usage already is — nothing separate to set up.

Repeat this as often as you like. There's no value lost by spacing runs out — see the note at the end on why daily-or-looser is actually *better* than tight/frequent here, not just cheaper.

---

## -1. Environment self-check (do this once, first run only — don't block on it, just be honest about it)

Before relying on any tool below, check and report plainly what your own workspace can actually do:

1. Can you execute shell commands / run a downloaded binary at all?
2. Can you download and run `OctopusOn` (Rust desktop apps + CLIs, see §0a) — install once, reuse across runs?
3. Is a Chrome/Edge/Chromium binary available (needed for OctopusOn's free SERP-checker browser mode, and for Playwright)?
4. Does installed state (the OctopusOn binaries, any config) persist between separate runs, or does every run start from a clean environment?
5. Do you have any native scheduler, or is every run strictly triggered by the owner opening you and asking?

**If the answer to any of 1–4 is no:** don't pretend otherwise — report it plainly in this run's output, do whatever subset of the checks below your environment actually supports, and say explicitly which tools you couldn't run and why. Partial, honest results beat a confident claim you can't back up. This isn't a blocker to starting — just be straight about what actually ran each time.

## 0a. Tools

- **OctopusOn SEO suite** (https://octopuson.com, Apache-2.0, free, local, v0.1.0 — new project, no track record yet, be appropriately careful with it): the five CLIs —
  - `octopuson-crawler` — technical crawl: broken links, redirects, metadata, explainable SEO score, JS rendering.
  - `octopuson-serp analyze "<query>" --engine google --country in --site easyinvitemaker.com` / `octopuson-serp track --due` — rank tracking. **Free mode opens a real browser window and does live, rate-limited (30s/query, 100/day) searches — it will NOT solve a CAPTCHA itself; if one appears, that check just fails for this run, note it and move on, don't retry aggressively.**
  - `seo-keyword-research` — keyword ideas, clustering, intent, mapped to existing pages.
  - `index-checker` — finds URLs search engines still index that the site no longer serves; generates redirect rules (never apply a redirect yourself without it going through the normal PR/allowlist process in §0).
  - `log-analyser` — real crawler traffic from server logs, if/when server logs are accessible to you; if they aren't, skip this one and say so.
- **Playwright** (already in this repo, `npm run test:e2e`) — browser rendering/functional checks.
- **Lighthouse** (`@lhci/cli`) — performance/Core Web Vitals.
- **Google Search Console** — property `easyinvitemaker.com`, verified, read access confirmed (§5). This is the one source of real first-party Google data; treat it as ground truth over anything OctopusOn's rank checker reports, since GSC is Google telling you directly, not inferred from a scraped result page.

Stick to the free tier of every tool above. Never add an OctopusOn API key, buy OctopusOn credits, or connect DataForSEO/Serper/SerpApi/Yandex paid APIs — the zero-cost constraint is absolute.

## 0. Standing context (same every run — don't re-derive it)

- **Product:** EasyInviteMaker — digital/animated wedding invitations, one-time paid publishing, live on Razorpay.
- **Audience:** Indian wedding customers; digital/animated invitations; WhatsApp-shared links; per-function invites (mehendi, haldi, sangeet, engagement, save-the-date).
- **Non-goals (do not do these, ever):** no link spam/paid links, no keyword stuffing, no mass near-duplicate pages, no fabricated ratings/testimonials/volumes, no indexing of private customer drafts or account pages, no touching checkout/auth/Supabase policy as "SEO work."
- **Hard allowlist for anything you change yourself:**
  - **Allowed, with a PR + CI green:** metadata/title/description fixes, alt text, broken internal links, sitemap entries (`src/lib/sitemap.ts`), safe config with tests.
  - **Never touch:** `supabase/migrations/`, `wrangler.json` / anything in `docs/ops/DEPLOYMENT.md`'s procedure, any file under `.github/workflows/` other than what Phase 0.5 already added.
  - **Never force-push, rebase, or amend** anything on `main` or on `claude/lovable-templates-20` (this repo is Lovable-connected; that branch syncs back to the Lovable editor).
  - Anything outside the allowlist → open a draft PR or issue with evidence. Do not merge it yourself.
- **Every PR you open must pass the existing CI** (`.github/workflows/ci.yml`: test, typecheck, build) before anyone merges it.

## 1. State you read first, every run

```
seo-ops/
  state/
    known-findings.json   — things already seen; don't re-report as new
    task-backlog.json     — things identified but not yet acted on
    last-run.json         — { date, whatRanLastTime, nextDue: { daily, weekly, monthly } }
```

If these files don't exist yet, this is run #1 — create them (empty/seed state) as part of this run instead of skipping straight to checks.

Read `last-run.json` first and decide which tier below is due:
- **Always do the quick tier.**
- Do the **deep tier** if it's been ≥1 day since the deep tier last ran (or never).
- Do the **strategy tier** if it's been ≥7 days since it last ran (or never).

This replaces "daily/weekly/monthly cron" with "whichever tiers are overdue when you happen to trigger a run" — if you only run this twice a week, the strategy tier will usually be due; if you run it daily, you'll naturally only hit the deep/strategy tiers on schedule.

## 2. Quick tier (every run)

- Hit the production site — homepage, `/templates`, one representative published invite link if you have one handy. All 200s?
- Re-check `public/robots.txt` and `src/lib/sitemap.ts` haven't drifted from the policy in §0 (private routes still disallowed, published `/i/` links still intentionally excluded from the sitemap itself).
- Diff against `known-findings.json` — anything genuinely new?
- If nothing new and the site's healthy: **say so and stop.** Don't manufacture a change to justify the run.

## 3. Deep tier (when due)

- `octopuson-crawler` against the current public URL inventory (test whether it actually sees server-rendered content on TanStack Start routes before trusting it blindly — some routes render client-side; fall back to Playwright for anything it misses).
- Playwright smoke pass on the core routes + a couple of breakpoints.
- Lighthouse on homepage, `/templates`, pricing/checkout-adjacent page, one template detail page — only if something actually changed since the last deep run.
- `index-checker` — anything indexed that the site no longer serves?
- Structured data / canonical / heading-hierarchy spot check on anything new.
- Pull the latest available GSC window (see §5 — needs the property confirmed first). Remember GSC data lags ~2–3 days; don't treat yesterday as complete.
- Update `known-findings.json` and `task-backlog.json`: dedupe against what's already there, add genuinely new items, mark resolved ones resolved.
- Pick **at most one** meaningful action: either open an allowlisted fix as a PR (with CI passing before you say it's done — verify the run, don't just report the intent), or write up a higher-risk finding as a draft PR/issue for a human decision, or explicitly conclude no action is justified this run.

## 4. Strategy tier (weekly-ish, whenever ≥7 days have passed)

- Compare the latest complete GSC window against the prior comparable window — impressions/clicks/position trends, pages losing visibility, high-impression/low-CTR queries. **This is the real signal — trust it over OctopusOn's scraped rank checks when they disagree.**
- `seo-keyword-research` for new keyword ideas and clustering, cross-checked against GSC's actual query data — don't act on keyword-tool suggestions GSC doesn't corroborate at all.
- `octopuson-serp track --due` for position history on your tracked keywords, as a supplementary trend line alongside GSC's average position — not a replacement for it.
- Revisit the topic hypotheses in the original plan (digital/animated invitations, Indian wedding templates, per-function invite pages) against what GSC actually shows, constrained by §6's ground truth (only wedding/engagement/reception/haldi/mehendi are real today) — promote what the data supports, drop what it doesn't.
- Look at real, publicly-visible competitor pages for coverage gaps — never scrape behind logins, never copy their text/design.
- Propose at most one content/structural improvement for the week, respecting the "prefer improving an existing page over adding a near-duplicate" rule. Default to *improving* over *publishing new* unless there's a clear, evidenced gap.
- Update `last-run.json` with this run's date and what tiers ran.

## 5. Open items

- **GSC property**: **resolved 2026-11-02.** Domain property `easyinvitemaker.com`, verified via DNS TXT record (Cloudflare), owner account `umerinamdar14@gmail.com`. Data takes ~1 day to start populating on a freshly verified property — don't expect real numbers in the Performance report immediately. Sitemap (`https://easyinvitemaker.com/sitemap.xml`) was submitted but didn't confirm as registered in the Sitemaps report after three attempts (likely just post-verification backend lag) — re-check and resubmit if it's still empty next run.
- **GA4**: not installed. Deliberately out of scope for now — don't add it as part of a routine run; it's a separate task with its own privacy review if/when the owner wants it.

## 6. Product capability ground truth (2026-11-02) — don't write a topic page for an occasion that isn't on this list

Only 6 of 36 theme files are in the active catalog today (`src/themes/index.ts`): Ram Mandir, Dubai Silk, Ivory Silk & Pearls, Golden Temple, Noor Invitation, Cathedral Light. Across those 6, the occasions actually covered are: **wedding, engagement, reception, haldi, mehendi.**

**Sangeet and save-the-date have zero active templates right now**, despite being on the original plan's topic-hypothesis list. Do not build or recommend a dedicated landing page for either until templates supporting them are actually turned on — that would be exactly the "thin/unsupported content" the plan's own non-goals forbid. Re-check this list each time it's been a while, since the catalog is being expanded theme-by-theme (see the comment block at the top of `src/themes/index.ts` for the current state).

## 6. Reporting back each run

End every run with a short note (to the owner, and appended as a dated file under `seo-ops/reports/`):
- Which tiers ran.
- What's new vs. what was already known.
- What you changed (PR links, CI status — confirmed green, not assumed) or explicitly chose not to change.
- What's next due, and anything you need from the owner to do more next time.

---

**Why "whenever you feel like it" beats "hourly," even manually:** GSC data itself only refreshes every 2–3 days, and the content-change policy caps new pages at roughly one per week. There is no SEO signal that rewards running this more than about once a day, and plenty of reason to run it less — each run should have something genuinely new to react to, or it's just noise. Trigger it when you think of it; the state files mean nothing is lost or re-discovered between runs.
