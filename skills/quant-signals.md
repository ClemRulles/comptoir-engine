# quant-signals.md — les signaux factuels qui gardent l'IA honnête

L'IA ne décide plus « à l'instinct ». Avant d'ouvrir ou de fermer une position, elle
s'appuie sur des **signaux quantitatifs déterministes**, calculés par `engine/signals.js`
et mis en cache dans `memory/fund/signals.json`. Le raisonnement (method §A-§D) reste
souverain, mais il doit **se confronter aux chiffres** : un garde-fou rouge qu'on outrepasse
doit être justifié par écrit. Les formules sont ici — rien n'est une boîte noire.

## Produire / rafraîchir les signaux

```bash
node engine/signals.js                  # tous les tickers du book IA
node engine/signals.js AMZN NFLX SAF.PA # tickers ciblés (Scout, Deep-dive, Doctor)
```

Économie de quota (CLAUDE.md) : `signals.json` est horodaté (`updated`). Si les signaux
d'un titre datent de **< ~5 jours**, réutilise-les. Recalcule sur : nouvelle entrée
envisagée, résultats publiés, règle de sortie proche.

**Aucune clé n'est requise pour tourner.** Yahoo (prix) et OpenInsider (initiés US) sont
gratuits et suffisent à un gate exploitable. FMP / FRED / Alpha Vantage **enrichissent**
le gate ; absentes → `null` + `data_gaps` (jamais de plantage, jamais de chiffre inventé).

## Les signaux, leur formule, leur source

### Prix — Yahoo Finance (gratuit, sans clé, 1 appel/titre)
| Signal | Formule | Lecture |
|--------|---------|---------|
| **Momentum 12-1** | `close[t-21j] / close[t-252j] − 1` (exclut le dernier mois) | >+60% = surchauffe (drapeau), positif modéré = confirme |
| **RSI 14** | RSI de Wilder sur 14 clôtures | <30 survendu · 45-60 sain · 60-70 fort · >70 suracheté |
| **Volume relatif 20j** | `volume[t] / moyenne(volume[t-20..t-1])` | >1.3 = intérêt inhabituel (témoin, faible poids) |
| **Range 52 sem.** | `(cours − bas52) / (haut52 − bas52)` ∈ [0,1] | proche de 0 = prix cassé · proche de 1 = près des hauts |

### Initiés — OpenInsider (gratuit, sans clé, **US uniquement**)
- **Ratio achats/ventes 90j** = `achats / (achats + ventes)` sur les transactions d'initiés
  des 90 derniers jours. >0.6 = net acheteur (positif), <0.4 = net vendeur.
- Réservé aux titres dont le symbole Yahoo n'a pas de suffixe de place (US pur). Les
  européens/HK → `null` (OpenInsider ne les couvre pas).

### Fondamentaux — FMP (clé `FMP_API_KEY`)
- **F-Score de Piotroski (0-9)** : 9 tests binaires sur 2 exercices (rentabilité, levier,
  efficacité). ≥7 solide · 4-6 moyen · ≤3 faible. Si `missing > 3` tests → `ok:false`.
- **Qualité des earnings** : `accruals_ratio = (résultat net − CFO) / actifs` et `FCF/RN`.
  Accruals élevés / FCF faible = bénéfices peu adossés au cash → drapeau `ambre`/`rouge`.

### Croissance — Alpha Vantage (clé `ALPHAVANTAGE_API_KEY`, free 25/jour)
- **EPS surprise** : `surprisePercentage` du dernier trimestre. >+5% favorable, <−5% défavorable.
- **Croissance du CA YoY** : `CA[N] / CA[N-1] − 1`. >+15% fort, <0 contraction.

### Régime macro — FRED (clé `FRED_API_KEY`)
Cadran **RISK-ON SAIN / NORMAL / SURCHAUFFE / STRESS** + plancher de cash (5/15/30%) depuis :
- **Courbe des taux** `T10Y2Y` (inversion <0 = stress) · **chômage** `UNRATE` · **inflation**
  `CPIAUCSL` (YoY) ;
- **Proxy peur/avidité** : `VIXCLS` (VIX) + `BAMLH0A0HYM2` (spreads High Yield). VIX>28 ou
  spreads>6% = « peur » ; VIX<15 + spreads<3,5% = « avidité ». Alimente le plancher de cash §H.

## Le `gate` : score composite pondéré

Chaque signal disponible donne une **sous-note dans [−1, +1]** (baissier→haussier),
multipliée par son **poids**. Le composite est la **moyenne pondérée des signaux présents**
(un signal absent ne compte pas et ne pénalise pas). Poids (somme = 1.0, miroir de
`GATE_WEIGHTS` dans `engine/lib/calc.js` — à garder synchronisés) :

| Signal | Poids | Signal | Poids |
|--------|:----:|--------|:----:|
| F-Score Piotroski | 0.28 | RSI 14 | 0.10 |
| Qualité des earnings | 0.15 | Range 52 sem. | 0.10 |
| Momentum 12-1 | 0.15 | Initiés 90j | 0.10 |
| | | Volume relatif | 0.04 |
| EPS surprise | 0.04 | Croissance CA | 0.04 |

**Verdict** (depuis le composite `c` et les drapeaux durs) :

| Verdict | Condition | Conduite (method §H — STRICT) |
|--------|-----------|-------------------------------|
| 🔴 **rouge** | drapeau dur (F-Score ≤3 OU earnings rouges) **ou** `c ≤ −0.2` | **position INTERDITE / sortie forcée**. Pas de débat. |
| 🟠 **ambre** | `−0.2 < c < 0.2` | **taille max 5% du book + stop-loss −8% obligatoire**. |
| 🟢 **vert** | `c ≥ 0.2` | sizing normal selon conviction, **plafond 20%**. |
| ⚪ **indéterminé** | couverture des poids < 0.15 (signaux insuffisants) | **traité comme 🟠** (droit au blanc = prudence). |

`coverage` (dans `signals.json`) = part du poids total réellement couverte par des données :
un gate 🟢 avec coverage 39% (prix seuls, sans clé) est moins étayé qu'un 🟢 à 100%.

**Discipline non négociable.**
- Le gate **n'achète ni ne vend** : il informe la décision. L'humain décide (CLAUDE.md).
- **Outrepasser un 🔴 est interdit** côté book (sortie forcée). Pour une analyse Deep-dive,
  un 🔴 qu'on discute quand même se justifie par écrit dans `convictions.md`.
- **Honnêteté sur les trous** : `data_gaps` non vide → dis-le. Sans clé FMP/FRED/Alpha Vantage,
  le F-Score / le régime / la croissance ne sont pas calculés ; ne fabrique pas le chiffre.

## Qui s'en sert (par nuit)

| Routine | Usage des signaux |
|---------|-------------------|
| **Lun · Trend Radar** | `signals.regime` ancre le cadran de `market-regime.md` (chiffré + peur/avidité). |
| **Mar · Scout** | `signals.js {candidats}` : pré-score §A intègre F-Score + momentum + RSI ; un 🔴 = « à éviter ». |
| **Mer · Deep-dive** | recalcul ciblé sur les ★ ; le baissier (§D) cite F-Score, accruals, range 52 sem., initiés. |
| **Jeu · Portfolio Doctor** | recalcul sur les positions ; tout passage au 🔴 → statut À SURVEILLER / SORTIE. |
| **Ven · Brief/Book** | toute entrée/sortie cite le gate (verdict + composite + coverage) ; sizing §H STRICT par verdict. |

Relié à : `skills/engine-method.md` §A (lentilles)/§E (confiance)/§H (sizing STRICT),
[`memory-guard.md`](memory-guard.md), `engine/README.md` (détail d'implémentation).
