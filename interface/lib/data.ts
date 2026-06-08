import { createClient } from "@/lib/supabase/server";
import {
  fetchAiFund,
  fetchCalibration,
  fetchCatalysts,
  fetchDecisions,
  fetchGrokPulse,
  fetchMemoryMarkdown,
  fetchSignals,
} from "@/lib/github";
import { fetchPrices } from "@/lib/prices";
import { fetchYahooChanges } from "@/lib/yahoo";
import {
  DEMO_AI,
  DEMO_AI_TRADES,
  DEMO_BRIEF,
  DEMO_CALIBRATION,
  DEMO_CATALYSTS,
  DEMO_CONTRIBUTIONS,
  DEMO_DECISIONS,
  DEMO_GROK_PULSE,
  DEMO_GROUP,
  DEMO_GROUP_TRADES,
  DEMO_LESSONS,
  DEMO_MEMBERS,
  DEMO_PRICES,
  DEMO_SIGNALS,
  demoSeries,
} from "@/lib/demo";
import type {
  ActivityItem,
  Calibration,
  CatalystRow,
  ClubMember,
  Contribution,
  Decision,
  Fund,
  GrokPulseWeek,
  Holding,
  MarketSignals,
  NavSnapshot,
  Trade,
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

// Convertit les positions en mode « seed » (quantity=1 + value_t0 = valeur € à t0) en
// parts fractionnaires réelles via le cours live, pour une valorisation correcte qui suit
// le marché. Sans cours (ticker non couvert) : ancrage à la valeur t0 (stable, pnl 0).
// Les positions déjà en vraies parts (quantity ≠ 1) passent inchangées.
function normalizeBook<
  T extends { ticker: string; quantity: number; avg_cost: number; value_t0?: number }
>(positions: T[], prices: Record<string, number>): T[] {
  return positions.map((p) => {
    if (p.quantity === 1 && typeof p.value_t0 === "number" && p.value_t0 > 0) {
      const price = prices[p.ticker.toUpperCase()];
      if (typeof price === "number" && price > 0) {
        const shares = p.value_t0 / price;
        return { ...p, quantity: shares, avg_cost: p.avg_cost / shares };
      }
      return { ...p, quantity: 1, avg_cost: p.value_t0 };
    }
    return p;
  });
}

function enrich(
  kind: "group" | "ai",
  name: string,
  startCapital: number,
  cash: number,
  raw: { ticker: string; quantity: number; avg_cost: number; value_t0?: number; thesis?: string }[],
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
      // Capital injecté IA = capital t0 du book + apports (mêmes apports que le groupe) →
      // les apports ne comptent pas comme du rendement.
      (aiFile?.start_capital ?? aiFundRow?.start_capital ?? 0) + apportsTotal,
      aiCash,
      normalizeBook(aiPositions, prices),
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

    // Point « aujourd'hui » en temps réel : les snapshots ne sont écrits que par le cron
    // (22:00 UTC, lun-ven) — la courbe resterait sinon figée à la dernière clôture (ex.
    // vendredi) toute la journée. On prolonge jusqu'à la valeur live pour que la courbe
    // colle toujours au grand chiffre affiché. Quand le cron écrira le snapshot du jour,
    // il remplacera proprement ce point au prochain chargement.
    const today = new Date().toISOString().slice(0, 10);
    const last = series[series.length - 1];
    if (!last || last.date < today) {
      series.push({ date: today, group: group.nav, ai: ai.nav });
    } else if (last.date === today) {
      last.group = group.nav;
      last.ai = ai.nav;
    }

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

// ── Calendrier des catalyseurs ────────────────────────────────────────
// Parse les tableaux markdown de catalysts.md en lignes structurées.
export function parseCatalysts(markdown: string): CatalystRow[] {
  const out: CatalystRow[] = [];
  for (const raw of markdown.split("\n")) {
    const line = raw.trim();
    if (!line.startsWith("|")) continue;
    const cells = line.split("|").slice(1, -1).map((c) => c.trim());
    if (cells.length < 8) continue;
    const [date, event, type, affects, risk, positioning, confidence, status] = cells;
    // saute l'en-tête, le séparateur (---) et la ligne placeholder vide
    if (/^date$/i.test(date) || /^[-: ]+$/.test(date) || date === "—" || !event || event === "—") continue;
    out.push({ date, event, type, affects, risk, positioning, confidence, status });
  }
  return out;
}

export interface CatalystsData {
  demo: boolean;
  upcoming: CatalystRow[];
  past: CatalystRow[];
}

function splitCatalysts(demo: boolean, rows: CatalystRow[]): CatalystsData {
  const isPast = (r: CatalystRow) => /pass/i.test(r.status);
  const upcoming = rows
    .filter((r) => !isPast(r))
    .sort((a, b) => a.date.localeCompare(b.date));
  const past = rows.filter(isPast).sort((a, b) => b.date.localeCompare(a.date));
  return { demo, upcoming, past };
}

export async function getCatalysts(): Promise<CatalystsData> {
  if (!isConfigured()) return splitCatalysts(true, parseCatalysts(DEMO_CATALYSTS));
  const md = await fetchCatalysts();
  if (!md) return splitCatalysts(true, parseCatalysts(DEMO_CATALYSTS));
  const rows = parseCatalysts(md);
  if (rows.length === 0) return splitCatalysts(true, parseCatalysts(DEMO_CATALYSTS));
  return splitCatalysts(false, rows);
}

// ── Radar de marché (signaux quantitatifs par titre) ──────────────────
export async function getMarketRadar(): Promise<{ demo: boolean; signals: MarketSignals }> {
  if (!isConfigured()) return { demo: true, signals: DEMO_SIGNALS };
  const s = await fetchSignals();
  if (!s || !s.tickers || Object.keys(s.tickers).length === 0) {
    return { demo: true, signals: DEMO_SIGNALS };
  }
  return { demo: false, signals: s };
}

// ── Pouls du marché (Grok/X), semaine par semaine ─────────────────────
export interface GrokPulseData {
  demo: boolean;
  weeks: GrokPulseWeek[]; // plus récente d'abord
}

const byWeekDesc = (a: GrokPulseWeek, b: GrokPulseWeek) =>
  (b.date || b.week).localeCompare(a.date || a.week);

export async function getGrokPulse(): Promise<GrokPulseData> {
  if (!isConfigured()) return { demo: true, weeks: [...DEMO_GROK_PULSE].sort(byWeekDesc) };
  const file = await fetchGrokPulse();
  const weeks = file?.weeks ?? [];
  if (weeks.length === 0) return { demo: true, weeks: [...DEMO_GROK_PULSE].sort(byWeekDesc) };
  return { demo: false, weeks: [...weeks].sort(byWeekDesc) };
}

// ── Flux d'activité (mouvements réalisés des deux fonds) ───────────────
export interface ActivityData {
  demo: boolean;
  ai: ActivityItem[];
  group: ActivityItem[];
}

const isRealTrade = (t: { ticker?: string; quantity?: number }) =>
  Boolean(t.ticker) && t.ticker !== "SEED" && Number(t.quantity) > 0;

export async function getActivity(limit = 8): Promise<ActivityData> {
  const toItem = (
    fund: "ai" | "group",
    t: { ts: string; side: "buy" | "sell"; ticker: string; quantity: number; price: number; rationale?: string | null; confidence?: ActivityItem["confidence"] }
  ): ActivityItem => ({
    fund,
    ts: t.ts,
    side: t.side,
    ticker: t.ticker.toUpperCase(),
    quantity: t.quantity,
    price: t.price,
    amount: t.quantity * t.price,
    rationale: t.rationale ?? null,
    confidence: t.confidence,
  });

  if (!isConfigured()) {
    return {
      demo: true,
      ai: DEMO_AI_TRADES.map((t) => toItem("ai", t)).slice(0, limit),
      group: DEMO_GROUP_TRADES.map((t) => toItem("group", t)).slice(0, limit),
    };
  }

  try {
    const aiFile = await fetchAiFund();
    const aiItems = (aiFile?.trades ?? [])
      .filter(isRealTrade)
      .map((t) => toItem("ai", t))
      .reverse()
      .slice(0, limit);

    const supabase = await createClient();
    const { data: fundsData } = await supabase.from("funds").select("id, kind");
    const groupId = ((fundsData ?? []) as { id: string; kind: string }[]).find((f) => f.kind === "group")?.id;
    let groupItems: ActivityItem[] = [];
    if (groupId) {
      const { data: tr } = await supabase
        .from("trades")
        .select("*")
        .eq("fund_id", groupId)
        .order("ts", { ascending: false })
        .limit(limit);
      groupItems = ((tr ?? []) as Trade[]).filter(isRealTrade).map((t) => toItem("group", t));
    }

    // En prod : on montre le réel (même vide) — pas de mouvements de démo trompeurs.
    return { demo: false, ai: aiItems, group: groupItems };
  } catch {
    return {
      demo: true,
      ai: DEMO_AI_TRADES.map((t) => toItem("ai", t)).slice(0, limit),
      group: DEMO_GROUP_TRADES.map((t) => toItem("group", t)).slice(0, limit),
    };
  }
}

// ── Top mouvements du jour (variation des positions détenues) ─────────
export interface Mover {
  ticker: string;
  changePct: number;
}
export interface MoversData {
  demo: boolean;
  gainers: Mover[];
  losers: Mover[];
}

const DEMO_MOVERS: MoversData = {
  demo: true,
  gainers: [
    { ticker: "BNP.PA", changePct: 0.021 },
    { ticker: "AMZN", changePct: 0.014 },
    { ticker: "LOTB", changePct: 0.009 },
  ],
  losers: [
    { ticker: "MSTR", changePct: -0.038 },
    { ticker: "NOVOB", changePct: -0.017 },
    { ticker: "SAP", changePct: -0.011 },
  ],
};

// Top 3 hausses / 3 baisses du jour parmi les titres détenus (groupe ∪ IA = mêmes titres).
export async function getMovers(tickers: string[]): Promise<MoversData> {
  const unique = Array.from(new Set(tickers.map((t) => t.toUpperCase()))).filter(Boolean);
  if (!isConfigured() || unique.length === 0) return DEMO_MOVERS;
  try {
    const changes = await fetchYahooChanges(unique);
    const arr = Object.entries(changes).map(([ticker, changePct]) => ({ ticker, changePct }));
    if (arr.length === 0) return DEMO_MOVERS;
    const sorted = [...arr].sort((a, b) => b.changePct - a.changePct);
    return {
      demo: false,
      gainers: sorted.filter((m) => m.changePct >= 0).slice(0, 3),
      losers: sorted.filter((m) => m.changePct < 0).slice(-3).reverse(),
    };
  } catch {
    return { demo: false, gainers: [], losers: [] };
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
