# Lovable prompt — premium invitation templates

Run this **once per template**. Change only the `AESTHETIC` block each time.
Start a **new Lovable project per template** so the artwork stays separate.

When it's done, send me the project export (or just the `public/` folder plus
the palette it prints). I'll fold it into the catalog.

---

## The prompt — copy from here

> Build a single-page **premium Indian wedding invitation microsite**. This is
> a luxury product that people pay for, so the finish matters more than the
> feature count. Think engraved wedding stationery, not a web page.
>
> ### The experience, in order
>
> 1. **A sealed opening.** The screen holds one closed object — an envelope
>    with a wax seal — resting on a rich textured surface. A single tap opens
>    it with a slow, weighted animation of about 1.4 seconds. Nothing else is
>    on screen. No navigation, no scrollbar, no instructions beyond a small
>    line of text.
> 2. **A cinematic reveal** of about 6 seconds: the backdrop settles, then the
>    couple's names fade up, then the rest of the page becomes scrollable.
>    One continuous motion, not a second screen.
> 3. **Background music** fades in over 8 seconds to about 60% volume, and
>    only after the seal is tapped. Prime it muted on the tap so mobile
>    browsers allow playback.
> 4. **A scratch-to-reveal date card.** A foil panel the guest rubs with a
>    finger; at about 38% cleared it auto-reveals the date and time, then
>    unmounts so scrolling works again.
> 5. **Scrollable sections below:** venue with a maps link, a live countdown,
>    an illustrated section, a quote, and a closing "always and forever"
>    panel with counters.
>
> ### AESTHETIC — change this block per template
>
> **Name:** Mughal Zamarrud
> **Palette:** deep emerald green with antique gold
> **Motifs:** Mughal arches, carved marble jali lattice, reflecting pools
> **Feeling:** a palace at dusk — opulent, still, candlelit
>
> ### Artwork — the most important part
>
> Generate original illustrations for this. Painterly and photoreal, in the
> register of high-end wedding stationery. **No stock-photo look, no flat
> vector, no clip art.**
>
> Produce these as actual image files:
>
> | File | Size | What it is |
> |---|---|---|
> | `sealed-backdrop.jpg` | 1536×1024 | The surface the envelope rests on — draped silk, velvet, carved stone. Rich but **calm and uncluttered**, because the envelope sits dead centre. |
> | `hero-backdrop.jpg` | 1536×1024 | The scene behind the couple's names. Arches, florals, drapes, architecture. **The middle must be open and quiet** — the names and date card sit on top of it. |
> | `wax-seal.png` | 816×816 | A wax seal, transparent background, viewed top-down, with a thin metallic rim. **Completely blank in the centre — absolutely no letters, initials, monogram or emblem.** The site prints each couple's own initials over it. |
> | `paper-texture.jpg` | 800×800 | Subtle, tileable paper grain in the palette. |
>
> **Rules for every image: no text, no words, no lettering, no numbers, no
> watermark, no people's faces.**
>
> ### Build rules
>
> - Mobile first. Must look right from 320px to 4K. Nearly every guest opens
>   this on a phone.
> - Define all colours as CSS custom properties on `:root`. Do not hardcode
>   colours in components.
> - Use two Google Fonts: one display serif for names and headings, one clean
>   sans for labels and counters.
> - Anchor the countdown and date to an explicit timezone offset
>   (`+05:30`), never the guest's own clock.
> - Keep the seal-tap sound and the background music as two separate `<audio>`
>   elements so one cannot interrupt the other.
> - Use placeholder names "Virat & Anushka", 14 February 2027, "The Grand
>   Pavilion". These get replaced.
>
> ### Finish by telling me
>
> 1. Every colour as a **hex value**, labelled by role: accent, accent-soft,
>    tint, paper, paper-light, paper-dark, highlight, surface, scratch-foil,
>    scratch-ink, background, foreground, muted, border.
> 2. The **two Google Font names**.
> 3. Where the four image files are in the project.

## Copy to here

---

## Run it for these

Ordered by what research says sells. Replace the AESTHETIC block each time.

| # | Name | Palette | Motifs | Feeling |
|---|---|---|---|---|
| 1 | **Mughal Zamarrud** | Deep emerald + antique gold | Mughal arches, marble jali, reflecting pools | A palace at dusk |
| 2 | **Kesari Mandap** | Marigold + saffron + deep red | Mandap arch, marigold garlands, banana-leaf pillars | A courtyard at golden hour |
| 3 | **Kanjeevaram** | Maroon silk + gold zari | Temple gopuram, jasmine strings, brass lamps | A South Indian temple at dawn |
| 4 | **Royal Ivory** | Cream + crimson + gold | Palace columns, velvet drapes, chandeliers | A ballroom before guests arrive |
| 5 | **Midnight Mayura** | Peacock navy + teal + gold | Peacock feathers, lotus pools, latticed balconies | A terrace under night sky |
| 6 | **Blush Garden** | Blush pink + rose gold + sage | English roses, trailing vines, pale drapes | A garden in early morning |
| 7 | **Haveli Bandhej** | Terracotta + rose + indigo | Jharokha windows, bandhani cloth, Jaipur blue pottery | A Rajasthani haveli courtyard |
| 8 | **Phulkari Anand** | Saffron + ivory + gold | Phulkari embroidery, marigold, soft morning light | A gurdwara courtyard at sunrise |
| 9 | **Monochrome Vow** | Ivory + charcoal | Stone colonnades, white florals, deep shadow | Editorial, modern, restrained |
| 10 | **Alpona** | Red + white + gold | Alpona floor art, shankha motifs, terracotta | A Bengali home on the morning of |

**Start with 1–3.** Send them over, I'll integrate, and we'll see how they
look in the catalog before you spend time on the rest.

---

## What I need back

Easiest: **the full project export**, same as you sent for Dubai Silk.

If that's awkward, just these:

- The **four image files**
- The **palette hex values**
- The **two font names**

I don't need Lovable's code — I have the engine. I need the artwork and the
colours.

---

## Why the seal must be blank

Your Dubai Silk seal has **UM** baked into the image. That was fine when the
invitation was yours, but every customer buying that template would have
received your initials. The engine now prints each couple's own initials over
a blank disc, which is also a nicer selling point — their monogram, pressed
into wax.

So: **a blank seal, every time.** If Lovable puts letters on it, ask again.
