import { getCatalysts, getGrokPulse, getMarketRadar } from "@/lib/data";
import { CatalystsList } from "@/components/Catalysts";
import { MarketRadar } from "@/components/MarketRadar";
import { MarketPulse } from "@/components/MarketPulse";
import { KpiCard, SectionTitle, Reveal } from "@/components/Kpi";

export const dynamic = "force-dynamic";

const MONTHS = ["jan", "fév", "mar", "avr", "mai", "jun", "jul", "aoû", "sep", "oct", "nov", "déc"];
function nextLabel(date: string): string {
  const m = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? `${m[3]} ${MONTHS[Number(m[2]) - 1] ?? m[2]}` : date;
}

export default async function IndicateursPage() {
  const [{ demo, upcoming, past }, radar, pulse] = await Promise.all([
    getCatalysts(),
    getMarketRadar(),
    getGrokPulse(),
  ]);
  const next = upcoming[0];
  const anticipated = upcoming.filter((r) => /actif/i.test(r.status)).length;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div>
        <h1 className="text-xl font-bold tracking-tight">📈 Indicateurs</h1>
        <p className="mt-1 text-sm text-muted">
          Comment l&apos;IA lit le marché : le <strong>pouls de la semaine</strong> (thèmes & titres qui
          bougent, via Grok/X — à corroborer), ses <strong>signaux quantitatifs</strong> par titre
          (RSI, momentum, volume, 52 sem., initiés, F-Score, gate) et les <strong>événements
          datés</strong> qu&apos;elle surveille.
        </p>
      </div>

      {/* Pouls du marché — pièce maîtresse, navigable semaine par semaine */}
      <Reveal delay={60}>
        <MarketPulse weeks={pulse.weeks} demo={pulse.demo} />
      </Reveal>

      {/* Bandeau KPIs — calendrier des catalyseurs */}
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

      {/* Radar de marché — signaux quantitatifs par titre */}
      <Reveal delay={120}>
        <SectionTitle>Radar de marché — signaux par titre</SectionTitle>
        <MarketRadar signals={radar.signals} demo={radar.demo} />
      </Reveal>

      {/* Calendrier des catalyseurs */}
      <Reveal delay={160}>
        <div className="card-p">
          <SectionTitle right={demo ? <span className="chip bg-slate-100 text-slate-500">Démo</span> : undefined}>
            Calendrier & analyses de l&apos;IA
          </SectionTitle>
          <CatalystsList upcoming={upcoming} past={past} />
        </div>
      </Reveal>

      <div className="card-p bg-bg/50 text-sm text-slate-600">
        <p className="font-semibold">Comment le lire</p>
        <ul className="mt-2 space-y-1 text-slate-500">
          <li>• <strong>📡 Pouls</strong> = ce dont le marché parle cette semaine (Grok/X). <span className="text-brand-600">✓ corroboré</span> = recoupé par une source dure ; sinon simple radar à confirmer.</li>
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
