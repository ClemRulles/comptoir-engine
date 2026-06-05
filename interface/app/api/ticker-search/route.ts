import { NextResponse, type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

// Recherche de titres via Yahoo (symbole + nom + place) pour éviter de saisir un mauvais ticker.
// GET /api/ticker-search?q=air%20liquide
export async function GET(request: NextRequest) {
  const q = (new URL(request.url).searchParams.get("q") ?? "").trim();
  if (q.length < 2) return NextResponse.json({ results: [] });

  try {
    const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(
      q
    )}&quotesCount=8&newsCount=0&listsCount=0`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" },
      next: { revalidate: 300 },
    });
    if (!res.ok) return NextResponse.json({ results: [] });
    const data = (await res.json()) as {
      quotes?: { symbol?: string; shortname?: string; longname?: string; exchDisp?: string; quoteType?: string; typeDisp?: string }[];
    };
    const results = (data.quotes ?? [])
      .filter((row) => row.symbol && (row.quoteType === "EQUITY" || row.quoteType === "ETF" || row.quoteType === "MUTUALFUND"))
      .map((row) => ({
        symbol: row.symbol as string,
        name: row.longname || row.shortname || (row.symbol as string),
        exchange: row.exchDisp || "",
        type: row.typeDisp || row.quoteType || "",
      }))
      .slice(0, 8);
    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ results: [] });
  }
}
