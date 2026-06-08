"use client";

import { useEffect, useRef, useState } from "react";
import { TickerLogo } from "@/components/TickerLogo";
import { useStockDrawer } from "@/components/StockDrawer";

type Result = { symbol: string; name: string; exchange: string; type: string };

// Barre de recherche proéminente : cherche n'importe quel actif (Yahoo) et ouvre son
// graphique de cours dans le tiroir partagé (même design que partout ailleurs).
export function AssetSearch() {
  const openStock = useStockDrawer();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
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

  function pick(r: Result) {
    openStock(r.symbol, r.name);
    setOpen(false);
    setQuery("");
    setResults([]);
  }

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
          placeholder="Rechercher un actif — nom ou ticker (ex. Nvidia, AAPL, Air Liquide)"
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

      {open && (results.length > 0 || loading) && (
        <ul className="absolute z-30 mt-2 max-h-72 w-full overflow-auto rounded-2xl border border-line bg-card shadow-lg">
          {loading && results.length === 0 && (
            <li className="px-4 py-3 text-sm text-muted">Recherche…</li>
          )}
          {results.map((r) => (
            <li key={`${r.symbol}-${r.exchange}`}>
              <button
                type="button"
                onClick={() => pick(r)}
                className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-bg"
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  <TickerLogo ticker={r.symbol} size={26} />
                  <span className="min-w-0 truncate">
                    <span className="font-semibold">{r.symbol}</span>{" "}
                    <span className="text-muted">· {r.name}</span>
                  </span>
                </span>
                <span className="shrink-0 text-xs text-muted">{r.exchange}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
