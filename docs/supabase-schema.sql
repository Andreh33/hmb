-- ============================================================================
-- SEAR v4 — Supabase schema (§12)
-- Tables: categories, menu_items, site_config
-- RLS: ON for all. Public (anon) may SELECT published content only.
--       Writes (insert/update/delete) restricted to authenticated users.
-- Run in the Supabase SQL editor or via `supabase db push`.
-- ============================================================================

-- Helpful extension for gen_random_uuid() (present by default on Supabase).
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- categories
-- ----------------------------------------------------------------------------
create table if not exists public.categories (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique,
  name_es    text not null,
  name_en    text not null,
  sort       integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- menu_items
-- ----------------------------------------------------------------------------
create table if not exists public.menu_items (
  id           uuid primary key default gen_random_uuid(),
  category_id  uuid not null references public.categories (id) on delete cascade,
  name_es      text not null,
  name_en      text not null,
  desc_es      text not null default '',
  desc_en      text not null default '',
  price_cents  integer not null default 0 check (price_cents >= 0),
  image_url    text,
  allergens    text[] not null default '{}',
  badges       text[] not null default '{}',
  is_published boolean not null default false,
  sort         integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists menu_items_category_id_idx on public.menu_items (category_id);
create index if not exists menu_items_published_idx on public.menu_items (is_published);

-- ----------------------------------------------------------------------------
-- site_config (single row, id = 'default')
-- ----------------------------------------------------------------------------
create table if not exists public.site_config (
  id          text primary key default 'default',
  experience  text not null default 'ember',
  brand       text not null default 'SEAR',
  logo_url    text,
  whatsapp    text not null default '',
  address     text not null default '',
  lat         double precision not null default 0,
  lng         double precision not null default 0,
  hours       jsonb not null default '{}'::jsonb,
  socials     jsonb not null default '{}'::jsonb,
  hero        jsonb,
  updated_at  timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- updated_at trigger
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists categories_set_updated_at on public.categories;
create trigger categories_set_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

drop trigger if exists menu_items_set_updated_at on public.menu_items;
create trigger menu_items_set_updated_at
  before update on public.menu_items
  for each row execute function public.set_updated_at();

drop trigger if exists site_config_set_updated_at on public.site_config;
create trigger site_config_set_updated_at
  before update on public.site_config
  for each row execute function public.set_updated_at();

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table public.categories  enable row level security;
alter table public.menu_items  enable row level security;
alter table public.site_config enable row level security;

-- --- categories --------------------------------------------------------------
-- Categories are reference data: readable by everyone (anon + authenticated).
drop policy if exists categories_select_public on public.categories;
create policy categories_select_public
  on public.categories for select
  to anon, authenticated
  using (true);

drop policy if exists categories_write_authenticated on public.categories;
create policy categories_write_authenticated
  on public.categories for all
  to authenticated
  using (true)
  with check (true);

-- --- menu_items --------------------------------------------------------------
-- Anon sees only published items. Authenticated users see/manage everything.
drop policy if exists menu_items_select_published on public.menu_items;
create policy menu_items_select_published
  on public.menu_items for select
  to anon
  using (is_published = true);

drop policy if exists menu_items_select_authenticated on public.menu_items;
create policy menu_items_select_authenticated
  on public.menu_items for select
  to authenticated
  using (true);

drop policy if exists menu_items_write_authenticated on public.menu_items;
create policy menu_items_write_authenticated
  on public.menu_items for all
  to authenticated
  using (true)
  with check (true);

-- --- site_config -------------------------------------------------------------
-- Public read (needed to render the site). Writes only authenticated.
drop policy if exists site_config_select_public on public.site_config;
create policy site_config_select_public
  on public.site_config for select
  to anon, authenticated
  using (true);

drop policy if exists site_config_write_authenticated on public.site_config;
create policy site_config_write_authenticated
  on public.site_config for all
  to authenticated
  using (true)
  with check (true);

-- ============================================================================
-- Seed (optional) — mirrors src/shared/data/mock.ts so the admin has content.
-- ============================================================================
insert into public.site_config (id, experience, brand, whatsapp, address, lat, lng, hours, socials)
values (
  'default', 'ember', 'SEAR', '+34600000000', 'Calle de la Brasa, 1, Madrid',
  40.4168, -3.7038,
  '{"lun-jue":"13:00-23:30","vie-sab":"13:00-01:00","dom":"13:00-23:00"}'::jsonb,
  '{"instagram":"#","tiktok":"#"}'::jsonb
)
on conflict (id) do nothing;
