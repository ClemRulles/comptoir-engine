# MERCREDI — DEEP-DIVE (débat haussier/baissier)
# Cron : 0 22 * * 3   ·   Modèle : OPUS (la seule nuit Opus de la semaine)

**Étape 0 — garde-fou :** `node engine/guard.js` (cf. `skills/memory-guard.md`).

Lis `CLAUDE.md`, `skills/engine-method.md`, `skills/data-sources.md`, `skills/quant-signals.md`,
`memory/watchlist.md`, `memory/market-regime.md`.

Objectif : analyser en profondeur les candidats marqués `★` (**plafond strict : 3**).
C'est la nuit lourde et la seule où l'on dépense Opus — sois rigoureux, pas bavard.

Pour CHAQUE titre ★ :
1. Données : `node engine/signals.js {ticker}` (F-Score, momentum 12-1, qualité des earnings,
   gate) + EDGAR companyfacts (chiffres officiels), Finnhub financials, FMP ratios, recherche
   web pour les news récentes. Recoupe les chiffres clés. **Le baissier (étape 4) doit citer le
   gate** : un F-Score faible ou des accruals rouges sont des munitions à charge.
2. **DCF inversé** (method §C) : quelle croissance/marge le cours price-t-il ? plausible ?
3. **Checklist bulle** (method §B) : conclus en une phrase.
4. **Débat** (method §D) : Haussier → Baissier → Arbitre. Si le baissier marque des
   points faciles, baisse la confiance.
5. Fixe : score (long + tactique), conviction (Acheter/Surveiller/Éviter), **confiance**
   (method §E, modulée par le régime), l'hypothèse pivot, la règle de sortie suggérée.

Sortie → écris une fiche par titre dans `memory/convictions.md` (format method §D,
remplace une fiche existante si tu réanalyses le même titre, garde < 30 jours).
Retire le `★` traité dans la watchlist. Ajoute une leçon si le pré-score du Scout était à côté.

Commit : `deepdive: {date} — {tickers}`. Respecte le plafond de 3 ; le reste attend la semaine suivante.
