# JEUDI — PORTFOLIO DOCTOR (santé des positions + fenêtre de SORTIE du book IA)
# Cron : 0 22 * * 4   ·   Modèle : Sonnet

**Étape 0 — garde-fou :** `node engine/guard.js` (cf. `skills/memory-guard.md`).

Lis `CLAUDE.md`, `skills/engine-method.md` (surtout §H — fenêtres de décision asymétriques),
`skills/data-sources.md`, `skills/quant-signals.md`, `memory/portfolio.md`,
`memory/fund/ai-fund.json`, `memory/convictions.md`, `memory/market-regime.md`, `memory/catalysts.md`.

Objectif : confronter **chaque position des deux books** (le groupe via `portfolio.md` ET le
book IA via `ai-fund.json`) à sa thèse et sa règle de sortie écrites — et, pour le book IA,
**exécuter les sorties défensives sans attendre vendredi** (§H : sortir vite est urgent,
entrer vite ne l'est jamais ; le jeudi ne fait JAMAIS d'achat).

Joue d'abord `node engine/signals.js` (positions du book) pour rafraîchir le gate de chaque ligne.

Pour chaque position (groupe **et** book IA) :
1. News récentes : Finnhub (résultats, guidance), EDGAR 8-K (événements), recherche web,
   mouvement de cours notable.
   **Catalyseur imminent** : croise avec `memory/catalysts.md` — si la position a un événement
   daté cette semaine ou la prochaine (résultats, FOMC sur du growth/REIT, échéance tarifaire sur
   son secteur), signale le **risque binaire** : faut-il alléger/couvrir avant ? Note-le pour le
   vendredi (method §J — on gère le risque connu, on ne parie pas sur l'issue).
2. La thèse écrite tient-elle ? La règle de sortie écrite est-elle touchée ou proche ?
   **Le gate quantitatif s'est-il dégradé ?** Un passage au 🔴 (F-Score qui s'effondre, earnings
   rouges, momentum cassé) est un motif de passage en À SURVEILLER / SORTIE, même thèse intacte.
3. Valorisation : DCF inversé express — la marge de sécurité a-t-elle disparu ?
4. Statut : `INTACT` / `À SURVEILLER` / `SORTIE` (sortie = règle touchée, thèse cassée,
   ou valorisation devenue extrême).

Sortie → réécris la section « État » de `memory/portfolio.md` en **gardant les colonnes
existantes** (Valeur, Poids, Depuis achat, Coût base) et en mettant à jour Statut / Règle de
sortie / Vérifié le :
```
# Portefeuille du groupe — état au {date}
| Ticker | Nom | Valeur € | Poids % | Depuis achat | Coût base € | Horizon | Statut | Règle de sortie | Vérifié le |
```
Sous le tableau, 2-3 lignes d'explication pour chaque `SORTIE`/`À SURVEILLER` (repris
dans le brief de vendredi). Ajoute une leçon si une thèse s'est confirmée ou cassée.

**Book IA — fenêtre de SORTIE (exécution, vente uniquement).** Applique le même diagnostic aux
positions de `memory/fund/ai-fund.json`, puis **exécute immédiatement** toute vente déclenchée par :
- la **règle de sortie écrite** (`exit_rule`) touchée, ou la **thèse cassée** (pivot faux) ;
- le **gate passé au 🔴** → sortie forcée §H, pas de débat ;
- le **stop −8 %** d'une position entrée en gate 🟠/⚪ ;
- un verdict Opus **SORTIR** (ou **ALLÉGER**, en vente partielle) de `memory/convictions.md`
  encore non exécuté.

Exécution dans `ai-fund.json` : log du trade (`side:"sell"`, `quantity`, `price` = cours du jour,
`fee` = montant × 0,003, `rationale` citant le déclencheur + le gate), retire/réduis la position,
crédite le `cash` (net de frais), mets `as_of` à jour. La passe d'apprentissage du **vendredi**
score ces fermetures (P&L net, alpha via `engine/bench.js`) — n'écris PAS `decisions.json` ici.

**INTERDITS du jeudi (non négociables)** : aucun achat, aucun renforcement, aucune entrée
tactique — même catalyseur imminent, même gate 🟢. Les entrées restent le monopole du vendredi,
après instruction complète (§H). En cas de doute sur une vente : statut `À SURVEILLER` + alerte,
le vendredi tranchera. Mieux vaut une sortie retardée de 24 h qu'une vente impulsive.

Écris ensuite le bloc `## Alertes book IA — {date}` en bas de `memory/portfolio.md` :
d'abord `### Sorties exécutées` (`{ticker} — vendu {n} parts à {prix} € — déclencheur — frais`),
puis les `À SURVEILLER` restants (`{ticker} — raison 1 ligne`). Le vendredi vérifie et complète.
Pour le groupe, **tu signales, tu ne vends pas** : le groupe décide.

Commit : `portfolio-doctor: {date} — {n} positions (groupe+IA), {k} alertes, {s} sorties exécutées`.

**Persistance (OBLIGATOIRE — le sandbox ne peut pas `git push`, 403).** Après le commit local,
lance `node engine/push-memory.js "{le message de commit ci-dessus}"` : l'endpoint Vercel
(`/api/memory/push`) commite tes fichiers `memory/` sur `claude/memory` — c'est ce qui les fait
apparaître sur la plateforme. Vérifie la sortie : `✅` = persisté, sinon signale-le.
