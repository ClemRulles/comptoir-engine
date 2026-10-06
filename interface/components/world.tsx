// world.tsx — page « Le monde » : l'actualité qui compte, ce que font les pros (13F SEC),
// et le régime de marché expliqué en clair.
import { Building2, Gauge, Landmark, TrendingDown, TrendingUp } from "lucide-react";
import type { ProInvestor } from "@/lib/types";
import { SLEEVE_META, fmtDay, regimePlain, sleeveTargets } from "@/lib/insights";
import { Badge, Card, CardHead, DemoTag, Empty, Explain, MoreLink, fmtShare } from "@/components/ui";
import { Paged } from "@/components/Paged";

const ACTION = {
  nouvelle: { label: "Nouvelle ligne", tone: "good" as const, icon: TrendingUp },
  renforce: { label: "Renforce", tone: "good" as const, icon: TrendingUp },
  allege: { label: "Allège", tone: "bad" as const, icon: TrendingDown },
  sortie: { label: "Sort", tone: "bad" as const, icon: TrendingDown },
};

// Libellés SEC (« ALPHABET INC », « Amazon Com Inc ») → casse lisible.
export function issuerName(s: string): string {
  const small = new Set(["of", "and", "the", "de"]);
  return s
    .toLowerCase()
    .split(/\s+/)
    .map((w, i) => (["inc", "corp", "co", "ltd", "plc", "nv", "sa", "llc", "lp"].includes(w.replace(/[.,]/g, "")) ? w.toUpperCase().replace(/[.,]/g, "") : i > 0 && small.has(w) ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(" ")
    .replace(/\b(Inc|Corp|Co|Ltd|Plc|Nv|Sa|Llc|Lp)\b/gi, (m) => (m.length <= 3 ? m.toUpperCase() : m.charAt(0).toUpperCase() + m.slice(1).toLowerCase()));
}

function moveText(m: ProInvestor["moves"][number]) {
  if (m.action === "nouvelle") return `${fmtShare(m.weight_pct, 1)} du portefeuille`;
  if (m.action === "sortie") return m.prev_weight_pct ? `pesait ${fmtShare(m.prev_weight_pct, 1)}` : "ligne soldée";
  const ch = m.shares_change_pct ?? 0;
  return `${ch >= 0 ? "+" : "−"}${Math.abs(ch * 100).toFixed(0)} % de titres · ${fmtShare(m.weight_pct, 1)}`;
}

export function ProsBoard({ pros, demo, updated, compact = false }: { pros: ProInvestor[]; demo: boolean; updated?: string; compact?: boolean }) {
  const list = compact ? pros.slice(0, 3) : pros;
  return (
    <Card className="h-full">
      <CardHead
        icon={Landmark}
        title="Ce que font les investisseurs pros"
        sub={compact ? "Leurs derniers mouvements officiels." : "D'après leurs déclarations officielles à la SEC (formulaire 13F)."}
        right={
          compact ? (
            <MoreLink href="/monde#pros">Tous</MoreLink>
          ) : (
            <Explain label="À savoir">
              Un 13F est publié environ 45 jours après la fin du trimestre et ne montre que les actions américaines détenues. C&apos;est une photo datée : l&apos;IA s&apos;en sert comme d&apos;une idée à étudier, jamais comme d&apos;un signal d&apos;achat.
            </Explain>
          )
        }
      />
      {list.length === 0 ? (
        <Empty icon={Building2} title="Données 13F bientôt disponibles">La routine du lundi récupère les déclarations officielles de Buffett, Ackman, Druckenmiller et d&apos;autres.</Empty>
      ) : (
        <Paged
          pageSize={compact ? 3 : 4}
          listClassName={compact ? "space-y-4" : "grid grid-cols-1 gap-4 md:grid-cols-2"}
          items={list.map((p) => ({ key: p.cik, node: <ProRow p={p} compact={compact} /> }))}
        />
      )}
      <div className="mt-3 flex items-center gap-2 text-[11px] text-muted">
        <DemoTag show={demo} label="Démo (données 13F réelles)" />
        {updated && !demo && <span>Relevé le {fmtDay(updated)} · source SEC EDGAR</span>}
      </div>
    </Card>
  );
}

function ProRow({ p, compact }: { p: ProInvestor; compact: boolean }) {
  return (
    <li className={compact ? "" : "well p-4"}>
      <div className="flex items-baseline justify-between gap-2">
        <div>
          <div className="text-sm font-semibold">{p.investor}</div>
          <div className="text-[12px] text-muted">
            {p.fund}
            {p.style ? ` · ${p.style}` : ""}
          </div>
        </div>
        <span className="shrink-0 text-[11px] text-muted">au {fmtDay(p.period)}</span>
      </div>
      <ul className="mt-2 space-y-1">
        {p.moves.slice(0, compact ? 2 : 4).map((m, i) => {
          const a = ACTION[m.action];
          return (
            <li key={i} className="flex items-center gap-2 text-[13px]">
              <Badge tone={a.tone} className="w-[96px] justify-center">{a.label}</Badge>
              <span className="truncate font-medium">{issuerName(m.issuer)}</span>
              <span className="num ml-auto shrink-0 text-[11px] text-muted">{moveText(m)}</span>
            </li>
          );
        })}
      </ul>
      {!compact && p.top.length > 0 && (
        <div className="mt-3 text-[11px] leading-relaxed text-muted">
          Plus grosses lignes : {p.top.slice(0, 3).map((t) => `${issuerName(t.issuer)} ${fmtShare(t.weight_pct)}`).join(" · ")}
        </div>
      )}
    </li>
  );
}

export function RegimeCard({ label, flags, fearGreed, demo }: { label: string | null; flags?: string[]; fearGreed?: number | null; demo: boolean }) {
  const r = regimePlain(label);
  const tone = r.tone === "offensif" ? "good" : r.tone === "defensif" ? "info" : "ai";
  return (
    <Card className="h-full">
      <CardHead
        icon={Gauge}
        title="La météo des marchés"
        sub="Le régime macro qui règle la prudence de l'IA."
        right={
          <Explain label="Comment c'est calculé">
            Courbe des taux, chômage, inflation (États-Unis et zone euro), volatilité et tension sur le crédit, via la Réserve fédérale (FRED). Le régime ne change jamais le niveau de cash (10 %) : il change ce qu&apos;on achète et à quel prix.
          </Explain>
        }
      />
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={tone} className="px-2.5 py-1 text-xs">{r.label}</Badge>
        {label && <span className="text-[11px] uppercase tracking-wide text-muted">{label}</span>}
        <DemoTag show={demo} />
      </div>
      <p className="mt-3 text-[15px] leading-relaxed">{r.line}</p>
      {(flags?.length ?? 0) > 0 && (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {flags!.slice(0, 5).map((f) => (
            <li key={f} className="rounded-md border border-line bg-elev px-2 py-0.5 text-[11px] text-slate-600">{f}</li>
          ))}
        </ul>
      )}
      {typeof fearGreed === "number" && <p className="mt-3 text-xs text-muted">Indice peur / avidité : <b className="num text-ink">{fearGreed}/100</b></p>}
      <div className="mt-5">
        <div className="eyebrow mb-2">Ce que ça change pour le fonds IA</div>
        <ul className="grid grid-cols-2 gap-2">
          {(["coeur", "socle", "tactique", "crypto"] as const).map((k) => {
            const t = sleeveTargets(label)[k];
            return (
              <li key={k} className="well flex items-center justify-between gap-2 px-3 py-2 text-[13px]">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-[3px]" style={{ background: SLEEVE_META[k].color }} />
                  {SLEEVE_META[k].short}
                </span>
                <b className="num">{fmtShare(t)}</b>
              </li>
            );
          })}
        </ul>
        <p className="mt-2 text-[12px] text-muted">Cibles du régime actuel. Le cash reste à 10 % quel que soit le régime.</p>
      </div>
    </Card>
  );
}
