-- migration-5-proposal-range.sql
-- Graphique joint à une proposition : on mémorise la PÉRIODE choisie par l'auteur
-- (1S / 1M / 3M / 1A) pour réafficher le bon mini-graphe de cours dans la bulle.
-- Lancer dans Supabase → SQL Editor après migration-4-chat.sql.
-- (Le code dégrade proprement si cette colonne n'existe pas encore : la proposition
--  s'envoie sans graphique. Lancer cette migration active la pièce jointe.)

alter table messages
  add column if not exists proposal_range text
    check (proposal_range is null or proposal_range in ('1S', '1M', '3M', '1A'));
