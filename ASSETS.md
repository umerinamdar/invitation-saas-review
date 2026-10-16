# Artwork guide

What each template needs, and prompts to generate it.

---

## Per artwork set

| File | Size | Notes |
|---|---|---|
| `silk.jpg` | 1536 × 1024 | Sealed backdrop — the surface the envelope or doors rest on. Must be **calm and uncluttered**: the envelope sits dead centre. |
| `skyline.jpg` | 1536 × 1024 | Revealed hero — the scene behind the names. Needs an **empty middle**: the names and scratch card sit on top. |
| `seal.png` | 816 × 816 | **Blank** wax disc, transparent background, **no letters** — the engine prints each customer's initials. |
| `paper.jpg` | ~800 × 800 | Subtle tileable grain. One neutral one can serve several sets. |
| `track.mp3` | 60s+ | Loops cleanly. **Commercial rights required.** |

Drop them in `public/themes/<theme-id>/`, then copy `dubai-silk.ts` and point at them.

> **The two rules that matter.** Backdrops need a **quiet centre** — anything detailed in the middle fights the names. And the seal must have **no lettering**, or every customer gets someone else's monogram.

---

## Launch set prompts

Append to each: *elegant wedding invitation backdrop, soft diffused light, painterly digital illustration, uncluttered centre, no text, no words, no lettering, 3:2.*

### Set B — Kesari Mandap · marigold + saffron

**Sealed**
> Luxurious saffron silk fabric draped in soft folds, warm marigold undertones, gold thread shimmer, flat lighting, calm empty centre

**Revealed**
> Ornate Indian wedding mandap arch framing an open courtyard at golden hour, thick marigold garlands and banana-leaf pillars either side, soft bokeh, bright uncluttered centre with open sky

**Seal**
> Single blank saffron wax seal, circular, scalloped edge, thin gold rim, completely smooth empty centre, no letters or emblem, transparent background, top-down

### Set C — Mughal Zamarrud · emerald + gold ★ nikah

**Sealed**
> Deep emerald silk velvet with subtle gold Mughal jali lattice woven in, soft sheen, calm empty centre

**Revealed**
> Grand Mughal palace archway with carved marble jali screens, emerald and gold inlay, reflecting pool, white florals at the base, luminous open centre, Islamic geometric detail, no figures

**Seal**
> Single blank emerald wax seal, circular, scalloped edge, thin gold rim, completely smooth empty centre, no letters or emblem, transparent background, top-down

### Set D — Kanjeevaram · maroon silk + gold zari ★ South Indian

**Sealed**
> Deep maroon Kanjeevaram silk sari fabric, woven gold zari border visible at the edges, rich sheen, calm empty centre

**Revealed**
> South Indian temple gopuram framed by carved stone pillars, strung jasmine and mango-leaf toran, brass lamps glowing, warm maroon and gold tones, open luminous centre

**Seal**
> Single blank deep maroon wax seal, circular, scalloped edge, thin gold rim, completely smooth empty centre, no letters or emblem, transparent background, top-down

### Set H — Monochrome Vow · ivory + charcoal

**Sealed**
> Textured ivory cotton-rag paper, raking light, fine fibre grain, minimal, no pattern

**Revealed**
> Minimalist arched colonnade in soft ivory stone, sparse white florals, charcoal shadows, editorial fashion photography feel, very clean empty centre, lots of negative space

**Seal**
> Single blank charcoal-grey wax seal, circular, scalloped edge, thin silver rim, completely smooth empty centre, no letters or emblem, transparent background, top-down

---

## Music

Every customer's invite plays it, so you need **broad commercial rights**.

**Safest:** public-domain classical recordings. Dvořák, Debussy, Satie, Chopin on Wikimedia Commons under CC0 — free, unrestricted, and the right register. The track credited in `src/assets/music/credits.md` came from there.

> ⚠️ **Verify the current track.** `credits.md` names a CC0 Dvořák recording, but `roadmap.md` says the music was later replaced with an uploaded song. If that upload was a commercial track, it cannot ship to paying customers. Check before launch.

One track per aesthetic family is enough — sitar/santoor for Sets B and D, oud or strings for Set C, solo piano for Set H.

---

## A note on backdrops you did not make

Generate them, or buy them with a licence that covers resale. Do not take them from another invitation site: the artwork is the one part of a competitor's product that is unambiguously theirs, it is trivially traceable by reverse image search, and it is the single thing most likely to get a payment account frozen.
