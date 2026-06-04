import { getCatalysts } from "@/lib/data";
import { CatalystsList } from "@/components/Catalysts";
import { KpiCard, SectionTitle, Reveal } from "@/components/Kpi";

export const dynamic = "force-dynamic";

const MONTHS = ["jan", "fév", "mar", "avr", "mai", "jun", "jul", "aoû", "sep", "oct", "nov", "déc"];
function nextLabel(date: string): string {
  const m = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? `${m[3]} ${MONTHS[Number(m[2]) - 1] ?? m[2]}` : date;
}

export default async function CatalystsPage() {
  const { demo, upcoming, past } = await getCatalysts();
  const next = upcoming[0];
  const anticipated = upcoming.filter((r) => /actif/i.test(r.status)).length;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold tracking-tight">📅 Catalyseurs</h1>
          {demo && <span className="chip bg-slate-100 text-slate-500">Démo</span>}
        </div>
        <p className="mt-1 text-sm text-muted">
          Les événements <strong>datés et publics</strong> que l&apos;IA surveille pour anticiper —
          jamais réagir à une surprise. Repérés le lundi, re-validés le vendredi. C&apos;est ici
          qu&apos;on comprend <em>pourquoi</em> l&apos;IA prend (ou évite) certaines positions.
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
          <SectionTitle>Calendrier</SectionTitle>
          <CatalystsList upcoming={upcoming} past={past} />
        </div>
      </Reveal>

      <div className="card-p bg-bg/50 text-sm text-slate-600">
        <p className="font-semibold">Comment le lire</p>
        <ul className="mt-2 space-y-1 text-slate-500">
          <li>• <span className="text-sky-700">Macro</span> (FOMC, inflation), <span className="text-violet-700">Politique</span> (tarifs, élections), <span className="text-teal-700">Réglementaire</span> (FDA), <span className="text-brand-600">Micro</span> (résultats d&apos;une de nos positions).</li>
          <li>• <strong>Risque binaire</strong> = l&apos;issue peut surprendre dans les deux sens → on gère le risque, on ne parie pas dessus.</li>
          <li>• <strong>Anticipé</strong> = l&apos;IA s&apos;est déjà positionnée (ou allégée) avant l&apos;événement.</li>
        </ul>
      </div>

      <p className="text-center text-xs text-muted">
        Anticipation disciplinée — aucun pari sur le contenu d&apos;une annonce. Paper trading.
      </p>
    </div>
  );
}
