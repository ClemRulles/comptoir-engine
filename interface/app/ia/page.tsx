import { getAppData } from "@/lib/data";
import { fetchAiFund } from "@/lib/github";
import { DEMO_AI } from "@/lib/demo";
import { eur, pct } from "@/lib/fund";
import { AllocationDonut } from "@/components/Charts";
import { KpiCard, Delta, SectionTitle } from "@/components/Kpi";

export const dynamic = "force-dynamic";

export default async function IaPage() {
  const data = await getAppData();
  const f = data.ai;
  const file = data.demo ? DEMO_AI : await fetchAiFund();
  const slices = [
    ...f.holdings.map((h) => ({ name: h.ticker, value: h.marketValue })),
    { name: "Cash", value: f.cash },
  ].filter((s) => s.value > 0);
  const trades = file?.trades ?? [];

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted">
        Portefeuille <strong>fictif</strong> géré par l&apos;IA à partir de ses convictions. 100 % paper —
        aucun ordre réel. Mis à jour le vendredi par le moteur.
      </p>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <KpiCard label="Valeur (NAV)" value={eur(f.nav)} accent="ai" sub={<Delta value={f.perf} />} />
        <KpiCard label="Investi" value={eur(f.positionsValue)} accent="neutral" sub={<span className="text-muted">{f.holdings.length} positions</span>} />
        <KpiCard label="Cash" value={eur(f.cash)} accent="neutral" sub={<span className="text-muted">{pct(f.nav ? f.cash / f.nav : 0).replace("+", "")} du fonds</span>} />
        <KpiCard label="Δ cette semaine" value={pct(data.weekDeltaAi)} accent="neutral" sub={<span className="text-muted">vs valorisation préc.</span>} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="card-p lg:col-span-2 overflow-x-auto">
          <SectionTitle>Positions & thèses</SectionTitle>
          {f.holdings.length === 0 ? (
            <p className="text-sm text-muted">100 % cash — aucune position ouverte.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="label border-b border-line">
                  <th className="py-2 text-left font-semibold">Titre</th>
                  <th className="text-right font-semibold">Qté</th>
                  <th className="text-right font-semibold">Cours</th>
                  <th className="text-right font-semibold">Poids</th>
                  <th className="text-right font-semibold">P&L</th>
                  <th className="text-left font-semibold pl-4">Thèse</th>
                </tr>
              </thead>
              <tbody>
                {f.holdings.map((h) => (
                  <tr key={h.ticker} className="border-b border-line/60 align-top">
                    <td className="py-2 font-semibold">{h.ticker}</td>
                    <td className="text-right tabular-nums">{h.quantity}</td>
                    <td className="text-right tabular-nums">{h.price != null ? `${h.price} €` : "—"}</td>
                    <td className="text-right tabular-nums text-muted">{pct(h.weight).replace("+", "")}</td>
                    <td className={`text-right tabular-nums ${h.pnlPct >= 0 ? "up" : "down"}`}>{pct(h.pnlPct)}</td>
                    <td className="pl-4 text-slate-600">{h.thesis ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="card-p">
          <SectionTitle>Allocation</SectionTitle>
          <AllocationDonut slices={slices} />
        </div>
      </div>

      <div className="card-p">
        <SectionTitle>Journal des décisions (fictif)</SectionTitle>
        {trades.length === 0 ? (
          <p className="text-sm text-muted">Aucun trade enregistré.</p>
        ) : (
          <ul className="space-y-3">
            {[...trades].reverse().slice(0, 12).map((t, i) => (
              <li key={i} className="flex gap-3 border-b border-line/60 pb-3 last:border-0">
                <span className={`chip ${t.side === "buy" ? "bg-brand/10 text-brand-600" : "bg-danger/10 text-danger"}`}>
                  {t.side === "buy" ? "Achat" : "Vente"}
                </span>
                <div className="min-w-0">
                  <div className="text-sm">
                    <strong>{t.ticker}</strong> · {t.quantity} @ {t.price} €{" "}
                    <span className="text-muted">· {t.ts}</span>
                  </div>
                  <div className="text-sm text-slate-600">{t.rationale}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
