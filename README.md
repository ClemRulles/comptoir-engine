# Comptoir Engine — édition Pro (rotation hebdomadaire)

Moteur de recherche d'investissement à coût quasi nul, calibré pour le **plan Pro** :
**une seule routine par nuit**, en rotation sur la semaine. Chaque matin, Comptoir
affiche une « lentille » différente, et le vendredi tu reçois **UNE tendance validée**
de la semaine — jamais une tendance bidon.

Il n'exécute aucun ordre. Il cherche, valide, surveille, discipline. L'humain décide.
Paper trading d'abord. Ce n'est pas un conseil en investissement.

---

## La semaine

| Jour | Routine | Modèle | Ce qu'elle produit |
|------|---------|--------|--------------------|
| Lun | `monday-trend-radar` | Sonnet | Régime de marché + **LA tendance de la semaine** (validée ou « aucune ») |
| Mar | `tuesday-scout` | Sonnet | Sociétés cotées exposées à la tendance + filtres qualité |
| Mer | `wednesday-deepdive` | **Opus** | Débat haussier/baissier sur ≤3 candidats **+ revue de risque Opus de ≤2 positions du book IA** |
| Jeu | `thursday-portfolio-doctor` | Sonnet | État des **deux books** (groupe + IA) vs leur règle de sortie |
| Ven | `friday-brief` | Sonnet | Apprentissage + gestion du book IA + synthèse + revue hebdo ; **1er vendredi du mois = calibration profonde** |

**5 tâches planifiées, point.** La revue de calibration mensuelle n'est PAS une 6ᵉ tâche : elle
est repliée dans le `friday-brief` du 1er vendredi du mois. Opus n'est sollicité que le mercredi
(≤5 titres : ≤3 candidats + ≤2 positions du book). Surveille Réglages → Usage la 1re semaine.

Crons (à adapter à ton fuseau ; heures de nuit = hors throttling) :
```
monday-trend-radar        0 22 * * 1
tuesday-scout             0 22 * * 2
wednesday-deepdive        0 22 * * 3
thursday-portfolio-doctor 0 22 * * 4
friday-brief              0 22 * * 5
```

---

## Les API branchées (toutes en tier GRATUIT)

Les clés vont dans les **variables d'environnement** de ton environnement Claude Code
— **tu les saisis toi-même**, jamais dans le repo, jamais dans un prompt. Détail et
usage par routine dans `skills/data-sources.md`. Le système marche même sans aucune clé
(repli sur la recherche web native de Claude) et se dégrade proprement si une API plafonne.

- **SEC EDGAR** — gratuit, sans clé. Dépôts officiels (10-K, 10-Q, 8-K, S-1). L'ancre anti-bullshit.
- **FRED** (`FRED_API_KEY`) — macro de la Fed de St. Louis : taux, courbe, inflation. Zéro bruit. Pour le régime.
- **Finnhub** (`FINNHUB_API_KEY`) — fondamentaux, résultats, **calendriers résultats & IPO**, pairs, news.
- **Financial Modeling Prep** (`FMP_API_KEY`) — ratios, screeners, **performance sectorielle**, market cap.
- **Alpha Vantage** (`ALPHAVANTAGE_API_KEY`) — indicateurs techniques (momentum), à doses modérées.
- **Recherche web native** — toujours là, gratuite : news, contexte, vérification croisée.
- *(Plus tard, optionnel et encadré)* **Grok** (`GROK_API_KEY`) — uniquement thermomètre de surchauffe. Voir method §F.

> On s'arrête là volontairement. Ajouter plus de flux = plus de bruit et plus de quota brûlé,
> pas plus de signal. Le bon réflexe : faire correspondre la donnée au travail, pas tout brancher.

---

## La règle anti-bullshit (le cœur de ta demande)

Une « tendance » n'est livrée que si elle passe le **filtre de validation** (`skills/trend-gate.md`) :
preuves dures (≥2), durabilité structurelle, ≥2 manières cotées de la jouer, stade non
parabolique, et survie à la checklist bulle. **Si rien ne passe, le moteur écrit
« Pas de tendance assez solide cette semaine » et explique pourquoi.** Mieux vaut un blanc
honnête qu'une tendance fabriquée.

---

## Pont avec Comptoir

- Vos positions → `memory/portfolio.md` (export JSON de Comptoir, collé/synchronisé).
- Le moteur → vous : `memory/morning-brief.md` chaque matin, `memory/trends.md` pour la
  tendance de la semaine, `memory/watchlist.md` au format prêt à importer dans Comptoir.

---

## Le fonds IA apprend de son passé

Le book IA (`memory/fund/ai-fund.json`) est un portefeuille **fictif** qu'on cherche à faire
**battre le groupe**. Sa boucle d'apprentissage :

- Chaque vendredi, la routine **score les positions clôturées** (P&L réalisé, thèse
  confirmée/cassée) → registre `memory/fund/decisions.json` + **leçons datées** dans
  `memory/lessons.md`.
- La **calibration** (`memory/fund/calibration.json`) suit le **hit-rate par niveau de confiance**.
  Une IA honnête réussit *plus souvent* quand elle est « Haute » que « Basse ». Sinon la revue
  mensuelle **réduit le sizing** du niveau mal calibré et **durcit ses critères** (method §H/§I).
- L'interface expose tout ça dans l'onglet **« Apprentissages de l'IA »** (`/apprentissages`).

### Départ à armes égales (seed clone-à-t0)
Pour que la comparaison soit juste, l'IA **démarre avec le même capital + les mêmes positions**
que le groupe :
1. Encodez vos positions dans `memory/portfolio.md` (et via l'éditeur de l'interface).
2. Tant que `ai-fund.json` a `seeded:false`, la **1re passe du vendredi** recopie ces positions,
   aligne `start_capital`/`cash` sur votre pot commun, puis passe `seeded:true`.
3. Ensuite l'IA **gère seule** selon ses convictions — on mesure qui surperforme.
