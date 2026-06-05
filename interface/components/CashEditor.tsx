"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Fixe le cash de marge (trésorerie non investie) du fonds groupe. Il entre dans le NAV.
export function CashEditor({ currentCash, demo }: { currentCash: number; demo: boolean }) {
  const router = useRouter();
  const [cash, setCash] = useState(String(Math.round(currentCash)));
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (demo) return;
    setError(null);
    setMsg(null);
    setLoading(true);
    try {
      const res = await fetch("/api/fund-cash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cash: Number(cash) }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) setError(j.error ?? "Erreur");
      else {
        setMsg("✓ Trésorerie mise à jour.");
        router.refresh();
      }
    } catch {
      setError("Erreur réseau");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={save} className="card-p">
      <h2 className="text-base font-bold tracking-tight">Trésorerie (cash de marge)</h2>
      <p className="mt-1 text-sm text-muted">
        Le cash non investi que le groupe garde en réserve. Il <strong>compte dans le NAV</strong>{" "}
        (on n&apos;investit pas tout) et n&apos;est pas du rendement. L&apos;IA démarre avec la même
        réserve et gère la sienne.
      </p>
      <div className="mt-3 flex flex-wrap items-end gap-3">
        <div>
          <label className="label">Cash disponible (€)</label>
          <input
            className="input mt-1 w-40"
            value={cash}
            onChange={(e) => setCash(e.target.value)}
            inputMode="decimal"
            placeholder="500"
          />
        </div>
        <button type="submit" disabled={loading || demo} className="btn btn-primary">
          {loading ? "…" : "Enregistrer"}
        </button>
        {msg && <span className="text-sm text-brand-600">{msg}</span>}
        {error && <span className="text-sm text-danger">{error}</span>}
        {demo && <span className="text-sm text-muted">Mode démo : actif sur l&apos;app en ligne.</span>}
      </div>
    </form>
  );
}
