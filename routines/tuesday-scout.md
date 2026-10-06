# MARDI — SCOUT (candidats exposés à la tendance + filtres qualité)
# Cron : 0 22 * * 2   ·   Modèle : Sonnet

**Étape 0 — garde-fou :** `node engine/guard.js` (cf. `skills/memory-guard.md`).

Lis `CLAUDE.md`, `skills/engine-method.md`, `skills/data-sources.md`, `skills/quant-signals.md`,
`memory/playbook.md` (jurisprudence — ses amendements actifs s'appliquent),
`memory/trends.md` (la tendance validée lundi), `memory/watchlist.md`, `memory/market-regime.md`,
`skills/desks.md`, `memory/fund/attribution.json`, `memory/fund/ai-fund.json`.

Objectif : transformer la tendance de la semaine en **candidats cotés concrets**, et
ajouter quelques idées de qualité hors-tendance pour ne pas mettre tous les œufs au même endroit.
Tu es le **CIO** (method §L) : ce sont les desks spécialisés qui sourcent, toi qui tries.

Étapes :
1. **Convoque les 5 desks sectoriels en parallèle** (un seul message, outil Agent) :
   `desk-tech`, `desk-sante`, `desk-industrie-energie`, `desk-finance`, `desk-conso`. Transmets
   à chacun : la tendance validée (memory/trends.md) ou « AUCUNE », le régime, les positions
   détenues de son univers (`ai-fund.json`), les noms déjà en watchlist, et son multiplicateur
   (`attribution.json → desk_multipliers`). Chacun renvoie **au plus 2 idées** au format
   `skills/desks.md` (gate et taux de base en `--dry`) — profils variés : acteur direct, « pioches
   et pelles », small/mid cap rentable sous le radar, compounder de qualité en repli non
   structurel. Zéro idée est une réponse valable.
2. Si la tendance de la semaine = AUCUNE, les desks basculent en mode qualité pur : sociétés
   solides (bon FCF, bilan sain) en repli temporaire non structurel.
3. Joue `node engine/signals.js {tickers retenus}` et `node engine/history.js {tickers retenus}`
   (versions qui écrivent le cache) sur l'union des idées : pré-score (method §A simplifiée
   **ancrée sur F-Score + momentum 12-1**), horizon, thèse en une ligne, check express de la
   checklist bulle. Un candidat au gate 🔴 se marque « à éviter ».
4. Marque d'un `★` les **3 meilleurs** candidats non encore analysés, **au plus 1 par desk** (la
   diversité des sources d'idées est un actif) : ce sont ceux que le Deep-dive de mercredi
   traitera avec leur desk d'origine. Un desk dont le multiplicateur est < 1 ne place un ★ que
   si son idée est la meilleure de la nuit.

Sortie → réécris `memory/watchlist.md` (max ~40 lignes, meilleurs scores en haut) :
```
# Watchlist — maj {date}
| ★ | Ticker | Nom | Desk | Tag | Horizon | Pré-score | Gate | Drapeau bulle | Taux de base (DD actuel · analogues 12 m) | Thèse 1 ligne | Vu le |
```
(Tag = [tendance] ou [qualité]. Desk = l'agent qui a porté l'idée — il la plaidera mercredi.)

**Quiz du jour (OBLIGATOIRE, 2 minutes — `skills/quiz.md`).** Vérifie que `memory/fund/quiz.json`
a une question pour les **2 prochains jours** (date de Paris) et écris celles qui manquent (thème du
jour, une seule bonne réponse, fait sourcé). Ne touche jamais à une date déjà publiée.

Commit : `scout: {date} — {n} candidats, {k} marqués ★`. Reste léger, pas d'analyse profonde ici.

**Persistance (OBLIGATOIRE — le sandbox ne peut pas `git push`, 403).** Après le commit local,
lance `node engine/push-memory.js "{le message de commit ci-dessus}"` : l'endpoint Vercel
(`/api/memory/push`) commite tes fichiers `memory/` sur `claude/memory` — c'est ce qui les fait
apparaître sur la plateforme. Vérifie la sortie : `✅` = persisté, sinon signale-le.
