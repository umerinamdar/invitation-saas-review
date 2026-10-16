# Invitation SaaS — Build Plan

Turning the Umer & Maimoona invite into a multi-template product.

---

## 0. Decisions

| Question | Decision |
|---|---|
| Pricing | **Free preview → ₹599 to publish** |
| RSVP / guest messaging | Deferred to v2 |
| Invite URLs | `yoursite.com/i/$slug` — path, not subdomain |
| Launch scope | 10+ themes *(see timing note, §9)* |
| Business entity | **Still open** — checkout built gateway-agnostic |

### Entity — still open

You live in Dubai but you're targeting India's wedding/festive season. These need different payment setups:

| Your entity | Gateway | Why |
|---|---|---|
| **Indian** (proprietorship/company) | **Razorpay** | UPI support — most Indian customers pay by UPI, not card. Best rates for INR. What Zareqia uses. |
| **UAE** | Stripe UAE, Telr, PayTabs, or Network International | Stripe works in UAE and accepts Indian cards, but **UPI support is weak** |

**This matters a lot.** If Indian customers can't pay by UPI, conversion drops hard. If you can register an Indian entity (or use a family member's), Razorpay is the strong choice. Otherwise plan for lower conversion and price accordingly.

Everything else in this plan is gateway-agnostic — the checkout layer is swappable.

---

## 1. Architecture: engine + theme + invite

Three separate layers. This is the core idea that makes 20 templates cheap.

```
ENGINE (write once, never changes)
  envelope open · scratch canvas · audio fade · countdown
  milestone math · scroll sections · petals · music dock

THEME (one file + 2-4 images per template — 20 of these)
  palette · fonts · backdrops · seal · textures · default music

INVITE (one database row per paying customer)
  names · date · venue · sub-events · uploaded photos · slug
```

Render = `engine(theme, invite)`.

---

## 2. Theme config structure

One file per template: `src/themes/dubai-silk.ts`

```ts
export const dubaiSilk: Theme = {
  id: 'dubai-silk',
  name: 'Dubai Silk',
  tier: 'royal',                    // pricing tier
  occasions: ['wedding', 'engagement'],
  thumbnail: '/themes/dubai-silk/thumb.jpg',

  palette: {
    primary:   '#d4af37',           // gold — seal, accents, ornaments
    surface:   '#f4f6fa',           // powder blue — section backgrounds
    text:      '#1e293b',
    textMuted: '#64748b',
    envelope:  '#dce8f5',           // envelope paper
    flap:      '#c9dcf0',           // flap (slightly darker)
    veil:      'rgba(244,246,250,0.55)',   // overlay on hero image
  },

  typography: {
    serif: 'Cormorant Garamond',    // names, headings
    sans:  'Montserrat',            // labels, counters
    googleFonts: 'Cormorant+Garamond:wght@300;400;500&family=Montserrat:wght@300;400;600',
  },

  assets: {
    sealedBackdrop:   '/themes/dubai-silk/silk.jpg',      // behind envelope
    revealedBackdrop: '/themes/dubai-silk/skyline.jpg',   // hero after opening
    waxSeal:          '/themes/dubai-silk/seal.png',
    foilTexture:      '/themes/dubai-silk/gold-foil.jpg', // scratch card
    paperTexture:     '/themes/dubai-silk/paper.jpg',
    defaultMusic:     '/themes/dubai-silk/track.mp3',
  },

  motion: {
    envelopeOpenMs: 1400,
    introSeconds:   6,
    musicFadeMs:    8000,
    maxVolume:      0.6,
    scratchThreshold: 0.38,
    petals: 'white-blossom',        // 'white-blossom' | 'marigold' | 'rose' | 'none'
  },

  ornament: '✧',
}
```

**To add a template you provide:** 4-6 images, 1 music track, ~10 hex values, 1 font pair. That's it. No React.

### Theme ideas for 20 templates

| # | Theme | Palette | Occasions |
|---|---|---|---|
| 1 | Dubai Silk *(done)* | Powder blue + gold | Wedding, Engagement |
| 2 | Mughal Heritage | Maroon + antique gold | Wedding, Nikah |
| 3 | Marigold Mandap | Marigold + emerald | Wedding, Haldi |
| 4 | Royal Rajput | Deep red + ivory | Wedding |
| 5 | Palm Beach | Turquoise + sand | Destination, Reception |
| 6 | Minimal Ivory | Ivory + charcoal | Any — the "modern" option |
| 7 | Emerald Night | Emerald + gold | Reception, Gala |
| 8 | Blush Garden | Blush pink + sage | Engagement, Baby shower |
| 9 | Midnight Gold | Navy + gold | Reception, Anniversary |
| 10 | Sangeet Lights | Magenta + violet | Sangeet, Party |
| 11 | Diwali Diya | Saffron + deep red | Diwali, Festive |
| 12 | Peacock | Teal + gold | Wedding, South Indian |
| 13 | Temple South | Kanjeevaram red + gold | South Indian wedding |
| 14 | Lotus Serenity | Soft pink + cream | Engagement |
| 15 | Desert Rose | Terracotta + dusty rose | Destination |
| 16 | Black Tie | Black + silver | Corporate, Gala, Opening |
| 17 | Birthday Confetti | Bright multi | Birthday |
| 18 | Little One | Pastel mint/lemon | Baby shower, Naming |
| 19 | New Home | Warm wood + sage | Housewarming |
| 20 | Monsoon Bloom | Deep green + ivory | Any |

Themes 17-19 are non-wedding — those keep you earning **outside** wedding season, which matters for Instagram traffic year-round.

---

## 3. Invite config (per customer)

```ts
type Invite = {
  slug: string;                     // umer-maimoona-2026 → /i/umer-maimoona-2026
  themeId: string;
  occasion: 'wedding' | 'engagement' | 'birthday' | 'housewarming' | ...;

  hosts: {
    mode: 'couple' | 'single';
    person1: string;
    person2?: string;
  };

  event: {
    typeLabel: string;              // "Engagement Ceremony"
    startIso: string;               // 2026-11-22T19:00:00+05:30
    timezone: string;               // Asia/Kolkata | Asia/Dubai
    displayText: string;            // "Sunday, 22 November 2026 • 7:00 PM onwards"
    venueName: string;
    venueMapsUrl?: string;
  };

  subEvents?: Array<{               // Mehendi / Sangeet / Reception
    label: string;
    dateText: string;
    timeText: string;
    venueName?: string;
  }>;

  story?: {
    togetherSinceIso?: string;      // powers years/months/days counter
    quote?: string;
  };

  gallery: Array<{ slot: string; url: string; alt: string }>;

  music: { source: 'theme' | 'custom'; url?: string };

  settings: {
    scratchEnabled: boolean;
    language: 'en' | 'hi' | 'ur' | 'ta';
    showCountdown: boolean;
    privateAfterEvent: boolean;     // auto-hide N days after
  };
}
```

**Validated with Zod** — you already have `schemas/invitationSchema.ts` as a starting point.

---

## 3b. Free-preview model (₹599 to publish)

Customer builds the entire invite for free, pays only to make it shareable. Highest conversion of the options — they're invested by the time they hit the paywall — but it needs three things built carefully.

### Invite lifecycle

```
draft ──────────► preview ──────────► published ──────► archived
(editing)        (watermarked,       (clean, public,    (after event +
                  private link)       shareable)         privacy delay)
```

### 1. The watermark

The preview must be **good enough to fall in love with, useless to actually send.**

- Diagonal repeating wordmark across the hero, ~12% opacity
- A small persistent "Preview — publish to share" chip in the corner
- **Not** destructive: don't blur faces or mute music. They need to see the real thing to want it.

### 2. Preview links are private

Preview URL is `/p/$token` with an unguessable token — **not** `/i/$slug`.

- No OG tags, `noindex`
- Token rotates on publish
- This matters: if previews unfurl nicely on WhatsApp, a chunk of customers will just send the watermarked version and never pay.

### 3. Abandoned drafts cost you money

Free users upload photos and music. Most never pay. Without a cleanup policy your storage bill grows with every non-customer.

```sql
-- nightly job
delete from invites
where status = 'draft'
  and updated_at < now() - interval '30 days';
-- cascades to invite_assets; a storage hook removes the files
```

Email at day 23 ("your invite expires in a week") — that reminder is also your best conversion nudge.

### Upload limits for unpaid drafts

| | Draft | Published |
|---|---|---|
| Images | 5 | 15 |
| Image size | 5 MB | 10 MB |
| Custom music | ✗ theme tracks only | ✓ |

Custom music upload is a paid feature — it's the most abused upload slot and a nice reason to convert.

### Pricing note

₹599 against Zareqia's ~₹2,300 is roughly **4× cheaper**. That's a volume play: it works if Instagram sends real traffic, and it leaves no room for paid ads (your CAC would exceed revenue). Organic reels and wedding hashtags have to carry it.

Keep the code tier-aware (`tier` already exists on `orders`) so you can add a ₹1,499 premium tier later without a refactor.

---

## 4. Database schema (Supabase / Postgres)

```sql
-- Customer profiles (extends Supabase auth.users)
create table profiles (
  id          uuid primary key references auth.users on delete cascade,
  full_name   text,
  phone       text,
  created_at  timestamptz default now()
);

-- One row per invite
create table invites (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references profiles(id) on delete cascade,
  slug          text unique not null,
  theme_id      text not null,
  occasion      text not null,
  config        jsonb not null,            -- the Invite object above
  status        text not null default 'draft',
                -- draft | preview | published | archived
  preview_token text unique,                -- private /p/$token link

  published_at  timestamptz,
  event_date    timestamptz,               -- denormalised for cron/privacy
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);
create index on invites (user_id);
create index on invites (slug) where status = 'published';

-- Customer uploads (photos, custom music)
create table invite_assets (
  id          uuid primary key default gen_random_uuid(),
  invite_id   uuid not null references invites(id) on delete cascade,
  kind        text not null,               -- hero | gallery | music
  slot        text,
  storage_path text not null,
  bytes       int,
  created_at  timestamptz default now()
);

-- Payments
create table orders (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references profiles(id),
  invite_id       uuid references invites(id) on delete set null,
  tier            text not null,           -- classic | royal
  amount_minor    int not null,            -- paise/fils — never store floats
  currency        text not null default 'INR',
  gateway         text not null default 'razorpay',
  gateway_order_id text unique,
  gateway_payment_id text,
  status          text not null default 'created',
                  -- created | paid | failed | refunded
  created_at      timestamptz default now(),
  paid_at         timestamptz
);

-- Page view analytics (Zareqia sells this as a feature)
create table invite_views (
  id          bigserial primary key,
  invite_id   uuid not null references invites(id) on delete cascade,
  viewed_at   timestamptz default now(),
  referrer    text,
  country     text
);
create index on invite_views (invite_id, viewed_at);

-- Guest messages / RSVP (v2)
create table guest_messages (
  id          uuid primary key default gen_random_uuid(),
  invite_id   uuid not null references invites(id) on delete cascade,
  guest_name  text not null,
  message     text,
  attending   boolean,
  created_at  timestamptz default now()
);
```

**Row Level Security** — essential, this is what keeps customer A from reading customer B's invites:

```sql
alter table invites enable row level security;

create policy "own invites" on invites
  for all using (auth.uid() = user_id);

create policy "published invites are public" on invites
  for select using (status = 'published');
```

Storage bucket `invite-media`, path convention `{user_id}/{invite_id}/{filename}`, with a matching policy.

---

## 5. Pages / routes

### Public (no login)
| Route | Purpose |
|---|---|
| `/` | Landing — hero, sample invite, occasions, social proof, CTA |
| `/templates` | Gallery of all themes, filter by occasion |
| `/templates/$themeId` | Single theme detail + "Preview live" |
| `/demo/$themeId` | Full working demo with placeholder data |
| `/pricing` | Tiers |
| **`/i/$slug`** | **The actual invite. SSR + OG tags for WhatsApp previews.** |
| `/about` `/contact` | |
| `/terms` `/privacy` `/refund` | **Required for payment gateway approval — not optional** |

### Authenticated
| Route | Purpose |
|---|---|
| `/login` `/signup` | Supabase auth (email + Google; phone OTP later) |
| `/dashboard` | My invites — status, views, edit/share |
| `/dashboard/new` | Pick theme → editor |
| `/dashboard/invites/$id` | **Editor: form left, live phone preview right** |
| `/dashboard/invites/$id/share` | QR code, WhatsApp share, copy link |
| `/checkout/$inviteId` | Payment |

### Server routes
| Route | Purpose |
|---|---|
| `POST /api/orders` | Create gateway order |
| `POST /api/webhooks/razorpay` | **Verify signature server-side**, mark paid |
| `POST /api/views/$slug` | Record a view |
| `GET /i/$slug/og.png` | Generated preview image for WhatsApp |

**The OG image matters more than it sounds.** Your entire distribution is people forwarding links on WhatsApp. A link that unfurls with the couple's names and a beautiful image gets opened; a bare URL doesn't.

---

## 6. Build phases

| Phase | Work | Outcome |
|---|---|---|
| **1** | Extract engine from hardcoded values; build `Theme` + `Invite` types; render from config | Your invite still works, now data-driven |
| **2** | Build themes #2 and #3 | Proves the theme system; you learn the real per-theme cost |
| **3** | Supabase: auth, schema, RLS, storage | Accounts work |
| **4** | Editor with live preview; `/i/$slug` published route | Someone can make an invite |
| **5** | Payment gateway + webhook + tier gating | Someone can **buy** an invite |
| **6** | Landing, gallery, legal pages | Launchable |
| **7** | Themes #4-10 | Real catalog |
| **8** | Analytics, guest messages, calendar add, multi-language | Feature parity with Zareqia |

**Phases 1-6 = your MVP.** Launch there, add themes with revenue coming in.

---

## 7. What you need to provide

### Per theme (the main ongoing work)
- [ ] **Sealed backdrop** — 1536×1024, the surface the envelope rests on (silk, marble, wood, fabric)
- [ ] **Revealed backdrop** — 1536×1024, the hero scene behind the names
- [ ] **Wax seal PNG** — transparent, ~800×800 (can be recoloured per theme from one master)
- [ ] **Foil texture** — for the scratch card
- [ ] **Paper texture** — subtle, tileable
- [ ] **Music track** — 60s+, loops cleanly, **royalty-free with commercial rights**
- [ ] Palette (I can pull from your backdrop) + font pairing (I can suggest)

> Generate backdrops with AI the same way you made the Dubai artwork — you own the output and there's no licensing question. Music is the one thing to be careful with: every customer's invite plays it, so you need broad commercial rights.

### Business setup
- [ ] **Decide entity: India or UAE** (see section 0)
- [ ] Payment gateway account + KYC — *start this early, approval takes days*
- [ ] Supabase project (free tier is fine to start)
- [ ] Domain name
- [ ] Brand name + logo
- [ ] Vercel account for hosting

### Content
- [ ] Pricing (my suggestion: single tier **₹999–1,499** to undercut Zareqia's ~₹2,300; add a Royal tier later)
- [ ] Legal page text — terms, privacy, refund policy (templates exist; gateway requires them)
- [ ] 2-3 demo invites with fake data for the gallery

---

## 8. Still open

1. **India or UAE entity?** Blocks the payment gateway only — phases 1-4 proceed without it. Start KYC as soon as you decide; approval takes days.
2. **Brand name + domain** — needed before the landing page (phase 6).

---

## 9. Timing note — worth reading

**Today is 16 October 2026. Indian wedding season is already underway** and runs through roughly December, then again January–February.

Launching with 10+ themes means building the engine, the free-preview paywall, checkout, the landing page *and* ten theme packs before a single rupee comes in. Realistically that's several weeks, which puts you in **December at the earliest — most of this season gone.**

The architecture makes this a non-decision, though: **themes are additive.** Once the engine is built, adding theme #7 touches nothing but a config file and some images. You can ship with whatever's ready and keep adding weekly.

**Suggested approach:** build phases 1-6 with 4-5 themes, launch, then add themes continuously while earning. The gallery grows in public — which is also good Instagram content ("3 new designs this week"). You decide the launch moment based on what's ready, not on a number picked today.

If you'd rather hold for 10, that's a legitimate call — just make it knowing the trade is this season's revenue for a fuller gallery.
