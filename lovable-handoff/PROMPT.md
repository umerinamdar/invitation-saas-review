# The prompt

New Lovable project per template. Replace the `AESTHETIC` block each time
from AESTHETICS.md. Paste everything between the lines.

---

Build a **premium Indian wedding invitation microsite** — a single page a
guest opens on their phone. This is a luxury product people pay for. Finish
matters more than feature count. The benchmark is invitima.com.

## The experience, in order

**1. A sealed opening.** The whole screen is one richly painted scene with a
closed object in it — carved palace doors, a wax-sealed envelope, drawn
curtains. A small "Tap to open" plate sits on it, and the couple's names in
gold script beneath. Nothing else: no navigation, no scrollbar, no header.

A single tap opens it with a slow, weighted animation of about 1.5 seconds —
doors swinging inward on their hinges, a flap folding back, curtains sweeping
apart.

**2. A cinematic reveal**, about 6 seconds. The backdrop settles, the names
fade up, then the page becomes scrollable. One continuous motion into the
same page — not a second screen.

**3. Music** fades in over 8 seconds to roughly 60% volume, and only after
the tap. Prime it muted on that tap so mobile browsers permit playback.

**4. A scratch-to-reveal date card.** A foil panel the guest rubs with a
finger. At about 38% cleared it auto-reveals the date and time, then
unmounts so the page scrolls normally again.

**5. Scrollable sections below:** venue with a maps link, a live countdown,
the ceremony programme (Mehendi, Sangeet, Wedding, Reception), a photo
gallery, a quote, and a closing panel.

## AESTHETIC — replace this block per template

**Name:** Mughal Zamarrud
**Palette:** deep emerald green with antique gold
**Scene:** a Mughal palace gateway at dusk — carved marble jali screens, an
emerald-inlaid arch, brass lanterns, a still reflecting pool
**Feeling:** opulent, candlelit, hushed

## Artwork — this is the whole job

Generate original illustrations. **Photoreal and painterly**, in the register
of high-end wedding stationery: carved stone with real depth, fabric with
weight, warm practical light from lanterns and diyas, reflections on polished
floors.

Reference point: a painted Rajasthani palace gate with live peacocks, brass
lanterns, marigold bowls and light pooling on marble. That level of density
and craft.

**Not acceptable:** flat vector, clip art, stock-photo look, plain gradients,
geometric patterns standing in for a scene.

| File | Size | What it is |
|---|---|---|
| `sealed-backdrop.jpg` | 1536×1024 | The full scene holding the closed object — the palace gateway, the draped table, the curtained stage. Rich and detailed, but with a **calm centre** where the object sits. |
| `hero-backdrop.jpg` | 1536×1024 | The scene revealed behind the couple's names. Architecture, florals, depth. **The middle must be open and quiet** — names and the date card sit on top of it. |
| `wax-seal.png` | 816×816 | A wax seal, transparent background, viewed top-down, thin metallic rim, soft sheen. **Completely blank in the centre: no letters, no initials, no monogram, no emblem.** |
| `paper-texture.jpg` | 800×800 | Subtle tileable grain in the palette. |

**Every image: no text, no words, no lettering, no numbers, no watermarks,
no human faces.**

## Build rules

- **Mobile first**, 320px to 4K. Nearly every guest opens this on a phone.
- All colours as CSS custom properties on `:root`. Never hardcode a colour
  in a component.
- Two Google Fonts: a display serif for names and headings, a clean sans for
  labels and counters.
- Anchor the countdown and all dates to an explicit `+05:30` offset, never
  the guest's own clock.
- Seal-tap sound and background music as **two separate `<audio>` elements**,
  so one cannot interrupt the other.
- Placeholder content: "Aarav & Anaya", 14 February 2027, "The Grand
  Pavilion".

## Finish by telling me

1. Every colour as a **hex value**, labelled by role: accent, accent-soft,
   tint, paper, paper-light, paper-dark, highlight, surface, scratch-foil,
   scratch-ink, background, foreground, muted, border.
2. The **two Google Font names**.
3. Where the four image files are in the project.

---
