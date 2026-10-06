# MERCREDI — DEEP-DIVE (débat haussier/baissier)
# Cron : 0 22 * * 3   ·   Modèle : OPUS (la seule nuit Opus de la semaine)

**Étape 0 — garde-fou :** `node engine/guard.js` (cf. `skills/memory-guard.md`).

Lis `CLAUDE.md`, `skills/engine-method.md`, `skills/data-sources.md`, `skills/quant-signals.md`,
`memory/playbook.md` (jurisprudence — ses amendements actifs s'appliquent),
`memory/watchlist.md`, `memory/market-regime.md`, `memory/fund/ai-fund.json`, `skills/desks.md`,
`memory/fund/allocation.json`, `memory/fund/attribution.json`.

Tu es le **CIO** (method §L) : ce soir le débat §D se joue à **trois voix** — le desk qui a sourcé
l'idée plaide, le `risk-manager` attaque, toi tu tranches.

Objectif : analyser en profondeur les candidats marqués `★` (**plafond strict : 3**) **et**
passer le cerveau Opus sur les positions à risque du book IA. C'est la seule nuit Opus de la
semaine — on l'utilise à fond : trouver ET protéger. Sois rigoureux, pas bavard.

## A. Candidats neufs (≤ 3 titres ★)
1. **Plaidoiries — en parallèle** (un seul message, outil Agent) : pour chaque ★, convoque son
   **desk d'origine** (colonne Desk de la watchlist) et demande-lui le **dossier haussier complet**
   au format `skills/desks.md` : données officielles recoupées (EDGAR, rapports annuels),
   `node engine/signals.js {ticker} --dry`, `node engine/history.js {ticker} --dry`, **DCF inversé**
   (§C), **checklist bulle** (§B), hypothèse pivot, exit_rule, taille proposée.
2. **Attaque — un appel groupé** : transmets tous les dossiers au `risk-manager`. Il est le
   **baissier** de chaque débat (§D) : il doit citer le gate (un F-Score faible ou des accruals
   rouges sont des munitions à charge), le taux de base, la corrélation avec le book et les
   erreurs passées de `lessons.md`. Il rend FEU VERT / FEU VERT RÉDUIT / REFUS.
3. **Arbitrage — toi** : qui gagne et de combien ? Si le baissier marque des points faciles que
   le desk avait « oubliés », la confiance baisse automatiquement (§D). Fixe : score (long +
   tactique), conviction (Acheter/Surveiller/Éviter), **confiance** (§E, modulée par le régime),
   hypothèse pivot, règle de sortie, **poche** et **taille indicative** selon §H (conviction ×
   calibration × multiplicateur du desk × volatilité). Ne recopie pas le desk : juge.

Sortie → écris une fiche par titre dans `memory/convictions.md` (format method §D,
remplace une fiche existante si tu réanalyses le même titre, garde < 30 jours).
Retire le `★` traité dans la watchlist. Ajoute une leçon si le pré-score du Scout était à côté.

## A bis. Scénarios candidats (book prédictif §K, ≤ 2)
Si `memory/fund/forecasts.json` contient des scénarios `status: "candidat"` : fais passer chaque
chaîne causale au débat §D — le **baissier attaque la chaîne** (l'effet est-il déjà pricé ? la
chaîne a-t-elle un maillon faible ? quel est le base rate historique de ce type d'événement ?),
l'arbitre tranche : `"validé"` (fixe la **probabilité** finale 0,50-0,95 et durcit le
**falsificateur**) ou `"rejeté"` (note pourquoi en une ligne dans le scénario). Joue ensuite
`node engine/forecasts.js`. Un scénario validé n'est PAS encore une position — vendredi décide,
dans la limite de la poche (`stats.pocket_cap`).

**Écris aussi `memory/fund/convictions.json`** (lu par l'interface, page Indicateurs) — version
structurée des verdicts de la semaine, garde les ~6 plus pertinents (les meilleurs Acheter d'abord) :
```json
{
  "updated": "{date}",
  "items": [
    { "ticker": "VRT", "name": "Vertiv", "verdict": "Acheter|Surveiller|Éviter",
      "confidence": "Haute|Moyenne|Basse", "horizon": "coeur|tactique",
      "sleeve": "coeur|tactique|crypto|socle", "desk": "desk-industrie-energie",
      "thesis": "thèse en UNE ligne", "risk": "le risque qui invaliderait la thèse", "date": "{date}" }
  ]
}
```
`verdict` = ta conviction (Acheter/Surveiller/Éviter) ; `confidence` = force des preuves (method §E).
Garde aussi les **Surveiller/Éviter** avec leur `date` : `attribution.js` mesure ensuite si la
prudence a coûté (opportunités manquées, §I). Un refus non daté ne peut pas apprendre.

## B. Revue de risque du book IA (≤ 2 positions, ciblée)

**Saisines prioritaires (§H) — elles passent AVANT le choix libre ci-dessous.** Le jeudi ne vend
plus sur un signal de prix : il **gèle** et te saisit. Traite d'abord, dans l'ordre :
1. toute position sous **gel de composite 🔴** (composite ≤ −0.2 sans drapeau fondamental) ;
2. toute position ayant franchi le **seuil de réexamen −25 % vs `entry_price`**.
Une saisine **doit ressortir avec un verdict tranché et écrit** — RENFORCER / GARDER / SORTIR —
jamais « à surveiller ». C'est le point du cycle où le jugement remplace la mécanique : le gel
protège la position du bruit hebdomadaire, ton débat décide si la thèse mérite encore le capital.
S'il y a ≥ 2 saisines, elles consomment tout le quota et le choix libre saute.

Sinon, choisis dans `ai-fund.json` **au plus 2 positions** qui méritent le cerveau Opus : soit les
**2 plus gros contributeurs au risque** (`allocation.json → lines.risk_contribution`), soit celles
dont la **règle de sortie est proche d'être touchée** (d'après le Portfolio Doctor de la veille).
Fais-les instruire par leur desk (`desk` de la position) et attaquer par le `risk-manager` —
tu peux grouper ces appels avec ceux de la partie A. Demande aussi au `risk-manager` son
**audit du book** (corrélations cachées, poches vs cibles, drawdown). Pour chacune :
1. L'**hypothèse pivot** écrite à l'entrée tient-elle toujours, chiffres officiels à l'appui (EDGAR/Finnhub) ?
2. **DCF inversé express** (method §C) : la marge de sécurité a-t-elle disparu depuis l'achat ?
3. Mini-débat baissier : qu'est-ce qui casserait la thèse d'ici 3 mois ? est-ce déjà en train d'arriver ?
4. Verdict pour vendredi : **RENFORCER** (thèse confirmée et marge intacte) / **GARDER** / **ALLÉGER**
   / **SORTIR** (pivot faux ou valo extrême) — avec la raison en une ligne.
   ⚠️ **ALLÉGER et SORTIR se justifient par la THÈSE**, jamais par « le cours a monté / le RSI est
   à 80 / le gate a glissé ». Un titre cœur qui monte sans que sa thèse change n'est pas un motif
   d'allègement — c'est la thèse qui marche. Si tu ne peux pas nommer le fait nouveau qui affaiblit
   le dossier, le verdict est GARDER.

Sortie → ajoute un bloc `## Revue book IA — {date}` en haut de `memory/convictions.md` listant
ces verdicts. Le vendredi (PASSE 2) les exécute en priorité. Ne touche à rien d'autre du book ici.

Commit : `deepdive: {date} — {tickers} + revue book ({n} positions)`.

**Persistance (OBLIGATOIRE — le sandbox ne peut pas `git push`, 403).** Après le commit local,
lance `node engine/push-memory.js "{le message de commit ci-dessus}"` : l'endpoint Vercel
(`/api/memory/push`) commite tes fichiers `memory/` sur `claude/memory` — c'est ce qui les fait
apparaître sur la plateforme. Vérifie la sortie : `✅` = persisté, sinon signale-le.

Plafond total Opus : **≤ 3 candidats + ≤ 2 positions book = 5 titres**, instruits par au plus
**5 appels de desks + 1 appel risk-manager**. Le reste attend la semaine suivante.
