# Theme Quality Audit — DRAFT

> **Status:** Draft audit, read-only. No theme code was changed for this document.
> **Date:** 2026-10-23 · **Scope:** All 14 themes in `src/themes/*.ts`, the shared
> contract in `src/themes/types.ts`, the reveal engine in
> `src/components/reveals/index.tsx` + `src/styles.css`, the cinematic intro in
> `src/components/cinematic-invite.tsx` / `src/components/invitation.tsx`, and
> on-disk assets under `public/themes/<id>/`.
> **Contrast method:** WCAG 2.1 ratios. Where a figure comes from the existing,
> owner-reviewed `docs/ops/A11Y-CONTRAST-PROPOSALS.md` (which reproduces
> `src/test/a11y.test.tsx`'s colour math exactly) it is quoted as-is. New
> foreground/background figures in §3 were computed with the same
> luminance formula from the hex palettes. OKLCH themes (Dubai Silk,
> Phulkari Anand, Monochrome Vow) are summarised from that document's
> converted values.
> **Premium benchmark (from TheDigitalYes research):** envelope opening
> ≈ 3.5–4 s *total*, doors ≈ 2–3.5 s, **one** easing curve per opening,
> invitation text fades in **last**, after the physical gesture completes.

---

## 1. Master table — all 14 themes

Catalog order (gallery order, per `src/themes/index.ts`): Dubai Silk leads as
flagship/default/fallback (`DEFAULT_THEME_ID`, `getTheme()` falls back to it),
then Hindu, Muslim, Sikh, Christian groups, then uncategorised.

**Asset key:** S = `sealedBackdrop`, R = `revealedBackdrop`,
Se = `sectionBackdrop`, P = `paperTexture`, M = `defaultMusic`.
✓ = own file in `public/themes/<id>/` · (b) = borrowed from another theme's
folder · — = absent.

| # | id / name (tier · tradition · religion) | Reveal | openMs | intro s | Ornament. | Serif / Sans | Assets S·R·Se·P·M | Contrast risk (see §3) | Kicker / tagline quality |
|---|---|---|---|---|---|---|---|---|---|
| 1 | `dubai-silk` — Dubai Silk (royal · traditional · —) | envelope | 1400 | 6 | none | Cormorant Garamond / Montserrat | ✓·✓·✓·✓·**✓ (only music in catalog)** | PASS — muted 7.04, accent 3.45 (worst occurring pairs) | Kicker `SILK ENVELOPE` — mechanic label, not occasion. Tagline **strong**: specific (powder-blue, skyline, wax seal, scratch muhurat), but long / feature-stuffed. |
| 2 | `ram-mandir` — Ayodhya Ram Mandir (royal · traditional · hindu) | box | 1500 | 6 | none | Cormorant Garamond / Jost | ✓·✓·✓·(b) Kesari·— | **MUTED FAIL** 4.10 on paper (needs 4.5); accent 4.45 pass; fg-on-dark-bg 1.09 = non-occurring pair, see §3 | Kicker `TEMPLE CASKET` — place + mechanic, good. Tagline good: shikharas, golden hour, marigold all named. Scratch title `The muhurat` (shared ×3). |
| 3 | `kesari-mandap` — Kesari Mandap (royal · traditional · hindu) | book | 1600 | 6 | none | Cormorant Garamond / Jost | ✓·✓·✓·✓·— | PASS on occurring pairs — muted 5.05, accent 6.54; latent fg/bg 1.08 | Kicker `FOLDED CARD` — **duplicated ×3**, pure mechanic. Tagline good (mandap, garlands, brass lamps), near-twin of Ram Mandir's structure. |
| 4 | `kanjeevaram` — Kanjeevaram (royal · traditional · hindu) | curtain | 1700 | 6 | none | Cormorant Garamond / Jost | ✓·✓·✓·✓·— | PASS, best dark-theme margins — muted-on-surface 7.65, accent-on-surface 6.46, fg/bg 16.15 (true dark theme, pair occurs) | Kicker `SILK DRAPES` — mechanic, but at least material-specific. Tagline **strong**: zari, temple courtyard at dawn, brass lamps. Only `rose` petals in catalog. Scratch title `The auspicious day` — unique, good. |
| 5 | `madina` — Madina (royal · traditional · muslim) | envelope | 1400 | 6 | none | Cormorant Garamond / Jost | ✓·✓·✓·(b) Cathedral·— | **MUTED FAIL (marginal)** 4.37 on paper; accent 5.65 pass | Kicker `MARBLE ENVELOPE` — material + mechanic, decent. Tagline good but generic closer ("dignified and serene"). Scratch title collapses to `The day` (shared ×5). |
| 6 | `makkah` — Makkah (royal · traditional · muslim) | book | 1500 | 6 | none | Cormorant Garamond / Jost | ✓·✓·✓·(b) Cathedral·— | PASS, thin accent margin — muted 5.02, accent 3.08 (0.08 over the 3.0 bar) | Kicker `FOLDED CARD` — duplicated ×3. Tagline **weakest of the landmark pair**: no distinguishing detail beyond "grand courtyard arches… golden hour", reads as Madina with nouns swapped. Scratch title `The day` ×5. |
| 7 | `golden-temple` — Golden Temple (royal · traditional · sikh) | box | 1500 | 6 | none | Cormorant Garamond / Jost | ✓·✓·✓·(b) Phulkari·— | **MUTED FAIL (marginal)** 4.44 on paper; **ACCENT FAIL** 2.77 on paper | Kicker `KEEPSAKE BOX` — duplicated ×2, generic (says nothing Sikh / Amritsar). Tagline good: Harmandir Sahib, Amrit Sarovar reflection, dusk — specific and visual. Scratch title `The day` ×5. |
| 8 | `phulkari-anand` — Phulkari Anand (**classic** · traditional · sikh) | doors | 1600 | 5 | none | Cormorant Garamond / Inter | ✓·✓·✓·✓·— | **MUTED FAIL (marginal)** 4.46 on paper; **ACCENT FAIL** 2.61 on paper (2nd-worst accent) | Kicker `ANAND KARAJ` — **best kicker in catalog**: names the ceremony, not the mechanic. Tagline good, leans on market claim in source comment, copy itself is specific (phulkari thread work, programme). Scratch title `The day of our Anand Karaj` — longest, most personal, good. |
| 9 | `vesper-chapel` — Vesper Chapel (royal · traditional · christian) | box | 1500 | 6 | none | Cormorant Garamond / Jost | ✓·✓·✓·(b) Cathedral·— | PASS on occurring pairs — muted 4.67, accent 4.77; **but** needs `namesColor: #f3e6c8` override or names vanish on the nave photo (only names override in catalog) | Kicker `KEEPSAKE BOX` — duplicated ×2. Tagline good (candlelit Gothic nave, altar). Scratch title `The day` ×5. The override is documented in-code — evidence the base palette fails on its own hero. |
| 10 | `cathedral-light` — Cathedral Light (royal · traditional · christian) | doors | 1600 | 6 | none | Cormorant Garamond / Jost | ✓·✓·✓·✓·— | **WORST IN CATALOG — MUTED FAIL 3.62 on paper AND ACCENT FAIL 2.45 on paper.** fg/bg 11.49 itself passes (light background) | Kicker `CARVED OAK DOORS` — specific, good. Tagline good (rose window, candles). Scratch title `The day` ×5. Also the **lender theme**: its `paper.jpg` serves Madina, Makkah and Vesper too. |
| 11 | `mughal-zamarrud` — Mughal Zamarrud (royal · traditional · —, occasions incl. nikah) | envelope | 1500 | 6 | none | Cormorant Garamond / Jost | ✓·✓·✓·✓·— | PASS — muted-on-surface 6.00, accent-on-surface 5.20, fg/bg 13.47 (true dark theme) | Kicker `EMERALD ENVELOPE` — colour + mechanic, decent. Tagline **strong** (marble water garden, lanterns, diyas). Only theme whose 4th feature is `Live Countdown` instead of a petal shower. Scratch title `The appointed day` — unique, formal, fits. Header comment contradicts itself: says "opening on carved doors", mechanic is `envelope` — stale doc. |
| 12 | `sarayu-ghat` — Sarayu Ghat (royal · traditional · —) | book | 1500 | 6 | none | Cormorant Garamond / Jost | ✓·✓·✓·✓·— | PASS on occurring pairs — muted-on-paper 4.90, accent 3.68; worst latent muted-on-dark-bg 2.40 in catalog (non-occurring) | Kicker `FOLDED CARD` — duplicated ×3. Tagline good (riverside ghat, floating diyas). Otherwise the most interchangeable Hindu gold theme: same fonts, same scratch title `The muhurat`, same petals as Ram/Kesari. |
| 13 | `mayura-mahal` — Mayura Mahal (royal · traditional · —) | curtain | 1700 | 6 | none | Cormorant Garamond / Jost | ✓·✓·✓·✓·— | **MUTED FAIL 4.08 on paperLight** (dark teal panel; fix direction is *lighten*); accent-on-paperLight 3.84 pass; fg/bg 14.74 pass. Needs `familyColor: #e6cf9a` override (only family override in catalog) because `paper`/`paperLight` are themselves dark teal | Kicker `VELVET DRAPES` — mechanic. Tagline **strong** (peacock teal, lotus pools, full moon). Scratch title `The evening` — unique, fits sangeet/reception occasions. Dark-`paper` values break the type's "envelope body" assumption — see §4. |
| 14 | `monochrome-vow` — Monochrome Vow (**classic** · **modern** · —) | curtain | 1700 | 5 | none | **Playfair Display / Inter (only non-Cormorant serif)** | ✓·✓·✓·✓·— | PASS — muted-on-paper 4.77, accent-on-paper 6.74, fg on light bg high | Kicker `MODERN MINIMAL` — **only kicker that sells a taste position**, not a mechanic. Tagline **best in catalog**: "for couples who find gold too much" — the only tagline with a point of view / an audience. Ornament glyph is `—` (a dash). Scratch title `The date` — plain, on-brand. Header says "opening on velvet drapes" but palette/art is ivory-graphite deco — "velvet" is copy drift from Mayura. |

### Cross-cutting constants (identical in all 14 — differentiation that isn't)

| Field | Value in 14/14 (or near) |
|---|---|
| `ornamentation` | `"none"` — **14/14**. The type offers `jali · deco · geometric · botanical · mandala · paisley · temple`; none is used by any shipping theme. |
| `musicFadeMs` | `8000` — 14/14 |
| `scratchThreshold` | `0.38` — 14/14 |
| `copy.scratchHint` | `"Scratch to reveal"` — 14/14, verbatim |
| `maxVolume` | `0.6` ×11, `0.55` ×3 (Phulkari, Cathedral, Monochrome) |
| `petals` | `white-blossom` ×7, `marigold` ×6, `rose` ×1 (Kanjeevaram only), `none` ×0 |
| `tier` | `royal` ×12, `classic` ×2 (Phulkari, Monochrome) — no visible quality/features gap justifies the split in the data |
| Serif | Cormorant Garamond ×13, Playfair Display ×1 |
| Sans | Jost ×11, Inter ×2, Montserrat ×1 (flagship only) |

---

## 2. Grouping

### 2a. By reveal mechanic — nominally even, experientially uneven

| Mechanic | Count | Themes | CSS duration / easing (`src/styles.css`) | `openMs` range in data |
|---|---|---|---|---|
| `envelope` | 3 | Dubai Silk, Madina, Mughal Zamarrud | 1.4 s · `cubic-bezier(0.22, 0.61, 0.36, 1)` | 1400–1500 |
| `doors` | 2 | Phulkari Anand, Cathedral Light | 1.4 s · `cubic-bezier(0.4, 0, 0.2, 1)` | 1600 |
| `curtain` | 3 | Kanjeevaram, Mayura Mahal, Monochrome Vow | 1.5 s · `cubic-bezier(0.5, 0, 0.25, 1)` | 1700 |
| `book` | 3 | Kesari Mandap, Makkah, Sarayu Ghat | 1.5 s · `cubic-bezier(0.38, 0, 0.2, 1)` | 1500–1600 |
| `box` | 3 | Ram Mandir, Golden Temple, Vesper Chapel | 1.5 s · `cubic-bezier(0.33, 0, 0.2, 1)` + opacity 1.5 s | 1500 |

Findings:

- The 3/2/3/3/3 spread is deliberate (Kesari's header comment says its mechanic
  was moved from `doors` to `book` "so the catalog's five opening mechanics
  spread evenly") — but **count-even is not experience-even**. Doors, curtain
  and book are all, gesturally, "painted halves/a cover part sideways";
  envelope (flap + rising sheet) and box (lid lifts *up* and fades) are the
  only two that read as a different *verb*. This is the same failure mode the
  user rejected in the standalone templates-10 set: different art, same door.
- **`openMs` does not drive the animation.** The CSS transition durations are
  hard-coded per mechanic (1.4 s / 1.5 s); `openMs` is only the `setTimeout`
  in `invitation.tsx` after which the sealed stage unmounts. So curtain
  themes declare `openMs: 1700` against a 1.5 s CSS motion (200 ms of dead
  time at the end), doors declare 1600 against 1.4 s, and Mughal's envelope
  declares 1500 against 1.4 s. There are **two sources of truth for one
  duration**, and they already disagree in 9/14 themes.
- **Five different easing curves for five mechanics** — directly against the
  benchmark's single-easing finding. Nothing in the data model can express
  easing at all: `Motion` has no easing field, so consistency cannot be fixed
  per-theme; it is an engine decision.
- Envelope is structurally different in code, not just motion:
  `EnvelopeReveal` ignores the `backdrop` prop entirely (the sealed painting
  is a separate `<img>` *behind* a CSS envelope), while doors/curtain/book/box
  split or cover the painting itself (`paintedOpening()` in
  `invitation.tsx`). Envelope themes therefore open a *drawn object on* the
  art; the other 11 open *the art itself*. Guests comparing themes will feel
  this as a quality step, not a style choice.

### 2b. Asset-rich vs asset-poor

Every theme has S + R + Se — the three-photo backbone is complete, 14/14.
That is a genuine strength; no theme falls back to the drawn
`PatternBackdrop` or the flat-surface section fallback described in `types.ts`.

| Group | Themes | On disk | Notes |
|---|---|---|---|
| **Asset-rich (only one)** | Dubai Silk | 5 own files, 3.1 MB total incl. `track.mp3` (452 KB) | Only theme with `defaultMusic`. Also the catalog's weight outlier: `skyline.jpg` (the *revealed* hero **and** thumbnail) is **2.0 MB** — ~7× every other hero (214–300 KB). The flagship is the slowest first paint. |
| **Asset-complete** | Cathedral Light, Kanjeevaram, Kesari Mandap, Mayura Mahal, Monochrome Vow, Mughal Zamarrud, Phulkari Anand, Sarayu Ghat (8) | 4 own files each (S·R·Se·P), 824 KB–1.1 MB | Self-sufficient. Cathedral and Phulkari additionally *lend* their paper to other themes. |
| **Asset-poor (borrowed paper)** | Ram Mandir (← Kesari), Madina (← Cathedral), Makkah (← Cathedral), Golden Temple (← Phulkari), Vesper Chapel (← Cathedral) (5) | 3 own files each, 704–768 KB — no `paper.jpg` in their own folders | Borrowing is documented in-code and palette-plausible, but it means: (a) envelope/scratch grain is another theme's texture, (b) re-encoding or replacing the lender's paper silently changes 2–4 themes, (c) Cathedral Light's single `paper.jpg` is load-bearing for **4 themes**. No test pins these cross-theme paths. |
| **Music-poor (by design)** | All except Dubai Silk (13) | — | `types.ts` is explicit: a theme ships silent until it has a track with its own commercial rights. Correct policy — but the *guest-facing* result is that 13/14 invitations have no default music while Dubai Silk's gallery copy leads with it, and `musicFadeMs`/`maxVolume` are configured in all 14 for an asset 13 don't have. |

Other asset notes:

- Thumbnail = `hero.jpg` for 13 themes; Dubai Silk's thumbnail is its 2.0 MB
  `skyline.jpg`. If the gallery loads thumbnails at full size, the flagship
  card alone costs more than two entire other themes.
- Hero/sealed/section files are otherwise tightly sized (138–362 KB) — the
  asset-guard work held. Dubai Silk is the exception, not the pattern.
- No theme supplies a portrait/mobile-specific crop of any backdrop; all
  heroes are referenced at 1536×1024 landscape in `invitation.tsx` and are
  cropped by CSS on portrait phones, where names sit over the busiest part
  of the painting (see Vesper's `namesColor` workaround).

---

## 3. Palette contrast — the pairing model matters

A naive "foreground on background" check produces alarming ~1.0–1.3 ratios
for 7 themes. **Most of those pairs never occur.** In this codebase
`background` is, for the Hindu/Muslim/Sikh/Vesper/Sarayu themes, a *dark page
surround* behind the sealed stage, while `foreground` is dark text painted on
the light `surface`/`paper` after opening. The ratios are still recorded
below — they are a *latent* risk (any future component that paints
`foreground` on `background`, e.g. a toast, footer or error state on the
surround, will be unreadable) — but the operative risks are the occurring
pairs: foreground-on-surface, muted-on-paper/paperLight/surface, and
accent-on-paper (per the pairing model in
`docs/ops/A11Y-CONTRAST-PROPOSALS.md` §Method).

| Theme | fg / bg (latent unless ★) | fg / surface (occurring) | muted — worst occurring | accent — worst occurring | Verdict |
|---|---|---|---|---|---|
| Dubai Silk ★ (light bg) | high (≈13+, OKLCH est.) | high | 7.04 ✓ | 3.45 ✓ | PASS |
| Ram Mandir | 1.09 | 13.93 | **4.10 ✗** (paper) | 4.45 ✓ | MUTED FAIL |
| Kesari Mandap | 1.08 | 14.94 | 5.05 ✓ | 6.54 ✓ | PASS |
| Kanjeevaram ★ (true dark) | 16.15 | 13.46 | 7.65 ✓ (surface) | 6.46 ✓ (surface) | PASS — strongest dark theme |
| Madina | 1.25 | 11.69 | **4.37 ✗** (paper) | 5.65 ✓ | MUTED FAIL (marginal) |
| Makkah | 1.31 | 12.03 | 5.02 ✓ | 3.08 ✓ (barely) | PASS — thin accent margin |
| Golden Temple | 1.27 | 11.90 | **4.44 ✗** (paper) | **2.77 ✗** (paper) | BOTH FAIL (marginal) |
| Phulkari Anand ★ (light bg) | high (OKLCH est.) | high | **4.46 ✗** (paper) | **2.61 ✗** (paper) | BOTH FAIL (marginal) |
| Vesper Chapel | 1.31 | 12.45 | 4.67 ✓ | 4.77 ✓ | PASS (flat pairs) — photo-pair fails, hence `namesColor` |
| Cathedral Light ★ (light bg) | 11.49 | 12.40 | **3.62 ✗** (paper) | **2.45 ✗** (paper) | **BOTH FAIL — worst in catalog** |
| Mughal Zamarrud ★ (true dark) | 13.47 | 10.43 | 6.00 ✓ (surface) | 5.20 ✓ (surface) | PASS |
| Sarayu Ghat | 1.02 | 14.49 | 4.90 ✓ (paper); latent muted/bg 2.40 | 3.68 ✓ | PASS |
| Mayura Mahal ★ (true dark) | 14.74 | 12.37 | **4.08 ✗** (paperLight) | 3.84 ✓ (paperLight) | MUTED FAIL (dark-panel pairing) |
| Monochrome Vow ★ (light bg) | high (OKLCH est.) | high | 4.77 ✓ | 6.74 ✓ | PASS |

Summary: **6/14 themes fail the muted 4.5 bar** on an occurring pair
(Cathedral, Mayura, Ram, Madina, Golden, Phulkari) and **3/14 fail the accent
3.0 bar** (Cathedral, Phulkari, Golden). Fixes for all nine pairs already
exist as computed, lightness-only proposals in
`docs/ops/A11Y-CONTRAST-PROPOSALS.md` — none has been applied. Cathedral
Light is the only theme needing a *visible* change (−5.7 pts muted, −5.5 pts
accent); the rest are ≤3.9 pts and mostly imperceptible.

Two contrast risks no flat-pair table captures:

1. **Text over photography.** Names sit on `revealedBackdrop`. Vesper Chapel
   already proved its flat-passing foreground "all but disappears" on its
   own hero and needed `namesColor`. Kanjeevaram, Mughal Zamarrud and Mayura
   Mahal — the three dark heroes with light foregrounds — have no such
   override and no test; whether they pass depends on the painting's local
   brightness behind the names, which varies by crop/viewport.
2. **The scratch reveal.** The revealed date sits on frosted glass over
   photography (A11Y-4 caveat, still standing). `scratchInk` on
   `scratchFoil` is checkable as a flat pair but is not what the guest sees.


---

## 4. Typography weaknesses

1. **One serif for an entire subcontinent.** 13/14 themes use Cormorant
   Garamond; 11/14 pair it with Jost. In the gallery, in the editor's theme
   picker, and in the opened invitation, a Hindu, a Muslim, a Sikh and a
   Christian design are typographically indistinguishable — all identity is
   carried by photography alone. Monochrome Vow (Playfair Display) proves a
   second serif is possible; nothing else tries. Dubai Silk is the only
   Montserrat user, so even the flagship's *sans* is not a house style, it's
   an orphan.
2. **No script support for the names that matter most.** Every `fontsHref`
   loads Latin only. There is no Devanagari, Nastaliq/Urdu, Gurmukhi or
   Arabic display face in any theme — for a catalog whose occasions are
   *nikah, roka, haldi, mehendi, sangeet* and whose scratch titles say
   "muhurat". A couple who want their names in their own script fall back to
   a system font that will not match Cormorant's metrics or weight, in the
   largest text on the page. Invitima-style multilingual presentation is
   currently impossible, not merely unpolished.
3. **Inconsistent weight loading.** Dubai Silk loads Cormorant 400/500/600
   (no 300); the other eleven Cormorant themes load 300/400/500 (no 600).
   Any shared component that asks for 600 renders synthetic/borrowed weight
   in 11 themes and real weight in one; a component asking for 300 does the
   reverse in the flagship. Phulkari/Monochrome load Inter 300/400/500,
   Jost themes likewise — the sans side is consistent, the display side
   is not.
4. **The escape hatches are unused.** `namesScale`, `namesColor`,
   `familyScale`, `familyColor` exist in the type precisely because display
   names vary — yet across 14 themes: `namesScale` ×0, `familyScale` ×0,
   `namesColor` ×1 (Vesper, reactively), `familyColor` ×1 (Mayura,
   reactively). Long names — common in South Indian naming conventions,
   i.e. Kanjeevaram's exact audience — have never been sized for. This is
   untested surface, not headroom.
5. **Kicker/scratch/features copy is template-filling, not writing.**
   - Kickers describe the *mechanic* in 10/14 cases (`FOLDED CARD` ×3,
     `KEEPSAKE BOX` ×2, `SILK ENVELOPE`, `MARBLE ENVELOPE`,
     `EMERALD ENVELOPE`, `VELVET DRAPES`, `SILK DRAPES`) although the type
     comment's own example is an occasion kicker ("NIKAH INVITATION") —
     which no theme uses. Only `ANAND KARAJ` (Phulkari) and
     `MODERN MINIMAL` (Monochrome) sell ceremony or taste.
   - `scratchTitle: "The day"` ×5; `"The muhurat"` ×3; `scratchHint`
     identical ×14; features list contains `Scratch-to-Reveal Date/Muhurat`
     in 13/14 and a petal-shower line in 13/14 — so the "four things this
     template does that another does not" (the type comment's stated
     purpose) in practice differentiates on **one** line: the hero
     description.
   - Taglines are the strongest copy layer (specific, visual, one sentence)
     — with Makkah the clear laggard and a shared syntactic template
     ("X and Y invitation that/whose … onto [place] at [time of day]")
     in 12/14 that becomes visible when cards sit side-by-side in the
     gallery.

## 5. Color harmony issues

1. **Gold is not an accent when everything is gold.** 11/14 accents are a
   gold/brass/ochre; add saffron tints and at gallery distance Ram Mandir,
   Kesari Mandap, Sarayu Ghat, Golden Temple, Makkah and Vesper Chapel are
   one warm-amber cluster differentiated mainly by their hero paintings.
   The genuinely distinct palettes — Dubai's powder blue, Kanjeevaram's
   maroon-on-dark, Mughal/Mayura's deep green/teal, Monochrome's graphite —
   are the minority, and three of them are dark themes grouped at the end
   of the catalog order.
2. **`background` changes meaning between themes.** Light ground in 4
   (Dubai, Cathedral, Phulkari, Monochrome), dark *surround* in 7, true
   page background in 3 dark themes. Any shared component consuming
   `--background` cannot be written once and trusted 14 times. Same word,
   three jobs — this is the root of the §3 latent-pair risk.
3. **`paper` changes meaning in Mayura Mahal.** The type says
   "envelope body"; 13 themes give it a light paper colour, Mayura gives
   it dark teal `#0f3a40` (its `paperLight` is also dark). Every component
   that assumes paper = light ground (family credits already broke; scratch
   card and envelope lines are next) needs a per-theme override. Dark
   themes should darken `surface`/`background`, not redefine `paper`.
4. **Two colour languages, no conversion discipline.** 11 themes are hex,
   3 are OKLCH (Dubai, Phulkari, Monochrome — notably, the two `classic`
   themes plus the flagship). Proposals, tests and design tooling must
   convert constantly; the A11Y proposals doc has to quote OKLCH themes
   twice (source + hex equivalent). Pick one authoring format for new work.
5. **Scratch palette is decorative, not checked.** `scratchFoil` clusters
   tightly around the same gold (#b8892f–#d4af37 in 8 themes) regardless of
   the theme's own accent — Mughal's emerald theme scratches in generic
   gold, Monochrome's graphite theme scratches in near-white grey. The
   scratch card is the one interactive surface every guest touches; it is
   the least themed.

## 6. Opening-sequence weaknesses (vs the premium benchmark)

Benchmark: envelope ≈ 3.5–4 s **total**, doors ≈ 2–3.5 s, one easing, text last.

| Measure | Benchmark | EasyInviteMaker today | Gap |
|---|---|---|---|
| Physical gesture | envelope 3.5–4 s total experience; doors 2–3.5 s | CSS gesture 1.4–1.5 s, then stage unmounts at `openMs` 1.4–1.7 s | Gesture is **2–2.5× too fast** to feel weighted/premium — it reads as a UI transition, not an object being opened. Curtain, the "heaviest-feeling" mechanic by design comment, gets 1.5 s — the same as the lightest (box). Weight is asserted in comments, not in time. |
| Total time to content | included in the 3.5–4 s | gesture (≤1.7 s) **+ separate cinematic intro** (`introSeconds` 5–6 s, staged skyline <1.2 s → names <3 s → invitation) = **6.4–7.7 s** before the invitation settles | Total is ~2× the benchmark's *whole* envelope experience, spent on two disconnected animations instead of one continuous opening. The DigitalYes finding was specifically that smoothness comes from **no cut between cover and content**; here there is a hard unmount (`setOpen`) between the sealed stage and the hero, then a second timed show. |
| Easing | single easing per opening | **5 easings**, one per mechanic (see §2a), plus a separate 0.6 s opacity easing on envelope lines and the cinematic's stage cuts at fixed 1.2 s / 3 s | No shared motion token; each mechanic was tuned in isolation. |
| Text timing | text fades **last** | Partially honoured: names stage (1.2–3 s of the cinematic) precedes the "invitation" stage — but the heading/welcome/blessing DOM is mounted under the cinematic overlay rather than sequenced by it, so the guarantee is visual, not structural, and depends on `artState === "ready"` preload completing. | Acceptable today, fragile: any change to preload order can surface text early. |
| Reduced motion | must remain usable | **Good:** cinematic completes immediately under `prefers-reduced-motion`, and `styles.css` collapses transitions to 0.01 ms. | Meets the bar — keep as the standard (see §8). |
| Repeat / reopen | must handle repeats | Opening is one-way: once `open`, the sealed stage is gone; there is no replay of the opening for a guest who missed it (contrast the standalone templates' replay requirement). | Minor for guests, real for hosts previewing/sharing demos. |
| Music sync | — | Music starts 1 s *after* `openMs` with an 8 s fade to `maxVolume` — i.e. full volume at ~10.7 s after the tap, long after the 1.5 s gesture it was meant to score. Only Dubai Silk has a track at all. | The fade curve was tuned for a slower opening than the one that shipped. |

**Net judgement:** the mechanics are correctly built and tested
(`reveal-mechanics.test.tsx`, 44/44 in the overnight run) — the deficit is
*choreography*, not correctness: too fast, in two acts, with five easings,
and a duration declared in data that the CSS does not obey.

## 7. Representative first batch — and the batches after

Selection principle for Batch 1: cover the maximum number of *variables*
with three themes — three different mechanics, light + dark, best + worst
contrast, flagship + lender — so the standards proven on them transfer to
the other 11 without new decisions.

### Batch 1 (do first) — 3 themes

| Theme | Mechanic | Why this one, why now |
|---|---|---|
| **Dubai Silk** | envelope | Flagship, default and fallback — every unknown theme id renders as Dubai Silk, and it leads the gallery. It is the stated "reference theme… copy this file to start a new theme", so any standard set here becomes the template for all future themes. Only music theme, so it's the only place music-sync fixes can be verified. Also carries the catalog's one asset emergency (2.0 MB hero/thumbnail). If only one theme gets the full 3.5–4 s single-easing, text-last treatment, it must be this one. |
| **Cathedral Light** | doors | Worst contrast in the catalog on *both* failing tokens (muted 3.62, accent 2.45) — and the fixes are already computed in `A11Y-CONTRAST-PROPOSALS.md`, so this is application, not research. Its `paper.jpg` is borrowed by three other themes, so its asset/texture decisions propagate furthest. Represents the doors mechanic and the light-Christian pair. |
| **Kanjeevaram** | curtain | The dark-theme exemplar: strongest dark contrast margins, the only curtain theme with a truly dark surface, the only `rose` petals, and a South Indian audience for whom the unused `namesScale` / long-name problem is most likely real. Proving "dark themes darken surface, not paper" and names-over-photo standards on Kanjeevaram sets the rule for Mughal and Mayura without touching their identities. |

Together Batch 1 covers: envelope + doors + curtain, light + dark,
royal tier, Hindu + Christian + uncategorised, own-paper + lender-paper,
music + silent, pass + worst-fail contrast.

### Batch 2 — the other dark / identity-distinct themes (3)

- **Mughal Zamarrud** (envelope, dark) — apply Batch 1's dark-theme and
  envelope standards; fix the stale "carved doors" header; give the scratch
  card its own emerald identity.
- **Mayura Mahal** (curtain, dark) — the `paper`-redefinition fix lands
  here (retire the `familyColor` workaround by fixing the token, not the
  component); muted-on-dark-panel fix (lighten, per proposals).
- **Monochrome Vow** (curtain, modern, classic) — the control case: prove
  the new standards (timing, easing, contrast gates, copy rules) do **not**
  homogenise — it must remain gold-free, Playfair, and editorial. If
  Monochrome comes out looking like the others, the standards are wrong,
  not the theme.

### Batch 3 — the Hindu saffron/gold cluster (3)

- **Ram Mandir** (box), **Kesari Mandap** (book), **Sarayu Ghat** (book) —
  upgraded *together* because their problem is collective: near-identical
  palettes, fonts, petals, scratch titles and tagline syntax. Work is
  differentiation (palette separation at gallery distance, distinct
  kickers — Ram's `TEMPLE CASKET` is the model) plus Ram's muted fix and
  Ram's borrowed-paper decision.

### Batch 4 — the remaining landmark pairs (4)

- **Madina** (envelope) + **Makkah** (book) — Madina's marginal muted fix;
  Makkah's tagline rewrite (weakest copy) and thin accent margin; decide
  both borrowed-paper cases together (same lender).
- **Golden Temple** (box) + **Phulkari Anand** (doors) — both-fail accent
  fixes (marginal, already computed); Phulkari is the second `classic`
  theme and the kicker exemplar (`ANAND KARAJ`) — use it as the copy
  standard when rewriting the others' kickers.

### Batch 5 — last (1)

- **Vesper Chapel** (box) — deliberately last: its `namesColor` override
  is a *symptom* of the names-over-photo problem Batch 1 must solve
  generally (scrim/veil standard or a tested override). Upgrading Vesper
  before that standard exists would just re-bless the one-off hack.
  Success criterion: the override is either removed or becomes a documented,
  tested instance of the general rule.

## 8. Engineering standards every theme must meet (identity-preserving)

These constrain *engineering*, never palette, motif, painting or occasion
copy — a theme keeps its identity by changing everything not on this list.

**Motion**
1. One duration, one source: the opening's duration lives in exactly one
   place. Either CSS consumes a per-theme custom property set from
   `openMs`, or `openMs` is deleted from the type. No silent 200 ms gaps.
2. Total-opening budget: gesture + intro to settled content **2–4 s**
   (mechanic-weighted: box lightest, curtain heaviest — by *time*, not by
   comment). `introSeconds` counts inside the budget, not after it.
3. One easing per opening, drawn from a shared token set (max 2 curves for
   the whole catalog: one for physical gestures, one for fades).
4. Text last, structurally: invitation text must be incapable of painting
   before the gesture completes — sequenced by the opening's completion,
   not hidden under an overlay on a timer.
5. Reduced-motion path (current behaviour) is mandatory and tested per
   mechanic; petals/music never block content.

**Contrast & colour**
6. Occurring-pair gates in CI (extending `a11y.test.tsx`): muted ≥ 4.5 and
   accent ≥ 3.0 on every surface the CSS actually paints, per theme.
   A theme that fails does not ship; proposals in
   `A11Y-CONTRAST-PROPOSALS.md` are the ready-made fixes for the 9 failing
   pairs.
7. Names-over-hero is a tested pair, not a hope: either the hero passes
   against the names colour at the mobile and desktop crops, or the theme
   uses the standard scrim — `namesColor` overrides require a test, not
   just a comment.
8. Token semantics are fixed: `paper*` is always a light ground,
   `background` has one documented job. Dark themes darken
   `surface`/`background`. New themes may not redefine a token's lightness
   class (the Mayura rule).

**Typography**
9. Every theme declares a deliberate serif/sans pair; "Cormorant + Jost" is
   no longer an acceptable default for a new theme without a written reason.
   Loaded weights must cover every weight shared components use.
10. Long-name test: names at `namesScale` default must fit the longest
    realistic name pair for the theme's tradition at 360 px width without
    clipping — use `namesScale`/`familyScale` *proactively* where needed.
11. Script readiness: a theme whose occasions centre a non-Latin script
    tradition must either load a matching display face or explicitly
    document Latin-only as a decision.

**Assets**
12. Self-sufficiency by default: S + R + Se + own P required. Borrowing
    another theme's file needs a comment *and* an entry in a shared-assets
    list a test can check — a lender's file may not be re-encoded without
    checking its borrowers (Cathedral's paper currently serves 4 themes).
13. Size budgets: hero/sealed/section ≤ 400 KB each, thumbnail is a
    purpose-sized derivative, never the full hero (the Dubai Silk 2.0 MB
    skyline is the standing counterexample).
14. Music is opt-in per theme with rights documented (current policy —
    keep); `musicFadeMs` must be tuned against the *actual* opening budget
    in standard 2, not a constant copied into all 14 files.

**Copy**
15. Kicker names the occasion, ceremony or taste position — never the
    bare mechanic (models: `ANAND KARAJ`, `MODERN MINIMAL`,
    `TEMPLE CASKET`). No kicker may be duplicated across themes.
16. `scratchTitle` unique per theme; `features` may share at most the
    scratch line — at least two of four features must be true of this
    theme alone. Taglines keep the current one-sentence, place-and-light
    specificity (Dubai, Kanjeevaram, Mayura and Monochrome are the bar)
    but may not reuse the shared sentence template verbatim.

**Data hygiene**
17. No constant may be copied into all 14 files: values identical across
    the catalog (`musicFadeMs 8000`, `scratchThreshold 0.38`,
    `scratchHint`, easings) belong in the engine/defaults, with the theme
    file carrying only what makes that theme different.
18. Header comments must match the data (Mughal's "carved doors" /
    Monochrome's "velvet drapes" are the standing counterexamples);
    `ornamentation: "none"` + photography is a valid choice, but the
    unused drawn-ornament system (7 kinds, 0 users) should be either used
    by at least one theme or removed from the type.

---

## Appendix — per-theme raw values (for verification)

| id | accent | background | foreground | muted | surface | petals | names/family overrides |
|---|---|---|---|---|---|---|---|
| dubai-silk | oklch(0.57 0.068 81) | oklch(0.986 0.005 90) | oklch(0.27 0.043 245) | oklch(0.4 0.027 241) | oklch(0.947 0.017 239) | white-blossom | — |
| ram-mandir | #b5480f | #3d1707 | #3f2211 | #8a6a47 | #fffaef | marigold | — |
| kesari-mandap | #9e1b1b | #3a0d0a | #3b1a10 | #7d5a3c | #fff9ee | marigold | — |
| kanjeevaram | #c9a24a | #2a060c | #f8eedb | #c8b39a | #4a0c16 | rose | — |
| madina | #0e6b4f | #0f2a20 | #1c3b30 | #5f7468 | #fbfaf4 | white-blossom | — |
| makkah | #a8831f | #241e0f | #3a3220 | #6e6552 | #fbf9f2 | white-blossom | — |
| golden-temple | #b8860b | #2b2108 | #3f3214 | #7a6b45 | #fdf9ee | marigold | — |
| phulkari-anand | oklch(0.68 0.16 58) | oklch(0.98 0.012 80) | oklch(0.3 0.075 50) | oklch(0.54 0.07 56) | oklch(0.97 0.018 78) | marigold | — |
| vesper-chapel | #8a5a1f | #241607 | #3c2c16 | #786249 | #fbf6ea | white-blossom | namesColor #f3e6c8 |
| cathedral-light | #b8924a | #f5efe4 | #3a2e25 | #8a7764 | #fbf8f2 | white-blossom | — |
| mughal-zamarrud | #c9a24a | #07261d | #f3ead7 | #a9b8a8 | #0e3b2e | marigold | — |
| sarayu-ghat | #c2501a | #16283a | #3a1e0c | #7a5a3a | #fff8ea | marigold | — |
| mayura-mahal | #c9a45c | #071a24 | #f2e9d8 | #9db3b0 | #0c2b33 | white-blossom | familyColor #e6cf9a |
| monochrome-vow | oklch(0.44 0.018 60) | oklch(0.985 0.002 70) | oklch(0.24 0.012 60) | oklch(0.52 0.01 60) | oklch(0.97 0.003 70) | white-blossom | — |

*End of draft audit. Companion documents: `docs/ops/A11Y-CONTRAST-PROPOSALS.md`
(ready-made contrast fixes), `src/test/reveal-mechanics.test.tsx` (mechanic
correctness), `src/themes/types.ts` (the contract this audit measures against).*
