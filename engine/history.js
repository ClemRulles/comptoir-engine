#!/usr/bin/env node
// history.js — TAUX DE BASE tirés du passé des cours (method §I « apprendre du passé »).
//
// Usage :
//   node engine/history.js NVDA ASML.AS BTC-EUR     # tickers ciblés (candidats du deep-dive)
//   node engine/history.js                          # book IA + convictions.json
//   node engine/history.js --years=5 --force         # fenêtre / ignorer le cache du jour
//   node engine/history.js NVDA --dry                # affiche sans écrire le cache (desks)
//
// Pour chaque titre, sur 10 ans (Yahoo, gratuit) : CAGR, volatilité, pire drawdown,
// drawdown actuel vs plus haut, % des fenêtres 12 mois positives, et ANALOGUES — ce qui
// a suivi historiquement quand le titre était aussi loin de son plus haut qu'aujourd'hui.
// C'est un TAUX DE BASE pour le débat §D et le sizing (volatilité), jamais une prédiction.
// Écrit/complète le cache memory/fund/history.json (1 calcul par ticker et par jour).

import { readJsonSafe, writeJson, fundPath } from "./lib/io.js";
import { yahooRange } from "./lib/sources.js";
import { historyStats } from "./lib/calc.js";
import { TODAY } from "./lib/schema.js";

function flag(name, dflt) {
  const hit = process.argv.slice(2).find((a) => a.startsWith(`--${name}`));
  if (!hit) return dflt;
  const [, v] = hit.split("=");
  return v ?? true;
}

async function main() {
  const years = Number(flag("years", 10)) || 10;
  const force = Boolean(flag("force", false));
  let tickers = process.argv.slice(2).filter((a) => !a.startsWith("--"));
  if (!tickers.length) {
    const fund = readJsonSafe(fundPath("ai-fund.json")).data;
    const conv = readJsonSafe(fundPath("convictions.json")).data;
    tickers = [...new Set([...(fund?.positions ?? []).map((p) => p.ticker), ...(conv?.items ?? []).map((i) => i.ticker)])].filter(Boolean);
  }
  const path = fundPath("history.json");
  const doc = readJsonSafe(path).data ?? {};
  doc._doc =
    "Taux de base historiques par titre (node engine/history.js, method §I) : CAGR, volatilité, pire drawdown, drawdown actuel, % de fenêtres 12 mois positives, et 'analog' = rendements à 12 mois observés quand le titre était déjà aussi loin de son plus haut qu'aujourd'hui. Un taux de base pour le débat et le sizing — jamais une prédiction de cours.";
  doc.tickers = doc.tickers && typeof doc.tickers === "object" ? doc.tickers : {};
  const today = TODAY();
  const from = new Date(Date.now() - years * 365.25 * 86400000).toISOString().slice(0, 10);
  const gaps = [];

  for (const t of tickers) {
    if (!force && doc.tickers[t]?.asof === today) {
      console.log(`📜 ${t} : déjà calculé aujourd'hui (cache) — voir memory/fund/history.json`);
      continue;
    }
    const pts = await yahooRange(t, from);
    const st = pts ? historyStats(pts) : null;
    if (!st) {
      gaps.push(`${t}: historique insuffisant ou indisponible`);
      continue;
    }
    doc.tickers[t] = { asof: today, ...st };
    const a = st.analog;
    const pct = (x) => (x == null ? "n/a" : `${x >= 0 ? "+" : ""}${Math.round(x * 100)}%`);
    console.log(
      `📜 ${t} (${st.years} ans) : CAGR ${pct(st.cagr)} · vol ${pct(st.vol_annual)} · pire DD ${pct(st.max_drawdown)} · DD actuel ${pct(st.current_drawdown)} · 12 m positifs ${pct(st.pct_positive_12m)} · analogues n=${a.n} médiane ${pct(a.median_fwd_12m)} [${pct(a.p25_fwd_12m)} ; ${pct(a.p75_fwd_12m)}]`
    );
  }
  doc.updated = today;
  doc.data_gaps = gaps;
  // --dry : affiche sans écrire (desks en parallèle — seul le CIO écrit l'état, §L).
  if (!process.argv.includes("--dry")) writeJson(path, doc);
  if (gaps.length) console.log(`   ${gaps.length} data_gap(s) : ${gaps.join(" · ")}`);
  console.log("HISTORY_JSON:" + JSON.stringify({ ok: true, tickers: tickers.length, gaps: gaps.length }));
}

main().catch((e) => {
  console.error("history: erreur inattendue ->", e?.message || e);
  console.log("HISTORY_JSON:" + JSON.stringify({ ok: false, error: String(e?.message || e) }));
  process.exit(0);
});
