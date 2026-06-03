import { createClient } from "@/lib/supabase/server";
import { fetchAiFund, fetchMemoryMarkdown } from "@/lib/github";
import { fetchPrices } from "@/lib/prices";
import { DEMO_AI, DEMO_BRIEF, DEMO_GROUP, DEMO_PRICES, demoSeries } from "@/lib/demo";
import type { Fund, Holding, NavSnapshot } from "@/lib/types";

export interface EnrichedHolding {
  ticker: string;
  quantity: number;
  avgCost: number;
  price: number | null;
  marketValue: number;
  weight: number; // part du fonds (positions + cash)
  pnl: number;
  pnlPct: number;
  thesis?: string;
}

export interface FundView {
  kind: "group" | "ai";
  name: string;
  startCapital: number;
  cash: number;
  positionsValue: number;
  nav: number;
  perf: number; // depuis l'origine
  holdings: EnrichedHolding[];
}

export interface AppData {
  configured: boolean;
  demo: boolean;
  group: FundView;
  ai: FundView;
  series: { date: string; group: number; ai: number }[];
  weekDeltaGroup: number;
  weekDeltaAi: number;
  brief: string | null;
}

export function isConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

function enrich(
  kind: "group" | "ai",
  name: string,
  startCapital: number,
  cash: number,
  raw: { ticker: string; quantity: number; avg_cost: number; thesis?: string }[],
  prices: Record<string, number>
): FundView {
  const holdings: EnrichedHolding[] = raw.map((h) => {
    const price = prices[h.ticker.toUpperCase()] ?? null;
    const marketValue = price != null ? price * h.quantity : h.avg_cost * h.quantity;
    const cost = h.avg_cost * h.quantity;
    const pnl = marketValue - cost;
    return {
      ticker: h.ticker.toUpperCase(),
      quantity: h.quantity,
      avgCost: h.avg_cost,
      price,
      marketValue,
      weight: 0,
      pnl,
      pnlPct: cost ? pnl / cost : 0,
      thesis: h.thesis,
    };
  });
  const positionsValue = holdings.reduce((s, h) => s + h.marketValue, 0);
  const nav = cash + positionsValue;
  for (const h of holdings) h.weight = nav ? h.marketValue / nav : 0;
  holdings.sort((a, b) => b.marketValue - a.marketValue);
  return {
    kind,
    name,
    startCapital,
    cash,
    positionsValue,
    nav,
    perf: startCapital ? (nav - startCapital) / startCapital : 0,
    holdings,
  };
}

function demoData(): AppData {
  const prices = DEMO_PRICES;
  const group = enrich("group", DEMO_GROUP.name, DEMO_GROUP.startCapital, DEMO_GROUP.cash, DEMO_GROUP.holdings, prices);
  const ai = enrich("ai", "Fonds IA", DEMO_AI.start_capital, DEMO_AI.cash, DEMO_AI.positions, prices);
  const series = demoSeries();
  const last = series[series.length - 1];
  const prev = series[series.length - 2] ?? last;
  return {
    configured: false,
    demo: true,
    group,
    ai,
    series,
    weekDeltaGroup: prev.group ? (last.group - prev.group) / prev.group : 0,
    weekDeltaAi: prev.ai ? (last.ai - prev.ai) / prev.ai : 0,
    brief: DEMO_BRIEF,
  };
}

export async function getAppData(): Promise<AppData> {
  if (!isConfigured()) return demoData();

  try {
    const supabase = await createClient();
    const { data: fundsData } = await supabase.from("funds").select("*");
    const funds = (fundsData ?? []) as (Fund & { cash: number })[];
    const groupFund = funds.find((f) => f.kind === "group");
    const aiFundRow = funds.find((f) => f.kind === "ai");

    const { data: holdingsData } = await supabase.from("holdings").select("*");
    const allHoldings = (holdingsData ?? []) as Holding[];
    const groupHoldings = allHoldings.filter((h) => h.fund_id === groupFund?.id);

    const aiFile = await fetchAiFund();
    const aiPositions = aiFile?.positions ?? [];
    const aiCash = aiFile?.cash ?? aiFundRow?.cash ?? aiFundRow?.start_capital ?? 0;

    const tickers = [...groupHoldings.map((h) => h.ticker), ...aiPositions.map((p) => p.ticker)];
    const prices = await fetchPrices(tickers);

    const group = enrich(
      "group",
      groupFund?.name ?? "Fonds du groupe",
      groupFund?.start_capital ?? 0,
      groupFund?.cash ?? groupFund?.start_capital ?? 0,
      groupHoldings.map((h) => ({ ticker: h.ticker, quantity: h.quantity, avg_cost: h.avg_cost })),
      prices
    );
    const ai = enrich(
      "ai",
      aiFundRow?.name ?? "Fonds IA",
      aiFile?.start_capital ?? aiFundRow?.start_capital ?? 0,
      aiCash,
      aiPositions,
      prices
    );

    const { data: snapData } = await supabase
      .from("nav_snapshots")
      .select("*")
      .order("date", { ascending: true });
    const snaps = (snapData ?? []) as NavSnapshot[];
    const gSnaps = snaps.filter((s) => s.fund_id === groupFund?.id);
    const aSnaps = snaps.filter((s) => s.fund_id === aiFundRow?.id);
    const byDate = new Map<string, { date: string; group: number; ai: number }>();
    for (const s of gSnaps) byDate.set(s.date, { date: s.date.slice(5), group: s.nav, ai: NaN });
    for (const s of aSnaps) {
      const r = byDate.get(s.date) ?? { date: s.date.slice(5), group: NaN, ai: NaN };
      r.ai = s.nav;
      byDate.set(s.date, r);
    }
    const series = Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));

    const weekDelta = (arr: NavSnapshot[]) => {
      if (arr.length < 2) return 0;
      const a = arr[arr.length - 1].nav;
      const b = arr[arr.length - 2].nav;
      return b ? (a - b) / b : 0;
    };

    const brief = await fetchMemoryMarkdown("morning-brief.md");

    return {
      configured: true,
      demo: false,
      group,
      ai,
      series,
      weekDeltaGroup: weekDelta(gSnaps),
      weekDeltaAi: weekDelta(aSnaps),
      brief,
    };
  } catch {
    // si la base n'est pas encore prête, on retombe proprement sur la démo
    return demoData();
  }
}
