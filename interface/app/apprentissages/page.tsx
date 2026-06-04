import { getLearningData } from "@/lib/data";
import { CalibrationChart } from "@/components/Charts";
import { KpiCard, SectionTitle, Reveal } from "@/components/Kpi";

export const dynamic = "force-dynamic";

const asPct = (n: number) => `${n >= 0 ? "" : "−"}${Math.abs(Math.round(n * 100))}%`;
const signedPct = (n: number) => `${n >= 0 ? "+" : "−"}${Math.abs(n * 100).toFixed(1)}%`;

const CONF_STYLE: Record<string, string> = {
  Haute: "bg-brand/10 text-brand-600",
  Moyenne: "bg-amber-100 text-amber-700",
  Basse: "bg-slate-100 text-slate-500",
};

export default async function ApprentissagesPage() {
  const { calibration: cal, decisions, lessons, demo } = await getLearningData();

  const totalN = cal.buckets.reduce((s, b) => s + b.n, 0);
  const totalHits = cal.buckets.reduce((s, b) => s + b.hits, 0);
  const hitRate = totalN ? totalHits / totalN : 0;
  const closed = [...decisions].sort((a, b) => b.closed.localeCompare(a.closed));

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted">
        Ce que l&apos;IA a <strong>appris de son passé</strong>. Chaque décision clôturée est
        notée : la confiance annoncée était-elle méritée ? Une IA honnête a un taux de réussite
        qui <strong>monte avec la confiance</strong>. {demo && <em>(Données de démonstration.)</em>}
      </p>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <KpiCard
          label="Taux de réussite"
          accent="ai"
          delay={0}
          value={asPct(hitRate)}
          sub={<span className="text-muted">confiance méritée</span>}
        />
        <KpiCard
          label="Win rate"
          accent="neutral"
          delay={60}
          value={asPct(cal.global.win_rate)}
          sub={<span className="text-muted">trades gagnants</span>}
        />
        <KpiCard
          label="Profit factor"
          accent="neutral"
          delay={120}
          value={cal.global.profit_factor.toFixed(2)}
          sub={<span className="text-muted">{cal.global.profit_factor >= 1.5 ? "sain (>1,5)" : "à surveiller"}</span>}
        />
        <KpiCard
          label="Décisions clôturées"
          accent="neutral"
          delay={180}
          value={String(cal.global.closed_decisions)}
          sub={<span className="text-muted">depuis l&apos;origine</span>}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Reveal delay={120} className="lg:col-span-2">
          <div className="card-p">
            <SectionTitle right={<span className="label">maj {cal.updated}</span>}>
              Calibration — confiance annoncée vs réussite réelle
            </SectionTitle>
            <CalibrationChart buckets={cal.buckets} />
            <p className="mt-3 text-xs text-muted">
              Vert = la confiance est méritée · Orange = limite · Rouge = sur-confiance.
              Si « Haute » n&apos;est pas la plus haute barre, la revue mensuelle réduit le sizing
              de ce niveau et durcit ses critères.
            </p>
          </div>
        </Reveal>

        <Reveal delay={180}>
          <div className="card-p">
            <SectionTitle>Par niveau de confiance</SectionTitle>
            <ul className="space-y-3 text-sm">
              {["Haute", "Moyenne", "Basse"].map((c) => {
                const b = cal.buckets.find((x) => x.confidence === c);
                const hr = b && b.n ? b.hit_rate : 0;
                return (
                  <li key={c} className="flex items-center justify-between border-b border-line/60 pb-2 last:border-0">
                    <span className={`chip ${CONF_STYLE[c]}`}>{c}</span>
                    <span className="text-muted">{b?.n ?? 0} décision(s)</span>
                    <span className="font-semibold tabular-nums">{b && b.n ? asPct(hr) : "—"}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </Reveal>
      </div>

      <Reveal delay={120}>
        <div className="card-p overflow-x-auto">
          <SectionTitle>Décisions clôturées</SectionTitle>
          {closed.length === 0 ? (
            <p className="text-sm text-muted">Aucune décision clôturée pour l&apos;instant.</p>
          ) : (
            <table className="w-full text-sm row-hover">
              <thead>
                <tr className="label border-b border-line">
                  <th className="py-2 text-left font-semibold">Titre</th>
                  <th className="text-left font-semibold hidden sm:table-cell">Confiance</th>
                  <th className="text-left font-semibold hidden md:table-cell">Horizon</th>
                  <th className="text-right font-semibold">P&L</th>
                  <th className="text-left font-semibold pl-4">Verdict</th>
                  <th className="text-left font-semibold pl-4 hidden lg:table-cell">Leçon</th>
                </tr>
              </thead>
              <tbody>
                {closed.map((d) => (
                  <tr key={d.thesis_id} className="border-b border-line/60 align-top">
                    <td className="py-2.5 font-semibold">{d.ticker}</td>
                    <td className="hidden sm:table-cell">
                      <span className={`chip ${CONF_STYLE[d.confidence]}`}>{d.confidence}</span>
                    </td>
                    <td className="text-muted hidden md:table-cell">{d.horizon}</td>
                    <td className={`text-right tabular-nums ${d.realized_pnl_pct >= 0 ? "up" : "down"}`}>
                      {signedPct(d.realized_pnl_pct)}
                    </td>
                    <td className="pl-4">
                      <span className={`chip ${d.hit ? "bg-brand/10 text-brand-600" : "bg-danger/10 text-danger"}`}>
                        {d.outcome}
                      </span>
                    </td>
                    <td className="pl-4 text-slate-600 hidden lg:table-cell">{d.lesson}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Reveal>

      <Reveal delay={120}>
        <div className="card-p">
          <SectionTitle>Journal d&apos;apprentissage</SectionTitle>
          {lessons.length === 0 ? (
            <p className="text-sm text-muted">Pas encore de leçon enregistrée.</p>
          ) : (
            <ol className="relative space-y-4 border-l border-line pl-5">
              {lessons.slice(0, 20).map((l, i) => (
                <li key={`${l.date}-${i}`} className="relative">
                  <span className="absolute -left-[23px] top-1.5 h-2.5 w-2.5 rounded-full bg-ai ring-4 ring-white" />
                  <div className="label">{l.date}</div>
                  <div className="text-sm text-slate-700">{l.text}</div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </Reveal>
    </div>
  );
}
