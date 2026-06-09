import { getCatalysts, getCrypto, getGrokPulse, getMarketRadar } from "@/lib/data";
import { CatalystsList } from "@/components/Catalysts";
import { MarketRadar } from "@/components/MarketRadar";
import { MarketPulse } from "@/components/MarketPulse";
import { CryptoClimate } from "@/components/CryptoClimate";
import { KpiCard, SectionTitle, Reveal } from "@/components/Kpi";

export const dynamic = "force-dynamic";

const MONTHS = ["jan", "fév", "mar", "avr", "mai", "jun", "jul", "aoû", "sep", "oct", "nov", "déc"];
function nextLabel(date: string): string {
  const m = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? `${m[3]} ${MONTHS[Number(m[2]) - 1] ?? m[2]}` : date;
}

export default async function IndicateursPage() {
  const [{ demo, upcoming, past }, radar, pulse, crypto] = await Promise.all([
    getCatalysts(),
    getMarketRadar(),
    getGrokPulse(),
    getCrypto(),
  ]);
  const next = upcoming[0];
  const anticipated = upcoming.filter((r) => /actif/i.test(r.status)).length;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div>
        <h1 className="text-xl font-bold tracking-tight">📈 Indicateurs</h1>
        <p className="mt-1 text-sm text-muted">
          Comment l&apos;IA lit le marché, du plus qualitatif au plus chiffré : le{" "}
          <strong>pouls de la semaine</strong> (thèmes via Grok/X), le <strong>climat crypto</strong>,
          ses <strong>signaux quantitatifs</strong> par titre, et les <strong>événements datés</strong>{" "}
          qu&apos;elle surveille.
        </p>
      </div>

      {/* 1) Pouls du marché — pièce maîtresse, navigable semaine par semaine */}
      <Reveal delay={60}>
        <MarketPulse weeks={pulse.weeks} demo={pulse.demo} />
      </Reveal>

      {/* 2) Climat crypto */}
      <Reveal delay={100}>
        <CryptoClimate crypto={crypto.crypto} demo={crypto.demo} />
      </Reveal>

      {/* 3) Signaux quantitatifs (régime + tableau unique avec alertes en ligne) */}
      <Reveal delay={140}>
        <SectionTitle>Signaux quantitatifs</SectionTitle>
        <MarketRadar signals={radar.signals} demo={radar.demo} />
      </Reveal>

      {/* 4) Calendrier des catalyseurs + résumé */}
      <Reveal delay={180}>
        <div className="card-p">
          <SectionTitle right={demo ? <span className="chip bg-slate-100 text-slate-500">Démo</span> : undefined}>
            Calendrier & analyses de l&apos;IA
          </SectionTitle>
          <div className="mb-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
            <KpiCard label="À venir" accent="neutral" delay={0} value={String(upcoming.length)} sub={<span className="text-muted">sur ~6 semaines</span>} />
            <KpiCard label="Prochain" accent="ai" delay={40} value={next ? nextLabel(next.date) : "—"} sub={<span className="text-muted">{next ? next.event : "rien au calendrier"}</span>} />
            <KpiCard label="Anticipés" accent="group" delay={80} value={String(anticipated)} sub={<span className="text-muted">déjà pré-positionnés</span>} />
            <KpiCard label="Archivés" accent="neutral" delay={120} value={String(past.length)} sub={<span className="text-muted">événements passés</span>} />
          </div>
          <CatalystsList upcoming={upcoming} past={past} />
        </div>
      </Reveal>

      {/* Comment le lire — replié */}
      <details className="card-p bg-bg/50 text-sm text-slate-600">
        <summary className="cursor-pointer font-semibold">Comment lire cette page ?</summary>
        <ul className="mt-3 space-y-1 text-slate-500">
          <li>• <strong>📡 Pouls</strong> = ce dont le marché parle cette semaine (Grok/X). <span className="text-brand-600">✓ corroboré</span> = recoupé par une source dure ; sinon simple radar à confirmer.</li>
          <li>• <strong>₿ Climat crypto</strong> = sentiment (Fear &amp; Greed), dominance BTC/ETH, majors en EUR. Radar uniquement — aucune position sur ce seul signal.</li>
          <li>• <strong>Signaux</strong> : le <strong>gate</strong> 🟢🟠🔴 résume la situation d&apos;un titre ; les puces colorées sont les alertes (RSI, volume, 52 sem., initiés, F-Score…).</li>
          <li>• <span className="text-sky-700">Macro</span> (FOMC, inflation), <span className="text-violet-700">Politique</span> (tarifs), <span className="text-teal-700">Réglementaire</span> (FDA), <span className="text-brand-600">Micro</span> (résultats d&apos;une de nos positions). <strong>Anticipé</strong> = l&apos;IA s&apos;est déjà positionnée avant l&apos;événement.</li>
        </ul>
      </details>

      <p className="text-center text-xs text-muted">
        Anticipation disciplinée — aucun pari sur le contenu d&apos;une annonce. Paper trading.
      </p>
    </div>
  );
}
