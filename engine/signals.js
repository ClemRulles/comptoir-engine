#!/usr/bin/env node
// signals.js — pipeline de signaux QUANTITATIFS du fonds IA.
//
// Calcule, pour un ensemble de tickers, des signaux FACTUELS et déterministes :
//   • F-Score de Piotroski (0-9)        — qualité fondamentale       [FMP]
//   • Momentum 12-1                     — tendance de prix, plafonnée [Stooq, sans clé]
//   • Qualité des earnings (accruals)   — bénéfices adossés au cash   [FMP]
//   • Régime macro (cadran + cash floor)— garde-fou global           [FRED]
// puis un `gate` (vert/ambre/rouge) par titre. Écrit le cache memory/fund/signals.json.
//
// Usage :
//   node engine/signals.js                 # tickers = positions du book IA
//   node engine/signals.js AMZN NFLX SAF.PA # tickers explicites (Scout/Deep-dive)
//
// Discipline (CLAUDE.md) : aucune clé requise pour tourner. Toute source absente
// (clé manquante, quota, réseau) -> le signal vaut null et la source est listée dans
// `data_gaps`. On ne bloque JAMAIS une routine pour une API manquante ; l'IA lit le
// cache, voit les trous, et reste honnête sur l'incertitude.

import { readJsonSafe, writeJson, fundPath } from "./lib/io.js";
import { KEYS, stooqMonthly, fredLatest, fmp } from "./lib/sources.js";
import { momentum12_1, piotroski, earningsQuality, regimeScore, gate } from "./lib/calc.js";
import { TODAY } from "./lib/schema.js";

function resolveTickers() {
  const args = process.argv.slice(2).filter((a) => !a.startsWith("-"));
  if (args.length) return args;
  const fund = readJsonSafe(fundPath("ai-fund.json"));
  const positions = fund.status === "ok" ? fund.data.positions : null;
  if (Array.isArray(positions) && positions.length) return positions.map((p) => p.ticker);
  return [];
}

async function computeRegime(gaps) {
  if (!KEYS.FRED) {
    gaps.push("FRED (clé absente) -> régime macro non calculé");
    return regimeScore({});
  }
  // Récupère les séries en parallèle ; chaque échec individuel -> null.
  const [t10y2y, unrate, cpi, ff] = await Promise.all([
    fredLatest("T10Y2Y"),
    fredLatest("UNRATE"),
    fredLatest("CPIAUCSL"), // niveau ; on n'a pas le YoY ici sans 2e appel -> approx via note
    fredLatest("FEDFUNDS"),
  ]);
  const inputs = {
    t10y2y: t10y2y?.value ?? null,
    unrate: unrate?.value ?? null,
    unrate_prev: null, // une seule observation récupérée ; tendance affinée par la routine
    cpi_yoy: null, // CPIAUCSL est un niveau ; le YoY se calcule côté routine si besoin
    fedfunds: ff?.value ?? null,
  };
  const r = regimeScore(inputs);
  r.inputs = inputs;
  r.asof = t10y2y?.date ?? unrate?.date ?? TODAY();
  if (!t10y2y) gaps.push("FRED T10Y2Y indisponible");
  return r;
}

async function computeTicker(ticker, gaps) {
  const out = { ticker, asof: TODAY() };

  // Momentum (Stooq, sans clé) ---------------------------------------------
  const monthly = await stooqMonthly(ticker);
  out.momentum_12_1 = monthly ? momentum12_1(monthly) : null;
  if (!out.momentum_12_1) gaps.push(`${ticker}: momentum indisponible (Stooq KO/non mappé)`);

  // Fondamentaux (FMP) : F-Score + qualité des earnings --------------------
  if (KEYS.FMP) {
    const [inc, bal, cf] = await Promise.all([fmp.income(ticker, 2), fmp.balance(ticker, 2), fmp.cashflow(ticker, 2)]);
    if (inc && bal && cf && inc.length >= 2) {
      // FMP renvoie le plus récent en premier.
      const cur = { ...inc[0], ...bal[0], ...cf[0] };
      const prev = { ...inc[1], ...bal[1], ...cf[1] };
      out.fscore = piotroski(cur, prev);
      out.earnings_quality = earningsQuality(inc[0], cf[0], bal[0]);
    } else {
      out.fscore = null;
      out.earnings_quality = null;
      gaps.push(`${ticker}: états financiers FMP incomplets`);
    }
  } else {
    out.fscore = null;
    out.earnings_quality = null;
  }

  out.gate = gate({ fscore: out.fscore, momentum: out.momentum_12_1, eq: out.earnings_quality });
  return out;
}

async function main() {
  const tickers = resolveTickers();
  const gaps = [];
  if (!KEYS.FMP) gaps.push("FMP (clé absente) -> F-Score & qualité des earnings non calculés");

  console.log(`📈 signals — ${tickers.length} ticker(s) : ${tickers.join(", ") || "(aucun)"}`);

  const regime = await computeRegime(gaps);
  console.log(`   régime macro : ${regime.label}${regime.cash_floor != null ? ` (plancher cash ${Math.round(regime.cash_floor * 100)}%)` : ""}`);

  const tickerMap = {};
  for (const t of tickers) {
    tickerMap[t] = await computeTicker(t, gaps);
    const g = tickerMap[t].gate;
    const fs = tickerMap[t].fscore?.ok ? `F${tickerMap[t].fscore.score}/9` : "F·";
    const mom = tickerMap[t].momentum_12_1?.ok ? `${(tickerMap[t].momentum_12_1.value * 100).toFixed(0)}%` : "mom·";
    const icon = { vert: "🟢", ambre: "🟠", rouge: "🔴", "indéterminé": "⚪" }[g.verdict] || "⚪";
    console.log(`   ${icon} ${t.padEnd(8)} ${fs}  mom ${mom}`);
  }

  const doc = readJsonSafe(fundPath("signals.json"));
  const out = {
    _doc:
      (doc.status === "ok" && doc.data._doc) ||
      "Cache des signaux QUANTITATIFS calculés par engine/signals.js. Voir engine/README.md et skills/quant-signals.md.",
    updated: new Date().toISOString(),
    regime,
    tickers: tickerMap,
    data_gaps: gaps,
  };
  writeJson(fundPath("signals.json"), out);

  console.log(`   → memory/fund/signals.json écrit${gaps.length ? ` · ${gaps.length} data_gap(s)` : ""}`);
  console.log("SIGNALS_JSON:" + JSON.stringify({ ok: true, tickers: tickers.length, gaps: gaps.length, regime: regime.label }));
}

main().catch((e) => {
  // Même en cas d'imprévu, on ne fait pas planter la routine : on écrit le diagnostic.
  console.error("signals: erreur inattendue ->", e?.message || e);
  console.log("SIGNALS_JSON:" + JSON.stringify({ ok: false, error: String(e?.message || e) }));
  process.exit(0);
});
