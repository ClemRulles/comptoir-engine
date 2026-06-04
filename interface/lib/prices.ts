// Récupère les derniers prix pour une liste de tickers.
// Priorité FMP (batch), repli Finnhub (1 requête par ticker).
// Renvoie une map { TICKER: prix }. Les tickers introuvables sont omis.

export async function fetchPrices(tickers: string[]): Promise<Record<string, number>> {
  const unique = Array.from(new Set(tickers.map((t) => t.trim().toUpperCase()))).filter(Boolean);
  if (unique.length === 0) return {};

  const fmpKey = process.env.FMP_API_KEY;
  const finnhubKey = process.env.FINNHUB_API_KEY;
  const out: Record<string, number> = {};

  if (fmpKey) {
    try {
      const url = `https://financialmodelingprep.com/api/v3/quote/${unique.join(",")}?apikey=${fmpKey}`;
      const res = await fetch(url, { cache: "no-store" });
      if (res.ok) {
        const data = (await res.json()) as Array<{ symbol: string; price: number }>;
        for (const row of data) {
          if (row?.symbol && typeof row.price === "number") out[row.symbol.toUpperCase()] = row.price;
        }
      }
    } catch {
      // ignore, fall through to Finnhub
    }
  }

  const missing = unique.filter((t) => !(t in out));
  if (missing.length && finnhubKey) {
    await Promise.all(
      missing.map(async (t) => {
        try {
          const url = `https://finnhub.io/api/v1/quote?symbol=${t}&token=${finnhubKey}`;
          const res = await fetch(url, { cache: "no-store" });
          if (res.ok) {
            const data = (await res.json()) as { c?: number };
            if (typeof data.c === "number" && data.c > 0) out[t] = data.c;
          }
        } catch {
          // ignore individual failures
        }
      })
    );
  }

  return out;
}

// Clôtures historiques par ticker (FMP). Renvoie { TICKER: { "YYYY-MM-DD": close } }.
// Sert à reconstituer la courbe NAV passée d'un panier (backcast). Tickers introuvables omis.
export async function fetchHistoricalCloses(
  tickers: string[],
  fromDate: string
): Promise<Record<string, Record<string, number>>> {
  const unique = Array.from(new Set(tickers.map((t) => t.trim().toUpperCase()))).filter(Boolean);
  const fmpKey = process.env.FMP_API_KEY;
  const out: Record<string, Record<string, number>> = {};
  if (!fmpKey || unique.length === 0) return out;

  const today = new Date().toISOString().slice(0, 10);
  await Promise.all(
    unique.map(async (t) => {
      try {
        const url = `https://financialmodelingprep.com/api/v3/historical-price-full/${encodeURIComponent(
          t
        )}?from=${fromDate}&to=${today}&apikey=${fmpKey}`;
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { historical?: { date: string; close: number }[] };
        const map: Record<string, number> = {};
        for (const row of data.historical ?? []) {
          if (row?.date && typeof row.close === "number") map[row.date] = row.close;
        }
        if (Object.keys(map).length) out[t] = map;
      } catch {
        // ignore individual failures
      }
    })
  );
  return out;
}
