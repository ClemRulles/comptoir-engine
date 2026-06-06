// sources.js — adaptateurs de données. Règle d'or : on ne JETTE jamais. Toute
// indisponibilité (clé absente, quota, réseau, parsing) renvoie null et est notée
// par l'appelant dans `data_gaps`. « gratuit d'abord, signal d'abord » (CLAUDE.md).

const DEFAULT_TIMEOUT = 12000;
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 comptoir-engine/0.2";

export const KEYS = {
  FRED: process.env.FRED_API_KEY || null,
  FINNHUB: process.env.FINNHUB_API_KEY || null,
  FMP: process.env.FMP_API_KEY || null,
  ALPHAVANTAGE: process.env.ALPHAVANTAGE_API_KEY || null,
};

async function fetchText(url, { timeout = DEFAULT_TIMEOUT } = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeout);
  try {
    const r = await fetch(url, { signal: ctrl.signal, headers: { "User-Agent": UA } });
    if (!r.ok) return null;
    return await r.text();
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

async function fetchJson(url, opts) {
  const txt = await fetchText(url, opts);
  if (txt == null) return null;
  try {
    return JSON.parse(txt);
  } catch {
    return null;
  }
}

// ===========================================================================
// Mapping ticker "maison" -> symbole Yahoo (place + devise). Aligné sur
// interface/lib/yahoo.ts pour rester cohérent avec la valorisation de l'interface.
// ===========================================================================
export const YAHOO_MAP = {
  "SAF.PA": "SAF.PA",
  "HO.PA": "HO.PA",
  AMZN: "AMZN",
  NFLX: "NFLX",
  EIMI: "EIMI.L", // iShares EM IMI (LSE)
  AI: "AI.PA", // Air Liquide (≠ C3.ai)
  LOTB: "LOTB.BR", // Lotus Bakeries (Bruxelles)
  BYD: "1211.HK", // BYD Co (Hong Kong)
  CI2: "CI2.MI", // Amundi MSCI India (Milan)
  "BNP.PA": "BNP.PA",
  "SGO.PA": "SGO.PA",
  SAP: "SAP.DE", // SAP (Xetra)
  NOVOB: "NOVO-B.CO", // Novo Nordisk B (Copenhague)
  MSTR: "MSTR",
  "RMS.PA": "RMS.PA",
};

export function toYahooSymbol(ticker) {
  if (!ticker) return null;
  return YAHOO_MAP[ticker.toUpperCase()] ?? ticker.toUpperCase();
}

// Symbole "US/base" pour les API centrées US (Alpha Vantage, OpenInsider) :
// on retire le suffixe de place. Best-effort -> data_gap si l'API ne connaît pas.
export function toBaseSymbol(ticker) {
  if (!ticker) return null;
  return ticker.toUpperCase().split(".")[0];
}

// --- Yahoo Finance : 1 appel -> closes quotidiens + volumes + bornes 52 sem.
// GRATUIT, sans clé, bonne couverture EU/US/ETF. Source primaire des signaux de prix
// (momentum 12-1, RSI 14, volume relatif, position dans le range 52 semaines).
export async function yahooDaily(ticker) {
  const sym = toYahooSymbol(ticker);
  if (!sym) return null;
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?range=1y&interval=1d`;
  const j = await fetchJson(url, { timeout: 9000 });
  const r = j?.chart?.result?.[0];
  if (!r?.meta) return null;
  const q = r.indicators?.quote?.[0] || {};
  const closes = (q.close || []).map((c) => (Number.isFinite(c) ? c : null));
  const volumes = (q.volume || []).map((v) => (Number.isFinite(v) ? v : null));
  const clean = closes.filter((c) => c != null);
  if (clean.length < 30) return null; // pas assez d'historique pour un signal fiable
  return {
    symbol: sym,
    currency: r.meta.currency || null,
    price: Number.isFinite(r.meta.regularMarketPrice) ? r.meta.regularMarketPrice : clean[clean.length - 1],
    high52: Number.isFinite(r.meta.fiftyTwoWeekHigh) ? r.meta.fiftyTwoWeekHigh : Math.max(...clean),
    low52: Number.isFinite(r.meta.fiftyTwoWeekLow) ? r.meta.fiftyTwoWeekLow : Math.min(...clean),
    closes, // peut contenir des null (jours fériés/illiquides) -> nettoyer côté calc
    volumes,
    asof: r.timestamp?.length ? new Date(r.timestamp[r.timestamp.length - 1] * 1000).toISOString().slice(0, 10) : null,
  };
}

// --- OpenInsider : transactions d'initiés, GRATUIT, sans clé (scraping HTML) ----
// US UNIQUEMENT (OpenInsider ne couvre pas les sociétés européennes/HK). On le réserve
// donc aux tickers dont le symbole Yahoo n'a pas de suffixe de place (= US pur), sinon
// la page de légende donnerait de faux positifs. Compte achats (P) vs ventes (S) sur 90j
// dans le TABLEAU DE RÉSULTATS uniquement. Renvoie { buys, sells, ratio, ok } ou null.
export async function openInsider(ticker) {
  const ysym = toYahooSymbol(ticker);
  if (!ysym || ysym.includes(".")) return null; // non-US -> non applicable
  const sym = toBaseSymbol(ticker);
  const url = `http://openinsider.com/screener?s=${encodeURIComponent(sym)}&fd=90&xp=1&xs=1&o=0&sortcol=0&maxresults=100`;
  const html = await fetchText(url, { timeout: 10000 });
  if (!html || !/openinsider/i.test(html)) return null;
  // On ne lit que le tableau de résultats (class "tinytable") pour éviter de capter la
  // légende / les filtres de la page. Chaque ligne de transaction porte "P - Purchase"
  // ou "S - Sale" dans une cellule.
  const m = html.match(/class=["']tinytable["'][\s\S]*?<\/table>/i);
  const scope = m ? m[0] : "";
  const buys = (scope.match(/>\s*P\s*-\s*Purchase\s*</gi) || []).length;
  const sells = (scope.match(/>\s*S\s*-\s*Sale\s*</gi) || []).length;
  if (buys + sells === 0) return null;
  const ratio = buys / (buys + sells);
  return { buys, sells, ratio: Math.round(ratio * 100) / 100, ok: true };
}

// --- FRED : séries macro --------------------------------------------------
// Dernière observation numérique d'une série. Sert au régime (courbe, chômage,
// inflation) ET au proxy peur/avidité (VIXCLS, BAMLH0A0HYM2). Clé requise.
export async function fredLatest(seriesId) {
  if (!KEYS.FRED) return null;
  const url =
    `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}` +
    `&api_key=${KEYS.FRED}&file_type=json&sort_order=desc&limit=1`;
  const j = await fetchJson(url);
  const v = j?.observations?.[0]?.value;
  const n = Number(v);
  return Number.isFinite(n) ? { value: n, date: j.observations[0].date } : null;
}

// Variation année/année d'une série de niveau (ex. CPIAUCSL) : (last/last-12mo - 1).
// Renvoie un % (ex. 0.032 = +3,2%) ou null.
export async function fredYoY(seriesId) {
  if (!KEYS.FRED) return null;
  const url =
    `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}` +
    `&api_key=${KEYS.FRED}&file_type=json&sort_order=desc&limit=13`;
  const j = await fetchJson(url);
  const obs = j?.observations;
  if (!Array.isArray(obs) || obs.length < 13) return null;
  const last = Number(obs[0].value);
  const yearAgo = Number(obs[12].value);
  if (!Number.isFinite(last) || !Number.isFinite(yearAgo) || yearAgo === 0) return null;
  return { value: Math.round((last / yearAgo - 1) * 1000) / 1000, date: obs[0].date };
}

// --- FMP : états financiers (pour F-Score & qualité des earnings) ----------
async function fmpStatement(kind, ticker, limit = 2) {
  if (!KEYS.FMP) return null;
  const url = `https://financialmodelingprep.com/api/v3/${kind}/${encodeURIComponent(ticker)}?period=annual&limit=${limit}&apikey=${KEYS.FMP}`;
  const j = await fetchJson(url);
  return Array.isArray(j) && j.length ? j : null;
}

export const fmp = {
  income: (t, n) => fmpStatement("income-statement", t, n),
  balance: (t, n) => fmpStatement("balance-sheet-statement", t, n),
  cashflow: (t, n) => fmpStatement("cash-flow-statement", t, n),
};

// --- Alpha Vantage : EPS surprise + croissance du CA (free tier 25 req/jour) -
// Économe par construction : un seul EARNINGS + un seul INCOME_STATEMENT par titre.
export async function alphaEarnings(ticker) {
  if (!KEYS.ALPHAVANTAGE) return null;
  const sym = toBaseSymbol(ticker);
  const url = `https://www.alphavantage.co/query?function=EARNINGS&symbol=${encodeURIComponent(sym)}&apikey=${KEYS.ALPHAVANTAGE}`;
  const j = await fetchJson(url);
  const q = j?.quarterlyEarnings?.[0];
  const sp = Number(q?.surprisePercentage);
  return Number.isFinite(sp) ? { surprise_pct: Math.round(sp * 100) / 100, date: q.reportedDate || null } : null;
}

export async function alphaRevenueGrowth(ticker) {
  if (!KEYS.ALPHAVANTAGE) return null;
  const sym = toBaseSymbol(ticker);
  const url = `https://www.alphavantage.co/query?function=INCOME_STATEMENT&symbol=${encodeURIComponent(sym)}&apikey=${KEYS.ALPHAVANTAGE}`;
  const j = await fetchJson(url);
  const rep = j?.annualReports;
  if (!Array.isArray(rep) || rep.length < 2) return null;
  const cur = Number(rep[0].totalRevenue);
  const prev = Number(rep[1].totalRevenue);
  if (!Number.isFinite(cur) || !Number.isFinite(prev) || prev === 0) return null;
  return { yoy: Math.round((cur / prev - 1) * 1000) / 1000, fiscalDate: rep[0].fiscalDateEnding || null };
}
