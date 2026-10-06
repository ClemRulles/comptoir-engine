// news.tsx — une actualité en clair : ce qui s'est passé, pourquoi ça compte, qui est touché,
// et ce que l'IA en fait. Composant sans état (utilisable serveur et client).
import { ArrowDownRight, ArrowUpRight, Sparkles } from "lucide-react";
import type { NewsItem } from "@/lib/types";
import { NEWS_CATEGORY, fmtDay } from "@/lib/insights";
import { Badge } from "@/components/ui";

export function NewsRow({ n, compact = false }: { n: NewsItem; compact?: boolean }) {
  const cat = NEWS_CATEGORY[n.category] ?? { label: n.category, cls: "bg-slate-500/10 text-slate-600" };
  return (
    <li className={compact ? "" : "card p-5"}>
      <div className="flex flex-wrap items-center gap-2 text-[11px]">
        <span className={`rounded-full px-2 py-0.5 font-semibold ${cat.cls}`}>{cat.label}</span>
        {n.importance === 1 && <Badge tone="bad">Majeur</Badge>}
        <span className="text-muted">{fmtDay(n.date)}</span>
      </div>
      <h3 className={`mt-1.5 font-semibold leading-snug ${compact ? "text-[14px]" : "text-[16px]"}`}>{n.title}</h3>
      {!compact && <p className="mt-1.5 text-[14px] leading-relaxed text-slate-600">{n.summary}</p>}
      {n.why && <p className={`mt-1 leading-relaxed text-muted ${compact ? "text-[13px]" : "text-[13px]"}`}><b className="font-medium text-ink/80">Pourquoi ça compte · </b>{n.why}</p>}
      {(n.impact?.length ?? 0) > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {n.impact!.slice(0, compact ? 3 : 6).map((im, i) => (
            <span
              key={i}
              className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-medium ${
                im.held ? "border-brand/30 bg-brand/5" : "border-line bg-elev"
              }`}
              title={im.held ? "Détenu" : undefined}
            >
              {im.direction === "positif" ? <ArrowUpRight size={12} className="text-brand-600" /> : im.direction === "negatif" ? <ArrowDownRight size={12} className="text-danger" /> : <span className="text-muted">≈</span>}
              {im.target}
              {im.held && <span className="text-[10px] text-brand-600">· détenu</span>}
            </span>
          ))}
        </div>
      )}
      {n.ai_take && (
        <p className={`mt-2 flex items-start gap-1.5 rounded-lg bg-ai/[0.07] px-2.5 py-1.5 text-[13px] leading-relaxed ${compact ? "" : ""}`}>
          <Sparkles size={13} className="mt-0.5 shrink-0 text-ai" />
          <span><b className="font-semibold">L&apos;IA : </b>{n.ai_take}</span>
        </p>
      )}
      {!compact && (n.sources?.length ?? 0) > 0 && (
        <div className="mt-2 text-[11px] text-muted">
          Sources :{" "}
          {n.sources!.map((s, i) => (
            <span key={i}>
              {i > 0 && " · "}
              {s.url ? (
                <a href={s.url} target="_blank" rel="noreferrer" className="underline decoration-dotted underline-offset-2 hover:text-ink">
                  {s.name}
                </a>
              ) : (
                s.name
              )}
            </span>
          ))}
        </div>
      )}
    </li>
  );
}

