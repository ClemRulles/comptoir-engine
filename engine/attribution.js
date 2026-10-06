#!/usr/bin/env node
// attribution.js — d'où viennent les gains et les ERREURS du book IA (method §I/§L).
//
// À jouer chaque vendredi (PASSE 1), après risk.js :
//     node engine/attribution.js
//
// Ce qu'il mesure (déterministe, prix réels Yahoo) :
//   1. REGRET DES VENTES — chaque vente vs le cours d'aujourd'hui (12 semaines + tout
//      l'historique). Si la majorité des ventes vaut plus aujourd'hui, la règle vend bas.
//   2. PERFORMANCE PAR DESK, PAR POCHE, PAR CONFIANCE — alpha réalisé des décisions
//      clôturées + P&L latent des lignes ouvertes. C'est ce qui dit QUEL desk a un edge.
//   3. MULTIPLICATEUR DE SIZING MÉRITÉ par desk (calc.deskMultiplier) : neutre tant que
//      < 4 décisions clôturées, puis 0,6 → 1,25 selon l'alpha moyen prouvé.
//   4. OPPORTUNITÉS MANQUÉES — les verdicts Surveiller/Éviter de convictions.json vs
//      IWDA depuis leur date : la prudence a-t-elle coûté ?
// Écrit memory/fund/attribution.json. Ne bloque jamais.

import { readJsonSafe, writeJson, fundPath } from "./lib/io.js";
import { yahooRange } from "./lib/sources.js";
import { priceEUR } from "./lib/prices.js";
import { sellRegret, groupPerformance, deskMultiplier, inferSleeve, periodReturn } from "./lib/calc.js";
import { TODAY } from "./lib/schema.js";

const r = (x, d = 4) => (x == null ? null : Math.round(x * 10 ** d) / 10 ** d);
const BENCH = "IWDA.AS";

async function retSince(ticker, from) {
  const pad = new Date(new Date(from).getTime() - 7 * 86400000).toISOString().slice(0, 10);
  const pts = await yahooRange(ticker, pad);
  return pts ? periodReturn(pts, from)?.return_pct ?? null : null;
}

async function main() {
  const fund = readJsonSafe(fundPath("ai-fund.json")).data;
  if (!fund) {
    console.log("ATTRIB_JSON:" + JSON.stringify({ ok: false, error: "ai-fund.json illisible" }));
    return;
  }
  const signals = readJsonSafe(fundPath("signals.json")).data ?? {};
  const decisions = readJsonSafe(fundPath("decisions.json")).data?.decisions ?? [];
  const convictions = readJsonSafe(fundPath("convictions.json")).data?.items ?? [];
  const today = TODAY();
  const gaps = [];

  // Prix € actuels de tout ce qui a été détenu ou vendu.
  const tickers = new Set([
    ...(fund.positions ?? []).map((p) => p.ticker),
    ...(fund.trades ?? []).filter((t) => t.side === "sell").map((t) => t.ticker),
  ]);
  const prices = {};
  for (const t of tickers) {
    if (!t || t === "SEED" || t === "RECLONE") continue;
    const px = await priceEUR(t, signals);
    if (px) prices[t] = px.price_eur;
    else gaps.push(`${t}: cours € indisponible`);
  }

  // 1. Regret des ventes.
  const since = new Date(Date.now() - 84 * 86400000).toISOString().slice(0, 10);
  const recent = sellRegret(fund.trades, prices, { sinceDate: since });
  const allTime = sellRegret(fund.trades, prices);

  // 2. P&L latent des lignes ouvertes (vs prix payé par l'IA, §H).
  const open = [];
  for (const p of fund.positions ?? []) {
    const now = prices[p.ticker];
    let ref = p.entry_price ?? p.avg_cost;
    // Verrou de cohérence : un entry_price très loin de avg_cost trahit souvent une
    // devise mélangée (USD noté comme €). Sauf ligne héritée du clone (avg_cost = coût du
    // GROUPE, légitimement différent). On le signale et on retombe sur avg_cost.
    if (p.entry_price && p.avg_cost && Math.abs(p.entry_price / p.avg_cost - 1) > 0.15 && !/clone/i.test(p.entry_price_source ?? "")) {
      gaps.push(`${p.ticker}: entry_price ${p.entry_price} vs avg_cost ${p.avg_cost} (écart > 15 % — devise ?) → avg_cost retenu`);
      ref = p.avg_cost;
    }
    if (!(now > 0) || !(ref > 0)) continue;
    open.push({
      ticker: p.ticker,
      desk: p.desk ?? "non-attribué",
      sleeve: inferSleeve(p),
      confidence: p.confidence ?? "inconnue",
      unrealized_pct: r(now / ref - 1),
    });
  }
  const view = (key) =>
    groupPerformance(
      decisions,
      open.map((o) => ({ key: o[key], unrealized_pct: o.unrealized_pct })),
      (d) => (key === "sleeve" ? d.sleeve ?? (d.horizon === "tactique" ? "tactique" : "coeur") : d[key])
    );
  const byDesk = view("desk");
  const bySleeve = view("sleeve");
  const byConfidence = view("confidence");
  const multipliers = Object.fromEntries(Object.entries(byDesk).map(([k, v]) => [k, deskMultiplier(v)]));

  // 3. Opportunités manquées (verdicts non-Acheter vs indice).
  const missed = [];
  for (const it of convictions) {
    if (!it?.ticker || !it.date || it.verdict === "Acheter") continue;
    const ret = await retSince(it.ticker, it.date);
    const bench = await retSince(BENCH, it.date);
    if (ret == null || bench == null) {
      gaps.push(`${it.ticker}: rendement depuis ${it.date} indisponible`);
      continue;
    }
    missed.push({ ticker: it.ticker, verdict: it.verdict, date: it.date, return_pct: r(ret), excess_vs_iwda: r(ret - bench) });
  }
  const beat = missed.filter((m) => m.excess_vs_iwda > 0.05).length;

  const out = {
    _doc:
      "Attribution des gains et des erreurs du book IA, recalculée par node engine/attribution.js (method §I/§L). 'sells' = regret des ventes (cours actuel vs prix de vente : share_above > 0,5 = la règle vend bas). 'by_desk'/'by_sleeve'/'by_confidence' = alpha réalisé des décisions clôturées (hors sorties héritées) + P&L latent des lignes ouvertes. 'desk_multipliers' = multiplicateur de sizing MÉRITÉ appliqué aux nouvelles idées de chaque desk (1 tant que < 4 décisions clôturées). 'missed' = verdicts Surveiller/Éviter vs IWDA depuis leur date (la prudence a-t-elle coûté ?). Ne pas éditer à la main.",
    updated: today,
    sells: { last_12_weeks: recent, all_time: { n: allTime.n, above: allTime.above, share_above: allTime.share_above, avg_regret_pct: allTime.avg_regret_pct } },
    by_desk: byDesk,
    by_sleeve: bySleeve,
    by_confidence: byConfidence,
    desk_multipliers: multipliers,
    open_positions: open.sort((a, b) => b.unrealized_pct - a.unrealized_pct),
    missed: { n: missed.length, beat_index_by_5pts: beat, items: missed },
    data_gaps: gaps,
  };
  writeJson(fundPath("attribution.json"), out);

  const pct = (x) => (x == null ? "n/a" : `${x >= 0 ? "+" : ""}${(x * 100).toFixed(1)}%`);
  console.log(`🔍 attribution — ${open.length} lignes ouvertes · ${decisions.length} décisions clôturées`);
  console.log(
    `   ventes 12 sem. : ${recent.n} · ${recent.above} au-dessus du prix de vente (${pct(recent.share_above)}) · regret moyen ${pct(recent.avg_regret_pct)}`
  );
  for (const [k, v] of Object.entries(byDesk))
    console.log(`   desk ${k} : ${v.n_closed} clos (alpha ${pct(v.avg_alpha_closed)}) · ${v.n_open} ouverts (latent ${pct(v.avg_unrealized_open)}) · ×${multipliers[k]}`);
  console.log(`   refus qui ont battu l'indice de > 5 pts : ${beat}/${missed.length}`);
  console.log("ATTRIB_JSON:" + JSON.stringify({ ok: true, sells_share_above: recent.share_above, desks: Object.keys(byDesk).length, missed_beat: beat, gaps: gaps.length }));
}

main().catch((e) => {
  console.error("attribution: erreur inattendue ->", e?.message || e);
  console.log("ATTRIB_JSON:" + JSON.stringify({ ok: false, error: String(e?.message || e) }));
  process.exit(0);
});
