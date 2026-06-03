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
    const res = await fetch("/api/holdings");
    if (res.ok) {
      const { holdings } = await res.json();
      setHoldings(holdings ?? []);
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
      setError(j.error ?? "Erreur");
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
      <form onSubmit={save} className="card grid grid-cols-1 gap-3 sm:grid-cols-4 sm:items-end">
        <div>
          <label className="mb-1 block text-xs text-gray-400">Ticker</label>
          <input className="input" value={ticker} onChange={(e) => setTicker(e.target.value)} placeholder="AAPL" required />
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-400">Quantité</label>
          <input className="input" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="10" inputMode="decimal" required />
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-400">Prix de revient (€)</label>
          <input className="input" value={avgCost} onChange={(e) => setAvgCost(e.target.value)} placeholder="180" inputMode="decimal" required />
        </div>
        <button className="btn btn-primary" type="submit">Enregistrer</button>
        {error && <p className="text-sm text-red-400 sm:col-span-4">{error}</p>}
      </form>

      <div className="card overflow-x-auto">
        {loading ? (
          <p className="text-sm text-gray-500">Chargement…</p>
        ) : holdings.length === 0 ? (
          <p className="text-sm text-gray-500">Aucune position. Ajoute-en une ci-dessus.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400">
                <th className="py-2">Ticker</th>
                <th>Quantité</th>
                <th>Prix de revient</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((h) => (
                <tr key={h.id} className="border-t border-edge">
                  <td className="py-2 font-medium">{h.ticker}</td>
                  <td>{h.quantity}</td>
                  <td>{h.avg_cost} €</td>
                  <td className="text-right">
                    <button onClick={() => sell(h.ticker, h.avg_cost)} className="text-sm text-red-400 hover:underline">
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
