# LUNDI — TREND RADAR (régime + tendance de la semaine)
# Cron : 0 22 * * 1   ·   Modèle : Sonnet

Tu ouvres la semaine. Lis `CLAUDE.md`, `skills/engine-method.md`,
`skills/trend-gate.md`, `skills/data-sources.md`, et `memory/trends.md` (semaine passée).

## Partie A — Régime de marché
Via FRED (taux, courbe 10Y-2Y, inflation, chômage) + FMP sector-performance + recherche web :
juge le régime et règle le cadran : RISK-ON SAIN / NORMAL / SURCHAUFFE / STRESS.
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

## Partie C — Calendrier des catalyseurs (anticiper le connu, pas deviner le surprise)
But : repérer les **événements DATÉS et publics** des ~6 prochaines semaines qui peuvent bouger
nos secteurs/titres, pour s'y préparer **avant**, jamais courir après une annonce surprise.
On n'invente pas un catalyseur (« Trump pourrait dire X ») — on ne liste que des dates au calendrier.

Sources (toutes gratuites) :
- **Macro** : FRED release calendar + web → FOMC (décision + minutes), CPI/PCE, emploi (NFP),
  réunions BCE/BoE, OPEP, réunions de banques centrales.
- **Politique / réglementaire** : recherche web → élections, votes clés, **échéances tarifaires /
  douanières**, deadlines budgétaires, décisions antitrust/FDA, expirations de moratoires.
- **Micro** : Finnhub `/calendar/earnings` → dates de résultats de **nos positions** (`portfolio.md`,
  `ai-fund.json`) et des noms de la watchlist ; `/calendar/ipo` pour les IPO d'un thème.

Pour chaque indicateur/événement retenu, juge : qu'est-ce qui bouge, le **sens du risque**
(binaire / directionnel), et surtout écris une **analyse de l'IA** en une phrase dense qui dit
les **trois** choses : (1) **pourquoi** c'est important, (2) **comment** l'IA le prend en compte,
(3) **vers quoi** elle s'orienterait pour investir si ça se confirme. Format obligatoire de cette
colonne : `Pourquoi : … · Prise en compte : … · Orientation : …`.
Écris/rafraîchis `memory/catalysts.md` :
```
# Indicateurs & catalyseurs — maj {date}
| Date | Événement | Type | Ce qui bouge (secteurs/tickers) | Sens du risque | Analyse de l'IA (pourquoi · prise en compte · orientation) | Confiance | Statut |
```
Exemple de cellule « Analyse de l'IA » : `Pourquoi : un FOMC hawkish renchérit le coût du capital
et pèse sur le growth/REIT · Prise en compte : je n'augmente pas le growth avant la décision et
garde du cash · Orientation : si dovish, je renforcerais la tech de qualité ; si hawkish, je
privilégie value/défensif (banques, défense)`.

Règles : ajoute les événements qui entrent dans la fenêtre 6 semaines ; passe en `Statut: PASSÉ`
ceux dont la date est dépassée (le vendredi les score puis les archive) ; **ne double pas** une
ligne existante, mets-la à jour. Distingue bien *risque sur une position détenue* (gestion du
risque : alléger/couvrir avant) de *catalyseur favorable à une thèse qu'on a déjà avec marge*
(éventuel pari tactique, taillé §H, date de l'événement = déclencheur). Pas de pari directionnel
sur le contenu d'une annonce surprise.

Commit : `trend-radar: {date} — tendance: {nom ou AUCUNE}, {n} catalyseurs`.
Reste léger : c'est un travail de tri et de validation, pas une analyse titre par titre.
