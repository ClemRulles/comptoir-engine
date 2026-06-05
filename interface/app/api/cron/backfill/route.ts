import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { fetchAiFund } from "@/lib/github";
import { fetchHistoricalCloses } from "@/lib/prices";
import type { Fund, Holding } from "@/lib/types";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Reconstitue la courbe NAV PASSÉE des deux fonds en supposant le panier ACTUEL détenu
// dans le temps (backcast), via les clôtures historiques FMP. Idempotent : n'écrase JAMAIS
// un snapshot déjà présent (les vrais relevés du cron quotidien priment). À lancer une fois,
// après avoir encodé les positions du groupe. Param ?days=180 (défaut 180, max 365).
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const days = Math.min(365, Math.max(30, Number(new URL(request.url).searchParams.get("days") ?? 180)));
  const from = new Date();
  from.setDate(from.getDate() - days);
  const fromStr = from.toISOString().slice(0, 10);
  const today = new Date().toISOString().slice(0, 10);

  const supabase = createAdminClient();
  const { data: fundsData } = await supabase.from("funds").select("*");
  const funds = (fundsData ?? []) as (Fund & { cash: number })[];
  const group = funds.find((f) => f.kind === "group");
  const ai = funds.find((f) => f.kind === "ai");
  if (!group || !ai) {
    return NextResponse.json({ error: "funds non initialisés" }, { status: 500 });
  }

  const { data: ghData } = await supabase.from("holdings").select("*").eq("fund_id", group.id);
  const groupHoldings = ((ghData ?? []) as Holding[]).map((h) => ({ ticker: h.ticker, quantity: h.quantity }));
  const aiFund = await fetchAiFund();
  const aiRaw = aiFund?.positions ?? [];

  const { data: contribData } = await supabase.from("contributions").select("amount");
  const apportsTotal = ((contribData ?? []) as { amount: number }[]).reduce((s, c) => s + Number(c.amount ?? 0), 0);
  const groupCash = group.cash ?? group.start_capital ?? 0;
  const aiCash = (aiFund?.cash ?? ai.cash ?? ai.start_capital ?? 0) + apportsTotal;

  const tickers = Array.from(new Set([...groupHoldings.map((h) => h.ticker), ...aiRaw.map((p) => p.ticker)]));
  if (tickers.length === 0) {
    return NextResponse.json({ error: "aucune position à reconstituer" }, { status: 400 });
  }
  const hist = await fetchHistoricalCloses(tickers, fromStr);
  const covered = Object.keys(hist);
  if (covered.length === 0) {
    return NextResponse.json({ error: "pas de données historiques pour ces tickers" }, { status: 502 });
  }

  // Axe de dates = union des dates disponibles, triées, bornées à hier (le cron possède aujourd'hui).
  const dateSet = new Set<string>();
  for (const t of covered) for (const d of Object.keys(hist[t])) if (d < today) dateSet.add(d);
  const dates = Array.from(dateSet).sort();

  // Cours « actuel » = dernière clôture connue (pour normaliser les positions IA seed → parts).
  const latestClose = (ticker: string): number | null => {
    const m = hist[ticker.toUpperCase()];
    if (!m) return null;
    const ds = Object.keys(m).sort();
    return ds.length ? m[ds[ds.length - 1]] : null;
  };
  // Positions IA : convertit quantity=1 + value_t0 en parts réelles via le dernier cours.
  const aiPositions = aiRaw.map((p) => {
    if (p.quantity === 1 && typeof p.value_t0 === "number" && p.value_t0 > 0) {
      const price = latestClose(p.ticker);
      if (price) return { ticker: p.ticker, quantity: p.value_t0 / price };
    }
    return { ticker: p.ticker, quantity: p.quantity };
  });

  // NAV(date) = cash + Σ quantité × dernière clôture connue ≤ date (forward-fill par ticker).
  const navFor = (holdings: { ticker: string; quantity: number }[], cash: number) => {
    const last: Record<string, number> = {};
    const rows: { date: string; nav: number; pos: number }[] = [];
    for (const date of dates) {
      for (const h of holdings) {
        const c = hist[h.ticker.toUpperCase()]?.[date];
        if (typeof c === "number") last[h.ticker.toUpperCase()] = c;
      }
      let pos = 0;
      for (const h of holdings) {
        const c = last[h.ticker.toUpperCase()];
        if (typeof c === "number") pos += c * h.quantity;
      }
      rows.push({ date, nav: cash + pos, pos });
    }
    return rows;
  };

  const groupRows = navFor(groupHoldings, groupCash);
  const aiRows = navFor(aiPositions, aiCash);

  // N'insère que les dates absentes (ne pas écraser les vrais relevés).
  const { data: existing } = await supabase
    .from("nav_snapshots")
    .select("fund_id, date")
    .gte("date", fromStr);
  const seen = new Set(((existing ?? []) as { fund_id: string; date: string }[]).map((r) => `${r.fund_id}|${r.date}`));

  const payload: { fund_id: string; date: string; cash: number; positions_value: number; nav: number }[] = [];
  for (const r of groupRows) {
    if (!seen.has(`${group.id}|${r.date}`)) payload.push({ fund_id: group.id, date: r.date, cash: groupCash, positions_value: r.pos, nav: r.nav });
  }
  for (const r of aiRows) {
    if (!seen.has(`${ai.id}|${r.date}`)) payload.push({ fund_id: ai.id, date: r.date, cash: aiCash, positions_value: r.pos, nav: r.nav });
  }

  // insère par lots de 500
  let inserted = 0;
  for (let i = 0; i < payload.length; i += 500) {
    const chunk = payload.slice(i, i + 500);
    const { error } = await supabase.from("nav_snapshots").insert(chunk);
    if (error) return NextResponse.json({ error: error.message, inserted }, { status: 500 });
    inserted += chunk.length;
  }

  return NextResponse.json({
    ok: true,
    note: "Backcast du panier actuel — estimation, pas un relevé réel.",
    days,
    coveredTickers: covered,
    missingTickers: tickers.filter((t) => !covered.includes(t)),
    datesReconstituted: dates.length,
    inserted,
  });
}
