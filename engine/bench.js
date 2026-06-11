#!/usr/bin/env node
// bench.js — rendement du BENCHMARK sur une période. Sert à la passe d'apprentissage
// du vendredi (method §I) : une position clôturée n'est un vrai succès que si elle a
// battu le marché sur la même période (alpha > 0), pas seulement si elle a monté.
//
// Usage :
//   node engine/bench.js 2026-06-04                    # du 4 juin à aujourd'hui
//   node engine/bench.js 2026-06-04 2026-07-10         # période fermée
//   node engine/bench.js 2026-06-04 2026-07-10 SPY     # autre benchmark
//
// Benchmark par défaut : IWDA.AS (iShares Core MSCI World, EUR, Amsterdam) — le book
// est en euros, le benchmark aussi. Yahoo, gratuit, sans clé.
//
// Sortie : lisible + ligne machine `BENCH_JSON:{...}` (benchmark_return_pct à recopier
// dans decisions.json ; alpha_pct = realized_pnl_pct − benchmark_return_pct).
// Ne bloque jamais : en cas d'échec, BENCH_JSON.ok=false et exit 0 (note un data_gap).

import { yahooRange } from "./lib/sources.js";
import { periodReturn } from "./lib/calc.js";

const DEFAULT_BENCHMARK = "IWDA.AS";

async function main() {
  const args = process.argv.slice(2).filter((a) => !a.startsWith("-"));
  const [from, to, symbol = DEFAULT_BENCHMARK] = args;
  if (!from || !/^\d{4}-\d{2}-\d{2}$/.test(from) || (to && !/^\d{4}-\d{2}-\d{2}$/.test(to))) {
    console.error("usage: node engine/bench.js YYYY-MM-DD [YYYY-MM-DD] [SYMBOL]");
    console.log("BENCH_JSON:" + JSON.stringify({ ok: false, error: "dates invalides" }));
    return;
  }

  // Marge de quelques jours avant `from` pour avoir une clôture de référence même
  // si `from` tombe un week-end/férié.
  const pad = new Date(new Date(from).getTime() - 7 * 86400000).toISOString().slice(0, 10);
  const points = await yahooRange(symbol, pad, to);
  const r = points ? periodReturn(points, from, to) : null;

  if (!r) {
    console.error(`bench: données ${symbol} indisponibles sur ${from} → ${to ?? "aujourd'hui"}.`);
    console.log("BENCH_JSON:" + JSON.stringify({ ok: false, symbol, from, to: to ?? null, error: "données indisponibles" }));
    return;
  }

  const pct = (r.return_pct * 100).toFixed(2);
  console.log(`📐 ${symbol} du ${r.entry_date} au ${r.exit_date} : ${r.return_pct >= 0 ? "+" : ""}${pct}%`);
  console.log(
    "BENCH_JSON:" +
      JSON.stringify({ ok: true, symbol, entry_date: r.entry_date, exit_date: r.exit_date, benchmark_return_pct: r.return_pct })
  );
}

main().catch((e) => {
  console.error("bench: erreur inattendue ->", e?.message || e);
  console.log("BENCH_JSON:" + JSON.stringify({ ok: false, error: String(e?.message || e) }));
  process.exit(0);
});
