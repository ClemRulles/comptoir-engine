"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { pct } from "@/lib/fund";

type Point = { date: string; group: number; ai: number };
type Mode = "both" | "group" | "ai";

const RANGES: { key: string; label: string; days: number }[] = [
  { key: "1J", label: "1J", days: 1 },
  { key: "1S", label: "1S", days: 7 },
  { key: "1M", label: "1M", days: 30 },
  { key: "3M", label: "3M", days: 90 },
  { key: "1A", label: "1A", days: 365 },
  { key: "MAX", label: "Max", days: 1e9 },
];

const MONTHS = ["jan", "fév", "mar", "avr", "mai", "jun", "jul", "aoû", "sep", "oct", "nov", "déc"];
const euro = (v: number) => `${Math.round(v).toLocaleString("fr-FR")} €`;

export function PerfChart({ data, mode = "both" }: { data: Point[]; mode?: Mode }) {
  const [range, setRange] = useState("3M");

  const { filtered, days } = useMemo(() => {
    if (!data.length) return { filtered: [] as Point[], days: 0 };
    const r = RANGES.find((x) => x.key === range)!;
    let f: Point[];
    if (r.days >= 1e9) {
      // « Max » : toutes les données (ne pas calculer de date de coupe — 1e9 jours = date invalide).
      f = data;
    } else {
      const cutoff = new Date(data[data.length - 1].date);
      cutoff.setDate(cutoff.getDate() - r.days);
      const cutoffStr = cutoff.toISOString().slice(0, 10);
      f = data.filter((p) => p.date >= cutoffStr);
    }
    return { filtered: f.length >= 2 ? f : data.slice(-2), days: r.days };
  }, [data, range]);

  const fmtTick = (d: string) => {
    const [, m, day] = d.split("-");
    if (days <= 31) return `${day}/${m}`;
    return MONTHS[Number(m) - 1] ?? m;
  };

  const rangePerf = (sel: (p: Point) => number) => {
    if (filtered.length < 2) return 0;
    const a = sel(filtered[filtered.length - 1]);
    const b = sel(filtered[0]);
    return b ? (a - b) / b : 0;
  };

  const showGroup = mode === "both" || mode === "group";
  const showAi = mode === "both" || mode === "ai";

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {showGroup && (
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-brand" /> Groupe
              <b className={rangePerf((p) => p.group) >= 0 ? "up" : "down"}>{pct(rangePerf((p) => p.group))}</b>
            </span>
          )}
          {showAi && (
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-ai" /> IA
              <b className={rangePerf((p) => p.ai) >= 0 ? "up" : "down"}>{pct(rangePerf((p) => p.ai))}</b>
            </span>
          )}
        </div>
        <div className="seg">
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={`seg-btn ${range === r.key ? "seg-btn-active" : ""}`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {data.length === 0 ? (
        <div className="flex h-72 items-center justify-center text-sm text-muted">
          La courbe apparaîtra après la première valorisation quotidienne.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart key={range} data={filtered} margin={{ top: 10, right: 8, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="g-group" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#16a34a" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#16a34a" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="g-ai" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#eef1f5" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#9aa7b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              minTickGap={36}
              tickFormatter={fmtTick}
            />
            <YAxis
              stroke="#9aa7b8"
              fontSize={11}
              width={52}
              tickLine={false}
              axisLine={false}
              domain={["auto", "auto"]}
              tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`}
            />
            <Tooltip
              contentStyle={{ background: "#fff", border: "1px solid #e7ebf1", borderRadius: 12 }}
              labelFormatter={(d) => String(d).split("-").reverse().join("/")}
              formatter={(v: number, name) => [euro(v), name === "group" ? "Groupe" : "IA"]}
            />
            {showGroup && (
              <Area
                type="monotone"
                dataKey="group"
                name="group"
                stroke="#16a34a"
                strokeWidth={2.5}
                fill="url(#g-group)"
                animationDuration={700}
                connectNulls
              />
            )}
            {showAi && (
              <Area
                type="monotone"
                dataKey="ai"
                name="ai"
                stroke="#f59e0b"
                strokeWidth={2.5}
                fill="url(#g-ai)"
                animationDuration={700}
                connectNulls
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
