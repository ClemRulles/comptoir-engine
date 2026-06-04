-- ════════════════════════════════════════════════════════════════
-- Migration 2 — Propositions d'investissement + notifications in-app
-- À coller dans Supabase → SQL Editor → Run.
-- ════════════════════════════════════════════════════════════════

-- Propositions postées par les membres
create table if not exists proposals (
  id          uuid primary key default gen_random_uuid(),
  author_id   uuid references auth.users(id) on delete set null,
  author_name text,
  ticker      text not null,
  thesis      text not null,
  size        text,
  horizon     text,
  status      text not null default 'open' check (status in ('open','retenue','ecartee')),
  created_at  timestamptz not null default now()
);

-- Notifications in-app (une ligne par destinataire)
create table if not exists notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  type       text not null default 'proposal',
  title      text not null,
  body       text,
  link       text,
  read       boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user_idx on notifications (user_id, read, created_at desc);

alter table proposals     enable row level security;
alter table notifications enable row level security;

-- Propositions : lisibles + créables + modifiables par les membres connectés
create policy "read_proposals"   on proposals for select to authenticated using (true);
create policy "insert_proposals" on proposals for insert to authenticated with check (true);
create policy "update_proposals" on proposals for update to authenticated using (true) with check (true);

-- Notifications : chacun ne voit/modifie que les siennes.
-- L'insertion en masse (fan-out) se fait via la clé service_role (contourne la RLS).
create policy "read_own_notifs"   on notifications for select to authenticated using ((select auth.uid()) = user_id);
create policy "update_own_notifs" on notifications for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
