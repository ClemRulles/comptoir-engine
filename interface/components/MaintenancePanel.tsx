"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Step = { key: string; label: string; path: string; hint: string };

const STEPS: Step[] = [
  { key: "seed", label: "1 · Encoder le groupe", path: "/api/cron/seed-group", hint: "Convertit vos 15 positions en parts réelles via les cours." },
  { key: "value", label: "2 · Valoriser le jour", path: "/api/cron/value", hint: "Écrit le point NAV du jour pour les deux fonds." },
  { key: "backfill", label: "3 · Courbes du passé", path: "/api/cron/backfill?days=180", hint: "Reconstitue ~6 mois d'historique." },
];

export function MaintenancePanel({ demo }: { demo: boolean }) {
  const router = useRouter();
  const [running, setRunning] = useState<string | null>(null);
  const [result, setResult] = useState<{ step: string; data: unknown; ok: boolean } | null>(null);

  async function run(step: Step) {
    if (demo) return;
    setRunning(step.key);
    setResult(null);
    try {
      const res = await fetch(step.path, { method: "GET" });
      const data = await res.json().catch(() => ({}));
      setResult({ step: step.label, data, ok: res.ok });
      if (res.ok) router.refresh();
    } catch {
      setResult({ step: step.label, data: { error: "Erreur réseau" }, ok: false });
    }
    setRunning(null);
  }

  return (
    <div className="card-p">
      <h2 className="text-base font-bold tracking-tight">Synchronisation des données</h2>
      <p className="mt-1 text-sm text-muted">
        À lancer <strong>une fois</strong>, dans l&apos;ordre, pour activer la valorisation réelle et
        les courbes. Réservé aux membres connectés.
        {demo && " (Indisponible en mode démo.)"}
      </p>

      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        {STEPS.map((s) => (
          <div key={s.key} className="rounded-xl border border-line p-3">
            <button
              onClick={() => run(s)}
              disabled={demo || running !== null}
              className="btn btn-primary w-full justify-center disabled:opacity-50"
            >
              {running === s.key ? "…" : s.label}
            </button>
            <p className="mt-2 text-xs text-muted">{s.hint}</p>
          </div>
        ))}
      </div>

      {result && (
        <div className="mt-4">
          <div className={`text-sm font-semibold ${result.ok ? "text-brand-600" : "text-danger"}`}>
            {result.ok ? "✓" : "✗"} {result.step}
          </div>
          <pre className="mt-1 max-h-64 overflow-auto rounded-lg bg-bg p-3 text-xs leading-relaxed">
            {JSON.stringify(result.data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
