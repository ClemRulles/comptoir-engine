# Portefeuille du groupe — état au 2026-06-04 (t0 de la course)

Positions réelles encodées depuis Trade Republic. **NAV des positions ≈ 6 309 €**, courtier
~100 % investi (cash ≈ 0 hors apports). La colonne « Depuis achat » = perf TR au moment du seed.
Le book IA hérite de ces positions à l'identique (clone à t0) puis gère seul ; voir
`memory/fund/ai-fund.json`. Le Portfolio Doctor (jeudi) met à jour Statut / Règle de sortie.

| Ticker | Nom | Valeur € | Poids % | Depuis achat | Coût base € | Horizon | Statut | Règle de sortie | Vérifié le |
|--------|-----|---------:|-------:|------------:|------------:|---------|--------|-----------------|-----------|
| SAF.PA  | Safran                | 732,81 | 11,6 | −8,99 %  | 805,20 | cœur | — | thèse cassée si cycle aéro/MRO se retourne | 2026-06-04 |
| HO.PA   | Thales                | 723,41 | 11,5 | −10,14 % | 805,04 | cœur | — | sortie si budgets défense EU décélèrent nettement | 2026-06-04 |
| AMZN    | Amazon                | 703,31 | 11,1 | +16,83 % | 602,00 | cœur | — | sortie si croissance AWS + marge retail se cassent | 2026-06-04 |
| NFLX    | Netflix               | 632,58 | 10,0 | −14,75 % | 742,03 | cœur | — | sortie si stagnation abonnés + pricing power perdu | 2026-06-04 |
| EIMI    | MSCI Emerging Markets (ETF) | 449,46 | 7,1 | +12,09 % | 401,00 | cœur | — | rebalancement, pas de thèse single-stock | 2026-06-04 |
| AI.PA   | Air Liquide           | 436,31 | 6,9 | +8,39 %  | 402,54 | cœur | — | compounder : sortie si ROIC/volumes se dégradent durablement | 2026-06-04 |
| LOTB.BR | Lotus Bakeries        | 418,88 | 6,6 | +39,16 % | 300,99 | cœur | — | valo tendue : alléger si DCF inversé devient irréaliste | 2026-06-04 |
| BYD     | BYD                   | 407,08 | 6,5 | +1,52 %  | 401,08 | cœur | — | sortie si guerre des prix EV écrase les marges | 2026-06-04 |
| CI2     | MSCI India Swap EUR (ETF, Acc) | 359,69 | 5,7 | −10,30 % | 401,00 | cœur | — | rebalancement, exposition macro Inde | 2026-06-04 |
| BNP.PA  | BNP Paribas           | 333,83 | 5,3 | +32,47 % | 252,00 | cœur | — | sortie si taux/risque crédit cassent la thèse banque | 2026-06-04 |
| SGO.PA  | Compagnie de Saint-Gobain | 294,06 | 4,7 | −16,57 % | 352,46 | cœur | — | cyclique : sortie si cycle construction se retourne | 2026-06-04 |
| SAP     | SAP                   | 238,15 | 3,8 | −40,61 % | 401,00 | cœur | À SURVEILLER | grosse moins-value : revoir la thèse cloud/RISE | 2026-06-04 |
| NOVOB   | Novo-Nordisk (B)      | 234,11 | 3,7 | −22,26 % | 301,15 | cœur | À SURVEILLER | thèse GLP-1 sous pression concurrence — réévaluer | 2026-06-04 |
| MSTR    | MicroStrategy (A)     | 200,39 | 3,2 | −50,15 % | 402,00 | tactique | À SURVEILLER | proxy bitcoin très volatil ; stop si prime NAV s'effondre | 2026-06-04 |
| RMS.PA  | Hermès                | 145,18 | 2,3 | −28,06 % | 201,81 | cœur | — | luxe premium : sortie si pricing power/désir de marque faiblit | 2026-06-04 |

**Total : 6 309,28 € investis · 15 positions · cash ≈ 0 €** (les apports membres alimentent le cash, cf. interface).

> Note méthode : « Course dès aujourd'hui » — la perf de la compétition IA vs groupe part de la
> NAV d'aujourd'hui (6 309 €). Les moins-values « depuis achat » restent affichées (réalité TR)
> mais ne pénalisent ni ne créditent la course, qui démarre à égalité.
