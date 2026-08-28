# Portefeuille du groupe — état au 2026-08-28

Positions réelles encodées depuis Trade Republic. **NAV des positions ≈ 6 309 €** (valeurs seed T0 — les apports membres enrichissent le cash via l'interface). La colonne « Depuis achat » = perf TR au moment du seed (2026-06-04/08). Le book IA gère ses propres positions depuis `memory/fund/ai-fund.json`. Le Portfolio Doctor (jeudi) met à jour Statut / Règle de sortie / Vérifié le.

> Valeurs € = seed TR (2026-06-04/08) ; les cours ont évolué depuis. « Vérifié le » = date de la dernière révision thèse/règle, pas de la dernière valeur TR.

| Ticker | Nom | Valeur € | Poids % | Depuis achat | Coût base € | Horizon | Statut | Règle de sortie | Vérifié le |
|--------|-----|---------:|-------:|------------:|------------:|---------|--------|-----------------|-----------|
| SAF.PA  | Safran                | 732,81 | 11,6 | −8,99 %  | 805,20 | cœur | INTACT | sortie si thèse MRO/aéro cassée (guide FY coupé, carnets CFM déclinants) ; **gate 🟢 +0.441 (RSI 45.4 sain, cours €343.2, PT consensus €389.50 = upside +13.5%)** — RSI bien normalisé (45 vs 58 le 22/08), momentum +20% | 2026-08-28 |
| HO.PA   | Thales                | 723,41 | 11,5 | −10,14 % | 805,04 | cœur | À SURVEILLER | sortie si thèse défense EU se retourne (commandes/carnet guidé en baisse) ; **gate non actualisé (non-US, F-Score null)** ; thèse budgets NATO +5% La Haye intacte ; book IA sorti le 26/06 | 2026-08-21 |
| AMZN    | Amazon                | 703,31 | 11,1 | +16,83 % | 602,00 | cœur | À SURVEILLER | sortie si croissance AWS cassée (<25% YoY) OU capex coupé >15% — **FALSIFICATEUR NON DÉCLENCHÉ ✓ (AWS +37% Q2)** ; **gate 🟠 +0.086 ce 28/08 (F5/9, RSI 29.8 survendu extrême, momentum −2%, initiés 0B/4S)** ; thèse intacte mais gate 🟠 persistant — stop USD $212.45 intact (cours ~€222, marge +20%) | 2026-08-28 |
| NFLX    | Netflix               | 632,58 | 10,0 | −14,75 % | 742,03 | cœur | À SURVEILLER | sortie si décélération abonnés confirmée OU rupture stratégique post-Hastings ; gate non actualisé ; book IA sorti sur stop -8% (13/06) | 2026-06-19 |
| EIMI    | MSCI Emerging Markets (ETF) | 449,46 | 7,1 | +12,09 % | 401,00 | cœur | INTACT | rebalancement ; **gate 🟢 +0.503, RSI 60 fort, momentum +25%, range52 0.915** ; Section 301 10-12.5% impact neutre/mixte EM | 2026-08-28 |
| AI.PA   | Air Liquide           | 436,31 | 6,9 | +8,39 %  | 402,54 | cœur | À SURVEILLER | sortie si ROIC/volumes se dégradent durablement (<8% ROIC) ; **gate 🟠 +0.107 (RSI 27.1 très survendu — extrême)** ; ROIC H1 +10.2% confirmé ✓ ; thèse compounder intacte ; stop -8% avg_cost non défini groupe | 2026-08-28 |
| LOTB.BR | Lotus Bakeries        | 418,88 | 6,6 | +39,16 % | 300,99 | cœur | À SURVEILLER | alléger si DCF inversé PER >50x devient irréaliste (PER ~44x cours €12 980) ; **gate 🟢 +0.372, RSI 80.5 suracheté, momentum +29%** ; taille petite ~4.9% NAV (garde-fou naturel) | 2026-08-28 |
| BYD     | BYD                   | 407,08 | 6,5 | +1,52 %  | 401,08 | cœur | À SURVEILLER | sortie si guerre des prix EV écrase les marges durablement ; gate 🔴 last known (12/06) — book IA sorti ; tarifs douaniers EU/Chine H2 à surveiller | 2026-06-19 |
| CI2     | MSCI India Swap EUR (ETF, Acc) | 359,69 | 5,7 | −10,30 % | 401,00 | cœur | À SURVEILLER | thèse macro Inde intacte (PIB +6,9 %) ; gate 🔴 momentum last known (12/06) — book IA sorti ; tarifs US Inde à surveiller | 2026-06-19 |
| BNP.PA  | BNP Paribas           | 333,83 | 5,3 | +32,47 % | 252,00 | cœur | À SURVEILLER | sortie si taux/risque crédit cassent la thèse banque ; **Q2 +33% net income = thèse CONFIRMÉE ✓ ; gate 🟢 +0.405, RSI 26.4 survendu (vol 2.38x — chute technique notable), momentum +41%** ; cours €100.66 (correction depuis €112 — RSI survendu = potentiel rebond ; thèse intacte) | 2026-08-28 |
| SGO.PA  | Compagnie de Saint-Gobain | 294,06 | 4,7 | −16,57 % | 352,46 | cœur | À SURVEILLER | sortie si cycle construction se retourne durablement ; gate 🔴 last known (12/06) — T1 −2,3 % organique, construction neuve US faible | 2026-06-19 |
| SAP     | SAP                   | 238,15 | 3,8 | −40,61 % | 401,00 | cœur | À SURVEILLER | sortie si guidance FY2026 coupée ; cloud +19%, backlog +20% — thèse cloud RISE intacte ; gate 🔴 last known (12/06) | 2026-06-19 |
| NOVOB   | Novo-Nordisk (B)      | 234,11 | 3,7 | −22,26 % | 301,15 | cœur | À SURVEILLER | sortie si pipeline concurrent écrase la part de marché ; **Q2 résultats passés : Wegovy US −22% CER (transition formulaire), international +37%, guidance FY relevée (0% → −6% vs −12%/−4%) ; EMA approuve Wegovy pill 7.2mg** ; adoption Medicare Q3 pas encore publiée → surveiller Q3 données CMS | 2026-08-21 |
| MSTR    | MicroStrategy (A)     | 200,39 | 3,2 | −50,15 % | 402,00 | tactique | SORTIE | prime NAV effondrée, thèse cassée — **⚠️⚠️⚠️ SIGNAL GROUPE : VENDRE (confirmé 19/06 — PAS ENCORE EXÉCUTÉ depuis 11 SEMAINES). Urgence maximale : chaque semaine supplémentaire aggrave l'exposition à une thèse morte et détériore la crédibilité de la discipline de sortie du groupe.** | 2026-08-28 |
| RMS.PA  | Hermès                | 145,18 | 2,3 | −28,06 % | 201,81 | cœur | À SURVEILLER | sortie si pricing power cassé durablement ; premiums resale Birkin/Kelly en baisse ; expo Moyen-Orient ; gate 🔴 last known (12/06) | 2026-06-19 |

**Total seed : 6 309,28 € investis · 15 positions · cash ≈ 0 €** (les apports membres alimentent le cash, cf. interface).

> Note méthode : « Course dès aujourd'hui » — la perf de la compétition IA vs groupe part de la NAV du 04/06 (6 309 €). Les moins-values « depuis achat » restent affichées (réalité TR) mais ne pénalisent ni ne créditent la course, qui démarre à égalité.

---

## SORTIE — MSTR (MicroStrategy) · signal confirmé 2026-06-19

Règle de sortie touchée : la prime sur NAV bitcoin s'est effondrée. F-Score Piotroski 3/9 (drapeau dur §H), EPS surprise −149 % (mai 2026), momentum −51 %, composite gate −0,620. La thèse « proxy bitcoin à prime » est cassée : BTC en chute et prime de holding disparaît simultanément. **⚠️⚠️⚠️ Signal groupe : VENDRE — signalé le 12/06, confirmé le 19/06. PAS ENCORE EXÉCUTÉ — 11 SEMAINES (28/08). Urgence maximale. La discipline de sortie du groupe est en question : 11 semaines sur une thèse morte est une anomalie de gouvernance grave. Agir en priorité absolue.**

---

## À SURVEILLER — groupe (état 2026-08-28)

**SAF.PA (Safran)** — Gate 🟢 +0.441 (28/08), RSI 45.4 (sain, refroidi vs 54.2 du 22/08), momentum +20%. Cours €343.2. PT consensus €389.50 (+13.5% upside). Thèse MRO/LEAP intacte (H1 marge record 18.4%, guidance FY relevée). Statut INTACT. Book IA détient 2.0929 parts = 7.0% NAV depuis le renforcement 22/08.

**HO.PA (Thales)** — Gate non actualisé (non-US). Thèse défense EU structurellement intacte (budgets NATO +5% La Haye, commandes H1). Book IA sorti le 26/06 sur mécanique §H (gate 🔴 + stop -8%). Le groupe détient toujours. Surveiller gate.

**AMZN (Amazon)** — Gate 🟠 +0.086 ce 28/08 (F5/9, RSI 29.8 survendu extrême, momentum −2%, initiés 0B/4S). Thèse AWS intacte (AWS +37% Q2 ✓, falsificateurs non déclenchés). Cours ~€222, stop USD $212.45 (marge +20%). Gate 🟠 persistant depuis le 21/08 — surveiller si le gate repasse 🟢 (potentiel rebond RSI 29.8).

**AI.PA (Air Liquide)** — Gate 🟠 +0.107 (28/08), RSI 27.1 (très survendu extrême — potentiel rebond). ROIC H1 +10.2% ✓. Thèse compounder intacte. Stop -8% non défini explicitement pour le groupe.

**BNP.PA (BNP Paribas)** — Gate 🟢 +0.405 (28/08), RSI 26.4 (survendu — vol 2.38x, chute technique notable depuis €112). Cours €100.66. Q2 +33% net income = thèse bancaire confirmée. RSI survendu = potentiel rebond technique. Thèse intacte, surveiller si la correction reprend (dépassement du support).

**LOTB (Lotus Bakeries)** — Gate 🟢 +0.372 (28/08), RSI 80.5 (suracheté, près de l'extrême). Cours ~€12 980. PER ~44x (vs Lindt 30x, Mondelez 18x). Thèse compounder premium intacte. Taille petite = garde-fou naturel.

**NOVOB (Novo-Nordisk)** — Q2 résultats passés : Wegovy US −22% CER (transition formulaire), Wegovy international +37%, EMA approuve Wegovy pill 7.2mg. FY guidance relevée (−6% à 0%). Données adoption Medicare Q3 non encore publiées. Thèse GLP-1 solide LT. Surveiller chiffres adoption CMS T3'26.

---

## Alertes book IA — 2026-08-28

Régime RISK-ON SAIN · plancher cash 5% · **9 positions actives · NAV estimée ≈ 10 291€ (−1.21% vs start_capital 10 417€) · cash 5 209,83€ (50.6% NAV)** (très au-dessus du plancher 5%). Gates 28/08 : 🟢7 🟠2 🔴0.

### Sorties exécutées ce jeudi

Aucune — les 4 déclencheurs §H ne sont pas armés :
- Gate 🔴 : 0 position (0 rouge).
- Stop −8% franchi sur 🟠 : AMZN stop USD $212.45 vs cours $256.26 (marge +20.6% ✓) ; AI stop 152.03€ vs cours €166.78 (marge +9.7% ✓).
- Exit_rule touchée : aucune.
- Verdict Opus SORTIR non exécuté : aucun (convictions 27/08 : GVA GARDER, MSCI GARDER).

### À SURVEILLER — book IA

| Ticker | Gate | Alerte | Détail |
|--------|------|--------|--------|
| AMZN | 🟠 +0.086 | ⚠️ GATE 🟠 PERSISTANT (W3) | Gate 🟠 depuis le 21/08 (3e semaine consécutive). F5/9, RSI 29.8 survendu extrême, momentum −2%, initiés 0B/4S. Position 2.2738 parts = €505 ≈ 4.93% NAV → cap 5% §H respecté ✓. Stop USD $212.45 (marge +20.6%) intact. Thèse AWS intacte (Q2 +37%, falsificateurs non déclenchés). RSI 29.8 = rebond potentiel CT — si gate repasse 🟢, renforcement partiel éligible vendredi. Sinon : conserver cap 5% sans action. |
| AI.PA | 🟠 +0.107 | RSI 27.1 survendu extrême | Position 3.07935 parts × €166.78 = €513 ≈ 4.99% NAV ✓ (cap 5% §H respecté). RSI 27.1 = très survendu (potentiel rebond). Stop 152.03€ intact (marge +9.7%). Thèse compounder ROIC +10.2% intacte. Aucune action jeudi. Rebond RSI à surveiller (si RSI > 45 → stabilisation). Ne pas renforcer sans gate 🟢. |
| BNP.PA | 🟢 +0.405 | ⚠️ RSI 26.4 + vol 2.38x inhabituel | Gate 🟢 maintenu malgré RSI 26.4 (très survendu) + volume relatif 2.38x (anormal). Cours €100.66, avg_cost 67.70€ (+49% toujours confortable). Thèse Q2 +33% intacte. Mouvement technique à surveiller : si cours perce €97 (support) → vérifier news macro BNP. Position 3.72219 parts = €374 ≈ 3.6% NAV (petite, pas de trim). Potentiel rebond RSI. |
| MSCI | 🟢 +0.440 | Stop USD fin +5.3% | Stop USD $540.54 (P-001) : cours $569.15 = marge +5.3% (fin — surveiller). Gate 🟢 F7/9 +0.440, RSI 53.6 sain. Convictions 27/08 : GARDER (pivot rétention 95.3% intact). P-002 obligatoire si cours descend vers $555 (~marge 2.7%). Ne pas renforcer. |
| LOTB | 🟢 +0.372 | RSI 80.5 suracheté | Gate 🟢, RSI 80.5 (suracheté persistant). Cours €12 980. PER ~44x. Position petite ~5.0% NAV = garde-fou naturel. Surveiller sans vendre. |
| CEG | 🟢 +0.363 | Stop EUR DÉGAGÉ ✓ (+5.5%) | Stop EUR 232.29€ : cours $282.41/1.152 = €245.2 (marge +5.5% → DÉGAGÉ ✓). Stop USD $212.45 P-001 : cours $282.41 (marge +33%). Gate 🟢 F6/9, RSI 63.5, initiés achats nets. §G gouverne. Falsificateurs Q2 non déclenchés. GARDER. |
| GVA | 🟢 +0.528 | Vote Chambre IIJA — à confirmer | Stop USD $116.93 (P-001) : cours $124.71 (marge +6.7% ✓). Gate 🟢 F7/9 +0.528, RSI 42.6 sain. **Vote Chambre IIJA CR (extension → 11/12) attendu avant le 30/09** — si bloqué, exit_rule GVA réactivée immédiatement. Convictions 27/08 : GARDER (renforcement gelé avant Q3). Q3 résultats ~septembre = horizon-test (marge ≥12.25% dans guide ?). |
| SAF.PA | 🟢 +0.441 | RSI sain, thèse intacte | Gate 🟢 +0.441, RSI 45.4 (sain, normalisé). Cours €343.2, stop 298.63€ (marge +14.9%). 2.0929 parts = 7.0% NAV (cap levé ✓). Aucune action. |
| EIMI | 🟢 +0.503 | RSI 60 — surveiller | Gate 🟢 +0.503, RSI 60 fort, momentum +25%, range52 0.915 (near ATH). ~4.6% NAV. ETF de rebalancement. Aucune action. |

### Catalyseurs imminents (impact book IA)

- **Vote Chambre IIJA CR (avant 30/09)** — Extension Senate 90-6 passée le 08/08 ; la Chambre doit voter avant le 30/09 pour éviter la falaise. Si oui → exit_rule GVA repoussée au 11/12 (déjà intégré). Si bloqué → exit_rule GVA réactivée → sortie immédiate au prochain Doctor. **Surveiller impérativement.**
- **09/09/2026 CPI août** — Dernier verrou avant FOMC 17/09. Si MoM ≤0.2% → cut confirmé, favorable actifs longs CEG/GVA. Si ≥0.3% → réévaluation régime.
- **17/09/2026 FOMC** — 91% cut 25bps (CME FedWatch). Favorable CEG (PPA longue durée) et GVA.
- **~Septembre GVA Q3** — Test horizon : marge ≥12.25% dans guide ? Backlog $7.4B+ stable ? Rev +25%+ ? Falsificateurs : marge <10% OU write-down OU backlog coupé → sortie immédiate.

### Candidats entrée vendredi (INTERDITS ce jeudi)

- **EME (EMCOR Group)** — Acheter (verdict convictions 27/08). Gate 🟢 +0.495, F6/9, PEG ~0.65, RPO backlog $17.14B (+44%), RSI 39.8 (fenêtre d'entrée). Sizing Moyenne ~7% NAV (~€720). Stop USD $702 (−8% de $763). **Cap thème infra-US/power-grid** : GVA (6.9%) + CEG (5.9%) + EME (7.0%) = 19.8% << 40% ✓. Exécuter vendredi si gate 🟢 confirmé + RSI <50.
- **AMZN** — Si gate repasse 🟢 vendredi, renforcement partiel +~0.5 parts éligible (retour vers 5.5-6% NAV). Conditionnel.
- **AZZ** — Surveiller (verdict 27/08). Gate +0.732 mais organique +6% dilué + pivot marge non prouvé. Attendre Q2 FY27.

---

## Alertes book IA — 2026-08-21

Régime RISK-ON SAIN · plancher cash 5 % · **9 positions actives · NAV estimée ≈ 10 272 € (−1,40 % vs start_capital 10 417 €) · cash 5 257,83 € (51,2 % NAV)** (très au-dessus du plancher 5 %).

### Sorties exécutées ce jeudi

Aucune — les 4 déclencheurs §H ne sont pas armés (gate 🔴 : 0 ; stop −8 % franchi : 0 ; exit_rule touchée : 0 ; verdict Opus SORTIR non exécuté : 0). Conforme à la leçon 14/08 (CAP-5%-HORS-TRIGGERS-JEUDI).

### À SURVEILLER — book IA

| Ticker | Gate | Alerte | Détail |
|--------|------|--------|--------|
| AMZN | 🟠 +0.187 | ⚠️ GATE FLIP 🟢→🟠 — TRIM VENDREDI | Position 3.0478 parts = €688 ≈ 6.7% NAV > cap 5% §H (gate 🟠 à 92% cov). **Flip confirmé ce jour** (était 🟢 +0.254 RSI 67.5 le 19/08 → 🟠 +0.187 RSI 40.6 ce 21/08). F5/9, RSI 40.6 faible, initiés vendeurs nets (4/0). Stop EUR 184.43€ intact (marge +22.5%), stop USD $212.45 P-001 intact (marge +22.4%). Thèse AWS intacte (falsificateurs non déclenchés). Déclencheur jeudi non armé (pas de verdict Opus, pas de stop, pas de gate 🔴). → Trim 3.0478 → 2.274 parts (−0.774 parts) à exécuter **vendredi** (leçon 14/08). Cible: 5% NAV = €514. Pas de Jackson Hole aujourd'hui — agir vendredi après Powell (22/08). |
| AI.PA | 🟠 +0.140 | Cap 5% respecté | Position 3.07935 parts × €167.38 = €515 = 5.0% NAV ✓ (cap 5% §H respecté). RSI 31.4 très survendu = potentiel rebond CT. Stop 152.03€ intact (marge +10.1%). Thèse compounder ROIC +10.2% intacte. Aucune action jeudi. Rebond RSI à surveiller (si RSI > 45 → signe de stabilisation). Ne pas renforcer sans gate 🟢. |
| MSCI | 🟢 +0.476 | ⚠️ Stop EUR quasi-margin | Stop USD $540.54 (P-001) : cours $568.75 = marge +5.2% ✓. Stop EUR 492.57€ : cours €493.7 = marge seulement +0.23% (TRÈS fin). §G + P-001 gouvernent (falsificateurs rétention 95.3% ✓, non déclenchés). Convictions 20/08 : GARDER. Surveiller double-source si cours descend vers $562 (≈€488). |
| CEG | 🟢 +0.337 | Stop EUR dégagé ✓ (+2.0%) | Stop EUR 232.29€ : cours $272.92 = €236.9 (marge +2.0% — dégagé depuis 19/08). Stop USD $212.45 P-001 : cours $272.92 (marge +28.4%). Gate 🟢 F6/9, initiés acheteurs nets (1/0). Falsificateurs hyperscalers non déclenchés ✓. §G gouverne. GARDER. **Jackson Hole 22/08 : favorable CEG (dovish → baisse taux → bon pour PPA longue durée).** |
| GVA | 🟢 +0.558 | Stop USD +5.2% | Stop USD $116.93 (P-001) : cours $122.97 (marge +5.2%). Gate 🟢 F7/9 +0.558. GVA légèrement sous entrée (−3.3% vs $127.10). Thèse intact (marge adj EBITDA 12.8% ✓, backlog $7.4B). **Jackson Hole 22/08 : favorable GVA (dovish → baisse coût capital → infrastructure). IIJA réautorisation vote automne = surveiller dès septembre.** |
| SAF.PA | 🟢 +0.358 | RSI sain, renforcement éligible vendredi | Gate 🟢 +0.358, RSI 58.5 (sain, loin du suracheté 80+). Cours €343.6, stop 290.85€ (marge +18.2%). PT consensus €389.50 (+13.4% upside). Position 1.4509 parts = €499 = 4.85% NAV < 7% cible Moyenne. **RSI 58.5 < 65 → demi-renforcement vs plein renforcement non requis (leçon 19/08) : renforcement plein 5%→7% autorisé vendredi si gate 🟢 confirmé.** Buy ~0.642 parts. |
| EIMI | 🟢 +0.564 | RSI 67 (surveiller) | Gate 🟢 +0.564, RSI 67 fort (approchant suracheté mais < 80). Momentum +32%. Position ~4.5% NAV. Aucune action. |
| BNP.PA | 🟢 +0.466 | RSI sain | Gate 🟢 +0.466, RSI 49.5 (sain, normalisé depuis 81.6 de juillet). Cours €105.96. Q2 +33% ✓. Ne pas renforcer (range52 0.839). |
| LOTB | 🟢 +0.385 | RSI 74 suracheté | Gate 🟢, RSI 74 (refroidi vs 87.9 du 15/08). Cours €12 660. PER ~44x. Position petite ~4.9% NAV. §G gouverne (thèse compounder). Surveiller sans vendre. |

### Catalyseurs imminents (impact book IA)

- **22/08 Jackson Hole (DEMAIN)** — Powell discours. 91% probabilité FOMC Sep 17 cut (CME FedWatch). Biais dovish = favorable CEG (PPA longue durée), GVA (infrastructure), AMZN (croissance long terme). Risque : surprise hawkish peu probable post-CPI 3.3% — mais surveiller le ton exact. **Recommandation : différer le trim AMZN et le renforcement SAF.PA au vendredi après Powell (ne pas agir avant le risque directionnel de demain).**
- **26/08 NVDA Q2 FY27** — consensus ~$92B data center. Impact indirect sur CEG (PPA hyperscalers), GVA (data centers 6% CA). Scénario §K `nvda-q2-power-grid-rerating` REJETÉ (3e rejet — ENR ne re-rate pas sur ses propres records, encore moins sur un catalyseur indirect). **Pas d'action préventive sur le book.**
- **~Septembre IIJA réautorisation** — vote Congrès automne 2026. **GVA exit_rule : IIJA non réautorisé FY2027 → sortie immédiate**. Surveiller dès septembre.

### Candidats entrée vendredi

- **SAF.PA renforcement** — 5%→7% NAV (~0.642 parts à ~€343.6). Gate 🟢, RSI sain, PT consensus €389.50 > cours €343.6. Sizing Moyenne = plein (RSI 58.5 < 65 : demi-sizing non requis). Exécuter vendredi après Jackson Hole.
- **AMZN trim** — 3.0478 → 2.274 parts (vente 0.774 parts). Cap 5% §H sur gate 🟠. Exécuter vendredi après Jackson Hole.
- **ENR.DE / MYRG / NEX.PA** — tous en Surveiller (ENR 24x sans marge, MYRG 32x redondant GVA, NEX gate 🟠). Aucun candidat Acheter this week. Droit au blanc §K.

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
