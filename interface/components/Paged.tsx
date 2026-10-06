"use client";

// Paged — pagination des listes qui grandissent (journal, actualité, leçons, apports…).
// Deux modes : par MOIS (‹ Octobre 2026 ›, puis « afficher plus » dans le mois) ou par paquets
// de N éléments (‹ 1 2 3 ›). Les éléments arrivent déjà rendus côté serveur (`node`) : le
// composant ne fait que choisir lesquels afficher.
import { useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type PagedItem = { key: string; month?: string; node: React.ReactNode };

const MONTHS = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
const monthLabel = (ym: string) => {
  const [y, m] = ym.split("-");
  return `${MONTHS[Number(m) - 1] ?? m} ${y}`;
};

export function Paged({
  items,
  by = "count",
  pageSize = 6,
  as: Tag = "ul",
  listClassName = "",
  empty,
}: {
  items: PagedItem[];
  by?: "count" | "month";
  pageSize?: number;
  as?: "ul" | "ol" | "div";
  listClassName?: string;
  empty?: React.ReactNode;
}) {
  const top = useRef<HTMLDivElement>(null);
  const months = useMemo(() => {
    if (by !== "month") return [];
    const seen: string[] = [];
    for (const it of items) {
      const m = it.month ?? "";
      if (!seen.includes(m)) seen.push(m);
    }
    return seen;
  }, [items, by]);
  const [mi, setMi] = useState(0);
  const [shown, setShown] = useState(pageSize);
  const [page, setPage] = useState(0);

  if (!items.length) return <>{empty ?? null}</>;

  const bringIntoView = () => {
    const el = top.current;
    if (el && el.getBoundingClientRect().top < 0) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (by === "month") {
    const m = months[Math.min(mi, months.length - 1)];
    const inMonth = items.filter((it) => (it.month ?? "") === m);
    const visible = inMonth.slice(0, shown);
    const go = (d: number) => {
      setMi((v) => Math.max(0, Math.min(months.length - 1, v + d)));
      setShown(pageSize);
      bringIntoView();
    };
    return (
      <div ref={top} className="scroll-mt-24">
        <div className="mb-3 flex items-center justify-between gap-2">
          <button type="button" onClick={() => go(1)} disabled={mi >= months.length - 1} aria-label="Mois précédent" className="pager-btn">
            <ChevronLeft size={16} />
          </button>
          <div className="text-center">
            <div className="text-sm font-semibold">{m ? monthLabel(m) : "Sans date"}</div>
            <div className="text-[11px] text-muted">
              {inMonth.length} élément{inMonth.length > 1 ? "s" : ""} · mois {months.length - mi}/{months.length}
            </div>
          </div>
          <button type="button" onClick={() => go(-1)} disabled={mi <= 0} aria-label="Mois suivant" className="pager-btn">
            <ChevronRight size={16} />
          </button>
        </div>
        <Tag key={m} className={`animate-fade-in ${listClassName}`}>
          {visible.map((it) => (
            <Frag key={it.key}>{it.node}</Frag>
          ))}
        </Tag>
        {inMonth.length > shown && (
          <button type="button" onClick={() => setShown((v) => v + pageSize)} className="btn mt-4 w-full">
            Afficher plus ({inMonth.length - shown} restant{inMonth.length - shown > 1 ? "s" : ""})
          </button>
        )}
      </div>
    );
  }

  const pages = Math.max(1, Math.ceil(items.length / pageSize));
  const p = Math.min(page, pages - 1);
  const visible = items.slice(p * pageSize, (p + 1) * pageSize);
  const go = (n: number) => {
    setPage(Math.max(0, Math.min(pages - 1, n)));
    bringIntoView();
  };
  return (
    <div ref={top} className="scroll-mt-24">
      <Tag key={p} className={`animate-fade-in ${listClassName}`}>
        {visible.map((it) => (
          <Frag key={it.key}>{it.node}</Frag>
        ))}
      </Tag>
      {pages > 1 && (
        <nav className="mt-4 flex items-center justify-center gap-1.5" aria-label="Pages">
          <button type="button" onClick={() => go(p - 1)} disabled={p === 0} aria-label="Page précédente" className="pager-btn">
            <ChevronLeft size={16} />
          </button>
          {pageList(p, pages).map((n, i) =>
            n < 0 ? (
              <span key={`gap${i}`} className="px-1 text-muted">…</span>
            ) : (
              <button key={n} type="button" onClick={() => go(n)} aria-current={n === p ? "page" : undefined} className={`pager-num ${n === p ? "pager-num-active" : ""}`}>
                {n + 1}
              </button>
            )
          )}
          <button type="button" onClick={() => go(p + 1)} disabled={p >= pages - 1} aria-label="Page suivante" className="pager-btn">
            <ChevronRight size={16} />
          </button>
          <span className="ml-2 text-[11px] text-muted">{items.length} au total</span>
        </nav>
      )}
    </div>
  );
}

// Numéros affichés : toujours la première, la dernière, et la page courante ± 1.
function pageList(p: number, pages: number): number[] {
  if (pages <= 6) return Array.from({ length: pages }, (_, i) => i);
  const set = new Set([0, pages - 1, p - 1, p, p + 1].filter((n) => n >= 0 && n < pages));
  const arr = [...set].sort((a, b) => a - b);
  const out: number[] = [];
  arr.forEach((n, i) => {
    if (i > 0 && n - arr[i - 1] > 1) out.push(-1);
    out.push(n);
  });
  return out;
}

function Frag({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

// Variante tableau : l'en-tête reste, les lignes se paginent.
export function PagedTable({
  head,
  rows,
  pageSize = 8,
  className = "",
}: {
  head: React.ReactNode;
  rows: { key: string; node: React.ReactNode }[];
  pageSize?: number;
  className?: string;
}) {
  const [page, setPage] = useState(0);
  const pages = Math.max(1, Math.ceil(rows.length / pageSize));
  const p = Math.min(page, pages - 1);
  return (
    <div>
      <table className={className}>
        <thead>{head}</thead>
        <tbody key={p} className="animate-fade-in">
          {rows.slice(p * pageSize, (p + 1) * pageSize).map((r) => (
            <Frag key={r.key}>{r.node}</Frag>
          ))}
        </tbody>
      </table>
      {pages > 1 && (
        <nav className="mt-4 flex items-center justify-center gap-1.5" aria-label="Pages">
          <button type="button" onClick={() => setPage(p - 1)} disabled={p === 0} aria-label="Page précédente" className="pager-btn">
            <ChevronLeft size={16} />
          </button>
          <span className="px-2 text-[13px] tabular-nums text-muted">
            {p + 1} / {pages}
          </span>
          <button type="button" onClick={() => setPage(p + 1)} disabled={p >= pages - 1} aria-label="Page suivante" className="pager-btn">
            <ChevronRight size={16} />
          </button>
        </nav>
      )}
    </div>
  );
}
