# Portefeuille du groupe — état au 2026-06-12

Positions réelles encodées depuis Trade Republic. **NAV des positions ≈ 6 309 €** (valeurs seed T0 — les apports membres enrichissent le cash via l'interface). La colonne « Depuis achat » = perf TR au moment du seed (2026-06-04/08). Le book IA gère ses propres positions depuis `memory/fund/ai-fund.json`. Le Portfolio Doctor (jeudi) met à jour Statut / Règle de sortie / Vérifié le.

| Ticker | Nom | Valeur € | Poids % | Depuis achat | Coût base € | Horizon | Statut | Règle de sortie | Vérifié le |
|--------|-----|---------:|-------:|------------:|------------:|---------|--------|-----------------|-----------|
| SAF.PA  | Safran                | 732,81 | 11,6 | −8,99 %  | 805,20 | cœur | INTACT | thèse cassée si cycle aéro/MRO se retourne | 2026-06-12 |
| HO.PA   | Thales                | 723,41 | 11,5 | −10,14 % | 805,04 | cœur | INTACT | sortie si budgets défense EU décélèrent nettement | 2026-06-12 |
| AMZN    | Amazon                | 703,31 | 11,1 | +16,83 % | 602,00 | cœur | INTACT | sortie si croissance AWS + marge retail se cassent | 2026-06-12 |
| NFLX    | Netflix               | 632,58 | 10,0 | −14,75 % | 742,03 | cœur | À SURVEILLER | sortie si décélération abonnés confirmée OU rupture stratégique post-Hastings | 2026-06-12 |
| EIMI    | MSCI Emerging Markets (ETF) | 449,46 | 7,1 | +12,09 % | 401,00 | cœur | INTACT | rebalancement, pas de thèse single-stock | 2026-06-12 |
| AI.PA   | Air Liquide           | 436,31 | 6,9 | +8,39 %  | 402,54 | cœur | À SURVEILLER | sortie si ROIC/volumes se dégradent durablement ; CA YoY −35,7 % (04/2026) à clarifier | 2026-06-12 |
| LOTB.BR | Lotus Bakeries        | 418,88 | 6,6 | +39,16 % | 300,99 | cœur | INTACT | alléger si DCF inversé devient irréaliste (valo tendue, proche plus haut 52s) | 2026-06-12 |
| BYD     | BYD                   | 407,08 | 6,5 | +1,52 %  | 401,08 | cœur | À SURVEILLER | sortie si guerre des prix EV écrase les marges ; gate 🔴 (momentum −29 %, 52s 2 %) | 2026-06-12 |
| CI2     | MSCI India Swap EUR (ETF, Acc) | 359,69 | 5,7 | −10,30 % | 401,00 | cœur | À SURVEILLER | thèse macro Inde intacte (PIB +6,9 %) ; gate 🔴 momentum −18 % ; flux CT sortants | 2026-06-12 |
| BNP.PA  | BNP Paribas           | 333,83 | 5,3 | +32,47 % | 252,00 | cœur | INTACT | sortie si taux/risque crédit cassent la thèse banque | 2026-06-12 |
| SGO.PA  | Compagnie de Saint-Gobain | 294,06 | 4,7 | −16,57 % | 352,46 | cœur | À SURVEILLER | T1 −2,3 % organique, construction neuve US faible ; gate 🔴 ; sortie si cycle se retourne durablement | 2026-06-12 |
| SAP     | SAP                   | 238,15 | 3,8 | −40,61 % | 401,00 | cœur | À SURVEILLER | thèse cloud RISE confirmée (cloud +19 %, backlog +20 %) ; sortie si guidance FY2026 coupée | 2026-06-12 |
| NOVOB   | Novo-Nordisk (B)      | 234,11 | 3,7 | −22,26 % | 301,15 | cœur | À SURVEILLER | thèse GLP-1 très solide ; sortie si pipeline concurrent écrase la part de marché Novo | 2026-06-12 |
| MSTR    | MicroStrategy (A)     | 200,39 | 3,2 | −50,15 % | 402,00 | tactique | SORTIE | prime NAV effondrée (cours −59 % vs coût base) ; F3/9 drapeau dur ; règle de sortie touchée | 2026-06-12 |
| RMS.PA  | Hermès                | 145,18 | 2,3 | −28,06 % | 201,81 | cœur | À SURVEILLER | premiums resale Birkin/Kelly en baisse ; expo Moyen-Orient ; surveiller pricing power H2 | 2026-06-12 |

**Total seed : 6 309,28 € investis · 15 positions · cash ≈ 0 €** (les apports membres alimentent le cash, cf. interface).

> Note méthode : « Course dès aujourd'hui » — la perf de la compétition IA vs groupe part de la
> NAV du 04/06 (6 309 €). Les moins-values « depuis achat » restent affichées (réalité TR)
> mais ne pénalisent ni ne créditent la course, qui démarre à égalité.

---

## SORTIE — MSTR (MicroStrategy)

Règle de sortie touchée : la prime sur NAV bitcoin s'est effondrée. Cours actuel ~120 $ (−59 % vs coût base 402 €, −40 % vs valeur seed). F-Score Piotroski 3/9 (drapeau dur §H), EPS surprise −149 % (mai 2026), momentum −51 %, composite gate −0,620. Experts alertent sur concentration BTC systémique dans le bilan. La thèse « proxy bitcoin à prime » est cassée : BTC en chute et prime de holding disparaît simultanément. **Signal groupe : VENDRE.**

---

## À SURVEILLER — 8 positions

**NFLX (Netflix)** — Reed Hastings quitte le board en juin 2026 (départ du fondateur = rupture de gouvernance potentielle). T1 2026 : revenues +16 % YoY mais EPS raté (−7,89 % vs consensus), guidance Q2 +7,7 % (décélération nette). Gate passé 🔴→🟠 grâce au F-Score 6/9 et earnings quality vert — fondamentaux préservés mais croissance structurelle en question. Thèse « pricing power » non cassée mais fragilisée. À suivre au brief vendredi.

**AI.PA (Air Liquide)** — Les signaux (source FMP, fiscalDate 04/2026) signalent une croissance CA YoY de −35,7 % sur le dernier trimestre disponible. Pour un compounder réputé c'est majeur : probable normalisation des prix énergie (pass-through) mais à vérifier aux prochains résultats semi-annuels (H1 2026). Distribution gratuite d'actions 1/10 et dividende solide en juin. La thèse « ROIC/volumes durables » n'est pas encore cassée ; gate ambre (composite −0,128).

**BYD** — Fondamentaux impressionnants selon les rapports de juin 2026 : demande 2× la capacité, technologie charge rapide 70 % en 5 min, expansion régionale (Changchun). Mais gate 🔴 (composite −0,604, momentum −29 %, 52s à 2 %). Surveiller si les tarifs douaniers Chine/EU pèsent sur les marges H2 2026.

**CI2 (MSCI India Swap)** — Macro Inde solide (PIB +6,9 % prévu 2026, OCDE +7,6 %) et deal US-Inde signé positivement. Mais ~19 Mds USD de sorties flux étrangers depuis début 2026, gate 🔴 (composite −0,284, momentum −18 %). Thèse long terme structurellement intacte.

**SGO.PA (Saint-Gobain)** — T1 2026 : CA −2,3 % organique impacté par précipitations record (Amériques/Europe) et faiblesse construction neuve US. Asie-Pacifique résiste (+9 %). Dividende 2,30 € versé (ex-date 8 juin). La thèse rénovation énergétique reste structurelle ; le catalyseur de rebond (relance EU, baisse taux US) pas encore enclenché. Gate 🔴 (composite −0,316).

**SAP** — Thèse cloud RISE confirmée : T1 2026 cloud revenue +19 % à 5,96 Mds€, backlog +20 %, guidance FY +23–25 %. SAP Sapphire 2026 (juin) annonce « Autonomous Enterprise » + AI dans RISE. Mais momentum −46 %, titre à 139,9 € (3 % du range 52s depuis le bas), gate 🔴 (composite −0,492). La moins-value à −40,61 % depuis achat ne casse pas la thèse ; surveiller la guidance FY2026.

**NOVOB (Novo Nordisk)** — Thèse GLP-1 très solide : Wegovy pill 3 millions de prescriptions (ADA juin 2026, 1 toutes les 5 secondes), Wegovy HD en progression. **Catalyseur connu : Medicare couvre Wegovy à 50 $/mois dès le 1er juillet 2026** (millions de séniors éligibles). Momentum −43 % = prise de bénéfices/rotation, pas un signal fondamental. Ne pas sortir du groupe sur le momentum seul.

**RMS.PA (Hermès)** — Premium resale Birkin/Kelly en baisse = signal précoce de fragilité du désir de marque. Q1 2026 impacté par la chute de demande Golfe. RSI 54 (sain) mais momentum −31 %, range 52s 12 %. Surveiller Q2 2026 et les flux Chine pour confirmer ou infirmer la reprise.

---

## Alertes book IA — 2026-06-12 (fenêtre de sortie §H exécutée)

Régime SURCHAUFFE → plancher cash ≥ 30 %. Le mandat « jeudi = vente seule » (PR #62, mergé le
12/06 à 11h05 UTC) est arrivé APRÈS le run nocturne : la fenêtre de sortie a été rejouée le
12/06 en journée — les 7 sorties forcées gate 🔴 sont FAITES. Vendredi : ne pas les rejouer,
contrôler la cohérence (positions retirées, cash crédité net) puis trancher les arbitrages ci-dessous.

### Sorties exécutées (vente seule, frais 0,30 % débités)

| Ticker | Parts | Prix € | Produit net € | P&L vs coût | Déclencheur |
|--------|------:|------:|-------------:|------------:|-------------|
| MSTR   | 1,3553 | 103,78 | 140,23 | −65,0 % | drapeau dur F3/9 + règle touchée (prime NAV BTC effondrée) — thèse cassée |
| BYD    | 38,9712 | 9,37 | 364,01 | −9,0 % | gate 🔴 (composite −0,604) — thèse intacte, règle verrouillée |
| CI2    | 0,4687 | 760,68 | 355,46 | −11,1 % | gate 🔴 (composite −0,284, flux étrangers sortants) |
| SGO.PA | 3,9386 | 73,28 | 287,75 | −18,1 % | gate 🔴 (composite −0,316, T1 −2,3 % organique) |
| SAP    | 1,6290 | 139,90 | 227,21 | −43,2 % | gate 🔴 (composite −0,492, momentum −46 %) |
| NOVOB  | 6,1077 | 37,80 | 230,20 | −23,3 % | gate 🔴 (composite −0,436) — thèse GLP-1 intacte, ré-entrée prioritaire si gate se redresse |
| RMS.PA | 0,0897 | 1 643,00 | 146,88 | −27,0 % | gate 🔴 (composite −0,436, premiums resale en baisse) |

**Total libéré : ~1 752 € net (frais 5,27 €). Cash book IA : 5 859,74 € ≈ 56 % NAV.**
Vendredi (PASSE 1) : scorer ces 7 fermetures — P&L net, alpha via `node engine/bench.js 2026-06-04 2026-06-12`, leçons.

### À trancher vendredi (arbitrages, PAS exécutés jeudi)

| Ticker | Alerte | Détail |
|--------|--------|--------|
| SAF.PA | 🟠 taille | 7,6 % NAV > cap ambre 5 % — Opus dit GARDER (thèse renforcée) ; trimmer ≈ 252 € ou attendre passage 🟢 |
| HO.PA  | 🟠 taille | 7,5 % NAV > cap ambre 5 % — Opus dit GARDER (défense EU accélère) ; trimmer ≈ 237 € ou attendre 🟢 |
| NFLX   | 🟠 stop touché | −15 % vs avg_cost (stop −8 % dépassé) mais F6/9, earnings verts — sortir ou trim, à arbitrer |
| AI     | 🟠 stop manquant | consigner stop −8 % vs avg_cost 160,4 € → seuil ~147,6 € |
