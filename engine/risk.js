#!/usr/bin/env node
// risk.js — ALLOCATION & BUDGET DE RISQUE du book IA (method §H/§L/§M).
//
// À jouer après signals.js (lundi, jeudi, vendredi) :
//     node engine/risk.js
//
// Ce qu'il fait (déterministe — la routine ne calcule pas l'exposition à la main) :
//   1. valorise chaque ligne en € (cours signals.json ou Yahoo + change) → NAV ;
//   2. ventile le NAV par POCHE (cœur / socle / tactique / crypto / cash) et compare
//      aux cibles du mandat, infléchies par le régime (calc.sleeveTargets) ;
//   3. contrôle les plafonds : ligne, secteur, thème, crypto majeure/alt, bande de cash ;
//   4. mesure le RISQUE réel sur 1 an à poids constants : volatilité du book, drawdown,
//      volatilité et contribution au risque de chaque ligne (Yahoo, gratuit) ;
//   5. suit le NAV dans le temps (nav_history) → drawdown vs plus haut → garde-fou §H.
// Écrit memory/fund/allocation.json. Ne bloque jamais : data_gaps si une source manque.

import { readJsonSafe, writeJson, fundPath } from "./lib/io.js";
import { yahooRange } from "./lib/sources.js";
import { priceEUR } from "./lib/prices.js";
import { MANDATE, SLEEVES, sleeveTargets, inferSleeve, portfolioRisk, maxDrawdown } from "./lib/calc.js";
import { TODAY } from "./lib/schema.js";

const r = (x, d = 4) => (x == null ? null : Math.round(x * 10 ** d) / 10 ** d);
const MAJORS = new Set(["BTC-EUR", "ETH-EUR", "BTC-USD", "ETH-USD"]);

async function main() {
  const fundRes = readJsonSafe(fundPath("ai-fund.json"));
  if (fundRes.status !== "ok") {
    console.error("risk: ai-fund.json illisible — joue d'abord node engine/guard.js.");
    console.log("ALLOC_JSON:" + JSON.stringify({ ok: false, error: fundRes.status }));
    return;
  }
  const fund = fundRes.data;
  const signals = readJsonSafe(fundPath("signals.json")).data ?? {};
  const prev = readJsonSafe(fundPath("allocation.json")).data ?? {};
  const regime = signals.regime?.label ?? "inconnu";
  const targets = sleeveTargets(regime);
  const gaps = [];
  const today = TODAY();

  // 1. Valorisation en €.
  const lines = [];
  for (const p of fund.positions ?? []) {
    if (!p?.ticker || !(p.quantity > 0)) continue;
    const px = await priceEUR(p.ticker, signals);
    let value, priced = true;
    if (px) value = p.quantity * px.price_eur;
    else {
      priced = false;
      value = p.quantity * (p.avg_cost ?? 0);
      gaps.push(`${p.ticker}: cours indisponible — valorisé au coût (${p.avg_cost} €)`);
    }
    lines.push({
      ticker: p.ticker,
      sleeve: inferSleeve(p),
      desk: p.desk ?? null,
      sector: p.sector ?? null,
      theme: p.theme ?? null,
      confidence: p.confidence ?? null,
      value_eur: r(value, 2),
      price_eur: px?.price_eur ?? null,
      priced,
    });
  }
  const cash = Number(fund.cash) || 0;
  const nav = cash + lines.reduce((a, l) => a + l.value_eur, 0);
  if (!(nav > 0)) {
    console.log("ALLOC_JSON:" + JSON.stringify({ ok: false, error: "NAV nul" }));
    return;
  }
  for (const l of lines) l.weight = r(l.value_eur / nav);

  // 2. Poches vs cibles.
  const sleeves = {};
  for (const s of SLEEVES) {
    const w = lines.filter((l) => l.sleeve === s).reduce((a, l) => a + l.weight, 0);
    const band = MANDATE.sleeves[s];
    sleeves[s] = { weight: r(w), target: targets[s], min: band.min, max: band.max, drift: r(w - targets[s]) };
  }
  const cashPct = r(cash / nav);
  sleeves.cash = { weight: cashPct, target: MANDATE.cash.target, min: MANDATE.cash.floor, max: MANDATE.cash.ceiling, drift: r(cashPct - MANDATE.cash.target) };

  // 3. Plafonds.
  const alerts = [];
  if (cashPct > MANDATE.cash.ceiling)
    alerts.push(`CASH ${Math.round(cashPct * 100)} % > plafond ${MANDATE.cash.ceiling * 100} % : déployer vers les poches sous-pondérées (cadence §H).`);
  if (cashPct < MANDATE.cash.floor)
    alerts.push(`CASH ${Math.round(cashPct * 100)} % < plancher ${MANDATE.cash.floor * 100} % : plus de réserve de tir — financer les prochaines entrées par des ventes.`);
  for (const s of SLEEVES) {
    const v = sleeves[s];
    if (v.weight > v.max) alerts.push(`POCHE ${s} ${Math.round(v.weight * 100)} % > max ${v.max * 100} % : rééquilibrer.`);
    if (v.weight < v.min) alerts.push(`POCHE ${s} ${Math.round(v.weight * 100)} % < min ${v.min * 100} % : sous-exposée.`);
  }
  const C = MANDATE.caps;
  for (const l of lines) {
    if (l.sleeve === "coeur" && l.weight > C.coeur_hold)
      alerts.push(`LIGNE ${l.ticker} ${Math.round(l.weight * 100)} % > ${C.coeur_hold * 100} % : alléger à ${C.coeur_trim_to * 100} % (on laisse courir, pas au-delà).`);
    if (l.sleeve === "socle" && l.weight > C.socle_line) alerts.push(`ETF ${l.ticker} ${Math.round(l.weight * 100)} % > ${C.socle_line * 100} %.`);
    if (l.sleeve === "tactique" && l.weight > C.tactique_line * 1.5)
      alerts.push(`TACTIQUE ${l.ticker} ${Math.round(l.weight * 100)} % ≫ ${C.tactique_line * 100} % : un pari court terme ne doit pas devenir une position cœur par inertie.`);
    if (l.sleeve === "crypto") {
      const cap = MAJORS.has(l.ticker.toUpperCase()) ? C.crypto_major : C.crypto_alt;
      if (l.weight > cap) alerts.push(`CRYPTO ${l.ticker} ${(l.weight * 100).toFixed(1)} % > ${cap * 100} %.`);
    }
  }
  const sum = (key) => {
    const m = {};
    for (const l of lines) if (l[key]) m[l[key]] = r((m[l[key]] ?? 0) + l.weight);
    return m;
  };
  const sectors = sum("sector"), themes = sum("theme");
  for (const [k, w] of Object.entries(sectors)) if (w > C.sector) alerts.push(`SECTEUR ${k} ${Math.round(w * 100)} % > ${C.sector * 100} %.`);
  for (const [k, w] of Object.entries(themes)) if (w > C.theme) alerts.push(`THÈME ${k} ${Math.round(w * 100)} % > ${C.theme * 100} %.`);
  const untagged = lines.filter((l) => l.sleeve !== "socle" && (!l.sector || !l.desk)).map((l) => l.ticker);
  if (untagged.length) gaps.push(`secteur/desk non renseigné : ${untagged.join(", ")} (à compléter vendredi)`);

  // 4. Risque réel sur 1 an.
  const from = new Date(Date.now() - 400 * 86400000).toISOString().slice(0, 10);
  const series = {};
  for (const l of lines) {
    const pts = await yahooRange(l.ticker, from);
    if (pts) series[l.ticker] = pts;
    else gaps.push(`${l.ticker}: historique 1 an indisponible (risque non mesuré)`);
  }
  const weights = Object.fromEntries(lines.map((l) => [l.ticker, l.weight]));
  const risk = portfolioRisk(weights, series);
  if (risk) {
    for (const l of lines) {
      l.vol_1y = risk.vols[l.ticker] ?? null;
      l.risk_contribution = risk.contributions[l.ticker] ?? null;
    }
    if (risk.vol_annual < MANDATE.vol_target.low)
      alerts.push(`RISQUE ${Math.round(risk.vol_annual * 100)} %/an < cible ${MANDATE.vol_target.low * 100} % : le book n'utilise pas son budget de risque (sous-investi ou trop défensif).`);
    if (risk.vol_annual > MANDATE.vol_target.high)
      alerts.push(`RISQUE ${Math.round(risk.vol_annual * 100)} %/an > cible ${MANDATE.vol_target.high * 100} % : réduire d'abord les plus gros contributeurs au risque.`);
    for (const l of lines)
      if (l.risk_contribution != null && l.risk_contribution > 2.5 * l.weight && l.risk_contribution > 0.08)
        alerts.push(`CONCENTRATION DE RISQUE ${l.ticker} : ${Math.round(l.weight * 100)} % du NAV mais ${Math.round(l.risk_contribution * 100)} % du risque.`);
  }

  // 5. NAV dans le temps + garde-fou drawdown.
  const hist = (Array.isArray(prev.nav_history) ? prev.nav_history : []).filter((h) => h.date !== today);
  hist.push({ date: today, nav: r(nav, 2) });
  hist.sort((a, b) => (a.date < b.date ? -1 : 1));
  const navHistory = hist.slice(-400);
  const peak = Math.max(...navHistory.map((h) => h.nav));
  const dd = r(nav / peak - 1);
  const guard = dd <= MANDATE.drawdown_guard;
  if (guard)
    alerts.push(`GARDE-FOU DRAWDOWN ${Math.round(dd * 100)} % ≤ ${MANDATE.drawdown_guard * 100} % : couper d'abord tactique et alts, cash jusqu'au plafond 15 % (§H).`);

  const out = {
    _doc:
      "Allocation & budget de risque du book IA, recalculés par node engine/risk.js (method §H/§L/§M). 'sleeves' = poids réel vs cible du mandat (cible infléchie par le régime ; le cash vise 10 % dans tous les régimes). 'lines' = valeur €, poids, poche, vol 1 an, contribution au risque. 'risk' = volatilité/drawdown du book à poids constants sur 1 an. 'alerts' = ce que le vendredi doit traiter. 'nav_history' alimente le garde-fou drawdown. Ne pas éditer à la main.",
    updated: today,
    regime,
    nav_eur: r(nav, 2),
    cash_eur: r(cash, 2),
    sleeves,
    targets,
    caps: MANDATE.caps,
    risk: risk
      ? { vol_annual: risk.vol_annual, vol_target: MANDATE.vol_target, max_drawdown_1y: risk.max_drawdown_1y, return_1y_constant_weights: risk.return_1y_constant_weights, covered_weight: risk.covered_weight, missing: risk.missing }
      : null,
    drawdown: { current: dd, peak_nav: r(peak, 2), guard_triggered: guard, max_history: maxDrawdown(navHistory.map((h) => h.nav)) },
    sectors,
    themes,
    lines: lines.sort((a, b) => b.weight - a.weight),
    alerts,
    data_gaps: gaps,
    nav_history: navHistory,
  };
  writeJson(fundPath("allocation.json"), out);

  const pct = (x) => `${Math.round(x * 100)}%`;
  console.log(`⚖️  risk — NAV ${Math.round(nav)} € · régime ${regime}`);
  console.log(
    "   poches : " +
      [...SLEEVES, "cash"].map((s) => `${s} ${pct(sleeves[s].weight)} (cible ${pct(sleeves[s].target)})`).join(" · ")
  );
  if (risk) console.log(`   risque : vol ${pct(risk.vol_annual)}/an · drawdown 1 an ${pct(risk.max_drawdown_1y)} · couverture ${pct(risk.covered_weight)}`);
  for (const a of alerts) console.log(`   ⚠ ${a}`);
  if (gaps.length) console.log(`   ${gaps.length} data_gap(s)`);
  console.log("ALLOC_JSON:" + JSON.stringify({ ok: true, nav: r(nav, 2), cash_pct: cashPct, vol: risk?.vol_annual ?? null, drawdown: dd, alerts: alerts.length, gaps: gaps.length }));
}

main().catch((e) => {
  console.error("risk: erreur inattendue ->", e?.message || e);
  console.log("ALLOC_JSON:" + JSON.stringify({ ok: false, error: String(e?.message || e) }));
  process.exit(0);
});
