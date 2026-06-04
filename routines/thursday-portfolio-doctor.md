# JEUDI — PORTFOLIO DOCTOR (santé des positions détenues)
# Cron : 0 22 * * 4   ·   Modèle : Sonnet

Lis `CLAUDE.md`, `skills/engine-method.md`, `skills/data-sources.md`,
`memory/portfolio.md`, `memory/fund/ai-fund.json`, `memory/market-regime.md`.

Objectif : confronter **chaque position des deux books** (le groupe via `portfolio.md` ET le
book IA via `ai-fund.json`) à sa thèse et sa règle de sortie écrites. Ainsi le vendredi gère le
book IA sur des alertes datées de la veille, pas de la semaine passée.

Pour chaque position (groupe **et** book IA) :
1. News récentes : Finnhub (résultats, guidance), EDGAR 8-K (événements), recherche web,
   mouvement de cours notable.
2. La thèse écrite tient-elle ? La règle de sortie écrite est-elle touchée ou proche ?
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

**Book IA** : applique le même diagnostic aux positions de `memory/fund/ai-fund.json`. Tu ne
modifies pas le JSON ici (c'est le rôle du vendredi, PASSE 2) — tu écris les alertes dans un bloc
`## Alertes book IA — {date}` en bas de `memory/portfolio.md` : `{ticker} — {INTACT/À SURVEILLER/
SORTIE} — règle de sortie touchée ? — raison 1 ligne`. Le vendredi exécute ces sorties en priorité.
Pour le groupe, **tu signales, tu ne vends pas** : le groupe décide.

Commit : `portfolio-doctor: {date} — {n} positions (groupe+IA), {k} alertes`.
