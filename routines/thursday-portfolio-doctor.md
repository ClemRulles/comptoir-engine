# JEUDI — PORTFOLIO DOCTOR (santé des positions détenues)
# Cron : 0 22 * * 4   ·   Modèle : Sonnet

Lis `CLAUDE.md`, `skills/engine-method.md`, `skills/data-sources.md`,
`memory/portfolio.md`, `memory/market-regime.md`.

Objectif : confronter chaque position détenue à sa thèse et sa règle de sortie écrites.

Pour chaque position :
1. News récentes : Finnhub (résultats, guidance), EDGAR 8-K (événements), recherche web,
   mouvement de cours notable.
2. La thèse écrite tient-elle ? La règle de sortie écrite est-elle touchée ou proche ?
3. Valorisation : DCF inversé express — la marge de sécurité a-t-elle disparu ?
4. Statut : `INTACT` / `À SURVEILLER` / `SORTIE` (sortie = règle touchée, thèse cassée,
   ou valorisation devenue extrême).

Sortie → réécris la section « État » de `memory/portfolio.md` :
```
# Portefeuille — état au {date}
| Ticker | Taille % | Horizon | Statut | Raison (1 phrase) | Règle de sortie | Vérifié le |
```
Sous le tableau, 2-3 lignes d'explication pour chaque `SORTIE`/`À SURVEILLER` (repris
dans le brief de vendredi). Ajoute une leçon si une thèse s'est confirmée ou cassée.

Commit : `portfolio-doctor: {date} — {n} positions, {k} alertes`.
Rappel : tu signales, tu ne vends pas. Le groupe décide.
