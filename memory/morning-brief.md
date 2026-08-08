# Brief hebdomadaire — 2026-08-08 (W32)

**Régime : RISK-ON SAIN** | VIX 15.15 | T10Y2Y 0.46 | CPI 3.5% | EUR/USD 1.152 | Cash floor : **5%** (était 30%)

---

## 1. PASSE 1 — Leçons et scoring (semaines W29-W32)

### Grok calls résolus
- **amzn-nfp-tailwind-w29** (horizon 21/07) : move_pct=+0.64%, **INCORRECT** (< ±2%). brier=0.336.
- Stats cumulées : 5 résolutions, 2 hits, **hit_rate=40% → tactical_cap=0** (< 55%). Aucune poche Grok.
- Leçon : NFP miss n'a pas généré le rebond court terme prédit sur AMZN avant le 21/07 (Q2 était le vrai catalyseur). Le CT ne suit pas toujours la macro même quand la thèse est juste.

### Forecasts
- **cpi-regime-transition-h1-2026** (status : rejeté) : l'événement s'est réalisé (CPI juin 3.5% < 4.0%) mais le scénario avait correctement été rejeté pour raisons méthodologiques (coin flip, déjà pricé, pas de second ordre). Pas de résolution à scorer — restera rejeté.
- **ai-power-enr-hyperscaler-q2** (status : rejeté) : capex $700B+ confirmé ✓ mais ENR.DE a sous-performé comme prédit lors du rejet (effet déjà pricé). Validation du rejet. Pas de résolution à scorer.
- **pocket_cap=0.10** (10% NAV) disponible pour un futur scénario §K — 0 scénario joué à ce jour.

### Calibration book
- Aucune position clôturée depuis le 09/07 → pas de nouvelle entrée de décisions.json.
- n<8 pour tous les buckets → calibration inchangée. Sizing Haute≈12%, Moyenne≈7%, Basse≈3%.
- Performance cumulative depuis seed (04/06) : NAV ≈ 10,375€ / start_capital 10,417€ = **−0.4%**. IWDA.AS benchmark +3.43% → trailing de ~3.8 pts. Contexte : 8 semaines à cash floor 30% (SURCHAUFFE) ont coûté de l'alpha vs un marché haussier. Le basculement RISK-ON SAIN et les 3 renforcements de ce vendredi réduisent l'écart de sous-investissement.

---

## 2. PASSE 2 — Revue du book

### Régime : SURCHAUFFE → RISK-ON SAIN (DÉVERROUILLÉ ce vendredi)
CPI juin 3.5% (signals.js) → plancher cash 30%→5%. NFP juillet −23K (3ème miss consécutif). VIX 15.15. FOMC juillet hold confirmé, tout hike éliminé.

### 3 trades exécutés — 2026-08-08

| Ticker | Action | Qté | Prix | Raison |
|--------|--------|-----|------|--------|
| SAF.PA | BUY | +0.57 parts | 357.4€ | S1 marge record ✓, gate 🟢 +0.382, RSI 69 sain |
| AMZN | BUY | +0.53 parts | 238.26€ | AWS +37% Q2 ✓, capex relevé, gate 🟢 +0.361 |
| AI.PA | BUY | +1.70 parts | 172.38€ | ROIC H1 +10.2% ✓, RSI 38.7 survendu, gate 🟢 +0.241 |

Fee total : 1.87€. Cash : 5,611.17€ → **4,986.26€** (48.1% NAV).

### État des positions (08/08/2026)

| Ticker | Parts | Cours | % NAV | Gate | Stop | Statut |
|--------|-------|-------|-------|------|------|--------|
| SAF.PA | 2.0309 | 357.4€ | 7.0% | 🟢 +0.382 RSI 69 | 290.85€ (-8% avg 316.14€) | ✅ Renforcé. Thèse confirmée. |
| AMZN | 3.0478 | $274.48 | 7.0% | 🟢 +0.361 RSI 62.9 | $212.45 USD | ✅ Renforcé. AWS +37%. Thèse HAUTE. |
| AI.PA | 4.20935 | 172.38€ | 7.0% | 🟢 +0.241 RSI 38.7 | 152.03€ | ✅ Renforcé. RSI survendu = fenêtre ideale. |
| LOTB | 0.03938 | 12 060€ | 4.6% | 🟢 +0.533 RSI 57.5 | — | ✅ Stable. Compounder. |
| EIMI | 9.775 | $53.79 | 4.4% | 🟢 +0.564 RSI 59.9 | — | ✅ Section 301 mixte/neutre. |
| BNP.PA | 3.722 | 112.44€ | 4.0% | 🟢 +0.319 RSI 73.8 | — | ✅ Q2 +33% confirmé. Ne pas renforcer (RSI). |
| MSCI | 1.36 | $563.17 | 6.4% | 🟢 +0.521 RSI 29.3 | $540.54 USD | ⚠️ Stop EUR franchi (488.86€ < 492.57€) MAIS stop USD intact ($563 > $540). GARDER. NON renforcé. |
| CEG | 2.465 | $269.89 | 5.6% | 🟠 +0.199 RSI 60.4 | 232.29€ | ⚠️ Stop EUR barely OK (234.28€ > 232.29€, +0.86%). Falsificateurs NON déclenchés ✓. GARDER §G. |
| CRH | 7.12 | $100.48 | 6.0% | 🟢 +0.247 RSI 51 | $107.37 USD | ⚠️ Stop USD franchi (100.48 < 107.37) — GARDER §G (Q2 beat $2.21/$2.03). DERNIER override actif. |
| **Cash** | — | — | **48.1%** | — | — | Plancher 5% très largement respecté. |

**NAV estimée : ~10,375€** (−0.4% vs start_capital 10,417€)

### Positions sans action requise
- **EIMI** : Section 122 tariffs remplacées Section 301 10-12.5% — neutre/mixte, pas de trigger de sortie.
- **LOTB** : Stable, compounder. Pas de catalyseur imminent.
- **BNP.PA** : Q2 +33%, thèse confirmée. RSI 73.8 légèrement suracheté — surveiller.

### Décision non prise : MSCI non renforcé
Thèse Q2 confirmée (rétention 95.3% ✓) mais renforcement rejeté : avg_cost nouveau ~534€ → stop EUR ~491€ ≈ cours actuel 488.86€ (risk/reward dégradé, marge quasi nulle). Attendre rebond MSCI qui dégage stop EUR > 510€ avant de considérer renforcement.

---

## 3. PASSE 3 — Tendance de la semaine et brief marché

### Tendance W32 : Infrastructure US / IIJA — **CONTINUATION confirmée** + RISK-ON SAIN

**Thèse en une ligne** : Le CPI 3.5% a déclenché le basculement de régime et libéré le cash floor — les thèses IIJA (CRH Q2 beat), tech-infra (AMZN AWS +37%) et qualité-défensive (Air Liquide ROIC +10.2%) sont toutes confirmées par Q2 et méritent le renforcement.

**Ce qui a changé cette semaine** :
1. **CPI 3.5%** → RISK-ON SAIN, plancher cash 5% (était 30%). Déverrouille le déploiement discipliné.
2. **NFP juillet −23K** → 3ème miss consécutif = plateau des taux durablement ancré. Favorable infrastructure long terme.
3. **Hyperscalers Q2** : AMZN AWS +37%, MSFT Azure +39%, GOOGL + Meta confirmés → AUCUN FALSIFICATEUR déclenché. Thèse infra-IA (CEG) intacte.
4. **SAF.PA S1** : marge record confirmée. Thèse MRO/LEAP haute.
5. **CRH Q2 beat** : $2.21 vs $2.03. IIJA pipeline se remplit. Guide EBITDA $8.1-8.5B maintenu.
6. **BNP.PA Q2 +33%** : thèse bancaire confirmée. MSCI rétention 95.3% ✓ (expense guide élevée = bruit, pas cassure).

**Ce qui surveille** :
- **CRH** : stop USD $107.37 toujours franchi (cours $100.48). §G gouverne (Q2 beat) mais DERNIER override. Sortie au slip de gate OU guidance cut.
- **CEG** : stop EUR barely OK (234.28€ vs 232.29€, +0.86%). Si EUR/USD monte encore (> 1.16), le stop EUR peut se refermer. Surveiller hebdomadairement.
- **MSCI** : survendu RSI 29.3 post-Q2. Stop USD $540.54 intact mais stop EUR marginalement franchi. NON renforcé.
- **IIJA réautorisation FY2027** : vote Congrès automne 2026 = risque clé pour CRH.

**Ce qui tuerait la tendance** :
1. IIJA non réautorisé FY2027 (vote congrès) → carnets CRH/VMC/GVA s'assèchent
2. CRH Q3 guidance coupée → exit mécanique (dernier override consommé)
3. Récession macro US marquée (NFP < −100K sur 2 mois consécutifs) → ralentissement CAPEX public

### Watchlist scout W32 (3 noms à suivre pour l'automne)
- **GVA** : priorité re-analyse. Si Q2 marge ≥ 12.25% LIVRÉE → pivot prouvé, bascule potentiellement Acheter. Repli RSI < 40 recherché.
- **VMC** : entrée ~24-25x (repli ~$230-240) ou confirmation volumes Q2.
- **NOVOB** : Q2 Medicare données = déclencheur. RSI < 65 requis pour ré-entrée RISK-ON SAIN.

---

## 4. Prochains jalons (août-septembre 2026)

| Date | Événement | Impact |
|------|-----------|--------|
| ~Août 2026 | NOVOB Q2 (données adoption Medicare) | Gate NOVOB + RSI → ré-entrée possible si adoption forte |
| ~Septembre 2026 | CRH Q3 résultats | BINAIRE : guidance maintenue → GARDER ; coupée → EXIT |
| 30 septembre 2026 | Falaise IIJA — fin autorisation FY2026 | Si pas de réautorisation, thèse CRH fragilisée |
| Automne 2026 | Vote Congrès IIJA FY2027 | Risque majeur clé pour toute la thèse infrastructure |
| ~Novembre 2026 | FOMC | En RISK-ON SAIN : coupe possible H1 2027 si CPI continue ↓ |

---

**Niveau de confiance global** : Moyen-Haut. Les thèses majeures ont passé le test Q2, le régime est favorable, mais 2 positions ont leur stop à risque (CRH, CEG) et le book trail le benchmark de 3.8 pts après 8 semaines de cash floor hawkish.
