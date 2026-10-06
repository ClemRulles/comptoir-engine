"use client";

// book.tsx — page « Fonds IA » : répartition par poche vs cible, positions groupées et
// dépliables (pourquoi on la détient, ce qui la ferait vendre), journal des décisions.
import { useMemo, useState } from "react";
import { ChevronDown, Info } from "lucide-react";
import type { BookPosition, SleeveView, TradeView } from "@/lib/data";
import type { Sleeve } from "@/lib/types";
import { DESK_LABEL, SLEEVE_META, fmtDay } from "@/lib/insights";
import { TickerCell } from "@/components/StockDrawer";
import { Badge, Change, fmtEur, fmtShare } from "@/components/ui";

// ── Répartition par poche ────────────────────────────────────────────────────────────
export function SleeveBars({ sleeves }: { sleeves: SleeveView[] }) {
  return (
    <div>
      {/* Barre empilée : 2 px d'écart entre segments (lisibilité, daltonisme). */}
      <div className="flex h-3 w-full gap-[2px] overflow-hidden rounded-full" role="img" aria-label="Répartition du fonds par poche">
        {sleeves.filter((s) => s.weight > 0.001).map((s) => (
          <div key={s.key} style={{ width: `${s.weight * 100}%`, background: SLEEVE_META[s.key].color }} className="h-full first:rounded-l-full last:rounded-r-full" title={`${SLEEVE_META[s.key].short} ${fmtShare(s.weight)}`} />
        ))}
      </div>
      <ul className="mt-5 space-y-3.5">
        {sleeves.map((s) => {
          const m = SLEEVE_META[s.key];
          const [lo, hi] = s.band;
          const out = s.weight < lo - 0.0005 || s.weight > hi + 0.0005;
          return (
            <li key={s.key}>
              <div className="flex items-baseline justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-[3px]" style={{ background: m.color }} />
                  <span className="text-sm font-semibold">{m.label}</span>
                  {out && <Badge tone="ai">hors cible</Badge>}
                </div>
                <div className="num shrink-0 text-sm">
                  <b>{fmtShare(s.weight)}</b>
                  <span className="text-muted"> · cible {fmtShare(s.target)}</span>
                </div>
              </div>
              <div className="relative mt-1.5 h-1.5 rounded-full bg-slate-500/15">
                {/* plage autorisée */}
                <div className="absolute inset-y-0 rounded-full bg-slate-500/15" style={{ left: `${lo * 100}%`, width: `${(hi - lo) * 100}%` }} />
                <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${Math.min(1, s.weight) * 100}%`, background: m.color }} />
                <div className="absolute -top-1 h-3.5 w-0.5 rounded-full bg-ink/70" style={{ left: `calc(${s.target * 100}% - 1px)` }} />
              </div>
              <div className="mt-1 text-[12px] text-muted">{m.desc} <span className="num">· {fmtEur(s.value)}</span></div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ── Positions groupées par poche ─────────────────────────────────────────────────────
const ORDER: Sleeve[] = ["coeur", "tactique", "crypto", "socle"];

export function PositionsBySleeve({ positions }: { positions: BookPosition[] }) {
  const groups = useMemo(() => ORDER.map((k) => ({ k, items: positions.filter((p) => p.sleeve === k) })).filter((g) => g.items.length), [positions]);
  return (
    <div className="space-y-6">
      {groups.map((g) => {
        const m = SLEEVE_META[g.k];
        const total = g.items.reduce((s, p) => s + p.marketValue, 0);
        return (
          <section key={g.k}>
            <div className="mb-2 flex items-baseline justify-between">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: m.color }} />
                {m.label}
                <span className="font-normal text-muted">· {g.items.length}</span>
              </h3>
              <span className="num text-xs text-muted">{fmtEur(total)}</span>
            </div>
            <ul className="divide-y divide-line/70 rounded-2xl border border-line/80">
              {g.items.map((p) => (
                <PositionRow key={p.ticker} p={p} />
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

function PositionRow({ p }: { p: BookPosition }) {
  const [open, setOpen] = useState(false);
  return (
    <li>
      {/* Ligne entière cliquable (le ticker, lui-même un bouton, ouvre la fiche du titre) :
          pas de <button> imbriqué — rôle bouton + clavier sur le conteneur. */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen((v) => !v);
          }
        }}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center gap-3 px-3.5 py-3 text-left transition-colors hover:bg-bg/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand/40 sm:px-4"
      >
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <TickerCell ticker={p.ticker} />
            {p.sector && <span className="hidden truncate text-[12px] text-muted sm:inline">{p.sector}</span>}
          </span>
          <span className="mt-0.5 block truncate text-[13px] text-muted">{p.thesisShort}</span>
        </span>
        <span className="hidden w-16 text-right text-[12px] text-muted sm:block num">{fmtShare(p.weight, 1)}</span>
        <span className="w-20 text-right text-sm font-semibold num">{fmtEur(p.marketValue)}</span>
        <span className="w-[76px] text-right">
          <Change value={p.pnlPct} />
        </span>
        <ChevronDown size={16} className={`shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`} />
      </div>
      {open && (
        <div className="grid grid-cols-1 gap-3 border-t border-line/60 bg-elev/60 px-4 py-3.5 text-[13px] sm:grid-cols-3">
          <div className="sm:col-span-2">
            <div className="eyebrow mb-1">Pourquoi l&apos;IA la détient</div>
            <p className="leading-relaxed">{p.thesisShort || "—"}</p>
            {p.exitRule && (
              <>
                <div className="eyebrow mb-1 mt-3">Ce qui la ferait vendre</div>
                <p className="leading-relaxed text-slate-600">{p.exitRule}</p>
              </>
            )}
          </div>
          <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[12px] sm:grid-cols-1">
            <Item k="Confiance" v={p.confidence ?? "—"} />
            <Item k="Desk" v={p.desk ? DESK_LABEL[p.desk] ?? p.desk : "—"} />
            <Item k="Entrée" v={p.entryDate ? fmtDay(p.entryDate) : "—"} />
            <Item k="Prix d'entrée" v={p.costBasis ? fmtEur(p.costBasis, 2) : "—"} />
            <Item k="Cours" v={p.price != null ? fmtEur(p.price, 2) : "—"} />
            <Item k="Gain latent" v={fmtEur(p.pnl)} />
          </dl>
        </div>
      )}
    </li>
  );
}

function Item({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2 sm:justify-start">
      <dt className="text-muted">{k}</dt>
      <dd className="num font-medium sm:ml-auto">{v}</dd>
    </div>
  );
}

// ── Journal des décisions ────────────────────────────────────────────────────────────
export function TradesJournal({ trades }: { trades: TradeView[] }) {
  const [all, setAll] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);
  const list = all ? trades : trades.slice(0, 8);
  if (!trades.length) return <p className="text-sm text-muted">Aucun mouvement enregistré pour l&apos;instant.</p>;
  return (
    <div>
      <ol className="relative space-y-0 border-l border-line pl-5">
        {list.map((t, i) => {
          const buy = t.side === "buy";
          const m = SLEEVE_META[t.sleeve];
          const long = t.full && t.full.length > t.why.length + 20;
          return (
            <li key={`${t.ts}-${t.ticker}-${i}`} className="relative pb-5 last:pb-0">
              <span className={`absolute -left-[27px] top-1 h-3 w-3 rounded-full ring-4 ring-card ${buy ? "bg-brand" : "bg-danger"}`} />
              <div className="flex flex-wrap items-center gap-2 text-[13px]">
                <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${buy ? "bg-brand/10 text-brand-600 dark:text-brand-500" : "bg-danger/10 text-danger"}`}>{buy ? "Achat" : "Vente"}</span>
                <TickerCell ticker={t.ticker} logoSize={18} />
                <span className="num text-muted">{fmtEur(t.amount)}</span>
                <span className="inline-flex items-center gap-1 text-[11px] text-muted">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: m.color }} />
                  {m.short}
                </span>
                <span className="ml-auto text-[11px] text-muted">{fmtDay(t.ts)}</span>
              </div>
              <p className="mt-1 text-[14px] leading-relaxed">{t.why}</p>
              {long && (
                <button type="button" onClick={() => setExpanded(expanded === i ? null : i)} className="mt-1 inline-flex items-center gap-1 text-[12px] font-medium text-muted hover:text-ink">
                  <Info size={12} /> {expanded === i ? "Masquer le raisonnement complet" : "Raisonnement complet du moteur"}
                </button>
              )}
              {expanded === i && <p className="mt-1.5 rounded-xl bg-elev px-3 py-2 text-[12px] leading-relaxed text-slate-600">{t.full}</p>}
            </li>
          );
        })}
      </ol>
      {trades.length > 8 && (
        <button type="button" onClick={() => setAll((v) => !v)} className="btn mt-4 w-full">
          {all ? "Réduire" : `Voir les ${trades.length} mouvements`}
        </button>
      )}
    </div>
  );
}
