-- ════════════════════════════════════════════════════════════════
-- Comptoir Interface — schéma Supabase
-- À coller dans Supabase → SQL Editor → Run.
-- ════════════════════════════════════════════════════════════════

create extension if not exists "pgcrypto";

-- ── Fonds : 'group' (réel, pot commun) et 'ai' (fictif) ────────────
create table if not exists funds (
  id            uuid primary key default gen_random_uuid(),
  kind          text not null check (kind in ('group','ai')),
  name          text not null,
  inception_date date not null default current_date,
  start_capital numeric not null default 1000,
  cash          numeric not null default 1000,
  unique (kind)
);

-- ── Positions courantes ────────────────────────────────────────────
create table if not exists holdings (
  id         uuid primary key default gen_random_uuid(),
  fund_id    uuid not null references funds(id) on delete cascade,
  ticker     text not null,
  quantity   numeric not null,
  avg_cost   numeric not null,
  updated_at timestamptz not null default now(),
  unique (fund_id, ticker)
);

-- ── Journal des trades ──────────────────────────────────────────────
create table if not exists trades (
  id        uuid primary key default gen_random_uuid(),
  fund_id   uuid not null references funds(id) on delete cascade,
  ts        timestamptz not null default now(),
  side      text not null check (side in ('buy','sell')),
  ticker    text not null,
  quantity  numeric not null,
  price     numeric not null,
  rationale text,
  source    text not null default 'member' check (source in ('member','engine'))
);

-- ── Apports (25 €/mois/personne) ───────────────────────────────────
create table if not exists contributions (
  id      uuid primary key default gen_random_uuid(),
  fund_id uuid not null references funds(id) on delete cascade,
  ts      timestamptz not null default now(),
  amount  numeric not null,
  note    text
);

-- ── Snapshots NAV (historique des courbes) ─────────────────────────
create table if not exists nav_snapshots (
  id              uuid primary key default gen_random_uuid(),
  fund_id         uuid not null references funds(id) on delete cascade,
  date            date not null,
  cash            numeric not null,
  positions_value numeric not null,
  nav             numeric not null,
  unique (fund_id, date)
);

-- ── Réglages divers ─────────────────────────────────────────────────
create table if not exists settings (
  key   text primary key,
  value text
);

-- ── Membres autorisés (liés à auth.users) ──────────────────────────
create table if not exists members (
  user_id      uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role         text not null default 'member'
);

-- ── Seed des 2 fonds (modifie start_capital/cash selon votre pot) ──
insert into funds (kind, name, start_capital, cash)
values ('group', 'Fonds du groupe', 1000, 1000)
on conflict (kind) do nothing;

insert into funds (kind, name, start_capital, cash)
values ('ai', 'Fonds IA (fictif)', 1000, 1000)
on conflict (kind) do nothing;

-- ════════════════════════════════════════════════════════════════
-- Row Level Security : accès réservé aux membres connectés.
-- Les écritures de nav_snapshots passent par la clé service_role
-- (le cron) qui contourne la RLS.
-- ════════════════════════════════════════════════════════════════
alter table funds         enable row level security;
alter table holdings      enable row level security;
alter table trades        enable row level security;
alter table contributions enable row level security;
alter table nav_snapshots enable row level security;
alter table settings      enable row level security;
alter table members       enable row level security;

-- lecture pour tout utilisateur authentifié
create policy "read_funds"        on funds         for select to authenticated using (true);
create policy "read_holdings"     on holdings      for select to authenticated using (true);
create policy "read_trades"       on trades        for select to authenticated using (true);
create policy "read_contrib"      on contributions for select to authenticated using (true);
create policy "read_nav"          on nav_snapshots for select to authenticated using (true);
create policy "read_settings"     on settings      for select to authenticated using (true);
create policy "read_members"      on members       for select to authenticated using (true);

-- écritures du fonds commun par les membres connectés
create policy "write_funds"    on funds         for update to authenticated using (true) with check (true);
create policy "write_holdings" on holdings      for all    to authenticated using (true) with check (true);
create policy "write_trades"   on trades        for insert to authenticated with check (true);
create policy "write_contrib"  on contributions for insert to authenticated with check (true);
create policy "write_settings" on settings      for all    to authenticated using (true) with check (true);
