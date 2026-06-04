# MERCREDI — DEEP-DIVE (débat haussier/baissier)
# Cron : 0 22 * * 3   ·   Modèle : OPUS (la seule nuit Opus de la semaine)

Lis `CLAUDE.md`, `skills/engine-method.md`, `skills/data-sources.md`,
`memory/watchlist.md`, `memory/market-regime.md`, `memory/fund/ai-fund.json`.

Objectif : analyser en profondeur les candidats marqués `★` (**plafond strict : 3**) **et**
passer le cerveau Opus sur les positions à risque du book IA. C'est la seule nuit Opus de la
semaine — on l'utilise à fond : trouver ET protéger. Sois rigoureux, pas bavard.

## A. Candidats neufs (≤ 3 titres ★)
Pour CHAQUE titre ★ :
1. Données : EDGAR companyfacts (chiffres officiels), Finnhub financials, FMP ratios,
   recherche web pour les news récentes. Recoupe les chiffres clés.
2. **DCF inversé** (method §C) : quelle croissance/marge le cours price-t-il ? plausible ?
3. **Checklist bulle** (method §B) : conclus en une phrase.
4. **Débat** (method §D) : Haussier → Baissier → Arbitre. Si le baissier marque des
   points faciles, baisse la confiance.
5. Fixe : score (long + tactique), conviction (Acheter/Surveiller/Éviter), **confiance**
   (method §E, modulée par le régime), l'hypothèse pivot, la règle de sortie suggérée.

Sortie → écris une fiche par titre dans `memory/convictions.md` (format method §D,
remplace une fiche existante si tu réanalyses le même titre, garde < 30 jours).
Retire le `★` traité dans la watchlist. Ajoute une leçon si le pré-score du Scout était à côté.

## B. Revue de risque du book IA (≤ 2 positions, ciblée)
Choisis dans `ai-fund.json` **au plus 2 positions** qui méritent le cerveau Opus : soit les
**2 plus gros poids** du NAV, soit celles dont la **règle de sortie est proche d'être touchée**
(d'après le Portfolio Doctor de la veille / le mouvement de cours). Pour chacune :
1. L'**hypothèse pivot** écrite à l'entrée tient-elle toujours, chiffres officiels à l'appui (EDGAR/Finnhub) ?
2. **DCF inversé express** (method §C) : la marge de sécurité a-t-elle disparu depuis l'achat ?
3. Mini-débat baissier : qu'est-ce qui casserait la thèse d'ici 3 mois ? est-ce déjà en train d'arriver ?
4. Verdict pour vendredi : **RENFORCER** (thèse confirmée et marge intacte) / **GARDER** / **ALLÉGER**
   / **SORTIR** (pivot faux ou valo extrême) — avec la raison en une ligne.

Sortie → ajoute un bloc `## Revue book IA — {date}` en haut de `memory/convictions.md` listant
ces verdicts. Le vendredi (PASSE 2) les exécute en priorité. Ne touche à rien d'autre du book ici.

Commit : `deepdive: {date} — {tickers} + revue book ({n} positions)`.
Plafond total Opus : **≤ 3 candidats + ≤ 2 positions book = 5 titres**. Le reste attend la semaine suivante.
