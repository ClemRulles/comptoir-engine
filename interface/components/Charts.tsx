"use client";

import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { CalibrationBucket } from "@/lib/types";

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

// Couleur du hit-rate : vert si la confiance est méritée, rouge si sur-confiance.
const calibColor = (b: CalibrationBucket) => {
  if (b.n === 0) return "#cbd5e1";
  if (b.hit_rate >= 0.6) return "#16a34a";
  if (b.hit_rate >= 0.45) return "#f59e0b";
  return "#dc2626";
};

// Courbe de calibration : par niveau de confiance annoncé, le taux de réussite RÉEL.
// Une IA honnête a des barres qui montent de Basse → Haute.
export function CalibrationChart({ buckets }: { buckets: CalibrationBucket[] }) {
  // Ordonne Basse → Moyenne → Haute (sens de lecture de la calibration).
  const order = ["Basse", "Moyenne", "Haute"];
  const data = [...buckets]
    .sort((a, b) => order.indexOf(a.confidence) - order.indexOf(b.confidence))
    .map((b) => ({ ...b, hitPct: Math.round(b.hit_rate * 100) }));

  if (data.every((d) => d.n === 0)) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-muted">
        Pas encore de décisions clôturées — la calibration apparaîtra ici.
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: 240 }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 16, right: 8, left: -16, bottom: 0 }}>
          <XAxis dataKey="confidence" tickLine={false} axisLine={false} fontSize={12} stroke="#64748b" />
          <YAxis
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
            tickLine={false}
            axisLine={false}
            fontSize={12}
            stroke="#94a3b8"
          />
          <ReferenceLine y={50} stroke="#cbd5e1" strokeDasharray="4 4" />
          <Tooltip
            cursor={{ fill: "rgba(148,163,184,0.08)" }}
            contentStyle={{ background: "#fff", border: "1px solid #e7ebf1", borderRadius: 12 }}
            formatter={(v: number, _n, p) => [`${v}% réussite · ${p.payload.n} décision(s)`, "Taux réel"]}
          />
          <Bar dataKey="hitPct" radius={[8, 8, 0, 0]} maxBarSize={64} isAnimationActive={false}>
            {data.map((d) => (
              <Cell key={d.confidence} fill={calibColor(d)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
