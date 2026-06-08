import { NextResponse, type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

// Recherche d'actifs via Yahoo (symbole + nom + place) pour éviter de saisir un mauvais ticker.
// Couvre actions, ETF ET cryptomonnaies. Les cryptos sont normalisées en paire -EUR (l'app
// raisonne en euros) et taguées kind="crypto" pour l'affichage (badge + logo).
// GET /api/ticker-search?q=bitcoin
export async function GET(request: NextRequest) {
  const q = (new URL(request.url).searchParams.get("q") ?? "").trim();
  if (q.length < 2) return NextResponse.json({ results: [] });

  try {
    const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(
      q
    )}&quotesCount=12&newsCount=0&listsCount=0`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" },
      next: { revalidate: 300 },
    });
    if (!res.ok) return NextResponse.json({ results: [] });
    const data = (await res.json()) as {
      quotes?: {
        symbol?: string;
        shortname?: string;
        longname?: string;
        exchDisp?: string;
        quoteType?: string;
        typeDisp?: string;
      }[];
    };

    const seen = new Set<string>();
    const results: { symbol: string; name: string; exchange: string; type: string; kind: string }[] = [];

    for (const row of data.quotes ?? []) {
      if (!row.symbol) continue;
      const qt = row.quoteType;
      if (qt !== "EQUITY" && qt !== "ETF" && qt !== "MUTUALFUND" && qt !== "CRYPTOCURRENCY") continue;

      let symbol = row.symbol;
      let kind: "equity" | "etf" | "crypto" = "equity";
      let name = row.longname || row.shortname || symbol;
      if (qt === "CRYPTOCURRENCY") {
        kind = "crypto";
        // Tout afficher en euros : BTC-USD, ETH-CAD, … → -EUR (le graphe Yahoo gère -EUR).
        // On replie toute paire crypto/fiat vers EUR (et on dédoublonne ensuite par symbole).
        symbol = symbol.replace(/-(USD|USDT|USDC|GBP|CAD|AUD|JPY|CHF|CNY|HKD)$/i, "-EUR");
        // Nom Yahoo « Bitcoin USD » → « Bitcoin » (la devise est portée par le symbole).
        name = name.replace(/\s+(USD|USDT|USDC|GBP|CAD|AUD|JPY|CHF|CNY|HKD|EUR)$/i, "");
      } else if (qt === "ETF" || qt === "MUTUALFUND") {
        kind = "etf";
      }

      if (seen.has(symbol)) continue;
      seen.add(symbol);

      results.push({
        symbol,
        name,
        exchange: kind === "crypto" ? "Crypto" : row.exchDisp || "",
        type: row.typeDisp || qt || "",
        kind,
      });
      if (results.length >= 8) break;
    }

    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ results: [] });
  }
}
