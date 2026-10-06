// calc.js — fonctions PURES de scoring (pas d'I/O, pas de réseau). Testables seules.
// Chaque fonction renvoie un objet { ...valeurs, ok } ou null si données insuffisantes,
// pour que l'appelant note proprement un data_gap plutôt que de fabriquer un chiffre.

// ===========================================================================
// SIGNAUX DE PRIX (depuis Yahoo : closes quotidiens + volumes). Sans clé.
// ===========================================================================

// Nettoie une série de closes (retire les null) en gardant l'ordre chronologique.
function cleanCloses(closes) {
  return Array.isArray(closes) ? closes.filter((c) => Number.isFinite(c)) : [];
}

// --- Momentum 12-1 depuis closes quotidiens (method §A — PLAFONNÉ) ----------
// Rendement de t-252 (~12 mois) à t-21 (~1 mois) : on exclut le dernier mois pour
// éviter le bruit de reversal court terme. Renvoie {value, sign, overheated, ok}.
export function momentumFromCloses(closes) {
  const c = cleanCloses(closes);
  if (c.length < 200) return null; // pas assez d'historique annuel
  const n = c.length;
  const c1 = c[Math.max(0, n - 1 - 21)]; // ~t-1 mois
  const c12 = c[Math.max(0, n - 1 - 252)]; // ~t-12 mois (ou plus ancien dispo)
  if (!(c12 > 0)) return null;
  const value = c1 / c12 - 1;
  const overheated = value > 0.6;
  return {
    value: round(value, 4),
    sign: value > 0.05 ? "positif" : value < -0.05 ? "négatif" : "neutre",
    overheated,
    ok: true,
  };
}

// Compat historique : momentum 12-1 depuis closes MENSUELS [{date, close}].
export function momentum12_1(monthly) {
  if (!Array.isArray(monthly) || monthly.length < 13) return null;
  const c1 = monthly[monthly.length - 2].close;
  const c12 = monthly[monthly.length - 13].close;
  if (!(c12 > 0)) return null;
  const value = c1 / c12 - 1;
  return {
    value: round(value, 4),
    sign: value > 0.05 ? "positif" : value < -0.05 ? "négatif" : "neutre",
    overheated: value > 0.6,
    asof: monthly[monthly.length - 2].date,
    ok: true,
  };
}

// --- RSI 14 jours (Wilder) -------------------------------------------------
// <30 survendu (souvent downtrend) · 30-45 faible · 45-60 sain · 60-70 fort ·
// >70 suracheté (risque de repli). Renvoie {value, zone, ok}.
export function rsi(closes, period = 14) {
  const c = cleanCloses(closes);
  if (c.length < period + 1) return null;
  let gain = 0, loss = 0;
  // Première moyenne sur `period`.
  for (let i = c.length - period; i < c.length; i++) {
    const d = c[i] - c[i - 1];
    if (d >= 0) gain += d; else loss -= d;
  }
  let avgGain = gain / period, avgLoss = loss / period;
  const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  const value = avgLoss === 0 ? 100 : round(100 - 100 / (1 + rs), 1);
  const zone =
    value >= 70 ? "suracheté" : value >= 60 ? "fort" : value >= 45 ? "sain" : value >= 30 ? "faible" : "survendu";
  return { value, zone, ok: true };
}

// --- Volume relatif 20 jours ------------------------------------------------
// dernier volume / moyenne des 20 précédents. >1.3 = intérêt inhabituel. {value, ok}.
export function relativeVolume(volumes, window = 20) {
  const v = (Array.isArray(volumes) ? volumes : []).filter((x) => Number.isFinite(x) && x > 0);
  if (v.length < window + 1) return null;
  const last = v[v.length - 1];
  const avg = v.slice(v.length - 1 - window, v.length - 1).reduce((a, b) => a + b, 0) / window;
  if (!(avg > 0)) return null;
  return { value: round(last / avg, 2), ok: true };
}

// --- Position dans le range 52 semaines ------------------------------------
// p = (cours − bas52) / (haut52 − bas52) ∈ [0,1]. Proche de 1 = près des plus hauts ;
// proche de 0 = près des plus bas (thèse de prix cassée). {value, zone, ok}.
export function range52w(price, low52, high52) {
  price = num(price); low52 = num(low52); high52 = num(high52);
  if (price == null || low52 == null || high52 == null || high52 <= low52) return null;
  const p = round((price - low52) / (high52 - low52), 3);
  const zone = p >= 0.85 ? "près du haut" : p >= 0.5 ? "moitié haute" : p >= 0.25 ? "moitié basse" : "près du bas";
  return { value: p, zone, ok: true };
}

// --- Ratio d'initiés (OpenInsider) -----------------------------------------
// ratio = achats / (achats + ventes) sur 90j. >0.6 net acheteur (signal positif),
// <0.4 net vendeur. {ratio, buys, sells, zone, ok}.
export function insiderSignal(oi) {
  if (!oi || !oi.ok) return null;
  const r = oi.ratio;
  const zone = r >= 0.6 ? "achats nets" : r >= 0.4 ? "équilibré" : "ventes nettes";
  return { ratio: r, buys: oi.buys, sells: oi.sells, zone, ok: true };
}

// ===========================================================================
// SIGNAUX FONDAMENTAUX (FMP) — F-Score & qualité des earnings (inchangés)
// ===========================================================================

export function piotroski(cur, prev) {
  if (!cur || !prev) return null;
  const tests = {};
  const missing = [];
  const T = (name, cond) => {
    if (cond === null || cond === undefined || Number.isNaN(cond)) { tests[name] = 0; missing.push(name); }
    else tests[name] = cond ? 1 : 0;
  };
  const roa = (y) => safeDiv(y.netIncome, y.totalAssets);
  const cfo = (y) => num(y.operatingCashFlow ?? y.netCashProvidedByOperatingActivities);
  const curRatio = (y) => safeDiv(y.totalCurrentAssets, y.totalCurrentLiabilities);
  const ltdRatio = (y) => safeDiv(y.longTermDebt, y.totalAssets);
  const grossMargin = (y) => safeDiv(y.grossProfit, y.revenue);
  const assetTurn = (y) => safeDiv(y.revenue, y.totalAssets);
  const shares = (y) => num(y.weightedAverageShsOut ?? y.weightedAverageShsOutDil);
  T("roa_positif", gt(roa(cur), 0));
  T("cfo_positif", gt(cfo(cur), 0));
  T("roa_en_hausse", cmp(roa(cur), roa(prev)));
  T("accruals_sains", gt(cfo(cur), num(cur.netIncome)));
  T("dette_lt_en_baisse", cmp(ltdRatio(prev), ltdRatio(cur)));
  T("liquidite_en_hausse", cmp(curRatio(cur), curRatio(prev)));
  T("pas_de_dilution", lte(shares(cur), shares(prev)));
  T("marge_brute_en_hausse", cmp(grossMargin(cur), grossMargin(prev)));
  T("rotation_actifs_en_hausse", cmp(assetTurn(cur), assetTurn(prev)));
  const score = Object.values(tests).reduce((a, b) => a + b, 0);
  return { score, max: 9, band: score >= 7 ? "solide" : score >= 4 ? "moyen" : "faible", tests, missing, ok: missing.length <= 3 };
}

export function earningsQuality(income, cashflow, balance) {
  const ni = num(income?.netIncome);
  const cfo = num(cashflow?.operatingCashFlow ?? cashflow?.netCashProvidedByOperatingActivities);
  const fcf = num(cashflow?.freeCashFlow);
  const assets = num(balance?.totalAssets);
  if (ni == null || cfo == null || !(assets > 0)) return null;
  const accruals_ratio = round((ni - cfo) / assets, 4);
  const fcf_to_ni = ni !== 0 && fcf != null ? round(fcf / ni, 3) : null;
  let flag = "vert";
  if (accruals_ratio > 0.1 || (fcf_to_ni != null && fcf_to_ni < 0.5)) flag = "ambre";
  if (accruals_ratio > 0.2 || (fcf_to_ni != null && fcf_to_ni < 0)) flag = "rouge";
  return { accruals_ratio, fcf_to_ni, flag, ok: true };
}

// ===========================================================================
// RÉGIME MACRO (FRED) — courbe, chômage, inflation + proxy peur/avidité (VIX, HY)
// ===========================================================================
export function regimeScore(inputs) {
  const flags = [];
  let stress = 0, heat = 0;

  if (inputs.t10y2y != null) {
    if (inputs.t10y2y < 0) { stress += 2; flags.push("courbe des taux inversée (10Y-2Y<0)"); }
    else if (inputs.t10y2y < 0.2) { stress += 1; flags.push("courbe des taux plate"); }
  }
  if (inputs.unrate != null && inputs.unrate_prev != null && inputs.unrate - inputs.unrate_prev > 0.3) {
    stress += 1; flags.push("chômage en hausse nette");
  }
  if (inputs.cpi_yoy != null && inputs.cpi_yoy > 0.04) { heat += 1; flags.push("inflation élevée (>4%)"); }
  // Zone euro (le book est majoritairement européen — le régime ne peut pas être 100% US).
  if (inputs.eu_hicp_yoy != null && inputs.eu_hicp_yoy > 0.04) { heat += 1; flags.push("inflation zone euro élevée (HICP >4%)"); }
  if (inputs.eu_unrate != null && inputs.eu_unrate_prev != null && inputs.eu_unrate - inputs.eu_unrate_prev > 0.3) {
    stress += 1; flags.push("chômage zone euro en hausse nette");
  }
  if (inputs.vix != null) {
    if (inputs.vix > 35) { stress += 2; flags.push(`VIX très élevé (${inputs.vix}) — panique`); }
    else if (inputs.vix > 28) { stress += 1; flags.push(`VIX élevé (${inputs.vix}) — peur`); }
  }
  if (inputs.hy_spread != null) {
    if (inputs.hy_spread > 8) { stress += 2; flags.push(`spreads HY très tendus (${inputs.hy_spread}%)`); }
    else if (inputs.hy_spread > 6) { stress += 1; flags.push(`spreads HY tendus (${inputs.hy_spread}%)`); }
  }

  // Proxy peur/avidité (façon Fear & Greed open-source) depuis VIX + spreads HY.
  let fear_greed = null;
  if (inputs.vix != null || inputs.hy_spread != null) {
    const v = inputs.vix, h = inputs.hy_spread;
    if ((v != null && v > 28) || (h != null && h > 6)) fear_greed = "peur";
    else if ((v != null && v < 15) && (h == null || h < 3.5)) fear_greed = "avidité";
    else fear_greed = "neutre";
  }

  const known = ["t10y2y", "unrate", "cpi_yoy", "vix", "hy_spread", "eu_hicp_yoy", "eu_unrate"].filter((k) => inputs[k] != null).length;
  // Mandat 2026-10 : le cash NE dépend PLUS du régime (cible 10 %, bande 5-15 %, §H).
  // Le régime module la COMPOSITION des poches (crypto, tactique), pas l'exposition.
  const cash = { cash_floor: MANDATE.cash.floor, cash_target: MANDATE.cash.target, cash_ceiling: MANDATE.cash.ceiling };
  if (known === 0) {
    return { label: "inconnu", score: null, ...cash, sleeves: sleeveTargets("NORMAL"), fear_greed: null, flags: ["aucune donnée FRED"], ok: false };
  }

  let label;
  if (stress >= 2) label = "STRESS";
  else if (heat >= 1 && stress === 0) label = "SURCHAUFFE";
  else if (stress === 1) label = "NORMAL";
  else label = "RISK-ON SAIN";

  return { label, score: { stress, heat }, ...cash, sleeves: sleeveTargets(label), fear_greed, flags, ok: true };
}

// ===========================================================================
// GATE — score composite PONDÉRÉ. Chaque signal disponible donne une sous-note
// dans [-1,+1] (baissier→haussier), multipliée par son poids. Le composite est la
// moyenne pondérée des signaux PRÉSENTS (un signal absent ne compte pas, ne pénalise
// pas). Deux drapeaux durs forcent le rouge : F-Score ≤3 et earnings rouges.
// Poids documentés dans skills/quant-signals.md (doivent y rester synchronisés).
// ===========================================================================
export const GATE_WEIGHTS = {
  fscore: 0.28,
  earnings_quality: 0.15,
  momentum_12_1: 0.15,
  rsi_14: 0.10,
  range_52w: 0.10,
  insider_90d: 0.10,
  rel_volume: 0.04,
  eps_surprise: 0.04,
  revenue_growth: 0.04,
};

function scoreFscore(f) { const s = f.score; return s >= 7 ? 1 : s === 6 ? 0.5 : s === 5 ? 0 : s === 4 ? -0.3 : -1; }
function scoreEq(eq) { return eq.flag === "vert" ? 1 : eq.flag === "ambre" ? -0.3 : -1; }
function scoreMom(m) { if (m.overheated) return -0.3; return clamp(m.value / 0.3, -1, 1); }
function scoreRsi(r) { const v = r.value; return v >= 70 ? -0.3 : v >= 60 ? 0.4 : v >= 45 ? 0.2 : v >= 30 ? -0.2 : -0.5; }
function scoreRange(g) { const p = g.value; return p >= 0.9 ? 0.3 : p >= 0.5 ? 0.5 : p >= 0.25 ? 0 : p >= 0.1 ? -0.4 : -0.7; }
function scoreInsider(i) { const r = i.ratio; return r >= 0.7 ? 1 : r >= 0.5 ? 0.4 : r >= 0.3 ? -0.2 : -0.6; }
function scoreRelVol(rv) { return rv.value >= 1.3 ? 0.2 : 0; } // témoin d'intérêt, faible poids
function scoreEps(e) { const s = e.surprise_pct; return s > 5 ? 1 : s > 0 ? 0.4 : s > -5 ? -0.4 : -1; }
function scoreRev(r) { const g = r.yoy; return g > 0.15 ? 1 : g > 0.05 ? 0.5 : g > 0 ? 0 : -0.6; }

export function gate(sig) {
  const contributions = [];
  const reasons = [];
  let sumW = 0, sumWS = 0;
  let hardRed = false;

  const add = (key, obj, scorer, label) => {
    if (!obj || !obj.ok) return;
    const s = clamp(scorer(obj), -1, 1);
    const w = GATE_WEIGHTS[key];
    sumW += w; sumWS += s * w;
    contributions.push({ key, sub_score: round(s, 2), weight: w });
    if (s <= -0.5) reasons.push(`${label} défavorable`);
    else if (s >= 0.5) reasons.push(`${label} favorable`);
  };

  add("fscore", sig.fscore, scoreFscore, "F-Score");
  add("earnings_quality", sig.eq, scoreEq, "qualité earnings");
  add("momentum_12_1", sig.momentum, scoreMom, "momentum 12-1");
  add("rsi_14", sig.rsi, scoreRsi, "RSI 14j");
  add("range_52w", sig.range52w, scoreRange, "range 52 sem.");
  add("insider_90d", sig.insider, scoreInsider, "initiés 90j");
  add("rel_volume", sig.relVolume, scoreRelVol, "volume relatif");
  add("eps_surprise", sig.eps, scoreEps, "EPS surprise");
  add("revenue_growth", sig.revenue, scoreRev, "croissance CA");

  // Drapeaux durs (priment sur le composite).
  if (sig.fscore?.ok && sig.fscore.score <= 3) { hardRed = true; reasons.push(`F-Score critique (${sig.fscore.score}/9)`); }
  if (sig.eq?.ok && sig.eq.flag === "rouge") { hardRed = true; reasons.push("earnings rouges (accruals élevés)"); }
  if (sig.momentum?.ok && sig.momentum.overheated) reasons.push("momentum en surchauffe (>+60%/an)");

  // Pas assez de signal pour conclure -> droit au blanc.
  if (sumW < 0.15) {
    return {
      verdict: "indéterminé",
      composite: null,
      coverage: round(sumW, 2),
      reasons: ["signaux insuffisants (voir data_gaps)"],
      contributions,
      note: "garde-fou INDÉTERMINÉ : traité comme 🟠 par §H (prudence) — décide sur §A-§D et note l'absence de signal.",
    };
  }

  const composite = round(sumWS / sumW, 3);
  let verdict;
  if (hardRed) verdict = "rouge";
  else if (composite >= 0.2) verdict = "vert";
  else if (composite <= -0.2) verdict = "rouge";
  else verdict = "ambre";

  return {
    verdict,
    composite,
    coverage: round(sumW, 2), // part du poids total réellement couverte par des données
    reasons,
    contributions,
    note:
      verdict === "rouge"
        ? "garde-fou ROUGE : position INTERDITE / sortie forcée (§H). Pas de débat — drapeau dur ou composite ≤ −0.2."
        : verdict === "ambre"
        ? "garde-fou ORANGE : plafond d'ENTRÉE 5 % du NAV (§H) ; une ligne cœur détenue n'est pas retaillée pour autant."
        : "garde-fou VERT : sizing normal selon conviction × calibration × desk × volatilité (§H).",
  };
}

// ===========================================================================
// RENDEMENT SUR PÉRIODE — pour le benchmark des décisions clôturées (alpha §I).
// points = { "YYYY-MM-DD": close }. Entrée = 1re clôture ≥ from ; sortie = dernière
// clôture ≤ to. Renvoie { entry_date, exit_date, return_pct, ok } ou null.
// ===========================================================================
export function periodReturn(points, from, to) {
  if (!points || typeof points !== "object" || !from) return null;
  const dates = Object.keys(points).filter((d) => Number.isFinite(points[d]) && points[d] > 0).sort();
  if (dates.length < 2) return null;
  const end = to || dates[dates.length - 1];
  const entryDate = dates.find((d) => d >= from);
  const exitDate = [...dates].reverse().find((d) => d <= end);
  if (!entryDate || !exitDate || exitDate <= entryDate) return null;
  const a = points[entryDate], b = points[exitDate];
  if (!(a > 0)) return null;
  return { entry_date: entryDate, exit_date: exitDate, return_pct: round(b / a - 1, 4), ok: true };
}

// ===========================================================================
// BOOK DE SCÉNARIOS (method §K) — stats prédictives depuis forecasts.json.
// hit = (probability >= 0.5) === happened ; brier = moyenne((p − o)²), 0 = parfait,
// 0.25 = pile ou face. Pur : l'appelant (engine/forecasts.js) gère l'I/O.
// ===========================================================================
export function forecastStats(scenarios) {
  const resolved = (Array.isArray(scenarios) ? scenarios : []).filter(
    (s) =>
      s && s.status === "résolu" &&
      typeof s.probability === "number" &&
      typeof s.resolution?.happened === "boolean"
  );
  if (!resolved.length) return { resolved: 0, hits: 0, hit_rate: 0, brier: null, ok: true };
  let hits = 0, brierSum = 0;
  for (const s of resolved) {
    const o = s.resolution.happened ? 1 : 0;
    if ((s.probability >= 0.5) === s.resolution.happened) hits++;
    brierSum += (s.probability - o) ** 2;
  }
  return {
    resolved: resolved.length,
    hits,
    hit_rate: round(hits / resolved.length, 3),
    brier: round(brierSum / resolved.length, 3),
    ok: true,
  };
}

// ===========================================================================
// SENTIMENT GROK (method §F) — un "call" directionnel est correct si le prix a
// suivi la direction au-delà d'une bande de bruit (±2 % par défaut). Exigeant à
// dessein : le sentiment prétend prédire un MOUVEMENT, pas de la stagnation.
// ===========================================================================
export function directionalHit(move_pct, direction, band = 0.02) {
  if (typeof move_pct !== "number" || !Number.isFinite(move_pct)) return null;
  if (direction === "hausse") return move_pct > band;
  if (direction === "baisse") return move_pct < -band;
  return null;
}

// Stats prédictives de Grok depuis grok-calls.json. hit = call résolu correct ;
// brier = moyenne((confidence − correct)²). Pur ; l'I/O est dans engine/grok.js.
export function grokStats(calls) {
  const resolved = (Array.isArray(calls) ? calls : []).filter(
    (c) =>
      c && c.status === "résolu" &&
      typeof c.confidence === "number" &&
      typeof c.resolution?.correct === "boolean"
  );
  if (!resolved.length) return { resolved: 0, hits: 0, hit_rate: 0, brier: null, ok: true };
  let hits = 0, brierSum = 0;
  for (const c of resolved) {
    const o = c.resolution.correct ? 1 : 0;
    if (c.resolution.correct) hits++;
    brierSum += (c.confidence - o) ** 2;
  }
  return {
    resolved: resolved.length,
    hits,
    hit_rate: round(hits / resolved.length, 3),
    brier: round(brierSum / resolved.length, 3),
    ok: true,
  };
}

// ===========================================================================
// MANDAT D'ALLOCATION (method §H/§L/§M) — la politique du book, en chiffres.
// Objectif : maximiser la richesse à long terme NET de frais, avec un risque
// équilibré. Le cash est une réserve de tir (10 %), pas un abri.
// ===========================================================================
export const SLEEVES = ["coeur", "socle", "tactique", "crypto"];

export const MANDATE = {
  cash: { floor: 0.05, target: 0.1, ceiling: 0.15 },
  sleeves: {
    coeur: { target: 0.6, min: 0.45, max: 0.75 }, // convictions single-stock 3-5 ans
    socle: { target: 0.12, min: 0, max: 0.2 }, // ETF indiciels/thématiques : bêta de complément
    tactique: { target: 0.1, min: 0, max: 0.15 }, // catalyseurs datés, §K, Grok, momentum
    crypto: { target: 0.08, min: 0, max: 0.1 }, // BTC/ETH d'abord, alts plafonnées
  },
  caps: {
    coeur_entry: 0.1, // taille max à l'ENTRÉE d'une ligne cœur (Haute)
    coeur_hold: 0.18, // on laisse courir un gagnant jusque-là, puis retour à 15 %
    coeur_trim_to: 0.15,
    socle_line: 0.2,
    tactique_line: 0.04,
    crypto_major: 0.06, // BTC, ETH
    crypto_alt: 0.015, // toute autre crypto (top 20 capi uniquement)
    sector: 0.3,
    theme: 0.35,
  },
  vol_target: { low: 0.13, high: 0.2 }, // volatilité annualisée visée du book
  drawdown_guard: -0.2, // drawdown du NAV vs son plus haut déclenchant la réduction de risque
};

// Inflexion des poches selon le régime : le CASH NE BOUGE PAS ; seules crypto et
// tactique respirent. Le poids libéré va au socle indiciel (on garde le bêta sans
// forcer de stock-picking), puis au cœur si le socle est plein.
const REGIME_TILT = {
  "RISK-ON SAIN": { crypto: 0.08, tactique: 0.1 },
  NORMAL: { crypto: 0.06, tactique: 0.1 },
  SURCHAUFFE: { crypto: 0.05, tactique: 0.08 },
  STRESS: { crypto: 0.03, tactique: 0.05 },
};

export function sleeveTargets(label) {
  const t = REGIME_TILT[label] ?? REGIME_TILT.NORMAL;
  const S = MANDATE.sleeves;
  const out = { coeur: S.coeur.target, socle: S.socle.target, tactique: t.tactique, crypto: t.crypto };
  const freed = S.crypto.target - t.crypto + (S.tactique.target - t.tactique);
  const toSocle = Math.min(freed, S.socle.max - out.socle);
  out.socle += toSocle;
  out.coeur += freed - toSocle;
  for (const k of Object.keys(out)) out[k] = round(out[k], 4);
  out.cash = MANDATE.cash.target;
  return out;
}

const ETF_TICKERS = new Set([
  "IWDA", "IWDA.AS", "EUNL", "EUNL.DE", "VWCE", "VWCE.DE", "VWRL", "CSPX", "SXR8", "SPY", "VOO", "QQQ",
  "EIMI", "EIMI.L", "CI2", "CI2.MI", "MEUD", "PAEEM", "IS3N", "XDWD", "SMH", "URA", "ICLN",
]);

export function isCryptoTicker(t) {
  return /^[A-Z0-9]{2,10}-(EUR|USD|USDT)$/i.test(String(t || ""));
}

// Poche d'une position : champ explicite d'abord, sinon inférence prudente.
export function inferSleeve(p) {
  if (p && SLEEVES.includes(p.sleeve)) return p.sleeve;
  const t = String(p?.ticker || "").toUpperCase();
  if (p?.asset_type === "crypto" || isCryptoTicker(t)) return "crypto";
  if (p?.asset_type === "etf" || ETF_TICKERS.has(t) || p?.thesis_id === "residu-indiciel") return "socle";
  if (p?.horizon === "tactique") return "tactique";
  return "coeur";
}

// Taille ajustée de la volatilité : une ligne 2× plus volatile que la référence
// (30 %/an, une action de qualité typique) prend ~moitié de la taille de conviction.
export function volAdjust(baseSize, vol, ref = 0.3) {
  if (!(baseSize > 0)) return 0;
  if (!(vol > 0)) return round(baseSize, 4);
  return round(baseSize * clamp(ref / vol, 0.5, 1.25), 4);
}

// ===========================================================================
// RISQUE — séries de prix { "YYYY-MM-DD": close } → volatilité, drawdown,
// risque du portefeuille et contributions. Pur, testable hors-ligne.
// ===========================================================================
function sortedPoints(points) {
  if (!points || typeof points !== "object") return [];
  return Object.keys(points)
    .filter((d) => Number.isFinite(points[d]) && points[d] > 0)
    .sort()
    .map((d) => [d, points[d]]);
}

function std(xs) {
  if (xs.length < 2) return null;
  const m = xs.reduce((a, b) => a + b, 0) / xs.length;
  return Math.sqrt(xs.reduce((a, b) => a + (b - m) ** 2, 0) / (xs.length - 1));
}

const DAY = 86400000;
function yearsBetween(a, b) {
  return (new Date(b).getTime() - new Date(a).getTime()) / (365.25 * DAY);
}

// Volatilité annualisée ; la fréquence est déduite des dates (gère crypto 7j/7).
export function annualVol(points) {
  const s = sortedPoints(points);
  if (s.length < 31) return null;
  const rets = [];
  for (let i = 1; i < s.length; i++) rets.push(s[i][1] / s[i - 1][1] - 1);
  const yrs = yearsBetween(s[0][0], s[s.length - 1][0]);
  if (!(yrs > 0)) return null;
  const sd = std(rets);
  return sd == null ? null : round(sd * Math.sqrt(rets.length / yrs), 4);
}

// Drawdown max d'une suite de valeurs (closes ou NAV), négatif ou 0.
export function maxDrawdown(values) {
  let peak = -Infinity, mdd = 0;
  for (const v of values) {
    if (!Number.isFinite(v)) continue;
    if (v > peak) peak = v;
    if (peak > 0) mdd = Math.min(mdd, v / peak - 1);
  }
  return round(mdd, 4);
}

function isWeekday(d) {
  const w = new Date(d + "T12:00:00Z").getUTCDay();
  return w !== 0 && w !== 6;
}

// Risque du portefeuille à poids CONSTANTS (les poids du jour rejoués sur l'année
// écoulée). weights = { ticker: part du NAV } (le cash est le reste, risque nul).
// Les week-ends crypto sont repliés sur le lundi (séries alignées sur jours ouvrés).
// Renvoie vol annualisée, drawdown max, vol par ligne et contribution au risque
// (fractions qui somment à 1) — la ligne qui pèse 5 % du NAV mais 25 % du risque se voit.
export function portfolioRisk(weights, series) {
  const all = Object.keys(weights || {}).filter((t) => weights[t] > 0);
  const tickers = all.filter((t) => sortedPoints(series?.[t]).length > 30);
  const missing = all.filter((t) => !tickers.includes(t));
  if (!tickers.length) return null;

  const dateSet = new Set();
  for (const t of tickers) for (const d of Object.keys(series[t])) if (isWeekday(d)) dateSet.add(d);
  const dates = [...dateSet].sort();
  if (dates.length < 31) return null;

  const prev = {};
  const R = Object.fromEntries(tickers.map((t) => [t, []]));
  const rp = [];
  dates.forEach((d, i) => {
    let p = 0;
    for (const t of tickers) {
      const c = series[t][d];
      let r = 0;
      if (Number.isFinite(c) && c > 0) {
        if (prev[t]) r = c / prev[t] - 1;
        prev[t] = c;
      }
      if (i > 0) R[t].push(r);
      p += weights[t] * r;
    }
    if (i > 0) rp.push(p);
  });

  const ppy = rp.length / Math.max(yearsBetween(dates[0], dates[dates.length - 1]), 1 / 52);
  const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;
  const mp = mean(rp);
  const varP = rp.reduce((a, b) => a + (b - mp) ** 2, 0) / (rp.length - 1);
  const contributions = {};
  const vols = {};
  for (const t of tickers) {
    const mt = mean(R[t]);
    let cov = 0;
    for (let i = 0; i < rp.length; i++) cov += (R[t][i] - mt) * (rp[i] - mp);
    cov /= rp.length - 1;
    contributions[t] = varP > 0 ? round((weights[t] * cov) / varP, 4) : 0;
    const sd = std(R[t]);
    vols[t] = sd == null ? null : round(sd * Math.sqrt(ppy), 4);
  }
  let nav = 1;
  const curve = [1];
  for (const r of rp) curve.push((nav *= 1 + r));

  return {
    vol_annual: round(Math.sqrt(varP) * Math.sqrt(ppy), 4),
    max_drawdown_1y: maxDrawdown(curve),
    return_1y_constant_weights: round(nav - 1, 4),
    covered_weight: round(tickers.reduce((a, t) => a + weights[t], 0), 4),
    missing,
    vols,
    contributions,
    n_days: rp.length,
    ok: true,
  };
}

// ===========================================================================
// HISTORIQUE DES COURS (method §I « apprendre du passé des cours ») — taux de base
// sur 5-10 ans : CAGR, vol, pire drawdown, % de fenêtres 12 mois positives, et
// ANALOGUES : ce qui a suivi, historiquement, quand le titre était aussi loin de
// son plus haut qu'aujourd'hui. Un taux de base, pas une prédiction.
// ===========================================================================
function quantile(sorted, q) {
  if (!sorted.length) return null;
  const pos = (sorted.length - 1) * q;
  const lo = Math.floor(pos), hi = Math.ceil(pos);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
}

export function historyStats(points, { horizonDays = 365, band = 0.05, step = 21 } = {}) {
  const s = sortedPoints(points);
  if (s.length < 260) return null;
  const yrs = yearsBetween(s[0][0], s[s.length - 1][0]);
  if (!(yrs >= 1)) return null;
  const closes = s.map((x) => x[1]);
  const last = closes[closes.length - 1];

  const dd = [];
  let peak = -Infinity;
  for (const c of closes) {
    peak = Math.max(peak, c);
    dd.push(c / peak - 1);
  }
  const currentDd = dd[dd.length - 1];

  // Fenêtres « 1 an » par DATE (pas par index : la crypto cote 7j/7).
  const fwd = [];
  let j = 0;
  for (let i = 0; i < s.length; i++) {
    const target = new Date(s[i][0]).getTime() + horizonDays * DAY;
    if (j < i) j = i;
    while (j < s.length && new Date(s[j][0]).getTime() < target) j++;
    if (j >= s.length) break;
    fwd.push({ i, ret: closes[j] / closes[i] - 1 });
  }
  const sampled = fwd.filter((_, k) => k % 5 === 0).map((f) => f.ret);
  const sortedR = [...sampled].sort((a, b) => a - b);

  const analogs = [];
  let lastIdx = -Infinity;
  for (const f of fwd) {
    if (Math.abs(dd[f.i] - currentDd) <= band && f.i - lastIdx >= step) {
      analogs.push(f.ret);
      lastIdx = f.i;
    }
  }
  const sortedA = [...analogs].sort((a, b) => a - b);

  return {
    from: s[0][0],
    to: s[s.length - 1][0],
    years: round(yrs, 1),
    cagr: round((last / closes[0]) ** (1 / yrs) - 1, 4),
    vol_annual: annualVol(points),
    max_drawdown: maxDrawdown(closes),
    current_drawdown: round(currentDd, 4),
    pct_positive_12m: sampled.length ? round(sampled.filter((r) => r > 0).length / sampled.length, 3) : null,
    median_12m: sortedR.length ? round(quantile(sortedR, 0.5), 4) : null,
    worst_12m: sortedR.length ? round(sortedR[0], 4) : null,
    best_12m: sortedR.length ? round(sortedR[sortedR.length - 1], 4) : null,
    analog: {
      condition: `drawdown vs plus haut à ±${Math.round(band * 100)} pts de ${Math.round(currentDd * 100)} %`,
      n: analogs.length,
      median_fwd_12m: sortedA.length ? round(quantile(sortedA, 0.5), 4) : null,
      p25_fwd_12m: sortedA.length ? round(quantile(sortedA, 0.25), 4) : null,
      p75_fwd_12m: sortedA.length ? round(quantile(sortedA, 0.75), 4) : null,
      pct_positive: sortedA.length ? round(analogs.filter((r) => r > 0).length / analogs.length, 3) : null,
    },
    ok: true,
  };
}

// ===========================================================================
// APPRENTISSAGE — attribution des erreurs (method §I).
// ===========================================================================
const NON_TRADES = new Set(["SEED", "RECLONE"]);

// Regret des ventes : pour chaque vente, cours d'aujourd'hui vs prix de vente (€).
// regret > 0 = le titre vaut plus aujourd'hui qu'à la vente (vendu trop tôt).
// pricesEUR = { ticker: prix € actuel }. sinceDate filtre les ventes récentes.
export function sellRegret(trades, pricesEUR, { sinceDate = null } = {}) {
  const sells = (Array.isArray(trades) ? trades : []).filter(
    (t) => t && t.side === "sell" && !NON_TRADES.has(t.ticker) && t.price > 0 && (!sinceDate || t.ts >= sinceDate)
  );
  const items = [];
  for (const t of sells) {
    const now = pricesEUR?.[t.ticker];
    if (!(now > 0)) continue;
    items.push({ ts: t.ts, ticker: t.ticker, sold_at: t.price, now: round(now, 2), regret_pct: round(now / t.price - 1, 4) });
  }
  const above = items.filter((i) => i.regret_pct > 0).length;
  return {
    n: items.length,
    above,
    share_above: items.length ? round(above / items.length, 3) : null,
    avg_regret_pct: items.length ? round(items.reduce((a, i) => a + i.regret_pct, 0) / items.length, 4) : null,
    unpriced: sells.length - items.length,
    items,
  };
}

// Performance groupée (par desk, poche ou confiance) : décisions clôturées (alpha
// réalisé) + positions ouvertes (P&L latent vs prix d'entrée de l'IA).
// open = [{ key, unrealized_pct }] déjà calculés par l'appelant.
export function groupPerformance(decisions, open, keyOf) {
  const g = {};
  const bucket = (k) => (g[k] ??= { n_closed: 0, alpha_sum: 0, n_alpha: 0, wins: 0, n_open: 0, unrealized_sum: 0 });
  for (const d of Array.isArray(decisions) ? decisions : []) {
    if (!d || d.origin === "hérité") continue; // les sorties héritées jugent la mécanique, pas un desk
    const b = bucket(keyOf(d) || "non-attribué");
    b.n_closed++;
    if (typeof d.alpha_pct === "number") {
      b.alpha_sum += d.alpha_pct;
      b.n_alpha++;
    }
    if (typeof d.realized_pnl_pct === "number" && d.realized_pnl_pct > 0) b.wins++;
  }
  for (const o of Array.isArray(open) ? open : []) {
    const b = bucket(o.key || "non-attribué");
    b.n_open++;
    if (typeof o.unrealized_pct === "number") b.unrealized_sum += o.unrealized_pct;
  }
  const out = {};
  for (const [k, b] of Object.entries(g)) {
    out[k] = {
      n_closed: b.n_closed,
      avg_alpha_closed: b.n_alpha ? round(b.alpha_sum / b.n_alpha, 4) : null,
      win_rate_closed: b.n_closed ? round(b.wins / b.n_closed, 3) : null,
      n_open: b.n_open,
      avg_unrealized_open: b.n_open ? round(b.unrealized_sum / b.n_open, 4) : null,
    };
  }
  return out;
}

// Multiplicateur de sizing MÉRITÉ par desk (method §L) : neutre tant que le desk
// n'a pas ≥ 4 décisions clôturées avec alpha, puis il grandit ou rétrécit selon
// l'alpha moyen PROUVÉ. Un desk qui se trompe voit ses idées dimensionnées plus petit.
export function deskMultiplier(stats) {
  const n = stats?.n_closed ?? 0;
  const a = stats?.avg_alpha_closed;
  if (n < 4 || typeof a !== "number") return 1;
  if (a >= 0.05) return 1.25;
  if (a >= 0) return 1;
  if (a >= -0.05) return 0.85;
  return 0.6;
}

// ---- petits utilitaires --------------------------------------------------
function num(v) { const n = Number(v); return Number.isFinite(n) ? n : null; }
function safeDiv(a, b) { a = num(a); b = num(b); return a != null && b != null && b !== 0 ? a / b : null; }
function gt(a, b) { return a == null ? null : a > b; }
function lte(a, b) { return a == null || b == null ? null : a <= b; }
function cmp(cur, prev) { return cur == null || prev == null ? null : cur > prev; }
function clamp(x, lo, hi) { return Math.max(lo, Math.min(hi, x)); }
function round(x, d) { const p = 10 ** d; return Math.round(x * p) / p; }
