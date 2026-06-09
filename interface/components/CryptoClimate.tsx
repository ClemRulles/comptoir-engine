import type { CryptoFile } from "@/lib/types";
import { TickerLogo } from "@/components/TickerLogo";

// Carte « Climat crypto » : sentiment (Fear & Greed), dominance, top cryptos en EUR.
// Radar de contexte pour l'IA — jamais un signal d'achat seul.

const FG_FR: Record<string, string> = {
  "Extreme Fear": "Peur extrême",
  Fear: "Peur",
  Neutral: "Neutre",
  Greed: "Avidité",
  "Extreme Greed": "Avidité extrême",
};

const eur0 = (n: number) =>
  n >= 1e9 ? `${(n / 1e9).toFixed(0)} Md€` : n >= 1e6 ? `${(n / 1e6).toFixed(0)} M€` : `${Math.round(n)} €`;
const price = (n: number | null) =>
  typeof n !== "number" ? "—" : n >= 100 ? Math.round(n).toLocaleString("fr-FR") + " €" : n.toFixed(2) + " €";
const pct = (n: number | null) => (typeof n !== "number" ? "—" : `${n >= 0 ? "+" : "−"}${Math.abs(n).toFixed(1)}%`);
const cls = (n: number | null) => (typeof n !== "number" ? "text-muted" : n >= 0 ? "up" : "down");

// Jauge horizontale Fear & Greed (0 peur → 100 avidité).
function FearGreedGauge({ value, label }: { value: number; label: string }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div>
      <div className="flex items-end justify-between">
        <div>
          <div className="text-3xl font-bold leading-none tabular-nums">{Math.round(v)}</div>
          <div className="mt-1 text-sm font-semibold text-ink">{label}</div>
        </div>
        <div className="text-right text-xs text-muted">
          <div>0 = peur</div>
          <div>100 = avidité</div>
        </div>
      </div>
      <div className="relative mt-3 h-2.5 rounded-full" style={{ background: "linear-gradient(90deg,#ef4444,#f59e0b,#eab308,#84cc16,#22c55e)" }}>
        <span
          className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-card shadow ring-2 ring-ink"
          style={{ left: `${v}%` }}
        />
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div>
      <div className="label">{label}</div>
      <div className={`font-semibold tabular-nums ${tone ?? "text-ink"}`}>{value}</div>
    </div>
  );
}

export function CryptoClimate({ crypto, demo }: { crypto: CryptoFile; demo: boolean }) {
  const m = crypto.market;
  const fg = crypto.fear_greed;
  const coins = (crypto.coins ?? []).slice(0, 6);
  const fgLabel = fg?.classification ? FG_FR[fg.classification] ?? fg.classification : "—";

  return (
    <div className="card-p">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-bold tracking-tight">₿ Climat crypto</h3>
          <span className="chip bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300">radar</span>
        </div>
        {demo ? (
          <span className="chip bg-slate-100 text-slate-500">Démo</span>
        ) : crypto.updated ? (
          <span className="text-xs text-muted">maj {crypto.updated}</span>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* Sentiment */}
        <div className="rounded-2xl border border-line bg-bg/40 p-4">
          <div className="label mb-2">Sentiment — Fear &amp; Greed</div>
          {fg && typeof fg.value === "number" ? (
            <FearGreedGauge value={fg.value} label={fgLabel} />
          ) : (
            <p className="text-sm text-muted">Indisponible.</p>
          )}
          {crypto.sentiment_read && (
            <p className="mt-3 text-xs text-slate-600 dark:text-slate-400">{crypto.sentiment_read}</p>
          )}
        </div>

        {/* Marché */}
        <div className="grid grid-cols-2 gap-4 rounded-2xl border border-line bg-bg/40 p-4">
          <Stat label="Cap. totale" value={typeof m?.total_market_cap_eur === "number" ? eur0(m.total_market_cap_eur) : "—"} />
          <Stat
            label="Cap. 24h"
            value={pct(m?.market_cap_change_24h_pct ?? null)}
            tone={cls(m?.market_cap_change_24h_pct ?? null)}
          />
          <Stat label="Dominance BTC" value={typeof m?.btc_dominance_pct === "number" ? `${m.btc_dominance_pct.toFixed(1)}%` : "—"} />
          <Stat label="Dominance ETH" value={typeof m?.eth_dominance_pct === "number" ? `${m.eth_dominance_pct.toFixed(1)}%` : "—"} />
        </div>
      </div>

      {/* Top cryptos */}
      {coins.length > 0 && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm row-hover">
            <thead>
              <tr className="label border-b border-line">
                <th className="py-2 text-left font-semibold">Crypto</th>
                <th className="text-right font-semibold">Cours</th>
                <th className="text-right font-semibold">24h</th>
                <th className="text-right font-semibold hidden sm:table-cell">7j</th>
                <th className="text-right font-semibold hidden sm:table-cell">30j</th>
              </tr>
            </thead>
            <tbody>
              {coins.map((c) => (
                <tr key={c.id} className="border-b border-line/60">
                  <td className="py-2.5">
                    <span className="flex items-center gap-2.5">
                      <TickerLogo ticker={`${c.symbol}-EUR`} kind="crypto" size={24} />
                      <span className="min-w-0">
                        <span className="font-semibold">{c.symbol}</span>{" "}
                        <span className="text-muted hidden sm:inline">· {c.name}</span>
                      </span>
                    </span>
                  </td>
                  <td className="text-right tabular-nums">{price(c.price_eur)}</td>
                  <td className={`text-right tabular-nums ${cls(c.change_24h_pct)}`}>{pct(c.change_24h_pct)}</td>
                  <td className={`text-right tabular-nums hidden sm:table-cell ${cls(c.change_7d_pct)}`}>{pct(c.change_7d_pct)}</td>
                  <td className={`text-right tabular-nums hidden sm:table-cell ${cls(c.change_30d_pct)}`}>{pct(c.change_30d_pct)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-3 text-xs text-muted">
        Source CoinGecko + alternative.me · cours différés, en euros. Radar à corroborer — l&apos;IA ne
        prend aucune position crypto sur ce seul signal.
      </p>
    </div>
  );
}
