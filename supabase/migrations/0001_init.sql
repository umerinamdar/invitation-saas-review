-- Invitation SaaS — initial schema.
-- Run in Supabase → SQL Editor → New query → Run.

-- Profiles -----------------------------------------------------------------
create table if not exists profiles (
  id         uuid primary key references auth.users on delete cascade,
  full_name  text,
  phone      text,
  created_at timestamptz not null default now()
);

-- A row must exist before the first invite, so create it on signup.
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Invites ------------------------------------------------------------------
create table if not exists invites (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references profiles(id) on delete cascade,
  slug          text not null unique,
  preview_token text not null unique default encode(gen_random_bytes(12), 'hex'),
  theme_id      text not null,
  occasion      text not null default 'wedding',
  config        jsonb not null default '{}'::jsonb,
  status        text not null default 'draft'
                check (status in ('draft', 'published', 'archived')),
  event_date    timestamptz,
  published_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists invites_user_idx on invites (user_id);
create index if not exists invites_live_idx on invites (slug) where status = 'published';

create or replace function touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists invites_touch on invites;
create trigger invites_touch before update on invites
  for each row execute function touch_updated_at();

-- Uploads ------------------------------------------------------------------
create table if not exists invite_assets (
  id           uuid primary key default gen_random_uuid(),
  invite_id    uuid not null references invites(id) on delete cascade,
  kind         text not null check (kind in ('hero', 'gallery', 'music')),
  slot         text,
  storage_path text not null,
  bytes        integer,
  created_at   timestamptz not null default now()
);
create index if not exists invite_assets_invite_idx on invite_assets (invite_id);

-- Orders -------------------------------------------------------------------
-- Amounts are integer paise. Never store money as a float.
create table if not exists orders (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references profiles(id),
  invite_id          uuid references invites(id) on delete set null,
  tier               text not null default 'classic',
  amount_minor       integer not null,
  currency           text not null default 'INR',
  gateway            text not null default 'razorpay',
  gateway_order_id   text unique,
  gateway_payment_id text,
  status             text not null default 'created'
                     check (status in ('created', 'paid', 'failed', 'refunded')),
  created_at         timestamptz not null default now(),
  paid_at            timestamptz
);
create index if not exists orders_user_idx on orders (user_id);

-- Views --------------------------------------------------------------------
create table if not exists invite_views (
  id        bigserial primary key,
  invite_id uuid not null references invites(id) on delete cascade,
  viewed_at timestamptz not null default now(),
  referrer  text,
  country   text
);
create index if not exists invite_views_idx on invite_views (invite_id, viewed_at desc);

-- Row level security -------------------------------------------------------
-- Without these every signed-in visitor could read every couple's invite.
alter table profiles      enable row level security;
alter table invites       enable row level security;
alter table invite_assets enable row level security;
alter table orders        enable row level security;
alter table invite_views  enable row level security;

drop policy if exists "own profile" on profiles;
create policy "own profile" on profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "own invites" on invites;
create policy "own invites" on invites
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- A guest opening a shared link is anonymous, so published invites are public.
drop policy if exists "published invites are public" on invites;
create policy "published invites are public" on invites
  for select using (status = 'published');

drop policy if exists "own invite assets" on invite_assets;
create policy "own invite assets" on invite_assets
  for all using (
    exists (select 1 from invites i where i.id = invite_id and i.user_id = auth.uid())
  ) with check (
    exists (select 1 from invites i where i.id = invite_id and i.user_id = auth.uid())
  );

drop policy if exists "assets of published invites are public" on invite_assets;
create policy "assets of published invites are public" on invite_assets
  for select using (
    exists (select 1 from invites i where i.id = invite_id and i.status = 'published')
  );

-- Orders are readable by their owner but only ever written server-side, so a
-- customer cannot mark their own order paid.
drop policy if exists "read own orders" on orders;
create policy "read own orders" on orders
  for select using (auth.uid() = user_id);

drop policy if exists "anyone may record a view" on invite_views;
create policy "anyone may record a view" on invite_views
  for insert with check (
    exists (select 1 from invites i where i.id = invite_id and i.status = 'published')
  );

drop policy if exists "owners read their views" on invite_views;
create policy "owners read their views" on invite_views
  for select using (
    exists (select 1 from invites i where i.id = invite_id and i.user_id = auth.uid())
  );

-- Storage ------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('invite-media', 'invite-media', true)
on conflict (id) do nothing;

-- Paths are <user_id>/<invite_id>/<filename>, so the first segment decides
-- who may write.
drop policy if exists "owners write their media" on storage.objects;
create policy "owners write their media" on storage.objects
  for all to authenticated
  using (bucket_id = 'invite-media' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'invite-media' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "invite media is readable" on storage.objects;
create policy "invite media is readable" on storage.objects
  for select using (bucket_id = 'invite-media');
