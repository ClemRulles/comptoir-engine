"use client";

import { useEffect, useState } from "react";
import type { Holding } from "@/lib/types";
import { TickerSearch } from "@/components/TickerSearch";
import { TickerCell } from "@/components/StockDrawer";

const eur = (n: number) => `${Math.round(n).toLocaleString("fr-FR")} €`;

export function HoldingsEditor() {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [ticker, setTicker] = useState("");
  const [tickerName, setTickerName] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/holdings");
      if (res.ok) {
        const { holdings } = await res.json();
        setHoldings(holdings ?? []);
      } else setHoldings([]);
    } catch {
      setHoldings([]);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const existing = holdings.find((h) => h.ticker === ticker.toUpperCase());

  async function invest(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setOk(null);
    setBusy(true);
    const res = await fetch("/api/holdings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticker, amount }),
    });
    const j = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(j.error ?? "Connexion requise (déploiement).");
      return;
    }
    setOk(`${eur(Number(amount))} ${j.reinforced ? "ajoutés à" : "investis dans"} ${ticker}.`);
    setTicker("");
    setTickerName("");
    setAmount("");
    load();
  }

  async function sell(t: string) {
    if (!confirm(`Vendre toute la position ${t} ? Le cash sera recrédité à sa valeur de marché.`)) return;
    setError(null);
    setOk(null);
    const res = await fetch("/api/holdings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticker: t, sell: true }),
    });
    const j = await res.json().catch(() => ({}));
    if (res.ok) setOk(`${t} vendu — ${eur(j.creditedCash ?? 0)} recrédités en cash.`);
    else setError(j.error ?? "Erreur");
    load();
  }

  return (
    <div className="space-y-4">
      <form onSubmit={invest} className="card-p grid grid-cols-1 gap-3 sm:grid-cols-[2fr_1fr_auto] sm:items-end">
        <div>
          <label className="label">Titre / crypto</label>
          <TickerSearch
            value={ticker}
            onChange={(text) => {
              setTicker(text);
              setTickerName("");
            }}
            onSelect={(symbol, name) => {
              setTicker(symbol);
              setTickerName(name);
            }}
          />
          {tickerName && <p className="mt-1 text-xs text-brand-600">✓ {ticker} — {tickerName}</p>}
          {existing && (
            <p className="mt-1 text-xs text-muted">
              Déjà en portefeuille (~{eur(existing.quantity * existing.avg_cost)} investis) → ce montant s&apos;ajoutera.
            </p>
          )}
        </div>
        <div>
          <label className="label">Montant à investir (€)</label>
          <input
            className="input mt-1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="500"
            inputMode="decimal"
            required
          />
        </div>
        <button className="btn btn-primary" type="submit" disabled={busy || !ticker}>
          {busy ? "…" : existing ? "Renforcer" : "Investir"}
        </button>
        {error && <p className="text-sm text-danger sm:col-span-3">{error}</p>}
        {ok && <p className="text-sm text-brand-600 sm:col-span-3">✓ {ok}</p>}
      </form>

      <p className="px-1 text-xs text-muted">
        Tu mets juste le <strong>montant en euros</strong>. Le cash baisse d&apos;autant et la valeur
        investie monte d&apos;autant — la valeur du fonds ne change donc quasiment pas (on déplace du
        cash vers une position). Renforcer une position <strong>ajoute</strong> à l&apos;existant.
      </p>

      <div className="card-p overflow-x-auto">
        {loading ? (
          <p className="text-sm text-muted">Chargement…</p>
        ) : holdings.length === 0 ? (
          <p className="text-sm text-muted">Aucune position enregistrée pour l&apos;instant.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="label border-b border-line">
                <th className="py-2 text-left font-semibold">Titre</th>
                <th className="text-right font-semibold">Investi (≈)</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((h) => (
                <tr key={h.id} className="border-b border-line/60">
                  <td className="py-2"><TickerCell ticker={h.ticker} /></td>
                  <td className="text-right tabular-nums">{eur(h.quantity * h.avg_cost)}</td>
                  <td className="text-right">
                    <button onClick={() => sell(h.ticker)} className="text-sm text-danger hover:underline">
                      Vendre
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
