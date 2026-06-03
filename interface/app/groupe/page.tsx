import { getAppData } from "@/lib/data";
import { eur, pct } from "@/lib/fund";
import { AllocationDonut } from "@/components/Charts";
import { KpiCard, Delta, SectionTitle } from "@/components/Kpi";
import { HoldingsEditor } from "@/components/HoldingsEditor";

export const dynamic = "force-dynamic";

export default async function GroupePage() {
  const data = await getAppData();
  const f = data.group;
  const slices = [
    ...f.holdings.map((h) => ({ name: h.ticker, value: h.marketValue })),
    { name: "Cash", value: f.cash },
  ].filter((s) => s.value > 0);

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted">
        Le pot commun du groupe. Tenez les positions à jour ; la valorisation se rafraîchit chaque jour.
      </p>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <KpiCard label="Valeur (NAV)" value={eur(f.nav)} accent="group" sub={<Delta value={f.perf} />} />
        <KpiCard label="Investi" value={eur(f.positionsValue)} accent="neutral" sub={<span className="text-muted">{f.holdings.length} positions</span>} />
        <KpiCard label="Cash" value={eur(f.cash)} accent="neutral" sub={<span className="text-muted">{pct(f.nav ? f.cash / f.nav : 0).replace("+", "")} du fonds</span>} />
        <KpiCard label="Δ cette semaine" value={pct(data.weekDeltaGroup)} accent="neutral" sub={<span className="text-muted">vs valorisation préc.</span>} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="card-p lg:col-span-2 overflow-x-auto">
          <SectionTitle>Positions</SectionTitle>
          {f.holdings.length === 0 ? (
            <p className="text-sm text-muted">Aucune position pour l&apos;instant.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="label border-b border-line">
                  <th className="py-2 text-left font-semibold">Titre</th>
                  <th className="text-right font-semibold">Qté</th>
                  <th className="text-right font-semibold">PRU</th>
                  <th className="text-right font-semibold">Cours</th>
                  <th className="text-right font-semibold">Valeur</th>
                  <th className="text-right font-semibold">Poids</th>
                  <th className="text-right font-semibold">P&L</th>
                </tr>
              </thead>
              <tbody>
                {f.holdings.map((h) => (
                  <tr key={h.ticker} className="border-b border-line/60">
                    <td className="py-2 font-semibold">{h.ticker}</td>
                    <td className="text-right tabular-nums">{h.quantity}</td>
                    <td className="text-right tabular-nums text-muted">{h.avgCost} €</td>
                    <td className="text-right tabular-nums">{h.price != null ? `${h.price} €` : "—"}</td>
                    <td className="text-right tabular-nums">{eur(h.marketValue)}</td>
                    <td className="text-right tabular-nums text-muted">{pct(h.weight).replace("+", "")}</td>
                    <td className={`text-right tabular-nums ${h.pnlPct >= 0 ? "up" : "down"}`}>
                      {pct(h.pnlPct)}
                    </td>
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

      <div>
        <SectionTitle>Saisir / mettre à jour une position</SectionTitle>
        {data.demo && (
          <div className="card-p mb-3 border-ai/30 bg-ai/5 text-sm text-ink">
            Mode démo : l&apos;enregistrement sera actif une fois Supabase branché (déploiement).
          </div>
        )}
        <HoldingsEditor />
      </div>
    </div>
  );
}
