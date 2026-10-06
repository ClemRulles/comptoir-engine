-- migration-7-quiz.sql
-- Quiz du jour : une réponse par membre et par jour, classement mensuel (page Groupe).
-- Lancer dans Supabase → SQL Editor (après migration-6-cash-members.sql). Rejouable sans risque.

create table if not exists quiz_answers (
  user_id      uuid        not null references auth.users(id) on delete cascade,
  quiz_date    date        not null,              -- jour de la question (heure de Paris)
  choice       smallint    not null check (choice between 0 and 3),
  correct      boolean     not null,
  user_name    text,                              -- pseudo au moment de la réponse (affiché au classement)
  answered_at  timestamptz not null default now(),
  primary key (user_id, quiz_date)
);

create index if not exists quiz_answers_date_idx on quiz_answers (quiz_date);

alter table quiz_answers enable row level security;

-- Les membres connectés voient les réponses (classement, « 4 membres ont répondu »).
drop policy if exists "quiz_answers_select" on quiz_answers;
create policy "quiz_answers_select" on quiz_answers
  for select using (auth.uid() is not null);

-- AUCUNE politique d'écriture : seules les routes serveur (clé service) enregistrent une
-- réponse, après avoir vérifié la bonne réponse. Personne ne peut s'attribuer un point.
