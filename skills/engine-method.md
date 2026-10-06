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

Pour chaque candidat retenu, trois rôles successifs, par écrit. Depuis 2026-10 ils sont tenus
par **trois voix distinctes** (§L) : le **desk** spécialisé qui a sourcé l'idée plaide le
haussier, le sous-agent **`risk-manager`** plaide le baissier, et le **CIO** (la routine)
arbitre. Un débat joué par une seule voix finit toujours par se donner raison.

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
`tactical_cap` doit être lu à l'aune du régime (en SURCHAUFFE/STRESS, la cible de la poche tactique §H baisse déjà).

---

## G. Deux horizons, deux exigences

- **Long terme (cœur)** : on exige qualité + marge de sécurité. On tolère l'absence
  de catalyseur immédiat. On vend quand la thèse se casse, pas quand le prix bouge.
- **Court terme (tactique)** : on exige un catalyseur daté + une règle de sortie
  serrée. Taille de position plus petite. La surchauffe est un risque, pas un feu vert.
- **Crypto** : BTC/ETH se tiennent comme du long terme (pas de stop de prix, sortie sur thèse
  §M) ; les alts se traitent comme du tactique (stop, horizon daté).

**Ce que « long terme » veut dire concrètement (sinon le mot ne coûte rien).** Une position
cœur porte un `horizon_test` : la **prochaine publication de résultats** de la société. Entre
deux `horizon_test`, elle est **intouchable** — sauf `exit_rule` écrite touchée, thèse cassée,
drapeau fondamental §H, ou seuil de réexamen −25 %. Ni le RSI, ni le range 52 semaines, ni un
composite qui glisse de 0,21 à 0,19 ne sont des motifs d'action sur une ligne cœur : ce sont
des données de marché à un horizon de quelques jours, appliquées à une thèse à horizon de
quelques années. **Un titre cœur se juge sur ses résultats, à la date de ses résultats.**

Corollaire de cadence : la question du vendredi n'est pas « qu'est-ce qui a bougé ? » mais
« **qu'est-ce qui a changé dans les faits depuis la semaine dernière ?** ». Si la réponse est
« rien », l'action correcte est **rien** — et le brief le dit.

---

## H. Gestion du book IA — mandat, poches, sizing & risque

**Le mandat (ce que le book cherche, depuis 2026-10-06).** Maximiser la **richesse à long
terme** : le rendement total **net de frais** sur 3-5 ans, mesuré contre IWDA.AS et contre le
groupe, avec un risque **équilibré** (volatilité visée 13-20 %/an, garde-fou à −20 % de
drawdown). Le book se gère comme un investisseur professionnel : des **convictions
single-stock long terme** au centre, un **socle indiciel** en complément, des **coups
tactiques** datés, une **poche crypto** disciplinée, et **10 % de cash comme réserve de tir** —
jamais comme abri.

Pourquoi ce mandat : du 2026-06-04 au 2026-08-29, le book a porté 35-42 % de cash et perdu
5,8 points contre le groupe et 6,1 contre l'indice ; 14 de ses 17 ventes se traitaient ensuite
au-dessus de leur prix de vente. Un book trop liquide et trop prompt à vendre ne compose pas.

**Allocation stratégique** (`MANDATE` dans `engine/lib/calc.js`, contrôlée chaque lundi, jeudi
et vendredi par `node engine/risk.js` → `memory/fund/allocation.json`) :

| Poche | Contenu | Cible | Bande |
|-------|---------|:-----:|:-----:|
| **Cœur** | convictions single-stock 3-5 ans, nées d'un débat §D | 60 % | 45-75 % |
| **Socle** | ETF indiciels, régionaux, thématiques (IWDA.AS par défaut) | 12 % | 0-20 % |
| **Tactique** | catalyseurs datés §J, scénarios §K, calls Grok §F, momentum court terme | 10 % | 0-15 % |
| **Crypto** | BTC/ETH d'abord, alts plafonnées (§M) | 8 % | 0-10 % |
| **Cash** | réserve de tir pour les coups et les replis | **10 %** | 5-15 % |

**Le régime n'achète plus de cash : il change la composition.** Le cash vise 10 % dans tous les
régimes. Le régime infléchit seulement la crypto et la tactique ; le poids libéré va au socle
(on garde le bêta sans forcer de stock-picking), puis au cœur si le socle est plein :

| Régime | Crypto | Tactique | Socle | Cœur |
|--------|:-----:|:-----:|:-----:|:-----:|
| RISK-ON SAIN | 8 % | 10 % | 12 % | 60 % |
| NORMAL | 6 % | 10 % | 14 % | 60 % |
| SURCHAUFFE | 5 % | 8 % | 17 % | 60 % |
| STRESS | 3 % | 5 % | 20 % | 62 % |

En SURCHAUFFE, la prudence passe par la **sélection** (marge de sécurité réelle exigée §E,
qualité, redondance P-003), pas par le cash. En STRESS, le cash de 10 % sert à **acheter** les
convictions que le marché solde — c'est sa raison d'être.

Ce que chaque poche veut dire :
- **Cœur sous 45 %** = les desks ne trouvent pas assez : le mardi élargit le sourcing, le socle
  porte l'exposition en attendant. On ne baisse jamais la barre §D/§E pour remplir le cœur.
- **Socle** = l'ancien « résidu indiciel » devenu une vraie poche : il porte ce que le cœur n'a
  pas encore trouvé et **se vend en premier** pour financer une nouvelle conviction (ce n'est
  pas un trade de dimensionnement). Ni gate, ni stop, ni exit_rule de prix. Au-delà de 20 %,
  c'est le cœur qui doit travailler.
- **Tactique** = jamais obligatoire (plancher 0) : pas de coup sans date de sortie et sans stop.
- **Cash hors bande 5-15 %** = déploiement (au-dessus) ou financement par ventes (en dessous)
  obligatoire le vendredi, en le disant dans le brief.

**Gate quantitatif — RÈGLE VERROUILLÉE (préalable à toute entrée action).** Lis
`memory/fund/signals.json` (rafraîchis avec `node engine/signals.js {tickers}` si périmé).
Le gate ne s'applique **ni à la crypto** (§M) **ni au socle ETF**.

Le gate est un **filtre d'ENTRÉE**, pas un ordre de vente. Il commande **ce qu'on achète et
combien**, jamais à lui seul ce qu'on garde. Distinction fondatrice, née de la mesure du
2026-08-29 (17 ventes du book : 14 en dessous du cours d'aujourd'hui ; les 9 sorties forcées
de juin ont coûté **+278 €** de manque à gagner) : le composite est pondéré à **0,35 par des
signaux de prix** (momentum, RSI, range 52 sem.) qui oscillent d'une semaine à l'autre. Faire
piloter une VENTE par un signal de prix sur un book cœur, c'est vendre bas et racheter haut
avec méthode. §G gouverne la sortie d'une position cœur : **on vend quand la thèse casse.**

- 🔴 **rouge par DRAPEAU FONDAMENTAL** (F-Score ≤ 3 **ou** earnings quality rouge) →
  **position INTERDITE, sortie forcée**. Pas de débat, pas d'override : ce sont des faits
  comptables, pas du prix. On ne moyenne jamais à la baisse un drapeau dur. (Banques et
  assureurs : le F-Score est mal adapté — le desk-finance le dit et le CIO juge sur ROTE,
  P/TBV, qualité du crédit, mais le drapeau earnings rouge reste dur.)
- 🔴 **rouge par COMPOSITE seul** (`c ≤ −0.2` sans drapeau fondamental) → **GEL**, pas sortie :
  aucun achat, aucun renforcement, position figée, **réexamen §D obligatoire au deep-dive du
  mercredi suivant**. La vente n'a lieu que si ce réexamen conclut « thèse cassée », si
  l'`exit_rule` écrite est touchée, ou si le drapeau fondamental tombe.
- 🟠 **ambre** → **plafond d'ENTRÉE à 5 % du NAV** : on n'ouvre ni ne renforce au-delà. Une
  position déjà constituée **n'est pas retaillée** parce que le gate est passé ambre.
- 🟢 **vert** → **sizing normal** selon la formule ci-dessous.
- ⚪ **indéterminé** (couverture insuffisante / data_gaps) → **traité comme 🟠**.

**Hystérésis (anti-ping-pong) — non négociable.** Un changement de gate n'est actionnable que
s'il est **confirmé sur 2 relevés hebdomadaires consécutifs** ET que l'écart de taille dépasse
**2 points de NAV**. Après tout trade de dimensionnement sur un ticker, ce ticker est **gelé
8 semaines** pour tout nouveau trade de dimensionnement — seuls l'`exit_rule`, la thèse cassée
et le drapeau fondamental peuvent encore le faire bouger. Motif : entre le 26/06 et le 29/08,
SAF.PA a fait 5 allers-retours de taille et AMZN 4, sans qu'aucune thèse ne change.

**Budgets de rotation (par poche).**
- **Cœur** : 4 trades de **dimensionnement** par mois (trim/renfort d'une ligne détenue, thèse
  inchangée). Les entrées neuves, sorties sur thèse cassée, `exit_rule` et drapeau fondamental
  ne comptent pas.
- **Tactique** : 6 entrées neuves par mois maximum.
- **Crypto** : 2 rééquilibrages par mois maximum, hors paliers de construction (§M).
- Les achats/ventes de **socle** qui financent ou absorbent un mouvement ne comptent jamais.

**Sizing — conviction × calibration × desk × volatilité, sous les plafonds.**
1. **Taille de conviction** (cœur) : **Haute ≈ 9 %**, **Moyenne ≈ 6 %**, **Basse ≈ 3 %** du NAV.
   Tactique : 2-4 % par coup. Crypto : §M.
2. **× calibration** (`calibration.json`) : un bucket dont le hit_rate réel est nettement sous
   ce que la confiance prétend voit sa taille réduite — seulement à **n ≥ 8** (§I).
3. **× multiplicateur du desk** (`attribution.json` → `desk_multipliers`, 0,6 à 1,25) : neutre
   tant que le desk n'a pas 4 décisions clôturées ; ensuite il **mérite** sa voix (§L).
4. **× volatilité** : `taille × clamp(30 % / vol_1an, 0,5 ; 1,25)` (vol dans `allocation.json`
   ou `history.json`, helper `volAdjust`). Une ligne deux fois plus volatile qu'une action de
   qualité typique prend moitié de la taille : c'est ce qui équilibre le risque entre lignes.
5. **Plafonnement** par le gate (🟠/⚪ ⇒ ≤ 5 % ; 🔴 ⇒ 0) puis par les plafonds ci-dessous.
Le `rationale` du trade écrit la chaîne : `Moyenne 6 % × calib 1 × desk 1 × vol 0,8 = 4,8 %`.

**Plafonds (non négociables).**
- Ligne cœur : **10 % à l'entrée** ; elle peut monter par appréciation jusqu'à **18 %**, puis
  retour à 15 %. **On laisse courir les gagnants** : alléger un gagnant cœur sous 18 % exige un
  fait nouveau sur la thèse (jamais « le cours a monté », jamais un RSI).
- ETF du socle : 20 % par ligne. Coup tactique : 4 %. Crypto : BTC/ETH 6 % chacun, alt 1,5 %.
- Secteur : **30 %** du NAV. Thème (ex. « infra data centers US ») : **35 %**. Plusieurs lignes
  qui dépendent du même moteur comptent comme un seul thème.

**Budget de risque** (`allocation.json → risk`, calculé sur 1 an à poids constants).
- Volatilité du book **sous 13 %** = le book n'utilise pas son budget de risque : il est
  sous-investi ou trop défensif → déploie le cash, déplace du socle vers le cœur et la crypto.
- **Au-dessus de 20 %** → réduis d'abord les plus gros **contributeurs au risque**.
- Une ligne dont la **contribution au risque dépasse 2,5× son poids** (et 8 % du risque) se
  justifie par écrit au vendredi ou se réduit au prochain réexamen.

**Cadence de déploiement — on comble un écart, on ne saute pas dedans.** Le retour dans la
bande de cash se fait par paliers de **10 points de NAV par semaine maximum**, dans cet ordre :
(1) les convictions `Acheter` validées du mercredi ; (2) les coups tactiques validés ; (3) la
construction de la poche crypto (§M, 3 points/semaine max) ; (4) **le solde au socle**
(IWDA.AS par défaut, ou l'ETF proposé par le desk-macro). Chaque palier est daté dans le brief.
Motif : concentrer un quart du NAV sur une seule date de marché remplace un risque (être
sous-investi) par un autre (tout acheter au même cours).

**Sorties & stop (systématiques, écrits à l'entrée).**
- Toute entrée fixe sa **règle de sortie** (`exit_rule`) et son **hypothèse pivot** AVANT l'achat.
  Pas de règle de sortie = pas de position.
- **Cœur : AUCUN stop de prix.** On vend quand la **thèse casse** (pivot faux), point. Seuil de
  **RÉEXAMEN** à **−25 % vs prix d'entrée** : le mercredi suivant produit un débat §D complet
  et **tranche par écrit** (renforcer / garder / sortir). Renforcer une thèse **intacte** après
  ce réexamen est permis — c'est acheter moins cher ce qu'on a déjà validé.
- **Tactique** : stop serré sur invalidation du catalyseur OU −15 à −20 % vs entrée, et la
  date d'horizon est un déclencheur de sortie. **Crypto** : §M.
- Tout stop se lit **dans la devise de cotation** (playbook P-001) et se vérifie en double
  source (P-002).
- **On ne moyenne JAMAIS à la baisse une thèse cassée.**

**Prix d'entrée ≠ coût hérité (verrou de comptabilité).** Le book porte deux prix par position
et ils ne servent PAS à la même chose :
- `entry_price` — **le prix payé par l'IA, en €** (cours du clone au 2026-06-08 pour les lignes
  héritées, cours d'achat pour les autres). **C'est la seule référence** du P&L de l'IA (§I),
  des seuils de réexamen et des stops tactiques. Une ligne US garde aussi `entry_price_usd`.
- `avg_cost` — le coût de revient historique **du groupe** sur les lignes héritées.
Les confondre a produit un P&L logué de −24,5 % pour un réel de −2,9 % sur les sorties de juin.
`attribution.js` signale tout `entry_price` à plus de 15 % de `avg_cost` sur une ligne non
héritée (devise mélangée probable) : corrige-le avant tout scoring.

**Champs obligatoires de chaque position et de chaque trade** : `sleeve` (coeur | socle |
tactique | crypto), `desk` (l'agent qui a porté l'idée, §L), `sector`, `theme` (si thème
concentré), en plus de `confidence, horizon, thesis_id, entry_date, entry_price, exit_rule`.
Sans `desk`, l'attribution ne peut pas apprendre qui a raison.

**Fenêtres de décision (quatre par semaine, chacune son rôle).** Sortir vite est urgent ;
entrer vite ne l'est presque jamais — sauf sur ce qui a une date. D'où :

| Jour | Fenêtre | Ce qui s'exécute | Interdit |
|------|---------|------------------|----------|
| **Mercredi** | Tactique | entrées **tactiques** validées le soir même (desk-tactique → risk-manager FEU VERT), ≤ 4 % chacune | tout achat cœur, socle, crypto |
| **Jeudi** | Défense | ventes défensives (`exit_rule`, thèse cassée, drapeau 🔴, stops tactiques/alts, verdict SORTIR) + **suivi des résultats** publiés dans la semaine | tout achat |
| **Vendredi** | Principale | sorties restantes, entrées cœur dans leur **zone d'achat** (§N), rééquilibrage des poches et du cash | — |
| **Dimanche** | Crypto | paliers de construction §M, achats contrariens, stops des alts (la crypto cote 7 j/7 et ses gros mouvements tombent souvent le week-end) | toute action ou ETF |

Motif du mercredi : un catalyseur daté validé mercredi peut être passé vendredi ; la poche
tactique vit de son timing. Motif du dimanche : attendre le vendredi pour un actif qui a bougé
de 15 % le samedi revient à décider sur un cours périmé. Le cœur, lui, reste au vendredi :
une conviction de 3-5 ans ne perd rien à attendre deux jours l'instruction complète.

**Frais de friction (réalisme du paper trading).** Chaque trade coûte **0,30 % du montant**
(actions, ETF) et **0,50 %** (crypto : spread plus large), débité du cash et loggé (`fee`).
Tout P&L réalisé (§I) est **net de frais**. Sur-trader coûte, la patience est gratuite.

**Garde-fou de drawdown.** `risk.js` suit le NAV (`nav_history`). Si le drawdown du book vs son
plus haut atteint **−20 %**, la passe suivante **réduit le risque avant toute nouvelle prise de
risque** : coupe d'abord les tactiques et les alts, ramène la crypto à 3 %, laisse le cash
monter jusqu'au plafond de 15 % — et pas au-delà : on ne liquide pas un cœur sain sur un
drawdown de marché. Levée quand le drawdown revient au-dessus de −15 %.

---

## I. Calibration & apprentissage (la boucle qui rend l'IA meilleure)

L'avantage de l'IA n'est pas de « deviner » : c'est de **tenir un registre honnête** et de
**corriger** plus vite qu'un humain. Mécanique :

**Scorer une décision clôturée.** Quand une position est fermée, écris une entrée dans
`memory/fund/decisions.json` : `confidence` annoncée à l'entrée, `opened`, **`closed`
(obligatoires — sans les deux dates, `bench.js` ne peut pas calculer la fenêtre du benchmark et
l'alpha est faux)**, `entry` (= `entry_price`, le prix payé par l'IA), `exit`,
`origin` (`hérité` | `conviction`), `realized_pnl_pct` (net de frais §H),
`benchmark_return_pct`, `alpha_pct`, `outcome` (« thèse confirmée / cassée / neutre ») et `hit`
(la confiance était-elle méritée ?).

> **Verrou de référence.** `realized_pnl_pct = exit_net / entry − 1`, où `entry` est le prix payé
> **par l'IA** (`entry_price` de la position, §H « Prix d'entrée ≠ coût hérité »). Jamais
> `avg_cost` sur une ligne héritée : charger l'IA d'une moins-value que le groupe portait
> depuis des années fabrique un hit_rate de 0 % qui n'apprend rien et qui, par le mécanisme
> ci-dessous, rétrograde le sizing d'un moteur qui n'a pas démérité. **Un chiffre de
> calibration faux est pire qu'une absence de calibration** : il se transforme en règle.
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

**Décisions héritées vs décisions propres — deux registres.** Une sortie de ligne **héritée du
clone**, déclenchée par une mécanique (gate, stop) et non par un débat §D de l'IA, ne mesure pas
le jugement de l'IA : elle mesure la mécanique. Elle est scorée avec `origin: "hérité"` et
**exclue des buckets de confiance** ; elle alimente un bloc séparé `mechanics` (les verrous
tiennent-ils ?). Seules les décisions `origin: "conviction"` — nées d'un débat §D, dimensionnées
par §H — jugent le jugement. Sinon le premier trimestre du book restera un procès en calibration
fait à des positions que l'IA n'a jamais choisies.

**Ce qu'on mesure vraiment, chaque vendredi (dans le brief).**
1. **NAV IA vs NAV groupe** — la course annoncée.
2. **NAV IA vs IWDA.AS** — le bêta : si le book perd contre l'indice tout en détenant du cash,
   le problème est l'**exposition**, pas la sélection.
3. **Attribution des ventes** : pour chaque vente des 12 dernières semaines, `cours d'aujourd'hui
   vs prix de vente`. Si la majorité des ventes est en dessous du cours actuel, le moteur vend
   bas — c'est un défaut de **règle**, pas de malchance, et il se corrige dans §H, pas dans
   le choix des titres. Calculé par `node engine/attribution.js` (`sells`), jamais à la main.
4. **Attribution par desk, par poche, par confiance** (`attribution.json`) : quel desk a un
   edge prouvé, quelle poche crée ou détruit de la valeur, et le **multiplicateur de sizing**
   que chaque desk a mérité (§L). L'apprentissage porte sur QUI se trompe, pas seulement QUOI.
5. **Opportunités manquées** (`attribution.json → missed`) : les verdicts Surveiller/Éviter
   qui ont ensuite battu l'indice de plus de 5 points. Refuser un gagnant est une erreur aussi
   réelle qu'acheter un perdant ; si la majorité des refus gagne, le filtre est trop sévère
   (c'est le falsificateur de P-003).
6. **Exposition et risque** (`allocation.json`) : poches vs cibles, cash vs bande 5-15 %,
   volatilité du book vs 13-20 %, top contributeurs au risque, drawdown vs garde-fou.

**Apprendre du passé des COURS, pas seulement de ses propres trades.** Le registre des
décisions grandit lentement (quelques clôtures par mois) ; l'historique des marchés, lui, est
immense. `node engine/history.js {tickers}` donne pour chaque titre ses **taux de base** sur
10 ans : CAGR, volatilité, pire drawdown, % de fenêtres 12 mois positives, et les **analogues**
(rendements à 12 mois observés quand le titre était déjà aussi loin de son plus haut
qu'aujourd'hui). Usages obligatoires :
- tout pitch de desk et tout débat §D citent le taux de base (un baissier qui sait que le titre
  a déjà fait −65 % deux fois en 10 ans n'argumente pas dans le vide) ;
- la volatilité historique entre dans le sizing (§H, × volatilité) ;
- à chaque clôture, la leçon compare le résultat au taux de base : un perdant dans la fourchette
  p25-p75 des analogues est de la **variance** (ne change pas la règle) ; un perdant sous le p25
  ou un gagnant au-delà du p75 sur une thèse cassée est un **signal** (la thèse ou la règle
  avait un défaut — c'est celui-là qui mérite une leçon et, à 3 cas, un amendement).
Un taux de base n'est jamais une prédiction de cours : c'est la mesure de ce qui est normal,
pour ne pas confondre la malchance avec une erreur, ni la chance avec du talent.

**Boucle de feedback (concrète).**
1. Vendredi : score les fermetures (avec leur `desk` et leur `sleeve`) → leçons datées dans
   `lessons.md` → maj de `decisions.json` + `calibration.json` → `node engine/attribution.js`.
2. Mensuel : lis la calibration ET l'attribution → ajuste les **tailles cibles §H**, le **ton
   des conseils** (une « Haute » mal calibrée vaut une « Moyenne » dans le brief), le **quota
   d'idées des desks** (§L) et les **cibles de poches** si une poche détruit de la valeur sur
   ≥ 8 décisions (jamais le cash cible de 10 %, fixé par le mandat).
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

**La poche (plafonds stricts).** Total scénarios ≤ `stats.pocket_cap` du NAV (départ 10 %), et
**toujours à l'intérieur de la poche tactique §H** (≤ 15 % du NAV avec les catalyseurs et Grok).
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

---

## L. Organisation multi-desk — une société de gestion, pas un analyste seul

Un seul analyste qui couvre tout finit généraliste : il connaît mal la santé, juge une banque
avec des outils d'industriel et ne voit pas ses angles morts. Le book s'organise donc comme une
société de gestion : un **CIO** et des **desks spécialisés**, définis comme sous-agents dans
`.claude/agents/` et liés par le contrat `skills/desks.md`.

- **Le CIO** = la routine du soir (l'agent principal). Il lit l'état, **convoque** les desks
  (outil Agent, plusieurs en parallèle dans le même message), arbitre, dimensionne (§H) et
  **seul il écrit** `memory/`.
- **Desks sectoriels** : `desk-tech`, `desk-sante`, `desk-industrie-energie`, `desk-finance`,
  `desk-conso` — sourcing et défense des convictions cœur de leur univers, au plus 2 idées par
  passage, avec taux de base et gate en mode `--dry`.
- **Desks transverses** : `desk-macro` (régime, poches, socle ETF), `desk-crypto` (poche §M),
  `desk-tactique` (coups datés §J/§K/§F).
- **`risk-manager`** : le baissier permanent du débat §D et l'auditeur du risque du book. Il
  ne pitche rien ; il rend FEU VERT / FEU VERT RÉDUIT / REFUS.

**Cycle hebdomadaire.** Lundi : `desk-macro` + `desk-crypto` (posture, poches). Mardi : les 5
desks sectoriels en parallèle (sourcing). Mercredi : deep-dive — pour chaque ★, le desk
d'origine plaide, le `risk-manager` attaque, le CIO tranche ; le `risk-manager` audite le book ;
puis **fenêtre tactique** (`desk-tactique` → `risk-manager` → exécution). Jeudi : le CIO seul
(ventes défensives, suivi des résultats). Vendredi : `desk-tactique` + `desk-macro` +
`desk-crypto`, puis le CIO exécute l'allocation. Dimanche : `desk-crypto` (fenêtre crypto).

**La voix d'un desk se MÉRITE** (miroir de la calibration §I et du budget Grok §F). Chaque
position, trade et décision porte son `desk`. `node engine/attribution.js` calcule l'alpha
réalisé et le latent par desk, et le **multiplicateur de sizing** appliqué à ses nouvelles
idées : 1 tant que < 4 décisions clôturées ; puis ×1,25 (alpha moyen ≥ +5 %), ×1 (≥ 0),
×0,85 (≥ −5 %), ×0,6 (en dessous). La revue mensuelle peut aussi porter le quota d'un desk à
3 idées (alpha prouvé, n ≥ 8) ou le réduire à 1 (alpha négatif, n ≥ 8).

**Discipline de coût.** Un desk qui n'a rien à dire répond en trois lignes. Le CIO ne convoque
que les desks utiles ce soir-là (les plafonds de chaque routine priment) et ne leur transmet
que les fichiers nécessaires.

---

## M. Poche crypto — exposée, mais dimensionnée comme ce qu'elle est

La crypto est l'actif le plus volatil du book (BTC ≈ 65 %/an de volatilité et −83 % de pire
drawdown sur 10 ans, d'après `history.js`). Elle mérite une place — son rendement de long terme
a été exceptionnel — mais une place **dimensionnée par son risque**, pas par son récit.

- **Cible** : 8 % du NAV en RISK-ON SAIN (bande 0-10 %), infléchie par le régime (§H). À cette
  taille, un nouveau −80 % coûte ~6 points de NAV : douloureux, pas mortel.
- **Composition** : BTC + ETH ≥ **70 %** de la poche (BTC ≥ 40 %). Les alts ≤ 30 % de la poche,
  **≤ 1,5 % du NAV chacune**, uniquement dans le top 20 en capitalisation, ≥ 2 ans d'historique,
  avec un usage mesurable (frais ou revenus de protocole, activité on-chain). Jamais de
  memecoins, de levier, de produits dérivés, ni de staking risqué.
- **Construction** : par paliers de **3 points de NAV par semaine maximum** (moyenne d'entrée).
- **Contrarien, mesuré** (`memory/fund/crypto.json`, Fear & Greed) : sous 20 (peur extrême) le
  palier peut doubler ; au-dessus de 80 (avidité extrême) **aucun achat neuf**, et si la poche
  dépasse 10 % on la ramène à 8 %. Le sentiment social ne déclenche jamais seul un achat (§F).
- **Sorties** : BTC/ETH n'ont **pas de stop de prix** (horizon long) ; on sort sur thèse —
  interdiction réglementaire de la détention/des ETP dans l'UE, faille protocolaire majeure,
  ou garde-fou de drawdown du book (ramène la poche à 3 %). Les **alts** ont un stop à **−30 %**
  vs entrée, un horizon de 6-12 mois, et sortent si leur métrique d'usage se dégrade.
- **Instruments** : cotations Yahoo en euros (`BTC-EUR`, `ETH-EUR`, `SOL-EUR`…), frais 0,50 %.
- **Scoring** : alpha vs IWDA comme le reste du book (la poche doit battre l'indice pour valoir
  son risque) ; une alt est aussi jugée vs BTC sur la même période (`node engine/bench.js
  {opened} {closed} BTC-EUR`) — battre l'indice en sous-performant BTC n'est pas un edge.

---

## N. Zones d'achat — décider du PRIX avant de décider d'acheter

Une bonne entreprise achetée trop cher est un mauvais investissement. Le book a mesuré l'erreur
inverse de la vente trop précoce : acheter après la hausse (« les 5 convictions propres sont
toutes négatives », 2026-08-30). La zone d'achat la corrige en écrivant le prix d'entrée
acceptable AVANT de regarder si on a envie d'acheter.

- **Chaque verdict `Acheter`** (deep-dive du mercredi) porte une `buy_zone` dans
  `convictions.json` : `{ low, high, currency, basis }`.
  - `high` = le prix au-delà duquel le rendement attendu ne paie plus le risque (DCF inversé §C :
    la croissance implicite devient irréaliste, ou multiple cible × bénéfice attendu) ;
  - `low` = le prix sous lequel le marché sait probablement quelque chose : on **ré-instruit la
    thèse** (§D express) avant d'acheter, plutôt que de se réjouir du rabais ;
  - `basis` = une phrase : d'où viennent les bornes (multiple, DCF, analogues `history.js`).
- **Le vendredi exécute selon la zone** :
  - cours ≤ `high` → taille pleine (§H) ;
  - cours entre `high` et `high × 1,05` → **demi-taille**, l'autre moitié si le cours revient
    dans la zone ;
  - cours > `high × 1,05` → **pas d'achat** : la conviction reste « en attente de zone », et le
    capital prévu va au socle en attendant (jamais au cash au-delà de la réserve de 10 %) ;
  - cours < `low` → §D express ; si la thèse tient, taille pleine.
- **Une zone a 30 jours de validité** : au-delà, le mercredi la recalcule ou retire le verdict.
- La zone vaut pour les **renforcements** aussi : on ne renforce pas un gagnant au-dessus de sa
  zone recalculée, même thèse confirmée.
- Tactique : la « zone » est le niveau d'invalidation du catalyseur ; crypto : les paliers §M.

