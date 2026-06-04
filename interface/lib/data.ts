import { createClient } from "@/lib/supabase/server";
import { fetchAiFund, fetchCalibration, fetchDecisions, fetchMemoryMarkdown } from "@/lib/github";
import { fetchPrices } from "@/lib/prices";
import {
  DEMO_AI,
  DEMO_BRIEF,
  DEMO_CALIBRATION,
  DEMO_CONTRIBUTIONS,
  DEMO_DECISIONS,
  DEMO_GROUP,
  DEMO_LESSONS,
  DEMO_MEMBERS,
  DEMO_PRICES,
  demoSeries,
} from "@/lib/demo";
import type {
  Calibration,
  ClubMember,
  Contribution,
  Decision,
  Fund,
  Holding,
  NavSnapshot,
} from "@/lib/types";

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
  const win = (sel: (p: { group: number; ai: number }) => number) => {
    const i = series.length - 1;
    const j = Math.max(0, i - 7);
    const a = sel(series[i]);
    const b = sel(series[j]);
    return b ? (a - b) / b : 0;
  };
  return {
    configured: false,
    demo: true,
    group,
    ai,
    series,
    weekDeltaGroup: win((p) => p.group),
    weekDeltaAi: win((p) => p.ai),
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

    // Apports membres : le pot commun (group.cash) est déjà incrémenté à chaque apport.
    // Le book IA reçoit la même somme pour rester à armes égales (cash de trading + apports cumulés).
    const { data: contribData } = await supabase.from("contributions").select("amount");
    const apportsTotal = (contribData ?? []).reduce((s, c) => s + Number(c.amount ?? 0), 0);
    const aiCash = (aiFile?.cash ?? aiFundRow?.cash ?? aiFundRow?.start_capital ?? 0) + apportsTotal;

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
    for (const s of gSnaps) byDate.set(s.date, { date: s.date, group: s.nav, ai: NaN });
    for (const s of aSnaps) {
      const r = byDate.get(s.date) ?? { date: s.date, group: NaN, ai: NaN };
      r.ai = s.nav;
      byDate.set(s.date, r);
    }
    const series = Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));

    const weekDelta = (arr: NavSnapshot[]) => {
      if (arr.length < 2) return 0;
      const i = arr.length - 1;
      const j = Math.max(0, i - 5);
      const a = arr[i].nav;
      const b = arr[j].nav;
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

// ── Apprentissages de l'IA ────────────────────────────────────────────
export interface LessonEntry {
  date: string;
  text: string;
}

export interface LearningData {
  demo: boolean;
  calibration: Calibration;
  decisions: Decision[];
  lessons: LessonEntry[];
}

// Extrait les lignes datées (YYYY-MM-DD · texte) de lessons.md, plus récentes d'abord.
export function parseLessons(markdown: string): LessonEntry[] {
  const out: LessonEntry[] = [];
  for (const raw of markdown.split("\n")) {
    const m = raw.match(/^\s*-?\s*(\d{4}-\d{2}-\d{2})\s*[·:\-–—]?\s*(.+)$/);
    if (m && m[2].trim()) out.push({ date: m[1], text: m[2].trim() });
  }
  return out.sort((a, b) => b.date.localeCompare(a.date));
}

// ── Membres & apports ─────────────────────────────────────────────────
export interface ClubData {
  demo: boolean;
  members: ClubMember[];
  contributions: Contribution[];
  monthlyPerMember: number;
  activeMembers: number;
  monthlyTotal: number; // activeMembers × monthlyPerMember
  contributedTotal: number; // somme des apports enregistrés
}

function buildClub(
  demo: boolean,
  members: ClubMember[],
  contributions: Contribution[],
  monthlyPerMember: number
): ClubData {
  const active = members.filter((m) => m.active);
  const monthlyTotal = active.reduce((s, m) => s + (m.monthly_amount || monthlyPerMember), 0);
  return {
    demo,
    members,
    contributions,
    monthlyPerMember,
    activeMembers: active.length,
    monthlyTotal,
    contributedTotal: contributions.reduce((s, c) => s + c.amount, 0),
  };
}

export async function getClubData(): Promise<ClubData> {
  if (!isConfigured()) {
    return buildClub(true, DEMO_MEMBERS, DEMO_CONTRIBUTIONS, 25);
  }
  try {
    const supabase = await createClient();
    const [{ data: mem }, { data: contrib }, { data: setting }] = await Promise.all([
      supabase.from("club_members").select("*").order("created_at", { ascending: true }),
      supabase.from("contributions").select("*").order("ts", { ascending: false }).limit(100),
      supabase.from("settings").select("value").eq("key", "monthly_per_member").maybeSingle(),
    ]);
    const members = (mem ?? []) as ClubMember[];
    const byId = new Map(members.map((m) => [m.id, m.name]));
    const contributions = ((contrib ?? []) as Contribution[]).map((c) => ({
      ...c,
      member_name: c.member_id ? byId.get(c.member_id) ?? null : null,
    }));
    const monthlyPerMember = Number(setting?.value ?? 25) || 25;
    return buildClub(false, members, contributions, monthlyPerMember);
  } catch {
    return buildClub(true, DEMO_MEMBERS, DEMO_CONTRIBUTIONS, 25);
  }
}

export async function getLearningData(): Promise<LearningData> {
  if (!isConfigured()) {
    return {
      demo: true,
      calibration: DEMO_CALIBRATION,
      decisions: DEMO_DECISIONS,
      lessons: parseLessons(DEMO_LESSONS),
    };
  }

  const [calibration, decisions, lessonsMd] = await Promise.all([
    fetchCalibration(),
    fetchDecisions(),
    fetchMemoryMarkdown("lessons.md"),
  ]);

  // Repli démo champ par champ si le repo n'a pas encore produit de données.
  return {
    demo: !calibration && !decisions && !lessonsMd,
    calibration: calibration ?? DEMO_CALIBRATION,
    decisions: decisions ?? DEMO_DECISIONS,
    lessons: lessonsMd ? parseLessons(lessonsMd) : parseLessons(DEMO_LESSONS),
  };
}
