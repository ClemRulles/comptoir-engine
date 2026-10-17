# Morning Brief — Vendredi 17 octobre 2026 (W51)

**Régime :** SURCHAUFFE override inchangée — signals.js lit RISK-ON SAIN ; T10Y ~5,21-5,25 % prime.
**NAV IA :** 10 179 € (post-trades) · Cash : 1 647 € (**16,1 %** — encore ↑ plafond 15 %, prochaine semaine)
**Drawdown courant :** −1,37 % vs pic 10 320 € · Garde-fou : NON déclenché

---

## Trades exécutés ce soir (3)

| Trade | Ticker | Opération | Qté | Prix | Coût | Logique |
|-------|--------|-----------|----:|-----:|-----:|---------|
| 1 | **GLE.PA** | Renforcement (+Basse→3 % NAV) | +3,74 parts | 64,60 € | 242 € | 2e🟢 consécutif (W50+W51), sous-taille corrigée, cash déploiement §H |
| 2 | **AZZ** | Nouvelle entrée (Moyenne ~4,5 % NAV) | +3,68 parts | 125,15 € (~$137,66) | 462 € | Deep-dive 15/10 : beat EPS FY27 $2,00 (+29 %), diversifiant NON capex-IA |
| 3 | **EIMI** | Socle top-up (socle 4,5 %→7,6 % NAV) | +6,87 parts | 46,78 € | 322 € | Sous-pondération socle (cible 12 %) — priorité risk-manager |

**Total déployé W51 :** 1 026 € ≈ **10 pts NAV** (plafond §H respecté)
**Cash résiduel :** 1 648 € (16,1 % NAV — 1 pt au-dessus du plafond, à continuer W52)

### P-004 formalisé ce soir
Gel cluster capex-IA **à 4 noms hard cap** (GVA + CEG + EME + AMZN). Aucune 5e ligne capex-IA tant que cette règle est active. Falsificateur commun : coupe capex hyperscaler >15 % → réexamen des 4 simultanément.

### Desk/sector labels — RENSEIGNÉS pour toutes les 15 lignes
Correction majeure du process : `desk_multipliers` (§L / attribution.js) maintenant opérationnels.

---

## État du book (15 lignes, 15 actives)

| Ticker | Poche | Gate | Poids | Desk | Catalyseur imminent |
|--------|-------|------|------:|------|---------------------|
| CB | cœur | 🟢 F6/9 | 7,4 % | desk-finance | **Q3 lundi 20/10** — horizon-test |
| EME | cœur | 🟢 F6/9 +0,457 | 7,0 % | desk-industrie-energie | Q3 oct. 2026 |
| AMZN | cœur | 🟢 F5/9 +0,285 | 6,9 % | desk-tech | **Q3 ~29-30/10** — ne pas renforcer avant |
| MSCI | cœur | 🟢 F7/9 +0,602 | 6,9 % | desk-finance | **Q3 lundi 20/10** — horizon-test (rétention ≥93 %) |
| SAF.PA | cœur | **🟠** | 6,5 % | desk-industrie-energie | S2 résultats nov. 2026 ; saisine W52 |
| GVA | cœur | 🟢 F7/9 +0,583 | 6,3 % | desk-industrie-energie | **Q3 ~05/11** ; IIJA pluriannuel avant 11/12 |
| CEG | cœur | 🟢 F6/9 +0,304 | 5,9 % | desk-industrie-energie | Q3 résultats oct.-nov. |
| AZZ | cœur | 🟢 F7/9 +0,623 | **4,5 % (NEW)** | desk-industrie-energie | Q3 FY27 ~janv. 2027 |
| CRM | cœur | 🟢 F7/9 +0,551 | 5,3 % | desk-tech | Q3 FY27 nov. 2026 |
| AI | cœur | 🟢 | 5,2 % | desk-industrie-energie | H2 2026 |
| LOTB | cœur | 🟢 | 5,0 % | desk-conso | Q3 oct. 2026 |
| EIMI | socle | 🟢 | 7,6 % | desk-macro | ETF, pas d'horizon-test |
| ICE | cœur | 🟢 F7/9 +0,485 | 3,4 % | desk-finance | **Q3 29/10** — horizon-test |
| BNP.PA | cœur | 🟢 | 3,3 % | desk-finance | Q3 nov. 2026 |
| GLE.PA | cœur | 🟢 RSI25,6 | **3,0 % (+renf.)** | desk-finance | **Q3 29/10** — horizon-test |

**Cluster capex-IA (P-004) :** GVA + CEG + EME + AMZN = 26,1 % NAV / ~55-60 % du risque → gel confirmé.

---

## Allocation post-trades

| Poche | Poids actuel | Cible | Statut |
|-------|:-----------:|:-----:|--------|
| Cœur | 76 % | 60 % | ⚠ > max 75 % → rééquilibrer (déployer socle/crypto W52+) |
| Socle | 8 % | 12 % | En cours de déploiement (étaient 4,5 %, objectif multi-semaines) |
| Tactique | 0 % | 10 % | Bloquée (tactical_cap Grok = 0 %) |
| Crypto | 0 % | 8 % | Non ouvert |
| Cash | **16 % ⚠** | 10 % | 1 pt > plafond 15 % — à continuer W52 (≤10 pts/semaine) |

**Vol book :** 11 %/an (plancher 13 % non atteint — amélioration vs 9,6 % semaine dernière).
**Risques concentrés :** EME 18 % du risque / CEG 17 % — justifiés par thèses intactes (cf. revue 15/10).

---

## Catalyseurs semaine prochaine

| Date | Événement | Position concernée | Décision pré-enregistrée |
|------|-----------|--------------------|--------------------------|
| **Lun 20/10** | CB Q3 résultats | CB (7,4 % NAV) | GARDER si combined ratio < 95 % + NII intact. SORTIR si combined > 95 % 2T ou NII coupé ≥10 % |
| **Lun 20/10** | MSCI Q3 résultats | MSCI (6,9 %) | GARDER si rétention ≥93 %. SORTIR si rétention < 93 % ou PE > 42x sans accel. |
| **Lun 20/10** | RTX Q3 résultats | RTX (watchlist) | ARMER position si book-to-bill ≥ 1,0 et backlog solide — entrée mercredi 22/10 sinon reporte |
| **Mer 22/10** | SAF.PA — saisine W52 | SAF.PA (6,5 %) | 4e🟠 consécutif — saisine OBLIGATOIRE : gate flip 🟢→🟠 + gap > 2 pts → trim si 5e |
| **Jeu 29/10** | ICE Q3 | ICE (3,4 %) | GARDER si récurrent ≥45 % et FI&Data positif |
| **Jeu 29/10** | GLE.PA Q3 | GLE.PA (3,0 %) | GARDER si ROTE ≥8 % et NII intact |
| **Jeu 29/10** | BMY Q3 | BMY (watchlist) | ACHETER ~3 % NAV si Growth Portfolio ≥+15 % et Milvexian sans glissement |
| **27-28/10** | FOMC | Book entier | HOLD quasi-certain (~66-75 %) ; aucun repositionnement anticipé |
| **~05/11** | GVA Q3 | GVA (6,3 %) | GARDER si backlog ≥$6,5B + guide marge 12,25-13,25 % |

---

## SAF.PA hystérésis — situation

- W48 16/10/2026 : **4e🟠 consécutif** (composite +0,X, cov 39 %, RSI 31,9)
- Gap actuel vs cap 5 % : 1,64 pts NAV < **seuil hystérésis 2 pts** → pas de trim automatique
- **Règle §H** : trim déclenché seulement si 5e🟠 consecutif ET gap ≥ 2 pts
- **Saisine mercredi W52 (23/10) OBLIGATOIRE** pour réévaluer avant signal suivant

---

## Grok — pas de coup ce soir

- `tactical_cap = 0 %` (hit_rate 47,4 % < seuil 55 %)
- Dernier call résolu : ceg-oversold-nuclear-w45 → CORRECT (19 résolus, 9 hits)
- Aucun scénario §K validé — droit au blanc

---

## Tendance de la semaine

**Solidité des fondamentaux dans un book sous-investi qui se déploie.**
Les 3 achats de ce soir n'achètent pas de momentum ou de narrative — ils corrigent un déséquilibre structurel (cash 26 % → 16 %, socle 4,5 % → 7,6 %, GLE.PA sous-taille depuis l'entrée). AZZ est le seul achat conviction pur : compounder galvanisation qui livre (+29 % EPS, marges Metal Coatings 30,7 %) dans un book surchargé de facteur capex-IA — il diversifie là où le book en avait le plus besoin.

---

*Routine W51 — vendredi 17 octobre 2026 · SURCHAUFFE override · Prochaine routine : docteur mercredi 22/10 (saisine SAF.PA + horizons-tests CB/MSCI/RTX post-20/10)*
