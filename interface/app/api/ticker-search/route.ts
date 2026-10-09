import { NextResponse, type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

// Recherche d'actifs via Yahoo (symbole + nom + place) pour éviter de saisir un mauvais ticker.
// Couvre actions, ETF ET cryptomonnaies. Les cryptos sont normalisées en paire -EUR (l'app
// raisonne en euros) et taguées kind="crypto" pour l'affichage (badge + logo).
// GET /api/ticker-search?q=bitcoin
//
// La recherche Yahoo est très sensible aux mots : « core msci world » trouve l'iShares Core
// MSCI World, mais « MSCI World Core ETF » ne renvoie rien. Si la requête telle quelle ne donne
// rien, on réessaie (au plus 3 fois de plus) : sans les mots parasites, avec l'émetteur et
// « core » en tête, puis avec le nom officiel des grands ETF indiciels. Les résultats viennent
// toujours de Yahoo : aucun ticker n'est écrit en dur.

type Row = { symbol?: string; shortname?: string; longname?: string; exchDisp?: string; quoteType?: string; typeDisp?: string };
type Result = { symbol: string; name: string; exchange: string; type: string; kind: "equity" | "etf" | "crypto" };

const NOISE = new Set(["etf", "etfs", "ucits", "tracker", "trackers", "fonds", "fund", "acc", "accumulating", "dist", "distributing", "capitalisant", "distribuant", "usd", "eur", "(acc)", "(dist)"]);
const FIRST = new Set(["ishares", "vanguard", "amundi", "xtrackers", "spdr", "lyxor", "invesco", "ubs", "hsbc", "bnp", "core"]);

// Nom officiel des ETF indiciels les plus recherchés, déclenché par des mots-clés.
const ALIASES: [RegExp, string][] = [
  [/msci\s*world|\bworld\b|\bmonde\b/i, "iShares Core MSCI World"],
  [/all[\s-]?world|ftse\s*all/i, "Vanguard FTSE All-World"],
  [/s\s*&?\s*p\s*500|sp500/i, "iShares Core S&P 500"],
  [/emerg|émerg|\bem\s*imi\b/i, "iShares Core MSCI EM IMI"],
  [/nasdaq/i, "Nasdaq 100 UCITS"],
];

function variants(q: string): string[] {
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  const clean = words.filter((w) => !NOISE.has(w));
  const ordered = [...clean.filter((w) => FIRST.has(w)), ...clean.filter((w) => !FIRST.has(w))];
  const out = [q, clean.join(" "), ordered.join(" ")];
  for (const [re, alias] of ALIASES) if (re.test(q)) out.push(alias);
  return [...new Set(out.filter((x) => x.length >= 2))].slice(0, 4);
}

async function yahoo(q: string): Promise<Row[] | null> {
  const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q)}&quotesCount=12&newsCount=0&listsCount=0`;
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" },
    next: { revalidate: 300 },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { quotes?: Row[] };
  return data.quotes ?? [];
}

function toResults(rows: Row[], seen: Set<string>, out: Result[]) {
  for (const row of rows) {
    if (!row.symbol || out.length >= 8) continue;
    const qt = row.quoteType;
    if (qt !== "EQUITY" && qt !== "ETF" && qt !== "MUTUALFUND" && qt !== "CRYPTOCURRENCY") continue;

    let symbol = row.symbol;
    let kind: Result["kind"] = "equity";
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
    out.push({ symbol, name, exchange: kind === "crypto" ? "Crypto" : row.exchDisp || "", type: row.typeDisp || qt || "", kind });
  }
}

export async function GET(request: NextRequest) {
  const q = (new URL(request.url).searchParams.get("q") ?? "").trim();
  if (q.length < 2) return NextResponse.json({ results: [] });

  const seen = new Set<string>();
  const results: Result[] = [];
  let reached = false; // au moins une réponse de Yahoo (sinon : source indisponible)
  try {
    for (const v of variants(q)) {
      const rows = await yahoo(v);
      if (rows == null) continue;
      reached = true;
      toResults(rows, seen, results);
      if (results.length) break;
    }
  } catch {
    // réseau : on renvoie ce qu'on a
  }
  return NextResponse.json(reached ? { results } : { results, error: "source" });
}
