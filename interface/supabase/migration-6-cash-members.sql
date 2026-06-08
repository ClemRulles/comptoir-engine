-- ════════════════════════════════════════════════════════════════
-- Migration 6 — Cash de marge 4108 € + 10 membres du club
-- À coller dans Supabase → SQL Editor → Run (après migration-3-members.sql).
-- Idempotente : peut être relancée sans créer de doublon.
-- ════════════════════════════════════════════════════════════════

-- 1) Trésorerie du pot : 4108 € de cash (réserve réelle au 2026-06-08).
--    start_capital = positions à t0 (6309,28 €) + cash (4108 €) = 10417,28 €
--    → le cash n'est PAS compté comme du rendement. Le book IA est aligné côté moteur
--    (memory/fund/ai-fund.json : cash 4108, start_capital 10417,28).
update funds
   set cash = 4108,
       start_capital = 10417.28
 where kind = 'group';

-- 2) Réglage du montant mensuel par membre (25 €) — au cas où il manquerait.
insert into settings (key, value) values ('monthly_per_member', '25')
on conflict (key) do nothing;

-- 3) 10 membres actifs (génériques, à renommer plus tard). 10 × 25 € = 250 €/mois.
--    N'insère QUE si le roster est vide → relancer la migration ne duplique rien.
insert into club_members (name, monthly_amount, active)
select 'Membre ' || g, 25, true
from generate_series(1, 10) as g
where not exists (select 1 from club_members);

-- Vérification (optionnel) :
--   select count(*) filter (where active) as membres_actifs from club_members;  -- → 10
--   select cash, start_capital from funds where kind = 'group';                 -- → 4108 / 10417.28
