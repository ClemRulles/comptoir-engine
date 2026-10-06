# engine/ — couche moteur déterministe

Deux outils Node (zéro dépendance, Node 18+) que les routines appellent via Bash.
Ils rendent l'état du fonds **robuste** et les décisions **adossées à des signaux factuels**,
sans changer la philosophie « routines markdown jouées par Claude Code ».

## `node engine/guard.js` — garde-fou de la mémoire
À jouer **en tout début de chaque routine**. Garantit que `memory/fund/*.json` sont
présents et valides :
- fichier **absent** ou **illisible** → recréé depuis le schéma canonique (l'original
  corrompu est mis en quarantaine `*.corrupt-<ts>`, jamais perdu) ;
- fichier **lisible mais incomplet** (clé/bucket manquant) → **complété** sans toucher
  aux données présentes (`decisions[]`, `positions[]`, `trades[]`…).

Sortie : rapport lisible + ligne `GUARD_JSON:{…}`. Code de sortie **0** = sain (ou réparé
sans recréation), **2** = un fichier a dû être recréé → **à signaler dans le brief**.
Idempotent et non-destructif (re-jouable sans risque).

## `node engine/signals.js [TICKERS…]` — pipeline de signaux quantitatifs
Calcule des signaux **factuels et déterministes** pour gater les décisions (method §A/§H) :

| Signal | Quoi | Source | Clé requise |
|--------|------|--------|:-----------:|
| **Momentum 12-1** | rendement t-252j→t-21j, **plafonné** (surchauffe >+60%) | Yahoo | — (gratuit) |
| **RSI 14** | force relative de Wilder (survendu/suracheté) | Yahoo | — (gratuit) |
| **Volume relatif 20j** | volume / moyenne 20 séances | Yahoo | — (gratuit) |
| **Range 52 sem.** | position du cours dans [bas52, haut52] | Yahoo | — (gratuit) |
| **Initiés 90j** | ratio achats/ventes d'initiés (US) | OpenInsider | — (gratuit) |
| **F-Score Piotroski** (0-9) | qualité fondamentale (rentabilité, levier, efficacité) | FMP | `FMP_API_KEY` |
| **Qualité des earnings** | accruals = (RN−CFO)/actifs, FCF/RN | FMP | `FMP_API_KEY` |
| **EPS surprise / croissance CA** | surprise trimestrielle, CA YoY | Alpha Vantage | `ALPHAVANTAGE_API_KEY` |
| **Régime macro + peur/avidité** | cadran, cibles de poches (cash fixe 10 %), VIX, spreads HY | FRED | `FRED_API_KEY` |

Puis un **`gate`** composite pondéré par titre : 🟢 vert / 🟠 ambre / 🔴 rouge / ⚪ indéterminé
(poids et seuils dans `skills/quant-signals.md`, miroir de `GATE_WEIGHTS` dans `lib/calc.js`).
Écrit le cache `memory/fund/signals.json` en le **fusionnant** (analyser un candidat n'efface
pas les signaux du book ; entrées > 60 jours élaguées). Sans arguments, prend les tickers du book IA.
`--dry` calcule et affiche sans écrire : c'est le mode des desks spécialisés (method §L).

**Dégradation propre** : aucune clé n'est requise. Yahoo + OpenInsider (gratuits) suffisent à
un gate exploitable sur les 15 positions. Toute source absente (clé, quota, réseau) → signal
`null` + entrée dans `data_gaps`. Ne bloque jamais une routine. Un gate dont la couverture des
poids est < 0.15 est **« indéterminé »** (jamais « vert »), traité comme 🟠 par §H.

## `node engine/risk.js` — allocation & budget de risque (method §H/§M)
Valorise le book en € (cours `signals.json` ou Yahoo + change), ventile le NAV par **poche**
(cœur / socle / tactique / crypto / cash) contre les cibles du mandat (`MANDATE` dans
`lib/calc.js`, infléchies par le régime), contrôle les plafonds (ligne, secteur, thème, crypto,
bande de cash 5-15 %), mesure le **risque réel sur 1 an** (volatilité du book, drawdown,
volatilité et contribution au risque de chaque ligne) et suit le NAV (`nav_history`) pour le
garde-fou de drawdown −20 %. Écrit `memory/fund/allocation.json`.

## `node engine/attribution.js` — apprendre de ses erreurs (method §I/§L)
Regret des ventes (cours actuel vs prix de vente), alpha réalisé + latent **par desk, par poche,
par confiance**, multiplicateur de sizing **mérité** par desk (`desk_multipliers`), et
opportunités manquées (verdicts Surveiller/Éviter vs IWDA). Écrit `memory/fund/attribution.json`.

## `node engine/history.js [TICKERS…] [--dry]` — taux de base (method §I)
10 ans de cours Yahoo par titre : CAGR, volatilité, pire drawdown, drawdown actuel, % de
fenêtres 12 mois positives, et **analogues** (rendements 12 mois observés quand le titre était
aussi loin de son plus haut qu'aujourd'hui). Cache `memory/fund/history.json`. Un taux de base,
jamais une prédiction.

## `node engine/test.js` — smoke tests hors-ligne
138 assertions sur les fonctions pures (`lib/calc.js` : signaux de prix, gate pondéré, régime,
mandat et poches, risque de portefeuille, taux de base historiques, regret des ventes, desks)
et les schémas/IO (`lib/schema.js`, `lib/io.js`). Aucun réseau, aucune clé. À lancer après
toute modif du moteur.

## Arborescence
```
engine/
  guard.js          garde-fou JSON (CLI)
  signals.js        pipeline de signaux (CLI)
  risk.js           allocation par poche + budget de risque + garde-fou drawdown (CLI)
  attribution.js    regret des ventes, alpha par desk/poche, opportunités manquées (CLI)
  history.js        taux de base historiques 10 ans (CLI)
  test.js           smoke tests offline
  lib/
    schema.js       schémas canoniques + complétion non-destructive
    io.js           lecture/écriture JSON sûres + quarantaine
    sources.js      adaptateurs Yahoo / OpenInsider / FMP / FRED / Alpha Vantage (tolérants aux pannes)
    prices.js       cours en € (signals.json ou Yahoo + change)
    calc.js         fonctions PURES : momentumFromCloses, rsi, relativeVolume, range52w,
                    insiderSignal, piotroski, earningsQuality, regimeScore, gate (+ GATE_WEIGHTS),
                    MANDATE/sleeveTargets/inferSleeve/volAdjust, annualVol, portfolioRisk,
                    historyStats, sellRegret, groupPerformance, deskMultiplier
```

Les clés API vivent dans les variables d'environnement (jamais dans un fichier ni un commit).
