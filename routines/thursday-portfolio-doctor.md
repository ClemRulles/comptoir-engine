# JEUDI — PORTFOLIO DOCTOR (santé des positions détenues)
# Cron : 0 22 * * 4   ·   Modèle : Sonnet

**Étape 0 — garde-fou :** `node engine/guard.js` (cf. `skills/memory-guard.md`).

Lis `CLAUDE.md`, `skills/engine-method.md`, `skills/data-sources.md`, `skills/quant-signals.md`,
`memory/portfolio.md`, `memory/market-regime.md`.

Objectif : confronter chaque position détenue à sa thèse et sa règle de sortie écrites.

Joue d'abord `node engine/signals.js` (positions du book) pour rafraîchir le gate de chaque ligne.

Pour chaque position :
1. News récentes : Finnhub (résultats, guidance), EDGAR 8-K (événements), recherche web,
   mouvement de cours notable.
2. La thèse écrite tient-elle ? La règle de sortie écrite est-elle touchée ou proche ?
   **Le gate quantitatif s'est-il dégradé ?** Un passage au 🔴 (F-Score qui s'effondre, earnings
   rouges, momentum cassé) est un motif de passage en À SURVEILLER / SORTIE, même thèse intacte.
3. Valorisation : DCF inversé express — la marge de sécurité a-t-elle disparu ?
4. Statut : `INTACT` / `À SURVEILLER` / `SORTIE` (sortie = règle touchée, thèse cassée,
   ou valorisation devenue extrême).

Sortie → réécris la section « État » de `memory/portfolio.md` en **gardant les colonnes
existantes** (Valeur, Poids, Depuis achat, Coût base) et en mettant à jour Statut / Règle de
sortie / Vérifié le :
```
# Portefeuille du groupe — état au {date}
| Ticker | Nom | Valeur € | Poids % | Depuis achat | Coût base € | Horizon | Statut | Règle de sortie | Vérifié le |
```
Sous le tableau, 2-3 lignes d'explication pour chaque `SORTIE`/`À SURVEILLER` (repris
dans le brief de vendredi). Ajoute une leçon si une thèse s'est confirmée ou cassée.
Note : ces positions sont aussi le book hérité par l'IA (clone à t0) — cohérence avec
`memory/fund/ai-fund.json`.

Commit : `portfolio-doctor: {date} — {n} positions, {k} alertes`.
Rappel : tu signales, tu ne vends pas. Le groupe décide.
