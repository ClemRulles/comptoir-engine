# Régime de marché — mis à jour le 2026-09-08 (Trend Radar W39)

- **Cadran** : **SURCHAUFFE CONFIRMÉE** (override maintenu). NFP août +162K (05/09), PCE 3.7-4.1% (Warsh JH 28/08), FOMC 17/09 **~66% hike** (CME FedWatch post-NFP). T10Y **4.65%** (repli depuis pic 4.823% post-NFP — modération partielle, pas pivot). USD haussier post-NFP. VIX 15.23 (légèrement élevé). S&P 500 ~7 718 (flat semaine, marché fermé lundi 08/09 = Labor Day — 1er jour de trading: mardi 09/09).
- **⚠️ Divergence algo/override** : `signals.js` lit RISK-ON SAIN (FRED asof 09/04, avant NFP ; cpi_yoy FRED = 3.3%). Override manuel SURCHAUFFE basé sur NFP +162K + PCE 3.7-4.1% (cité par Warsh) + FOMC 66% hike. Override prime : les données macro-réelles post-NFP surclassent le lag FRED. L'algorithme sera recalibré post-CPI 11/09.
- **Consigne au système** : **plancher cash 30%, plafond 50%** — cash actuel **41.9% NAV** = DANS LE CORRIDOR. Aucun déploiement. Sélectivité maximale. P-001/P-002/P-003 actifs. 10 positions actives. 0 trades W39 à ce stade.
- **⚡ CORRECTION DATE** : CPI août 2026 publié le **vendredi 11 septembre** (BLS, 8h30 ET) — pas le 09/09 comme précédemment noté. Verrou décisif FOMC 17/09 maintenu. Consensus CPI août : **+0.3% MoM** (vs +0.1% en juillet — plus chaud), YoY ~3.4-3.5%.
- **Valorisation** : Financials/Banks = leaders SURCHAUFFE (NIM expansion). Energy +22% Q3 (XLE ATH). Tech growth = discount rate headwind (T10Y 4.65%). Infrastructure long-duration (CEG, GVA, EME) = vent de face T10Y.
- **⚠️ GVA radar** : Goldman Sachs a dégradé GVA en Sell (juillet 2026), PT $139 → $119. Motifs : opérational improvement déjà pricé, IIJA tailwinds ralentissent (federal-aid highway commitments -23% sous pics 2023, -4% YTD). Stock à $119 (AT GS target). Exit_rule non déclenchée (backlog >$6.5B, marge >10% à vérifier Q3 22/10). Signaler jeudi Portfolio Doctor.
- **BNP.PA dividende intermédiaire** : €3.23/action en cash le **28 septembre 2026** (ex-div ~23/09). Catalyseur CT positif, position 3.72 parts ≈ +€12 cash additionnel.
- **Positions book IA — gates au 08/09 (signals.js W39)** :
  - **SAF.PA** 🟢 RSI **27.1** (survendu extrême ⚠️), mom+27% · 2.0929 parts ≈ 6.8% NAV
  - **AMZN** 🟢 F5/9 RSI47.2, mom+17% · 3.1138 parts ≈ 6.8% NAV · cours ~$258
  - **EIMI** 🟢 RSI59.4, mom+30% · 9.7751 parts ≈ 4.6% NAV. USD fort = vent de face EM.
  - **AI.PA** 🟢 RSI62, mom+8% · 3.0794 parts ≈ 5.1% NAV · rebond RSI depuis survendu
  - **LOTB** 🟢 RSI45.5, mom+35% · 0.0394 parts ≈ 4.7% NAV. RSI normalisé.
  - **BNP.PA** 🟢 RSI33.8 (survendu), mom+45% · 3.7222 parts ≈ 3.8% NAV. **Div €3.23 le 28/09.** NIM bénéficiaire FOMC hike.
  - **MSCI** 🟢 F7/9 RSI65.7, mom+2% · 1.36 parts ≈ 6.6% NAV · seuil réexamen $401
  - **CEG** 🟢 F6/9 RSI64.6, mom−13% · 2.465 parts ≈ 5.9% NAV · cours ~$284 (−5% depuis NFP, T10Y headwind)
  - **GVA** 🟢 F7/9 RSI30.4 (survendu), mom+12% · 6.57 parts ≈ 6.6% NAV · cours ~$119 (GS PT=target) · ⚠️ surveiller Portfolio Doctor
  - **EME** 🟢 F6/9 RSI **25.4** (survendu extrême ⚠️) · 1.09 parts ≈ 6.9% NAV · cours ~$754
- **Crypto (radar)** : BTC 59.1% dominance / ETH 11.3% / F&G **69 (Greed)** → lecture contrarienne = caution. Hors scope book.
- **Macro (3 lignes)** :
  - US : NFP août +162K (×2.9 vs consensus). PCE 3.7-4.1% (Warsh). T10Y 4.65%. FOMC 17/09 : **~66% hike** 25bps. CPI août **11/09** = verrou.
  - Zone euro : BNP.PA Q2 +33.4% NI, div €3.23 le 28/09. SAF.PA H1 marge record confirmée. EUR/USD ~1.155-1.165. BCEhawkish de fond.
  - Override SURCHAUFFE VALIDÉ : NFP + PCE + FOMC odds prime sur signal FRED en lag. Cash 41.9% dans corridor. Aucun déploiement avant CPI 11/09 + FOMC 17/09.
- **NAV book IA estimée** : ≈ **10 160-10 300€** (estimation — recalcul précis vendredi Brief). Cash 4 290.86€ = 41.9% NAV. 10 positions actives. 0 trades W39.
- **Sources** : BLS NFP août 2026 (05/09) ; CME FedWatch ~66% hike post-NFP ; Forbes/CME 31/08 (66%) ; T10Y 4.65% (Investing.com) ; VIX 15.23 ; S&P 500 7718 ; Goldman Sachs GVA downgrade (juillet 2026) ; BNP.PA communiqué div €3.23 ; engine/signals.js 2026-09-08.
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
