# quant-signals.md — les signaux factuels qui gardent l'IA honnête

L'IA ne décide plus « à l'instinct ». Avant d'ouvrir ou de fermer une position, elle
s'appuie sur des **signaux quantitatifs déterministes**, calculés par `engine/signals.js`
et mis en cache dans `memory/fund/signals.json`. Le raisonnement (method §A-§D) reste
souverain, mais il doit **se confronter aux chiffres** : un garde-fou rouge qu'on outrepasse
doit être justifié par écrit. C'est l'inverse d'une boîte noire — les formules sont ici.

## Produire / rafraîchir les signaux

```bash
node engine/signals.js                  # tous les tickers du book IA
node engine/signals.js AMZN NFLX SAF.PA # tickers ciblés (Scout, Deep-dive, Doctor)
```

Économie de quota (CLAUDE.md) : le cache `signals.json` est horodaté (`updated`). Si les
signaux d'un titre datent de **moins de ~5 jours**, réutilise-les ; ne réinterroge pas les API
pour rien. Recalcule sur : nouvelle entrée envisagée, résultats publiés, ou règle de sortie proche.

## Les quatre signaux

### 1. F-Score de Piotroski (0-9) — qualité fondamentale
Neuf tests binaires sur 2 exercices (rentabilité, levier, efficacité). Lecture :
**≥7 solide · 4-6 moyen · ≤3 faible**. Un F-Score faible sur un titre qu'on veut acheter
« pour la croissance » est exactement le genre de contradiction à écrire dans le débat §D.
Si `missing > 3` tests (données absentes), `ok:false` → ne t'appuie pas dessus, note le trou.

### 2. Momentum 12-1 — tendance de prix, **plafonnée**
Rendement de t-12 à t-1 (on exclut le dernier mois). Aligne method §A : le momentum
**positif modéré** confirme ; au-delà de **+60%/an** il bascule en `overheated:true` =
**drapeau de surchauffe**, pas un feu d'achat. On ne court pas après le train.

### 3. Qualité des earnings (accruals)
`accruals_ratio = (résultat net − CFO) / actifs` et `fcf/résultat net`. Des bénéfices
non adossés au cash (accruals élevés, FCF faible) = **drapeau rouge** : la thèse repose sur
de la comptabilité, pas des flux. Drapeaux : `vert` / `ambre` / `rouge`.

### 4. Régime macro (FRED) — garde-fou global
Cadran **RISK-ON SAIN / NORMAL / SURCHAUFFE / STRESS** depuis la courbe des taux (10Y-2Y),
le chômage et l'inflation, avec un **plancher de cash** associé (5% / 15% / 30%). Il alimente
directement le plancher de cash de method §H et peut rétrograder les confiances (§E).
C'est la version chiffrée de `memory/market-regime.md`.

## Le `gate` : comment l'IA s'en sert pour gater §H

Chaque titre reçoit un verdict agrégé dans `signals.json` :

| Verdict | Signification | Conduite (method §H) |
|--------|----------------|----------------------|
| 🟢 **vert** | signaux factuels cohérents | prise de position possible, sizing normal selon §H |
| 🟠 **ambre** | ≥2 drapeaux oranges (momentum chaud, earnings à surveiller, F-Score moyen) | **taille réduite**, hypothèse pivot renforcée, marge de sécurité exigée |
| 🔴 **rouge** | ≥1 drapeau dur (F-Score ≤3, earnings rouges) | **n'ouvre pas / réduis** — sauf thèse exceptionnelle écrite ET défendue contre le baissier |
| ⚪ **indéterminé** | aucun signal exploitable (voir `data_gaps`) | **droit au blanc** : décide sur la méthode qualitative §A-§D et note l'absence de signal |

**Discipline non négociable.**
- Le gate **n'achète ni ne vend** : il informe la décision. L'humain décide (CLAUDE.md).
- **Outrepasser un 🔴 se justifie par écrit** dans `convictions.md`/le brief : pourquoi la
  thèse bat le signal. Un override non argumenté = pas de position.
- Aux **sorties** : un titre détenu qui passe au 🔴 (F-Score qui s'effondre, earnings
  rouges) est un candidat sortie prioritaire au Portfolio Doctor du jeudi.
- **Honnêteté sur les trous** : `data_gaps` non vide → dis-le. Sans clé FMP/FRED, le
  F-Score / la qualité des earnings / le régime ne sont pas calculés ; ne fabrique pas le chiffre.

## Qui s'en sert (par nuit)

| Routine | Usage des signaux |
|---------|-------------------|
| **Lun · Trend Radar** | `signals.regime` ancre le cadran de `market-regime.md` (chiffré). |
| **Mar · Scout** | `signals.js {candidats}` : le pré-score §A intègre F-Score + momentum ; un 🔴 se marque « à éviter ». |
| **Mer · Deep-dive** | recalcul ciblé sur les ★ ; le gate nourrit le débat §D (le baissier cite F-Score/accruals). |
| **Jeu · Portfolio Doctor** | recalcul sur les positions détenues ; tout passage au 🔴 → statut À SURVEILLER/SORTIE. |
| **Ven · Brief/Book** | toute entrée/sortie de la passe 2 **cite le gate** ; sizing §H modulé par verdict + régime. |

Relié à : `skills/engine-method.md` §A (lentilles)/§E (confiance)/§H (sizing & risque),
[`memory-guard.md`](memory-guard.md), `engine/README.md` (formules détaillées).
