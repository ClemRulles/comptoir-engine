#!/usr/bin/env node
// test.js — smoke tests HORS-LIGNE (aucun réseau, aucune clé requise).
// Couvre : les fonctions pures de calc.js + le garde-fou guard sur des fichiers
// temporaires (présent / absent / corrompu / partiel). `node engine/test.js`.

import { mkdtempSync, writeFileSync, existsSync, readdirSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  momentum12_1, momentumFromCloses, rsi, relativeVolume, range52w, insiderSignal,
  piotroski, earningsQuality, regimeScore, gate, GATE_WEIGHTS, periodReturn, forecastStats, directionalHit, grokStats,
} from "./lib/calc.js";
import { annualFromFacts, cikForSymbol } from "./lib/edgar.js";

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

// ---- calc: regime zone euro ------------------------------------------------
{
  ok(regimeScore({ t10y2y: 1.5, cpi_yoy: 0.02, eu_hicp_yoy: 0.05 }).label === "SURCHAUFFE",
    "regime: HICP zone euro chaud -> SURCHAUFFE");
  ok(regimeScore({ eu_unrate: 7.5, eu_unrate_prev: 7.0 }).flags.some((f) => /zone euro/.test(f)),
    "regime: chômage EU en hausse -> flag stress");
  ok(regimeScore({ eu_hicp_yoy: 0.02 }).label !== "inconnu", "regime: données EU seules -> pas inconnu");
}

// ---- calc: periodReturn (benchmark / alpha) --------------------------------
{
  const pts = { "2026-01-02": 100, "2026-01-05": 102, "2026-02-02": 110, "2026-03-02": 99 };
  const r = periodReturn(pts, "2026-01-01", "2026-02-15");
  ok(r && r.ok && r.entry_date === "2026-01-02" && r.exit_date === "2026-02-02",
    "periodReturn: bornes = clôtures disponibles dans la fenêtre");
  ok(Math.abs(r.return_pct - 0.1) < 1e-9, `periodReturn: 100→110 = +10% (got ${r?.return_pct})`);
  const open = periodReturn(pts, "2026-01-04", null);
  ok(open && open.exit_date === "2026-03-02", "periodReturn: sans `to` -> dernière clôture");
  ok(periodReturn(pts, "2026-03-01", "2026-03-01") === null, "periodReturn: fenêtre sans 2 points -> null");
  ok(periodReturn({}, "2026-01-01", null) === null, "periodReturn: pas de données -> null");
}

// ---- edgar: extraction companyfacts ----------------------------------------
{
  // Fixture minimale : 2 exercices 10-K (flux avec start/end ~1 an, stocks instantanés),
  // + un trimestre 10-Q et un cumul multi-ans qui doivent être IGNORÉS.
  const usd = (entries) => ({ units: { USD: entries } });
  const fy = (start, end, val, filed = "2026-02-01") => ({ start, end, val, form: "10-K", fy: 2025, fp: "FY", filed });
  const q = (start, end, val) => ({ start, end, val, form: "10-Q", fy: 2025, fp: "Q3", filed: "2025-10-01" });
  const inst = (end, val) => ({ end, val, form: "10-K", fy: 2025, fp: "FY", filed: "2026-02-01" });
  const facts = {
    facts: {
      "us-gaap": {
        NetIncomeLoss: usd([
          fy("2024-01-01", "2024-12-31", 80), fy("2025-01-01", "2025-12-31", 120),
          q("2025-07-01", "2025-09-30", 30),
          { start: "2023-01-01", end: "2025-12-31", val: 260, form: "10-K", fp: "FY", filed: "2026-02-01" }, // cumul 3 ans -> ignoré
        ]),
        Assets: usd([inst("2024-12-31", 1000), inst("2025-12-31", 1100)]),
        NetCashProvidedByUsedInOperatingActivities: usd([fy("2024-01-01", "2024-12-31", 90), fy("2025-01-01", "2025-12-31", 150)]),
        PaymentsToAcquirePropertyPlantAndEquipment: usd([fy("2024-01-01", "2024-12-31", 20), fy("2025-01-01", "2025-12-31", 30)]),
        AssetsCurrent: usd([inst("2024-12-31", 300), inst("2025-12-31", 400)]),
        LiabilitiesCurrent: usd([inst("2024-12-31", 200), inst("2025-12-31", 200)]),
        LongTermDebtNoncurrent: usd([inst("2024-12-31", 150), inst("2025-12-31", 100)]),
        GrossProfit: usd([fy("2024-01-01", "2024-12-31", 420), fy("2025-01-01", "2025-12-31", 500)]),
        Revenues: usd([fy("2024-01-01", "2024-12-31", 850), fy("2025-01-01", "2025-12-31", 900)]),
        WeightedAverageNumberOfSharesOutstandingBasic: { units: { shares: [fy("2024-01-01", "2024-12-31", 100), fy("2025-01-01", "2025-12-31", 100)] } },
      },
    },
  };
  const y = annualFromFacts(facts);
  ok(y && y.cur.netIncome === 120 && y.prev.netIncome === 80, "edgar: 2 exercices extraits (10-Q et cumuls ignorés)");
  ok(y.cur.freeCashFlow === 120, `edgar: FCF = CFO − capex (got ${y?.cur?.freeCashFlow})`);
  const f = piotroski(y.cur, y.prev);
  ok(f && f.ok && f.score >= 7, `edgar→piotroski: société saine -> score élevé (got ${f?.score})`);
  const eq = earningsQuality(y.cur, y.cur, y.cur);
  ok(eq && eq.flag === "vert", "edgar→earningsQuality: cash > bénéfice -> vert");
  ok(annualFromFacts({ facts: {} }) === null, "edgar: pas de us-gaap -> null");
  ok(annualFromFacts({ facts: { "us-gaap": { NetIncomeLoss: usd([fy("2025-01-01", "2025-12-31", 1)]) } } }) === null,
    "edgar: un seul exercice -> null");

  const map = { 0: { cik_str: 320193, ticker: "AAPL", title: "Apple Inc." }, 1: { cik_str: 1018724, ticker: "AMZN", title: "Amazon" } };
  ok(cikForSymbol(map, "amzn") === "0001018724", "edgar: ticker -> CIK zéro-paddé");
  ok(cikForSymbol(map, "ZZZZ") === null, "edgar: ticker inconnu -> null");
}

// ---- calc: forecastStats (book de scénarios §K) ----------------------------
{
  const sc = (prob, happened, status = "résolu") => ({
    id: "x", status, probability: prob,
    resolution: status === "résolu" ? { happened } : undefined,
  });
  ok(forecastStats([]).resolved === 0, "forecasts: vide -> 0 résolu, ok");
  ok(forecastStats(null).resolved === 0, "forecasts: null -> 0 résolu");
  // 2 prédictions justes (p=0.8 arrivé, p=0.6 pas arrivé... 0.6>=0.5 mais happened=false -> miss)
  const st = forecastStats([sc(0.8, true), sc(0.6, false), sc(0.7, true), sc(0.9, false, "joué")]);
  ok(st.resolved === 3, `forecasts: seuls les résolus comptent (got ${st.resolved})`);
  ok(st.hits === 2 && Math.abs(st.hit_rate - 0.667) < 1e-9, `forecasts: hit = (p>=0.5)===happened (got ${st.hits}, ${st.hit_rate})`);
  // brier : (0.8-1)² + (0.6-0)² + (0.7-1)² = 0.04 + 0.36 + 0.09 = 0.49 / 3 ≈ 0.163
  ok(Math.abs(st.brier - 0.163) < 1e-9, `forecasts: brier moyen (got ${st.brier})`);
}

// ---- schema: forecasts.json -------------------------------------------------
{
  const { SCHEMAS } = await import("./lib/schema.js");
  const good = { scenarios: [{ id: "ipo-spacex", status: "validé", probability: 0.65, falsifier: "pas d'IPO avant l'horizon" }], stats: {} };
  ok(SCHEMAS.forecasts.check(good).length === 0, "schema forecasts: scénario valide -> aucun problème");
  const bad = { scenarios: [{ id: "a", status: "validé", probability: 0.3 }, "junk"], stats: null };
  const probs = SCHEMAS.forecasts.check(bad);
  ok(probs.some((p) => /probability/.test(p.msg)), "schema forecasts: probabilité hors borne détectée");
  ok(probs.some((p) => /falsifier/.test(p.msg)), "schema forecasts: falsificateur manquant détecté");
  ok(probs.some((p) => typeof p.dropScenario === "number"), "schema forecasts: entrée non-objet -> drop");
  ok(probs.some((p) => p.resetStats), "schema forecasts: stats invalide -> reset");
  ok(SCHEMAS.forecasts.check({ scenarios: "oops", stats: {} }).some((p) => p.hard), "schema forecasts: scenarios non-tableau -> dur");
}

// ---- calc: directionalHit + grokStats (sentiment Grok §F) ------------------
{
  ok(directionalHit(0.05, "hausse") === true, "directionalHit: +5% sur call hausse -> correct");
  ok(directionalHit(0.01, "hausse") === false, "directionalHit: +1% (sous bande 2%) -> miss (pas de mouvement)");
  ok(directionalHit(-0.05, "baisse") === true, "directionalHit: -5% sur call baisse -> correct");
  ok(directionalHit(0.05, "baisse") === false, "directionalHit: +5% sur call baisse -> miss");
  ok(directionalHit(null, "hausse") === null, "directionalHit: move non numérique -> null");

  const call = (conf, correct, status = "résolu") => ({
    id: "x", ticker: "T", direction: "hausse", status, confidence: conf,
    resolution: status === "résolu" ? { correct } : undefined,
  });
  ok(grokStats([]).resolved === 0, "grokStats: vide -> 0 résolu");
  const st = grokStats([call(0.7, true), call(0.6, false), call(0.8, true), call(0.9, true, "ouvert")]);
  ok(st.resolved === 3, `grokStats: seuls les résolus comptent (got ${st.resolved})`);
  ok(st.hits === 2 && Math.abs(st.hit_rate - 0.667) < 1e-9, `grokStats: hit = correct (got ${st.hits}, ${st.hit_rate})`);
  // brier : (0.7-1)²+(0.6-0)²+(0.8-1)² = 0.09+0.36+0.04 = 0.49 /3 ≈ 0.163
  ok(Math.abs(st.brier - 0.163) < 1e-9, `grokStats: brier moyen (got ${st.brier})`);
}

// ---- schema: grok-calls.json -----------------------------------------------
{
  const { SCHEMAS } = await import("./lib/schema.js");
  const good = { calls: [{ id: "nvda-hot", ticker: "NVDA", direction: "hausse", status: "ouvert", confidence: 0.7 }], stats: {} };
  ok(SCHEMAS.grokCalls.check(good).length === 0, "schema grok: call valide -> aucun problème");
  const bad = { calls: [{ id: "a", ticker: "X", direction: "up", status: "ouvert", confidence: 1.5 }, "junk"], stats: null };
  const probs = SCHEMAS.grokCalls.check(bad);
  ok(probs.some((p) => /direction/.test(p.msg)), "schema grok: direction invalide détectée");
  ok(probs.some((p) => /confidence/.test(p.msg)), "schema grok: confidence hors borne détectée");
  ok(probs.some((p) => typeof p.dropCall === "number"), "schema grok: entrée non-objet -> dropCall");
  ok(probs.some((p) => p.resetGrokStats), "schema grok: stats invalide -> reset");
  ok(SCHEMAS.grokCalls.check({ calls: "oops", stats: {} }).some((p) => p.hard), "schema grok: calls non-tableau -> dur");
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
