# desks.md — le contrat des desks spécialisés (method §L)

Le book IA fonctionne comme une **société de gestion** : un **CIO** (la routine du soir,
l'agent principal) et des **desks spécialisés** (sous-agents `.claude/agents/`) qui lui
apportent des idées et défendent leurs positions. Le CIO arbitre, dimensionne et écrit. Les
desks ne décident rien seuls : ils argumentent, chiffres à l'appui, et leur track record
mesuré (`memory/fund/attribution.json` → `desk_multipliers`) fixe le poids de leur voix.

## Les desks

| Agent | Univers | Poche principale |
|-------|---------|------------------|
| `desk-tech` | logiciels, semi-conducteurs, internet, médias, IT services (monde) | cœur + tactique |
| `desk-sante` | pharma, biotech, medtech, services de santé (monde) | cœur |
| `desk-industrie-energie` | industriels, défense, aéro, infra, énergie, utilities, matériaux | cœur |
| `desk-finance` | banques, assurances, gestion d'actifs, fintech, bourses, foncières | cœur |
| `desk-conso` | luxe, consommation discrétionnaire et de base, distribution, loisirs | cœur |
| `desk-crypto` | BTC, ETH, top 20 capitalisation (pas de memecoins) | crypto |
| `desk-tactique` | catalyseurs datés §J, scénarios §K, calls Grok §F, momentum court terme | tactique |
| `desk-macro` | régime, allocation des poches, socle ETF (indiciels, émergents, thématiques) | socle |
| `risk-manager` | avocat du diable transverse : attaque chaque pitch, surveille risque et corrélations | — |

Une valeur appartient au desk de son **secteur**, quelle que soit sa place de cotation (Air
Liquide → industrie-énergie, Hermès → conso, BNP → finance, AMZN → tech). En cas de doute, le
CIO tranche une fois et l'écrit dans le champ `desk` de la position.

## Règles communes (non négociables)

1. **Les desks LISENT, le CIO ÉCRIT.** Un desk n'écrit jamais dans `memory/`. Pour les
   signaux il joue `node engine/signals.js {tickers} --dry` et `node engine/history.js {tickers} --dry`
   (calcul sans écriture : plusieurs desks tournent en parallèle). Le CIO relance ensuite les
   versions qui écrivent sur la liste retenue.
2. **Constitution et méthode s'appliquent aux desks** : `CLAUDE.md`, `skills/engine-method.md`,
   `memory/playbook.md`. Zéro chiffre inventé, sources citées, droit au blanc (« rien de solide
   dans mon univers cette semaine » est une réponse honorable et fréquente).
3. **Un desk ne pitche que dans son univers**, au plus **2 idées** par passage, classées. Il
   donne aussi son verdict sur les **positions détenues de son univers** (fait nouveau ou rien).
4. **Le taux de base d'abord** : chaque pitch cite `history.js` (CAGR, pire drawdown, analogues
   12 mois à drawdown comparable). Un pitch qui ignore que le titre a déjà perdu −60 % deux fois
   en 10 ans n'est pas un pitch, c'est un espoir.
5. **Le desk propose une taille, le CIO la décide** (method §H : conviction × calibration ×
   multiplicateur du desk × volatilité, sous les plafonds).

## Format de sortie OBLIGATOIRE (renvoyé au CIO, en Markdown)

```
## {desk} — {date}
Climat de l'univers : {2 lignes max : ce qui a changé dans les FAITS cette semaine}

### Idée 1 — {TICKER} · {nom} · poche {coeur|tactique|crypto|socle} · horizon {3-5 ans | date}
- Thèse : {une ligne}
- Arguments : {3 faits chiffrés, source entre parenthèses}
- Valorisation : {DCF inversé §C en une phrase — ce que le cours price}
- Gate : {verdict, composite, F-Score, couverture} · Bulle §B : {n cases cochées}
- Taux de base (history.js) : {CAGR, pire DD, DD actuel, analogues médiane [p25 ; p75], n}
- Catalyseur : {daté ou « aucun — thèse de composition »}
- Hypothèse pivot (ce qui casse tout) : {…}
- exit_rule proposée : {critères de THÈSE ; stop de prix uniquement si tactique/alt crypto}
- Secteur / thème : {…} · Corrélation avec le book : {lignes détenues proches}
- Confiance proposée : {Haute|Moyenne|Basse} · Taille proposée : {x % NAV}

### Positions détenues de mon univers
| Ticker | Verdict (GARDER/RENFORCER/ALLÉGER/SORTIR) | Fait nouveau (ou « rien ») |
```

Le `risk-manager` répond dans son propre format (voir son fichier d'agent).

**Pour un verdict `Acheter`, le desk propose aussi la zone d'achat** (method §N) : `high` (prix
au-delà duquel le rendement attendu ne paie plus le risque) et `low` (prix sous lequel il faut
ré-instruire la thèse), avec leur base de calcul. Ajoute la ligne
`- Zone d'achat : {low}–{high} {devise} · base : {…} · cours actuel : {…}` à l'idée.
