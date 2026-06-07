-- migration-4-chat.sql
-- Chat partagé : messages texte + propositions structurées dans un seul fil temps réel.
-- Lancer dans Supabase → SQL Editor après migration-3-members.sql.

create table if not exists messages (
  id            uuid        primary key default gen_random_uuid(),
  author_id     uuid        references auth.users(id) on delete cascade,
  author_name   text,
  content       text        not null check (char_length(content) between 1 and 2000),
  kind          text        not null default 'text' check (kind in ('text', 'proposal')),
  -- Champs proposition (null quand kind='text')
  proposal_ticker   text,
  proposal_thesis   text,
  proposal_size     text,
  proposal_horizon  text,
  proposal_status   text    default 'open' check (proposal_status in ('open', 'accepted', 'rejected')),
  created_at    timestamptz not null default now()
);

alter table messages enable row level security;

-- Membres connectés peuvent lire tous les messages
create policy "messages_select" on messages
  for select using (auth.uid() is not null);

-- Membres connectés peuvent insérer leurs propres messages
create policy "messages_insert" on messages
  for insert with check (auth.uid() = author_id);

-- Auteurs peuvent mettre à jour leurs propres messages (ex : changer status d'une proposition)
create policy "messages_update" on messages
  for update using (auth.uid() = author_id);

-- Activer Realtime pour mises à jour temps réel dans le chat
alter publication supabase_realtime add table messages;
