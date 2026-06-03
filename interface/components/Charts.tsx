"use client";

import { Cell, Pie, PieChart, Tooltip } from "recharts";

const euro = (v: number) => `${Math.round(v).toLocaleString("fr-FR")} €`;

const SLICE_COLORS = ["#16a34a", "#22c55e", "#10b981", "#84cc16", "#0d9488", "#65a30d"];
const sliceColor = (name: string, i: number) =>
  name === "Cash" ? "#cbd5e1" : SLICE_COLORS[i % SLICE_COLORS.length];

export function AllocationDonut({ slices }: { slices: { name: string; value: number }[] }) {
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
