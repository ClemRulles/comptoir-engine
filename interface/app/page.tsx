import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getAppData } from "@/lib/data";
import { eur, pct } from "@/lib/fund";
import { PerfAreaChart, AllocationDonut } from "@/components/Charts";
import { KpiCard, Delta, SectionTitle } from "@/components/Kpi";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const data = await getAppData();
  const { group, ai } = data;
  const spread = ai.perf - group.perf;
  const leader = Math.abs(spread) < 0.0001 ? "Égalité" : spread > 0 ? "L'IA mène" : "Le groupe mène";

  const slices = [
    ...group.holdings.map((h) => ({ name: h.ticker, value: h.marketValue })),
    { name: "Cash", value: group.cash },
  ].filter((s) => s.value > 0);

  const movers = [...group.holdings].sort((a, b) => b.pnlPct - a.pnlPct);
  const best = movers[0];

  return (
    <div className="space-y-6">
      {/* KPI */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Fonds du groupe"
          value={eur(group.nav)}
          accent="group"
          sub={<Delta value={group.perf} />}
        />
        <KpiCard
          label="Fonds IA (fictif)"
          value={eur(ai.nav)}
          accent="ai"
          sub={<Delta value={ai.perf} />}
        />
        <KpiCard
          label="Classement"
          value={leader}
          accent="neutral"
          sub={<span className="text-muted">écart {pct(spread)} (IA − groupe)</span>}
        />
        <KpiCard
          label="Meilleure position (groupe)"
          value={best ? best.ticker : "—"}
          accent="neutral"
          sub={best ? <Delta value={best.pnlPct} /> : <span className="text-muted">aucune</span>}
        />
      </div>

      {/* Courbe + allocation */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="card-p lg:col-span-2">
          <SectionTitle
            right={
              <div className="flex gap-3 text-xs">
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-brand" /> Groupe</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-ai" /> IA</span>
              </div>
            }
          >
            Performance — Groupe vs IA
          </SectionTitle>
          <PerfAreaChart data={data.series} />
        </div>

        <div className="card-p">
          <SectionTitle>Allocation du fonds groupe</SectionTitle>
          <AllocationDonut slices={slices} />
          <div className="mt-2 flex justify-between text-sm">
            <span className="text-muted">Cash</span>
            <span className="font-semibold">{eur(group.cash)} · {pct(group.nav ? group.cash / group.nav : 0).replace("+", "")}</span>
          </div>
        </div>
      </div>

      {/* Top positions + brief */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="card-p">
          <SectionTitle right={<Link href="/groupe" className="text-sm text-brand hover:underline">Gérer →</Link>}>
            Positions du groupe
          </SectionTitle>
          {group.holdings.length === 0 ? (
            <p className="text-sm text-muted">Aucune position. Ajoutez-en dans « Fonds groupe ».</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="label border-b border-line">
                  <th className="py-2 text-left font-semibold">Titre</th>
                  <th className="text-right font-semibold">Valeur</th>
                  <th className="text-right font-semibold">Poids</th>
                  <th className="text-right font-semibold">+/-</th>
                </tr>
              </thead>
              <tbody>
                {group.holdings.slice(0, 6).map((h) => (
                  <tr key={h.ticker} className="border-b border-line/60">
                    <td className="py-2 font-semibold">{h.ticker}</td>
                    <td className="text-right tabular-nums">{eur(h.marketValue)}</td>
                    <td className="text-right tabular-nums text-muted">{pct(h.weight).replace("+", "")}</td>
                    <td className={`text-right tabular-nums ${h.pnlPct >= 0 ? "up" : "down"}`}>{pct(h.pnlPct)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card-p">
          <SectionTitle right={<Link href="/brief" className="text-sm text-brand hover:underline">Lire →</Link>}>
            🎯 Brief de la semaine
          </SectionTitle>
          {data.brief ? (
            <div className="prose-hi max-h-72 overflow-hidden">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{data.brief.slice(0, 1100)}</ReactMarkdown>
            </div>
          ) : (
            <p className="text-sm text-muted">
              Le brief sera généré par la routine du vendredi.
            </p>
          )}
        </div>
      </div>

      <p className="text-center text-xs text-muted">
        Valeurs à des fins de comparaison. Paper trading — aucun ordre réel n&apos;est passé.
      </p>
    </div>
  );
}
