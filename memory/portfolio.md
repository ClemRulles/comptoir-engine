# Portefeuille du groupe — état au 2026-08-14

Positions réelles encodées depuis Trade Republic. **NAV des positions ≈ 6 309 €** (valeurs seed T0 — les apports membres enrichissent le cash via l'interface). La colonne « Depuis achat » = perf TR au moment du seed (2026-06-04/08). Le book IA gère ses propres positions depuis `memory/fund/ai-fund.json`. Le Portfolio Doctor (jeudi) met à jour Statut / Règle de sortie / Vérifié le.

> Valeurs € = seed TR (2026-06-04/08) ; les cours ont évolué depuis. « Vérifié le » = date de la dernière révision thèse/règle, pas de la dernière valeur TR.

| Ticker | Nom | Valeur € | Poids % | Depuis achat | Coût base € | Horizon | Statut | Règle de sortie | Vérifié le |
|--------|-----|---------:|-------:|------------:|------------:|---------|--------|-----------------|-----------|
| SAF.PA  | Safran                | 732,81 | 11,6 | −8,99 %  | 805,20 | cœur | À SURVEILLER | sortie si thèse MRO/aéro cassée (guide FY coupé, carnets CFM déclinants) ; **gate 🟢 +0.207 borderline (RSI 78.1 suracheté, PT consensus ~€342-348 < cours €358 = peu d'upside)** ; book IA trimmé à 5% ce 14/08 — groupe: surveiller si RSI se normalise ou si PT remonté | 2026-08-14 |
| HO.PA   | Thales                | 723,41 | 11,5 | −10,14 % | 805,04 | cœur | À SURVEILLER | sortie si thèse défense EU se retourne (commandes/carnet guidé en baisse) ; **gate 🔴 au 26/06 (non actualisé ce soir — ticker non-US, pas de F-Score signals.js)** ; thèse budgets NATO +5% La Haye intacte ; groupe détient toujours ; book IA sorti le 26/06 | 2026-08-14 |
| AMZN    | Amazon                | 703,31 | 11,1 | +16,83 % | 602,00 | cœur | INTACT | sortie si croissance AWS cassée (<25% YoY) OU capex coupé >15% — **FALSIFICATEUR NON DÉCLENCHÉ ✓ (AWS +37% Q2, capex relevé)** ; gate 🟢 +0.252, RSI 67.7 sain, F5/9 | 2026-08-14 |
| NFLX    | Netflix               | 632,58 | 10,0 | −14,75 % | 742,03 | cœur | À SURVEILLER | sortie si décélération abonnés confirmée OU rupture stratégique post-Hastings ; pas de données fraîches ce soir ; book IA sorti sur stop -8% (13/06) | 2026-06-19 |
| EIMI    | MSCI Emerging Markets (ETF) | 449,46 | 7,1 | +12,09 % | 401,00 | cœur | INTACT | rebalancement ; **gate 🟢 +0.564, RSI 62.5 sain, momentum +30%** ; Section 301 10-12.5% → impact neutre/mixte EM | 2026-08-14 |
| AI.PA   | Air Liquide           | 436,31 | 6,9 | +8,39 %  | 402,54 | cœur | À SURVEILLER | sortie si ROIC/volumes se dégradent durablement (<8% ROIC) ; **gate 🟠 ambre +0.194 (flip 🟢→🟠 le 11/08, RSI 31.3 survendu = signal rebond possible)** ; ROIC H1 +10.2% confirmé ; thèse compounder H2 intacte | 2026-08-14 |
| LOTB.BR | Lotus Bakeries        | 418,88 | 6,6 | +39,16 % | 300,99 | cœur | À SURVEILLER | alléger si DCF inversé PER >50x devient irréaliste (PER ~44x actuel) ; **RSI 76.7 suracheté + range52 0.993 (quasi-ATH 52 sem) + momentum +35.7% = surchauffe technique** ; taille petite ~4.8% NAV | 2026-08-14 |
| BYD     | BYD                   | 407,08 | 6,5 | +1,52 %  | 401,08 | cœur | À SURVEILLER | sortie si guerre des prix EV écrase les marges durablement ; gate 🔴 last known (12/06) — book IA sorti ; tarifs douaniers EU/Chine H2 à surveiller | 2026-06-19 |
| CI2     | MSCI India Swap EUR (ETF, Acc) | 359,69 | 5,7 | −10,30 % | 401,00 | cœur | À SURVEILLER | thèse macro Inde intacte (PIB +6,9 %) ; gate 🔴 momentum last known (12/06) — book IA sorti ; tarifs US Inde à surveiller | 2026-06-19 |
| BNP.PA  | BNP Paribas           | 333,83 | 5,3 | +32,47 % | 252,00 | cœur | INTACT | sortie si taux/risque crédit cassent la thèse banque ; **Q2 +33% net income = thèse CONFIRMÉE ✓ ; gate 🟢 +0.454, RSI 66 sain** ; range52 0.971 (ne pas renforcer) | 2026-08-14 |
| SGO.PA  | Compagnie de Saint-Gobain | 294,06 | 4,7 | −16,57 % | 352,46 | cœur | À SURVEILLER | sortie si cycle construction se retourne durablement ; gate 🔴 last known (12/06) — T1 −2,3 % organique, construction neuve US faible | 2026-06-19 |
| SAP     | SAP                   | 238,15 | 3,8 | −40,61 % | 401,00 | cœur | À SURVEILLER | sortie si guidance FY2026 coupée ; cloud +19%, backlog +20% — thèse cloud RISE intacte ; gate 🔴 last known (12/06) | 2026-06-19 |
| NOVOB   | Novo-Nordisk (B)      | 234,11 | 3,7 | −22,26 % | 301,15 | cœur | À SURVEILLER | sortie si pipeline concurrent écrase la part de marché ; **⚠️ Q2 résultats post-Medicare IMMINENTS (~août 2026, 6-7 semaines post-lancement 1er juillet) = RISQUE BINAIRE : adoption forte ou faible ?** ; surveiller gate avant toute action | 2026-08-14 |
| MSTR    | MicroStrategy (A)     | 200,39 | 3,2 | −50,15 % | 402,00 | tactique | SORTIE | prime NAV effondrée, thèse cassée — **⚠️ SIGNAL GROUPE : VENDRE (confirmé 19/06 — PAS ENCORE EXÉCUTÉ depuis 2 mois)** | 2026-06-19 |
| RMS.PA  | Hermès                | 145,18 | 2,3 | −28,06 % | 201,81 | cœur | À SURVEILLER | sortie si pricing power cassé durablement ; premiums resale Birkin/Kelly en baisse ; expo Moyen-Orient ; surveiller pricing power H2 | 2026-06-19 |

**Total seed : 6 309,28 € investis · 15 positions · cash ≈ 0 €** (les apports membres alimentent le cash, cf. interface).

> Note méthode : « Course dès aujourd'hui » — la perf de la compétition IA vs groupe part de la NAV du 04/06 (6 309 €). Les moins-values « depuis achat » restent affichées (réalité TR) mais ne pénalisent ni ne créditent la course, qui démarre à égalité.

---

## SORTIE — MSTR (MicroStrategy) · signal confirmé 2026-06-19

Règle de sortie touchée : la prime sur NAV bitcoin s'est effondrée. Cours actuel ~120 $ (−59 % vs coût base 402 €, −40 % vs valeur seed). F-Score Piotroski 3/9 (drapeau dur §H), EPS surprise −149 % (mai 2026), momentum −51 %, composite gate −0,620. La thèse « proxy bitcoin à prime » est cassée : BTC en chute et prime de holding disparaît simultanément. **⚠️ Signal groupe : VENDRE — signalé le 12/06, confirmé le 19/06. PAS ENCORE EXÉCUTÉ par le groupe depuis près de 2 mois. Chaque semaine sans action augmente l'exposition à une thèse morte.**

---

## À SURVEILLER — groupe (état 2026-08-14)

**SAF.PA (Safran)** — Gate 🟢 +0.207 borderline (RSI 78.1 suracheté, momentum +16.1%). S1 marge record confirmé 28/07 (thèse HAUTE). Mais PT consensus ~€342-348 **sous** le cours actuel ~€358 = peu d'upside résiduel pricé à court terme. Book IA a trimé ce jour de 7%→5% NAV sur cette lecture. Pour le groupe : surveiller RSI (normalisation en dessous de 70 = signal plus confortable) et si un analyste relève son PT au-dessus du cours.

**HO.PA (Thales)** — Gate non actualisé (non-US, pas de F-Score). Thèse défense EU structurellement intacte (budgets NATO +5% La Haye, commandes H1 attendues). Book IA sorti le 26/06 sur mécanique §H (gate 🔴 + stop -8%). Le groupe détient toujours. Surveiller gate hebdomadairement.

**AI.PA (Air Liquide)** — Gate 🟠 +0.194 (flip 🟢→🟠 le 11/08). RSI 31.3 survendu = signal de rebond technique possible. ROIC H1 +10.2% confirmé. Thèse compounder H2 intacte. Cours 169.14€, stop -8% = 152.03€ (marge +11.2%). Ne pas renforcer sans retour du gate en 🟢.

**LOTB (Lotus Bakeries)** — RSI 76.7 suracheté + range52 0.993 = quasi-ATH + momentum +35.7%. PER ~44x (Lindt ~30x, Mondelez ~18x). Risque de retournement technique à court terme. Thèse « compounder premium » intacte mais évaluée à prime. Taille petite ~4.8% NAV = garde-fou naturel. Surveiller.

**NOVOB (Novo-Nordisk)** — ⚠️ **CATALYSEUR BINAIRE IMMINENT** : Q2 résultats 2026 post-Medicare Wegovy (~août 2026, estimé dans les prochains jours à ~2 semaines). Wegovy 50$/mois pour 65M+ seniors lancé le 1er juillet. Les premières données d'adoption CMS/prescription arrivent dans ce trimestre. Gate hors signals.js (non-US non couvert). Thèse GLP-1 reste la plus solide du secteur mais adoption Medicare insuffisante serait baissière. **Recommandation groupe : surveiller la date de publication résultats NOVOB et les chiffres d'adoption Wegovy — risque binaire réel.**

---

## Alertes book IA — 2026-08-14

Régime RISK-ON SAIN · plancher cash 5% · **8 positions actives · NAV estimée ≈ 10 386 € (−0,30 % vs start_capital 10 417 €) · cash 5 795 € (55,8 % NAV)** (très au-dessus du plancher 5 %).

### Sorties exécutées ce jeudi

| Ticker | Côté | Quantité | Prix unitaire | Net reçu | Déclencheur |
|--------|------|----------|---------------|----------|-------------|
| CRH | Vente totale | 7,12 parts | 84,81 € ($97,70) | 602,03 € | exit_rule gate slip 🟢→🟠 (DERNIER override 09/07 réaffirmé 08/08 — déclenché sans re-override possible) + stop USD $107,37 toujours franchi (cours $97,70, P-002 ✓) + verdict Opus 13/08 SORTIR |
| SAF.PA | Alléger (7 % → 5 % NAV) | 0,58 parts | 358,00 € | 207,02 € | Verdict Opus convictions 13/08 ALLÉGER non exécuté + RSI 78,1 suracheté persistant + PT consensus ~342-348€ < cours 358€ ; gate borderline 🟢 +0,207 (récupéré de 🟠 +0,159 du 13/08) |

**Produit net total : 809,05 € · Frais totaux : 2,43 €**

### À SURVEILLER — book IA

| Ticker | Gate | Alerte | Détail |
|--------|------|--------|--------|
| AI.PA | 🟠 ambre +0.194 | ⚠️ Cap 5% — TRIM VENDREDI | Position 4,20935 parts = ~6,9 % NAV > cap 5 % §H (gate 🟠 depuis 11/08). Stop 152,03 € non touché (cours 169,14€, marge +11,2 %). Thèse ROIC intacte. Aucun des 4 déclencheurs jeudi rempli → À SURVEILLER. Trim à 5 % NAV (~519€, soit ~3,07 parts, vendre ~1,14 parts) recommandé vendredi. RSI 31,3 survendu = rebond possible → envisager trim en force si RSI remonte > 45. |
| SAF.PA | 🟢 borderline +0.207 | RSI 78.1 suracheté | Trimmé à cap 5 % ce jour. Position à 1,4509 parts ≈ 5 % NAV. Gate récupéré de 🟠 (+0,207 = +0,007 au-dessus du seuil). RSI 78.1 encore suracheté. PT consensus sous le cours. Thèse intacte. Surveiller gate et RSI. |
| MSCI | 🟢 vert +0.661 | Stop EUR dégagé ✓ | Stop EUR 492,57 € DÉGAGÉ ✓ (cours $575,24 = 499,3 €, marge +1,4 % — n'est plus franchi depuis 14/08). Stop USD $540,54 valide (cours $575,24 > $540,54, P-001). F7/9, initiés équilibrés. Gate le plus propre du book. |
| CEG | 🟢 vert +0.332 | Gate flip 🟠→🟢 ✓ | Gate confirmé 🟢 ce matin (flip 🟠→🟢 +0,332 — F6/9, earnings quality vert, initiés achats nets). Cours $278,64 = 241,9 € > stop EUR 232,29 € (marge +4,2 %). §G gouverne — GARDER. |
| BNP.PA | 🟢 vert +0.454 | Range52 0.971 | RSI 66 (sain, refroidi vs 76 de juillet). Gate +0,454. Q2 +33 % = thèse confirmée. Ne pas renforcer (range52 0,971 = quasi-plus-haut). |
| LOTB | 🟢 vert +0.405 | RSI 76.7 suracheté | Momentum +35,7 %, range52 0,993 (quasi-ATH). PER ~44x. Taille petite (4,8 % NAV). Surveiller. |

### Candidats entrée vendredi (INTERDITS ce jeudi)

- **GVA** — Acheter (verdict convictions 13/08) — rotation CRH→GVA recommandée. Gate 🟢 +0.602, F7/9, pivot marge adj EBITDA 12,8 % LIVRÉ ✓, backlog record $7,4 Md, fwd 17x. Sizing Moyenne ≈ 6-7 % NAV. Précondition : recouper prix double-source (P-002) avant exécution.
- **AI.PA trim** — vendre ~1,14 parts pour revenir à cap 5 % §H (gate 🟠, position 6,9 %).
- **NEX.PA** — Surveiller (verdict 13/08) — gate 🟠, attendre 🟢 ou repli.

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
