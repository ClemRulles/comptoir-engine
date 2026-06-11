// Récupère les derniers prix pour une liste de tickers, en EUR.
// Priorité Yahoo (couverture EU+US+ETF, conversion FX), repli FMP/Finnhub (US), puis Stooq.
// Renvoie une map { TICKER: prix par action en EUR }. Les tickers introuvables sont omis.
// IMPORTANT : toutes les sources sont ramenées en EUR ici. Un repli qui renverrait sa devise
// locale (USD, DKK…) sans conversion fausserait la NAV — on préfère omettre un cours que de
// mélanger les devises.
import { fetchStooqCloses, fetchStooqHistory, stooqCurrency } from "./stooq";
import { fetchEurRates, fetchYahooQuotes, fetchYahooHistory, YAHOO_MAP } from "./yahoo";

// Les replis FMP/Finnhub ne couvrent fiablement que les symboles US (cotés en USD).
// On exclut les tickers à suffixe de place (.PA, .BR…) et ceux dont le symbole Yahoo diffère
// (AI→AI.PA Air Liquide ≠ C3.ai, EIMI→EIMI.L…) : pour eux, un quote « US » du même code
// serait une autre société ou une autre devise.
const isPlainUsSymbol = (t: string) => !t.includes(".") && (YAHOO_MAP[t] ?? t) === t;

// Convertit des prix { TICKER: { price, currency } } en EUR via les taux Yahoo.
// Sans taux disponible pour une devise, le ticker est omis (jamais de devise brute).
async function toEur(raw: Record<string, { price: number; currency: string }>): Promise<Record<string, number>> {
  const entries = Object.entries(raw);
  if (!entries.length) return {};
  const rates = await fetchEurRates(entries.map(([, v]) => v.currency));
  const out: Record<string, number> = {};
  for (const [t, { price, currency }] of entries) {
    const rate = rates[currency];
    if (rate && rate > 0) out[t] = price / rate;
  }
  return out;
}

export async function fetchPrices(tickers: string[]): Promise<Record<string, number>> {
  const unique = Array.from(new Set(tickers.map((t) => t.trim().toUpperCase()))).filter(Boolean);
  if (unique.length === 0) return {};

  const fmpKey = process.env.FMP_API_KEY;
  const finnhubKey = process.env.FINNHUB_API_KEY;
  const out: Record<string, number> = {};

  // 1. Yahoo en priorité (prix ramenés en EUR, meilleure couverture).
  try {
    Object.assign(out, await fetchYahooQuotes(unique));
  } catch {
    // bascule sur les autres sources
  }

  // 2. FMP (batch) pour les symboles US restants — prix USD, convertis en EUR plus bas.
  const usd: Record<string, { price: number; currency: string }> = {};
  const fmpMissing = unique.filter((t) => !(t in out) && isPlainUsSymbol(t));
  if (fmpKey && fmpMissing.length) {
    try {
      const url = `https://financialmodelingprep.com/api/v3/quote/${fmpMissing.join(",")}?apikey=${fmpKey}`;
      const res = await fetch(url, { cache: "no-store" });
      if (res.ok) {
        const data = (await res.json()) as Array<{ symbol: string; price: number }>;
        for (const row of data) {
          if (row?.symbol && typeof row.price === "number" && row.price > 0) {
            usd[row.symbol.toUpperCase()] = { price: row.price, currency: "USD" };
          }
        }
      }
    } catch {
      // ignore, fall through to Finnhub
    }
  }

  // 3. Finnhub pour les symboles US toujours manquants — prix USD également.
  const finnhubMissing = unique.filter((t) => !(t in out) && !(t in usd) && isPlainUsSymbol(t));
  if (finnhubMissing.length && finnhubKey) {
    await Promise.all(
      finnhubMissing.map(async (t) => {
        try {
          const url = `https://finnhub.io/api/v1/quote?symbol=${t}&token=${finnhubKey}`;
          const res = await fetch(url, { cache: "no-store" });
          if (res.ok) {
            const data = (await res.json()) as { c?: number };
            if (typeof data.c === "number" && data.c > 0) usd[t] = { price: data.c, currency: "USD" };
          }
        } catch {
          // ignore individual failures
        }
      })
    );
  }

  // 4. Repli Stooq pour les tickers toujours sans prix (surtout européens) — devise locale
  //    déduite du suffixe de place, convertie en EUR comme le reste.
  const stillMissing = unique.filter((t) => !(t in out) && !(t in usd));
  const stooqRaw: Record<string, { price: number; currency: string }> = {};
  if (stillMissing.length) {
    const stooq = await fetchStooqCloses(stillMissing);
    for (const [t, p] of Object.entries(stooq)) {
      const currency = stooqCurrency(t);
      if (currency) stooqRaw[t] = { price: p, currency };
    }
  }

  Object.assign(out, await toEur({ ...usd, ...stooqRaw }));
  return out;
}

// Clôtures historiques par ticker, converties en EUR (FX courant — backcast approximatif).
// Renvoie { TICKER: { "YYYY-MM-DD": close_eur } }. Sert à reconstituer la courbe NAV passée
// d'un panier (backcast). Tickers introuvables omis.
export async function fetchHistoricalCloses(
  tickers: string[],
  fromDate: string
): Promise<Record<string, Record<string, number>>> {
  const unique = Array.from(new Set(tickers.map((t) => t.trim().toUpperCase()))).filter(Boolean);
  const fmpKey = process.env.FMP_API_KEY;
  const out: Record<string, Record<string, number>> = {};
  if (unique.length === 0) return out;

  // 1. Yahoo en priorité (historique EU+US converti en EUR).
  try {
    Object.assign(out, await fetchYahooHistory(unique, fromDate));
  } catch {
    // bascule sur FMP/Stooq
  }

  // Séries en devise locale à convertir en EUR (même FX courant que Yahoo history).
  const rawSeries: Record<string, { currency: string; points: Record<string, number> }> = {};

  const today = new Date().toISOString().slice(0, 10);
  const fmpTargets = unique.filter((t) => !(t in out) && isPlainUsSymbol(t));
  if (fmpKey && fmpTargets.length) {
    await Promise.all(
      fmpTargets.map(async (t) => {
        try {
          const url = `https://financialmodelingprep.com/api/v3/historical-price-full/${encodeURIComponent(
            t
          )}?from=${fromDate}&to=${today}&apikey=${fmpKey}`;
          const res = await fetch(url, { cache: "no-store" });
          if (!res.ok) return;
          const data = (await res.json()) as { historical?: { date: string; close: number }[] };
          const map: Record<string, number> = {};
          for (const row of data.historical ?? []) {
            if (row?.date && typeof row.close === "number" && row.close > 0) map[row.date] = row.close;
          }
          if (Object.keys(map).length) rawSeries[t] = { currency: "USD", points: map };
        } catch {
          // ignore individual failures
        }
      })
    );
  }

  // Repli Stooq pour l'historique des tickers non couverts (européens, EOD) — devise locale.
  const missing = unique.filter((t) => !(t in out) && !(t in rawSeries));
  if (missing.length) {
    const stooqHist = await fetchStooqHistory(missing, fromDate);
    for (const [t, points] of Object.entries(stooqHist)) {
      const currency = stooqCurrency(t);
      if (currency) rawSeries[t] = { currency, points };
    }
  }

  const entries = Object.entries(rawSeries);
  if (entries.length) {
    const rates = await fetchEurRates(entries.map(([, v]) => v.currency));
    for (const [t, { currency, points }] of entries) {
      const rate = rates[currency];
      if (!rate || rate <= 0) continue; // pas de taux → on omet plutôt que de fausser
      const conv: Record<string, number> = {};
      for (const [d, v] of Object.entries(points)) conv[d] = v / rate;
      out[t] = conv;
    }
  }

  return out;
}
