"use client";

import { useState } from "react";
import type { GrokPulseWeek } from "@/lib/types";
import { TickerCell } from "@/components/StockDrawer";

// Repli si le label de semaine n'est pas fourni : dérive un libellé lisible depuis la date.
const MONTHS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
function weekLabel(w: GrokPulseWeek): string {
  if (w.label) return w.label;
  const m = w.date?.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return `Semaine du ${Number(m[3])} ${MONTHS[Number(m[2]) - 1] ?? ""} ${m[1]}`.trim();
  return w.week || "Semaine";
}

function Arrow({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      {dir === "left" ? <path d="M15 18l-6-6 6-6" /> : <path d="M9 18l6-6-6-6" />}
    </svg>
  );
}

function CorroBadge({ ok }: { ok?: boolean }) {
  return ok ? (
    <span className="chip bg-brand/10 text-brand-600 text-[11px]">✓ corroboré</span>
  ) : (
    <span className="chip bg-ai/10 text-ai text-[11px]">à corroborer</span>
  );
}

export function MarketPulse({ weeks, demo }: { weeks: GrokPulseWeek[]; demo: boolean }) {
  const [i, setI] = useState(0); // 0 = semaine la plus récente
  if (!weeks || weeks.length === 0) {
    return (
      <div className="card-p">
        <p className="text-sm text-muted">
          Pas encore de pouls du marché — le Trend Radar du lundi l&apos;alimente via Grok (accès X).
        </p>
      </div>
    );
  }
  const w = weeks[Math.min(i, weeks.length - 1)];
  const themes = w.themes ?? [];
  const movers = w.movers ?? [];

  return (
    <div className="card-p relative overflow-hidden">
      {/* Halo d'ambiance */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-ai/10 blur-3xl" />

      {/* En-tête : titre, navigation semaine ←→ */}
      <div className="relative mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="label">📡 Pouls du marché</span>
            {demo && <span className="chip bg-slate-100 text-slate-500 text-[11px]">Démo</span>}
          </div>
          <h2 className="mt-0.5 truncate text-lg font-bold tracking-tight">{weekLabel(w)}</h2>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            aria-label="Semaine précédente"
            onClick={() => setI((v) => Math.min(weeks.length - 1, v + 1))}
            disabled={i >= weeks.length - 1}
            className="btn btn-ghost h-9 w-9 p-0 disabled:opacity-30"
          >
            <Arrow dir="left" />
          </button>
          <span className="tabular-nums text-xs text-muted">
            {weeks.length - i} / {weeks.length}
          </span>
          <button
            type="button"
            aria-label="Semaine suivante"
            onClick={() => setI((v) => Math.max(0, v - 1))}
            disabled={i <= 0}
            className="btn btn-ghost h-9 w-9 p-0 disabled:opacity-30"
          >
            <Arrow dir="right" />
          </button>
        </div>
      </div>

      {/* Contenu de la semaine — re-animé à chaque changement (key) */}
      <div key={w.week} className="animate-fade-up space-y-5">
        {w.headline && (
          <p className="text-sm leading-relaxed text-slate-600">{w.headline}</p>
        )}

        {/* Thèmes & tendances */}
        {themes.length > 0 && (
          <div>
            <h3 className="label mb-2">Thèmes & tendances</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {themes.map((t, k) => (
                <div key={k} className="rounded-xl2 border border-line bg-bg/40 p-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold leading-snug">{t.title}</span>
                    <CorroBadge ok={t.corroborated} />
                  </div>
                  {t.detail && <p className="mt-1.5 text-sm text-muted">{t.detail}</p>}
                  {t.tickers && t.tickers.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                      {t.tickers.map((tk) => (
                        <TickerCell key={tk} ticker={tk} logoSize={18} className="text-sm" />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Titres qui ont bougé */}
        {movers.length > 0 && (
          <div>
            <h3 className="label mb-2">Titres qui ont bougé</h3>
            <ul className="space-y-2">
              {movers.map((m, k) => {
                const up = m.direction === "up";
                return (
                  <li
                    key={k}
                    className={`flex items-start gap-3 rounded-lg border-l-2 bg-bg/40 px-3 py-2 ${
                      m.held ? "border-ai" : "border-line"
                    }`}
                  >
                    <span className={`mt-0.5 ${up ? "up" : "down"}`}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        {up ? <path d="M7 14l5-5 5 5z" /> : <path d="M7 10l5 5 5-5z" />}
                      </svg>
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <TickerCell ticker={m.ticker} logoSize={18} className="text-sm" />
                        {m.held && <span className="chip bg-ai/10 text-ai text-[10px]">détenu</span>}
                      </div>
                      {m.reason && <p className="mt-0.5 text-sm text-muted">{m.reason}</p>}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {w.sources && w.sources.length > 0 && (
          <p className="text-[11px] text-muted">Sources : {w.sources.join(" · ")}</p>
        )}
      </div>

      <p className="relative mt-4 border-t border-line/60 pt-3 text-[11px] text-muted">
        Radar à corroborer — le sentiment X n&apos;est jamais un signal d&apos;achat. Paper trading.
      </p>
    </div>
  );
}
