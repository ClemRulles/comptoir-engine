# LUNDI — TREND RADAR (régime + tendance de la semaine)
# Cron : 0 22 * * 1   ·   Modèle : Sonnet

**Étape 0 — garde-fou :** `node engine/guard.js` (cf. `skills/memory-guard.md`). Signale tout fichier recréé.

Tu ouvres la semaine. Lis `CLAUDE.md`, `skills/engine-method.md`, `skills/trend-gate.md`,
`skills/data-sources.md`, `skills/quant-signals.md`, et `memory/trends.md` (semaine passée).

## Partie A — Régime de marché
Joue `node engine/signals.js` : `signals.regime` te donne un **cadran chiffré** (courbe 10Y-2Y,
chômage, inflation) + plancher de cash. Recoupe avec FMP sector-performance + recherche web, puis
règle le cadran : RISK-ON SAIN / NORMAL / SURCHAUFFE / STRESS.
Écris-le dans `memory/market-regime.md` (format : cadran, consigne au système,
valorisation indice, zones de bulle, largeur, macro en 3 lignes, sources).

## Partie B — LA tendance de la semaine (anti-bullshit)
1. Génère 3 à 6 tendances candidates, en croisant des **données dures**, pas du buzz :
   - secteurs qui surperforment/sous-performent (FMP) — et pourquoi (catalyseur réel) ;
   - vagues de dépôts SEC sur un thème (EDGAR full-text), calendrier IPO (Finnhub) ;
   - capex/contrats/guidance annoncés récemment (web + Finnhub) ;
   - changements de régulation ou macro (FRED, web).
2. Fais passer chaque candidate par le **filtre de `trend-gate.md`** (rejet immédiat,
   puis les 6 portes).
3. Sélectionne **la meilleure** (une seule). Si aucune ne passe : écris « AUCUNE cette
   semaine » + la raison + 2-3 thèmes à surveiller. **Ne fabrique jamais de tendance.**
4. Écris le résultat dans `memory/trends.md` au format de `trend-gate.md`.
5. Note dans `memory/watchlist.md` les tickers « manières de la jouer » avec un tag
   `[tendance]` pour que le Scout de mardi les reprenne.

Commit : `trend-radar: {date} — tendance: {nom ou AUCUNE}`.
Reste léger : c'est un travail de tri et de validation, pas une analyse titre par titre.
