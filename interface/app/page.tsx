import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { createClient } from "@/lib/supabase/server";
import { fetchMemoryMarkdown } from "@/lib/github";
import { NavChart } from "@/components/NavChart";
import { eur, pct, perfSinceInception, mergeSeries } from "@/lib/fund";
import type { Fund, NavSnapshot } from "@/lib/types";

export const dynamic = "force-dynamic";

function SetupNotice() {
  return (
    <div className="card">
      <h2 className="mb-2 text-lg font-semibold">Configuration requise</h2>
      <p className="text-sm text-gray-400">
        Renseigne les variables Supabase (<code>NEXT_PUBLIC_SUPABASE_URL</code>,{" "}
        <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>) puis lance la migration SQL. Voir le
        README du dossier <code>interface/</code>.
      </p>
    </div>
  );
}

export default async function DashboardPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return <SetupNotice />;

  const supabase = await createClient();
  const { data: funds } = await supabase.from("funds").select("*");
  const { data: snaps } = await supabase
    .from("nav_snapshots")
    .select("*")
    .order("date", { ascending: true });

  const fundList = (funds ?? []) as Fund[];
  const group = fundList.find((f) => f.kind === "group");
  const ai = fundList.find((f) => f.kind === "ai");
  const allSnaps = (snaps ?? []) as NavSnapshot[];
  const groupSnaps = allSnaps.filter((s) => s.fund_id === group?.id);
  const aiSnaps = allSnaps.filter((s) => s.fund_id === ai?.id);

  const latest = (arr: NavSnapshot[]) => (arr.length ? arr[arr.length - 1] : null);
  const groupNav = latest(groupSnaps)?.nav ?? group?.start_capital ?? 0;
  const aiNav = latest(aiSnaps)?.nav ?? ai?.start_capital ?? 0;
  const groupPerf = perfSinceInception(groupNav, group?.start_capital ?? 0);
  const aiPerf = perfSinceInception(aiNav, ai?.start_capital ?? 0);
  const series = mergeSeries(groupSnaps, aiSnaps);

  const brief = await fetchMemoryMarkdown("morning-brief.md");
  const leader = aiPerf === groupPerf ? "égalité" : aiPerf > groupPerf ? "L'IA mène" : "Le groupe mène";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card">
          <div className="text-xs uppercase tracking-wide text-group">Fonds groupe</div>
          <div className="mt-1 text-2xl font-semibold">{eur(groupNav)}</div>
          <div className={`text-sm ${groupPerf >= 0 ? "text-green-400" : "text-red-400"}`}>
            {pct(groupPerf)} depuis l&apos;origine
          </div>
        </div>
        <div className="card">
          <div className="text-xs uppercase tracking-wide text-ai">Fonds IA (fictif)</div>
          <div className="mt-1 text-2xl font-semibold">{eur(aiNav)}</div>
          <div className={`text-sm ${aiPerf >= 0 ? "text-green-400" : "text-red-400"}`}>
            {pct(aiPerf)} depuis l&apos;origine
          </div>
        </div>
        <div className="card">
          <div className="text-xs uppercase tracking-wide text-gray-400">Classement</div>
          <div className="mt-1 text-2xl font-semibold">{leader}</div>
          <div className="text-sm text-gray-400">
            écart {pct(aiPerf - groupPerf)} (IA − groupe)
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="mb-3 text-lg font-semibold">Performance — Groupe vs IA</h2>
        <NavChart data={series} />
        <p className="mt-2 text-xs text-gray-500">
          Valeurs fictives à des fins de comparaison. Aucun ordre réel n&apos;est passé.
        </p>
      </div>

      <div className="card">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-semibold">🎯 Brief de la semaine</h2>
          <Link href="/brief" className="text-sm text-group hover:underline">
            Voir en entier →
          </Link>
        </div>
        {brief ? (
          <div className="prose-comptoir max-h-80 overflow-hidden">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {brief.slice(0, 1500)}
            </ReactMarkdown>
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            Le brief apparaîtra ici après le premier passage de la routine du vendredi
            (lecture de <code>memory/morning-brief.md</code> — nécessite le token GitHub).
          </p>
        )}
      </div>
    </div>
  );
}
