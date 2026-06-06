// sources.js — adaptateurs de données. Règle d'or : on ne JETTE jamais. Toute
// indisponibilité (clé absente, quota, réseau, parsing) renvoie null et est notée
// par l'appelant dans `data_gaps`. « gratuit d'abord, signal d'abord » (CLAUDE.md).

const DEFAULT_TIMEOUT = 12000;

export const KEYS = {
  FRED: process.env.FRED_API_KEY || null,
  FINNHUB: process.env.FINNHUB_API_KEY || null,
  FMP: process.env.FMP_API_KEY || null,
};

async function fetchText(url, { timeout = DEFAULT_TIMEOUT } = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeout);
  try {
    const r = await fetch(url, { signal: ctrl.signal, headers: { "User-Agent": "comptoir-engine/0.1" } });
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

// --- Stooq : historique de prix, GRATUIT, sans clé -------------------------
// Mappe un ticker "maison" vers un symbole Stooq. Les marchés US sont fiables
// (suffixe .us) ; l'Europe est best-effort (suffixes variables) -> data_gap si KO.
const STOOQ_SUFFIX = {
  PA: "fr", // Euronext Paris
  BR: "fr", // Bruxelles -> couverture partielle chez Stooq
  DE: "de",
  CO: "dk",
};

export function toStooqSymbol(ticker) {
  if (!ticker) return null;
  if (ticker.includes(".")) {
    const [base, mkt] = ticker.split(".");
    const suf = STOOQ_SUFFIX[mkt];
    return suf ? `${base.toLowerCase()}.${suf}` : null;
  }
  // Pas de suffixe : on suppose US (AMZN, NFLX, AI, MSTR…). Best-effort.
  return `${ticker.toLowerCase()}.us`;
}

// Renvoie un tableau de { date, close } en clôtures MENSUELLES, ou null.
export async function stooqMonthly(ticker) {
  const sym = toStooqSymbol(ticker);
  if (!sym) return null;
  const url = `https://stooq.com/q/d/l/?s=${encodeURIComponent(sym)}&i=m`;
  const csv = await fetchText(url);
  if (!csv || !csv.startsWith("Date")) return null; // Stooq renvoie "N/D" en texte si inconnu
  const rows = csv.trim().split("\n").slice(1);
  const out = [];
  for (const line of rows) {
    const [date, , , , close] = line.split(",");
    const c = Number(close);
    if (date && Number.isFinite(c)) out.push({ date, close: c });
  }
  return out.length ? out : null;
}

// --- FRED : séries macro --------------------------------------------------
// Renvoie la dernière observation numérique d'une série, ou null.
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

// --- FMP : états financiers (pour F-Score & qualité des earnings) ----------
// Renvoie les N derniers exercices annuels d'un endpoint statement, ou null.
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
