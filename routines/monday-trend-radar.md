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

**Contexte crypto (radar, pas signal).** Joue `node engine/crypto.js` → `memory/fund/crypto.json`
(CoinGecko : cap/dominance BTC-ETH/cours EUR ; alternative.me : Fear & Greed). Lis-le pour situer
le climat crypto : sentiment (peur/avidité, lecture **contrarienne**), dominance BTC, variations
24h/7j/30j des majors. Les signaux quantitatifs actions (F-Score, earnings, initiés) **n'ont aucun
sens sur la crypto** : pour ces actifs, raisonne **momentum + régime macro + sentiment** uniquement.
Le crypto reste un **radar à corroborer** (preuve dure on-chain/chiffres/catalyseur exigée) et **sans
allocation forcée** — résume-le en 2 lignes dans `memory/market-regime.md` si pertinent cette semaine.

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

## Partie D — Pouls Grok du marché (radar à corroborer)
Une fois par semaine, prends le pouls du marché via Grok (seul accès X temps réel). C'est un
**radar de thèmes/news, jamais un signal d'achat** (CLAUDE.md, method §F).

1. Si `GROK_API_KEY` est présent, appelle l'API xAI (`POST https://api.x.ai/v1/chat/completions`,
   en-tête `Authorization: Bearer $GROK_API_KEY`) avec un prompt structuré demandant, pour la
   semaine écoulée :
   - **2 à 4 thèmes/tendances** qui agitent réellement le marché sur X (rotations sectorielles,
     narratifs émergents) — pas du bruit meme/penny ;
   - **les tickers qui ont bougé et pourquoi**, en priorité ceux **détenus** (lis la liste dans
     `memory/portfolio.md` et `memory/fund/ai-fund.json`) ;
   - **les narratifs crypto** dominants de la semaine (BTC/ETH/alts) : y a-t-il un catalyseur, un
     flux ETF, un changement de sentiment ? X est très crypto — recoupe avec `memory/fund/crypto.json`
     (dominance, Fear & Greed). Reste **radar** : aucune entrée de book sur le seul narratif.
   Demande une **sortie JSON stricte** : `headline`, `themes[]` (`title`, `detail`, `tickers[]`),
   `movers[]` (`ticker`, `direction` up/down, `reason`). Un thème crypto suit les mêmes règles de
   corroboration (preuve dure) que les autres.
2. **Corrobore** chaque thème avec une source dure déjà collectée en Partie A/B/C (FRED, FMP,
   EDGAR, communiqués). Mets `corroborated:true` seulement si recoupé ; sinon `false` (gardé,
   mais marqué). Un thème non corroboré **ne peut pas à lui seul** créer une tendance validée ni
   une entrée de book.
3. Marque `held:true` pour tout mover présent dans le portefeuille du groupe/IA.
4. **Append** l'entrée de la semaine en tête de `memory/grok-pulse.json` (crée le fichier s'il
   n'existe pas, format ci-dessous, garde ~12 semaines max, élague le reste). Mets `updated`.
5. Les thèmes **corroborés** rejoignent les tendances candidates de la Partie B (passées au
   `trend-gate`) — radar à corroborer, pas raccourci.
6. Repli : si Grok plafonne/échoue, construis le pouls à partir de la recherche web native,
   note-le dans `sources` (« repli web »), et ne bloque jamais la routine.

Format `memory/grok-pulse.json` :
```json
{
  "_doc": "Pouls hebdo du marché (Grok, accès X) — radar à corroborer, jamais un signal d'achat.",
  "updated": "{date}",
  "weeks": [
    {
      "week": "{ISO ex 2026-W24}", "date": "{date}", "label": "Semaine du …",
      "headline": "…",
      "themes": [{ "title": "…", "detail": "…", "tickers": ["XXX"], "corroborated": true }],
      "movers": [{ "ticker": "XXX", "direction": "up", "reason": "…", "held": true }],
      "sources": ["Grok/X", "recoupé: …"]
    }
  ]
}
```

Commit : `trend-radar: {date} — tendance: {nom ou AUCUNE}, {n} catalyseurs · pouls maj`.

**Persistance (OBLIGATOIRE — le sandbox ne peut pas `git push`, 403).** Après le commit local,
lance `node engine/push-memory.js "{le message de commit ci-dessus}"`. L'endpoint Vercel
(`/api/memory/push`) commite tes fichiers `memory/` modifiés sur `claude/memory` — **c'est ce qui
fait apparaître ton travail sur la plateforme**. Vérifie la sortie : `✅` = persisté ; sinon
signale-le explicitement dans ton résumé (la mémoire n'est pas montée).

Reste léger : c'est un travail de tri et de validation, pas une analyse titre par titre.
