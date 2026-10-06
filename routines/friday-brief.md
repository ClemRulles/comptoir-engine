# VENDREDI — BRIEF & REVUE HEBDO + GESTION DU BOOK IA
# Cron : 0 22 * * 5   ·   Modèle : Sonnet

**Étape 0 — garde-fou :** `node engine/guard.js` (cf. `skills/memory-guard.md`). Note le verdict :
si un fichier a été `recreated`, dis-le dans la revue hebdo (un historique a pu être reconstruit).

Lis `CLAUDE.md`, `skills/engine-method.md` (surtout §H sizing/risque, §I calibration),
`skills/trend-gate.md`, `skills/quant-signals.md`, **`memory/playbook.md` (jurisprudence — ses
amendements actifs s'appliquent à toutes tes décisions de ce soir)**, `memory/trends.md`,
`memory/convictions.md`, `memory/portfolio.md`, `memory/market-regime.md`, `memory/lessons.md`,
`memory/catalysts.md`, `memory/fund/ai-fund.json`, `memory/fund/decisions.json`,
`memory/fund/calibration.json`, `memory/fund/signals.json`, `memory/fund/forecasts.json`,
`memory/fund/grok-calls.json`, `memory/fund/allocation.json`, `memory/fund/attribution.json`,
`memory/fund/crypto.json`, `skills/desks.md`.

Tu es le **CIO** du book (method §L) : tu **apprends**, tu **convoques les desks**, tu **gères le
book** (sorties, entrées, poches, cash), puis tu **packages** la semaine. Objectif unique : la
richesse du book à 3-5 ans, nette de frais, à risque équilibré (method §H). Passes dans l'ordre.

---

## PASSE 0 — Seed du book IA (uniquement si `seeded:false`)

Si `ai-fund.json` a `seeded:false` : c'est le démarrage. Le book IA doit **cloner le groupe**.
1. Lis `memory/portfolio.md` (positions du groupe encodées par les membres).
2. Recopie chaque position dans `ai-fund.json` : mêmes `ticker` et `quantity`, `avg_cost` =
   prix d'entrée du groupe (ou cours du jour si inconnu), `entry_date` = aujourd'hui.
   Donne à chacune une `confidence`, un `horizon`, un `target` et une `exit_rule` (method §H/§D).
3. Aligne `start_capital` et `cash` sur le pot commun du groupe.
4. Passe `seeded:true`, `as_of` = aujourd'hui. Écris une leçon « départ = clone du groupe à t0 ».
5. **Ne fais aucun autre trade cette semaine** : on part à armes égales, on diverge ensuite.

Si `portfolio.md` est vide, laisse `seeded:false`, écris-le dans le brief, et continue 100 % cash.

---

## PASSE 1 — Apprentissage (scorer le passé)

Pour chaque position **fermée** depuis le dernier vendredi — **y compris les sorties exécutées
jeudi** par le Portfolio Doctor (bloc `### Sorties exécutées` de `portfolio.md` + trades `sell`
dans `ai-fund.json`) — ou règle de sortie touchée cette semaine :
1. Calcule le **P&L réalisé** (`realized_pnl_pct`), **net des frais de friction** (cf. PASSE 2),
   **contre `entry_price` — le prix payé par l'IA — jamais contre `avg_cost`** (§H/§I). Sur une
   ligne héritée du clone, `avg_cost` est le coût de revient du GROUPE : l'utiliser impute à l'IA
   une moins-value vieille de plusieurs années. Si `entry_price` manque sur la position, calcule-le
   d'abord (clone du 2026-06-08 : `valeur t0 / quantité`) et écris-le dans `ai-fund.json` ; **pas
   de prix d'entrée = pas de scoring**. Marque aussi `origin` : `"hérité"` (ligne du clone sortie
   par une mécanique) ou `"conviction"` (dossier né d'un débat §D) — seules les `conviction`
   entrent dans les buckets de confiance (§I).
2. **Mesure l'alpha** : `node engine/bench.js {opened} {closed}` → `benchmark_return_pct`
   (MSCI World EUR sur la même période) ; `alpha_pct = realized_pnl_pct − benchmark_return_pct`.
   **C'est l'alpha qui mesure le skill** : +5 % quand le marché fait +9 % n'est pas un succès,
   c'est un coût d'opportunité. Si bench.js échoue (`ok:false`), mets `null` et note le data_gap.
3. Verdict : la thèse s'est-elle **confirmée / cassée / neutre** ? L'hypothèse pivot écrite à
   l'entrée tenait-elle ? Le baissier (§D) avait-il marqué un point « oublié » ?
4. Fixe `hit` (true/false) selon §I — pour un trade **gagnant**, `hit=true` exige **alpha > 0**.
5. **Append** une entrée dans `memory/fund/decisions.json` (avec `benchmark_return_pct` + `alpha_pct`).
6. Écris une **leçon datée** dans `memory/lessons.md` (format du fichier) : cause concrète
   (catalyseur absent, valo tendue, momentum suivi trop tard, taille trop grosse…) → correction.
7. **Recompute** `memory/fund/calibration.json` (buckets par confiance + global). Mets `updated`.

8. **Compare au taux de base** (§I) : `node engine/history.js {ticker}` — le résultat est-il
   dans la fourchette p25-p75 des analogues (variance : la règle tient) ou en dehors (signal :
   la thèse ou la règle avait un défaut) ? Écris-le dans la leçon. Renseigne aussi `desk` et
   `sleeve` dans l'entrée de `decisions.json` (repris de la position).

S'il n'y a eu aucune fermeture, écris-le et ne fabrique pas de leçon.

**Attribution (qui a raison, qui se trompe).** Joue `node engine/risk.js` puis
`node engine/attribution.js`. Lis : le **regret des ventes** (12 semaines), l'**alpha par desk,
par poche, par confiance**, les **multiplicateurs de desk** (ils s'appliquent au sizing de ce
soir), et les **opportunités manquées** (refus qui ont battu l'indice de > 5 points). Une leçon
datée si un de ces chiffres change une décision future (ex. « desk-tech : 3 refus sur 4 ont
battu l'indice → le filtre valo est trop sévère sur les compounders »).

**Mise à jour du playbook (l'apprentissage qui CHANGE le comportement).** Une leçon notée dans
`lessons.md` est un souvenir ; une règle du playbook est appliquée par toutes les routines. Après
le scoring, demande-toi : **≥ 3 cas concordants** (décisions scorées et/ou leçons datées) pointent-ils
vers la même correction de comportement ?
- **Oui** → écris ou renforce **UN amendement max cette semaine** dans `memory/playbook.md`
  (format du fichier : règle impérative + preuves citées + **falsificateur obligatoire**, statut
  `à l'essai`). S'il renforce un amendement existant, ajoute le cas aux preuves plutôt que de
  créer un doublon.
- **Non** → n'écris rien. Le droit au blanc s'applique : une règle sans preuves est du bruit
  qui polluera toutes les routines suivantes.
- Rappel hiérarchie : un amendement peut durcir ou préciser, **jamais assouplir un verrou §H ni
  contredire `CLAUDE.md`**. La promotion `à l'essai` → `confirmé` (ou le retrait) appartient à la
  revue mensuelle, pas à toi.

**Calls Grok à résoudre (sentiment §F).** Joue `node engine/grok.js` : il score contre le prix
réel les calls de `grok-calls.json` dont l'horizon est passé et met à jour le budget tactique
mérité. Lis la sortie ; si des calls **joués** se sont résolus, ajoute leur `trade_alpha_pct`
(via `engine/bench.js`) et tire une **leçon datée** distinguant la PRÉDICTION (Grok a-t-il bien
senti ?) du TRADE (alpha). Le sentiment a-t-il gagné ou perdu de la voix cette semaine ?

**Scénarios à résoudre (book prédictif §K).** Pour chaque scénario de `forecasts.json` dont
l'événement ou l'horizon est passé (statuts `joué`/`validé`, + les `expiré` marqués par
forecasts.js) : juge `happened` **contre le falsificateur écrit** (pas contre ton envie d'avoir
eu raison), écris `resolution` { date, happened, brier = (probability − happened)², notes,
trade_alpha_pct si joué }, passe le statut à `"résolu"`, et tire une **leçon datée** sur la
PRÉDICTION (chaîne trop longue ? déjà pricé ? probabilité trop sûre ?) distincte de la leçon de
trade. Puis `node engine/forecasts.js` (stats + pocket_cap). Prédire juste et trader mal — ou
l'inverse — sont deux leçons différentes : ne les confonds pas.

**Si c'est le 1er vendredi du mois → fais aussi la revue de calibration PROFONDE** décrite dans
`routines/monthly-calibration.md` (recompute sur TOUT l'historique de `decisions.json`, test
d'honnêteté Brier Basse < Moyenne < Haute, patterns par type de thèse, ajustement explicite du
sizing §H si un bucket est mal calibré, bloc daté `CALIBRATION` dans `lessons.md`). Les autres
vendredis, la calibration reste hebdo (légère) : juste le recompute des buckets ci-dessus.

---

## PASSE 1bis — Normalisation du seed (une seule fois)

Le seed initial stocke chaque position héritée avec `quantity:1`, `avg_cost` = son **coût de
revient €** et `value_t0` = sa **valeur €** à t0 (faute de nombre de parts). Tant qu'une position
est dans cet état (`quantity:1` + `value_t0` présent), **convertis-la en vraies parts** dès cette
passe, pour que la valorisation live soit juste :
- `cours_live` = prix actuel par action (FMP/Finnhub/**Stooq pour l'Europe**/web) du ticker.
- nouvelle `quantity` = `value_t0 / cours_live` ; nouveau `avg_cost` = `avg_cost / quantity`
  (coût de revient **par action**, pour préserver le P&L) ; retire `value_t0`.
- L'exposition reste identique (on ne change que la représentation : 1 lot → N parts réelles).
Si le cours d'un ticker est introuvable (ETF/européen non couvert), garde la ligne telle quelle
(elle reste ancrée à `value_t0`) et note-le. Une fois converti (`quantity ≠ 1`), ne reconvertis pas.
**Marqueur explicite** : écris `"seed": false` sur chaque ligne convertie (et `"seed": true` sur
toute ligne encore en mode seed) — l'interface s'appuie sur ce flag, prioritaire sur l'heuristique
`quantity:1`, pour ne jamais reconvertir une vraie position d'exactement 1 part.

## PASSE 1ter — Étiquetage des positions (tant qu'il en manque)

`allocation.json → data_gaps` liste les lignes sans `desk`/`sector`. Pour chacune, écris dans
`ai-fund.json` : `sleeve` (coeur | socle | tactique | crypto — un ETF va au socle), `desk`
(skills/desks.md : le desk de son SECTEUR), `sector`, et `theme` si la ligne appartient à un pari
concentré (ex. « infra data centers US »). C'est de la comptabilité, pas un trade : rien ne
s'achète ni ne se vend ici. Sans ces champs, l'attribution ne sait pas qui a eu raison.

## PASSE 2 — Gestion du book IA (entrées/sorties)

**Convoque d'abord les desks du vendredi, en parallèle (un seul message, outil Agent).**
- `desk-tactique` : les coups de la semaine (catalyseurs §J qui survivent au test du vendredi,
  scénarios §K validés, calls Grok ouverts), chacun avec date, stop et taille ≤ 4 %.
- `desk-macro` : posture, **rééquilibrage poche par poche** en points de NAV, ETF du socle.
- `desk-crypto` : posture de la poche crypto (cible, répartition BTC/ETH/alts, palier de la semaine).
Transmets-leur le régime, les alertes de `allocation.json`, les multiplicateurs de
`attribution.json` et les verdicts du mercredi. Un desk qui n'a rien répond en trois lignes.
Tu arbitres : un pitch tactique ou une alt crypto passe au `risk-manager` (un appel groupé) si
sa taille dépasse 2 % du NAV.

Rafraîchis les signaux : `node engine/signals.js` (positions + convictions retenues). En appliquant
**method §H** (gate quantitatif → sizing conviction × calibration × desk × volatilité, plafonds,
poches à cibles et cash à 10 %, garde-fou drawdown) et **§M** pour la crypto **et les amendements actifs de `memory/playbook.md`** (chaque
trade dont un amendement a modifié la décision le cite dans son `rationale` : `[P-00N]`).
**Ordre des sources** :
1. **Vérifie d'abord ce que le jeudi a déjà exécuté** (bloc `### Sorties exécutées` de
   `portfolio.md` + trades `sell` d'hier dans `ai-fund.json`) : ces ventes sont FAITES — ne les
   rejoue pas, contrôle juste la cohérence (position retirée/réduite, cash crédité net de frais).
   Puis exécute ce qui **reste** : verdicts Opus du mercredi (bloc `## Revue book IA` de
   `convictions.md` : RENFORCER / GARDER / ALLÉGER / SORTIR) non traités jeudi, et alertes
   `À SURVEILLER` du jeudi qui ont mûri en sortie. Ce sont des décisions déjà instruites —
   priorité sur tout le reste.
2. **Re-valide les catalyseurs** (`memory/catalysts.md`, détectés lundi) — la boucle anticipation :
   pour chaque ligne dont la date approche (≤ ~2 semaines) et qui portait un pré-positionnement,
   demande « ça vaut toujours le coup ? » → (a) l'événement est-il toujours au calendrier (pas
   annulé/déplacé) ? (b) le marché l'a-t-il déjà pricé (le move a eu lieu) ? (c) le régime + la
   valo laissent-ils encore une marge pour le jouer ? Si **oui et crédible** → entrée tactique
   sizée §H (demi-taille, **date de l'événement = déclencheur de sortie/décision**, stop serré),
   ou geste de risque sur une position détenue (alléger/couvrir avant un risque binaire). Si
   l'événement est **PASSÉ** → score-le en PASSE 1 (l'anticipation a-t-elle aidé ? leçon datée)
   puis déplace la ligne en « Archives » de `catalysts.md`. Sinon retire-la, note pourquoi.
   **On ne parie jamais sur le contenu d'une annonce surprise** (method §J).
3. Puis traite les nouvelles `convictions.md` (candidats ★ analysés mercredi).
4. **Scénarios validés (§K)** : pour chaque `status: "validé"` de `forecasts.json` que tu décides
   de jouer — poche totale ≤ `stats.pocket_cap` du NAV, demi-taille tactique par scénario, stop
   serré, gate non-🔴 sur l'instrument, date de résolution = déclencheur de sortie — ouvre la
   position avec `thesis_id` = id du scénario et passe-le à `"joué"`. Tu peux aussi décider de ne
   PAS jouer un scénario validé (note pourquoi) : il sera quand même scoré comme prédiction à
   résolution — l'IA apprend même sans miser.
5. **Calls Grok à jouer (§F)** : tu peux ouvrir une position **tactique** depuis un call
   `status:"ouvert"` de `grok-calls.json`, dans la limite de **`stats.tactical_cap` du NAV au
   total** (= 0 tant que Grok n'a pas prouvé son hit-rate → souvent rien à jouer au début, c'est
   normal et voulu). Contraintes : demi-taille tactique, **gate non-🔴** sur le ticker, checklist
   bulle §B passée, stop serré, horizon du call = déclencheur de sortie. Passe le call à
   `status:"joué"`, `played:true`, et logge le trade (`fee`, `rationale` citant le call + son
   `tactical_cap`). Un call non joué reste scoré comme prédiction — Grok apprend même sans mise.

- **Sorties** d'abord : toute position dont la règle de sortie est touchée, la thèse cassée,
  **ou frappée d'un drapeau fondamental 🔴** (F-Score ≤3 / earnings rouges → sortie forcée §H).
  Un 🔴 de composite seul **ne se vend pas** : il gèle la ligne et saisit le mercredi (§H).
- **Entrées** ensuite : alloue le cash disponible aux meilleures convictions, **taille selon §H** :
  `conviction (H 9 % / M 6 % / B 3 %) × calibration × multiplicateur du desk × volatilité`, puis
  plafonnée par le gate (🟠/⚪ ⇒ ≤ 5 % ; drapeau fondamental 🔴 ⇒ 0) et les plafonds (10 % à
  l'entrée, secteur 30 %, thème 35 %). **Chaque trade cite son gate et sa chaîne de sizing** dans
  le `rationale`, et porte `sleeve`, `desk`, `sector`.
- **Zone d'achat (method §N)** : une conviction cœur ne s'achète que selon sa `buy_zone`
  (`convictions.json`) — cours ≤ `high` : taille pleine ; jusqu'à `high × 1,05` : demi-taille ;
  au-delà : pas d'achat, « en attente de zone », capital prévu au socle ; sous `low` : §D express
  d'abord. Le `rationale` cite le cours et la zone. Une zone de plus de 30 jours ne s'utilise pas.
- **On laisse courir les gagnants** : aucun allègement d'une ligne cœur sous 18 % du NAV sans
  fait nouveau sur la thèse. Au-delà de 18 % : retour à 15 %.
- **Crypto** (§M) : applique la posture du `desk-crypto` — palier ≤ 3 points de NAV/semaine,
  BTC+ETH ≥ 70 % de la poche, alt ≤ 1,5 % du NAV, aucun achat neuf si Fear & Greed > 80.
  Tickers `BTC-EUR`, `ETH-EUR`… ; frais 0,50 %.
- **Hystérésis et budget de rotation (§H)** : un trade de *dimensionnement* (trim ou renforcement
  d'une ligne déjà détenue, thèse inchangée) n'est autorisé que si le changement de gate est
  confirmé sur **2 relevés consécutifs**, que l'écart de taille dépasse **2 points de NAV**, que
  le ticker n'a pas bougé depuis **8 semaines**, et que le **budget de 4 trades de
  dimensionnement/mois** n'est pas épuisé. Sinon : on note l'intention dans le brief, on n'exécute
  pas. Ces 4 conditions se vérifient **avant** d'écrire le trade, et le `rationale` dit laquelle
  a été vérifiée.
- **Frais de friction (honnêteté du duel)** : le groupe paie de vrais frais et du spread —
  le book IA aussi. Chaque trade (achat ET vente) coûte **0,30 % du montant** (actions, ETF) ou
  **0,50 %** (crypto), débité du cash et loggé dans le trade (`fee`, arrondi au centime). Le P&L réalisé scoré en
  PASSE 1 est **net** de ces frais. Effet voulu : sur-trader coûte, la patience est gratuite.
- **Chaque trade est loggé** dans `ai-fund.json.trades` avec `side, ticker, quantity, price,
  fee, confidence, thesis_id, horizon, sleeve, desk, rationale`, et chaque position porte
  `entry_date, entry_price, target, exit_rule, confidence, horizon, thesis_id, sleeve, desk,
  sector`. Mets `as_of` à jour et garde `cash` cohérent.

### PASSE 2bis — Contrôle d'allocation (obligatoire, avant d'écrire le brief)

Rejoue `node engine/risk.js` **après** tes trades : c'est lui qui fait foi. Écris dans le brief,
même quand tout va bien : chaque poche vs sa cible, `cash %` vs la bande **5-15 % (cible 10 %)**,
la volatilité du book vs 13-20 %, les 3 plus gros contributeurs au risque, le drawdown.

- **Cash au-dessus de 15 %** → **déploiement obligatoire cette semaine**, par paliers de
  **10 points de NAV maximum** (§H), dans cet ordre :
  1. les convictions `Acheter` du mercredi non encore exécutées, sizées §H ;
  2. les coups tactiques validés ce soir ;
  3. la construction de la poche crypto (palier ≤ 3 points, §M) ;
  4. **le solde au socle** (IWDA.AS par défaut, ou l'ETF du `desk-macro`), `sleeve: "socle"`,
     `thesis_id: "socle-indiciel"`, `rationale: "déploiement §H — cash {x} % > 15 %, palier {n}/{N}"`.
  Si l'écart dépasse 10 points, déploie 10 points et écris le palier suivant avec sa date.
- **Cash sous 5 %** → finance les prochaines entrées par la vente de socle d'abord.
- **Une poche hors bande** (`allocation.json → alerts`) → rééquilibre vers la cible, par le
  socle d'abord (il absorbe et finance sans consommer de budget de rotation).
- **Volatilité sous 13 %** → le book n'utilise pas son budget de risque : déplace du socle vers
  le cœur et la crypto au prochain palier. **Au-dessus de 20 %** → réduis d'abord les plus gros
  contributeurs au risque.
- **Garde-fou drawdown déclenché** (`drawdown.guard_triggered`) → §H : tactique et alts d'abord,
  crypto à 3 %, cash jusqu'à 15 % maximum, aucune nouvelle prise de risque.

**Ce que ce contrôle interdit explicitement :** terminer un vendredi avec plus de 15 % de cash
sans palier de déploiement daté. Le cash au-delà de la réserve de tir est une position vendeuse
que personne n'a décidée (état constaté le 2026-08-29 et toujours le 2026-10-03 : 35-42 % de
cash, 6 points de retard sur l'indice).

Discipline : mieux vaut le socle qu'un **single-stock** sans marge de sécurité — le droit au
blanc porte sur la **sélection**, jamais sur l'**exposition**. La surchauffe n'est jamais un
feu vert. On ne moyenne pas à la baisse une thèse cassée.

**Apports membres (convention) :** le `cash` de `ai-fund.json` ne représente QUE le cash de
trading du book (issu des ventes/achats). Les apports des membres (25 €/mois/personne) sont gérés
par l'interface et ajoutés automatiquement au book IA pour rester à armes égales avec le groupe —
**ne les ré-additionne pas** dans `ai-fund.json.cash`. Tu peux investir ce cash d'apport, mais
comptablement il vit côté interface (table `contributions`).

---

## PASSE 3 — Brief de la semaine

Écris `memory/morning-brief.md` (écrase la veille, archive l'ancienne en bas) :
```
# Brief de la semaine — {date}

## Cadran de régime
{cadran} — {consigne en une ligne}

## 🎯 LA tendance de la semaine
Reprends memory/trends.md. Si VALIDÉE : tendance, pourquoi maintenant, 2 manières de la
jouer (direct + pioches/pelles), drapeau bulle, ce qui tuerait la thèse, effet de second ordre.
Si AVERTISSEMENT : présente-la comme un risque/bulle à éviter. Si AUCUNE : dis-le, sans meubler.

## Longs haute conviction (cœur)
Max 3, triés par confiance puis score (depuis convictions.md). Pour chacun : thèse 1 ligne,
3 arguments, ⚠ risque qui invalide (hypothèse pivot), règle de sortie suggérée.

## Idées tactiques (court terme)
Max 3 (depuis le desk-tactique), catalyseur daté + stop serré. Taille ≤ 4 %. Surchauffe = risque, pas feu vert.

## Crypto
Posture de la poche (cible, répartition, palier de la semaine) et climat (Fear & Greed,
dominance) en 3 lignes, depuis le desk-crypto. Si rien ne bouge, une ligne.

## 📅 Catalyseurs à l'horizon
Reprends de `memory/catalysts.md` les 2-4 événements datés les plus importants des prochaines
semaines (FOMC, résultats d'une de nos positions, échéance tarifaire…), avec en une ligne :
ce qui est en jeu et notre posture (anticipé / risque à surveiller / rien à faire). On prévient,
on ne réagit pas dans la panique.

## Vos positions — ce qui a changé
Reprends de portfolio.md tout statut À SURVEILLER / SORTIE avec la raison. Si tout INTACT, une ligne.

## Le book IA cette semaine
Ce que l'IA a acheté/vendu et pourquoi (depuis la passe 2), avec le desk qui portait l'idée.
Puis **les chiffres, toujours** (§I) :
- **NAV IA vs NAV groupe** — la course.
- **NAV IA vs IWDA.AS** depuis le t0 — le bêta. Perdre contre l'indice en portant du cash est un
  problème d'**exposition**, pas de sélection : dis lequel des deux tu constates.
- **Allocation** (PASSE 2bis) : poches vs cibles, `cash %` vs 10 %, volatilité du book, drawdown.
- **Desks** : une ligne par desk ayant un track record (alpha clos, latent, multiplicateur).

Et une ligne d'**attribution des ventes** (`attribution.json → sells`) : sur les ventes des 12
dernières semaines, combien se traitent aujourd'hui **au-dessus** de leur prix de vente ? Si
c'est la majorité, le moteur vend bas — c'est un défaut de règle (§H), pas de malchance, et il
se dit franchement. Plus une ligne **opportunités manquées** (`missed`) : refus qui ont battu
l'indice de plus de 5 points.

## 🎓 Leçon de la semaine
La leçon la plus actionnable tirée de la passe 1 (ou « rien clôturé cette semaine »).

## 🔧 Ce que je corrige
Ce que la calibration m'a fait changer (sizing d'un bucket, ton d'une confiance, critère durci),
et tout mouvement du playbook cette semaine : amendement né (`P-00N à l'essai` + sa règle en une
ligne), renforcé, ou appliqué à un trade. Si rien à corriger cette semaine, dis-le franchement.

## À éviter / drapeaux de bulle
Noms populaires jugés surévalués, avec la raison (DCF inversé).

## En une phrase
La chose la plus importante pour le groupe cette semaine.

---
## Revue hebdo
- Ce qui a marché / pas marché (depuis lessons.md et les changements de statut).
- Calibration en bref : hit-rate par confiance (depuis calibration.json) — l'IA est-elle honnête ?
- Hygiène : thèses périmées, concentration, positions sans règle de sortie.
- 3 actions concrètes pour la semaine prochaine.
- Auto-évaluation : où le moteur s'est-il trompé ? quoi corriger dans la méthode ?
```

Mets aussi à jour `memory/watchlist.md` : recopie les meilleures idées au format prêt à
importer dans Comptoir.

**Réécris `memory/fund/digest.json` — la semaine EN CLAIR** (schéma dans son `_doc`). C'est ce
que lisent les membres sur l'accueil de l'app : ils n'ont lu ni la méthode ni le playbook.
`posture` (2-4 mots + une phrase), `headline`, **3 points maximum**, chaque **décision** de la
semaine (mercredi tactique + vendredi + dimanche crypto) avec son *pourquoi* en ≤ 25 mots et
*ce qui ferait changer d'avis* en ≤ 20 mots, les **4 prochains rendez-vous**, et la phrase de
la semaine. **Interdit : §, P-00N, gate, saisine, hystérésis, cov, F7/9** — traduis
(« les fondamentaux sont solides », « on attend un meilleur prix », « la règle de sortie est
touchée »). Si une décision n'a pas d'explication simple, c'est qu'elle n'est pas claire :
retravaille-la.

**Carré « investir » de l'accueil (`memory/fund/spotlight.json → invest`, schéma dans son
`_doc`).** Réécris-le après la décision principale : `value` = le nom court de ce que l'IA achète
ou achèterait cette semaine (le meilleur achat validé, dans sa zone d'achat) — ou exactement
`RIEN` si rien n'est assez solide, avec la raison dans `line` (≤ 90 caractères, en clair). C'est
la première chose que les membres voient : une seule idée, la plus forte, jamais une liste.

**Quiz du jour (OBLIGATOIRE, 2 minutes — `skills/quiz.md`).** Vérifie que `memory/fund/quiz.json`
a une question pour les **2 prochains jours** (date de Paris) et écris celles qui manquent (thème du
jour, une seule bonne réponse, fait sourcé). Ne touche jamais à une date déjà publiée.

Commit : `brief+book: {date} — {n} trades IA, {k} leçons`.

**Persistance (OBLIGATOIRE — le sandbox ne peut pas `git push`, 403).** Après le commit local,
lance `node engine/push-memory.js "{le message de commit ci-dessus}"` : l'endpoint Vercel
(`/api/memory/push`) commite tes fichiers `memory/` sur `claude/memory` — c'est ce qui fait monter
ton travail (et les nouveaux trades du book IA) sur la plateforme. Vérifie la sortie : `✅` =
persisté, sinon signale-le.

Règle d'or : mieux vaut 1 idée solide que 5 tièdes. S'il n'y a rien de convaincant, dis-le.
