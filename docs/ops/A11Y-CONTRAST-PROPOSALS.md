# A11Y contrast proposals — muted & accent tokens (owner review)

> **PROPOSALS ONLY — no palette has been changed.** Every value below is a
> suggestion computed from the current palettes in `src/themes/*.ts`. Nothing
> lands in a theme file until the owner picks from this document. Prepared
> 2026-10-23 as follow-up 2 to the overnight run (Task 15 findings A11Y-2 /
> A11Y-3 in `OVERNIGHT-REPORT-2026-10-24.md`).

## Method

- **Ratios** are WCAG 2.1 contrast ratios: palette values (hex or OKLCH) →
  linear sRGB → relative luminance `0.2126R + 0.7152G + 0.0722B` → ratio
  `(Llight + 0.05) / (Ldark + 0.05)`. This is the audit's own method — the
  colour math is the one pinned in `src/test/a11y.test.tsx` — and it
  **reproduces every figure the audit cited, exactly** (all 15 spot-checked
  pairs match to 2 decimals: e.g. cathedral-light muted on paper 3.62,
  phulkari-anand accent on paper 2.61).
- **Tokens.** `muted` = the palette's muted-foreground token (CSS
  `--muted-foreground`), threshold **4.5:1** (normal-size secondary text).
  `accent` = the palette's gold/accent token (CSS `--gold`), threshold
  **3.0:1** (its text uses are large display text / ornaments).
- **Surfaces (the audit's pairing model — only pairs the CSS actually
  paints).** Light-family themes: muted on `paper` / `paperLight` /
  `surface`; accent on `paper` / `paperLight` / `background`, where
  `background` counts only for the two themes whose background token is
  itself a light ground (cathedral-light, phulkari-anand) — on the other
  themes `background` is a dark page surround that accent text never sits
  on. Dark-family themes (kanjeevaram, mughal-zamarrud): both tokens on
  `surface` / `background` (their paper pairs are non-occurring).
- **"Smallest adjustment"** = the proposed token differs from the current
  one only in HSL lightness, stepped in 0.1-point increments with hue and
  saturation preserved, in whichever direction increases contrast
  (darkening on light grounds; lightening where the token is already the
  lighter side of the pair). The search stops at the first step that
  clears the threshold on **every** occurring surface for that token, and
  the after-ratios are computed from the final rounded hex. (Two themes'
  tokens are OKLCH in source; their current value is quoted as written,
  with the sRGB hex equivalent alongside — proposals are given as hex.)

## 1. Muted foreground — proposals (6 themes below 4.5:1)

| Theme | Current `muted` | Worst surface | Ratio now (worst · others) | Proposed | Ratio after (worst · others) | Δ lightness | Visual impact |
|---|---|---|---|---|---|---|---|
| cathedral-light | `#8a7764` | paper `#f3ebdd` | 3.62 · 3.97 (paperLight) · 4.04 (surface) | `#796858` | 4.51 · 4.95 · 5.04 | −5.7 pts | The largest change here: same warm taupe, reads as a slightly deeper stone — noticeable side-by-side, unremarkable on its own. |
| mayura-mahal | `#9db3b0` | paperLight `#17505a` | 4.08 · 5.59 (paper) · 6.75 (surface) | `#a8bcb9` | 4.53 · 6.21 · 7.49 | +3.9 pts (lighten) | Subtle: same pale sage, slightly airier. Direction is *lighten* because this theme's paper slots are dark teal panels and the token is the lighter side of the pair. |
| ram-mandir | `#8a6a47` | paper `#f7e8c9` | 4.10 · 4.61 · 4.77 | `#826443` | 4.50 · 5.06 · 5.24 | −2.3 pts | Subtle: same sandy brown, a touch deeper. |
| madina | `#5f7468` | paper `#f3efe4` | 4.37 · 4.72 · 4.80 | `#5d7166` | 4.55 · 4.92 · 5.00 | −0.9 pts | Near-imperceptible: under one lightness point of the same sage green. |
| golden-temple | `#7a6b45` | paper `#f6ecd2` | 4.44 · 4.88 · 4.97 | `#796a45` | 4.51 · 4.95 · 5.04 | −0.2 pts | Imperceptible: a single 0.2-point step — effectively the same colour, now over the bar. |
| phulkari-anand | `oklch(0.54 0.07 56)` (≈ `#8e6446`) | paper `oklch(0.95 0.025 80)` | 4.46 · 4.95 · 4.74 | `#8d6345` | 4.53 · 5.02 · 4.81 | −0.3 pts | Imperceptible: same terracotta brown, a third of a point deeper. |

## 2. Muted foreground — already passing (8 themes, no change proposed)

Worst occurring-pair ratio shown; bar is 4.5:1.

| Theme | Worst pair | Ratio |
|---|---|---|
| dubai-silk | muted on paper | 7.04 |
| kanjeevaram (dark) | muted on surface | 7.65 |
| kesari-mandap | muted on paper | 5.05 |
| makkah | muted on paper | 5.02 |
| monochrome-vow | muted on paper | 4.77 |
| mughal-zamarrud (dark) | muted on surface | 6.00 |
| sarayu-ghat | muted on paper | 4.90 |
| vesper-chapel | muted on paper | 4.67 |

## 3. Accent (gold) — proposals (3 themes below 3.0:1)

| Theme | Current `accent` | Worst surface | Ratio now (worst · others) | Proposed | Ratio after (worst · others) | Δ lightness | Visual impact |
|---|---|---|---|---|---|---|---|
| cathedral-light | `#b8924a` | paper `#f3ebdd` | 2.45 · 2.53 (background) · 2.69 (paperLight) | `#a58241` | 3.02 · 3.13 · 3.32 | −5.5 pts | Mild: the gold reads slightly more antique/bronze; hue unchanged. The most visible proposal in this document. |
| phulkari-anand | `oklch(0.68 0.16 58)` (≈ `#df7b0c`) | paper `oklch(0.95 0.025 80)` | 2.61 · 2.85 (background) · 2.89 (paperLight) | `#ce720b` | 3.00 · 3.28 · 3.33 | −3.5 pts | Subtle: same marigold orange, one shade deeper. |
| golden-temple | `#b8860b` | paper `#f6ecd2` | 2.77 · 3.04 (paperLight) · 4.87 (background) | `#b0800b` | 3.01 · 3.30 · 4.49 | −1.6 pts | Near-imperceptible: the classic darkgoldenrod deepened slightly. (Background ratio eases 4.87 → 4.49 because the dark surround sits on the other side of the pair — still well over the bar.) |

## 4. Accent (gold) — already passing (11 themes, no change proposed)

Worst occurring-pair ratio shown; bar is 3.0:1.

| Theme | Worst pair | Ratio |
|---|---|---|
| dubai-silk | accent on paper | 3.45 |
| kanjeevaram (dark) | accent on surface | 6.46 |
| kesari-mandap | accent on paper | 6.54 |
| madina | accent on paper | 5.65 |
| makkah | accent on paper | 3.08 |
| mayura-mahal | accent on paperLight | 3.84 |
| monochrome-vow | accent on paper | 6.74 |
| mughal-zamarrud (dark) | accent on surface | 5.20 |
| ram-mandir | accent on paper | 4.45 |
| sarayu-ghat | accent on paper | 3.68 |
| vesper-chapel | accent on paper | 4.77 |

## 5. Computed but excluded — non-occurring pairs (for completeness)

The audit's pairing model excludes pairs the CSS never paints. They were
computed anyway; if the owner disagrees with any exclusion, say the word
and proposals will be extended to cover them.

- **Accent on dark-surround `background`** (accent text never sits on the
  page surround): kesari-mandap 2.11 · madina 2.36 · ram-mandir 2.94 ·
  vesper-chapel 2.99.
- **Accent on `surface`** (gold text does not occur on surface-painted
  elements): cathedral-light 2.73 · phulkari-anand 2.77 — below 3.0, noted
  for the record; all other light-family themes pass this pair.
- **Muted on dark-surround `background`** (muted text never sits on the
  page surround): sarayu-ghat 2.40 · kesari-mandap 2.74 · makkah 2.88 ·
  golden-temple 3.03 · madina 3.05 · vesper-chapel 3.05 · ram-mandir 3.20.
- **Dark-family tokens on `paper`** (non-occurring — dark themes paint
  content on their dark surface/background): kanjeevaram muted 1.70 /
  accent 2.01 · mughal-zamarrud muted 1.74 / accent 2.01.
- The audit's A11Y-4 caveat stands: the scratch-card revealed date sits on
  frosted glass over photography, so no flat-pair ratio can judge it.
