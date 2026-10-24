# Comptoir Engine — Brief W54 — vendredi 24 octobre 2026

**Régime** : SURCHAUFFE override (T10Y ~5,08-5,15 % > seuil 4,7 %). Signaux RISK-ON SAIN (13🟢 2🟠 0🔴). FOMC 27-28/10 HOLD à 83 %.

---

## PASSE 1 — Apprentissage de la semaine

**Attribution (attribution.js)**
- 25 % des ventes passées étaient au-dessus du prix de vente (regret moyen −8,1 %) — signal que le book vend trop tôt sur correction technique plutôt que sur cassure de thèse.
- Desk industrie-énergie : latent −8,6 % (SAF.PA + cluster capex pèsent).
- Desk conso : latent +21 % (LOTB tient bien, compounder qualité).
- Desk tech : latent +3,7 % (CRM récent, AMZN en récupération).

**Grok (grok.js)**
- 19 appels résolus, hit_rate 47 %, brier 0,266.
- Budget tactique 3 % NAV. Aucun appel ouvert. Aucune résolution ce run.

**Leçons (→ lessons.md)**
1. SAF.PA aftermarket T3 +17 % < seuil exit +20 % → jurisprudence 2T (même règle que MSCI) : un seul trimestre sous le seuil avec guidance maintenue ne déclenche pas la sortie cœur.
2. Seuil annualisé > seuil trimestriel : c'est la trajectoire annuelle qui compte, pas un trimestre isolé décalé par un effet de mix ou de timing.

---

## PASSE 2 — Book management

### SAF.PA — 8e 🟠 consécutif — **GARDER**

**Q3 CA publié 23/10 :** €9 003M (+14,7 % / +13,4 % organique) — léger beat consensus (€8 990M).
- Propulsion : +13,2 % organique. Aftermarket civil : **+17 % en USD** (< seuil exit +20 % YoY mais 1T isolé).
- Services (contrats à l'heure de vol LEAP) : +19 %.
- LEAP livraisons : 535 unités T3, +5 % YoY. Cumulé 9M : 1 565 livraisons, +26 %.
- **Guidance FY maintenue** : croissance CA ~+15 %, ROC €6,4-6,5B. Cible aftermarket annuelle mid-20s réaffirmée.
- Réaction marché : −6 % (shift reconnaissance LEAP-1B → 2027 = timing, non structurel).

**Analyse thèse :** seuil exit "aftermarket LEAP < +20 % YoY" → T3 +17 % = borderline mais (a) 1T isolé, (b) guidance FY mid-20s maintenue, (c) LEAP-1B décalage est comptable pas opérationnel. Jurisprudence MSCI (2T requis) s'applique. **Thèse marginalement fragilisée mais non cassée.**

Position : 2,0929 parts × ~285 € = €596 ≈ 6,0 % NAV. Cap 🟠 = 5 % NAV. Gap ≈ 1 pt < 2 pts → hystérésis non déclenchée pour trim.

**DÉCISION : GARDER. ⚠️ Si 9e 🟠 W55 AND aftermarket 9M cumulé < +20 % → saisine mercredi 28/10 OBLIGATOIRE.**

---

### CEG — **🟢 — GARDER**

Signal revenu vert (F6/9, mom −32 %, RSI 49,2, cov 92 %). La crainte d'un premier flip amber s'avère non fondée sur le run du jour. Momentum −32 % = correction CT mais fondamentaux intacts. P-004 maintenu. Pas d'action.

---

### GLE.PA — 🟠 **premier flip** — **GARDER**

Premier relevé amber après 2 semaines 🟢. Hystérésis non armée (2 consécutifs requis). Position 4,75 parts × 64,91 € ≈ €308 = 3,1 % NAV < cap 5 %. Q3 29/10 = horizon-test (ROTE ≥8 %). Pas d'action.

---

### MSCI — 🟢 RSI 84,4 — **GARDER**

Gate vert F7/9, RSI suracheté mais thèse intacte (Q3 rétention 95,0 % ✓, 2T requis pour sortie). Pas d'action.

---

### CB — 🟢 RSI 82,0 — **GARDER**

Gate vert F6/9, combined ratio 84,1 % ✓. Thèse intacte.

---

### TRADE W54 — **BUY EIMI SOCLE : +9,78 parts @ €46,00**

**Obligation :** cash 16,5 % > plafond 15 % + socle 8 % vs cible 12 % + vol 11 % < plancher 13 %. Règle les 3 alertes risk.js en un geste (soupape §H correcte).

| Champ | Valeur |
|-------|--------|
| Ticker | EIMI (iShares Core MSCI EM IMI) |
| Sens | BUY socle |
| Parts | +9,78 @ €46,00 |
| Frais | €0,50 |
| Total | €450,38 |
| Nouvelle quantité | 26,42512 parts |
| Nouvel avg_cost | €44,36 |
| Socle post-trade | ~12,5 % NAV (vs cible 12 %) |
| Cash post-trade | €1 197,48 (~12 % NAV) ✓ |

RSI EIMI = 21,5 (survendu) + mom +25 % (tendance YoY solide) = entrée favorable.

---

### RTX — **DIFFÉRÉ post-read capex 30/10**

AMZN/MSFT Q3 capex guidance attendue ~30/10. Décision vendredi 31/10 (ou lundi 02/11 si résultats tardifs). Condition : capex 2027 ≥ niveau 2026. Budget ~€400, ~4 % NAV, source = cash résiduel. Ne pas financer par SAF.PA (P-003 : intra-secteur défense = rotation stérile).

---

### BMY — **SURVEILLER · Q3 le 29/10**

Conditionnel §J : Growth Portfolio ≥+15 % YoY + Milvexian on-track → acheter demi-taille ~3 % NAV. Ne pas pré-positionner avant publication.

---

## PASSE 2bis — Vérification risque post-trade

| Indicateur | Avant | Après | Alerte |
|-----------|-------|-------|--------|
| Cash | 16,5 % | 12,0 % | ✅ corridor 5-15 % |
| Socle | 8,0 % | 12,5 % | ✅ cible 12 % |
| Coeur | 76 % | ~75 % | ✅ max 75 % |
| Vol book | 11 % | ~11,5 % | ⚠️ encore sous plancher 13 % (toléré, résidu du book défensif) |
| NAV | €9 977 | €9 977 | — |

Alertes résiduelles : vol encore légèrement < 13 % (tolérable sans forcer un single-stock en SURCHAUFFE).

---

## PASSE 3 — Contexte macro & risques

**Macro**
- T10Y : ~5,08-5,15 % (sous peak 5,35 % du 10/10 mais > seuil override 4,7 %).
- FOMC 27-28/10 : HOLD 83 %. NFP sept. +62K faible + CPI 3,7 % = frein au hike immédiat. Hike déc. ~75 % mais pas déterminant cette semaine.
- NIM CB/BNP.PA/GLE.PA : thèse LT intacte.

**Cluster capex-IA (P-004)**
GVA + CEG + EME + AMZN = ~26 % NAV, ~50 % book risk. CEG momentum −32 % = surveillance. P-004 hard cap 4 noms : gel maintenu. Décision RTX (30/10) peut ouvrir trim CEG ou EME si capex cut > 15 %.

**Risques prioritaires**
1. **Hyperscaler capex ~30/10** : falsificateur P-004. AMZN+MSFT+GOOGL capex guidance → si coupe >15 % → réexamen simultané GVA/CEG/EME/AMZN.
2. **SAF.PA aftermarket décelère** : 8e 🟠 + T3 +17 %. Si 9e 🟠 → saisine W55.
3. **FOMC surprise hawkish** (< 17 % probabilité) : hike +25bps → taux longs spike, correction book.
4. **GVA IIJA** : Division J expirée 30/09, backlog contrats fermes protégé mais Q3 ~05/11 = test final.

---

## Prochaines échéances

| Date | Événement | Impact |
|------|-----------|--------|
| 27-28/10/2026 | FOMC (HOLD 83 %) | Macro toutes positions |
| 29/10/2026 | ICE Q3 (récurrent ≥47 % CA) | ICE (détenu) |
| 29/10/2026 | GLE.PA Q3 (ROTE ≥8 %) | GLE.PA (détenu) |
| 29/10/2026 | BMY Q3 (conditionnel) | Entrée possible ~3 % NAV |
| ~30/10/2026 | AMZN/MSFT capex Q3 | Décision RTX + P-004 falsificateur |
| ~05/11/2026 | GVA Q3 | Horizon-test critique (IIJA) |
| 11/12/2026 | IIJA vote final | Exit GVA si non voté |

---

*Généré automatiquement — routine W54 — 24/10/2026 — engine v2*
