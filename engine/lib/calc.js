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

  const known = ["t10y2y", "unrate", "cpi_yoy", "vix", "hy_spread"].filter((k) => inputs[k] != null).length;
  if (known === 0) {
    return { label: "inconnu", score: null, cash_floor: 0.15, fear_greed: null, flags: ["aucune donnée FRED"], ok: false };
  }

  let label, cash_floor;
  if (stress >= 2) { label = "STRESS"; cash_floor = 0.3; }
  else if (heat >= 1 && stress === 0) { label = "SURCHAUFFE"; cash_floor = 0.3; }
  else if (stress === 1) { label = "NORMAL"; cash_floor = 0.15; }
  else { label = "RISK-ON SAIN"; cash_floor = 0.05; }

  return { label, score: { stress, heat }, cash_floor, fear_greed, flags, ok: true };
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
        ? "garde-fou ORANGE : taille max 5% du book + stop-loss −8% obligatoire (§H)."
        : "garde-fou VERT : sizing normal selon conviction, plafond 20% (§H).",
  };
}

// ---- petits utilitaires --------------------------------------------------
function num(v) { const n = Number(v); return Number.isFinite(n) ? n : null; }
function safeDiv(a, b) { a = num(a); b = num(b); return a != null && b != null && b !== 0 ? a / b : null; }
function gt(a, b) { return a == null ? null : a > b; }
function lte(a, b) { return a == null || b == null ? null : a <= b; }
function cmp(cur, prev) { return cur == null || prev == null ? null : cur > prev; }
function clamp(x, lo, hi) { return Math.max(lo, Math.min(hi, x)); }
function round(x, d) { const p = 10 ** d; return Math.round(x * p) / p; }
