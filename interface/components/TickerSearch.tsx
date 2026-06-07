"use client";

import { useEffect, useRef, useState } from "react";

type Result = { symbol: string; name: string; exchange: string; type: string };

// Combobox de recherche de titres (via /api/ticker-search → Yahoo) pour choisir le bon
// ticker sans le deviner. Appelle onSelect(symbol, name) quand on clique un résultat.
export function TickerSearch({
  value,
  onChange,
  onSelect,
}: {
  value: string;
  onChange: (text: string) => void;
  onSelect: (symbol: string, name: string) => void;
}) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<Result[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => setQuery(value), [value]);

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
    onSelect(r.symbol, r.name);
    setQuery(r.symbol);
    setOpen(false);
  }

  return (
    <div className="relative" ref={boxRef}>
      <input
        className="input mt-1"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          onChange(e.target.value.toUpperCase());
        }}
        onFocus={() => results.length && setOpen(true)}
        placeholder="Tape un nom ou un ticker (ex. Air Liquide)"
        autoComplete="off"
        required
      />
      {open && (results.length > 0 || loading) && (
        <ul className="absolute z-30 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-line bg-card shadow-lg">
          {loading && results.length === 0 && (
            <li className="px-3 py-2 text-sm text-muted">Recherche…</li>
          )}
          {results.map((r) => (
            <li key={`${r.symbol}-${r.exchange}`}>
              <button
                type="button"
                onClick={() => pick(r)}
                className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-bg"
              >
                <span className="min-w-0">
                  <span className="font-semibold">{r.symbol}</span>{" "}
                  <span className="text-muted">· {r.name}</span>
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
