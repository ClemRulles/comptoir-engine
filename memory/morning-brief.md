# Brief du vendredi — 2026-08-15 (W33)

**Régime : RISK-ON SAIN** | VIX 14.63 | T10Y2Y 0.51 | CPI 3.5% (US) / 2.7% (EU HICP) | EUR/USD 1.152 | Cash floor : **5%**

---

## 1. PASSE 1 — Leçons et scoring W33

### Position clôturée : CRH (14/08)

| Champ | Valeur |
|-------|--------|
| Entrée | 102.39€ / 27 juin 2026 |
| Sortie | 84.81€ / 14 août 2026 |
| P&L net | **−17.67%** (−129.17€ après frais) |
| Benchmark IWDA.AS | +3.98% (04/06→14/08) |
| Alpha | **−21.65%** |
| Confiance annoncée | Moyenne |
| Hit ? | Non |
| Thèse cassée ? | Non — Q2 beat $2.21/$2.03 ✓, guide EBITDA FY26 maintenu |
| Raison sortie | exit_rule pré-enregistrée : gate slip 🟢→🟠 (DERNIER override déclenché) + stop USD $107.37 toujours franchi |

Décision ajoutée à decisions.json (#10). Calibration Moyenne : n=6→7, avg_return −19.53%→−19.26%, avg_alpha −17.55%→−18.13%.

### Grok calls
Aucun call ouvert. Aucune résolution cette semaine. hit_rate=40% stable (2/5 résolus, tactical_cap=0). Prochains calls : cibler situations RSI survendu + catalyseur daté (RSI AI.PA 27.3 → surveiller rebond avant d'appeler).

### Forecasts
0 scénario actif. pocket_cap=10% disponible, non utilisée.

### Calibration
- Moyenne : n=7, avg_return=−19.26%, avg_alpha=−18.13% (n<8, pas d'ajustement §I)
- Global : 10 décisions, toutes négatives. NAV ≈ −0.54% vs start_capital. Benchmark IWDA.AS +3.98%.
- Note : 9/10 sorties sont des exits gate-forcés. 0/10 positifs. N'ajuster le sizing qu'à n≥8 par bucket (~sept-oct 2026).

---

## 2. PASSE 2 — Trades exécutés vendredi 15/08

### 2 trades exécutés

| Ticker | Action | Qté | Prix | Gate | Frais | Net | Raison |
|--------|--------|-----|------|------|-------|-----|--------|
| AI.PA | VENTE (trim) | −1.130 parts | 168.26€ | 🟠 +0.090 RSI 27.3 | 0.57€ | +189.56€ cash | Cap 5% §H : position 6.9%→5.0% NAV |
| GVA | ACHAT | +6.57 parts | 110.33€ | 🟢 +0.577 F7/9 | 2.17€ | −727.04€ cash | Rotation CRH→GVA, pivot marge livré |

**Cash** : 5 795.31€ + 189.56€ − 727.04€ = **5 257.83€** (50.7% NAV)

### Décisions non prises
- **SAF.PA** (🟠 +0.159, RSI 78.5) : cap 5% déjà respecté (1.4509 parts = 5.05% NAV). Aucune action requise.
- **LOTB** (🟢 +0.385, RSI 87.9 extrême) : position petite (4.68% NAV), gate 🟢 — pas de cap 5%. Surveiller.
- **BNP.PA** (🟢 +0.259, RSI 81.6) : ne pas renforcer en suracheté malgré gate 🟢. Thèse conservée.
- **NOVOB** hors book (gate 🟠) : données Medicare Q2 attendues mi-août — ré-entrée conditionnelle.

### État des positions (15/08)

| Ticker | Parts | Cours | % NAV | Gate | Stop | Statut |
|--------|-------|-------|-------|------|------|--------|
| SAF.PA | 1.4509 | 360.5€ | 5.05% | 🟠 +0.159 RSI 78.5⚠️ | 290.85€ | ✅ Cap 5% OK. Thèse S1 record ✓ intacte. |
| AMZN | 3.0478 | $262.65 | 6.71% | 🟢 +0.240 RSI 65 | $212.45 USD | ✅ AWS +37% Q2 ✓. GARDER. |
| EIMI | 9.775 | $54.60 | 4.47% | 🟢 +0.615 RSI 62 | — | ✅ Section 301 neutre. ETF EM solide. |
| AI.PA | 3.079 | 168.26€ | 5.00% | 🟠 +0.090 RSI 27.3 | 152.03€ | ✅ TRIM exécuté → cap 5% §H. RSI survendu. |
| LOTB | 0.0394 | 12 320€ | 4.68% | 🟢 +0.385 RSI 87.9⚠️ | — | ⚠️ RSI extrême. Compounder. Surveiller. |
| BNP.PA | 3.722 | 112.10€ | 4.03% | 🟢 +0.259 RSI 81.6⚠️ | — | ⚠️ RSI suracheté. Q2 +33% ✓. Ne pas renforcer. |
| MSCI | 1.36 | $569.13 | 6.49% | 🟢 +0.602 RSI 48.4 | $540.54 USD | ✅ Rétention 95.3% ✓. RSI sain. Meilleur gate. |
| CEG | 2.465 | $282.50 | 5.83% | 🟢 +0.327 RSI 59.8 | 232.29€ | ✅ §G. Falsificateurs Q2 non déclenchés ✓. |
| GVA | 6.57 ★ | $127.10 | 6.99% | 🟢 +0.577 F7/9 RSI 53.1 | $116.93 USD | ★ NOUVEAU. Pivot marge livré, backlog $7.4B. |
| **Cash** | — | — | **50.7%** | — | — | Plancher 5% très largement respecté. |

**NAV estimée : ~10 360€** (−0.54% vs start_capital 10 417€)

---

## 3. PASSE 3 — Tendance et brief marché

### Tendance W33 : Infrastructure électrique IA — VALIDÉE (inchangée)

**Thèse en une ligne** : L'électricité est le nouveau goulot d'étranglement de l'IA — les équipementiers de réseau entrent dans un supercycle de commandes à visibilité pluriannuelle alors que le bottleneck se déplace des chips vers la puissance.

**Ce que cette semaine confirme** :
1. **GVA entré au book** (rotation CRH→GVA) : pivot marge Q2 12.8% LIVRÉ ✓, data centers cités, même thème IIJA mais gate frais F7/9 et +17x fwd. La rotation valide la discipline : sortir = abandonner le _véhicule_, pas la thèse.
2. **Régime RISK-ON SAIN maintenu** : VIX 14.63 (avidité), CPI 3.5%, T10Y2Y 0.51. Aucune surchauffe visible.
3. **Hyperscalers** : aucun falsificateur déclenché depuis 4 semaines. CEG et GVA sont sur les bonnes thèses.
4. **RSI extrêmes** : 3 positions en zone suracheté (LOTB 87.9, BNP.PA 81.6, SAF.PA 78.5) — elles ont bien performé mais la discipline de sizing prime (ne pas renforcer).

**Ce qui tuerait la tendance** :
1. Réduction >20% capex hyperscaler 2 trimestres consécutifs → sortie CEG / GVA
2. IIJA non réautorisé FY2027 (vote automne) → sortie GVA immédiate (exit_rule pré-enregistrée)
3. CPI rebondit ≥ 4.5% → rebasculement SURCHAUFFE → cash floor 30% (plancher de sécurité)

### Watchlist (priorités)
- **NOVOB** : données adoption Medicare Q2 attendues mi-août. Ré-entrée si gate 🟢 + RSI<65 + adoption >5% éligibles.
- **ETN** : Surveiller à 28-30x fwd (~$375-385). Aucune entrée à 34x actuel (P-003 : gate élevé ≠ acheter).
- **NEX.PA** : Surveiller — gate 🟠, Power en normalisation Q2. Attendre repli + gate 🟢 (backlog €7.7B intact).

---

## 4. Catalyseurs des 5 prochaines semaines

| Date | Événement | Impact book |
|------|-----------|-------------|
| **~mi-août 2026** | NOVOB Q2 données adoption Medicare | Ré-entrée possible si gate 🟢 + RSI<65 + adoption >5% |
| **~septembre 2026** | GVA Q3 résultats | Test pivot marge (guide 12.25-13.25%) + backlog $7.4B+ stable |
| **30/09/2026** | Falaise IIJA FY2026 | Binaire fort pour GVA. Sans réautorisation FY2027 → sortie immédiate |
| **Automne 2026** | Vote Congrès IIJA FY2027 | Signal sortie GVA si non réautorisé. Risque majeur de thèse |
| **~novembre 2026** | FOMC | En RISK-ON SAIN : coupe possible H1 2027 si CPI continue ↓. Favorable CEG/GVA |

---

## En une phrase

**RISK-ON SAIN confirmé, 2 trades exécutés (AI.PA trim cap §H + rotation CRH→GVA), book 9 positions / 50.7% cash / NAV −0.54% — benchmark IWDA.AS +3.98%, alpha cumulé ≈ −4.5% à combler par la qualité des convictions actives (GVA pivot livré, MSCI gate 🟢 fort, CEG §G intact).**

---

## Revue hebdomadaire W33

**Ce qui s'est passé** : CRH sorti 14/08 (3 déclencheurs simultanés : gate slip, DERNIER override, stop USD — thèse intacte mais règle prime). SAF.PA trimmé 14/08 (RSI suracheté, cap 5% verdict Opus). AI.PA trimmé 15/08 (gate 🟠 DÉGRADÉ, cap 5% mécanique). GVA acheté 15/08 (rotation, pivot livré, F7/9, 17x fwd). 

**Ce qui n'a pas bougé** : Tendance W33 électricité/IA inchangée — GVA EST la tendance (data centers + IIJA). MSCI, CEG, AMZN, EIMI : positions stables, pas d'action requise.

**Niveau de confiance global** : Moyen. 4 positions en zone RSI à surveiller. Le cash à 50.7% est à la fois une sécurité et un coût d'opportunité : le déploiement progressif (GVA 7% + éventuellement NOVOB) est la voie vers l'alpha si les thèses se confirment sur les 2 prochains trimestres. Benchmark trail ≈ −4.5% depuis seed — récupérable sur Q3-Q4 si IIJA + nucléaire + compounders livrent.

---

## Archive — Brief du 2026-08-08 (W32)

*(archivé le 15/08/2026 — contenu complet dans le commit précédent)*

**Régime : RISK-ON SAIN** | VIX 15.15 | T10Y2Y 0.46 | CPI 3.5% | EUR/USD 1.152 | Cash floor : 5% (était 30%)

3 trades exécutés 08/08 : SAF.PA BUY +0.57 / AMZN BUY +0.53 / AI.PA BUY +1.70 — déploiement sur thèses Q2 confirmées. Cash : 4 986.26€ (48.1% NAV). Tendance W32 Infrastructure US/IIJA continuation renforcée.
