"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { TickerLogo } from "@/components/TickerLogo";
import { useStockDrawer } from "@/components/StockDrawer";

type Kind = "equity" | "etf" | "crypto";
type Result = { symbol: string; name: string; exchange: string; type: string; kind: Kind };
type Filter = "all" | "stock" | "crypto";

// Badge de type d'actif (différencie visuellement actions/ETF des cryptos).
function KindBadge({ kind }: { kind: Kind }) {
  if (kind === "crypto")
    return <span className="chip bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300">Crypto</span>;
  if (kind === "etf")
    return <span className="chip bg-sky-100 text-sky-700 dark:bg-sky-400/15 dark:text-sky-300">ETF</span>;
  return <span className="chip bg-slate-100 text-slate-600 dark:bg-slate-400/15 dark:text-slate-300">Action</span>;
}

// Barre de recherche proéminente : cherche n'importe quel actif (Yahoo : action, ETF, crypto)
// et ouvre son graphique de cours dans le tiroir partagé. Pastilles Tous/Actions/Crypto pour
// affiner, et un badge de type sur chaque résultat.
export function AssetSearch() {
  const openStock = useStockDrawer();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const boxRef = useRef<HTMLDivElement>(null);

  // Ferme le menu si on clique ailleurs.
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  // Recherche débattue (300 ms).
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    const id = setTimeout(async () => {
      try {
        const res = await fetch(`/api/ticker-search?q=${encodeURIComponent(q)}`);
        const { results } = await res.json();
        setResults(results ?? []);
        setOpen(true);
      } catch {
        setResults([]);
      }
      setLoading(false);
    }, 300);
    return () => clearTimeout(id);
  }, [query]);

  const shown = useMemo(
    () =>
      results.filter((r) =>
        filter === "all" ? true : filter === "crypto" ? r.kind === "crypto" : r.kind !== "crypto"
      ),
    [results, filter]
  );

  function pick(r: Result) {
    openStock(r.symbol, r.name);
    setOpen(false);
    setQuery("");
    setResults([]);
  }

  const pills: { id: Filter; label: string }[] = [
    { id: "all", label: "Tous" },
    { id: "stock", label: "Actions & ETF" },
    { id: "crypto", label: "Crypto" },
  ];

  return (
    <div className="relative" ref={boxRef}>
      <div className="relative">
        {/* Loupe */}
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-muted">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 4.99L20.49 19l-4.99-5Zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14Z" />
          </svg>
        </span>
        <input
          className="w-full rounded-2xl border border-line bg-card py-3.5 pl-12 pr-11 text-base text-ink shadow-card transition-all placeholder:text-muted/70 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length && setOpen(true)}
          placeholder="Rechercher un actif — action, ETF ou crypto (ex. Nvidia, Air Liquide, Bitcoin)"
          autoComplete="off"
          aria-label="Rechercher un actif"
        />
        {loading && (
          <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-muted">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-spin"
            >
              <path d="M21 12a9 9 0 1 1-2.64-6.36" />
              <path d="M21 3v6h-6" />
            </svg>
          </span>
        )}
      </div>

      {/* Pastilles de filtre (défaut : Tous → on ne masque jamais ce que l'utilisateur cherche). */}
      <div className="mt-2.5 flex gap-1.5">
        {pills.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setFilter(p.id)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
              filter === p.id ? "bg-brand text-white" : "bg-bg text-muted hover:bg-line/60"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {open && (shown.length > 0 || loading) && (
        <ul className="absolute z-30 mt-2 max-h-72 w-full overflow-auto rounded-2xl border border-line bg-card shadow-lg">
          {loading && shown.length === 0 && (
            <li className="px-4 py-3 text-sm text-muted">Recherche…</li>
          )}
          {!loading && shown.length === 0 && (
            <li className="px-4 py-3 text-sm text-muted">Aucun résultat pour ce filtre.</li>
          )}
          {shown.map((r) => (
            <li key={`${r.symbol}-${r.exchange}`}>
              <button
                type="button"
                onClick={() => pick(r)}
                className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-bg"
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  <TickerLogo ticker={r.symbol} size={26} kind={r.kind} />
                  <span className="min-w-0 truncate">
                    <span className="font-semibold">{r.symbol}</span>{" "}
                    <span className="text-muted">· {r.name}</span>
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  <KindBadge kind={r.kind} />
                  <span className="hidden text-xs text-muted sm:inline">{r.exchange}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
