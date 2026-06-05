import { getCatalysts } from "@/lib/data";
import { CatalystsList } from "@/components/Catalysts";
import { KpiCard, SectionTitle, Reveal } from "@/components/Kpi";

export const dynamic = "force-dynamic";

const MONTHS = ["jan", "fév", "mar", "avr", "mai", "jun", "jul", "aoû", "sep", "oct", "nov", "déc"];
function nextLabel(date: string): string {
  const m = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? `${m[3]} ${MONTHS[Number(m[2]) - 1] ?? m[2]}` : date;
}

export default async function IndicateursPage() {
  const { demo, upcoming, past } = await getCatalysts();
  const next = upcoming[0];
  const anticipated = upcoming.filter((r) => /actif/i.test(r.status)).length;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold tracking-tight">📈 Indicateurs</h1>
          {demo && <span className="chip bg-slate-100 text-slate-500">Démo</span>}
        </div>
        <p className="mt-1 text-sm text-muted">
          Les <strong>indicateurs et événements datés</strong> que l&apos;IA surveille. Pour chacun,
          elle écrit <strong>pourquoi c&apos;est important</strong>, <strong>comment elle le prend en
          compte</strong> et <strong>vers quoi elle s&apos;orienterait</strong> pour investir. Repérés
          le lundi, re-validés le vendredi.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <KpiCard label="À venir" accent="neutral" delay={0} value={String(upcoming.length)} sub={<span className="text-muted">sur ~6 semaines</span>} />
        <KpiCard
          label="Prochain"
          accent="ai"
          delay={60}
          value={next ? nextLabel(next.date) : "—"}
          sub={<span className="text-muted">{next ? next.event : "rien au calendrier"}</span>}
        />
        <KpiCard label="Anticipés" accent="group" delay={120} value={String(anticipated)} sub={<span className="text-muted">déjà pré-positionnés</span>} />
        <KpiCard label="Archivés" accent="neutral" delay={180} value={String(past.length)} sub={<span className="text-muted">événements passés</span>} />
      </div>

      <Reveal delay={150}>
        <div className="card-p">
          <SectionTitle>Calendrier & analyses de l&apos;IA</SectionTitle>
          <CatalystsList upcoming={upcoming} past={past} />
        </div>
      </Reveal>

      <div className="card-p bg-bg/50 text-sm text-slate-600">
        <p className="font-semibold">Comment le lire</p>
        <ul className="mt-2 space-y-1 text-slate-500">
          <li>• <span className="text-sky-700">Macro</span> (FOMC, inflation), <span className="text-violet-700">Politique</span> (tarifs, élections), <span className="text-teal-700">Réglementaire</span> (FDA), <span className="text-brand-600">Micro</span> (résultats d&apos;une de nos positions).</li>
          <li>• <strong>💡 Analyse de l&apos;IA</strong> = pourquoi c&apos;est important, comment elle le prend en compte, et vers quoi elle s&apos;orienterait.</li>
          <li>• <strong>Anticipé</strong> = l&apos;IA s&apos;est déjà positionnée (ou allégée) avant l&apos;événement.</li>
        </ul>
      </div>

      <p className="text-center text-xs text-muted">
        Anticipation disciplinée — aucun pari sur le contenu d&apos;une annonce. Paper trading.
      </p>
    </div>
  );
}
