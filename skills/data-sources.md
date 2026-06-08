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

### Yahoo Finance — gratuit, sans clé (séries de prix, chart endpoint)
- 1 appel `/v8/finance/chart/{sym}?range=1y&interval=1d` → closes + volumes + bornes 52 sem.
- Bonne couverture EU/US/ETF (mapping `YAHOO_MAP` dans `engine/lib/sources.js`).
- Usage : **momentum 12-1, RSI 14, volume relatif 20j, range 52 sem.** calculés par
  `engine/signals.js` (cf. `skills/quant-signals.md`), sans clé ni quota.

### OpenInsider — gratuit, sans clé (transactions d'initiés, **US uniquement**)
- Scraping du screener ; ratio achats/ventes d'initiés sur 90j.
- Usage : signal initiés du gate pour les titres US. Européens/HK → non couverts (data_gap).

### Alpha Vantage — `ALPHAVANTAGE_API_KEY` (free 25 req/jour — économe !)
- Indicateurs techniques (RSI, MACD, moyennes) et séries de prix.
- Usage : momentum **plafonné** (method §A) en appoint. À doses modérées vu le quota serré.

### Crypto : CoinGecko + alternative.me — gratuit, sans clé (RADAR, pas signal)
- `engine/crypto.js` → `memory/fund/crypto.json`. CoinGecko `/global` (cap totale, **dominance
  BTC/ETH**, variation 24h, EUR) + `/coins/markets` (cours + variations 24h/7j/30j des majors, EUR)
  + alternative.me `/fng` (**Fear & Greed Index** crypto, 0 peur extrême → 100 avidité extrême).
- Usage : situer le **climat crypto** (sentiment contrarien, dominance, momentum). Les signaux
  quantitatifs actions (F-Score, earnings, initiés) **ne s'appliquent PAS** à la crypto → momentum
  + régime macro + sentiment uniquement.
- **Discipline** : radar à corroborer (preuve dure on-chain/chiffres/catalyseur), **jamais un signal
  d'achat seul**, **pas d'allocation forcée**. Sans réseau → champs `null` + `data_gaps`, ne bloque pas.

### Recherche web native — toujours disponible, gratuite
- News, contexte qualitatif, vérification croisée, lecture de filings/articles.
- C'est ta couche news par défaut : pas besoin d'API de presse payante.

### Grok — `GROK_API_KEY` (accès X temps réel)
- Seul accès X temps réel. Deux usages, tous deux **radar à corroborer, jamais un signal d'achat** :
  1. **Thermomètre de surchauffe** : euphorie sociale = drapeau contrarien (checklist bulle §B).
  2. **Pouls hebdo du marché** (lundi uniquement, Partie D) : 2-4 thèmes/tendances + tickers qui
     ont bougé (priorité aux titres détenus). Sortie **JSON stricte**, écrite dans
     `memory/grok-pulse.json`.
- API : `POST https://api.x.ai/v1/chat/completions`, `Authorization: Bearer $GROK_API_KEY`.
- **Règle de corroboration** : un thème n'influence une décision (ou ne devient une tendance
  candidate) que s'il est **recoupé par une source dure** (SEC/FRED/FMP/chiffres) → `corroborated:true`.
  Sinon il est gardé comme radar, marqué `false`. Repli recherche web si Grok plafonne.

---

## Qui utilise quoi (par nuit)

| Routine | Sources principales |
|---------|---------------------|
| Lun · Trend Radar | FRED (+ release calendar), FMP sector-performance, Finnhub IPO+earnings calendar, EDGAR full-text, web (calendrier macro/politique → `catalysts.md`), **Grok (pouls hebdo → `grok-pulse.json`)**, **CoinGecko + alternative.me (radar crypto → `crypto.json`)** |
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
