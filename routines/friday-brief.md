# VENDREDI — BRIEF & REVUE HEBDO + GESTION DU BOOK IA
# Cron : 0 22 * * 5   ·   Modèle : Sonnet

Lis `CLAUDE.md`, `skills/engine-method.md` (surtout §H sizing/risque, §I calibration),
`skills/trend-gate.md`, `memory/trends.md`, `memory/convictions.md`, `memory/portfolio.md`,
`memory/market-regime.md`, `memory/lessons.md`, `memory/fund/ai-fund.json`,
`memory/fund/decisions.json`, `memory/fund/calibration.json`.

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

En appliquant **method §H** (sizing pondéré conviction × calibration, plafonds, plancher de cash
selon le régime, garde-fou drawdown) et en partant des `convictions.md` validées cette semaine :
- **Sorties** d'abord : toute position dont la règle de sortie est touchée ou la thèse cassée.
- **Entrées** ensuite : alloue le cash disponible aux meilleures convictions, **taille selon §H**.
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
