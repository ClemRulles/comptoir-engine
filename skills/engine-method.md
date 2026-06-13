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

## F. Sentiment / Grok — un témoin qui peut GAGNER une voix (jamais l'obtenir sur la foi)

Le sentiment X n'entre **jamais** dans le score de conviction *cœur*. Pour le **long terme**, il
reste strictement un **témoin** :
- la case « euphorie sociale » de la checklist bulle (contrarien — l'euphorie marque les tops) ;
- le **pouls hebdo** (`memory/grok-pulse.json`, lundi Partie D) : thèmes/titres qui bougent, **à
  corroborer**. Un thème ne devient candidat que recoupé par une source dure (`corroborated:true`).

**Mais le sentiment a un edge POSSIBLE à court terme** (réaction rapide aux news, momentum
retail) — possible, pas prouvé. On ne le croit donc pas : on le **mesure**, et il **gagne** une
voix tactique en proportion de ce qu'il prouve. Mécanique (`memory/fund/grok-calls.json`,
`engine/grok.js`), miroir exact de la calibration §I et du book §K :

1. **Chaque intuition Grok devient un call falsifiable**, pré-enregistré le lundi : `ticker`,
   `direction` (hausse/baisse à ~2 semaines), `confidence` (0,5-0,9), thèse 1 ligne, `horizon`.
   « Ça va monter » sans horizon est invérifiable ; un call Grok est jugeable à date fixe.
2. **Il est scoré contre le prix réel** (`engine/grok.js`) : `correct` si le mouvement a suivi la
   direction au-delà de ±2 % ; `brier = (confidence − correct)²`. Exigeant : le sentiment prétend
   prédire un *mouvement*, pas de la stagnation.
3. **Le budget tactique de Grok se MÉRITE, en partant de ZÉRO** : `stats.tactical_cap` = 0 % tant
   que < 6 calls résolus (Grok n'a rien prouvé → aucune allocation, pur radar). Ensuite, hit_rate
   ≥ 0,55 → 3 %, ≥ 0,65 → 6 %, ≥ 0,70 → 8 % du NAV ; < 0,45 → retour à 0 %. Une IA qui surécoute
   un Grok médiocre voit sa poche se fermer toute seule.

**Garde-fous (non négociables, même si Grok est calibré).** Un call ne déclenche un trade que
**tactique** : demi-taille (§G/§H), **jamais sur un gate 🔴**, **jamais contre la checklist bulle
§B** (un parabolique hypé reste « éviter »), stop serré, date d'horizon = déclencheur de sortie,
fenêtre du jeudi applicable (vente seule). Le total des positions Grok ≤ `tactical_cap`. Le
sentiment ne **relève jamais** la confiance d'un dossier cœur, et n'autorise **aucun** achat sur
le seul sentiment d'une crypto (CLAUDE.md). **Témoin qui a gagné le droit de voter — jamais juge.**
Rappel : le sentiment aide surtout en marché haussier ; en marché baissier, les faits priment et
`tactical_cap` doit être lu à l'aune du régime (en SURCHAUFFE/STRESS, reste sous le plancher de cash §H).

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

**Fenêtres de décision asymétriques (jeudi = vente seule, vendredi = tout).** Sortir vite est
urgent ; entrer vite ne l'est presque jamais. Le book a donc DEUX fenêtres d'exécution :
- **Jeudi (Portfolio Doctor)** : **ventes défensives uniquement** — `exit_rule` touchée, thèse
  cassée, gate 🔴 (sortie forcée), stop −8 % d'une 🟠/⚪, verdict Opus SORTIR/ALLÉGER non exécuté.
  **Aucun achat, aucun renforcement le jeudi**, même gate 🟢 : une entrée mérite l'instruction
  complète du cycle (débat §D du mercredi → exécution du vendredi). La latence de sortie pire-cas
  passe de ~7 jours à ~3-4 sans ouvrir la porte au sur-trading (les frais §H font le reste).
- **Vendredi (Brief/Book)** : sorties restantes, puis entrées/renforcements selon convictions ×
  calibration × gate. C'est la SEULE fenêtre d'achat de la semaine.

**Frais de friction (réalisme du paper trading).** Chaque trade du book (achat ET vente) coûte
**0,30 % du montant** (frais + spread forfaitaires), débité du cash et loggé (`fee`) dans le trade.
Le groupe paie de vrais frais : un book sans frais gagnerait à sur-trader — c'est exactement le
biais qu'on veut interdire. Tout P&L réalisé (§I) est **net de frais**.

**Garde-fou de drawdown.** Si le drawdown du book (vs son plus haut) dépasse **−15 %**, la passe
suivante **réduit le risque** (remonte le cash, coupe d'abord les tactiques et les thèses les plus
fragiles) avant toute nouvelle prise de risque. Survivre d'abord, performer ensuite.

---

## I. Calibration & apprentissage (la boucle qui rend l'IA meilleure)

L'avantage de l'IA n'est pas de « deviner » : c'est de **tenir un registre honnête** et de
**corriger** plus vite qu'un humain. Mécanique :

**Scorer une décision clôturée.** Quand une position est fermée, écris une entrée dans
`memory/fund/decisions.json` : `confidence` annoncée à l'entrée, `realized_pnl_pct` (net de
frais §H), `benchmark_return_pct`, `alpha_pct`, `outcome` (« thèse confirmée / cassée / neutre »)
et `hit` (la confiance était-elle méritée ?).
- **L'alpha, pas le P&L brut, mesure le skill.** `benchmark_return_pct` = rendement du MSCI World
  EUR sur la même période (`node engine/bench.js {opened} {closed}`) ; `alpha_pct =
  realized_pnl_pct − benchmark_return_pct`. Un +5 % quand le marché fait +9 % n'est pas un succès :
  c'est du bêta moins un coût d'opportunité.
- `hit = true` si : confiance **Haute/Moyenne** ET thèse confirmée ET **alpha > 0** (ou sortie
  disciplinée qui évite une perte que le marché n'a pas subie) ; OU confiance **Basse**
  correctement traitée comme telle (petite taille, pas de casse).
- `hit = false` si le baissier avait raison sur un point que le haussier avait « oublié »
  (dossier unilatéral, cf. §D) — c'est l'erreur la plus instructive.

**Recalculer la calibration** (`memory/fund/calibration.json`) : par bucket de confiance,
`hit_rate = hits / n` et `avg_return`. Plus les `global` : win_rate, avg_win, avg_loss,
**profit_factor** (= somme des gains / somme des pertes ; > 1.5 = sain), max_drawdown.

**Honnêteté façon Brier.** Une IA bien calibrée a un hit_rate qui **croît** avec la confiance :
Basse < Moyenne < Haute. Si ce n'est pas le cas, la confiance est du bruit → la passe mensuelle
(`routines/monthly-calibration.md`) **rétrograde le sizing** du bucket fautif et **durcit** ses
critères, jusqu'à ce que confiance annoncée et réussite réelle se rejoignent.
**Seuil statistique : n ≥ 8 décisions par bucket avant tout ajustement de sizing.** En dessous,
le hit_rate est du bruit (une malchance ≠ une mauvaise calibration) : on constate, on n'ajuste pas.

**Boucle de feedback (concrète).**
1. Vendredi : score les fermetures → leçons datées dans `lessons.md` → maj des 2 JSON.
2. Mensuel : lis la calibration → ajuste les **tailles cibles §H** et le **ton des conseils**
   (une « Haute » mal calibrée vaut une « Moyenne » dans le brief).
3. Le brief cite ce qui a changé (« 🔧 Ce que je corrige ») : la correction est **publique**,
   donc traçable. Une erreur qui produit une leçon appliquée n'est pas une perte, c'est un edge.

---

## J. Catalyseurs datés — anticiper le connu, jamais deviner le surprise

Le moteur est lent par choix (cadence hebdo) et **anti-réaction** : courir après un gros titre
est un jeu perdant, le marché l'a pricé en minutes. Mais il y a un terrain sain entre « réagir »
et « subir » : **anticiper les événements publics et datés**. C'est le rôle de `memory/catalysts.md`,
rempli le lundi (Trend Radar §C) et re-validé le vendredi (Brief).

**Ce qu'on note (uniquement) :** des dates au calendrier — FOMC, CPI/PCE, emploi, BCE, OPEP
(macro) ; élections, échéances tarifaires/douanières, votes, deadlines (politique) ; FDA, antitrust
(réglementaire) ; résultats de nos positions ou de la watchlist, IPO d'un thème (micro).
**Ce qu'on ne note jamais :** « X pourrait annoncer Y ». Un catalyseur sans date au calendrier
n'existe pas pour le moteur.

**Deux usages, deux disciplines distinctes :**
1. **Risque sur une position détenue** (gestion du risque, prioritaire). Un événement binaire
   (résultats, décision tarifaire sur le secteur) sur un titre qu'on porte = on **réduit
   l'incertitude** : alléger, ou simplement décider à l'avance la réaction (« si guidance coupée
   → sortie »). Le but est de **ne pas se faire surprendre**, pas de parier sur l'issue.
2. **Vent favorable à une thèse qu'on a déjà avec marge** (offensif, secondaire). Si le débat
   (§D) a déjà validé un nom **avec marge de sécurité**, un catalyseur daté proche peut justifier
   une **entrée tactique** : demi-taille (§G/§H), **date de l'événement = déclencheur de
   décision/sortie**, stop serré. Le catalyseur est un *bonus de timing sur une bonne thèse*,
   jamais la thèse elle-même.

**Le test de survie lundi → vendredi.** Un catalyseur repéré lundi n'est joué que s'il **survit au
vendredi** : toujours au calendrier (non annulé/déplacé), pas déjà pricé par le marché, et le
régime + la valo laissent encore une marge. Sinon on n'y touche pas. Après l'événement, on le
**score** (l'anticipation a-t-elle aidé ?) → leçon datée (§I) → archive. C'est une boucle
d'apprentissage de plus, appliquée au *timing*, pas seulement au *choix de titre*.

Garde-fou : un catalyseur **ne relève jamais** une confiance Basse en Haute, et ne contourne
jamais la checklist bulle (§B). Un mauvais dossier avec un bon catalyseur reste un mauvais dossier.

---

## K. Book de scénarios — prédire le second ordre, en se mesurant

§J anticipe des événements datés sur des titres qu'on suit. §K va un cran plus loin : **parier
(petit) sur les effets de second ordre d'un événement** — l'exemple canonique : « IPO SpaceX
confirmée → les pure-players spatiaux subissent la concurrence pour le capital, les fournisseurs
en profitent ensuite, Tesla bouge sur l'effet-Musk ». C'est du jugement sur le futur — autorisé
UNIQUEMENT sous la discipline du pré-registre `memory/fund/forecasts.json`.

**Le pré-registre (ce qui distingue « anticiper » de « espérer »).** AVANT de jouer quoi que ce
soit, le scénario est écrit avec : l'**événement déclencheur** (daté ou conditionnel observable),
la **chaîne causale** (qui est impacté, dans quel ordre, pourquoi), une **probabilité annoncée**
(0,50-0,95 — l'IA s'engage sur un chiffre), un **horizon** (date limite de résolution), un
**falsificateur** (ce qui prouvera que c'était faux — pas de falsificateur = pas de scénario),
et les **instruments** cotés (direct + pioches/pelles). « Ça va remonter » est invérifiable ;
un scénario §K est jugeable à date fixe.

**Le cycle (zéro routine en plus).**
- **Lundi** détecte 0-2 scénarios candidats (news, IPO, régulation, calendrier §J) → `status:
  "candidat"`. Le droit au blanc s'applique : zéro candidat la plupart des semaines est NORMAL.
- **Mercredi (Opus)** attaque la chaîne causale en débat §D — le baissier cherche le maillon
  faible (déjà pricé ? chaîne trop longue ? base rate des IPO ?) → `"validé"` (probabilité et
  falsificateur finalisés) ou `"rejeté"`.
- **Vendredi** ouvre les positions des scénarios validés (poche ci-dessous, `thesis_id` du trade
  = id du scénario, `status: "joué"`), et **résout** ceux dont l'horizon ou l'événement est passé.
- `node engine/forecasts.js` après toute modification : expire les périmés, recalcule les stats,
  ajuste la poche.

**La poche (plafonds stricts).** Total scénarios ≤ `stats.pocket_cap` du NAV (départ 10 %).
Par scénario : **demi-taille tactique** (§G/§H), stop serré, date de résolution = déclencheur de
sortie/décision, **jamais sur un gate 🔴**, et la fenêtre du jeudi s'applique (vente seule).
Le plafond se **mérite** (recalculé par forecasts.js) : < 6 résolus → 10 % ; hit_rate ≥ 0,6 →
15 % ; ≥ 0,7 → 20 % ; < 0,45 → 5 %. Une IA qui prédit mal voit sa poche rétrécir toute seule.

**Le scoring en deux temps (l'honnêteté de l'arme).** À résolution, le vendredi écrit dans
`resolution` : `happened` (le scénario s'est-il réalisé ? jugé contre le falsificateur),
`brier` = (probability − happened)², et — si joué — `trade_alpha_pct` (alpha du trade, §I).
**Les deux mesures sont séparées** : on peut prédire juste et trader mal (mal timé, mal
instrumenté) ou gagner par chance en s'étant trompé. C'est la distinction qui apprend à l'IA
à *prédire mieux*, pas juste à trader. Leçon datée dans `lessons.md` à chaque résolution.

Garde-fous hérités : jamais de pari sur le **contenu** d'une annonce surprise (§J), le sentiment
social ne valide rien (§F), la checklist bulle s'applique aux instruments (§B), et un scénario
ne relève jamais la confiance d'un dossier par ailleurs faible.
