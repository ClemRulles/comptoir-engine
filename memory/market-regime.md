# Régime de marché — note Deep-dive 2026-10-08 (W49)

- **⚠️ BASCULE DE MANDAT ACTÉE (correction de cadre, pas un changement de régime).** `engine-method.md` §H (FAIT FOI, depuis 2026-10-06) fixe le cash à **10 % cible / bande 5-15 % dans TOUS les régimes** — « le régime n'achète plus de cash, il change la composition » (crypto/tactique respirent, le cash reste à 10 %). **L'« override plancher 30 % SURCHAUFFE » cité W43→W48 est OBSOLÈTE** : il appartenait à l'ancien mandat. Book ~34,7 % cash (≈€3 535, NAV ≈€10 180) = **+19,7 pts au-dessus du plafond 15 %** → SOUS-investi, redéploiement obligatoire ≤10 pts NAV/sem dès vendredi. Le desk-macro recalera `allocation.json` (node risk.js) lundi/vendredi.
- **Régime inchangé** : override **SURCHAUFFE** maintenu (T10Y ~5,21 %, FOMC 27-28/10 ~73 % hike, dot plot hawkish) ; `signals.js` 08/10 lit toujours RISK-ON SAIN (FRED lag : T10Y2Y +0,51, VIX 15,0, HY 3,03 %, CPI 3,4 %, HICP EU 3,2 %). §E exige une marge RÉELLE (P-003). **12🟢 / 0🟠 / 0🔴.**
- **Deep-dive** : CRM + ICE → 2 Acheter Moyenne (déploiement vendredi, CRM ~5 % + ICE ~3,5 % capée MSCI) ; EME + AMZN → GARDER (pivots renforcés). Tactique BLANC. A bis §K 0 candidat.
- **⚠️ Risque n°1 du book (audit risk-mgr)** : **~27 % NAV sur « le capex IA/data-centers continue »** (GVA+CEG+EME+AMZN) — concentration de FACTEUR, pas de poids. Cf. lessons.md 08/10 (candidat P-004) et convictions.md.
- **Sources** : engine/signals.js 08/10 ; engine-method.md §H ; dossiers desks + risk-manager 08/10.

---

# Régime de marché — mis à jour le 2026-10-06 (W48)

- **✅ SURCHAUFFE HARD-CONFIRMÉE — INCHANGÉ**. T10Y **~5,21 %** (stable). FOMC 27-28/10 : **~73 % hike** (Goldman Sachs révisé, up from 69 % — 12/18 membres voient ≥1 hausse, 16/18 dot hawkish). S&P 500 ~7 680. Brent ~$107.
- **Signals.js W48 06/10** : RISK-ON SAIN (FRED lag — override prime, SURCHAUFFE acté). **12🟢 / 0🟠 / 0🔴** (toutes positions vertes, inchangé vs W47).
- **✅ GLE.PA ex-div 05/10** : €0.75/part × 1.01 parts = +€0.76 cash. Cash 3 535.09€ → **3 535.85€ = 35.2% NAV** (corridor 30-50% ✓). NAV ~€10 036.
- **Tendance W48** : AUCUNE NOUVELLE. Candidats analysés : P&C Insurance (CB détenu, P-003), Nuclear/SMR (CEG détenu, pas d'angle nouveau), Tech résurgence (bulle drapeau SURCHAUFFE), IIJA deadline (catalyseur CT Dec 11). Droit au blanc appliqué.
- **Grok W48** : Grok-3 API appelé (**grok-beta OBSOLÈTE 15/09/2025 → migrer grok-3**). 3 thèmes partiellement corroborés : Macro/courbe (✓ FOMC 73%), Énergie/Infra (✓ PPAs), Tech/IA/Crypto (partiel). Movers: CEG↑ (nucléaire), AMZN↑ (IA), BNP.PA↓ (courbe — cohérent RSI 22.6). **0 calls créés** (tactical_cap 0%, hit_rate 33.3% trop bas).
- **Rotation sectorielle W48** : Energy T12M +39,2 %, Tech T6M +45,6 % (résurgence IA — déjà bien capturée par AMZN/AI.PA), Financials T6M +15,5 %. VIX ~16,4 (calme malgré hike imminent). Sources : FMP/web search 06/10.
- **Crypto (radar)** : BTC 58,7 % dominance, F&G 73 (Greed) — lecture **contrarienne** : niveau propice à une correction CT, aucune allocation forcée.
- **Calls Grok expirés à scorer** : ceg-hormuz-nuclear-w43 (horizon **08/10**) ; gva-iija-expiry-w44 + cb-oversold-rebound-w44 (horizon **10/10**) ; ceg-oversold-nuclear-w45 (horizon **13/10**). Résolution par engine/grok.js.
- **Cash 3 535.85€ = 35.2% NAV** (corridor 30-50% ✓). **0 trade W48**. Déploiement bloqué : plancher 30% + SURCHAUFFE, aucune libération de cash.
- **Catalysts 14 jours** : ceg-hormuz-nuclear-w43 08/10 (scoring) ; gva+cb calls 10/10 (scoring) ; CB Q3 ~20/10 (combined ratio test) ; FOMC 27-28/10 (73% hike — binaire fort).
- **Sources** : engine/signals.js 06/10 ; Goldman Sachs FOMC outlook (web, 23/09) ; FMP sector perf T12M/T6M ; engine/crypto.js 06/10 ; Grok-3 API 06/10.

---
# Régime de marché — mis à jour le 2026-10-03 (W47)

- **✅ SURCHAUFFE HARD-CONFIRMÉE — INCHANGÉ**. T10Y **~5,21 %** (stable). FOMC 27-28/10 : **69 % hike** (Kalshi). S&P 500 ~7 680. Brent ~$107.
- **Signals.js W47 03/10** : RISK-ON SAIN (FRED lag — override prime, SURCHAUFFE acté). **12🟢 / 0🟠 / 0🔴** (toutes positions vertes).
- **✅ LOTB streak 🟠×4 CASSÉE → 🟢 W47** (momentum revenu à la normale, RSI normalisé). Saisine mercredi W47 non déclenchante : pas de trim (position < 5% NAV). Hystérésis renforcement : 1er🟢 depuis la série, pas actionnable avant 2e🟢 consécutif (W48 si confirmé).
- **✅ AI.PA 2e🟢 consécutif** (W46→W47). Hystérésis levée. Renforcement possible mais bloqué : SURCHAUFFE + cash 35.2% = aucune marge pour déploiement supplémentaire.
- **✅ GLE.PA RÉCONCILIATION PRIX W47** : entry_price corrigée 303€ → 66.08€ (cours Yahoo Finance confirmé ~€66). Cash récupéré +€239.29 (3 295.80€ → 3 535.09€). NAV inchangé (~€10 035). Position GLE.PA = 1.01 × 66.08€ = €66.74 ≈ 0.66% NAV (sous-taille vs cible Basse 3% NAV). Ex-div GLE.PA 05/10 (€0.75/part = €0.76 cash).
- **Grok W47** : cb-nim-float-post-fomc-w42 résolu INCORRECT (CB $331.66 < $339.42, −2.29%). hit_rate 5/15 = 33.3%, tactical_cap 0%.
- **Cash 3 535.09€ = 35.2% NAV** (corridor 30-50% ✓, plus confortable qu'en W46 après réconciliation). 0 trade W47.
- **Catalysts à 14 jours** : GLE.PA ex-div 05/10 (€0.75) ; CB Q3 ~20-21/10 (combined ratio/NII — test de thèse) ; FOMC 27-28/10 (69% hike, binaire fort pour tout le book) ; EME Q3 octobre.
- **Sources** : engine/signals.js 03/10 ; Yahoo Finance CB $331.66 03/10 ; Yahoo Finance GLE.PA €66.08 01/10.

---
# Régime de marché — mis à jour le 2026-10-02 (W46)

- **✅ SURCHAUFFE HARD-CONFIRMÉE — INCHANGÉ**. T10Y **~5,21 %** (stable vs W45). FOMC 27-28/10 : **69 % hike** (Kalshi) / ~49 % (CME). S&P 500 ~7 680. Brent stable ~$107.
- **Signals.js W46 02/10** : RISK-ON SAIN (FRED lag — override prime, SURCHAUFFE acté). 11🟢 / 1🟠 (LOTB) / 0🔴.
- **✅ AI.PA gate FLIP 🟠×3 → 🟢** (W43+W44+W45 ambre → W46 🟢 +0.371, RSI 64.9, mom +11%) — hystérésis naturellement désarmée. Aucun trim exécuté sur les 3 relevés (excédent < frais friction à chaque fois). **Statut : INTACT**.
- **⚠️ LOTB 🟠 4e relevé consécutif** (W43→W44→W45→W46 — momentum overheated +63.4%) — **SAISINE MERCREDI W47 OBLIGATOIRE** (règle : si 4e relevé consécutif 🟠). Position 4.6% NAV < cap 5% → aucun trim requis (pas d'excédent).
- **GVA P-001 $116.85 ≈ $116.93** (boundary, écart −$0.08). Saisine 30/09 (mercredi) exécutée : verdict GARDER (guidance relevée $5.3-5.5B, backlog $7.4B intact, IIJA Division J CR base continue). Q3 GVA attendu ~05/11 (non 22/10 — correction date).
- **CEG : Amazon PPA 690MW 20 ans Calvert Cliffs annoncé 01/10** (+2.3% stock). 3e grand hyperscaler PPA (Microsoft 835MW TMI, Meta 1100MW Clinton, Amazon 690MW). Falsificateurs §G non déclenchés. Saisine 01/10 verdict GARDER confirmé.
- **CB ex-dividende** : $1.02/part (ex-date ~30/09), paiement 02/10. RSI 20.6 = suppression mécanique post-ex-div (identique BNP.PA pattern 24/09). $2.448 = **€2.12 crédité cash book IA aujourd'hui** (EUR/USD ~1.155). Cash post-CB-div : €3 295,80.
- **⚠️ GLE.PA ANOMALIE PRIX** : entry_price €303 enregistré 26/09 (estimation quand GLE.PA absent signals.js EU) → cours réel W46 €66,08. Écart massif = erreur d'enregistrement du 26/09, pas une perte de marché. **Saisine mercredi W47 OBLIGATOIRE** pour réconciliation prix.
- **Cash 32,8% NAV** = corridor 30-50% ✓ (plancher 30% respecté). 0 trade W46.
- **Sources** : engine/signals.js 02/10 ; web search CB dividend, CEG Amazon PPA, GVA guidance Q3.

---
# Régime de marché — mis à jour le 2026-09-29 (W45)

- **✅ SURCHAUFFE HARD-CONFIRMÉE — INCHANGÉ**. T10Y **~5,21 %** (nouveau plus haut, +9bps vs W44). S&P 500 ~7 683 (−0,77% sem., −1,7% depuis ATH 7 816). Brent **~$106,89** (+2,46% sem., rebond après rejet des pourparlers de paix Trump). FOMC 27-28/10 : **69 % hike** (Kalshi) / ~49 % (CME FedWatch). Crypto : BTC −3,36 % 7j, F&G 73 (Greed).
- **Signals.js W45 29/09** : RISK-ON SAIN (FRED lag — override prime, SURCHAUFFE acté). 10🟢 / 2🟠 (AI.PA + LOTB) / 0🔴.
- **⚠️ AI.PA 🟠 3e relevé consécutif** (W43+W44+W45) — hystérésis armée §H. Excédent vs cap 5% NAV ≈ 4-5€ ≈ frais friction → **trim 0** (seuil économique non atteint, règle 26/09). Monitoring W46 : si 4e relevé consécutif, saisine mercredi.
- **⚠️ LOTB 🟠 3e relevé consécutif** (W43+W44+W45) — hystérésis armée §H. Position 4,78% NAV < cap 5% → **aucun trim** requis (pas d'excédent).
- **🔴 GVA P-001 TOUJOURS FRANCHI** : signals.js W45 = $115,77 < $116,93 ref. IIJA Division J **EXPIRÉ LE 30/09** (aucun CR, aucun bill — confirmé). **Saisine MERCREDI 30/09 (aujourd'hui)** : §G CŒUR — évaluer backlog Q3 + impact division J. Backlog $7,4B = contrats fermes (résistants à l'expiration). Nouvelles attributions gelées jusqu'à CR ou FY2027 bill. Exit_rule : backlog Q3 < $6,5B OU falsificateurs fondamentaux déclenchés.
- **Cash 32,2% NAV** = corridor 30-50% ✓ (plancher 30% respecté). Pas de trade W45.
- **Rotation sectorielle W45** : XLK worst YTD (−0,40 %), Healthcare +7,97 % QTD (meilleur du trimestre), rotation valeur/défensif en cours. Sector data : FMP/web search 28/09.
- **Tendance W45** : AUCUNE NOUVELLE — Hormuz/Substituts (W43) reste le thème de fond, Brent rebondi $106,89. Healthcare rotation candidate mais pas de signal d'entrée actionnable (cap cash). Voir trends.md.

---
# Régime de marché — mis à jour le 2026-09-26 (W44)

- **✅ SURCHAUFFE HARD-CONFIRMÉE — INCHANGÉ**. T10Y ~5,12 %. Prochain FOMC 27-28/10/2026.
- **Signals.js W44 26/09** : RISK-ON SAIN (FRED lag — override prime, SURCHAUFFE acté). 10🟢 / 2🟠 (AI.PA + LOTB) / 0🔴.
- **AI.PA 🟠 2e relevé consécutif** (W43+W44) — hystérésis armée §H. Excédent vs cap 5% NAV = 3,9€ < frais friction → **trim 0** exécuté. Monitoring W45.
- **LOTB 🟠 2e relevé consécutif** (W43+W44) — hystérésis armée §H. Position 4,78% NAV < cap 5% → **aucun trim** (position conforme).
- **GVA P-001 FRANCHI** : $115,08 < $116,93 ref. **Saisine mercredi 30/09 OBLIGATOIRE** (coïncide avec IIJA Division J expiration).
- **Cash 32,2% NAV** (post-GLE.PA Basse 26/09, BNP.PA div +12,02€) → corridor 30-50% ✓ (plancher 30% respecté).
- **1 trade W44** : GLE.PA (SG) Basse achetée (1,01 part @ 303€ = 3,0% NAV). 12 positions.

---
# Régime de marché — W43 2026-09-24 (archivé)

- **✅ RÉGIME SURCHAUFFE HARD-CONFIRMÉE — INCHANGÉ**. T10Y **~5,12 %** (post-FOMC, tendance haussière). S&P 500 ~7 699 (légère hausse depuis 7 552 post-FOMC). DXY stable ~100. Cash **~35,8 % NAV** = corridor 30-50 % ✓. Pas de nouvelle confirmation macro cette semaine (pas de print BLS/CPI/NFP — prochain FOMC **27-28 octobre 2026**).
- **⚡ BNP.PA ex-div AUJOURD'HUI 24/09 (€3,23, paiement 28/09)** — correction d'une erreur mémoire (précédents fichiers notaient 23/09). Position 3,7222 parts → +€12,02 cash (automatique au 28/09).
- **⚠️ IIJA Division J expire le 30/09** (6 jours) — aucun bill de réautorisation. Surveiller avant jeudi Portfolio Doctor 25/09 si possible.
- **⚠️ GLE.PA — CONTRAINTE CASH** : entrée Moyenne (~7 % NAV) prévue vendredi 26/09 MAIS cash post-entrée = ~28,8 % NAV < plancher 30 %. Entrée possible uniquement en **Basse (~3 % NAV)** pour rester dans le corridor, ou reporter. Décision vendredi.
- **Nouveau thème W43** : Choc d'offre Hormuz (Brent $120+, XLE +40 % YTD) → demande sécurité énergétique US → **substituts (nucléaire CEG, infra ETN, défense LMT) en début de re-rating**. LMT −3,6 % YTD (non-parabolique). Falsifiable : accord US-Iran.
- **Gates signals.js W43** : AI.PA passe 🟠 (1er relevé — hystérésis 2 relevés : cap 5 % NAV applicable mais pas de trim mécanique avant 2e relevé consécutif) ; LOTB passe 🟠 (même logique). Toutes autres positions : 🟢 maintenues. Memo §H : 2 relevés consécutifs 🟠 + 2pts NAV de dépassement → trim vers 5 % NAV.
- **Discordance signals.js / override** : `signals.js` lit RISK-ON SAIN (FRED lag). Override manuel SURCHAUFFE prime (FOMC hike acté + T10Y 5,12 % + dot plot hawkish).
- **Sources** : engine/signals.js 2026-09-24 ; web search XLE/Brent/Hormuz ; engine/crypto.js 2026-09-24.

---
## Tendance de la semaine — 17 septembre 2026 (W42, Deep-dive)

- **Tendance W43** : VALIDÉE — Choc Hormuz → Sécurité énergétique US (substituts CEG/ETN/LMT). Financials/NIM W42 : phase exécution CB détenu, GLE.PA 26/09 (Basse contrainte cash).
- **✅ FOMC 16/09 — HIKE +25 bps à 3,75-4,00 %** (12-0, 1er hike depuis 2023), **dot plot hawkish** (16/18 des membres voient ≥1 hausse de plus en 2026, médiane 2026 relevée à 4,1-4,4 %, neutre LT ~3,0 %). Warsh presser hawkish (« inflation too high for too long »). **Réaction : T10Y clôture ~5,01 % (plus haut depuis 2007)**, DXY +0,61 % à 100,28, S&P −0,45 % (~7 552, 3e séance de baisse), **banques US −2,6 % (KBE, peur « plus de hikes »)**. → **SURCHAUFFE désormais HARD-CONFIRMÉE** (plus un override de jugement, un fait acté). Cash floor 30 %, plafond 50 % maintenus. Verrou d'entrée levé pour CB (bénéf. NII float) + GLE.PA — décision vendredi. Sources : Fed statement 16/09 ; CNBC/TheStreet 16/09 ; Investrade DXY.
- **Cadran** : **SURCHAUFFE CONFIRMÉE** (override + FOMC hike acté). NFP août +162K (05/09), PCE 3.7-4.1% (Warsh JH 28/08), **CPI août +0.4% MoM, +3.4% YoY** (BLS 11/09). T10Y **~5,01 %** (post-FOMC, plus haut depuis 2007). USD haussier. 4e confirmation macro consécutive.
- **⚡ CORRECTION FOMC DATE** : Meeting Fed = **15-16 septembre 2026**, annonce **16/09 à 14h ET** (source : FedRateCalc / Cambridge Currencies). Les conditions CB + GLE.PA sont déclenchables **dès le 16/09** si hike confirmé.
- **✅ CPI août 11/09 CONFIRMÉ** : +0.4% MoM, +3.4% YoY. Énergie +2.1% MoM. SURCHAUFFE validée. Override CONFIRMÉ.
- **⚠️ Divergence FOMC : futures vs marchés prédictifs**. Futures/options (Fed funds): ~80-87% hike 25bps. Prediction markets (Kalshi): 26% hike / 73% hold. Divergence réelle — résultat binaire incertain. Hike = CB/GLE.PA entrée possible 16/09. Hold = garder cash corridor.
- **BCE hike 10/09 (+25bps → 2.50%)** : NIM expansion directe pour BNP.PA, GLE.PA. Zone euro hawkish confirmée.
- **⚠️ Divergence algo/override** : `signals.js` lit RISK-ON SAIN (FRED lag). Override manuel SURCHAUFFE prime. All 10 gates 🟢 (W41).
- **Consigne au système** : **plancher cash 30%, plafond 50%** — cash actuel **~41% NAV** = DANS LE CORRIDOR. Aucun déploiement avant décision FOMC 16/09. P-001/P-002/P-003 actifs.
- **GVA rebond** : GVA ~$125.37 (15/09, range $122.76-$126.63) vs $118.92 (12/09) → +5.4% en 3 jours depuis RSI 28.4 survendu. Thèse intacte. **⚠️ NOUVEAU RISQUE : IIJA Division J expire le 30/09** — Congressional Funding Impasse (article 14/09). Aucun bill de réautorisation présenté. Surveiller avant exit_rule 11/12. GS PT $119 intégré par le marché ($125.37 > $119 = rebond outperformance).
- **BNP.PA** : ~112.60€ (15/09 — source web vs 103.76€ le 12/09). Ex-div **24/09** (€3.23 — correction : 23/09 était erroné). Forte hausse confirmée (NIM + FOMC narrative).
- **Energy surge** : Énergie +22% YTD (XLE). Pétrole (Brent ~$90) sur tensions Middle East (Détroit d'Ormuz). Hors book — radar.
- **Positions book IA — gates au 15/09 (signals.js W41)** :
  - **SAF.PA** 🟢 +0.418 RSI39.3 · 2.0929 parts · mom +26%
  - **AMZN** 🟢 +0.236 F5/9 RSI48 · 3.1138 parts · mom +15%
  - **EIMI** 🟢 +0.519 RSI55.8 · 9.7751 parts · mom +27%
  - **AI.PA** 🟢 RSI48.7 · 3.0794 parts · mom +6% · *gates 🟢 W41 (vs 🟠 W40, artefact FMP résolu?)*
  - **LOTB** 🟢 RSI26.5 (survendu) · 0.0394 parts · mom +49%
  - **BNP.PA** 🟢 RSI38.8 → ~112.60€ · 3.7222 parts · Ex-div 23/09
  - **MSCI** 🟢 F7/9 RSI44.9 · 1.36 parts · mom −2%
  - **CEG** 🟢 F6/9 RSI59 · 2.465 parts · mom −16% (T10Y headwind)
  - **GVA** 🟢 F7/9 RSI38.4 · 6.57 parts · ~$125.37 (rebond +5.4%) · ⚠️ IIJA Div.J 30/09
  - **EME** 🟢 F6/9 RSI51 · 1.09 parts · mom +33%
- **Crypto (radar 15/09)** : BTC 67,690€ / 58.5% dominance (+2.1% 24h / +23.9% 30j) · ETH 2,177€ / 11.4% dominance (+1.9% 24h / +33.5% 30j) · XRP +41.7% 30j · F&G 69 (Greed) → lecture contrarienne, caution. Altcoin season sentiment. FOMC hike demain = potentiel headwind CT crypto (USD fort).
- **Macro (3 lignes)** :
  - US : NFP août +162K / CPI +0.4% / T10Y ~4.65%. FOMC décision **16/09** : futures ~80-87% hike vs prediction markets 26%. S&P 500 : 7629 pts (14/09), -0.37% session, -1.5% mois, +15.3% an. Chipmakers en correction.
  - Zone euro : BNP.PA ex-div 23/09. SAF.PA H1 marge record. EUR/USD ~1.155-1.165. BCE hawkish (taux 2.50%).
  - Override SURCHAUFFE VALIDÉ. Cash corridor 30-50%. Energy surge (Brent $90 / Middle East). Tech headwind (XLK -2.43% YTD).
- **NAV book IA** : ≈ **10 379€** (−0.37% vs start_capital, dernier calculé 12/09). 10 positions actives. 0 trades W41 (avant FOMC).
- **Sources** : FedRateCalc / Cambridge Currencies (FOMC 15-16/09) ; AdvisorPerspectives 14/09 ; Kalshi prediction markets ; engine/signals.js 2026-09-15 ; CoinGecko 15/09 ; Trading Economics S&P 500 ; Kalkine Energy/Financials performance.
---
## Tendance de la semaine — 5 septembre 2026 (W38)

- **Statut** : VALIDÉE — SURCHAUFFE CONFIRMÉE, ROTATION FINANCIALS/BANQUES
- **Tendance** : NFP août +162K écrase le consensus (+56K) et valide la narrative hawkish. T10Y 4.823%. FOMC 17/09 : ~52% hike. La rotation SURCHAUFFE classique est en place : **Financials/Banques EU = bénéficiaires directs du cycle de hausse de taux** (NIM expansion). BNP.PA (détenu, RSI 31 survendu) et CB (Chubb, conditionnel CPI 09/09) représentent ce thème.
- **Preuves dures** :
  1. NFP août 2026 : +162 000 vs consensus +56K (×2.9). BLS 05/09. Unemployment 4.1% (inchangé). Révisions June +11K / July +44K.
  2. T10Y spike : 4.746% → **4.823%** (+8bps sur le print NFP). Source : Investing.com 05/09.
  3. BNP.PA Q2 2026 : +33% net income (déjà publié et confirmé) — NIM thèse bancaire intacte. Gate 🟢 +0.462. RSI 31 (survendu = rebond CT potentiel).
  4. FOMC 17/09 : ~52% hike → ECB/Fed en mode restrictif prolongé → NIM des banques EU (BNP, SG, KBC) en expansion systémique.
- **Durabilité** : Conditionnelle au CPI 09/09 (si MoM ≤ 0.1% → shift HOLD → NIM moins favorable). Structurelle si hike confirmé.
- **Stade** : Début. NFP beat du jour est le premier déclencheur. CPI 09/09 + FOMC 17/09 = validation complète.
- **Manières de la jouer** :
  - **BNP.PA** (détenu, 3.8% NAV, RSI 31 survendu) — bénéficiaire NIM rate hike. Rebond CT attendu. NE PAS RENFORCER en SURCHAUFFE (corridor cash respecté).
  - **CB (Chubb)** — assureur P&C, NII $100B float, gate à recalculer, conditionnel CPI 09/09. Taille cible Moyenne = 7% NAV si CPI confirme SURCHAUFFE.
  - **Surveiller** : SG.PA, KBC, Handelsbanken pour un éventuel deep-dive post-FOMC si hike confirmé.
- **Ce qui tuerait la thèse** : CPI 09/09 MoM ≤ 0.1% (désinflation surprise → Fed Hold → NIM plateaux). FOMC HOLD 17/09 avec forward guidance dovish.
- **Sources** : BLS NFP août 2026 (05/09) ; Investing.com T10Y 4.823% ; engine/signals.js 2026-09-05 ; CME FedWatch ~52% hike ; BNP.PA Q2 2026 communiqué.

---

## Tendance de la semaine — 1 septembre 2026 (W37)

- **Statut** : AUCUNE cette semaine — PIVOT DE RÉGIME (SURCHAUFFE)
- **Tendance** : Aucune tendance sectorielle assez solide identifiée. L'événement majeur de W37 est le basculement du régime (Warsh hawkish Jackson Hole 28/08 → 57% hike FOMC 17/09 vs 91% cut) — un événement DE RÉGIME, pas une tendance SECTORIELLE investissable.
- **Pourquoi AUCUNE** : En régime SURCHAUFFE, la barre pour valider une tendance est plus haute. Trois candidats analysés : (1) Supercycle power-grid — fragilisé par pivot Warsh + incertitude IIJA. (2) Healthcare défensif — pas de catalyseur systémique commun. (3) Financials/Banks NIM — conditionnel hike 17/09 (57% probable, pas acquis). Tous refusés.
- **Note** : W38 valide la tendance Financials/Banks (NFP +162K confirme le contexte).
- **Sources** : engine/signals.js 2026-09-01 ; Warsh Jackson Hole 28/08 ; CME FedWatch ; IIJA statut NACo.

---

## Tendance de la semaine — 29 août 2026 (W36)

- **Statut** : VALIDÉE — CONTINUATION W35 · NVDA Q2 BEAT ✓ · thèse intacte
- **Tendance** : Supercycle power-grid (continuation structurelle) — NVDA Q2 FY27 BEAT confirmé 26/08. ENR.DE ne re-rate pas sur NVDA beat (3e confirmation §K). Extension IIJA Senate 90-6, Chambre vote 03/09 → 11/12.
- **Sources** : engine/signals.js 2026-08-29 ; NVDA Q2 FY27 (confirmé convictions 27/08) ; EME convictions 27/08 ; IIJA NACo/Holland & Knight.

---

## Tendance de la semaine — 25 août 2026 (W35)

- **Statut** : VALIDÉE — CONTINUATION W34 · Jalon NVDA Q2 demain · IIJA extension Senate
- **Tendance** : Supercycle power-grid (continuation structurelle).
- **Sources** : engine/signals.js 2026-08-25 ; ENR.DE Q3 FY26 IR ; NVDA Q2 preview ; IIJA NACo.

---

## Tendance de la semaine — 18 août 2026 (W34)

- **Statut** : VALIDÉE — CONTINUATION + PRÉCISION
- **Tendance** : Supercycle power-grid : inflexion fondamentale ENR.DE (EBITA tripled Q3) + NVDA Q2 comme prochaine confirmation.
- **Sources** : Siemens Energy Q3 FY26 IR ; ETN partnership ; NVDA Q1 FY27.

---

## Tendance de la semaine précédente — 11 août 2026 (W33)

- **Statut** : VALIDÉE → CONTINUÉE W34
- **Tendance** : Supercycle power-grid — l'électricité est le nouveau goulot d'étranglement de l'IA.
- **Sources** : Hyperscalers Q2 2026 calls ; S&P Global utility capex ; EMEA grid UBS.

---

## Tendance de la semaine précédente — 8 août 2026 (W32)

- **Statut** : CONTINUATION + DÉVERROUILLAGE
- **Tendance** : RISK-ON SAIN + IIJA accélération → Déploiement sur thèses confirmées Q2.
- **Sources** : BLS CPI juin ; AMZN/SAF.PA/MSCI Q2 2026 ; engine/signals.js 2026-08-08.

---

# Archives — tendance semaine 2026-07-07 (W29)

- **Statut** : CONFIRMÉE W32 (CRH Q2 beat ✓, FOMC hold ✓, CPI 3.5%)
- **Tendance** : Plateau des taux + IIJA accélération → Rotation Infrastructure US.

---

# Archives — tendance semaine 2026-06-30 (W27)

- **Statut** : CONTINUATION STRUCTURELLE — Medicare Bridge opérationnel, ré-entrée NOVOB conditions non réunies.
- **Tendance** : Healthcare / GLP-1 — Medicare Bridge + Rotation défensive.

---

# Archives — tendance semaine 2026-06-23 (W26)

- **Statut** : CONTINUATION — CEG détenu (§G gouverne)
- **Tendance** : Infrastructure IA / Énergie nucléaire — PPA fixes comme défense.

---

# Archives — tendance semaine 2026-06-13

- **Statut** : VALIDÉE (continuation via infra-IA)
- **Tendance** : Réarmement européen — cycle pluriannuel accéléré. SAF.PA renforcé 08/08 (S1 record ✓).
