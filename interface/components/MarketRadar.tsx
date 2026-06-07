import type { MarketSignals, TickerSignals } from "@/lib/types";
import { TickerCell } from "@/components/StockDrawer";

// ── Helpers de mise en forme ───────────────────────────────────────────
const pctSigned = (n: number) => `${n >= 0 ? "+" : "−"}${Math.abs(n * 100).toFixed(0)}%`;

type Tone = "danger" | "warn" | "good" | "info";
const TONE_CLS: Record<Tone, string> = {
  danger: "bg-danger/10 text-danger",
  warn: "bg-ai/10 text-ai",
  good: "bg-brand/10 text-brand-600",
  info: "bg-sky-500/10 text-sky-600",
};

const GATE_CLS: Record<string, string> = {
  vert: "bg-brand/10 text-brand-600",
  ambre: "bg-ai/10 text-ai",
  rouge: "bg-danger/10 text-danger",
};
const GATE_DOT: Record<string, string> = { vert: "🟢", ambre: "🟠", rouge: "🔴" };

// Dérive les signaux « à surveiller » d'un titre.
function alertsFor(t: TickerSignals): { label: string; tone: Tone }[] {
  const a: { label: string; tone: Tone }[] = [];
  const rsi = t.rsi_14?.value;
  if (typeof rsi === "number") {
    if (rsi >= 70) a.push({ label: `RSI ${Math.round(rsi)} suracheté`, tone: "warn" });
    else if (rsi <= 30) a.push({ label: `RSI ${Math.round(rsi)} survendu`, tone: "info" });
  }
  const vol = t.rel_volume?.value;
  if (typeof vol === "number" && vol >= 1.5) a.push({ label: `Volume ×${vol.toFixed(1)}`, tone: "warn" });
  const r52 = t.range_52w?.value;
  if (typeof r52 === "number") {
    if (r52 >= 0.9) a.push({ label: "Proche plus-haut 52 sem.", tone: "good" });
    else if (r52 <= 0.1) a.push({ label: "Proche plus-bas 52 sem.", tone: "danger" });
  }
  if (t.momentum_12_1?.overheated) a.push({ label: "Momentum en surchauffe", tone: "warn" });
  const buys = t.insider_90d?.buys ?? 0;
  const sells = t.insider_90d?.sells ?? 0;
  if (buys > 0 && buys >= sells) a.push({ label: `Achats d'initiés (${buys})`, tone: "good" });
  const f = t.fscore?.score;
  if (typeof f === "number" && f <= 3) a.push({ label: `F-Score faible (${f})`, tone: "danger" });
  if (t.gate?.verdict === "rouge") a.push({ label: "Gate rouge", tone: "danger" });
  return a;
}

function gateRank(v?: string) {
  return v === "rouge" ? 0 : v === "ambre" ? 1 : v === "vert" ? 2 : 3;
}

// Barre de position dans le range 52 semaines (0 = plus-bas, 1 = plus-haut).
function Range52({ value }: { value?: number | null }) {
  if (typeof value !== "number") return <span className="text-muted">—</span>;
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div className="flex items-center gap-2">
      <div className="relative h-1.5 w-16 rounded-full bg-slate-100">
        <span
          className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink ring-2 ring-card"
          style={{ left: `${pct}%` }}
        />
      </div>
      <span className="tabular-nums text-muted">{Math.round(pct)}%</span>
    </div>
  );
}

function RsiBadge({ s }: { s?: TickerSignals["rsi_14"] }) {
  if (!s || typeof s.value !== "number") return <span className="text-muted">—</span>;
  const v = Math.round(s.value);
  const cls = v >= 70 ? "text-ai" : v <= 30 ? "text-sky-600" : "text-ink";
  return <span className={`font-semibold tabular-nums ${cls}`}>{v}</span>;
}

export function MarketRadar({ signals, demo }: { signals: MarketSignals; demo: boolean }) {
  const rows = Object.values(signals.tickers || {}).sort(
    (a, b) => gateRank(a.gate?.verdict) - gateRank(b.gate?.verdict) || a.ticker.localeCompare(b.ticker)
  );
  const regime = signals.regime;
  const watch = rows
    .map((t) => ({ t, alerts: alertsFor(t) }))
    .filter((x) => x.alerts.length > 0);

  return (
    <div className="space-y-4">
      {/* Bandeau régime */}
      {regime && (
        <div className="card-p flex flex-wrap items-center gap-x-6 gap-y-2">
          <div>
            <div className="label">Régime de marché</div>
            <div className="text-lg font-bold tracking-tight">{regime.label}</div>
          </div>
          {typeof regime.fear_greed === "number" && (
            <div>
              <div className="label">Peur / avidité</div>
              <div className="font-semibold tabular-nums">{regime.fear_greed}/100</div>
            </div>
          )}
          {typeof regime.cash_floor === "number" && (
            <div>
              <div className="label">Plancher de cash</div>
              <div className="font-semibold tabular-nums">{Math.round(regime.cash_floor * 100)}%</div>
            </div>
          )}
          {regime.flags && regime.flags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              {regime.flags.slice(0, 4).map((f) => (
                <span key={f} className="chip bg-bg text-muted text-xs">{f}</span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Signaux à surveiller */}
      <div className="card-p">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-bold tracking-tight">Signaux à surveiller</h3>
          <span className="text-xs text-muted">{watch.length} titre(s) avec alerte</span>
        </div>
        {watch.length === 0 ? (
          <p className="text-sm text-muted">Aucun signal notable sur les titres suivis.</p>
        ) : (
          <ul className="space-y-2.5">
            {watch.map(({ t, alerts }) => (
              <li key={t.ticker} className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
                <TickerCell ticker={t.ticker} logoSize={20} />
                {alerts.map((al, i) => (
                  <span key={i} className={`chip text-xs ${TONE_CLS[al.tone]}`}>{al.label}</span>
                ))}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Tableau complet des signaux */}
      <div className="card-p overflow-x-auto">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-bold tracking-tight">Signaux par titre</h3>
          <span className="text-xs text-muted">
            {demo ? "démo" : signals.updated ? `maj ${new Date(signals.updated).toLocaleDateString("fr-FR")}` : ""}
          </span>
        </div>
        <table className="w-full text-sm row-hover">
          <thead>
            <tr className="label border-b border-line">
              <th className="py-2 text-left font-semibold">Titre</th>
              <th className="text-center font-semibold">Gate</th>
              <th className="text-right font-semibold">RSI 14</th>
              <th className="text-right font-semibold hidden sm:table-cell">Mom. 12-1</th>
              <th className="text-right font-semibold hidden md:table-cell">Vol. rel.</th>
              <th className="text-left font-semibold pl-4 hidden lg:table-cell">Range 52s</th>
              <th className="text-right font-semibold hidden xl:table-cell">F-Score</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((t) => {
              const g = t.gate?.verdict ?? "indéterminé";
              const mom = t.momentum_12_1?.value;
              const vol = t.rel_volume?.value;
              return (
                <tr key={t.ticker} className="border-b border-line/60">
                  <td className="py-2.5"><TickerCell ticker={t.ticker} logoSize={22} /></td>
                  <td className="text-center">
                    <span className={`chip text-xs ${GATE_CLS[g] ?? "bg-slate-100 text-slate-500"}`}>
                      {GATE_DOT[g] ?? "⚪"} {g}
                    </span>
                  </td>
                  <td className="text-right"><RsiBadge s={t.rsi_14} /></td>
                  <td className={`text-right tabular-nums hidden sm:table-cell ${typeof mom === "number" ? (mom >= 0 ? "up" : "down") : "text-muted"}`}>
                    {typeof mom === "number" ? pctSigned(mom) : "—"}
                  </td>
                  <td className={`text-right tabular-nums hidden md:table-cell ${typeof vol === "number" && vol >= 1.5 ? "text-ai font-semibold" : "text-muted"}`}>
                    {typeof vol === "number" ? `×${vol.toFixed(1)}` : "—"}
                  </td>
                  <td className="pl-4 hidden lg:table-cell"><Range52 value={t.range_52w?.value} /></td>
                  <td className="text-right tabular-nums hidden xl:table-cell text-muted">
                    {typeof t.fscore?.score === "number" ? `${t.fscore.score}/9` : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {signals.data_gaps && signals.data_gaps.length > 0 && (
          <p className="mt-3 text-xs text-muted">
            Données partielles : {signals.data_gaps.join(" · ")}.
          </p>
        )}
      </div>
    </div>
  );
}
