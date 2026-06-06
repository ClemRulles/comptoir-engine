#!/usr/bin/env node
// test.js — smoke tests HORS-LIGNE (aucun réseau, aucune clé requise).
// Couvre : les fonctions pures de calc.js + le garde-fou guard sur des fichiers
// temporaires (présent / absent / corrompu / partiel). `node engine/test.js`.

import { mkdtempSync, writeFileSync, existsSync, readdirSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  momentum12_1, momentumFromCloses, rsi, relativeVolume, range52w, insiderSignal,
  piotroski, earningsQuality, regimeScore, gate, GATE_WEIGHTS,
} from "./lib/calc.js";

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

// ---- calc: signaux de prix (Yahoo) ---------------------------------------
{
  const up = Array.from({ length: 260 }, (_, i) => 100 + i * 0.3); // tendance haussière
  const m = momentumFromCloses(up);
  ok(m && m.ok && m.value > 0, "momentumFromCloses: tendance haussière -> value>0");
  ok(momentumFromCloses([1, 2, 3]) === null, "momentumFromCloses: trop court -> null");

  const r = rsi(up, 14);
  ok(r && r.ok && r.value > 70, "rsi: série monotone haussière -> RSI élevé");
  ok(rsi([1, 2], 14) === null, "rsi: trop court -> null");

  const vols = Array.from({ length: 25 }, (_, i) => (i === 24 ? 3000 : 1000));
  const rv = relativeVolume(vols, 20);
  ok(rv && rv.ok && rv.value > 2, "relativeVolume: pic de volume -> >2");

  ok(range52w(150, 100, 200).value === 0.5, "range52w: milieu -> 0.5");
  ok(range52w(190, 100, 200).zone === "près du haut", "range52w: proche haut");
  ok(range52w(105, 100, 200).zone === "près du bas", "range52w: proche bas");
  ok(range52w(150, 200, 100) === null, "range52w: bornes incohérentes -> null");

  ok(insiderSignal({ ok: true, ratio: 0.8, buys: 8, sells: 2 }).zone === "achats nets", "insiderSignal: achats nets");
  ok(insiderSignal(null) === null, "insiderSignal: pas de données -> null");
}

// ---- calc: regime ---------------------------------------------------------
{
  ok(regimeScore({}).label === "inconnu", "regime: aucune donnée -> inconnu");
  ok(regimeScore({ t10y2y: -0.5 }).label === "STRESS", "regime: courbe inversée -> STRESS");
  ok(regimeScore({ t10y2y: 1.5, cpi_yoy: 0.02 }).label === "RISK-ON SAIN", "regime: sain -> RISK-ON");
  ok(regimeScore({ t10y2y: 1.5, cpi_yoy: 0.05 }).label === "SURCHAUFFE", "regime: inflation chaude -> SURCHAUFFE");
  ok(regimeScore({ vix: 40 }).label === "STRESS", "regime: VIX panique -> STRESS");
  ok(regimeScore({ vix: 32, hy_spread: 7 }).fear_greed === "peur", "regime: VIX+HY élevés -> peur");
  ok(regimeScore({ vix: 12, hy_spread: 3 }).fear_greed === "avidité", "regime: VIX bas -> avidité");
}

// ---- calc: gate composite pondéré ----------------------------------------
{
  const totalW = Object.values(GATE_WEIGHTS).reduce((a, b) => a + b, 0);
  ok(Math.abs(totalW - 1) < 1e-9, "gate: somme des poids = 1.0");

  const allGood = gate({
    fscore: { ok: true, score: 8 }, eq: { ok: true, flag: "vert" },
    momentum: { ok: true, value: 0.25, overheated: false }, rsi: { ok: true, value: 62 },
    range52w: { ok: true, value: 0.7 }, insider: { ok: true, ratio: 0.8 },
  });
  ok(allGood.verdict === "vert", `gate: signaux bons -> vert (composite ${allGood.composite})`);

  ok(gate({ fscore: { ok: true, score: 2 } }).verdict === "rouge", "gate: F-Score critique -> rouge (drapeau dur)");
  ok(gate({ eq: { ok: true, flag: "rouge" }, momentum: { ok: true, value: 0.3 } }).verdict === "rouge", "gate: earnings rouges -> rouge (drapeau dur)");

  // Que des signaux de prix (aucune clé) -> doit conclure, pas indéterminé.
  const technicalsOnly = gate({
    momentum: { ok: true, value: 0.2, overheated: false }, rsi: { ok: true, value: 58 },
    range52w: { ok: true, value: 0.6 }, insider: { ok: true, ratio: 0.65 },
  });
  ok(technicalsOnly.verdict !== "indéterminé", `gate: signaux de prix seuls -> conclut (${technicalsOnly.verdict})`);

  ok(gate({}).verdict === "indéterminé", "gate: aucun signal -> indéterminé (traité 🟠 par §H)");
  const weak = gate({ momentum: { ok: true, value: -0.4, overheated: false }, rsi: { ok: true, value: 25 }, range52w: { ok: true, value: 0.05 } });
  ok(weak.verdict === "rouge", `gate: prix très faibles -> rouge (composite ${weak.composite})`);
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
