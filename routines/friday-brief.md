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
`memory/fund/grok-calls.json`.

C'est la routine la plus chargée : elle **apprend**, **gère le book IA**, puis **packagé** la semaine.
Fais les trois passes dans l'ordre.

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

S'il n'y a eu aucune fermeture, écris-le et ne fabrique pas de leçon.

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

## PASSE 2 — Gestion du book IA (entrées/sorties)

Rafraîchis les signaux : `node engine/signals.js` (positions + convictions retenues). En appliquant
**method §H** (gate quantitatif → sizing pondéré conviction × calibration, plafonds, couloir de cash (plancher ET plafond)
selon le régime, garde-fou drawdown) **et les amendements actifs de `memory/playbook.md`** (chaque
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
- **Entrées** ensuite : alloue le cash disponible aux meilleures convictions, **taille selon §H**
  (un gate 🟠/⚪ plafonne l'entrée à 5 % ; un drapeau fondamental 🔴 l'interdit). **Chaque trade
  cite son gate** (verdict + composite) dans le `rationale`.
- **Hystérésis et budget de rotation (§H)** : un trade de *dimensionnement* (trim ou renforcement
  d'une ligne déjà détenue, thèse inchangée) n'est autorisé que si le changement de gate est
  confirmé sur **2 relevés consécutifs**, que l'écart de taille dépasse **2 points de NAV**, que
  le ticker n'a pas bougé depuis **8 semaines**, et que le **budget de 4 trades de
  dimensionnement/mois** n'est pas épuisé. Sinon : on note l'intention dans le brief, on n'exécute
  pas. Ces 4 conditions se vérifient **avant** d'écrire le trade, et le `rationale` dit laquelle
  a été vérifiée.
- **Frais de friction (honnêteté du duel)** : le groupe paie de vrais frais et du spread —
  le book IA aussi. Chaque trade (achat ET vente) coûte **0,30 % du montant**, débité du cash
  et loggé dans le trade (`fee: montant × 0.003`, arrondi au centime). Le P&L réalisé scoré en
  PASSE 1 est **net** de ces frais. Effet voulu : sur-trader coûte, la patience est gratuite.
- **Chaque trade est loggé** dans `ai-fund.json.trades` avec `side, ticker, quantity, price,
  fee, confidence, thesis_id, horizon, rationale`, et chaque position porte `entry_date, target,
  exit_rule, confidence, horizon, thesis_id`. Mets `as_of` à jour et garde `cash` cohérent.

### PASSE 2bis — Contrôle d'exposition (obligatoire, avant d'écrire le brief)

Calcule `cash_pct = cash / NAV` et compare-le au **couloir de cash du régime** (§H). Écris les
deux bornes et le résultat, même quand tout va bien.

- `cash_pct` **sous le plancher** → réduis le risque (§H, garde-fou).
- `cash_pct` **dans le couloir** → rien à faire, dis-le en une ligne.
- `cash_pct` **au-dessus du plafond** → **déploiement obligatoire cette semaine**, dans cet ordre :
  1. les convictions `Acheter` de `convictions.md` non encore exécutées, sizées §H ;
  2. les renforcements éligibles (hystérésis + budget de rotation respectés) ;
  3. **le solde va sur le résidu indiciel `IWDA.AS`** (§H) jusqu'à revenir sous le plafond.
     Un achat de résidu indiciel **ne consomme pas** le budget de rotation, n'a ni gate ni stop,
     et se logue avec `thesis_id: "residu-indiciel"`, `horizon: "coeur"`,
     `rationale: "déploiement §H — cash {x} % > plafond {y} % du régime {régime}, palier {n}/{N}"`.

  **Cadence : 10 points de NAV par semaine maximum** (§H). Si l'écart au plafond dépasse 10
  points, tu déploies 10 points cette semaine et tu écris dans le brief le palier suivant avec
  sa date. On comble un écart en plusieurs fois ; on ne met pas un quart du NAV au marché sur
  une seule date de cotation.

Le résidu indiciel est **financé en priorité** quand une vraie conviction apparaît : on vend
l'IWDA nécessaire avant de toucher au cash de plancher.

**Ce que ce contrôle interdit explicitement :** terminer un vendredi en RISK-ON SAIN avec 40 %
de cash et zéro ligne dans le brief pour l'expliquer. Rester liquide est une **décision**, elle
s'argumente comme une position ; sinon c'est une position vendeuse par défaut, et le book perd
la moitié du bêta du marché sans que personne l'ait voulu (état constaté le 2026-08-29 : 42 % de
cash, régime RISK-ON SAIN, benchmark +4 %).

Discipline : mieux vaut rester en cash qu'entrer **dans un single-stock** sans marge de sécurité
— mais le défaut du book n'est pas le cash, c'est l'indice (§H). Le droit au blanc porte sur la
**sélection**, jamais sur l'**exposition**. La surchauffe n'est jamais un feu vert. On ne moyenne
pas à la baisse une thèse cassée.

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
Max 2, catalyseur daté + stop serré. Taille plus petite. Surchauffe = risque, pas feu vert.

## 📅 Catalyseurs à l'horizon
Reprends de `memory/catalysts.md` les 2-4 événements datés les plus importants des prochaines
semaines (FOMC, résultats d'une de nos positions, échéance tarifaire…), avec en une ligne :
ce qui est en jeu et notre posture (anticipé / risque à surveiller / rien à faire). On prévient,
on ne réagit pas dans la panique.

## Vos positions — ce qui a changé
Reprends de portfolio.md tout statut À SURVEILLER / SORTIE avec la raison. Si tout INTACT, une ligne.

## Le book IA cette semaine
Ce que l'IA a acheté/vendu et pourquoi (depuis la passe 2). Puis **les 3 chiffres, toujours** (§I) :
- **NAV IA vs NAV groupe** — la course.
- **NAV IA vs IWDA.AS** depuis le t0 — le bêta. Perdre contre l'indice en portant du cash est un
  problème d'**exposition**, pas de sélection : dis lequel des deux tu constates.
- **Exposition** : `cash %` et le couloir du régime (PASSE 2bis). Si le cash est hors couloir,
  dis ce que tu as déployé — ou pourquoi tu ne l'as pas fait.

Et une ligne d'**attribution des ventes** : sur les ventes des 12 dernières semaines, combien se
traitent aujourd'hui **au-dessus** de leur prix de vente ? Si c'est la majorité, le moteur vend
bas — c'est un défaut de règle (§H), pas de malchance, et il se dit franchement.

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

Commit : `brief+book: {date} — {n} trades IA, {k} leçons`.

**Persistance (OBLIGATOIRE — le sandbox ne peut pas `git push`, 403).** Après le commit local,
lance `node engine/push-memory.js "{le message de commit ci-dessus}"` : l'endpoint Vercel
(`/api/memory/push`) commite tes fichiers `memory/` sur `claude/memory` — c'est ce qui fait monter
ton travail (et les nouveaux trades du book IA) sur la plateforme. Vérifie la sortie : `✅` =
persisté, sinon signale-le.

Règle d'or : mieux vaut 1 idée solide que 5 tièdes. S'il n'y a rien de convaincant, dis-le.
