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
| Mer | `wednesday-deepdive` | **Opus** | Débat haussier/baissier sur 2-3 noms → conviction + confiance |
| Jeu | `thursday-portfolio-doctor` | Sonnet | État de vos positions vs leur règle de sortie |
| Ven | `friday-brief` | Sonnet | Synthèse + tendance packagée + revue hebdo |

Une nuit = un job léger → tu restes dans Pro. Opus n'est sollicité que le mercredi,
sur 2-3 titres. Surveille Réglages → Usage la première semaine et ajuste les plafonds.

Crons (à adapter à ton fuseau ; heures de nuit = hors throttling) :
```
monday-trend-radar       0 22 * * 1
tuesday-scout            0 22 * * 2
wednesday-deepdive       0 22 * * 3
thursday-portfolio-doctor 0 22 * * 4
friday-brief             0 22 * * 5
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
