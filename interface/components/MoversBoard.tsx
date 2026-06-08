"use client";

import { useEffect, useState } from "react";
import type { Mover } from "@/lib/data";
import { TickerLogo } from "@/components/TickerLogo";
import { Sparkline } from "@/components/Sparkline";
import { useStockDrawer } from "@/components/StockDrawer";

function pctSigned(n: number): string {
  return `${n >= 0 ? "+" : ""}${(n * 100).toFixed(1).replace(".", ",")} %`;
}

// Carte d'un mouvement : logo + ticker + mini-courbe du dernier mois + variation du jour.
// La carte entière ouvre le graphique détaillé (tiroir partagé).
function MoverCard({ m }: { m: Mover }) {
  const openStock = useStockDrawer();
  const [spark, setSpark] = useState<number[] | null>(null);

  useEffect(() => {
    let alive = true;
    fetch(`/api/ticker-history?symbol=${encodeURIComponent(m.ticker)}`)
      .then((r) => r.json())
      .then((d) => {
        if (!alive || !d?.points?.length) return;
        // ~1 mois de séances (≈22 jours ouvrés).
        setSpark(d.points.slice(-22).map((p: { close: number }) => p.close));
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [m.ticker]);

  const dayUp = m.changePct >= 0;
  const monthUp = spark && spark.length > 1 ? spark[spark.length - 1] >= spark[0] : dayUp;
  const sparkColor = monthUp ? "#16a34a" : "#ef4444";

  return (
    <button
      type="button"
      onClick={() => openStock(m.ticker)}
      className="lift flex w-full items-center gap-3 rounded-xl border border-line bg-card px-3 py-2.5 text-left transition-all hover:border-brand/40"
    >
      <TickerLogo ticker={m.ticker} size={30} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-ink">{m.ticker}</span>
        <span className="block text-[11px] text-muted">1 mois</span>
      </span>
      <span className="shrink-0">
        {spark && spark.length > 1 ? (
          <Sparkline data={spark} color={sparkColor} width={72} height={28} />
        ) : (
          <span className="skeleton block h-7 w-[72px] rounded" />
        )}
      </span>
      <span
        className={`shrink-0 chip ${dayUp ? "bg-brand/10 text-brand-600" : "bg-danger/10 text-danger"}`}
      >
        {dayUp ? "▲" : "▼"} {pctSigned(m.changePct)}
      </span>
    </button>
  );
}

export function MoversBoard({ gainers, losers }: { gainers: Mover[]; losers: Mover[] }) {
  if (gainers.length === 0 && losers.length === 0) {
    return <p className="text-sm text-muted">Variation du jour indisponible pour l&apos;instant.</p>;
  }
  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
      <div className="space-y-2">
        <h3 className="label mb-1 text-brand-600">▲ Plus fortes hausses</h3>
        {gainers.length ? (
          gainers.map((m) => <MoverCard key={m.ticker} m={m} />)
        ) : (
          <p className="text-sm text-muted">—</p>
        )}
      </div>
      <div className="space-y-2">
        <h3 className="label mb-1 text-danger">▼ Plus fortes baisses</h3>
        {losers.length ? (
          losers.map((m) => <MoverCard key={m.ticker} m={m} />)
        ) : (
          <p className="text-sm text-muted">—</p>
        )}
      </div>
    </div>
  );
}
