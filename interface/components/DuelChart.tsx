"use client";

// DuelChart — la course IA vs Groupe vs Marché, en PERFORMANCE (%), pas en euros.
// Même série que les cartes (lib/perf.ts) : en vue « Depuis le début », la légende affiche
// exactement le chiffre des cartes. Les apports des membres sont neutralisés (TWR) : un
// versement ne fait plus « monter » la courbe.
import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { PerfPoint } from "@/lib/perf";

const RANGES = [
  { key: "1S", label: "1S", days: 7 },
  { key: "1M", label: "1M", days: 30 },
  { key: "3M", label: "3M", days: 91 },
  { key: "MAX", label: "Depuis le début", days: Infinity },
] as const;

const C = { group: "#15803d", ai: "#d97706", market: "#94a3b8" };
const NAME = { group: "Groupe", ai: "IA", market: "Marché mondial" };
const MONTHS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
const pct = (v: number | null | undefined) =>
  v == null || !Number.isFinite(v) ? "—" : `${v >= 0 ? "+" : "−"}${Math.abs(v * 100).toFixed(1).replace(".", ",")} %`;

type Key = "group" | "ai" | "market";

export function DuelChart({
  points,
  show = ["group", "ai", "market"],
  height = 300,
  defaultRange = "MAX",
}: {
  points: PerfPoint[];
  show?: Key[];
  height?: number;
  defaultRange?: (typeof RANGES)[number]["key"];
}) {
  const [range, setRange] = useState<string>(defaultRange);
  const keys = show.filter((k) => k !== "market" || points.some((p) => p.market != null));

  const data = useMemo(() => {
    if (!points.length) return [];
    const r = RANGES.find((x) => x.key === range)!;
    let f = points;
    if (Number.isFinite(r.days)) {
      const cut = new Date(points[points.length - 1].date);
      cut.setDate(cut.getDate() - r.days);
      const from = cut.toISOString().slice(0, 10);
      let anchor = 0;
      for (let i = 0; i < points.length; i++) if (points[i].date <= from) anchor = i;
      f = points.slice(anchor);
    }
    if (f.length < 2) f = points.slice(-2);
    // Rebase au début de la fenêtre : (1 + p) / (1 + p₀) − 1, par série.
    const base: Record<Key, number | null> = { group: null, ai: null, market: null };
    for (const k of ["group", "ai", "market"] as Key[]) base[k] = f.find((p) => p[k] != null)?.[k] ?? null;
    return f.map((p) => {
      const o: Record<string, number | string | null> = { date: p.date };
      for (const k of ["group", "ai", "market"] as Key[]) {
        const v = p[k];
        const b = base[k];
        o[k] = v == null || b == null ? null : (1 + v) / (1 + b) - 1;
      }
      return o;
    });
  }, [points, range]);

  const last = (k: Key) => {
    for (let i = data.length - 1; i >= 0; i--) if (data[i][k] != null) return data[i][k] as number;
    return null;
  };
  const spanDays = data.length > 1 ? (new Date(String(data[data.length - 1].date)).getTime() - new Date(String(data[0].date)).getTime()) / 864e5 : 0;
  const fmtTick = (d: string) => {
    const [, m, day] = d.split("-");
    return spanDays <= 45 ? `${Number(day)} ${MONTHS[Number(m) - 1]}` : MONTHS[Number(m) - 1];
  };
  // Au-delà de ~6 semaines : un repère par mois (1er point de chaque mois), jamais de doublon.
  const ticks = useMemo(() => {
    if (spanDays <= 45) return undefined;
    const out: string[] = [];
    let prev = "";
    for (const p of data) {
      const ym = String(p.date).slice(0, 7);
      if (ym !== prev) {
        if (prev) out.push(String(p.date));
        prev = ym;
      }
    }
    return out;
  }, [data, spanDays]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        {/* Légende = identification directe des séries + leur performance sur la période. */}
        <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {keys.map((k) => (
            <li key={k} className="flex items-center gap-2 text-[13px]">
              <span
                className="inline-block h-[3px] w-5 rounded-full"
                style={k === "market" ? { backgroundImage: `repeating-linear-gradient(90deg, ${C.market} 0 5px, transparent 5px 8px)` } : { background: C[k] }}
              />
              <span className="text-muted">{NAME[k]}</span>
              <span className="num font-semibold text-ink">{pct(last(k))}</span>
            </li>
          ))}
        </ul>
        <div className="seg" role="tablist" aria-label="Période">
          {RANGES.map((r) => (
            <button key={r.key} role="tab" aria-selected={range === r.key} onClick={() => setRange(r.key)} className={`seg-btn ${range === r.key ? "seg-btn-active" : ""}`}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {data.length < 2 ? (
        <div className="well flex items-center justify-center text-sm text-muted" style={{ height }}>
          La courbe apparaîtra après la première valorisation quotidienne.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart id="duel-chart" data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="dg-ai" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={C.ai} stopOpacity={0.18} />
                <stop offset="100%" stopColor={C.ai} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="dg-group" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={C.group} stopOpacity={0.16} />
                <stop offset="100%" stopColor={C.group} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgb(var(--chart-grid))" vertical={false} />
            <ReferenceLine y={0} stroke="rgb(var(--chart-axis))" strokeOpacity={0.6} />
            <XAxis dataKey="date" stroke="rgb(var(--chart-axis))" fontSize={11} tickLine={false} axisLine={false} minTickGap={28} ticks={ticks} tickFormatter={fmtTick} />
            <YAxis
              stroke="rgb(var(--chart-axis))"
              fontSize={11}
              width={48}
              tickLine={false}
              axisLine={false}
              domain={["auto", "auto"]}
              tickFormatter={(v: number) => `${v >= 0 ? "+" : "−"}${Math.abs(v * 100).toFixed(0)} %`}
            />
            <Tooltip
              cursor={{ stroke: "rgb(var(--chart-axis))", strokeDasharray: "3 3" }}
              contentStyle={{ background: "rgb(var(--chart-tooltip-bg))", border: "1px solid rgb(var(--c-line))", borderRadius: 12, color: "rgb(var(--c-ink))", fontSize: 12, boxShadow: "0 12px 32px -12px rgba(0,0,0,.25)" }}
              labelFormatter={(d) => {
                const [y, m, day] = String(d).split("-");
                return `${Number(day)} ${MONTHS[Number(m) - 1]} ${y}`;
              }}
              formatter={(v: number, name: string) => [pct(v), NAME[name as Key] ?? name]}
              itemSorter={(it) => -Number(it.value ?? 0)}
            />
            {keys.includes("market") && (
              <Area type="monotone" dataKey="market" name="market" stroke={C.market} strokeWidth={2} strokeDasharray="5 4" fill="none" dot={false} activeDot={{ r: 4 }} connectNulls isAnimationActive={false} />
            )}
            {keys.includes("group") && (
              <Area type="monotone" dataKey="group" name="group" stroke={C.group} strokeWidth={2} fill="url(#dg-group)" dot={false} activeDot={{ r: 5, strokeWidth: 2, stroke: "rgb(var(--c-card))" }} connectNulls isAnimationActive={false} />
            )}
            {keys.includes("ai") && (
              <Area type="monotone" dataKey="ai" name="ai" stroke={C.ai} strokeWidth={2} fill="url(#dg-ai)" dot={false} activeDot={{ r: 5, strokeWidth: 2, stroke: "rgb(var(--c-card))" }} connectNulls isAnimationActive={false} />
            )}
          </AreaChart>
        </ResponsiveContainer>
      )}
      <p className="mt-2 text-[11px] text-muted">
        Performance pondérée dans le temps : les apports des membres sont neutralisés, seuls les choix d&apos;investissement comptent.
        {keys.includes("market") && " Marché mondial = MSCI World en euros (IWDA)."}
      </p>
    </div>
  );
}
