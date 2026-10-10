# Brief hebdomadaire — W50 — 10 octobre 2026

## Régime & posture

**SURCHAUFFE HARD-CONFIRMÉE** (override T10Y ~5,21 %, FOMC 27-28/10 ~73 % hike Goldman Sachs).
Signals.js W50 : RISK-ON SAIN (FRED lag — override prime). Book : 13 positions, **11🟢 / 1🟠 (SAF.PA) / 0🔴**.

Cash post-trades vendredi : **€2 674 ≈ 26 % NAV** (cible 10 %, plafond 15 % — encore +11 pts à déployer).

---

## PASSE 1 — Apprentissage

### Grok W50 : 2 calls résolus, hit_rate 0,444

| Call | Ouvert | Direction | Clôture | Résultat |
|------|--------|-----------|---------|----------|
| `gva-iija-expiry-w44` | 26/09 | baisse | $115,08 → $112,50 (−2,24 %) | ✅ CORRECT — brier 0,16 |
| `cb-oversold-rebound-w44` | 26/09 | hausse | ~$333 → $341,20 (+2,46 %) | ✅ CORRECT — brier 0,16 |

**Stats grok actualisées** : 18 résolus · 8 hits · hit_rate **0,444** · brier moyen 0,270.
Tactical cap = **0 %** (seuil 0,45 non atteint, 1 hit manquant). 1 call ouvert : `ceg-oversold-nuclear-w45` (horizon 13/10).

**Leçon** : les deux patterns RSI survendu extrême + fondamental F6-7/9 intact ont livré. La série CORRECT Grok est quasi-systématiquement cette combinaison.

### Positions clôturées depuis W49

Aucune. Pas de P&L réalisé à scorer. Calibration mensuelle non-applicable (10e jour du mois).

### Attribution W50 (audit régime)

Aucune sortie → attribution non calculée cette semaine. Prochain calcul si sortie jeudi (Doctor).

---

## PASSE 2 — Gestion du book

### Trades exécutés vendredi

| Ticker | Action | Qté | Prix EUR | NAV% | Gate | Rationale |
|--------|--------|-----|----------|------|------|-----------|
| **CRM** | Acheter Moyenne | 2,47 | €208,30 ($229,13) | ~5,0 % | 🟢 +0,551 F7/9 | Salesforce : ARR AI/Data pivot, multi comprimé ~26x P/FCF vs pairs 32-36x, buy zone $185-240 ✓ |
| **ICE** | Acheter Moyenne plafonnée | 2,47 | €139,54 ($153,49) | ~3,35 % | 🟢 +0,485 F7/9 | ICE : récurrent FI&Data >47 % CA, moat réglementaire NYSE/données hypothèques, MSCI+ICE ≤10 % NAV ✓ |

**Cash déployé** : €861,73. **Cash restant** : €2 674 (~26 % NAV).

### Non-décision : SAF.PA (hystérésis)

SAF.PA 2e relevé consécutif 🟠 W50. Hystérésis §H : gap = 6,36 % − 5 % = **1,36 pts < seuil 2 pts** → **TRIM ZÉRO**. Thèse MRO/LEAP intacte (S1 record ✓, LEAP 520+). Surpoids jugé bruit. Monitoring W51 : si 3e relevé 🟠 ET gap > 2 pts → trim vers 5 %.

### Gates W50 sur le book (résumé)

| Ticker | Gate W50 | Note |
|--------|---------|------|
| SAF.PA | 🟠 | 2e consécutif — hystérésis armée, trim non déclenché |
| GVA | 🟢 | F7/9 — P-001 $115,08 < $116,93 toujours actif. Q3 ~05/11 horizon-test |
| CB | 🟢 | Q3 ~20/10 — test thèse combined ratio + NII |
| MSCI | 🟢 | F7/9, MSCI+ICE now 10 % NAV |
| CEG | 🟢 | F6/9, Grok ceg-oversold-nuclear-w45 horizon 13/10 |
| EME | 🟢 | F6/9, RPO $17,14B intact |
| AMZN | 🟢 | F5/9, AWS +37 % Q2 ✓ |
| BNP.PA | 🟢 | F6/9, FOMC 27-28/10 = catalyseur NIM direct |
| CRM | 🟢 | F7/9 — NOUVEAU, entrée vendredi |
| ICE | 🟢 | F7/9 — NOUVEAU, entrée vendredi |
| AI.PA | 🟢 | Compounder gaz industriels |
| LOTB | 🟢 | RSI élevé — vigilance valo PER |
| EIMI | 🟢 | ETF EM socle |
| GLE.PA | 🟢 | sous-taille 0,66 % NAV, Q3 ~29/10 |

### Allocation post-trades (estimée)

- **NAV** ≈ €10 250 (estimation, node risk.js à recalculer lundi)
- **Cash** : €2 674 (~26 %)  — cible 10 %, plafond 15 %
- **Sleeves** : cœur ~70 %, socle ~4,5 % (EIMI), tactique 0 %, crypto 0 %
- **Concentration capex-IA** : GVA+CEG+EME+AMZN ≈ 27-28 % NAV (inchangé, CRM+ICE diversifient)
- **Top risques** : FOMC 27-28/10 (T10Y/USD impact CEG/GVA), CB Q3 20/10 (combined ratio), GVA Q3 05/11

---

## PASSE 3 — Tendance de la semaine

### Tendance W50 : Compounders financiers sous-valorisés (ICE, MSCI)

**Statut** : VALIDÉE → exécutée (ICE acheté).

La bascule de mandat (cash cible 10 %) a libéré un déploiement discipliné vers des compounders financiers dont l'infrastructure de marché est quasi-régulée (ICE = NYSE + données hypothèques, MSCI = indices). Ces noms n'appartiennent pas au cluster capex-IA (P-004 validé) et bénéficient directement du régime SURCHAUFFE (T10Y élevé = NII ICE pour le float, volumes plus élevés sur les marchés).

**Ce qui invaliderait** : récession crédit (tarit les volumes boursiers et les émissions hypothèques) OU BCE/Fed pivot dovish agressif (comprime NIM).

---

## Catalyseurs à 14 jours

| Date | Événement | Positionnement |
|------|-----------|---------------|
| 13/10 | Score Grok `ceg-oversold-nuclear-w45` (horizon) | CEG détenu — résolution lundi |
| 20/10 | CB Q3 résultats | Test thèse combined ratio + NII (seuil : ratio ≤ 95 %, NII intact) |
| 27-28/10 | FOMC décision taux | 73 % hike Goldman — BNP/CB gagnants directs, CEG/GVA vent de face |
| ~20/10 | RTX Q3 (watchlist ★) | Hors book, surveiller pour ré-activation éventuelle |

---

## Mémo sizing W51

- Budget déploiement ≤ 10 pts NAV / semaine
- Cash disponible après W50 : ~26 % NAV → ~11 pts encore au-dessus du plafond 15 %
- Candidats prioritaires W51 : (1) renforcer GLE.PA si gate 🟢 confirmé 2e consécutif (~2,5-3 % NAV) ; (2) scout nouveau titre (Healthcare ou Consumer ou Industrials hors capex-IA) ; (3) pas de capex-IA (P-004 en vigueur)
- SAF.PA : monitoring 🟠 — pas de renforcement, pas de trim si gap < 2 pts

---

*Sources : engine/signals.js W50 10/10 · grok-calls.json résolutions manuelles W50 · ai-fund.json post-trades · convictions.md W49 (CRM + ICE, 08/10) · allocation.json estimation post-trades*
