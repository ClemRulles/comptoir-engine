"use client";

import { useEffect, useMemo, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

// Périodes proposables pour justifier une idée. `days` sert à découper l'historique 1 an
// renvoyé par /api/ticker-history côté client (pas de second appel réseau).
export const PROPOSAL_RANGES: { key: string; label: string; days: number }[] = [
  { key: "1S", label: "1 sem.", days: 7 },
  { key: "1M", label: "1 mois", days: 30 },
  { key: "3M", label: "3 mois", days: 90 },
  { key: "1A", label: "1 an", days: 365 },
];

const MONTHS = ["jan", "fév", "mar", "avr", "mai", "jun", "jul", "aoû", "sep", "oct", "nov", "déc"];

interface Point {
  date: string;
  close: number;
}

function fmtMoney(v: number, currency: string) {
  try {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: currency || "EUR",
      maximumFractionDigits: v < 10 ? 3 : 2,
    }).format(v);
  } catch {
    return `${v.toFixed(2)} ${currency}`;
  }
}

// Mini-graphe de cours d'un titre sur une période, joint à une proposition pour la justifier.
// Compact, cohérent avec le StockDrawer (mêmes couleurs/tokens). En lecture seule ici — le
// clic sur le ticker (TickerCell de la bulle) ouvre le graphique détaillé.
export function ProposalChart({ ticker, range }: { ticker: string; range: string }) {
  const [points, setPoints] = useState<Point[] | null>(null);
  const [currency, setCurrency] = useState("");
  const [err, setErr] = useState(false);

  useEffect(() => {
    let alive = true;
    setPoints(null);
    setErr(false);
    fetch(`/api/ticker-history?symbol=${encodeURIComponent(ticker)}`)
      .then((r) => r.json())
      .then((d) => {
        if (!alive) return;
        if (d.error || !d.points?.length) {
          setErr(true);
          return;
        }
        setCurrency(d.currency ?? "");
        setPoints(d.points as Point[]);
      })
      .catch(() => alive && setErr(true));
    return () => {
      alive = false;
    };
  }, [ticker]);

  const r = PROPOSAL_RANGES.find((x) => x.key === range) ?? PROPOSAL_RANGES[1];

  const filtered = useMemo(() => {
    if (!points?.length) return [] as Point[];
    const cutoff = new Date(points[points.length - 1].date);
    cutoff.setDate(cutoff.getDate() - r.days);
    const cutoffStr = cutoff.toISOString().slice(0, 10);
    const f = points.filter((p) => p.date >= cutoffStr);
    return f.length >= 2 ? f : points.slice(-2);
  }, [points, r.days]);

  const perf = useMemo(() => {
    if (filtered.length < 2) return 0;
    const a = filtered[filtered.length - 1].close;
    const b = filtered[0].close;
    return b ? (a - b) / b : 0;
  }, [filtered]);

  if (err) {
    return (
      <div className="mt-1 rounded-lg border border-line bg-bg px-3 py-2 text-xs text-muted">
        Graphique indisponible pour {ticker}.
      </div>
    );
  }

  const up = perf >= 0;
  const stroke = up ? "#16a34a" : "#ef4444";
  const gradId = `g-prop-${up ? "up" : "down"}`;

  const fmtTick = (d: string) => {
    const [, m, day] = d.split("-");
    return r.days <= 31 ? `${day}/${m}` : MONTHS[Number(m) - 1] ?? m;
  };

  return (
    <div className="mt-1 rounded-xl border border-line bg-bg/60 p-2">
      <div className="mb-1 flex items-center justify-between px-1">
        <span className="text-[11px] font-medium text-muted">Cours · {r.label}</span>
        <span className={`text-xs font-semibold tabular-nums ${up ? "up" : "down"}`}>
          {points == null
            ? "…"
            : `${perf >= 0 ? "+" : ""}${(perf * 100).toFixed(1).replace(".", ",")} %`}
        </span>
      </div>
      {points == null ? (
        <div className="h-[96px] animate-pulse rounded-lg bg-line/40" />
      ) : filtered.length < 2 ? (
        <div className="flex h-[96px] items-center justify-center text-xs text-muted">
          Pas assez de données.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={96}>
          <AreaChart data={filtered} margin={{ top: 4, right: 6, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="g-prop-up" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#16a34a" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#16a34a" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="g-prop-down" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity={0.26} />
                <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              stroke="rgb(var(--chart-axis))"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              minTickGap={32}
              tickFormatter={fmtTick}
            />
            <YAxis hide domain={["auto", "auto"]} />
            <Tooltip
              contentStyle={{
                background: "rgb(var(--chart-tooltip-bg))",
                border: "1px solid rgb(var(--c-line))",
                borderRadius: 10,
                color: "rgb(var(--c-ink))",
                fontSize: 12,
              }}
              labelFormatter={(d) => String(d).split("-").reverse().join("/")}
              formatter={(v: number) => [fmtMoney(v, currency), "Cours"]}
            />
            <Area
              type="monotone"
              dataKey="close"
              stroke={stroke}
              strokeWidth={2}
              fill={`url(#${gradId})`}
              animationDuration={500}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
