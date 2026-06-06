# engine/ — couche moteur déterministe

Deux outils Node (zéro dépendance, Node 18+) que les routines appellent via Bash.
Ils rendent l'état du fonds **robuste** et les décisions **adossées à des signaux factuels**,
sans changer la philosophie « routines markdown jouées par Claude Code ».

## `node engine/guard.js` — garde-fou de la mémoire
À jouer **en tout début de chaque routine**. Garantit que `memory/fund/*.json` sont
présents et valides :
- fichier **absent** ou **illisible** → recréé depuis le schéma canonique (l'original
  corrompu est mis en quarantaine `*.corrupt-<ts>`, jamais perdu) ;
- fichier **lisible mais incomplet** (clé/bucket manquant) → **complété** sans toucher
  aux données présentes (`decisions[]`, `positions[]`, `trades[]`…).

Sortie : rapport lisible + ligne `GUARD_JSON:{…}`. Code de sortie **0** = sain (ou réparé
sans recréation), **2** = un fichier a dû être recréé → **à signaler dans le brief**.
Idempotent et non-destructif (re-jouable sans risque).

## `node engine/signals.js [TICKERS…]` — pipeline de signaux quantitatifs
Calcule des signaux **factuels et déterministes** pour gater les décisions (method §A/§H) :

| Signal | Quoi | Source | Clé requise |
|--------|------|--------|:-----------:|
| **F-Score Piotroski** (0-9) | qualité fondamentale (rentabilité, levier, efficacité) | FMP | `FMP_API_KEY` |
| **Momentum 12-1** | rendement t-12→t-1, **plafonné** (surchauffe >+60%) | Stooq | — (gratuit) |
| **Qualité des earnings** | accruals = (RN−CFO)/actifs, FCF/RN | FMP | `FMP_API_KEY` |
| **Régime macro** | cadran + plancher de cash (courbe, chômage, inflation) | FRED | `FRED_API_KEY` |

Puis un **`gate`** par titre : 🟢 vert / 🟠 ambre / 🔴 rouge / ⚪ indéterminé.
Écrit le cache `memory/fund/signals.json`. Sans arguments, prend les tickers du book IA.

**Dégradation propre** : aucune clé n'est requise pour tourner. Toute source absente
(clé, quota, réseau) → signal `null` + entrée dans `data_gaps`. Ne bloque jamais une
routine. Un gate sans aucun signal exploitable est **« indéterminé »** (jamais « vert »).

## `node engine/test.js` — smoke tests hors-ligne
24 assertions sur les fonctions pures (`lib/calc.js`) et les schémas/IO (`lib/schema.js`,
`lib/io.js`). Aucun réseau, aucune clé. À lancer après toute modif du moteur.

## Arborescence
```
engine/
  guard.js          garde-fou JSON (CLI)
  signals.js        pipeline de signaux (CLI)
  test.js           smoke tests offline
  lib/
    schema.js       schémas canoniques + complétion non-destructive
    io.js           lecture/écriture JSON sûres + quarantaine
    sources.js      adaptateurs FRED / FMP / Stooq (tolérants aux pannes)
    calc.js         fonctions PURES : piotroski, momentum12_1, earningsQuality, regimeScore, gate
```

Les clés API vivent dans les variables d'environnement (jamais dans un fichier ni un commit).
