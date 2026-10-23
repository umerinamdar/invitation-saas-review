# Reference animation audit — EasyInviteMaker premium round

References studied as motion/presentation principles only. No branding,
content, assets or code copied from any of them.

Method note: each site is marked **Observed** (directly seen in playback
or on the live page), **Inferred** (implementation guessed from observed
behaviour), or **Not verified** (could not be checked). The Digital Yes
was analysed in depth on 2026-10-22 (6 reels frame-by-frame + live demo
pages timed in the browser; full spec in
`~/workspace/instagram/THEDIGITALYES-INVITE-ANIMATION-SPEC.md`) and
re-verified live on 2026-10-23 (homepage + Stained Glass demo);
Invitima and Zareqia were visited live on 2026-10-23 (homepages plus
two full invitation demos each). Exact durations/easings on all three
sites are estimates from observed state changes — no frame-accurate
measurement tooling was available in the browser — and mobile-viewport
behaviour on the two new references is unverified (desktop viewport;
their invitations render in phone-width columns by design).

## A. The Digital Yes (thedigitalyes.com) — visual quality reference

### Observed (2026-10-22, reels + live demos; re-verified live 2026-10-23)

Live re-check (homepage + `/demo/stained-glass`, 2026-10-23) added:

- **Marketing hero entrance is a staggered blur-to-sharp text reveal**
  (lines resolve in sequence, ~2–3s total, estimated) — an entrance with
  a *material* quality (focus pulling in) rather than a generic fade-up.
  This is the one marketing pattern we have not adopted: our hero uses
  the Reveal fade/lift. Noted as a candidate if the hero is ever
  revisited; not copied this round (blur filters on large text are a
  known low-end-mobile cost, and the current entrance was just fixed).
- Hero phones **cycle invitation screens with scroll** and the floating
  illustrations drift (parallax). Observed; mechanism (scroll-linked vs
  auto-cycle) not determined.
- Stained Glass demo: stained-glass **double doors**, "TAP TO OPEN",
  ~1–2s, after a ~1–2s "Loading live demo…" state. In *this* demo the
  cover text arrives with the cover right after the doors — the
  text-last staging was observed on the envelope demos, so the rule is
  "text settles as/after the gesture completes", not a universal delay.
- Demo section order confirmed live: cover → countdown → welcome →
  scratch-to-reveal photo → formal welcome → ceremony → dress code →
  program → gifts → travel & stay → RSVP → footer. Music toggle fixed
  bottom-right inside the phone frame (playback not verified).
- Homepage sections otherwise render without visible scroll-triggered
  theatrics; accordions animate smoothly (~300ms); gallery is a
  horizontal phone-card row with badges and "From $199" pricing.
- **Not verified**: exact font families (no devtools), exact durations/
  easings (estimates), marketing pages at mobile viewport.

- **The invitation is one continuous vertical scroll.** No cuts, page
  flips, or per-section transitions between sections in the demos; a
  section stack in a fixed order: sealed cover → title → countdown →
  family/welcome message → (decorative interlude) → schedule timeline →
  dress code → transport → where to stay → gifts → **RSVP last**.
- **Smoothness = continuity + repetition**: a constant decorative frame
  (lace/embroidery border), palette, typography rhythm and spacing
  carried through every section; nothing loads or pops mid-scroll.
- **Openings are a separate, single gesture before the scroll**: two
  families, never mixed — UNFOLD (envelope) and PART (doors/curtains).
  Envelope sequence on their Mother of Pearl demo totals ~4–5s: seal as
  latch → one slow unfold (flaps ~1.5–2s) → inner card already in place
  → title **text fades in last** (~1–1.5s). Doors/curtains demos ~2–3.5s.
  One moving part at a time; the split line is drawn into the closed
  artwork; the title sits *behind* the cover, it never rises or morphs.
- **One easing per opening**, symmetric ease-in-out feel
  (`cubic-bezier(0.42, 0, 0.58, 1)` in our reproduction).
- Interactive moments are rationed — at most one per invitation besides
  the opening: a scratch-to-reveal (photo or date) in some designs, the
  live countdown, music starting on the cover tap with a mute control.
- Marketing presentation: designs shown as the invitation itself (phone
  presentation), generous whitespace, serif display type, restrained
  copy; the product is the visual.

### What makes it effective

Restraint as a system: because only the opening is animated, it gets the
guest's full attention; because the scroll never animates, it never
janks, shifts, or tires. The constant frame does the "premium" work.

### Adaptation into EasyInviteMaker (done / planned)

| Their pattern | Our adaptation | Status |
|---|---|---|
| Single-gesture opening, one easing, text last | All 5 mechanics unified to `cubic-bezier(0.42,0,0.58,1)`; envelope sheet sequenced behind the flap; cinematic intro already fades names in staged order | Done this round |
| No per-section scroll animation | We deliberately do **not** add reveals inside the opened invitation; marketing pages keep their single Reveal system | Done (by restraint) |
| Fixed section stack ending at RSVP | Already the engine's order (title → venue/countdown → sub-events → family → story → logistics → RSVP → hashtag) | Already aligned; order not changed |
| Music on open gesture, visible control | Already implemented (gesture-primed, dock with labels, restart for all themes) | Already aligned |
| One interactive extra (scratch) | Already implemented (scratch date reveal, keyboard-activatable) | Already aligned |
| Preload so nothing pops mid-scroll | Engine preloads artwork with deadline + slow notice | Already aligned |

## B. Invitima (invitima.com) — Indian wedding design reference

Visited live 2026-10-23: homepage, `/templates/royal-gateway`,
`/template-frame/royal-gateway`, `/template-frame/noor-e-nikah`.
All statements below are **Observed** unless marked Inferred.

### Observed

- **Homepage**: full-screen loader ("Preparing your invitations" with a
  percentage), then a cream/blush page — serif headline, maroon pill
  CTAs, an infinite marquee of phone-framed theme opening screens and a
  keyword ticker. Gallery: 14 theme cards (phone mockup of the opening
  screen, gold category tag, serif title, two swatch dots, feature
  pills, Live demo / Use theme), category filter pills. Hovering a card
  reveals a "Preview" eye pill over the phone (the same affordance our
  gallery already uses).
- **Openings are staged, theatrical, per-theme mechanisms.** Royal
  Gateway: closed painted peacock palace gate with marigold garlands and
  a bouncing "TAP TO OPEN" — tapping swings the gate doors open onto a
  golden hall with the card at centre (~1–3s, Inferred from state
  change; not frame-measured). Noor-e-Nikah: cream envelope, embossed
  floral relief, gold wax seal with monogram, "TAP THE SEAL TO OPEN" —
  seal breaks → top flap swings up → card rises out → overlay clears
  (staged beats within an ~8s window, Inferred timing).
- **One skeleton, total re-skin.** Both demos share the identical
  section structure and even placeholder data; identity comes from
  opening mechanism, palette, ornament language (peacock/jharokha/
  velvet-scroll vs Mughal domes/paisley/meenakari borders), section
  naming and voice. Our engine already works this way (one engine ×
  theme skin) — validated as the right architecture.
- **Typography**: high-contrast Didone-style serif for names/titles,
  calligraphy script for emotional lines, letterspaced sans caps for
  eyebrows/buttons. Multilingual as *content*, not UI chrome: Arabic
  basmala in Arabic script with transliteration on the Muslim theme,
  Roman-script Hindi phrases, an English Quran translation. No
  Devanagari observed on visited pages.
- **Signature extras**: velvet-scroll event cards on a gold timeline
  with a small car illustration travelling as scroll-progress; jharokha-
  arch gallery carousel with counter; scratch-to-reveal date under gold
  foil (with a "Reveal" accessibility button — we match this with our
  keyboard-activatable scratch card); wishes wall; ambient floating
  petals/particles.
- Mobile: demos render in a fixed phone-width column (mobile-first
  signal); true mobile viewport **Not verified** (no emulation).

### Adaptation for EasyInviteMaker

- Staged envelope beats (seal → flap → sheet) confirm our sequencing
  direction; we sequenced the sheet behind the flap this round. We do
  **not** copy the bouncing CTA or the percentage loader — our cover is
  the trigger itself, which is cleaner.
- Their gallery cards lead with the *opening screen* in the phone —
  ours now render the theme's four feature pills under the tagline,
  which were previously in the data but never displayed.
- The travelling timeline indicator is a lovely idea and a deliberate
  non-goal: it is exactly the kind of per-scroll effect the primary
  benchmark (The Digital Yes) proves unnecessary.

## C. Zareqia (zareqia.com) — interaction/animation reference

Visited live 2026-10-23: homepage + two demos
(`/invite/demo?template=royal-grace`,
`/invite/demo?template=rose-gold-blush-royal`). **Observed** unless marked.

### Observed

- **Demos open behind an animated full-screen gate**, after a
  "Preparing your invitation" loading overlay (~5–15s in session; no
  layout shift after render). royal-grace: ornate gate panel → tap →
  curtains part centre-to-sides (~1–3s, ease-out feel) → hero text fades
  in, curtains remain at the edges as a frame while scrolling.
  rose-gold-blush-royal: white wrought-iron double doors with a satin
  bow → tap the bow → doors swing inward in 3D (~1–3s) → hero fades in
  over a full-bleed photo. **No envelope opening on either demo** (their
  marketing lists "3D door reveals, curtains, sparkles & more").
- **Scratch-to-reveal on both demos**: heart-shaped glitter coating over
  the date card; drag erases only where dragged, cleared areas stay
  cleared, **no threshold auto-reveal observed** (ours auto-reveals at
  38% and is keyboard-activatable — we keep ours; it is the more
  forgiving interaction).
- **Countdown ticks live every second, digits update in place — no flip
  animation.** Matches ours; confirms digit theatrics are not expected
  in this product category.
- **Music auto-starts after the tap-to-open**, speaker toggle top-right
  mutes/restores. Same gesture-primed pattern as ours.
- **Sections fade/slide in once on first scroll entry, then stay static**
  — a middle path between The Digital Yes (no reveals) and heavy
  per-section animation. Our invitation deliberately follows The
  Digital Yes; Zareqia's homepage does use fade-up entrances and
  scroll-triggered reveals, as does our marketing site.
- Extras: auto-rotating photo carousel (~4s), inline "Save the Date"
  calendar dropdown, full RTL language toggle with a "Translating…"
  state (~1–2s), embedded Google Map, RSVP form (tested, not submitted).
- **Not verified**: mobile/touch behaviour (desktop viewport only),
  modal transitions (none triggered), exact durations/easings
  (approximations from state changes, not frame measurements).

## Comparison table

| Reference | Observed interaction | What makes it effective | EasyInviteMaker adaptation | Implementation | Priority | Observed / inferred |
|---|---|---|---|---|---|---|
| The Digital Yes | Single-gesture envelope/door opening, then unanimated continuous scroll | Attention concentrated on one moment; zero jank after it | Unify opening easings; no in-invitation scroll reveals | CSS transitions in `styles.css` + token system | P1 | Observed (reels + live demos, 2026-10-22) |
| The Digital Yes | Title text fades in last, after cover fully opens | The names land as the payoff, not mid-gesture | Cinematic intro stages skyline → names → invitation (existing); envelope sheet sequenced behind flap | `CinematicInvite` (existing) + `styles.css` sequencing | P1 | Observed |
| The Digital Yes | Fixed section stack, RSVP last, constant frame per design | Predictability reads as polish; frame carries identity | Keep engine order; per-theme frame/ornament already exists (`OrnateFrame`, section backdrop) | Existing engine | P2 | Observed |
| The Digital Yes | Scratch-to-reveal as the single interactive extra | One delight, rationed | Existing scratch date card, keyboard-activatable | `ScratchInvitation` (existing) | — | Observed |
| The Digital Yes | Staggered blur-to-sharp hero text reveal (~2–3s) | Material, editorial entrance; the page "focuses" | Candidate for a future hero pass; not adopted (filter cost on low-end phones, hero entrance just stabilised) | CSS filter transition if adopted | P3 | Observed (live, 2026-10-23) |
| Invitima | Staged envelope: seal breaks → flap swings → card rises → overlay clears | Ceremony in beats; each beat readable | Envelope sheet sequenced behind the flap (one moving part at a time) | `styles.css` envelope transitions + delay | P1 | Observed (timing inferred) |
| Invitima | One skeleton, total re-skin per theme; identity via opening + ornament + voice | Catalog breadth without engineering breadth | Already our architecture (engine × theme); reinforced — no change | Existing engine/themes | — | Observed |
| Invitima | Gallery cards show the opening screen in a phone + feature pills + swatches | Shoppers compare the actual differentiator | Theme features now rendered as pills on our cards (were in data, never shown) | `theme-card.tsx` + `.feature-pills` CSS | P2 | Observed |
| Invitima | Scratch date with a "Reveal" accessibility button | Interactive extra stays usable without the gesture | Ours is keyboard-activatable with no visible button (AGENTS.md rule) — equivalent, kept | `ScratchInvitation` (existing) | — | Observed |
| Zareqia | Curtain/door gate ~1–3s ease-out, hero text fades in as it completes | Same single-gesture family as TDY; confirms category norm | Confirms our opening retime direction (single easing, text settles last) | `styles.css` mechanics | P1 | Observed (timing estimated) |
| Zareqia | Countdown digits tick in place, no flip animation | The information is the motion | No digit theatrics added — matches ours | Existing countdown | — | Observed |
| Zareqia | Invitation sections fade/slide once on first entry | Middle path between TDY's none and heavy reveal systems | **Not adopted** — TDY is the user's chosen benchmark and proves none is smoother; noted as the alternative if the user ever wants it | — | — | Observed |
| Zareqia | Music auto-starts after tap-to-open, visible toggle | Guest never fights autoplay policies | Already ours (gesture-primed, dock toggle + restart) | Existing | — | Observed |
| Zareqia | Heart scratch with no auto-reveal threshold | Pure manual reveal | Ours (38% threshold + keyboard) is more forgiving — kept | Existing | — | Observed |
