# MARDI — SCOUT (candidats exposés à la tendance + filtres qualité)
# Cron : 0 22 * * 2   ·   Modèle : Sonnet

**Étape 0 — garde-fou :** `node engine/guard.js` (cf. `skills/memory-guard.md`).

Lis `CLAUDE.md`, `skills/engine-method.md`, `skills/data-sources.md`, `skills/quant-signals.md`,
`memory/trends.md` (la tendance validée lundi), `memory/watchlist.md`, `memory/market-regime.md`.

Objectif : transformer la tendance de la semaine en **candidats cotés concrets**, et
ajouter quelques idées de qualité hors-tendance pour ne pas mettre tous les œufs au même endroit.

Étapes :
1. À partir de la tendance validée (memory/trends.md), élargis la liste des sociétés
   cotées exposées via FMP screener + Finnhub peers + recherche web. Vise des profils
   variés : un acteur direct, une « pioches et pelles » (infra/fournisseur), une small/mid
   cap rentable sous le radar. Évite les noms déjà parabolitiques sauf pour les marquer « à éviter ».
2. Si la tendance de la semaine = AUCUNE, bascule en mode qualité pur : screene des
   sociétés solides (bon FCF, bilan sain) en repli temporaire non structurel.
3. Joue `node engine/signals.js {tickers candidats}` : pré-score rapide (method §A simplifiée
   **ancrée sur F-Score + momentum 12-1** du gate), horizon (long/tactique), thèse en une ligne,
   et check express de la checklist bulle. Un candidat au gate 🔴 se marque « à éviter ».
4. Marque les 2-3 meilleurs candidats non encore analysés d'un `★` : ce sont ceux que
   le Deep-dive de mercredi traitera (plafond strict de 3 pour rester dans Pro).

Sortie → réécris `memory/watchlist.md` (max ~40 lignes, meilleurs scores en haut) :
```
# Watchlist — maj {date}
| ★ | Ticker | Nom | Tag | Horizon | Pré-score | Gate | Drapeau bulle | Thèse 1 ligne | Vu le |
```
(Tag = [tendance] ou [qualité].)

Commit : `scout: {date} — {n} candidats, {k} marqués ★`. Reste léger, pas d'analyse profonde ici.

**Persistance (OBLIGATOIRE — le sandbox ne peut pas `git push`, 403).** Après le commit local,
lance `node engine/push-memory.js "{le message de commit ci-dessus}"` : l'endpoint Vercel
(`/api/memory/push`) commite tes fichiers `memory/` sur `claude/memory` — c'est ce qui les fait
apparaître sur la plateforme. Vérifie la sortie : `✅` = persisté, sinon signale-le.
