-- ════════════════════════════════════════════════════════════════
-- Migration 3 — Membres du club + apports (25 €/mois/personne)
-- À coller dans Supabase → SQL Editor → Run (après migration.sql).
-- ════════════════════════════════════════════════════════════════

-- Roster du club (indépendant des comptes auth : on compte les personnes du pot).
create table if not exists club_members (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  joined_on      date not null default current_date,
  monthly_amount numeric not null default 25,
  active         boolean not null default true,
  created_at     timestamptz not null default now()
);

-- La table contributions existe déjà (migration.sql). On l'enrichit :
alter table contributions add column if not exists member_id uuid references club_members(id) on delete set null;
alter table contributions add column if not exists kind text not null default 'apport';

-- Réglage du montant mensuel par membre (modifiable dans l'app plus tard).
insert into settings (key, value) values ('monthly_per_member', '25')
on conflict (key) do nothing;

alter table club_members enable row level security;

-- Lisible + gérable par tout membre connecté (petit club de confiance).
create policy "read_club_members"  on club_members for select to authenticated using (true);
create policy "write_club_members" on club_members for all    to authenticated using (true) with check (true);
