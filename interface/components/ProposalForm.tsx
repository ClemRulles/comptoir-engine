"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ProposalForm({ demo }: { demo: boolean }) {
  const router = useRouter();
  const [ticker, setTicker] = useState("");
  const [thesis, setThesis] = useState("");
  const [size, setSize] = useState("");
  const [horizon, setHorizon] = useState("Long terme");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker, thesis, size, horizon }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j.error ?? "Erreur");
      } else {
        setTicker("");
        setThesis("");
        setSize("");
        setOk(true);
        setTimeout(() => setOk(false), 2500);
        router.refresh();
      }
    } catch {
      setError("Erreur réseau");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={submit} className="card-p space-y-3">
      {demo && (
        <p className="rounded-lg border border-ai/30 bg-ai/5 px-3 py-2 text-sm">
          Mode démo : l&apos;envoi sera actif sur l&apos;app en ligne.
        </p>
      )}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <label className="label">Ticker</label>
          <input className="input mt-1" value={ticker} onChange={(e) => setTicker(e.target.value)} placeholder="NVDA" required />
        </div>
        <div>
          <label className="label">Taille suggérée</label>
          <input className="input mt-1" value={size} onChange={(e) => setSize(e.target.value)} placeholder="ex. 5% / 500 €" />
        </div>
        <div>
          <label className="label">Horizon</label>
          <select className="input mt-1" value={horizon} onChange={(e) => setHorizon(e.target.value)}>
            <option>Long terme</option>
            <option>Tactique</option>
          </select>
        </div>
      </div>
      <div>
        <label className="label">Thèse (pourquoi ?)</label>
        <textarea
          className="input mt-1 min-h-24"
          value={thesis}
          onChange={(e) => setThesis(e.target.value)}
          placeholder="Catalyseur, valorisation, ce qui invaliderait la thèse…"
          required
        />
      </div>
      <div className="flex items-center gap-3">
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? "Envoi…" : "Proposer & notifier le groupe"}
        </button>
        {ok && <span className="text-sm text-brand-600">✓ Proposition envoyée, le groupe est notifié.</span>}
        {error && <span className="text-sm text-danger">{error}</span>}
      </div>
    </form>
  );
}
