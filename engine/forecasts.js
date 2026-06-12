#!/usr/bin/env node
// forecasts.js — entretien DÉTERMINISTE du book de scénarios (method §K).
//
// À jouer après toute modification de memory/fund/forecasts.json :
//   node engine/forecasts.js
//
// Ce qu'il fait (et que la routine n'a donc pas à calculer elle-même) :
//   1. expire les scénarios "candidat"/"validé" dont l'horizon est dépassé
//      (un "joué" n'expire jamais tout seul : une position est ouverte, c'est au
//      vendredi de la résoudre et de la scorer) ;
//   2. recalcule `stats` (resolved, hits, hit_rate, brier) depuis les scénarios résolus ;
//   3. AJUSTE pocket_cap selon le hit_rate prédictif PROUVÉ (§K, paliers mérités) :
//      < 6 résolus → 10 % (apprentissage) ; ensuite hit_rate ≥ 0.6 → 15 %,
//      ≥ 0.7 → 20 % ; < 0.45 → 5 % (la poche rétrécit si l'IA prédit mal).
//
// Sortie : résumé lisible + ligne machine FORECASTS_JSON:{...}. Ne bloque jamais.

import { readJsonSafe, writeJson, fundPath } from "./lib/io.js";
import { forecastStats } from "./lib/calc.js";
import { TODAY } from "./lib/schema.js";

function pocketCap(stats) {
  if (stats.resolved < 6) return 0.1; // échantillon insuffisant : cap d'apprentissage
  if (stats.hit_rate >= 0.7) return 0.2;
  if (stats.hit_rate >= 0.6) return 0.15;
  if (stats.hit_rate < 0.45) return 0.05;
  return 0.1;
}

function main() {
  const path = fundPath("forecasts.json");
  const res = readJsonSafe(path);
  if (res.status !== "ok") {
    console.error(`forecasts: ${path} ${res.status} — joue d'abord node engine/guard.js.`);
    console.log("FORECASTS_JSON:" + JSON.stringify({ ok: false, error: res.status }));
    return;
  }
  const doc = res.data;
  const today = TODAY();
  const expired = [];

  for (const s of doc.scenarios ?? []) {
    if ((s.status === "candidat" || s.status === "validé") && s.horizon && s.horizon < today) {
      s.status = "expiré";
      expired.push(s.id);
    }
  }

  const stats = forecastStats(doc.scenarios);
  doc.stats = {
    resolved: stats.resolved,
    hits: stats.hits,
    hit_rate: stats.hit_rate,
    brier: stats.brier,
    pocket_cap: pocketCap(stats),
  };
  doc.updated = today;
  writeJson(path, doc);

  const open = (doc.scenarios ?? []).filter((s) => s.status === "joué").length;
  const pending = (doc.scenarios ?? []).filter((s) => s.status === "candidat" || s.status === "validé").length;
  console.log(
    `🔮 forecasts — ${doc.scenarios?.length ?? 0} scénario(s) · ${open} joué(s) · ${pending} en attente` +
      (expired.length ? ` · expirés: ${expired.join(", ")}` : "")
  );
  console.log(
    `   prédictif : ${stats.resolved} résolus · hit_rate ${(stats.hit_rate * 100).toFixed(0)} %` +
      (stats.brier != null ? ` · brier ${stats.brier}` : "") +
      ` · pocket_cap ${(doc.stats.pocket_cap * 100).toFixed(0)} % NAV`
  );
  console.log("FORECASTS_JSON:" + JSON.stringify({ ok: true, ...doc.stats, open, pending, expired }));
}

main();
