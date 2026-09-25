# Portefeuille du groupe — état au 2026-09-25

Positions réelles encodées depuis Trade Republic. **NAV des positions ≈ 6 309 €** (valeurs seed T0 — les apports membres enrichissent le cash via l'interface). La colonne « Depuis achat » = perf TR au moment du seed (2026-06-04/08). Le book IA gère ses propres positions depuis `memory/fund/ai-fund.json`. Le Portfolio Doctor (jeudi) met à jour Statut / Règle de sortie / Vérifié le.

> Valeurs € = seed TR (2026-06-04/08) ; les cours ont évolué depuis. « Vérifié le » = date de la dernière révision thèse/règle, pas de la dernière valeur TR.

| Ticker | Nom | Valeur € | Poids % | Depuis achat | Coût base € | Horizon | Statut | Règle de sortie | Vérifié le |
|--------|-----|---------:|-------:|------------:|------------:|---------|--------|-----------------|-----------|
| SAF.PA  | Safran                | 732,81 | 11,6 | −8,99 %  | 805,20 | cœur | INTACT | sortie si thèse MRO/aéro cassée (guide FY coupé, carnets CFM déclinants) ; **gate 🟢 W43 (RSI 53.6 sain, cours €334.3, mom +16.1% ; PT consensus €389.50 = upside +16.6%)** — H1 guide RELEVÉ (ROI €6.4-6.5B, LEAP +41%, spare parts +28%, marge 18.4%) ; thèse MRO intacte + S&P A upgrade ✓ ; RSI normalisé (vs 30.5 W42) = rebond sain | 2026-09-25 |
| HO.PA   | Thales                | 723,41 | 11,5 | −10,14 % | 805,04 | cœur | À SURVEILLER | sortie si thèse défense EU se retourne (commandes/carnet guidé en baisse) ; **gate non actualisé (non-US, F-Score null)** ; thèse budgets NATO +5% La Haye intacte ; book IA sorti le 26/06 | 2026-08-21 |
| AMZN    | Amazon                | 703,31 | 11,1 | +16,83 % | 602,00 | cœur | INTACT | sortie si croissance AWS cassée (<25% YoY) OU capex coupé >15% — **FALSIFICATEUR NON DÉCLENCHÉ ✓ (AWS +37% Q2)** ; **gate 🟢 W43 (F5/9, RSI 44.1, initiés 0B/3S nets vendeurs — surveiller, cours $249.38)** ; stop USD P-001 marge confortable ✓ ; thèse AWS intacte | 2026-09-25 |
| NFLX    | Netflix               | 632,58 | 10,0 | −14,75 % | 742,03 | cœur | À SURVEILLER | sortie si décélération abonnés confirmée OU rupture stratégique post-Hastings ; gate non actualisé ; book IA sorti sur stop -8% (13/06) | 2026-06-19 |
| EIMI    | MSCI Emerging Markets (ETF) | 449,46 | 7,1 | +12,09 % | 401,00 | cœur | INTACT | rebalancement ; **gate 🟢 W43 (RSI 52.7 sain, mom +25.3%, range52 0.908 — près du haut, cours $54.98)** ; USD fort (T10Y ~5.12%) = headwind EM à surveiller ; thèse diversification intacte | 2026-09-25 |
| AI.PA   | Air Liquide           | 436,31 | 6,9 | +8,39 %  | 402,54 | cœur | À SURVEILLER | sortie si ROIC/volumes se dégradent durablement (<8% ROIC) ; **gate 🟠 W43 — 1er relevé ambre (RSI 39.2 faible, composite 0.143 cov 39%, cours €168.12, mom +5.2%)** ; thèse compounder intacte, ROIC H1 +10.2% ✓ ; **GEL renforcement — hystérésis §H : 2 relevés 🟠 consécutifs requis avant saisine mercredi W44** | 2026-09-25 |
| LOTB.BR | Lotus Bakeries        | 418,88 | 6,6 | +39,16 % | 300,99 | cœur | INTACT | alléger si DCF inversé PER >50x devient irréaliste (PER ~44x) ; **gate 🟠 W43 — 1er relevé ambre (RSI 53.9 sain, momentum +68.4% EN SURCHAUFFE, range52 0.875, cours €12460)** — momentum overheated = frein §H ; taille ~4.9% NAV (sous cap 5% ✓ ; GEL renforcement hystérésis §H) | 2026-09-25 |
| BYD     | BYD                   | 407,08 | 6,5 | +1,52 %  | 401,08 | cœur | À SURVEILLER | sortie si guerre des prix EV écrase les marges durablement ; gate 🔴 last known (12/06) — book IA sorti ; tarifs douaniers EU/Chine H2 à surveiller | 2026-06-19 |
| CI2     | MSCI India Swap EUR (ETF, Acc) | 359,69 | 5,7 | −10,30 % | 401,00 | cœur | À SURVEILLER | thèse macro Inde intacte (PIB +6,9 %) ; gate 🔴 momentum last known (12/06) — book IA sorti ; tarifs US Inde à surveiller | 2026-06-19 |
| BNP.PA  | BNP Paribas           | 333,83 | 5,3 | +32,47 % | 252,00 | cœur | INTACT | sortie si taux/risque crédit cassent la thèse banque ; **gate 🟢 W43 (RSI 34.9 survendu post-div, mom +34.7%, cours €98.43, rel vol 1.67x)** ; ex-div 24/09 EXÉCUTÉ (€3.23/action) → **+€12.02 cash paiement 28/09** ; NIM double-expansion CONFIRMÉE : BCE +25bps + FOMC +25bps ✓ ; RSI bas = effet mécanique ex-div, pas thèse cassée | 2026-09-25 |
| SGO.PA  | Compagnie de Saint-Gobain | 294,06 | 4,7 | −16,57 % | 352,46 | cœur | À SURVEILLER | sortie si cycle construction se retourne durablement ; gate 🔴 last known (12/06) — T1 −2,3 % organique, construction neuve US faible | 2026-06-19 |
| SAP     | SAP                   | 238,15 | 3,8 | −40,61 % | 401,00 | cœur | À SURVEILLER | sortie si guidance FY2026 coupée ; cloud +19%, backlog +20% — thèse cloud RISE intacte ; gate 🔴 last known (12/06) | 2026-06-19 |
| NOVOB   | Novo-Nordisk (B)      | 234,11 | 3,7 | −22,26 % | 301,15 | cœur | À SURVEILLER | sortie si pipeline concurrent écrase la part de marché ; **Q2 résultats passés : Wegovy US −22% CER (transition formulaire), international +37%, guidance FY relevée (0% → −6% vs −12%/−4%) ; EMA approuve Wegovy pill 7.2mg** ; adoption Medicare Q3 pas encore publiée → surveiller Q3 données CMS | 2026-08-21 |
| MSTR    | MicroStrategy (A)     | 200,39 | 3,2 | −50,15 % | 402,00 | tactique | SORTIE | prime NAV effondrée, thèse cassée — **⚠️⚠️⚠️ SIGNAL GROUPE : VENDRE (confirmé 19/06 — PAS ENCORE EXÉCUTÉ depuis 15 SEMAINES). Urgence maximale : 15 semaines sur une thèse morte = anomalie de gouvernance critique. Agir en priorité absolue.** | 2026-09-25 |
| RMS.PA  | Hermès                | 145,18 | 2,3 | −28,06 % | 201,81 | cœur | À SURVEILLER | sortie si pricing power cassé durablement ; premiums resale Birkin/Kelly en baisse ; expo Moyen-Orient ; gate 🔴 last known (12/06) | 2026-06-19 |

**Total seed : 6 309,28 € investis · 15 positions · cash ≈ 0 €** (les apports membres alimentent le cash, cf. interface).

> Note méthode : « Course dès aujourd'hui » — la perf de la compétition IA vs groupe part de la NAV du 04/06 (6 309 €). Les moins-values « depuis achat » restent affichées (réalité TR) mais ne pénalisent ni ne créditent la course, qui démarre à égalité.

---

## SORTIE — MSTR (MicroStrategy) · signal confirmé 2026-06-19

Règle de sortie touchée : la prime sur NAV bitcoin s'est effondrée. F-Score Piotroski 3/9 (drapeau dur §H), EPS surprise −149 % (mai 2026), momentum −51 %, composite gate −0,620. La thèse « proxy bitcoin à prime » est cassée : BTC en chute et prime de holding disparaît simultanément. **⚠️⚠️⚠️ Signal groupe : VENDRE — signalé le 12/06, confirmé le 19/06. PAS ENCORE EXÉCUTÉ — 15 SEMAINES (25/09). Urgence maximale. La discipline de sortie du groupe est en question : 15 semaines sur une thèse morte est une anomalie de gouvernance critique. Agir en priorité absolue.**

---

## À SURVEILLER — groupe (état 2026-09-25)

**SAF.PA (Safran)** — Gate 🟢 W43 (RSI 53.6 sain, normalisé vs 30.5 survendu W42). Cours €334.3. PT consensus €389.50 (+16.6% upside). H1 guide relevé, S&P A upgrade, thèse MRO intacte. INTACT.

**AI.PA (Air Liquide)** — **Gate 🟠 W43 — 1er relevé ambre** (composite 0.143, RSI 39.2, mom +5.2% affaibli). Cours €168.12. Thèse compounder ROIC H1 +10.2% intacte — aucun falsificateur fondamental déclenché. GEL renforcement. Hystérésis §H : surveiller W44 pour 2e relevé. À SURVEILLER.

**LOTB.BR (Lotus Bakeries)** — **Gate 🟠 W43 — 1er relevé ambre** (momentum +68.4% EN SURCHAUFFE = frein §H). Cours €12460. RSI 53.9 sain, range52 0.875. Taille ~4.9% NAV sous cap 5% ✓. Thèse compounder PER ~44x intacte. GEL renforcement. À SURVEILLER.

**HO.PA (Thales)** — Gate non actualisé (non-US). Thèse défense EU structurellement intacte (budgets NATO +5% La Haye). Book IA sorti le 26/06. Le groupe détient. Vérifié 2026-08-21.

**BNP.PA (BNP Paribas)** — Gate 🟢 W43 (RSI 34.9 survendu post-div). Cours €98.43. Ex-div 24/09 exécuté (€3.23/action), paiement 28/09 (+€12.02 cash book IA). NIM double-expansion CONFIRMÉE. RSI bas = mécanique ex-div, thèse intacte. INTACT.

**NOVOB (Novo-Nordisk)** — Q2 : Wegovy US −22% CER (transition formulaire), international +37%, EMA approuve pill 7.2mg. FY guidance relevée (−6% à 0%). Données adoption Medicare Q3 non encore publiées. Thèse GLP-1 solide LT. Surveiller chiffres CMS T3'26. Vérifié 2026-08-21.

> AMZN, EIMI : INTACT (gate 🟢 W43 confirmé, thèses intactes, cf. tableau).

---

## Alertes book IA — 2026-09-25

Régime **SURCHAUFFE HARD-CONFIRMÉE** (FOMC hike +25bps 16/09 → 3.75-4.00% ; T10Y ~5.12% ; BCE +25bps 10/09 → 2.50% ; signals.js affiche RISK-ON SAIN = FRED lag, override prime) · plancher cash 30-50% · **11 positions actives · NAV estimée ≈ €10,090 (−3.2% vs start_capital €10,417) · cash €3,588.61 (35.6% NAV — dans corridor SURCHAUFFE ✓)** · gates W43 (25/09) : 🟢9 🟠2 🔴0.

### Sorties exécutées — 2026-09-25

Aucune — 0 déclencheur §H armé :
- Gate 🔴 fondamental : 0 position (9/11 🟢, 2/11 🟠 — mais 🟠 seul ≠ déclencheur §H).
- F-Score ≤3 ou earnings quality rouge : 0 (GVA F7/9, MSCI F7/9, CB F6/9, EME F6/9, AMZN F5/9 — seuils sains).
- Stop prix franchi sur TACTIQUE : 0 (toutes CŒUR — §H migration 30/08 : seuil réexamen = −25% entry, jamais stop mécanique). GVA P-001 $110.93 < $116.93 = CŒUR → **saisine mercredi 30/09**, pas vente jeudi.
- Verdict Opus SORTIR non exécuté : 0 (convictions 17/09 : GVA GARDER, SAF.PA GARDER).

### À SURVEILLER — book IA

| Ticker | Gate | Alerte | Détail |
|--------|------|--------|--------|
| GVA | 🟢 F7/9 +0.586 | ⚠️ P-001 FRANCHI ($110.93 < $116.93) + IIJA Div.J 30/09 URGENT | Stop USD P-001 $116.93 = BREACHED (cours $110.93 = −5.1% de marge). §H migration 30/08 : CŒUR → **saisine mercredi 30/09 OBLIGATOIRE** (pas vente jeudi). Seuil réexamen −25% = $95.47 (loin). Gate F7/9 +0.586, earnings quality 🟢, initiés 1B/0S. **IIJA Division J expire 30/09 (5 jours)** — backlog $7.4B sous contrats fermes (non-discrétionnaire), CEO Larkin : nouveau highway bill "significativement plus élevé". Thèse intacte. Q3 22/10 = falsificateur décisif. |
| AI.PA | 🟠 +0.143 | ⚠️ 1er relevé 🟠 W43 — GEL renforcement | Position 3.07935 × €168.12 = €517.7 ≈ 5.1% NAV (légèrement au-dessus cap 5% — hystérésis §H : seulement 0.1pt d'écart, pas de trim sans 2e relevé consécutif). Composite 0.143 (cov 39% sans F-Score). RSI 39.2, momentum +5.2% affaibli. Pas de données F-Score/earnings (non-US) — aucun drapeau fondamental 🔴. Thèse ROIC compounder intacte. **GEL renforcement** — surveiller W44 pour 2e relevé 🟠. |
| LOTB | 🟠 +0.064 | ⚠️ 1er relevé 🟠 W43 — momentum overheated | Position 0.03938 × €12460 = €490.7 ≈ 4.9% NAV (sous cap 5% ✓). Momentum +68.4% EN SURCHAUFFE (>+60%/an = frein §H). RSI 53.9 sain, range52 0.875. Pas de F-Score (non-US). Thèse compounder PER ~44x intacte. **GEL renforcement**. |
| CEG | 🟢 F6/9 +0.270 | Range52 0.179 (près du bas) + momentum −16.4% | Cours $261.62 vs entry $252.49 (+3.6%). Momentum −16.4% négatif, range52 0.179 = bas de la fourchette 52 semaines. RSI 40.7 faible. Initiés 1B/0S nets acheteurs. Earnings quality 🟢. §G gouverne (thèse datacenter/nucléaire intacte, PPA longue durée). Q3 ~oct. = horizon-test. |
| BNP.PA | 🟢 +0.482 | RSI 34.9 post ex-div — survendu mécanique | Cours €98.43. Ex-div 24/09 (€3.23) = baisse mécanique du cours d'environ €3. RSI 34.9 = survendu technique, pas fondamental. +€12.02 cash attendu 28/09. NIM double-expansion intacte. Thèse bancaire saine. |

### Catalyseurs imminents (impact book IA)

- **30/09/2026 IIJA Division J — URGENT (5 jours)** : expiration autorité programmes discrétionnaires ~$36.8B/an. Backlog GVA $7.4B sous contrats fermes (non-discrétionnaire) = protégé. Mais pas de nouveau bill présenté. **Saisine mercredi 30/09 GVA obligatoire** (P-001 franchi + IIJA binaire).
- **28/09/2026 BNP.PA paiement ex-div** — +€12.02 cash book IA (3.72219 parts × €3.23). Porte cash à €3,600.63.
- **22/10/2026 GVA Q3** — Horizon-test (marge ≥12.25%, backlog $7.4B+, rev +25%+). Falsificateurs : marge <10% OU write-down >$50M OU backlog <$6.5B → sortie immédiate.
- **27-28/10/2026 FOMC** — Impact CEG (PPA longue durée), GVA, EME.
- **~Octobre MSCI / CEG / EME Q3** — Horizon-tests de thèse.

### Candidats entrée vendredi (INTERDITS ce jeudi)

- **GLE.PA (Société Générale)** — FOMC hike condition remplie, BCE condition remplie. P/TBV 0.94x. Sizing **Basse ~3% NAV** (~€303) — contrainte cash : Moyenne (~7% NAV) mettrait cash <30% SURCHAUFFE. Seule Basse respecte le corridor 30-50%. Gate non calculé (non-US, hors signals.js) — vérifier avant exécution. Stop §H à définir.

---

## Alertes book IA — 2026-09-18

Régime **SURCHAUFFE HARD-CONFIRMED** (FOMC hike +25bps 16/09 → 3.75-4.00%, 12-0 vote unanime ; T10Y ~5.01% = plus haut depuis 2007 ; BCE +25bps 10/09 → 2.50%) · plancher cash 30-50% · **10 positions actives · NAV estimée ≈ €10,064 (−3.4% vs start_capital €10,417) · cash €4,291 (42.6% NAV — dans corridor SURCHAUFFE ✓)** · gates W42 (18/09) : 🟢10 🟠0 🔴0.

### Sorties exécutées ce jeudi

Aucune — 0 déclencheur §H armé :
- Gate 🔴 fondamental : 0 position (10/10 🟢).
- F-Score ≤3 ou earnings quality rouge : 0 (F le plus bas = AMZN F5/9, dans les seuils).
- Stop prix franchi sur TACTIQUE : 0 (toutes CŒUR — seuil réexamen §H = −25% vs entry_price, loin pour toutes ; **GVA P-001 $116.93 franchi = saisine mercredi, pas vente jeudi — §H migration 30/08**).
- Verdict Opus SORTIR non exécuté : 0 (convictions 17/09 : GVA GARDER, SAF.PA GARDER).

### À SURVEILLER — book IA

| Ticker | Gate | Alerte | Détail |
|--------|------|--------|--------|
| GVA | 🟢 F7/9 +0.646 | ⚠️ P-001 FRANCHI ($115.23 < $116.93) — SAISINE MERCREDI 23/09 | Stop USD P-001 $116.93 (entry $127.10 × 0.92) = BREACHED. §H migration 30/08 : cœur → saisine mercredi 23/09 obligatoire, pas vente jeudi. Seuil réexamen $82.75 (−25%) loin. Gate F7/9 +0.646 (meilleur du book), initiés 1B/0S. **IIJA Division J expire 30/09 (12 jours) — backlog $7.4B sous contrat (non-discrétionnaire), CEO Larkin : nouveau highway bill "significativement plus élevé" que IIJA, dépenses continuent 2027-2030.** Thèse intacte. Q3 22/10 = falsificateur. |
| CEG | 🟢 F6/9 +0.322 | T10Y 5.01% headwind + range52 0.186 (près du bas) | Cours $262.80 vs entry $252.49 (+4.1%). Momentum −13.8%, down ~18% en 2026. Range52 0.186 = près des plus bas 52 semaines. T10Y 5.01% = vent de face PPA longue durée. Falsificateurs non déclenchés, initiés 1B/0S nets acheteurs. PT moyen ~$348. §G gouverne. Surveiller Q3 ~oct. |
| BNP.PA | 🟢 +0.462 | Post-FOMC correction €112.60 → €103.78 (−7.8%) | NIM double-expansion CONFIRMÉE (BCE +25bps + FOMC +25bps). Correction "higher for longer" = peur du crédit, pas retournement thèse. Thèse NIM intacte. **Ex-div ~24/09 → +€12.02 cash book IA** (3.72219 × €3.23). RSI 39.2 = sain. |
| MSCI | 🟢 F7/9 +0.558 | Cours $549.47 — pullback W42 | Range52 0.337 (moitié basse). Momentum −1%. Cours $549.47 vs entry $535.40 (+2.6%). F7/9 intact, initiés 1B/0S nets acheteurs. Horizon-test Q3 ~20/10 (rétention ≥93%). Seuil réexamen $401 loin. |

### Catalyseurs imminents (impact book IA)

- **30/09/2026 IIJA Division J — URGENT (12 jours)** : expiration autorité programmes discrétionnaires ~$36.8B/an. Si extension non votée avant 25/09 → confirmer que le backlog GVA ($7.4B) est entièrement sous contrat. Saisine mercredi 23/09 couvre ce risque.
- **~24/09/2026 BNP.PA ex-dividende (€3.23/action)** — +€12.02 cash book IA (3.72219 parts × €3.23). Paiement 28/09.
- **22/10/2026 GVA Q3** — Horizon-test (marge ≥12.25%, backlog $7.4B+, rev +25%+). Falsificateurs : marge <10% OU write-down >$50M OU backlog <$6.5B → sortie immédiate.
- **~Octobre EME / MSCI / CEG Q3** — Horizon-tests de thèse.

### Candidats entrée vendredi (INTERDITS ce jeudi)

- **CB (Chubb)** — FOMC hike +25bps 16/09 = CONDITION REMPLIE (NIM float + pricing power). Gate 🟢. Sizing Moyenne ~7% NAV (~€705). Stop §H à définir avant exécution (~−8% entry). **Contrainte §H déploiement : max 10 pts NAV/semaine.** CB OU GLE.PA ce vendredi, pas les deux.
- **GLE.PA (SG/Société Générale)** — FOMC hike = condition remplie. BCE +25bps déjà actif. P/TBV 0.94x. Acheter Moyenne ~7% NAV. **Choisir entre CB et GLE.PA pour cette semaine (10 pts/sem max §H), second candidat W43.**

---

## Alertes book IA — 2026-09-11

Régime **SURCHAUFFE** (override manuel — NFP +162K 05/09, T10Y 4.823%, PCE core 3.7-4.1% Warsh, FOMC 17/09 ~66% hike) · plancher cash 30-50% · **10 positions actives · NAV estimée ≈ 10 186€ · cash 4 290.86€ (42.1% NAV — dans corridor SURCHAUFFE ✓)** · gates W39 (08/09) : 🟢10 🟠0 🔴0. Signals.js 11/09 : 🟢10/10 (régime RISK-ON SAIN affiché = FRED lag ; override SURCHAUFFE prime). CPI août publié AUJOURD'HUI 11/09 — résultat non confirmé en temps réel (PPI +5.4% = contexte chaud ; override maintenu jusqu'à confirmation formelle).

### Sorties exécutées ce jeudi

Aucune — 0 déclencheur §H armé :
- Gate 🔴 : 0 position (10/10 🟢).
- F-Score ≤3 ou earnings quality rouge : 0.
- Stop prix franchi sur TACTIQUE : 0 (toutes CŒUR — seuil réexamen §H ≈ −25% entry_price, loin pour toutes).
- Verdict Opus SORTIR non exécuté : 0 (convictions 10/09 : GVA GARDER, EME GARDER).

### À SURVEILLER — book IA

| Ticker | Gate | Alerte | Détail |
|--------|------|--------|--------|
| MSCI | 🟢 | Cours $551 — correction post-Q2 | Thèse rétention 95.3% ✓ (seuil ≥93%). Seuil réexamen $401 (=entry $535.4 × 0.75) = loin. Horizon-test Q3 ~20/10 (falsificateurs : rétention <93% OU ARR <+9%). RSI 43.4 sain. Surveiller. |
| GVA | 🟢 | GS Sell PT $119 / cours ~$119 | Gate F7/9 fort. GS downgrade (PT $119) ≈ cours actuel. §G/§H : backlog $7.4B intact, marge 12.8% intact, IIJA CR résolu → thèse NON CASSÉE. Q3 22/10 = horizon-test décisif (marge ≥12.25% ?, backlog $7.4B+ ?, rev +25%+ ?). RSI 25.9 (survendu extrême) = technique, pas fondamental. Surveiller Q3. |
| SAF.PA | 🟢 | RSI 27.7 survendu extrême | H1 guide relevé (ROI €6.4-6.5B, LEAP +41%, marge 18.4%). Cours ~€331.5, stop €298.63 (marge ~10.5%). RSI bas = pression macro taux (4.823%), pas thèse. INTACT. |

### Catalyseurs imminents (impact book IA)

- **CPI août 11/09 (AUJOURD'HUI)** — Verrou décisif FOMC. Consensus +0.3% MoM (PPI +5.4% contexte chaud). Résultat non confirmé en temps réel — override SURCHAUFFE maintenu jusqu'à vendredi.
- **FOMC 17/09 (~66% hike 25bps post-NFP+162K)** — Hike : NIM BNP.PA ↑, vent de face CEG/GVA/EME T10Y. Hold dovish : réactiver déploiement infra/tech. Cash corridor 30-50% maintenu.
- **BNP.PA ex-div ~23/09 (€3.23/action)** — +€12.02 cash book IA (3.7222 parts × €3.23). Catalyseur positif confirmé.
- **GVA Q3 22/10** — Horizon-test (marge ≥12.25%, backlog $7.4B+, rev +25%+). Falsificateurs : marge <10% OU write-down >$50M OU backlog <$6.5B → sortie immédiate.
- **IIJA réautorisation avant 11/12** — Exit_rule GVA. CR 370-48 (03/09) repousse la falaise. Division J non étendue → surveiller vote pluriannuel oct-nov.

### Candidats entrée vendredi (INTERDITS ce jeudi)

- **CB (Chubb)** — Conditionnel CPI 11/09 favorable. Gate 🟢. Sizing ~6% NAV (~€610). Stop §H à définir avant exécution. Exécuter vendredi SEULEMENT si CPI ≤+0.2% MoM (ou bascule RISK-ON SAIN confirmée).
- **GLE.PA (SG/Société Générale)** — Acheter Moyenne (verdict convictions 10/09). Conditionnel CPI+FOMC. BCE hike 10/09 = NIM expansion directe confirmée. P/B 0.45x. Exécuter vendredi si CPI favorable.

---

## Alertes book IA — 2026-09-04

Régime **SURCHAUFFE** (override manuel market-regime.md — FOMC 17/09, PCE core 3.3%, Waller dovish 03/09 mais ambiguïté maintenue) · plancher cash 30-50% · **10 positions actives · NAV estimée ≈ 10 186€ (−2.2% vs start_capital 10 417€) · cash 4 290.86€ (42.1% NAV — dans corridor SURCHAUFFE ✓)** · EUR/USD 1.1609. Gates 04/09 : 🟢10 🟠0 🔴0.

### Sorties exécutées ce jeudi

Aucune — les 4 déclencheurs §H ne sont pas armés :
- Gate 🔴 : 0 position (tous 🟢).
- F-Score ≤3 ou earnings quality rouge : 0.
- Stop prix franchi sur TACTIQUE : 0 (toutes les positions sont CŒUR — §H migration 30/08 : seuil réexamen cœur = −25% vs entry_price, jamais stop mécanique).
- Verdict Opus SORTIR non exécuté : 0 (convictions 03/09 : GVA GARDER, CEG GARDER).

### À SURVEILLER — book IA

| Ticker | Gate | Alerte | Détail |
|--------|------|--------|--------|
| GVA | 🟢 +0.558 | ⚠️ STOP CŒUR PROCHE (≈2%) | Stop ÉCRIT $116.93 (P-001) : cours $119.48 = marge **~2.1%** (P-002 actif). **MAIS GVA = CŒUR (§H migration 30/08) → pas de stop mécanique. Seuil réexamen : entry_price $110.33 × 0.75 = $82.75 → loin.** Gate 🟢 F7/9 +0.558 (plus fort du book). IIJA CR 370-48 résolu (03/09) → exit_rule 30/09 NE se réarme pas. Q3 ~octobre = test thèse (marge ≥12.25% ?). Signal : SURVEILLER — saisine mercredi si cours < $117. |
| EME | 🟢 +0.462 | RSI 29 survendu | Stop USD $702, cours ~$740 (marge ~5.4%). RSI 29 = survendu. Position 1.09 parts = ~$807 ≈ 6.8% NAV. Thèse RPO $17.14B intact. Entrée récente 29/08 — pas d'action. Surveiller RSI < 25 (double-source P-002). |
| MSCI | 🟢 +0.404 | Stop USD marge 3.7% | Stop USD $540.54 (P-001) : cours ~$560 (marge ~3.7%). P-002 si cours < $552 (~2%). Gate 🟢 F7/9. Rétention 95.3% intacte. Position 1.36 parts. Surveiller. |
| SAF.PA | 🟢 +0.360 | RSI 25 survendu extrême | Cours ~€331.5, stop €298.63 (marge ~10.5%). Position 2.0929 parts = 7.0% NAV. RSI 25 = potentiel rebond CT. Thèse MRO intacte. Aucune action (SURCHAUFFE, renforcement gelé). |
| BNP.PA | 🟢 +0.385 | RSI 27 persistant survendu | Cours €104.14. RSI 27 (depuis 26.4 le 28/08 — toujours survendu). Position 3.72219 parts = 3.7% NAV. Bénéficiaire potentiel si hike FOMC 17/09. Aucune action. |

### Catalyseurs imminents (impact book IA)

- **05/09/2026 NFP août** — AUJOURD'HUI. Consensus +53K (très faible). Si miss → shift narratif SURCHAUFFE→RISK-ON SAIN possible. Si beat → hike FOMC 17/09 plus probable. Impact direct : GVA, EME, CEG (infrastructure taux-sensible).
- **09/09/2026 CPI août** — Verrou décisif avant FOMC. MoM ≤0.2% → cut narratif ; ≥0.3% → hike confirmé. Budget déploiement gelé jusqu'ici.
- **17/09/2026 FOMC** — ~50% hike 25bps (Waller dovish 03/09 a ramené de 57%). Hike = NIM BNP.PA bénéficiaire ; cut = CEG/GVA infrastructure bénéficiaires.
- **~Octobre GVA Q3** — Test horizon : marge ≥12.25% ? Backlog $7.4B+ stable ? Rev +25%+ ? Falsificateurs : marge <10% OU write-down OU backlog coupé → sortie immédiate.

### Candidats entrée vendredi (INTERDITS ce jeudi)

- **CB (Chubb)** — Acheter Moyenne conditionnelle (verdict convictions 03/09). Gate 🟢, assureur LT/NatCat pricing power, PEG attractive. **Conditionnel CPI 09/09** : exécuter seulement après lecture CPI favorable. Sizing ~6% NAV (~€610). Stop §H à définir avant exécution.
- **AMZN renforcement partiel** — Gate flip 🟢 confirmé (04/09). Gate 🟢 +0.227, RSI 39.9. Position 3.1138 parts = 7.0% NAV (cap levé Moyenne). Pas de renforcement (SURCHAUFFE + budget gelé avant FOMC).

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

<!-- Alertes 2026-08-21 et antérieures archivées (>30 jours) — voir memory/lessons.md pour l'historique -->

