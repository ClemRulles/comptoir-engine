// Yahoo Finance (endpoint chart non officiel, gratuit, sans clé) — meilleure couverture
// que Stooq/FMP : actions européennes + ETF + historique. Cours différés ~15 min (comme
// toute source gratuite). Tout est ramené en EUR via les taux de change Yahoo.

// Map ticker de l'app → symbole Yahoo (place + devise gérées via la conversion FX).
export const YAHOO_MAP: Record<string, string> = {
  "SAF.PA": "SAF.PA",
  "HO.PA": "HO.PA",
  AMZN: "AMZN",
  NFLX: "NFLX",
  EIMI: "EIMI.L", // iShares EM IMI (LSE, USD)
  AI: "AI.PA", // Air Liquide (≠ C3.ai)
  LOTB: "LOTB.BR", // Lotus Bakeries (Bruxelles)
  BYD: "1211.HK", // BYD Co (Hong Kong, HKD)
  CI2: "CI2.MI", // Amundi MSCI India (Milan, EUR)
  "BNP.PA": "BNP.PA",
  "SGO.PA": "SGO.PA",
  SAP: "SAP.DE", // SAP (Xetra, EUR)
  NOVOB: "NOVO-B.CO", // Novo Nordisk B (Copenhague, DKK)
  MSTR: "MSTR",
  "RMS.PA": "RMS.PA",
};

const UA = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
};
// Symbole Yahoo : la map pour nos tickers historiques, sinon le ticker tel quel
// (les positions ajoutées via la recherche stockent déjà un symbole Yahoo valide).
const yahooSym = (t: string): string => YAHOO_MAP[t.toUpperCase()] ?? t.toUpperCase();

interface ChartMeta {
  price: number | null;
  prevClose: number | null;
  currency: string;
  timestamps: number[];
  closes: (number | null)[];
}

async function fetchChart(symbol: string, params: string, revalidate: number): Promise<ChartMeta | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?${params}`;
    // Timeout par appel : un appel lent ne doit pas faire dépasser le maxDuration de la route.
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 7000);
    let res: Response;
    try {
      res = await fetch(url, { headers: UA, next: { revalidate }, signal: ctrl.signal });
    } finally {
      clearTimeout(timer);
    }
    if (!res.ok) return null;
    const json = (await res.json()) as {
      chart?: { result?: { meta?: { regularMarketPrice?: number; currency?: string; chartPreviousClose?: number; previousClose?: number }; timestamp?: number[]; indicators?: { quote?: { close?: (number | null)[] }[] } }[] };
    };
    const r = json.chart?.result?.[0];
    if (!r?.meta) return null;
    const prev = r.meta.chartPreviousClose ?? r.meta.previousClose;
    return {
      price: typeof r.meta.regularMarketPrice === "number" ? r.meta.regularMarketPrice : null,
      prevClose: typeof prev === "number" ? prev : null,
      currency: r.meta.currency ?? "EUR",
      timestamps: r.timestamp ?? [],
      closes: r.indicators?.quote?.[0]?.close ?? [],
    };
  } catch {
    return null;
  }
}

// Taux de change → euros : renvoie { CCY: unités de CCY pour 1 EUR }. EUR = 1.
export async function fetchEurRates(currencies: string[]): Promise<Record<string, number>> {
  const out: Record<string, number> = { EUR: 1 };
  const need = Array.from(new Set(currencies)).filter((c) => c && c !== "EUR" && !(c in out));
  await Promise.all(
    need.map(async (ccy) => {
      const r = await fetchChart(`EUR${ccy}=X`, "interval=1d&range=1d", 900);
      if (r?.price && r.price > 0) out[ccy] = r.price;
    })
  );
  return out;
}

// Cours du jour, convertis en EUR. { TICKER: prix_eur }. Appels en parallèle (durée bornée).
export async function fetchYahooQuotes(tickers: string[]): Promise<Record<string, number>> {
  const mapped = tickers.map((t) => ({ t: t.toUpperCase(), y: yahooSym(t) })).filter((x) => x.y);
  const settled = await Promise.all(
    mapped.map(async ({ t, y }) => {
      const c = await fetchChart(y as string, "interval=1d&range=1d", 900);
      return c?.price && c.price > 0 ? { t, price: c.price, currency: c.currency } : null;
    })
  );
  const raw = settled.filter((x): x is { t: string; price: number; currency: string } => x !== null);
  const rates = await fetchEurRates(raw.map((r) => r.currency));
  const out: Record<string, number> = {};
  for (const { t, price, currency } of raw) {
    const rate = rates[currency];
    if (rate && rate > 0) out[t] = price / rate; // CCY → EUR
  }
  return out;
}

// Variation du jour en % par ticker (price vs clôture précédente). Sans FX (un % est neutre).
// { TICKER: changePct } (ex. 0.023 = +2,3 %).
export async function fetchYahooChanges(tickers: string[]): Promise<Record<string, number>> {
  const mapped = tickers.map((t) => ({ t: t.toUpperCase(), y: yahooSym(t) }));
  const settled = await Promise.all(
    mapped.map(async ({ t, y }) => {
      const c = await fetchChart(y, "interval=1d&range=1d", 900);
      if (c?.price && c.prevClose && c.prevClose > 0) {
        return { t, change: (c.price - c.prevClose) / c.prevClose };
      }
      return null;
    })
  );
  const out: Record<string, number> = {};
  for (const x of settled) if (x) out[x.t] = x.change;
  return out;
}

// Historique EOD converti en EUR (FX courant appliqué — backcast approximatif).
// { TICKER: { "YYYY-MM-DD": close_eur } }.
export async function fetchYahooHistory(
  tickers: string[],
  fromDate: string
): Promise<Record<string, Record<string, number>>> {
  const mapped = tickers.map((t) => ({ t: t.toUpperCase(), y: yahooSym(t) })).filter((x) => x.y);
  const p1 = Math.floor(new Date(fromDate).getTime() / 1000);
  const p2 = Math.floor(Date.now() / 1000);
  const settled = await Promise.all(
    mapped.map(async ({ t, y }) => {
      const c = await fetchChart(y as string, `interval=1d&period1=${p1}&period2=${p2}`, 3600);
      if (!c || !c.timestamps.length) return null;
      const points: Record<string, number> = {};
      c.timestamps.forEach((ts, i) => {
        const close = c.closes[i];
        if (typeof close === "number" && close > 0) {
          points[new Date(ts * 1000).toISOString().slice(0, 10)] = close;
        }
      });
      return Object.keys(points).length ? { t, currency: c.currency, points } : null;
    })
  );
  const series = settled.filter(
    (x): x is { t: string; currency: string; points: Record<string, number> } => x !== null
  );
  const rates = await fetchEurRates(series.map((s) => s.currency));
  const out: Record<string, Record<string, number>> = {};
  for (const { t, currency, points } of series) {
    const rate = rates[currency];
    if (!rate || rate <= 0) continue;
    const conv: Record<string, number> = {};
    for (const [d, v] of Object.entries(points)) conv[d] = v / rate;
    out[t] = conv;
  }
  return out;
}
