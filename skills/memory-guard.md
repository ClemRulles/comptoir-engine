# memory-guard.md — l'état du fonds ne casse jamais en silence

Le fonds IA n'a qu'une continuité entre les nuits : les fichiers `memory/fund/*.json`.
Si l'un est corrompu (JSON tronqué par un commit interrompu, écriture partielle) ou
absent, une routine qui le lit **échoue à moitié** et peut écrire de la bouillie par-dessus.
Ce skill rend ça impossible.

## Réflexe non négociable : `guard` en ouverture de routine

**Avant de lire ou écrire le moindre fichier d'état**, joue :

```bash
node engine/guard.js
```

Ce que ça garantit (voir `engine/README.md`) :
- `decisions.json`, `calibration.json`, `signals.json`, `ai-fund.json`, `forecasts.json` existent et sont
  structurellement valides ;
- un fichier **absent / illisible** est recréé proprement, l'original corrompu étant
  **mis en quarantaine** (`*.corrupt-<horodatage>`) — on ne perd jamais une donnée, on
  l'écarte pour inspection ;
- un fichier **incomplet** (clé requise manquante, bucket de calibration absent) est
  **complété** sans toucher aux données présentes.

## Lire le verdict

`guard` finit par une ligne `GUARD_JSON:{...}` :
- `recreated: []` **vide** → mémoire saine, continue normalement.
- `recreated: ["X.json"]` **non vide** → un fichier a dû être **recréé de zéro**. C'est un
  événement : **mentionne-le dans le brief du vendredi** (section « 🔧 Ce que je corrige »
  ou la revue hebdo) avec le nom du fichier en quarantaine, pour que le groupe sache qu'un
  historique a peut-être été reconstruit. Ne fais pas semblant que tout va bien.

Code de sortie : `0` = sain/réparé, `2` = une recréation a eu lieu (signal à remonter).

## Règles d'or

- **Réparer, jamais détruire.** `guard` ne recrée intégralement un fichier que s'il est
  absent ou illisible. Un book valide (`ai-fund.json`) n'est jamais écrasé.
- **N'édite pas `signals.json` à la main** : c'est un cache produit par `signals.js`.
- Si tu touches `decisions.json`, reste **append-only** (method §I) : `guard` ne réécrit
  pas le passé, et toi non plus.
- Après toute modif du moteur lui-même : `node engine/test.js` doit rester vert.

Relié à : [`quant-signals.md`](quant-signals.md) (qui produit `signals.json`),
`skills/engine-method.md` §H/§I, `routines/friday-brief.md` (passe 1).
