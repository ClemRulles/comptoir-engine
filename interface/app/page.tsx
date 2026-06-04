import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getActivity, getAppData } from "@/lib/data";
import { eur, pct } from "@/lib/fund";
import { PerfChart } from "@/components/PerfChart";
import { AllocationDonut } from "@/components/Charts";
import { ActivityFeed } from "@/components/ActivityFeed";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { KpiCard, Delta, SectionTitle, Reveal } from "@/components/Kpi";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [data, activity] = await Promise.all([getAppData(), getActivity(6)]);
  const { group, ai } = data;
  const spread = ai.perf - group.perf;
  const leader = Math.abs(spread) < 0.0001 ? "Égalité" : spread > 0 ? "L'IA mène" : "Le groupe mène";

  const slices = [
    ...group.holdings.map((h) => ({ name: h.ticker, value: h.marketValue })),
    { name: "Cash", value: group.cash },
  ].filter((s) => s.value > 0);

  const best = [...group.holdings].sort((a, b) => b.pnlPct - a.pnlPct)[0];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Fonds du groupe"
          accent="group"
          delay={0}
          value={<AnimatedNumber value={group.nav} kind="eur" />}
          sub={<Delta value={group.perf} />}
        />
        <KpiCard
          label="Fonds IA (fictif)"
          accent="ai"
          delay={60}
          value={<AnimatedNumber value={ai.nav} kind="eur" />}
          sub={<Delta value={ai.perf} />}
        />
        <KpiCard
          label="Classement"
          accent="neutral"
          delay={120}
          value={leader}
          sub={<span className="text-muted">écart {pct(spread)} (IA − groupe)</span>}
        />
        <KpiCard
          label="Meilleure position (groupe)"
          accent="neutral"
          delay={180}
          value={best ? best.ticker : "—"}
          sub={best ? <Delta value={best.pnlPct} /> : <span className="text-muted">aucune</span>}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Reveal delay={150} className="lg:col-span-2">
          <div className="card-p">
            <SectionTitle>Performance — Groupe vs IA</SectionTitle>
            <PerfChart data={data.series} mode="both" />
          </div>
        </Reveal>
        <Reveal delay={220}>
          <div className="card-p">
            <SectionTitle>Allocation du groupe</SectionTitle>
            <AllocationDonut slices={slices} />
          </div>
        </Reveal>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Reveal delay={120}>
          <div className="card-p">
            <SectionTitle right={<Link href="/groupe" className="text-sm text-brand hover:underline">Gérer →</Link>}>
              Positions du groupe
            </SectionTitle>
            {group.holdings.length === 0 ? (
              <p className="text-sm text-muted">Aucune position. Ajoutez-en dans « Fonds groupe ».</p>
            ) : (
              <table className="w-full text-sm row-hover">
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
        </Reveal>
        <Reveal delay={180}>
          <div className="card-p">
            <SectionTitle right={<Link href="/brief" className="text-sm text-brand hover:underline">Lire →</Link>}>
              🎯 Brief de la semaine
            </SectionTitle>
            {data.brief ? (
              <div className="prose-hi max-h-72 overflow-hidden">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{data.brief.slice(0, 1100)}</ReactMarkdown>
              </div>
            ) : (
              <p className="text-sm text-muted">Le brief sera généré par la routine du vendredi.</p>
            )}
          </div>
        </Reveal>
      </div>

      <Reveal delay={150}>
        <div className="card-p">
          <SectionTitle right={<span className="text-xs text-muted">derniers changements réalisés</span>}>
            Activité récente
          </SectionTitle>
          <ActivityFeed
            ai={activity.ai}
            group={activity.group}
            aiNav={ai.nav}
            groupNav={group.nav}
          />
        </div>
      </Reveal>

      <p className="text-center text-xs text-muted">
        Valeurs à des fins de comparaison. Paper trading — aucun ordre réel n&apos;est passé.
      </p>
    </div>
  );
}
