#!/usr/bin/env node
// test.js — smoke tests HORS-LIGNE (aucun réseau, aucune clé requise).
// Couvre : les fonctions pures de calc.js + le garde-fou guard sur des fichiers
// temporaires (présent / absent / corrompu / partiel). `node engine/test.js`.

import { mkdtempSync, writeFileSync, existsSync, readdirSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { momentum12_1, piotroski, earningsQuality, regimeScore, gate } from "./lib/calc.js";

let pass = 0, fail = 0;
const ok = (cond, label) => {
  if (cond) { pass++; } else { fail++; console.error(`  ✗ ${label}`); }
};

// ---- calc: momentum -------------------------------------------------------
{
  const monthly = Array.from({ length: 14 }, (_, i) => ({ date: `2025-${String(i + 1).padStart(2, "0")}`, close: 100 + i }));
  const m = momentum12_1(monthly);
  ok(m && m.ok, "momentum: calcule sur 14 points");
  ok(m.value > 0, "momentum: tendance haussière -> value>0");
  ok(momentum12_1([{ close: 1 }]) === null, "momentum: <13 points -> null");
  const surge = Array.from({ length: 14 }, (_, i) => ({ date: `m${i}`, close: i === 0 ? 100 : 100 * Math.pow(2, i) }));
  ok(momentum12_1(surge).overheated === true, "momentum: surchauffe détectée (>+60%)");
}

// ---- calc: piotroski ------------------------------------------------------
{
  const cur = { netIncome: 120, totalAssets: 1000, operatingCashFlow: 150, totalCurrentAssets: 400, totalCurrentLiabilities: 200, longTermDebt: 100, grossProfit: 500, revenue: 900, weightedAverageShsOut: 100 };
  const prev = { netIncome: 80, totalAssets: 1000, operatingCashFlow: 90, totalCurrentAssets: 300, totalCurrentLiabilities: 200, longTermDebt: 150, grossProfit: 420, revenue: 850, weightedAverageShsOut: 100 };
  const f = piotroski(cur, prev);
  ok(f && f.ok, "piotroski: ok sur données complètes");
  ok(f.score >= 7, `piotroski: société saine -> score élevé (got ${f.score})`);
  ok(piotroski(null, prev) === null, "piotroski: données manquantes -> null");
  const fGap = piotroski({ netIncome: 1 }, { netIncome: 1 });
  ok(fGap.missing.length > 3 ? fGap.ok === false : true, "piotroski: trop de trous -> ok=false");
}

// ---- calc: earnings quality ----------------------------------------------
{
  const good = earningsQuality({ netIncome: 100 }, { operatingCashFlow: 140, freeCashFlow: 110 }, { totalAssets: 1000 });
  ok(good.flag === "vert", "earningsQuality: cash > bénéfice -> vert");
  const bad = earningsQuality({ netIncome: 300 }, { operatingCashFlow: 50, freeCashFlow: -20 }, { totalAssets: 1000 });
  ok(bad.flag === "rouge", "earningsQuality: accruals élevés + fcf<0 -> rouge");
  ok(earningsQuality({ netIncome: 1 }, {}, {}) === null, "earningsQuality: données absentes -> null");
}

// ---- calc: regime ---------------------------------------------------------
{
  ok(regimeScore({}).label === "inconnu", "regime: aucune donnée -> inconnu");
  ok(regimeScore({ t10y2y: -0.5 }).label === "STRESS", "regime: courbe inversée -> STRESS");
  ok(regimeScore({ t10y2y: 1.5, cpi_yoy: 2 }).label === "RISK-ON SAIN", "regime: sain -> RISK-ON");
  ok(regimeScore({ t10y2y: 1.5, cpi_yoy: 5 }).label === "SURCHAUFFE", "regime: inflation chaude -> SURCHAUFFE");
}

// ---- calc: gate -----------------------------------------------------------
{
  ok(gate({ fscore: { ok: true, score: 8 }, momentum: { ok: true, sign: "positif" }, eq: { ok: true, flag: "vert" } }).verdict === "vert", "gate: tout bon -> vert");
  ok(gate({ fscore: { ok: true, score: 2 } }).verdict === "rouge", "gate: F-Score faible -> rouge");
  ok(gate({ eq: { ok: true, flag: "ambre" }, momentum: { ok: true, overheated: true } }).verdict === "ambre", "gate: 2 oranges -> ambre");
  ok(gate({ fscore: null, momentum: null, eq: null }).verdict === "indéterminé", "gate: aucun signal -> indéterminé (pas vert)");
}

// ---- guard: réparation sur fichiers temporaires ---------------------------
// On exécute guard.js dans un répertoire jetable en réutilisant son code via import dynamique
// n'est pas trivial (chemins figés) ; on teste donc directement les schémas + io.
{
  const { SCHEMAS, fillMissing } = await import("./lib/schema.js");
  const { readJsonSafe } = await import("./lib/io.js");
  const dir = mkdtempSync(join(tmpdir(), "guard-"));

  // corrompu
  const cor = join(dir, "decisions.json");
  writeFileSync(cor, "{ this is not json");
  ok(readJsonSafe(cor).status === "corrupt", "io: JSON cassé -> status corrupt");

  // partiel (clé manquante) -> fillMissing complète sans détruire
  const partial = { decisions: [{ ticker: "X", confidence: "Haute", realized_pnl_pct: 0.1, hit: true }] };
  const { added } = fillMissing(SCHEMAS.decisions, partial);
  ok("_doc" in partial, "schema: fillMissing ajoute _doc manquant");
  ok(partial.decisions.length === 1, "schema: fillMissing préserve les décisions existantes");

  // calibration: détecte un bucket manquant
  const calib = { buckets: [{ confidence: "Haute" }], global: {} };
  const problems = SCHEMAS.calibration.check(calib);
  ok(problems.some((p) => p.addBucket === "Moyenne"), "schema: bucket Moyenne manquant détecté");

  // ai-fund: positions non-tableau = problème dur
  const broken = SCHEMAS.aiFund.check({ seeded: true, positions: "oops", trades: [] });
  ok(broken.some((p) => p.hard), "schema: positions non-tableau -> problème dur");
}

console.log(`\n${fail === 0 ? "✅" : "❌"} tests: ${pass} passés, ${fail} échoués`);
process.exit(fail === 0 ? 0 : 1);
