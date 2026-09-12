# Brief du vendredi — 12 septembre 2026 (W40)

> Généré par la routine nocturne du Comptoir Engine. Sources : BLS CPI août 2026 (11/09, Fox Business/CNBC/Kiplinger) ; engine/signals.js 2026-09-12 00:02 UTC ; engine/guard.js (ok, 0 réparations) ; engine/grok.js (0 résolutions ce run) ; engine/forecasts.js (0 scénarios à scorer).

---

## 🌡 Régime de marché : SURCHAUFFE CONFIRMÉE

**CPI août 2026 : +0.4% MoM, +3.4% YoY** (BLS 11/09/2026). Plus chaud que le consensus +0.3%. 3e confirmation macro consécutive :

1. NFP août +162K (05/09) — 2.9× consensus
2. PCE 3.7-4.1% / Warsh hawkish (28/08)
3. **CPI août +0.4% MoM (11/09)** ← nouveau

FOMC 17/09 : probabilité hike estimée **~75-80%** (vs 66% pré-CPI). Override SURCHAUFFE **MAINTENU**.

signals.js diverge : RISK-ON SAIN (FRED lag) → override market-regime.md prime. Cash corridor 30-50%.

---

## 📊 Book IA — état au 12/09/2026

**NAV estimée : ~10 379€** (−0.37% vs start_capital 10 417€, EUR/USD ~1.10).
**Cash : 4 291€ — 41.3% NAV → dans corridor SURCHAUFFE (30-50%). Aucun déploiement requis.**

| # | Ticker | Gate | Contrib | Action | Note |
|---|--------|------|---------|--------|------|
| 1 | SAF.PA | 🟢 +0.418 | 6.65% | GARDER | RSI 30.1 survendu |
| 2 | AMZN | 🟢 +0.236 | 7.00% | GARDER | F5/9, thesis Q3 oct. |
| 3 | EIMI | 🟢 +0.519 | 4.77% | GARDER | EM ETF, thesis intacte |
| 4 | **AI** | **🟠 +0.183** | **4.94%** | **GARDER** | **Lecture 1/2 — hystérésis** |
| 5 | LOTB | 🟢 +0.462 | 4.51% | GARDER | RSI sain |
| 6 | BNP.PA | 🟢 +0.462 | 3.72% | GARDER | Ex-div 23/09 → +€12 |
| 7 | MSCI | 🟢 +0.529 | 6.60% | GARDER | F7/9, meilleur gate |
| 8 | CEG | 🟢 +0.392 | 6.15% | GARDER | §G gouverne |
| 9 | **GVA** | **🟢 +0.612** | **6.84%** | **GARDER** | **RSI 28.4, insider 2B/0S** |
| 10 | EME | 🟢 +0.468 | 7.45% | GARDER | EPS +25.3%, thesis ✓ |

**0 trades cette semaine.** Aucune position clôturée.

### Détail AI 🟠 — lecture 1/2 (hystérésis active)
Gate composite +0.183 < seuil 🟢 (0.20). Cause : revenue_growth FMP −35.7% — **artefact documenté** (même signal observé 18/06/2026, leçon AI/DATA : attribution d'actions + FX produit ce type de résultat en données FMP annuelles). ROIC H1 2026 +10.2% confirmé. Falsificateurs non déclenchés (volumes non coupés, F-Score > 3, ROIC > 8%). Position 4.94% NAV < cap 5% 🟠 → **aucun rognage même en cas de confirmation**. Surveillance mercredi.

### Détail GVA — meilleur gate + survendu
Gate 🟢 +0.612 (F7/9, insider 2B/0S). RSI 28.4 = survendu extrême. Stop USD < $96 (cours $118.92 → marge +23.8%). Thèse IIJA intacte (extension 11/12). Horizon-test Q3 22/10.

### CB et GLE.PA — pendants FOMC
CPI ≥ +0.3% confirmé (condition 1/2). **FOMC 17/09 non encore tranché** (condition 2/2). Aucune entrée avant le 17/09.

---

## 📅 Prochains catalyseurs

| Date | Événement | Impact |
|------|-----------|--------|
| **17/09** | FOMC (~75-80% hike) | Déclencheur CB + GLE.PA si hike |
| **22/09** | Grok W37 BNP+GVA expiration (horizon 09/15, scoring lundi) | Calibration grok |
| **23/09** | BNP.PA ex-div €3.23 | +€12.02 cash book IA |
| **22/10** | GVA Q3 2026 | Horizon-test thèse |
| **11/12** | Expiration IIJA | Surveiller réautorisation |

---

## 📈 Tendance W40 : CONTINUATION — Financials EU / NIM Expansion

**Statut : VALIDÉE — FINANCIALS EU / NIM EXPANSION · CPI +0.4% > consensus +0.3%**

CPI août +0.4% renforce le scénario hike FOMC 17/09. Tendance en phase milieu (NFP → CPI → FOMC comme jalons). Thèse NIM expansion intacte. BNP.PA ex-div 23/09 = catalyseur CT confirmé.

**FOMC 17/09 = prochain jalon décisif.** Si hike → évaluer CB (P&C NII float $100B) + GLE.PA (NIM EU). Cash corridor à réévaluer post-FOMC.

Ce qui tuerait la thèse : FOMC HOLD + forward guidance dovish (improbable avec CPI +0.4%) ; choc crédit EU ; chômage US > 4.5%.

---

## 🎯 Grok W40 (scoring — non tradés, tactical_cap=0)

- `fomc-sept-hike-w40` : FOMC 17/09 hike confirmé. Conf. 0.72. Horizon 17/09.
- `gva-oversold-rebound-w40` : GVA rebond technique (RSI 28.4 survendu, gate fort). Conf. 0.65. Horizon 22/09.

---

## ⚙️ Moteur

- guard.js : ok (0 réparations)
- signals.js : 🟢9 🟠1(AI) 🔴0 — 13 data gaps (EU tickers, FRED partial)
- grok.js : 0 résolutions (W37 calls expirent 15/09)
- forecasts.js : 0 scénarios actifs
- Calibration : inchangée (0 clôtures cette semaine, n_conviction=1)
