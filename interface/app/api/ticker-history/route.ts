import { NextResponse, type NextRequest } from "next/server";
import { YAHOO_MAP } from "@/lib/yahoo";

export const dynamic = "force-dynamic";
export const maxDuration = 20;

const UA = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
};

// Historique de cours d'un seul titre (pour le graphique détaillé d'une action).
// GET /api/ticker-history?symbol=AI  → 1 an de clôtures quotidiennes (devise native).
// Le ticker de l'app est mappé vers le symbole Yahoo (YAHOO_MAP) ; sinon utilisé tel quel
// (les titres ajoutés via la recherche stockent déjà un symbole Yahoo valide).
export async function GET(request: NextRequest) {
  const raw = (new URL(request.url).searchParams.get("symbol") ?? "").trim().toUpperCase();
  if (!raw) return NextResponse.json({ error: "symbol requis" }, { status: 400 });

  const ysym = YAHOO_MAP[raw] ?? raw;

  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
      ysym
    )}?range=1y&interval=1d`;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    let res: Response;
    try {
      res = await fetch(url, { headers: UA, signal: ctrl.signal, next: { revalidate: 900 } });
    } finally {
      clearTimeout(timer);
    }
    if (!res.ok) return NextResponse.json({ error: "indisponible" }, { status: 502 });

    const json = (await res.json()) as {
      chart?: {
        result?: {
          meta?: {
            regularMarketPrice?: number;
            chartPreviousClose?: number;
            previousClose?: number;
            currency?: string;
            longName?: string;
            shortName?: string;
            exchangeName?: string;
          };
          timestamp?: number[];
          indicators?: { quote?: { close?: (number | null)[] }[] };
        }[];
      };
    };

    const r = json.chart?.result?.[0];
    if (!r?.meta || !r.timestamp) {
      return NextResponse.json({ error: "aucune donnée" }, { status: 404 });
    }

    const closes = r.indicators?.quote?.[0]?.close ?? [];
    const points: { date: string; close: number }[] = [];
    r.timestamp.forEach((ts, i) => {
      const c = closes[i];
      if (typeof c === "number" && c > 0) {
        points.push({ date: new Date(ts * 1000).toISOString().slice(0, 10), close: c });
      }
    });

    const prevClose = r.meta.chartPreviousClose ?? r.meta.previousClose ?? null;

    return NextResponse.json({
      symbol: raw,
      yahooSymbol: ysym,
      name: r.meta.longName || r.meta.shortName || raw,
      exchange: r.meta.exchangeName || "",
      currency: r.meta.currency || "",
      price: typeof r.meta.regularMarketPrice === "number" ? r.meta.regularMarketPrice : null,
      prevClose,
      points,
    });
  } catch {
    return NextResponse.json({ error: "erreur réseau" }, { status: 500 });
  }
}
