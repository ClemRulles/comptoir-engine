import { getAppData, getClubData } from "@/lib/data";
import { eur, pct } from "@/lib/fund";
import { AllocationDonut } from "@/components/Charts";
import { PerfChart } from "@/components/PerfChart";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { KpiCard, Delta, SectionTitle, Reveal } from "@/components/Kpi";
import { HoldingsEditor } from "@/components/HoldingsEditor";
import { MembersManager } from "@/components/MembersManager";
import { MaintenancePanel } from "@/components/MaintenancePanel";

export const dynamic = "force-dynamic";

export default async function GroupePage() {
  const [data, club] = await Promise.all([getAppData(), getClubData()]);
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
        <KpiCard label="Valeur (NAV)" accent="group" delay={0} value={<AnimatedNumber value={f.nav} kind="eur" />} sub={<Delta value={f.perf} />} />
        <KpiCard label="Investi" accent="neutral" delay={60} value={<AnimatedNumber value={f.positionsValue} kind="eur" />} sub={<span className="text-muted">{f.holdings.length} positions</span>} />
        <KpiCard label="Cash" accent="neutral" delay={120} value={<AnimatedNumber value={f.cash} kind="eur" />} sub={<span className="text-muted">{pct(f.nav ? f.cash / f.nav : 0).replace("+", "")} du fonds</span>} />
        <KpiCard label="Δ cette semaine" accent="neutral" delay={180} value={pct(data.weekDeltaGroup)} sub={<span className="text-muted">vs ~1 semaine</span>} />
      </div>

      <Reveal delay={100}>
        <MaintenancePanel demo={data.demo} />
      </Reveal>

      <Reveal delay={150}>
        <div className="card-p">
          <SectionTitle>Évolution du fonds</SectionTitle>
          <PerfChart data={data.series} mode="group" />
        </div>
      </Reveal>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Reveal delay={120} className="lg:col-span-2">
          <div className="card-p overflow-x-auto">
            <SectionTitle>Positions</SectionTitle>
            {f.holdings.length === 0 ? (
              <p className="text-sm text-muted">Aucune position pour l&apos;instant.</p>
            ) : (
              <table className="w-full text-sm row-hover">
                <thead>
                  <tr className="label border-b border-line">
                    <th className="py-2 text-left font-semibold">Titre</th>
                    <th className="text-right font-semibold hidden sm:table-cell">Qté</th>
                    <th className="text-right font-semibold hidden sm:table-cell">PRU</th>
                    <th className="text-right font-semibold">Cours</th>
                    <th className="text-right font-semibold">Valeur</th>
                    <th className="text-right font-semibold hidden sm:table-cell">Poids</th>
                    <th className="text-right font-semibold">P&L</th>
                  </tr>
                </thead>
                <tbody>
                  {f.holdings.map((h) => (
                    <tr key={h.ticker} className="border-b border-line/60">
                      <td className="py-2.5 font-semibold">{h.ticker}</td>
                      <td className="text-right tabular-nums hidden sm:table-cell">{h.quantity}</td>
                      <td className="text-right tabular-nums text-muted hidden sm:table-cell">{h.avgCost} €</td>
                      <td className="text-right tabular-nums">{h.price != null ? `${h.price} €` : "—"}</td>
                      <td className="text-right tabular-nums">{eur(h.marketValue)}</td>
                      <td className="text-right tabular-nums text-muted hidden sm:table-cell">{pct(h.weight).replace("+", "")}</td>
                      <td className={`text-right tabular-nums ${h.pnlPct >= 0 ? "up" : "down"}`}>{pct(h.pnlPct)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Reveal>
        <Reveal delay={180}>
          <div className="card-p">
            <SectionTitle>Allocation</SectionTitle>
            <AllocationDonut slices={slices} />
          </div>
        </Reveal>
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

      <div>
        <SectionTitle right={<span className="label">{eur(club.monthlyTotal)} / mois</span>}>
          Membres &amp; apports
        </SectionTitle>
        <p className="mb-3 text-sm text-muted">
          Ajoutez les membres du pot et enregistrez leurs apports (25 €/mois/personne par défaut).
          Chaque apport augmente le cash du fonds — l&apos;IA reçoit la même somme pour rester à armes égales.
        </p>
        <MembersManager club={club} />
      </div>
    </div>
  );
}
