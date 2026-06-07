import { getAppData } from "@/lib/data";
import { fetchAiFund } from "@/lib/github";
import { DEMO_AI } from "@/lib/demo";
import { eur, pct } from "@/lib/fund";
import { AllocationDonut } from "@/components/Charts";
import { PerfChart } from "@/components/PerfChart";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { KpiCard, Delta, SectionTitle, Reveal } from "@/components/Kpi";
import { TickerCell } from "@/components/StockDrawer";

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
    <div className="flex flex-col gap-6">
      <p className="text-sm text-muted">
        Portefeuille <strong>fictif</strong> géré par l&apos;IA à partir de ses convictions. 100 % paper —
        aucun ordre réel. Mis à jour le vendredi par le moteur.
      </p>

      {/* Mobile : graphique en premier, KPIs après. Desktop : KPIs en premier (md:order-1). */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4 order-2 md:order-1">
        <KpiCard label="Valeur (NAV)" accent="ai" delay={0} value={<AnimatedNumber value={f.nav} kind="eur" />} sub={<Delta value={f.perf} />} />
        <KpiCard label="Investi" accent="neutral" delay={60} value={<AnimatedNumber value={f.positionsValue} kind="eur" />} sub={<span className="text-muted">{f.holdings.length} positions</span>} />
        <KpiCard label="Cash" accent="neutral" delay={120} value={<AnimatedNumber value={f.cash} kind="eur" />} sub={<span className="text-muted">{pct(f.nav ? f.cash / f.nav : 0).replace("+", "")} du fonds</span>} />
        <KpiCard label="Δ cette semaine" accent="neutral" delay={180} value={pct(data.weekDeltaAi)} sub={<span className="text-muted">vs ~1 semaine</span>} />
      </div>

      <Reveal delay={150} className="order-1 md:order-2">
        <div className="card-p">
          <SectionTitle>Évolution du fonds IA</SectionTitle>
          <PerfChart data={data.series} mode="ai" />
        </div>
      </Reveal>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 order-3">
        <Reveal delay={120} className="lg:col-span-2">
          <div className="card-p overflow-x-auto">
            <SectionTitle>Positions & thèses</SectionTitle>
            {f.holdings.length === 0 ? (
              <p className="text-sm text-muted">100 % cash — aucune position ouverte.</p>
            ) : (
              <table className="w-full text-sm row-hover">
                <thead>
                  <tr className="label border-b border-line">
                    <th className="py-2 text-left font-semibold">Titre</th>
                    <th className="text-right font-semibold hidden sm:table-cell">Qté</th>
                    <th className="text-right font-semibold">Cours</th>
                    <th className="text-right font-semibold hidden sm:table-cell">Poids</th>
                    <th className="text-right font-semibold">P&L</th>
                    <th className="text-left font-semibold pl-4 hidden lg:table-cell">Thèse</th>
                  </tr>
                </thead>
                <tbody>
                  {f.holdings.map((h) => (
                    <tr key={h.ticker} className="border-b border-line/60 align-top">
                      <td className="py-2.5"><TickerCell ticker={h.ticker} /></td>
                      <td className="text-right tabular-nums hidden sm:table-cell">{h.quantity}</td>
                      <td className="text-right tabular-nums">{h.price != null ? `${h.price} €` : "—"}</td>
                      <td className="text-right tabular-nums text-muted hidden sm:table-cell">{pct(h.weight).replace("+", "")}</td>
                      <td className={`text-right tabular-nums ${h.pnlPct >= 0 ? "up" : "down"}`}>{pct(h.pnlPct)}</td>
                      <td className="pl-4 text-slate-600 hidden lg:table-cell">{h.thesis ?? "—"}</td>
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

      <Reveal delay={120} className="order-4">
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
                      <TickerCell ticker={t.ticker} /> · {t.quantity} @ {t.price} €{" "}
                      <span className="text-muted">· {t.ts}</span>
                    </div>
                    <div className="text-sm text-slate-600">{t.rationale}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Reveal>
    </div>
  );
}
