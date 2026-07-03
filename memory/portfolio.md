# Portefeuille du groupe — état au 2026-06-26

Positions réelles encodées depuis Trade Republic. **NAV des positions ≈ 6 309 €** (valeurs seed T0 — les apports membres enrichissent le cash via l'interface). La colonne « Depuis achat » = perf TR au moment du seed (2026-06-04/08). Le book IA gère ses propres positions depuis `memory/fund/ai-fund.json`. Le Portfolio Doctor (jeudi) met à jour Statut / Règle de sortie / Vérifié le.

> Valeurs € = seed TR (2026-06-04/08) ; les cours ont évolué depuis. « Vérifié le » = date de la dernière révision thèse/règle, pas de la dernière valeur TR.

| Ticker | Nom | Valeur € | Poids % | Depuis achat | Coût base € | Horizon | Statut | Règle de sortie | Vérifié le |
|--------|-----|---------:|-------:|------------:|------------:|---------|--------|-----------------|-----------|
| SAF.PA  | Safran                | 732,81 | 11,6 | −8,99 %  | 805,20 | cœur | À SURVEILLER | thèse cassée si cycle aéro/MRO se retourne — S1 le 28 juillet (J+32) ; **gate 🟠 ambre +0,134, RSI 82,1** (suracheté extrême, book IA micro-trimé à 5% NAV le 03/07) | 2026-07-03 |
| HO.PA   | Thales                | 723,41 | 11,5 | −10,14 % | 805,04 | cœur | À SURVEILLER | **gate 🔴 rouge −0,312, stop 226,61 € touché (cours 218,4 €)** — book IA sorti ce jour ; groupe détient toujours ; thèse défense EU intacte mais mécanique §H déclenchée | 2026-06-26 |
| AMZN    | Amazon                | 703,31 | 11,1 | +16,83 % | 602,00 | cœur | À SURVEILLER | sortie si croissance AWS cassée ou capex coupé >15% ; **gate 🟠 ambre +0,186**, RSI 29,6 (survendu) — Q2 le 30 juillet (test thèse AWS) ; book IA trimmé à 5% NAV | 2026-06-26 |
| NFLX    | Netflix               | 632,58 | 10,0 | −14,75 % | 742,03 | cœur | À SURVEILLER | sortie si décélération abonnés confirmée OU rupture stratégique post-Hastings | 2026-06-19 |
| EIMI    | MSCI Emerging Markets (ETF) | 449,46 | 7,1 | +12,09 % | 401,00 | cœur | INTACT | rebalancement ; surveiller deadline tarifs US 1er juillet (impact EM indirect) | 2026-06-19 |
| AI.PA   | Air Liquide           | 436,31 | 6,9 | +8,39 %  | 402,54 | cœur | À SURVEILLER | sortie si ROIC/volumes se dégradent durablement ; **gate 🟠 ambre composite −0,055, RSI 74,2 suracheté** (position 4,38% < cap 5% → pas de trim, mais vigilance) — thèse compounder H2 intacte | 2026-07-03 |
| LOTB.BR | Lotus Bakeries        | 418,88 | 6,6 | +39,16 % | 300,99 | cœur | INTACT | alléger si DCF inversé devient irréaliste (PER ~44x 2026 signalé — vigilance valo, taille petite ~4 % NAV) | 2026-06-19 |
| BYD     | BYD                   | 407,08 | 6,5 | +1,52 %  | 401,08 | cœur | À SURVEILLER | sortie si guerre des prix EV écrase les marges ; gate 🔴 book IA (exited) — surveiller tarifs douaniers EU/Chine H2 | 2026-06-19 |
| CI2     | MSCI India Swap EUR (ETF, Acc) | 359,69 | 5,7 | −10,30 % | 401,00 | cœur | À SURVEILLER | thèse macro Inde intacte (PIB +6,9 %) ; gate 🔴 momentum ; deadline tarifs US 1er juillet à surveiller | 2026-06-19 |
| BNP.PA  | BNP Paribas           | 333,83 | 5,3 | +32,47 % | 252,00 | cœur | À SURVEILLER | sortie si taux/risque crédit cassent la thèse banque ; **RSI 76,4 suracheté + range52 0,982 = quasi-plus-haut 52 semaines** — gate 🟢 vert +0,335, momentum +26 % ; FOMC 29/07 = catalyseur directionnel | 2026-07-03 |
| SGO.PA  | Compagnie de Saint-Gobain | 294,06 | 4,7 | −16,57 % | 352,46 | cœur | À SURVEILLER | T1 −2,3 % organique, construction neuve US faible ; gate 🔴 ; sortie si cycle se retourne durablement | 2026-06-19 |
| SAP     | SAP                   | 238,15 | 3,8 | −40,61 % | 401,00 | cœur | À SURVEILLER | thèse cloud RISE confirmée (cloud +19 %, backlog +20 %) ; sortie si guidance FY2026 coupée | 2026-06-19 |
| NOVOB   | Novo-Nordisk (B)      | 234,11 | 3,7 | −22,26 % | 301,15 | cœur | À SURVEILLER | thèse GLP-1 très solide ; **catalyseur Medicare GLP-1 Bridge LANCÉ le 1er juillet** (Wegovy 50$/mois, 65M+ seniors) ; surveiller adoption Q2 et effet sur cours ; sortie si pipeline concurrent écrase la part de marché | 2026-07-03 |
| MSTR    | MicroStrategy (A)     | 200,39 | 3,2 | −50,15 % | 402,00 | tactique | SORTIE | prime NAV effondrée, thèse cassée — **signal groupe : VENDRE (confirmé 19/06)** | 2026-06-19 |
| RMS.PA  | Hermès                | 145,18 | 2,3 | −28,06 % | 201,81 | cœur | À SURVEILLER | premiums resale Birkin/Kelly en baisse ; expo Moyen-Orient ; surveiller pricing power H2 | 2026-06-19 |

**Total seed : 6 309,28 € investis · 15 positions · cash ≈ 0 €** (les apports membres alimentent le cash, cf. interface).

> Note méthode : « Course dès aujourd'hui » — la perf de la compétition IA vs groupe part de la NAV du 04/06 (6 309 €). Les moins-values « depuis achat » restent affichées (réalité TR) mais ne pénalisent ni ne créditent la course, qui démarre à égalité.

---

## SORTIE — MSTR (MicroStrategy) · signal confirmé 2026-06-19

Règle de sortie touchée : la prime sur NAV bitcoin s'est effondrée. Cours actuel ~120 $ (−59 % vs coût base 402 €, −40 % vs valeur seed). F-Score Piotroski 3/9 (drapeau dur §H), EPS surprise −149 % (mai 2026), momentum −51 %, composite gate −0,620. La thèse « proxy bitcoin à prime » est cassée : BTC en chute et prime de holding disparaît simultanément. **Signal groupe : VENDRE — signalé le 12/06, confirmé le 19/06 ; le groupe n'a pas encore agi.**

---

## À SURVEILLER — 9 positions

**HO.PA (Thales)** — Gate 🔴 rouge composite −0,312, stop −8% touché (cours 218,4 € < seuil 226,61 €). Book IA sorti ce jeudi. Groupe détient toujours. Thèse défense EU structurellement intacte (budgets EU en hausse record, commandes Q1 +27 % org) mais la mécanique §H a déclenché la sortie côté book. Surveiller si le cours remonte au-dessus du stop avant un éventuel re-positionnement côté book.

**NFLX (Netflix)** — Reed Hastings a quitté le board en juin 2026. T1 2026 : revenues +16 % YoY mais EPS raté (−7,89 % vs consensus), guidance Q2 +7,7 % (décélération). Book IA sorti sur stop −8 % (gate 🟠 ambre). Groupe conserve. Thèse « pricing power » fragilisée mais non cassée. À suivre au brief vendredi.

**BNP.PA (BNP Paribas)** — Signaux techniques persistants en surchauffe : RSI 76,4 (suracheté) + range52 0,982 (quasi-plus-haut 52 semaines, cours 102,3 €). Q1 2026 solide : PNB +8,5 % à €14,1 Md. Gate 🟢 vert +0,335 (momentum +26,1 %). Objectif moyen analyste ~€105 = potentiel résiduel limité à court terme. Thèse bancaire (ECB favorable, spread HY sain) non cassée. **Pas de trigger de sortie, mais RSI persistant >75 depuis 2 semaines = vigilance maintenue. FOMC 29/07 = catalyseur directionnel (hike positif NIM).**

**BYD** — Fondamentaux impressionnants (demande 2× capacité, technologie charge rapide, expansion Changchun). Book IA exited sur gate 🔴 (composite −0,604, momentum −29 %). Groupe conserve. Surveiller tarifs douaniers UE/Chine H2 2026 sur les marges d'exportation.

**CI2 (MSCI India Swap)** — Macro Inde solide (PIB +6,9 % prévu 2026, deal US-Inde positif). ~19 Mds USD de sorties flux étrangers depuis début 2026, gate 🔴 momentum. Deadline commentaires tarifs US 60 partenaires le 1er juillet (impact indirect EM, à surveiller si l'Inde est ciblée). Thèse long terme structurellement intacte.

**SGO.PA (Saint-Gobain)** — T1 2026 : CA −2,3 % organique (précipitations record Amériques/Europe, construction neuve US faible). Asie-Pacifique résiste (+9 %). Dividende versé (ex-date 8 juin). Thèse rénovation énergétique structurelle ; catalyseur de rebond (relance EU, baisse taux US) pas encore enclenché. Gate 🔴 (composite −0,316).

**SAP** — Thèse cloud RISE confirmée : T1 2026 cloud revenue +19 % à €5,96 Md, backlog +20 %, guidance FY +23–25 %. SAP Sapphire 2026 annonce « Autonomous Enterprise » + AI dans RISE. Momentum −46 %, gate 🔴 (composite −0,492). Moins-value −40,6 % depuis achat ne casse pas la thèse ; surveiller guidance FY2026.

**NOVOB (Novo Nordisk)** — Thèse GLP-1 extrêmement solide. **Catalyseur Medicare GLP-1 Bridge LANCÉ le 1er juillet 2026** — Wegovy à 50 $/mois pour 65 M+ seniors éligibles, nationwide. Le catalyseur est maintenant un fait opérationnel, non une anticipation. Momentum négatif (−43 %) = prise de bénéfices persistante ; surveiller si adoption Q2 crée un redressement du gate. Book IA : gate 🔴 (momentum persistant) interdit toujours la ré-entrée — surveiller gate mi-juillet (ré-entrée candidat si composite > −0,2).

**AI.PA (Air Liquide)** — Gate 🟠 ambre (composite −0,055, RSI 74,2 suracheté, momentum −8,3 %). Retournement gate depuis INTACT (🟢) : momentum négatif + RSI en zone de surchauffe. Position groupe à ~6,9 % NAV seed. Thèse compounder industriel H2 intacte (contrats long terme, ROIC structurel). Book IA : position à 4,38 % NAV < cap 5 % → pas de trim nécessaire, mais cap 5 % actif désormais. Surveiller gate hebdomadairement ; si composite passe > 0,2, retour en 🟢 et cap levé.

**RMS.PA (Hermès)** — Premium resale Birkin/Kelly en baisse = signal précoce de fragilité du désir de marque. Q1 2026 impacté par la chute de demande Golfe. Surveiller les flux Chine et le Q2 2026 pour confirmer ou infirmer la reprise du pricing power.

---

## Alertes book IA — 2026-07-03

Régime SURCHAUFFE · plancher cash 30 % · **9 positions actives · NAV estimée ≈ 10 318 € (−0,95 % vs start_capital 10 417 €) · cash 5 611 € (54,4 % NAV)** (bien au-dessus du plancher 30 %).

### Sorties exécutées ce jeudi

| Ticker | Côté | Quantité | Prix unitaire | Net reçu | Déclencheur |
|--------|------|----------|---------------|----------|-------------|
| SAF.PA | Micro-trim (5,19 % → 5 % NAV) | 0,055 parts | 353,30 € | 19,37 € | Gate 🟠 ambre composite +0,134 — RSI 82,1 suracheté extrême, range52 0,949 ; cap 5 % §H re-activé après appréciation post-trim du 26/06 |
| CEG | Trim (5,93 % → 5 % NAV) | 0,461 parts | 209,32 € | 96,54 € | Gate 🟠 ambre composite +0,167 (flip 🟢→🟠) — cap 5 % §H actif. Opus 02/07 GARDER maintenu (§G gouverne, thèse pivot Crane intact). Nouveau PPA Walmart 176MW Dresden confirme thèse. |

**Produit net total : 115,91 € · Frais totaux : 0,35 €**

### À SURVEILLER — book IA

| Ticker | Gate | Alerte | Détail |
|--------|------|--------|--------|
| CRH | 🟢 vert +0,341 | ⚠️ PRIX DISCORDANT — STOP SUSPENDU | signals.js: $107,53 = 94,08 € (≈ seuil stop 94,20 € !) ; web: $116,49 = 101,9 €. Écart $8,96 inexpliqué. Ne pas vendre sans vérification prix réel vendredi. Gate F6/9 et fondamentaux intacts. |
| AI.PA | 🟠 ambre −0,055 | Cap 5 % actif | RSI 74,2 suracheté, momentum −8,3 % ; position 4,38 % < cap 5 % → pas de trim ; thèse compounder H2 intacte. Surveiller gate. |
| BNP.PA | 🟢 vert +0,335 | Suracheté persistant | RSI 76,4 + range52 0,982 (quasi-plus-haut) depuis 2 semaines. Gate vert, pas de trim. FOMC 29/07 = catalyseur directionnel NIM. |
| MSCI | 🟢 vert +0,554 | Stop dégagé ✓ | Stop 492,57 € / cours ~527,6 € (marge +6,9 %, post-rebond +3,9 % du 1/07). Alerte FX du 30/06 PÉRIMÉE. F7/9, earnings 🟢. Q2 le 21/07 = falsificateur. |
| CEG | 🟠 ambre +0,167 | Falsificateur 28-31/07 | Trimmé à cap 5 % ce jour. Opus GARDER jusqu'au Q2 hyperscalers (28-31/07). PPA Walmart 176MW Dresden confirme thèse. Stop §G (cassure thèse, pas prix). |
| SAF.PA | 🟠 ambre +0,134 | RSI 82,1 extrême | Micro-trim exécuté ce jour. Position à cap 5 %. S1 le 28/07 = test de thèse pivot. Surveiller gate hebdomadairement. |

---

## Alertes book IA — 2026-06-26

Régime SURCHAUFFE · plancher cash 30 % · **8 positions actives · NAV estimée ≈ 10 418 € (+0,0 % vs start_capital 10 417 €) · cash 59,8 % NAV** (bien au-dessus du plancher 30 %).

### Sorties exécutées ce jeudi

| Ticker | Côté | Quantité | Prix unitaire | Net reçu | Déclencheur |
|--------|------|----------|---------------|----------|-------------|
| HO.PA  | Vente totale | 2,21826 parts | 218,40 € | 483,02 € | Gate 🔴 rouge composite −0,312 + stop −8% touché (218,4 € < 226,61 €) |
| SAF.PA | Trim (8,8% → 5% NAV) | 1,16769 parts | 343,70 € | 400,13 € | Gate 🟢→🟠 composite +0,108 — cap 5% §H (RSI 78,7 suracheté, S1 J+32) |
| AMZN   | Trim (6,2% → 5% NAV) | 0,60890 parts | 206,93 € | 125,62 € | Gate 🟢→🟠 composite +0,186 — cap 5% §H (RSI 29,6, Q2 J+34 test de thèse) |

**Produit net total : 1 008,77 € · Frais totaux : 3,03 €**

### À SURVEILLER — book IA

| Ticker | Gate | Alerte | Détail |
|--------|------|--------|--------|
| MSCI | 🟢 vert | 🚨 STOP À 0,8% | Stop 492,57 € / cours ~496,4 € (marge +0,8%) ; RSI 19,2 extrêmement survendu ; **si EUR/USD > 1,107 → stop touché mécaniquement même si USD stable** ; gate F7/9 intact — ne pas sortir sur RSI seul ; résultats Q2 le 21 juillet |
| CEG | 🟢 vert | ⚠️ stop 5,4% | Stop 232,29 € / cours ~244,9 € (marge +5,4%) ; RSI 53 ; gate F6/9 ; contrats PPA fixes = bénéficiaire régime hawkish ; test thèse = Q2 hyperscalers (guidance capex juillet-août) |
| BNP.PA | 🟢 vert | ⚠️ suracheté extrême | RSI 78,7 + range52 1,0 (au plus haut absolu) ; cours 103 € ; gate 🟢 +0,255 ; thèse bancaire non cassée mais upside CT épuisé — ne pas renforcer ; FOMC ~29 juillet = catalyseur directionnel |
| SAF.PA | 🟠 ambre | Cap 5% actif | RSI 78,7 suracheté ; composite +0,108 ; position trimmée à 5% NAV (1,516 parts) ; résultats H1 le 28 juillet (J+32) = prochain test de thèse (RPFH + carnets CFM) |
| AMZN | 🟠 ambre | Cap 5% actif | RSI 29,6 survendu (signal rebond potentiel) ; composite +0,186 ; 2,518 parts ; Q2 le 30 juillet = test thèse AWS (guidance capex) ; FALSIFICATEUR : capex coupé >15% par ≥1 hyperscaler |
| AI.PA | 🟠 ambre | Borderline vert | Composite +0,090 → proche du seuil 🟢 (0,2) ; RSI 58,9 ; thèse compounder H2 intacte ; cap 5% NAV actif ; surveiller si composite passe > 0,2 vendredi |

### Candidats ré-entrée (fenêtre vendredi uniquement — pas jeudi)

- **HO.PA** — Sorti ce jour (gate 🔴 rouge). Thèse défense EU intacte. Gate 🔴 = ré-entrée verrouillée §H. Surveiller gate hebdomadairement ; candidat si composite remonte > −0,2.
- **CRH** — Convictions 25/06 : Acheter/Moyenne sur correction. Signals.js ciblé requis vendredi pour confirmer gate et sizing.
- **NOVOB** — Hors book. Catalyseur Medicare J-5 (1er juillet). Gate 🔴 = ré-entrée verrouillée. Surveiller début juillet : si composite > −0,2 post-catalyseur → candidat Moyenne conviction (thesis_id: novo-glp1).
