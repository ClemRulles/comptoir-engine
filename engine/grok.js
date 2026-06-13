#!/usr/bin/env node
// grok.js — score les "calls" de sentiment Grok contre le prix RÉEL et ajuste le
// budget tactique MÉRITÉ de Grok (method §F). Le sentiment ne reçoit jamais de voix
// sur la foi : il la gagne (ou la perd) ici, mesuré.
//
// À jouer après toute modification de memory/fund/grok-calls.json :
//   node engine/grok.js
//
// Ce qu'il fait (déterministe — la routine ne calcule rien à la main) :
//   1. pour chaque call "ouvert"/"joué" dont l'horizon est passé : récupère le
//      mouvement réel (Yahoo, opened → horizon), fixe correct/move_pct/brier,
//      passe le statut à "résolu" ;
//   2. recalcule stats (resolved, hits, hit_rate, brier) ;
//   3. AJUSTE tactical_cap, MÉRITÉ et démarrant à ZÉRO : 0 % tant que < 6 résolus,
//      puis hit_rate ≥ 0.70 → 8 %, ≥ 0.65 → 6 %, ≥ 0.55 → 3 %, < 0.45 → 0 %.
//
// Garde-fous §F (rappelés, appliqués par la routine) : un call ne déclenche un trade
// que tactique, demi-taille, gate non-🔴, stop serré, jamais contre la checklist bulle.
// Ne bloque jamais : data_gap si un prix manque, le call reste "ouvert" pour la prochaine fois.

import { readJsonSafe, writeJson, fundPath } from "./lib/io.js";
import { yahooRange } from "./lib/sources.js";
import { periodReturn, directionalHit, grokStats } from "./lib/calc.js";
import { TODAY } from "./lib/schema.js";

const BAND = 0.02; // ±2 % : bande de bruit sous laquelle un mouvement n'est pas un signal

function tacticalCap(stats) {
  if (stats.resolved < 6) return 0; // Grok n'a encore rien prouvé : pas de budget
  if (stats.hit_rate >= 0.7) return 0.08;
  if (stats.hit_rate >= 0.65) return 0.06;
  if (stats.hit_rate >= 0.55) return 0.03;
  if (stats.hit_rate < 0.45) return 0;
  return 0.03;
}

const r = (x, d = 4) => Math.round(x * 10 ** d) / 10 ** d;

async function resolveCall(c, gaps) {
  // Marge avant `opened` pour avoir une clôture de référence même un week-end/férié.
  const pad = new Date(new Date(c.opened).getTime() - 7 * 86400000).toISOString().slice(0, 10);
  const points = await yahooRange(c.ticker, pad, c.horizon);
  const pr = points ? periodReturn(points, c.opened, c.horizon) : null;
  if (!pr) {
    gaps.push(`${c.id} (${c.ticker}): prix Yahoo indisponible — call laissé ouvert`);
    return false;
  }
  const correct = directionalHit(pr.return_pct, c.direction, BAND);
  if (correct === null) {
    gaps.push(`${c.id}: direction invalide — call laissé ouvert`);
    return false;
  }
  const o = correct ? 1 : 0;
  c.resolution = {
    date: TODAY(),
    move_pct: pr.return_pct,
    correct,
    brier: r((c.confidence - o) ** 2, 3),
    ...(c.resolution?.trade_alpha_pct != null ? { trade_alpha_pct: c.resolution.trade_alpha_pct } : {}),
  };
  c.status = "résolu";
  return true;
}

async function main() {
  const path = fundPath("grok-calls.json");
  const res = readJsonSafe(path);
  if (res.status !== "ok") {
    console.error(`grok: ${path} ${res.status} — joue d'abord node engine/guard.js.`);
    console.log("GROK_JSON:" + JSON.stringify({ ok: false, error: res.status }));
    return;
  }
  const doc = res.data;
  const today = TODAY();
  const gaps = [];
  let resolvedNow = 0;

  for (const c of doc.calls ?? []) {
    if ((c.status === "ouvert" || c.status === "joué") && c.horizon && c.horizon < today) {
      if (await resolveCall(c, gaps)) resolvedNow++;
    }
  }

  const stats = grokStats(doc.calls);
  doc.stats = {
    resolved: stats.resolved,
    hits: stats.hits,
    hit_rate: stats.hit_rate,
    brier: stats.brier,
    tactical_cap: tacticalCap(stats),
  };
  doc.updated = today;
  doc.data_gaps = gaps;
  writeJson(path, doc);

  const open = (doc.calls ?? []).filter((c) => c.status === "ouvert" || c.status === "joué").length;
  console.log(
    `📡 grok — ${doc.calls?.length ?? 0} call(s) · ${open} ouvert(s) · ${resolvedNow} résolu(s) ce run` +
      (gaps.length ? ` · ${gaps.length} data_gap(s)` : "")
  );
  console.log(
    `   sentiment prouvé : ${stats.resolved} résolus · hit_rate ${(stats.hit_rate * 100).toFixed(0)} %` +
      (stats.brier != null ? ` · brier ${stats.brier}` : "") +
      ` · budget tactique Grok ${(doc.stats.tactical_cap * 100).toFixed(0)} % NAV`
  );
  console.log("GROK_JSON:" + JSON.stringify({ ok: true, ...doc.stats, open, resolved_now: resolvedNow, gaps: gaps.length }));
}

main().catch((e) => {
  console.error("grok: erreur inattendue ->", e?.message || e);
  console.log("GROK_JSON:" + JSON.stringify({ ok: false, error: String(e?.message || e) }));
  process.exit(0);
});
