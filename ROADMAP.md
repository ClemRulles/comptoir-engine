# HypeInvest — Roadmap & idées (à garder)

Idées validées à implémenter plus tard. Cocher au fur et à mesure.

## 🧠 L'IA apprend de son passé — ✅ FAIT
But : que le fonds IA **retienne ses erreurs et ses réussites** pour orienter ses prochaines
décisions et conseils.
- ✅ Chaque vendredi, la routine **revoit les trades clôturés** du book IA (`memory/fund/ai-fund.json`),
  calcule leur **P&L réalisé** + si la thèse s'est confirmée/cassée, et écrit le registre
  `memory/fund/decisions.json` (cf. `routines/friday-brief.md` passe 1).
- ✅ Écrit des **leçons datées** dans `memory/lessons.md` : ce qui a marché/raté, pourquoi.
- ✅ **Boucle de calibration** : `memory/fund/calibration.json` (hit-rate par confiance) +
  `routines/monthly-calibration.md` qui ajuste le sizing et durcit les critères (method §H/§I).
- ✅ Le **brief du vendredi** cite « 🎓 Leçon de la semaine » et « 🔧 Ce que je corrige ».
- ✅ Interface : onglet **« Apprentissages de l'IA »** (`/apprentissages`) — KPIs hit-rate/win
  rate/profit factor, courbe de calibration confiance vs réussite, timeline des leçons, table
  des décisions clôturées.
- ↪ Reste à faire par le groupe : **encoder vos positions** (cf. « Seed clone-à-t0 » ci-dessous)
  pour que l'IA démarre à armes égales.

## 🌱 Seed clone-à-t0 du fonds IA (à faire au démarrage)
- L'IA doit partir avec le **même capital + les mêmes positions** que le groupe, puis gérer seule.
- Procédure : collez vos positions dans `memory/portfolio.md` **et** via l'éditeur de l'interface
  (Supabase). Tant que `ai-fund.json` a `seeded:false`, la 1re passe du vendredi recopie ces
  positions et aligne `start_capital`/`cash` sur le pot commun, puis passe `seeded:true`.
- Ensuite l'IA diverge selon ses convictions → on mesure qui bat qui à armes égales.

## 🔔 Proposition d'investissement + notifications
- Chaque membre peut **proposer un investissement** depuis l'interface (ticker, thèse, taille).
- **Notification à tout le monde** (email + in-app), avec possibilité de **voter / commenter**.
- Table `proposals` (auteur, ticker, thèse, statut, votes) + `notifications`.

## ⚡ Données live / réactivité
- **Auto-refresh** des cours en heures de marché (toutes ~1–2 min, uniquement onglet visible).
- Bouton « Rafraîchir » + indicateur « mis à jour il y a X ».
- Plus tard : flux temps réel (websocket) si un fournisseur le permet dans le quota.

## 💶 Apports mensuels (25 €/mois/personne) — ✅ FAIT (saisie manuelle)
- ✅ Section **Membres & apports** sur la page Groupe : bouton « Nouveau membre », bouton « Apport »
  (montant), calcul auto **Apport mensuel = nb membres actifs × 25 €**.
- ✅ Table `club_members` (`migration-3-members.sql`) + `contributions` enrichie (member_id, kind).
  Chaque apport **incrémente le cash du pot** et est **reflété dans le book IA** (à armes égales).
- ↪ Reste optionnel : **injection automatique** le 1er du mois (cron) au lieu de la saisie manuelle.

## 📊 Métriques avancées
- Drawdown max, performance annualisée, volatilité, ratio de Sharpe, win rate.
- Comparaison vs un indice de référence (ex. S&P 500 / MSCI World).

## 🎨 Confort & finitions
- Mode sombre (toggle), polish mobile, raccourcis clavier.
- Export PDF du brief hebdo ; page « historique des briefs ».
- ✅ Logo + favicon HypeInvest (fait).
- ✅ Sélecteur de période 1J/1S/1M/3M/1A/Max + animations (fait).
