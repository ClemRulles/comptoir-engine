# VENDREDI — BRIEF & REVUE HEBDO + GESTION DU BOOK IA
# Cron : 0 22 * * 5   ·   Modèle : Sonnet

**Étape 0 — garde-fou :** `node engine/guard.js` (cf. `skills/memory-guard.md`). Note le verdict :
si un fichier a été `recreated`, dis-le dans la revue hebdo (un historique a pu être reconstruit).

Lis `CLAUDE.md`, `skills/engine-method.md` (surtout §H sizing/risque, §I calibration),
`skills/trend-gate.md`, `skills/quant-signals.md`, `memory/trends.md`, `memory/convictions.md`,
`memory/portfolio.md`, `memory/market-regime.md`, `memory/lessons.md`, `memory/catalysts.md`,
`memory/fund/ai-fund.json`, `memory/fund/decisions.json`, `memory/fund/calibration.json`,
`memory/fund/signals.json`.

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

Pour chaque position **fermée** depuis le dernier vendredi (ou règle de sortie touchée cette
semaine d'après le Portfolio Doctor) :
1. Calcule le **P&L réalisé** (`realized_pnl_pct`).
2. Verdict : la thèse s'est-elle **confirmée / cassée / neutre** ? L'hypothèse pivot écrite à
   l'entrée tenait-elle ? Le baissier (§D) avait-il marqué un point « oublié » ?
3. Fixe `hit` (true/false) selon §I.
4. **Append** une entrée dans `memory/fund/decisions.json`.
5. Écris une **leçon datée** dans `memory/lessons.md` (format du fichier) : cause concrète
   (catalyseur absent, valo tendue, momentum suivi trop tard, taille trop grosse…) → correction.
6. **Recompute** `memory/fund/calibration.json` (buckets par confiance + global). Mets `updated`.

S'il n'y a eu aucune fermeture, écris-le et ne fabrique pas de leçon.

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

## PASSE 2 — Gestion du book IA (entrées/sorties)

Rafraîchis les signaux : `node engine/signals.js` (positions + convictions retenues). En appliquant
**method §H** (gate quantitatif → sizing pondéré conviction × calibration, plafonds, plancher de cash
selon le régime, garde-fou drawdown). **Ordre des sources** :
1. Exécute d'abord les **verdicts Opus du mercredi** (bloc `## Revue book IA` de `convictions.md` :
   RENFORCER / GARDER / ALLÉGER / SORTIR) et les **alertes du jeudi** (bloc `## Alertes book IA`
   de `portfolio.md`). Ce sont des décisions déjà instruites — applique-les en priorité.
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

- **Sorties** d'abord : toute position dont la règle de sortie est touchée, la thèse cassée, **ou le
  gate passé au 🔴** (sortie forcée §H).
- **Entrées** ensuite : alloue le cash disponible aux meilleures convictions, **taille selon §H**
  (un gate 🟠/⚪ plafonne à 5 % + stop −8 % ; un 🔴 interdit l'entrée). **Chaque trade cite son gate**
  (verdict + composite) dans le `rationale`.
- **Chaque trade est loggé** dans `ai-fund.json.trades` avec `side, ticker, quantity, price,
  confidence, thesis_id, horizon, rationale`, et chaque position porte `entry_date, target,
  exit_rule, confidence, horizon, thesis_id`. Mets `as_of` à jour et garde `cash` cohérent.

Discipline : mieux vaut rester en cash qu'entrer sans marge de sécurité. La surchauffe n'est
jamais un feu vert. On ne moyenne pas à la baisse une thèse cassée.

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
Ce que l'IA a acheté/vendu et pourquoi (depuis la passe 2), son NAV vs le groupe en une ligne.

## 🎓 Leçon de la semaine
La leçon la plus actionnable tirée de la passe 1 (ou « rien clôturé cette semaine »).

## 🔧 Ce que je corrige
Ce que la calibration m'a fait changer (sizing d'un bucket, ton d'une confiance, critère durci).
Si rien à corriger cette semaine, dis-le franchement.

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
Règle d'or : mieux vaut 1 idée solide que 5 tièdes. S'il n'y a rien de convaincant, dis-le.
