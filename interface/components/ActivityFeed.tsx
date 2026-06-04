import type { ActivityItem } from "@/lib/types";
import { eur } from "@/lib/fund";

function fmtDate(ts: string): string {
  const m = ts.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[3]}/${m[2]}` : ts;
}

function weight(amount: number, nav: number): string | null {
  if (!nav || nav <= 0) return null;
  return `${((amount / nav) * 100).toFixed(1).replace(".", ",")}%`;
}

function Row({ item, nav }: { item: ActivityItem; nav: number }) {
  const buy = item.side === "buy";
  const w = weight(item.amount, nav);
  return (
    <li className="flex items-start gap-3 border-b border-line/50 py-2.5 last:border-0">
      <span className={`chip shrink-0 ${buy ? "bg-brand/10 text-brand-600" : "bg-danger/10 text-danger"}`}>
        {buy ? "Achat" : "Vente"}
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-sm">
          <strong>{item.ticker}</strong>{" "}
          <span className="tabular-nums">· {eur(item.amount)}</span>
          {w && <span className="text-muted"> · {w} du fonds</span>}
          <span className="text-muted"> · {fmtDate(item.ts)}</span>
        </div>
        {item.rationale && (
          <div className="truncate text-xs text-slate-500" title={item.rationale}>
            {item.rationale}
          </div>
        )}
      </div>
    </li>
  );
}

function Panel({
  title,
  accent,
  items,
  nav,
  emptyLabel,
}: {
  title: string;
  accent: "ai" | "group";
  items: ActivityItem[];
  nav: number;
  emptyLabel: string;
}) {
  const dot = accent === "ai" ? "bg-ai" : "bg-brand";
  const ring = accent === "ai" ? "border-ai/30 bg-ai/5" : "border-brand/30 bg-brand/5";
  return (
    <div className={`rounded-xl border ${ring} p-4`}>
      <div className="mb-2 flex items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-full ${dot}`} />
        <h3 className="text-sm font-bold">{title}</h3>
      </div>
      {items.length === 0 ? (
        <p className="py-3 text-sm text-muted">{emptyLabel}</p>
      ) : (
        <ul>
          {items.map((it, i) => (
            <Row key={`${it.ticker}-${it.ts}-${i}`} item={it} nav={nav} />
          ))}
        </ul>
      )}
    </div>
  );
}

export function ActivityFeed({
  ai,
  group,
  aiNav,
  groupNav,
}: {
  ai: ActivityItem[];
  group: ActivityItem[];
  aiNav: number;
  groupNav: number;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Panel
        title="Mouvements de l'IA"
        accent="ai"
        items={ai}
        nav={aiNav}
        emptyLabel="Aucun trade IA encore — le moteur agit le vendredi."
      />
      <Panel
        title="Mouvements du groupe"
        accent="group"
        items={group}
        nav={groupNav}
        emptyLabel="Aucun mouvement saisi par les membres."
      />
    </div>
  );
}
