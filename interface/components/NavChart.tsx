"use client";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

type Point = { date: string; group: number | null; ai: number | null };

export function NavChart({ data }: { data: Point[] }) {
  if (!data.length) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-gray-500">
        Pas encore de données de valorisation. La première courbe apparaîtra après le premier
        passage du cron quotidien.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
        <CartesianGrid stroke="#262b36" strokeDasharray="3 3" />
        <XAxis dataKey="date" stroke="#6b7280" fontSize={11} />
        <YAxis stroke="#6b7280" fontSize={11} width={56} />
        <Tooltip
          contentStyle={{ background: "#171a21", border: "1px solid #262b36", borderRadius: 8 }}
          labelStyle={{ color: "#e7e9ee" }}
          formatter={(v: number) => `${Math.round(v).toLocaleString("fr-FR")} €`}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="group"
          name="Fonds groupe"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={false}
          connectNulls
        />
        <Line
          type="monotone"
          dataKey="ai"
          name="Fonds IA"
          stroke="#f59e0b"
          strokeWidth={2}
          dot={false}
          connectNulls
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
