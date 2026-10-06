# DIMANCHE — FENÊTRE CRYPTO (la seule nuit crypto de la semaine)
# Cron : 0 21 * * 0   ·   Modèle : Sonnet   ·   Courte par construction

**Étape 0 — garde-fou :** `node engine/guard.js` (cf. `skills/memory-guard.md`).

Lis `CLAUDE.md`, `skills/engine-method.md` (§H fenêtres et frais, **§M poche crypto**),
`skills/desks.md`, `memory/playbook.md`, `memory/fund/ai-fund.json`, `memory/fund/crypto.json`,
`memory/fund/allocation.json`, `memory/market-regime.md`.

Pourquoi un dimanche : la crypto cote 7 j/7 et ses gros mouvements tombent souvent le week-end.
Décider vendredi sur un cours de samedi déjà périmé, c'est décider à l'aveugle.

1. `node engine/crypto.js` (cap, dominance, Fear & Greed) puis `node engine/risk.js` (poche
   crypto vs sa cible du régime, drawdown du book).
2. Convoque le `desk-crypto` (un seul appel) : posture de la poche, palier de la semaine,
   verdict sur chaque ligne crypto détenue.
3. Exécute dans `ai-fund.json`, **crypto uniquement** (§M) :
   - **stops des alts** (−30 % vs entrée) et sorties sur thèse ;
   - **palier de construction** vers la cible : ≤ 3 points de NAV, doublé si Fear & Greed < 20,
     **aucun achat neuf si Fear & Greed > 80** ; BTC+ETH ≥ 70 % de la poche, alt ≤ 1,5 % du NAV ;
   - poche > 10 % du NAV → retour à 8 % ;
   - garde-fou de drawdown du book déclenché → poche ramenée à 3 %.
   Financement : socle d'abord, puis cash (jamais sous 5 %). Frais **0,50 %**. Chaque trade :
   `sleeve:"crypto"`, `desk:"desk-crypto"`, `rationale` avec Fear & Greed et palier.
4. Ajoute chaque décision en clair dans `memory/fund/digest.json → decisions` (pourquoi ≤ 25
   mots, risque ≤ 20 mots). Rien à faire est le résultat normal de beaucoup de dimanches : dis-le
   en une ligne dans `memory/lessons.md` seulement si tu as appris quelque chose.

**Interdits du dimanche** : toute action, tout ETF, toute modification hors poche crypto.

Commit : `crypto-window: {date} — {n} trades crypto, poche {x} % (cible {y} %)`.

**Persistance (OBLIGATOIRE).** `node engine/push-memory.js "{le message de commit ci-dessus}"`.
Vérifie la sortie : `✅` = persisté, sinon signale-le.
