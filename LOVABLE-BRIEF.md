# Premium Indian Wedding Invitation Templates — Full Brief

Everything Lovable needs, in one file.

**How to use:** build **one Lovable project per template**. Paste
[Part 2](#part-2--the-prompt) as the prompt, with one aesthetic from
[Part 3](#part-3--the-ten-aesthetics) pasted into its `AESTHETIC` block.
Build **two or three first**, send them back, then do the rest.

---

## Part 1 — What this is and the standard it has to meet

### What we are building

A website that sells **digital wedding invitations** to Indian couples. A
couple picks a design, types in their names and dates, pays once, and gets a
link. They send that link on WhatsApp. Their guests tap it and an invitation
opens on their phone — an envelope unseals or palace doors swing apart,
music fades in, a foil panel scratches away to reveal the date, a countdown
ticks down to the day.

The **engine already exists and works**: the opening animations, the
gesture-primed audio, the scratch canvas, the countdown, the milestone
counters, the editor, the storefront. All of it is built.

**What is missing is the artwork.** That is the whole of this job.

### The standard

The benchmark is **invitima.com**, specifically their "Maharaja's Dream":

> A photoreal painted Jaipur palace gateway. Carved sandstone arches with
> painted floral frescoes. Two live peacocks flanking the doors. Brass
> lanterns lit. Bowls of marigolds. A polished marble floor with the
> lantern light reflecting off it. A hanging lamp overhead. The couple's
> names in gold script across the bottom, and a small "TAP TO OPEN" plate
> on the carved wooden door.

**That is the level.** A painted scene with depth, warmth, craft and detail.

For reference on what is *not* good enough: our current attempts are flat
CSS patterns — a gold lattice on dark green, a geometric grid on navy. Next
to a painted palace they look like placeholders, because they are.

### Reference sites — the production standard

These are the established players in this market. Look at them to calibrate
**how finished a paid template in this category looks** — the density of the
artwork, the warmth of the light, the weight of the motion.

| Site | Worth looking at |
|---|---|
| **invitima.com** | The strongest. Painted palace scenes, 3D gate openings, "Maharaja's Dream" and "Royal Jaipur" in particular |
| **zareqia.com** | Cinematic openings, ornate gold frames, dark jewel palettes |
| **invitestory.in** | 35 designs, cleaner and more modern; good for the restrained end |

**Match their level of craft. Do not reproduce their designs.** Their
artwork is their property, and a traced palace gate is both a legal problem
and a commercial dead end — we would be selling a worse copy of a product
that already exists. The aesthetics in Part 3 are deliberately our own set,
several of them covering ground none of these three serve well.

If you cannot browse these, the written descriptions in this brief carry
everything needed; they were written from these sites.

### The one template that already works

The same person previously had Lovable build a **Dubai Silk** invitation and
it was genuinely good: a pearl-silk backdrop with a wax-sealed envelope, and
behind it a painted arch framing the Burj Khalifa with powder-blue florals
and white drapes.

**Build to that quality, in the aesthetics listed in Part 3.**

---

## Part 2 — The prompt

Paste everything between the lines into a new Lovable project.

---

Build a **premium Indian wedding invitation microsite** — a single page a
guest opens on their phone. This is a luxury product that people pay for.
Finish matters far more than feature count.

### The experience, in order

**1. A sealed opening.** *(The mechanic is named in the AESTHETIC block —
build that one, and compose the backdrop around it. A scene painted for an
envelope cannot then be opened with doors; the doors cover the painting.)*

The entire screen is one richly painted scene containing a single closed
object — carved palace doors, a wax-sealed envelope, drawn velvet curtains,
a keepsake box. A small "Tap to open" plate sits on the object. The couple's
names appear in gold script beneath it.

Nothing else is on screen. No navigation, no header, no scrollbar, no
instructions.

A single tap opens it with a slow, weighted animation of about **1.5
seconds** — doors swinging inward on their hinges, a flap folding back,
curtains sweeping apart, a lid lifting away.

**2. A cinematic reveal**, about **6 seconds**.
The backdrop settles, then the couple's names fade up, then the rest of the
page becomes scrollable. This is one continuous motion into the same page —
**not** a second screen or a modal.

**3. Music.**
Fades in over **8 seconds** to roughly **60%** volume, and only after the
tap. Prime it muted on the tap gesture so mobile browsers permit playback
later. The seal-tap sound and the background music must be **two separate
`<audio>` elements**, so the short sound cannot interrupt the song.

**4. A scratch-to-reveal date card.**
A gold foil panel the guest rubs with a finger. At about **38% cleared** it
auto-reveals the date and time, then unmounts itself so the page scrolls
normally again. Keyboard-accessible too (Enter or Space reveals it).

**5. Scrollable sections below**, in this order:
- Venue, with a Google Maps link
- A live countdown to the day
- The ceremony programme — Mehendi, Sangeet, Wedding, Reception
- A photo gallery
- A quote from the couple
- A closing panel

### AESTHETIC — replace this block per template

**Name:** Mughal Zamarrud
**Palette:** deep emerald green with antique gold
**Scene:** a Mughal palace gateway at dusk — carved marble jali screens, an
emerald-inlaid arch, lit brass lanterns, a still reflecting pool
**Feeling:** opulent, candlelit, hushed
**Opening:** a wax-sealed envelope resting in a carved marble niche

### The five openings

Every template uses one. Vary them across the catalogue — competitors do,
and it is most of what makes one template feel different from the next.

| Opening | What the guest sees and taps |
|---|---|
| **Envelope** | A wax-sealed envelope. The flap folds back. |
| **Carved doors** | Two tall carved doors, seal where they meet. They swing inward. |
| **Velvet drapes** | Heavy curtains drawn across a stage, seal at the join. They sweep apart. |
| **Folded card** | A folded invitation card, seal on the cover. It turns open on its spine. |
| **Keepsake box** | An ornate box with the seal on its lid. The lid lifts and floats away. |

**Compose the sealed backdrop for the chosen one.** Doors need a doorway or
archway to sit in. Drapes need a stage or proscenium. An envelope needs a
niche, table or ledge to rest on.

### The artwork — this is the actual job

Generate original illustrations. **Photoreal and painterly**, in the
register of high-end wedding stationery:

- Carved stone and wood with **real depth** — shadow in the recesses
- Fabric with **weight** — drapes that hang, silk that catches light
- **Warm practical light** — lanterns, diyas, candles, low sun
- **Reflections** on polished marble and still water
- Dense, crafted **detail**: inlay, fresco, embroidery, carving

**Not acceptable:** flat vector, clip art, stock-photo look, plain colour
gradients, or a geometric pattern standing in for a scene.

#### The four files

| File | Size | What it is |
|---|---|---|
| `sealed-backdrop.jpg` | 1536 × 1024 | The full scene holding the closed object — the palace gateway, the draped table, the curtained stage. Rich and detailed, but leave a **calm area in the centre** where the object sits. |
| `hero-backdrop.jpg` | 1536 × 1024 | The scene revealed behind the couple's names. Architecture, florals, depth, atmosphere. **The middle must be open and quiet** — the names and the date card are drawn on top of it. |
| `wax-seal.png` | 816 × 816 | A wax seal, transparent background, viewed straight down, thin metallic rim, soft sheen on the wax. **The centre must be completely blank.** |
| `paper-texture.jpg` | 800 × 800 | Subtle, tileable paper or fabric grain in the palette. |

#### The wax seal, in detail

This one matters more than its size suggests — it is the first thing a
guest taps.

It must read as **real wax**: thick, dimensional, with soft irregular
scalloped edges where it spread when pressed, a glossy sheen catching the
light, and subtle depth variation across the surface. Not a flat coloured
circle.

Inside the wax, press a **raised gold ornament** in the theme's style — a
laurel wreath, a floral ring, a jali border, a beaded circle. Rendered as
embossed metal with its own highlights and shadow.

**Leave the middle clear.** The ornament is a ring or frame around an empty
centre, roughly 40% of the width, where the couple's initials are printed
in live text by our engine.

So: **ornament yes, letters no.** A gold wreath is wanted. The letters "AA"
or any other initials, monogram or emblem inside it are not.

Transparent background, viewed straight down, 816×816.

#### Rules for every image

- **No text.** No words, no lettering, no numbers, no dates, no names.
- **No watermarks.**
- **No human faces.**
- Nothing busy in the centre of either backdrop.

### Build rules

- **Mobile first**, 320px to 4K. Nearly every guest opens this on a phone.
- Define **all colours as CSS custom properties on `:root`**. Never hardcode
  a colour inside a component.
- **Two Google Fonts**: one display serif for names and headings, one clean
  sans for labels and counters.
- Anchor the countdown and every date to an **explicit `+05:30` offset**,
  never the guest's own clock. A guest in Dubai or London must see the
  couple's time.
- Placeholder content: **"Aarav & Anaya"**, **14 February 2027**, **"The
  Grand Pavilion"**.
- Respect `prefers-reduced-motion`.

### Finish by telling me

1. **Every colour as a hex value**, labelled with the roles in Part 4 below.
2. **The two Google Font names.**
3. **Where the four image files are** in the project.

---

## Part 3 — The ten aesthetics

One per template. Paste into the `AESTHETIC` block above.

Ordered by what competitor research says sells. **Start with 1–3.**

### 1. Mughal Zamarrud
**Palette:** deep emerald green with antique gold
**Scene:** a Mughal palace gateway at dusk — carved marble jali screens, an emerald-inlaid arch, lit brass lanterns, a still reflecting pool
**Feeling:** opulent, candlelit, hushed

### 2. Kesari Mandap
**Palette:** marigold and saffron with deep red
**Scene:** a wedding mandap at golden hour — thick marigold garlands, carved pillars wrapped in banana leaf, brass urns, petals scattered across warm stone
**Feeling:** festive, sunlit, alive

### 3. Kanjeevaram
**Palette:** maroon silk with gold zari
**Scene:** a South Indian temple courtyard at dawn — a carved gopuram, strung jasmine, rows of brass oil lamps, a kolam drawn on the floor
**Feeling:** sacred, warm, unhurried

### 4. Royal Jaipur
**Palette:** crimson and gold
**Scene:** a Jaipur palace gate — carved sandstone arches, painted floral frescoes, live peacocks either side, brass lanterns, marigold bowls, light reflecting off polished marble
**Feeling:** regal, grand, cinematic

### 5. Midnight Mayura
**Palette:** peacock navy and teal with gold
**Scene:** a palace terrace at night — latticed balconies, lotus pools under moonlight, peacock feathers, hanging lamps
**Feeling:** cool, jewelled, still

### 6. Noor-e-Nikah
**Palette:** ivory, emerald and gold
**Scene:** a mosque courtyard at evening — a scalloped arch, Arabic calligraphy carved into stone, hanging brass lamps, white roses
**Feeling:** serene, luminous, reverent

### 7. Blush Garden
**Palette:** blush pink and rose gold with sage
**Scene:** an English garden in early morning — climbing roses, pale drapes on a pergola, dew, soft diffused light
**Feeling:** romantic, airy, gentle

### 8. Haveli Bandhej
**Palette:** terracotta, rose and indigo
**Scene:** a Rajasthani haveli courtyard — jharokha windows, bandhani cloth hung to dry, Jaipur blue pottery, a painted elephant motif on the wall
**Feeling:** handmade, sun-baked, characterful

### 9. Phulkari Anand
**Palette:** saffron and ivory with gold
**Scene:** a gurdwara courtyard at sunrise — phulkari embroidered cloth, marigold strings, a canopy in soft morning light
**Feeling:** bright, devotional, warm

### 10. Monochrome Vow
**Palette:** ivory and charcoal
**Scene:** a modern stone colonnade — white florals, deep shadow, raking light, nothing ornate
**Feeling:** editorial, restrained, expensive

---

## Part 4 — The exact output we need

A finished template on our side is **four images, fourteen colours and two
font names**. Nothing else. Everything else is shared engine code that
already exists.

### The fourteen colour roles

Give each as a hex value. This is what the roles drive:

| Role | Used for |
|---|---|
| `accent` | The metallic. Seal rim, ornaments, countdown separators, the ampersand between names |
| `accentSoft` | Lighter metallic — hairline borders, underlines |
| `tint` | Secondary colour — petals, overlays |
| `paper` | The envelope or door body |
| `paperLight` | Its lit edges and inner sheet |
| `paperDark` | Its shadowed edges |
| `highlight` | Near-white inner glow |
| `surface` | Page background once opened |
| `scratchFoil` | Mid-tone of the scratch panel |
| `scratchInk` | Lettering and stippling on the scratch panel |
| `background` | Deepest background |
| `foreground` | Body text |
| `muted` | Small caption text |
| `border` | Hairlines |

### A filled example — our working Dubai Silk template

```
accent        #B08D3F   gold
accentSoft    #D9C08A
tint          #C6D6E8   powder blue
paper         #D3E0EE   envelope body
paperLight    #E7EEF6
paperDark     #BCCFE2
highlight     #FBFAF6
surface       #E9F0F7
scratchFoil   #C9D9E8
scratchInk    #2B3A4A
background    #FBFAF6
foreground    #2A3A4A
muted         #5E6E7E
border        #D6CBAE

serif  Cormorant Garamond
sans   Montserrat

sealed-backdrop.jpg   pearl silk, softly draped
hero-backdrop.jpg     painted arch framing the Burj Khalifa, powder-blue
                      florals, white drapes
wax-seal.png          powder-blue wax disc, thin gold rim, BLANK centre
paper-texture.jpg     fine cotton-rag grain
```

### How to hand it back

**Best:** export the whole Lovable project and send it.

**Minimum, per template:** the four image files, the fourteen hex values,
and the two font names.

We do not need Lovable's code. We have the engine.

---

## Part 5 — Hard rules

### The wax seal must be blank

**No letters. No initials. No monogram.**

A decorative gold ring — wreath, floral border, jali frame — is wanted, and
makes the seal look expensive. What must not appear is **lettering** in the
clear middle.

Our engine prints each couple's own initials onto the seal. A seal with
letters baked into the image means every customer receives somebody else's
monogram.

This has already gone wrong once: a seal was made with "UM" on it, and every
buyer of that template would have received those initials on their
invitation.

If Lovable puts letters on the seal, ask again.

### Leave the centre of both backdrops quiet

The couple's names, the date card and the scroll cue are drawn **on top of**
`hero-backdrop.jpg`. The closed object sits in the middle of
`sealed-backdrop.jpg`. If either has dense detail through the middle, the
text becomes unreadable and the object disappears into the scene.

Rich at the edges. Calm in the centre.

### Music needs commercial rights

Every customer's invitation plays the track, so a licence covering personal
use only is not enough — this is being resold inside a product.

Public-domain classical recordings (Dvořák, Debussy, Satie, Chopin on
Wikimedia Commons under CC0) are the safest source and the right register.
If Lovable suggests a track, ask where it came from and under what licence.

### No text inside the images

Names, dates and venue are rendered as live HTML so every customer's own
details appear. Any wording painted into a backdrop would be stuck there for
every buyer.

---

## Part 6 — Checklist before sending a template back

- [ ] Both backdrops are **painted scenes** with depth and warm light — not
      flat colour, gradients or geometric pattern
- [ ] Both backdrops have a **calm, open centre**
- [ ] The wax seal centre is **completely blank**
- [ ] **No text, numbers or watermarks** in any image
- [ ] All four files exported at the sizes in Part 2
- [ ] Fourteen hex values supplied, labelled by role
- [ ] Two Google Font names supplied
- [ ] The opening animation runs about **1.5 seconds** and feels weighted
- [ ] Music only starts **after** the tap and fades in over 8 seconds
- [ ] It looks right on a **phone** — that is where it will be opened
