import { createClient } from "@/lib/supabase/server";
import { isConfigured } from "@/lib/data";
import { ProposalForm } from "@/components/ProposalForm";
import { SectionTitle, Reveal } from "@/components/Kpi";

export const dynamic = "force-dynamic";

type Proposal = {
  id: string;
  author_name: string | null;
  ticker: string;
  thesis: string;
  size: string | null;
  horizon: string | null;
  status: string;
  created_at: string;
};

const DEMO_PROPOSALS: Proposal[] = [
  {
    id: "1",
    author_name: "Sacha",
    ticker: "ASML",
    thesis: "Quasi-monopole sur la litho EUV, carnet de commandes record. Repli récent = point d'entrée.",
    size: "5%",
    horizon: "Long terme",
    status: "open",
    created_at: new Date(Date.now() - 3600_000).toISOString(),
  },
  {
    id: "2",
    author_name: "Inès",
    ticker: "CEG",
    thesis: "Demande électrique des datacenters IA, contrats long terme. Tactique sur le momentum.",
    size: "3%",
    horizon: "Tactique",
    status: "open",
    created_at: new Date(Date.now() - 26 * 3600_000).toISOString(),
  },
];

function timeAgo(iso: string) {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 60) return `il y a ${Math.max(1, m)} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `il y a ${h} h`;
  return `il y a ${Math.floor(h / 24)} j`;
}

const STATUS: Record<string, { label: string; cls: string }> = {
  open: { label: "À l'étude", cls: "bg-brand/10 text-brand-600" },
  retenue: { label: "Retenue", cls: "bg-brand text-white" },
  ecartee: { label: "Écartée", cls: "bg-danger/10 text-danger" },
};

export default async function PropositionsPage() {
  const demo = !isConfigured();
  let proposals: Proposal[] = DEMO_PROPOSALS;
  if (!demo) {
    try {
      const supabase = await createClient();
      const { data } = await supabase
        .from("proposals")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      proposals = (data ?? []) as Proposal[];
    } catch {
      proposals = [];
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Propositions d&apos;investissement</h1>
        <p className="text-sm text-muted">
          Propose une idée au groupe : tout le monde reçoit une notification. On en discute, puis on décide ensemble.
        </p>
      </div>

      <ProposalForm demo={demo} />

      <div>
        <SectionTitle>Idées du groupe</SectionTitle>
        {proposals.length === 0 ? (
          <div className="card-p text-sm text-muted">Aucune proposition pour l&apos;instant — lance la première !</div>
        ) : (
          <div className="space-y-3">
            {proposals.map((p, i) => {
              const st = STATUS[p.status] ?? STATUS.open;
              return (
                <Reveal key={p.id} delay={i * 50}>
                  <div className="card-p lift">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-lg font-bold">{p.ticker}</span>
                      <span className={`chip ${st.cls}`}>{st.label}</span>
                      {p.horizon && <span className="chip bg-bg text-muted">{p.horizon}</span>}
                      {p.size && <span className="chip bg-bg text-muted">{p.size}</span>}
                      <span className="ml-auto text-xs text-muted">
                        {p.author_name ?? "Un membre"} · {timeAgo(p.created_at)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-700">{p.thesis}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
