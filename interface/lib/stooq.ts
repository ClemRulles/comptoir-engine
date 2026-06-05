// Stooq — cours EOD gratuits couvrant l'Europe + l'historique (CSV, sans clé).
// Sert de repli quand FMP/Finnhub (surtout US) ne couvrent pas un ticker européen.
// Symboles incertains (ETF, BYD) : si Stooq ne renvoie rien, l'appelant ancre à la valeur.

// Map ticker de l'app → symbole Stooq. Les .fr/.be/.de/.dk/.uk = places européennes.
export const STOOQ_MAP: Record<string, string> = {
  "SAF.PA": "saf.fr", // Safran (Euronext Paris)
  "HO.PA": "ho.fr", // Thales — vérifié
  AMZN: "amzn.us",
  NFLX: "nflx.us",
  EIMI: "eimi.uk", // iShares MSCI EM IMI (LSE) — à confirmer en prod
  AI: "ai.fr", // Air Liquide (≠ C3.ai)
  LOTB: "lotb.be", // Lotus Bakeries (Bruxelles) — à confirmer
  BYD: "byddy.us", // BYD ADR — à confirmer (sinon ancré)
  CI2: "ci2.de", // Amundi MSCI India (Xetra) — à confirmer
  "BNP.PA": "bnp.fr",
  "SGO.PA": "sgo.fr",
  SAP: "sap.de",
  NOVOB: "novo-b.dk", // Novo Nordisk B (Copenhague) — à confirmer
  MSTR: "mstr.us",
  "RMS.PA": "rms.fr", // Hermès
};

function stooqSym(ticker: string): string | null {
  return STOOQ_MAP[ticker.toUpperCase()] ?? null;
}

const UA = { "User-Agent": "Mozilla/5.0 (compatible; HypeInvest/1.0)" };
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Dernier close EOD pour des tickers app. Séquentiel + petite pause anti rate-limit.
export async function fetchStooqCloses(tickers: string[]): Promise<Record<string, number>> {
  const out: Record<string, number> = {};
  for (const t of tickers) {
    const sym = stooqSym(t);
    if (!sym) continue;
    try {
      const url = `https://stooq.com/q/l/?s=${sym}&f=sd2t2ohlcv&h&e=csv`;
      // Cache 15 min : évite de re-taper Stooq (rate-limit) à chaque rendu de page.
      const res = await fetch(url, { next: { revalidate: 900 }, headers: UA });
      if (res.ok) {
        const text = await res.text();
        const lines = text.trim().split("\n");
        const cols = lines[lines.length - 1].split(",");
        const close = Number(cols[6]); // Symbol,Date,Time,Open,High,Low,Close,Volume
        if (Number.isFinite(close) && close > 0) out[t.toUpperCase()] = close;
      }
    } catch {
      // ignore
    }
    await sleep(220);
  }
  return out;
}

// Historique EOD par ticker app : { TICKER: { "YYYY-MM-DD": close } }.
export async function fetchStooqHistory(
  tickers: string[],
  fromDate: string
): Promise<Record<string, Record<string, number>>> {
  const out: Record<string, Record<string, number>> = {};
  const d1 = fromDate.replace(/-/g, "");
  const d2 = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  for (const t of tickers) {
    const sym = stooqSym(t);
    if (!sym) continue;
    try {
      const url = `https://stooq.com/q/d/l/?s=${sym}&d1=${d1}&d2=${d2}&i=d`;
      const res = await fetch(url, { next: { revalidate: 3600 }, headers: UA });
      if (res.ok) {
        const text = await res.text();
        const rows = text.trim().split("\n").slice(1); // skip header
        const map: Record<string, number> = {};
        for (const row of rows) {
          const c = row.split(","); // Date,Open,High,Low,Close,Volume
          const close = Number(c[4]);
          if (/^\d{4}-\d{2}-\d{2}$/.test(c[0]) && Number.isFinite(close) && close > 0) map[c[0]] = close;
        }
        if (Object.keys(map).length) out[t.toUpperCase()] = map;
      }
    } catch {
      // ignore
    }
    await sleep(220);
  }
  return out;
}
