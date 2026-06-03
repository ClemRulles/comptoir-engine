# data-sources.md — les API et comment t'en servir

Principe : **gratuit d'abord, signal d'abord.** Chaque source est mappée au travail
qui en a besoin. Les clés sont dans les variables d'environnement (jamais en clair).
Si une clé manque ou une API plafonne → bascule sur la recherche web native et note-le.

---

## Sources

### SEC EDGAR — gratuit, sans clé (l'ancre anti-bullshit)
- Données officielles : 10-K, 10-Q, 8-K, S-1, formulaires insiders.
- `https://data.sec.gov/api/xbrl/companyfacts/CIK##########.json` → chiffres normalisés.
- Full-text search : `https://efts.sec.gov/LATEST/search-index?q=...` (repère les hausses de
  dépôts mentionnant un thème = tendance réelle, pas médiatique).
- Usage : Deep-dive (fondamentaux), Trend Radar (S-1/IPO, vagues de dépôts), Portfolio Doctor (8-K).

### FRED — `FRED_API_KEY` (gratuit, Fed de St. Louis) — macro à zéro bruit
- Taux directeurs, courbe des taux (10Y-2Y), inflation (CPI/PCE), chômage, conditions financières.
- `https://api.stlouisfed.org/fred/series/observations?series_id=...&api_key=...`
- Usage : Trend Radar / régime. Excellent pour juger « risk-on sain » vs « stress ».

### Finnhub — `FINNHUB_API_KEY` (free tier)
- Fondamentaux, états financiers (30 ans), métriques clés, pairs, recommandations.
- **Calendrier des résultats** et **calendrier des IPO** (`/calendar/earnings`, `/calendar/ipo`).
- News par société. Usage : Scout, Deep-dive, Portfolio Doctor, Trend Radar (catalyseurs datés).

### Financial Modeling Prep (FMP) — `FMP_API_KEY` (free ~250 req/jour)
- Ratios, données de DCF, market cap, **stock screener**, **sector performance**.
- `/stock-screener`, `/sectors-performance`, `/ratios/{ticker}`.
- Usage : Scout (filtrage), Trend Radar (quel secteur surperforme/sous-performe), Deep-dive (ratios).

### Alpha Vantage — `ALPHAVANTAGE_API_KEY` (free 25 req/jour — économe !)
- Indicateurs techniques (RSI, MACD, moyennes) et séries de prix.
- Usage : momentum **plafonné** (method §A). À doses modérées vu le quota serré.

### Recherche web native — toujours disponible, gratuite
- News, contexte qualitatif, vérification croisée, lecture de filings/articles.
- C'est ta couche news par défaut : pas besoin d'API de presse payante.

### Grok — `GROK_API_KEY` (optionnel, déconseillé au départ)
- Seul accès X temps réel. Usage UNIQUE : thermomètre de surchauffe (euphorie sociale =
  drapeau contrarien) et radar de catalyseurs court terme. **Jamais** un signal d'achat.

---

## Qui utilise quoi (par nuit)

| Routine | Sources principales |
|---------|---------------------|
| Lun · Trend Radar | FRED, FMP sector-performance, Finnhub IPO+earnings calendar, EDGAR full-text, web |
| Mar · Scout | FMP screener, Finnhub fundamentals+peers, web |
| Mer · Deep-dive | EDGAR companyfacts, Finnhub financials, FMP ratios/DCF, web |
| Jeu · Portfolio Doctor | Finnhub news+earnings, EDGAR 8-K, web |
| Ven · Brief | lit la mémoire ; web léger pour vérifier les dernières news |

## Règles d'économie
- Mets toujours en cache dans `memory/` ce que tu récupères (ne ré-interroge pas la même
  donnée deux fois dans la semaine).
- Respecte les quotas gratuits : Alpha Vantage = 25/jour, FMP ≈ 250/jour. Priorise.
- Une donnée chiffrée importante = recoupée par 2 sources, sinon note l'incertitude.
- Ne branche pas d'API supplémentaire « pour avoir plus » : plus de bruit, plus de quota, pas plus de signal.
