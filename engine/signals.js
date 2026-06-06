#!/usr/bin/env node
// signals.js — pipeline de signaux QUANTITATIFS du fonds IA.
//
// Calcule, pour un ensemble de tickers, des signaux FACTUELS et déterministes,
// puis un `gate` pondéré (vert/ambre/rouge/indéterminé). Écrit memory/fund/signals.json.
//
//   Prix (Yahoo, sans clé) : momentum 12-1 · RSI 14 · volume relatif 20j · range 52 sem.
//   Initiés (OpenInsider, sans clé) : ratio achats/ventes 90j (titres US).
//   Fondamentaux (FMP, clé) : F-Score Piotroski · qualité des earnings (accruals).
//   Croissance (Alpha Vantage, clé) : EPS surprise · croissance du CA YoY.
//   Régime (FRED, clé) : courbe/chômage/inflation + proxy peur/avidité (VIX, spreads HY).
//
// Usage :
//   node engine/signals.js                  # tickers = positions du book IA
//   node engine/signals.js AMZN NFLX SAF.PA # tickers ciblés (Scout/Deep-dive/Doctor)
//
// Discipline (CLAUDE.md) : aucune clé requise pour tourner. Sans FMP/FRED/Alpha Vantage,
// les signaux de prix + initiés (gratuits) suffisent à produire un gate exploitable ;
// les sources manquantes -> null + `data_gaps`. On ne bloque JAMAIS une routine.

import { readJsonSafe, writeJson, fundPath } from "./lib/io.js";
import { KEYS, yahooDaily, openInsider, fredLatest, fredYoY, fmp, alphaEarnings, alphaRevenueGrowth } from "./lib/sources.js";
import { momentumFromCloses, rsi, relativeVolume, range52w, insiderSignal, piotroski, earningsQuality, regimeScore, gate } from "./lib/calc.js";
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
    gaps.push("FRED (clé absente) -> régime macro + proxy peur/avidité non calculés");
    return regimeScore({});
  }
  const [t10y2y, unrate, cpiYoY, ff, vix, hy] = await Promise.all([
    fredLatest("T10Y2Y"),
    fredLatest("UNRATE"),
    fredYoY("CPIAUCSL"),
    fredLatest("FEDFUNDS"),
    fredLatest("VIXCLS"),
    fredLatest("BAMLH0A0HYM2"),
  ]);
  const inputs = {
    t10y2y: t10y2y?.value ?? null,
    unrate: unrate?.value ?? null,
    unrate_prev: null,
    cpi_yoy: cpiYoY?.value ?? null,
    fedfunds: ff?.value ?? null,
    vix: vix?.value ?? null,
    hy_spread: hy?.value ?? null,
  };
  const r = regimeScore(inputs);
  r.inputs = inputs;
  r.asof = t10y2y?.date ?? vix?.date ?? TODAY();
  for (const [k, v] of [["T10Y2Y", t10y2y], ["VIXCLS", vix], ["BAMLH0A0HYM2", hy]])
    if (!v) gaps.push(`FRED ${k} indisponible`);
  return r;
}

async function computeTicker(ticker, gaps) {
  const out = { ticker, asof: TODAY() };

  // --- Signaux de prix (Yahoo, un seul appel) -----------------------------
  const yd = await yahooDaily(ticker);
  if (yd) {
    out.momentum_12_1 = momentumFromCloses(yd.closes);
    out.rsi_14 = rsi(yd.closes, 14);
    out.rel_volume = relativeVolume(yd.volumes, 20);
    out.range_52w = range52w(yd.price, yd.low52, yd.high52);
    out.price = yd.price;
    out.currency = yd.currency;
  } else {
    out.momentum_12_1 = out.rsi_14 = out.rel_volume = out.range_52w = null;
    gaps.push(`${ticker}: prix Yahoo indisponible`);
  }

  // --- Initiés (OpenInsider, sans clé, titres US) -------------------------
  const oi = await openInsider(ticker);
  out.insider_90d = insiderSignal(oi);
  if (!out.insider_90d) gaps.push(`${ticker}: initiés OpenInsider indisponibles (non-US ?)`);

  // --- Fondamentaux (FMP) -------------------------------------------------
  if (KEYS.FMP) {
    const [inc, bal, cf] = await Promise.all([fmp.income(ticker, 2), fmp.balance(ticker, 2), fmp.cashflow(ticker, 2)]);
    if (inc && bal && cf && inc.length >= 2) {
      const cur = { ...inc[0], ...bal[0], ...cf[0] };
      const prev = { ...inc[1], ...bal[1], ...cf[1] };
      out.fscore = piotroski(cur, prev);
      out.earnings_quality = earningsQuality(inc[0], cf[0], bal[0]);
    } else {
      out.fscore = out.earnings_quality = null;
      gaps.push(`${ticker}: états financiers FMP incomplets`);
    }
  } else {
    out.fscore = out.earnings_quality = null;
  }

  // --- Croissance (Alpha Vantage) -----------------------------------------
  if (KEYS.ALPHAVANTAGE) {
    const [eps, rev] = await Promise.all([alphaEarnings(ticker), alphaRevenueGrowth(ticker)]);
    out.eps_surprise = eps ? { ...eps, ok: true } : null;
    out.revenue_growth = rev ? { ...rev, ok: true } : null;
  } else {
    out.eps_surprise = out.revenue_growth = null;
  }

  // --- Gate composite pondéré ---------------------------------------------
  out.gate = gate({
    fscore: out.fscore,
    eq: out.earnings_quality,
    momentum: out.momentum_12_1,
    rsi: out.rsi_14,
    range52w: out.range_52w,
    insider: out.insider_90d,
    relVolume: out.rel_volume,
    eps: out.eps_surprise,
    revenue: out.revenue_growth,
  });
  return out;
}

async function main() {
  const tickers = resolveTickers();
  const gaps = [];
  if (!KEYS.FMP) gaps.push("FMP (clé absente) -> F-Score & qualité des earnings non calculés");
  if (!KEYS.ALPHAVANTAGE) gaps.push("Alpha Vantage (clé absente) -> EPS surprise & croissance CA non calculés");

  console.log(`📈 signals — ${tickers.length} ticker(s) : ${tickers.join(", ") || "(aucun)"}`);

  const regime = await computeRegime(gaps);
  console.log(
    `   régime macro : ${regime.label}` +
      (regime.fear_greed ? ` · ${regime.fear_greed}` : "") +
      (regime.cash_floor != null ? ` (plancher cash ${Math.round(regime.cash_floor * 100)}%)` : "")
  );

  const tickerMap = {};
  const tally = { vert: 0, ambre: 0, rouge: 0, "indéterminé": 0 };
  for (const t of tickers) {
    tickerMap[t] = await computeTicker(t, gaps);
    const g = tickerMap[t].gate;
    tally[g.verdict] = (tally[g.verdict] || 0) + 1;
    const icon = { vert: "🟢", ambre: "🟠", rouge: "🔴", "indéterminé": "⚪" }[g.verdict] || "⚪";
    const fs = tickerMap[t].fscore?.ok ? `F${tickerMap[t].fscore.score}/9` : "F·";
    const mom = tickerMap[t].momentum_12_1?.ok ? `${(tickerMap[t].momentum_12_1.value * 100).toFixed(0)}%` : "·";
    const rs = tickerMap[t].rsi_14?.ok ? `RSI${tickerMap[t].rsi_14.value}` : "·";
    const cov = g.coverage != null ? `cov ${Math.round(g.coverage * 100)}%` : "";
    console.log(`   ${icon} ${t.padEnd(8)} ${fs}  mom ${mom.padStart(5)}  ${rs.padEnd(7)} ${cov}`);
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

  console.log(
    `   → signals.json · 🟢${tally.vert} 🟠${tally.ambre} 🔴${tally.rouge} ⚪${tally["indéterminé"]}` +
      `${gaps.length ? ` · ${gaps.length} data_gap(s)` : ""}`
  );
  console.log("SIGNALS_JSON:" + JSON.stringify({ ok: true, tickers: tickers.length, gaps: gaps.length, regime: regime.label, tally }));
}

main().catch((e) => {
  console.error("signals: erreur inattendue ->", e?.message || e);
  console.log("SIGNALS_JSON:" + JSON.stringify({ ok: false, error: String(e?.message || e) }));
  process.exit(0);
});
