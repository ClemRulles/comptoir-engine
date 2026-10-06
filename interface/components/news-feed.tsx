"use client";

// NewsFeed — l'actualité filtrable par thème (Politique US, Géopolitique, Banques centrales…).
import { useMemo, useState } from "react";
import type { NewsItem } from "@/lib/types";
import { NEWS_CATEGORY } from "@/lib/insights";
import { NewsRow } from "@/components/news";
import { Paged } from "@/components/Paged";

export function NewsFeed({ items }: { items: NewsItem[] }) {
  const [cat, setCat] = useState<string>("all");
  const [heldOnly, setHeldOnly] = useState(false);
  const cats = useMemo(() => Array.from(new Set(items.map((i) => i.category))), [items]);
  const list = items.filter((i) => (cat === "all" || i.category === cat) && (!heldOnly || (i.impact ?? []).some((x) => x.held)));
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Chip active={cat === "all"} onClick={() => setCat("all")}>Tout · {items.length}</Chip>
        {cats.map((c) => (
          <Chip key={c} active={cat === c} onClick={() => setCat(c)}>
            {NEWS_CATEGORY[c]?.label ?? c}
          </Chip>
        ))}
        <label className="ml-auto inline-flex cursor-pointer items-center gap-2 text-[12px] text-muted">
          <input type="checkbox" className="h-3.5 w-3.5 accent-brand" checked={heldOnly} onChange={(e) => setHeldOnly(e.target.checked)} />
          Seulement ce qui touche nos lignes
        </label>
      </div>
      <Paged
        key={`${cat}-${heldOnly}`}
        pageSize={6}
        listClassName="grid grid-cols-1 gap-4 lg:grid-cols-2"
        items={list.map((n) => ({ key: n.id, node: <NewsRow n={n} /> }))}
        empty={<p className="well px-4 py-6 text-center text-sm text-muted">Rien dans ce filtre cette semaine.</p>}
      />
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-[12px] font-medium transition-colors ${
        active ? "border-ink bg-ink text-card" : "border-line bg-card text-muted hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
