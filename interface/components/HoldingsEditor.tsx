"use client";

import { useEffect, useState } from "react";
import type { Holding } from "@/lib/types";

export function HoldingsEditor() {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [ticker, setTicker] = useState("");
  const [quantity, setQuantity] = useState("");
  const [avgCost, setAvgCost] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/holdings");
      if (res.ok) {
        const { holdings } = await res.json();
        setHoldings(holdings ?? []);
      } else {
        setHoldings([]);
      }
    } catch {
      setHoldings([]);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/holdings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticker, quantity, avg_cost: avgCost }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "Connexion requise (déploiement).");
      return;
    }
    setTicker("");
    setQuantity("");
    setAvgCost("");
    load();
  }

  async function sell(t: string, cost: number) {
    await fetch("/api/holdings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticker: t, quantity: 0, avg_cost: cost }),
    });
    load();
  }

  return (
    <div className="space-y-4">
      <form onSubmit={save} className="card-p grid grid-cols-1 gap-3 sm:grid-cols-4 sm:items-end">
        <div>
          <label className="label">Ticker</label>
          <input className="input mt-1" value={ticker} onChange={(e) => setTicker(e.target.value)} placeholder="AAPL" required />
        </div>
        <div>
          <label className="label">Quantité</label>
          <input className="input mt-1" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="10" inputMode="decimal" required />
        </div>
        <div>
          <label className="label">Prix de revient (€)</label>
          <input className="input mt-1" value={avgCost} onChange={(e) => setAvgCost(e.target.value)} placeholder="180" inputMode="decimal" required />
        </div>
        <button className="btn btn-primary" type="submit">Enregistrer</button>
        {error && <p className="text-sm text-danger sm:col-span-4">{error}</p>}
      </form>

      <div className="card-p overflow-x-auto">
        {loading ? (
          <p className="text-sm text-muted">Chargement…</p>
        ) : holdings.length === 0 ? (
          <p className="text-sm text-muted">Aucune position enregistrée pour l&apos;instant.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="label border-b border-line">
                <th className="py-2 text-left font-semibold">Ticker</th>
                <th className="text-right font-semibold">Quantité</th>
                <th className="text-right font-semibold">PRU</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((h) => (
                <tr key={h.id} className="border-b border-line/60">
                  <td className="py-2 font-semibold">{h.ticker}</td>
                  <td className="text-right tabular-nums">{h.quantity}</td>
                  <td className="text-right tabular-nums text-muted">{h.avg_cost} €</td>
                  <td className="text-right">
                    <button onClick={() => sell(h.ticker, h.avg_cost)} className="text-sm text-danger hover:underline">
                      Vendre / retirer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
