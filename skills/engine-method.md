# engine-method.md — la méthode (l'« algo »)

Ce n'est pas une boîte noire prédictive. C'est une méthode explicite, défendable,
que tu appliques de façon cohérente. Aucune étape ne prétend prédire le cours.

---

## A. Score composite multi-lentilles (0-100)

Chaque lentille est notée 0-20, puis pondérée selon l'horizon.

| Lentille | Ce qu'on regarde | Long terme | Court terme |
|----------|------------------|:---------:|:----------:|
| **Qualité** | marges, ROIC, FCF, bilan (dette nette), avantage durable | ×2.0 | ×0.5 |
| **Valorisation** | vs propre historique ET vs pairs ; DCF inversé (cf. C) | ×2.0 | ×1.0 |
| **Catalyseur** | événement identifiable 6-12 mois (résultats, produit, cycle) | ×1.0 | ×2.0 |
| **Momentum** | tendance de prix/estimations — **plafonné** (cf. note) | ×0.5 | ×1.5 |
| **Risque/Bulle** | inverse de la checklist B ; dilution, dépendance, hype | ×1.5 | ×1.0 |

> Momentum plafonné : au-delà d'un seuil (ex. +60% sur 3 mois sans hausse des
> bénéfices), le momentum **cesse d'ajouter** des points et bascule en signal de
> surchauffe (retire des points via la lentille Risque/Bulle). On ne court pas après le train.

Normalise le total pondéré sur 100. Un score n'est jamais publié seul : il
s'accompagne toujours du **niveau de confiance** (section D).

> **Ancrage quantitatif (non négociable).** Les lentilles Qualité, Momentum et
> Risque/Bulle ne se notent pas « au feeling » : tu lis d'abord les signaux factuels de
> `memory/fund/signals.json` (produits par `node engine/signals.js`, cf. `skills/quant-signals.md`) —
> **F-Score Piotroski** (Qualité), **momentum 12-1 plafonné** (Momentum), **accruals/qualité
> des earnings** (Risque/Bulle). Un score qui contredit ces chiffres doit s'expliquer.

---

## B. Checklist bulle / surévaluation (concret, pas du ressenti)

Coche ce qui s'applique. 0-1 = sain ; 2-3 = vigilance ; 4+ = risque de bulle élevé.

- [ ] **DCF inversé** : la croissance implicite dans le cours est-elle irréaliste vs l'histoire du secteur ? (cf. C)
- [ ] **P/S ou EV/Sales extrême** vs propre historique 5 ans ET vs pairs (ex. >2 écarts-types).
- [ ] **Rendement venu surtout de l'expansion des multiples**, pas de la croissance des bénéfices.
- [ ] **Pas de profit / cash burn** avec valorisation pricée comme si la domination était acquise.
- [ ] **Narratif > chiffres** : le cours bouge sur une histoire (IA, espace…) plus que sur les flux.
- [ ] **Dilution / dette** en hausse pour financer la croissance.
- [ ] **Euphorie sociale** : pic de mentions bullish + prix parabolique (signal contrarien).

Écris la conclusion en une phrase : « Bulle improbable / Vigilance / Risque élevé — parce que … ».

---

## C. DCF inversé (l'outil anti-bulle clé)

Plutôt que de deviner les flux futurs, **pars du cours actuel** et demande :
« quelle croissance et quelles marges faut-il pour justifier ce prix ? »
Puis juge si ces hypothèses sont plausibles au regard de l'historique de la société
et de son secteur. Exemple de verdict utile : « À ce cours, le marché price ~30%/an
de croissance pendant 10 ans avec 25% de marge — seuls 1-2 acteurs du secteur l'ont
jamais tenu. La valorisation est donc tendue : le titre est une option sur un futur
parfait, pas une marge de sécurité. » C'est exactement la lecture RKLB de la vidéo 1,
formalisée.

---

## D. Protocole de débat haussier/baissier (routine 2)

Pour chaque candidat retenu, joue trois rôles successifs, par écrit :

1. **Haussier** — construis la meilleure thèse : pourquoi c'est sous-évalué, le
   catalyseur, l'avantage durable. 3-5 arguments chiffrés.
2. **Baissier** — attaque la thèse : la valorisation, le risque d'exécution, la
   concurrence, le scénario où ça se casse. Vise les hypothèses, pas les détails.
3. **Arbitre** — qui gagne et de combien ? La thèse haussière survit-elle à la
   meilleure attaque ? Fixe :
   - **Conviction** : Acheter / Surveiller / Éviter (pour chaque horizon).
   - **Confiance** : Haute / Moyenne / Basse (selon §E).
   - **L'hypothèse pivot** : la chose qui, si elle est fausse, casse tout.
   - **La règle de sortie suggérée** : « vendre si … ».

Règle d'or : si le baissier marque des points faciles que le haussier avait
« oubliés », la confiance baisse automatiquement (le dossier était unilatéral).

---

## E. Comment fixer la confiance

| Niveau | Conditions |
|--------|-----------|
| **Haute** | Fondamentaux solides + valorisation avec marge (DCF inversé plausible) + catalyseur clair + thèse haussière survit nettement au débat + régime non euphorique. |
| **Moyenne** | Bon dossier mais une hypothèse importante non vérifiée, OU valorisation un peu tendue, OU débat serré. |
| **Basse** | Thèse dépend d'une seule hypothèse fragile, OU bulle (B ≥ 4), OU données insuffisantes, OU régime euphorique sans marge de sécurité. |

Le **Regime Radar** (routine 4) peut rétrograder toutes les confiances d'un cran
en régime de surchauffe généralisée.

---

## F. Sentiment / Grok (si un jour activé)

Le sentiment X n'entre **jamais** dans le score de conviction. Il alimente seulement :
- la case « euphorie sociale » de la checklist bulle (contrarien) ;
- le radar de catalyseurs court terme de la poche tactique (avec stop serré).
Pondération maximale du sentiment dans une décision : **témoin, pas juge.**
Rappel de prudence : le sentiment subjectif aide surtout en marché haussier ; les
faits priment en marché baissier.

---

## G. Deux horizons, deux exigences

- **Long terme (cœur)** : on exige qualité + marge de sécurité. On tolère l'absence
  de catalyseur immédiat. On vend quand la thèse se casse, pas quand le prix bouge.
- **Court terme (tactique)** : on exige un catalyseur daté + une règle de sortie
  serrée. Taille de position plus petite. La surchauffe est un risque, pas un feu vert.

---

## H. Gestion du book IA (sizing & risque) — pour battre le groupe, pas pour parier

Le fonds IA est un vrai portefeuille (fictif) qu'on cherche à faire **surperformer** sans
le faire sauter. Évaluer un titre (A-G) ne suffit pas : il faut **dimensionner** et **gérer
le risque**. Règles, appliquées de façon cohérente :

**Gate quantitatif — RÈGLE VERROUILLÉE (préalable à toute entrée/sortie).** Lis
`memory/fund/signals.json` (rafraîchis avec `node engine/signals.js {tickers}` si périmé).
Le `gate` par titre **commande** le sizing, sans exception côté book :

- 🔴 **rouge** → **position INTERDITE**. Si le titre est détenu : **sortie forcée** à la passe.
  **Pas de débat, pas d'override** côté book (un drapeau dur F-Score ≤3 / earnings rouges, ou un
  composite ≤ −0.2, n'est pas négociable). On ne moyenne jamais à la baisse un 🔴.
- 🟠 **ambre** → **taille MAX 5 % du book** ET **stop-loss obligatoire à −8 %** vs entrée, écrit
  à l'achat. Hypothèse pivot renforcée.
- 🟢 **vert** → **sizing normal** selon conviction × calibration ci-dessous, **plafond 20 %**.
- ⚪ **indéterminé** (couverture insuffisante / data_gaps) → **traité comme 🟠** (droit au blanc =
  prudence : max 5 % + stop −8 %).

Le **régime** (`signals.regime`) fixe le plancher de cash ci-dessous. Détail : `skills/quant-signals.md`.
> Cette règle prime sur tout le reste de §H : on calcule la taille « conviction × calibration »
> puis on la **plafonne** par le verdict du gate (🟠/⚪ ⇒ ≤5 % + stop −8 % ; 🔴 ⇒ 0).

**Sizing — pondéré par conviction ET par calibration.**
- Taille cible de base par niveau de confiance : **Haute ≈ 12 %**, **Moyenne ≈ 7 %**,
  **Basse ≈ 3 %** du NAV. Le tactique (court terme) prend la **moitié** de ces tailles.
- **Ajustement calibration** (lis `memory/fund/calibration.json`) : si le hit_rate réel d'un
  bucket est nettement < à ce que la confiance prétend (ex. « Haute » qui ne réussit qu'à 45 %),
  **réduis** la taille cible de ce bucket jusqu'à ce que la calibration revienne. L'IA gagne le
  droit de parier gros en **prouvant** qu'elle a raison, pas en l'affirmant.

**Plafonds (non négociables).**
- **≤ 20 % du NAV** sur une seule position. **≤ 40 %** sur un même secteur/thème (ex. « infra IA »).
- **Plancher de cash modulé par le régime** (lis `memory/market-regime.md`) : RISK-ON sain ≥ 5 %,
  vigilance ≥ 15 %, surchauffe ≥ 30 %. En surchauffe on n'est jamais tout investi.

**Sorties & stop (systématiques, écrits à l'entrée).**
- Toute entrée fixe sa **règle de sortie** (`exit_rule`) et son **hypothèse pivot** AVANT l'achat.
  Pas de règle de sortie = pas de position.
- **Cœur** : on vend quand la **thèse casse** (pivot faux), pas sur un mouvement de prix.
- **Tactique** : stop serré sur invalidation du catalyseur OU −15 à −20 % vs entrée, au plus tôt.
- **On ne moyenne JAMAIS à la baisse une thèse cassée.** Ajouter ne se fait que si la thèse se
  *renforce*, pas pour « réparer » une perte.

**Garde-fou de drawdown.** Si le drawdown du book (vs son plus haut) dépasse **−15 %**, la passe
suivante **réduit le risque** (remonte le cash, coupe d'abord les tactiques et les thèses les plus
fragiles) avant toute nouvelle prise de risque. Survivre d'abord, performer ensuite.

---

## I. Calibration & apprentissage (la boucle qui rend l'IA meilleure)

L'avantage de l'IA n'est pas de « deviner » : c'est de **tenir un registre honnête** et de
**corriger** plus vite qu'un humain. Mécanique :

**Scorer une décision clôturée.** Quand une position est fermée, écris une entrée dans
`memory/fund/decisions.json` : `confidence` annoncée à l'entrée, `realized_pnl_pct`, `outcome`
(« thèse confirmée / cassée / neutre ») et `hit` (la confiance était-elle méritée ?).
- `hit = true` si : confiance **Haute/Moyenne** ET thèse confirmée (ou sortie disciplinée gagnante) ;
  OU confiance **Basse** correctement traitée comme telle (petite taille, pas de casse).
- `hit = false` si le baissier avait raison sur un point que le haussier avait « oublié »
  (dossier unilatéral, cf. §D) — c'est l'erreur la plus instructive.

**Recalculer la calibration** (`memory/fund/calibration.json`) : par bucket de confiance,
`hit_rate = hits / n` et `avg_return`. Plus les `global` : win_rate, avg_win, avg_loss,
**profit_factor** (= somme des gains / somme des pertes ; > 1.5 = sain), max_drawdown.

**Honnêteté façon Brier.** Une IA bien calibrée a un hit_rate qui **croît** avec la confiance :
Basse < Moyenne < Haute. Si ce n'est pas le cas, la confiance est du bruit → la passe mensuelle
(`routines/monthly-calibration.md`) **rétrograde le sizing** du bucket fautif et **durcit** ses
critères, jusqu'à ce que confiance annoncée et réussite réelle se rejoignent.

**Boucle de feedback (concrète).**
1. Vendredi : score les fermetures → leçons datées dans `lessons.md` → maj des 2 JSON.
2. Mensuel : lis la calibration → ajuste les **tailles cibles §H** et le **ton des conseils**
   (une « Haute » mal calibrée vaut une « Moyenne » dans le brief).
3. Le brief cite ce qui a changé (« 🔧 Ce que je corrige ») : la correction est **publique**,
   donc traçable. Une erreur qui produit une leçon appliquée n'est pas une perte, c'est un edge.
