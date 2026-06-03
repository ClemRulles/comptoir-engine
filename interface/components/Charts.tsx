"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const euro = (v: number) => `${Math.round(v).toLocaleString("fr-FR")} €`;

export function PerfAreaChart({
  data,
}: {
  data: { date: string; group: number; ai: number }[];
}) {
  if (!data.length) {
    return (
      <div className="flex h-72 items-center justify-center text-sm text-muted">
        La courbe apparaîtra après la première valorisation quotidienne.
      </div>
    );
  }
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 10, right: 8, bottom: 0, left: 0 }}>
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
        <XAxis dataKey="date" stroke="#9aa7b8" fontSize={11} tickLine={false} axisLine={false} />
        <YAxis
          stroke="#9aa7b8"
          fontSize={11}
          width={64}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `${Math.round(v / 1000)}k`}
        />
        <Tooltip
          contentStyle={{ background: "#fff", border: "1px solid #e7ebf1", borderRadius: 12 }}
          formatter={(v: number) => euro(v)}
        />
        <Legend />
        <Area
          type="monotone"
          dataKey="group"
          name="Fonds groupe"
          stroke="#16a34a"
          strokeWidth={2.5}
          fill="url(#g-group)"
          connectNulls
        />
        <Area
          type="monotone"
          dataKey="ai"
          name="Fonds IA"
          stroke="#f59e0b"
          strokeWidth={2.5}
          fill="url(#g-ai)"
          connectNulls
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

const SLICE_COLORS = ["#16a34a", "#22c55e", "#10b981", "#84cc16", "#0d9488", "#65a30d"];
const sliceColor = (name: string, i: number) =>
  name === "Cash" ? "#cbd5e1" : SLICE_COLORS[i % SLICE_COLORS.length];

export function AllocationDonut({
  slices,
}: {
  slices: { name: string; value: number }[];
}) {
  const total = slices.reduce((s, x) => s + x.value, 0);
  if (total <= 0) {
    return <div className="flex h-64 items-center justify-center text-sm text-muted">—</div>;
  }
  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: 220, height: 220 }}>
        <PieChart width={220} height={220}>
          <Pie
            data={slices}
            dataKey="value"
            nameKey="name"
            cx={110}
            cy={110}
            innerRadius={64}
            outerRadius={95}
            paddingAngle={2}
            stroke="none"
            isAnimationActive={false}
          >
            {slices.map((s, i) => (
              <Cell key={s.name} fill={sliceColor(s.name, i)} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ background: "#fff", border: "1px solid #e7ebf1", borderRadius: 12 }}
            formatter={(v: number) => euro(v)}
          />
        </PieChart>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-muted">Total</span>
          <span className="text-lg font-bold tabular-nums">{euro(total)}</span>
        </div>
      </div>
      <div className="mt-3 grid w-full grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
        {slices.map((s, i) => (
          <div key={s.name} className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-slate-600">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: sliceColor(s.name, i) }} />
              {s.name}
            </span>
            <span className="tabular-nums text-muted">{Math.round((s.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
