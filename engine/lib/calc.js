// calc.js — fonctions PURES de scoring (pas d'I/O, pas de réseau). Testables seules.
// Chaque fonction renvoie un objet { ...valeurs, ok } ou null si données insuffisantes,
// pour que l'appelant note proprement un data_gap plutôt que de fabriquer un chiffre.

// --- Momentum 12-1 (method §A, lentille Momentum — PLAFONNÉE) --------------
// Rendement de t-12 à t-1 (on EXCLUT le dernier mois pour éviter le bruit de
// reversal court terme). `monthly` = [{date, close}] trié par date croissante.
export function momentum12_1(monthly) {
  if (!Array.isArray(monthly) || monthly.length < 13) return null;
  const c1 = monthly[monthly.length - 2].close; // t-1
  const c12 = monthly[monthly.length - 13].close; // t-12
  if (!(c12 > 0)) return null;
  const value = c1 / c12 - 1;
  // Plafond §A : au-delà de +60% sur la période sans confirmation des bénéfices,
  // le momentum cesse d'ajouter et devient un drapeau de surchauffe.
  const overheated = value > 0.6;
  return {
    value: round(value, 4),
    sign: value > 0.05 ? "positif" : value < -0.05 ? "négatif" : "neutre",
    overheated,
    asof: monthly[monthly.length - 2].date,
    ok: true,
  };
}

// --- F-Score de Piotroski (0-9) -------------------------------------------
// cur/prev = exercices annuels (objets FMP). Renvoie le score + le détail des 9 tests.
// Tout test dont les données manquent compte 0 et est listé dans `missing`.
export function piotroski(cur, prev) {
  if (!cur || !prev) return null;
  const tests = {};
  const missing = [];
  const T = (name, cond) => {
    if (cond === null || cond === undefined || Number.isNaN(cond)) {
      tests[name] = 0;
      missing.push(name);
    } else {
      tests[name] = cond ? 1 : 0;
    }
  };

  const roa = (y) => safeDiv(y.netIncome, y.totalAssets);
  const cfo = (y) => num(y.operatingCashFlow ?? y.netCashProvidedByOperatingActivities);
  const curRatio = (y) => safeDiv(y.totalCurrentAssets, y.totalCurrentLiabilities);
  const ltdRatio = (y) => safeDiv(y.longTermDebt, y.totalAssets);
  const grossMargin = (y) => safeDiv(y.grossProfit, y.revenue);
  const assetTurn = (y) => safeDiv(y.revenue, y.totalAssets);
  const shares = (y) => num(y.weightedAverageShsOut ?? y.weightedAverageShsOutDil);

  // Rentabilité
  T("roa_positif", gt(roa(cur), 0));
  T("cfo_positif", gt(cfo(cur), 0));
  T("roa_en_hausse", cmp(roa(cur), roa(prev)));
  T("accruals_sains", gt(cfo(cur), num(cur.netIncome))); // CFO > résultat net
  // Levier / liquidité / financement
  T("dette_lt_en_baisse", cmp(ltdRatio(prev), ltdRatio(cur))); // ratio dette LT en baisse
  T("liquidite_en_hausse", cmp(curRatio(cur), curRatio(prev)));
  T("pas_de_dilution", lte(shares(cur), shares(prev)));
  // Efficacité opérationnelle
  T("marge_brute_en_hausse", cmp(grossMargin(cur), grossMargin(prev)));
  T("rotation_actifs_en_hausse", cmp(assetTurn(cur), assetTurn(prev)));

  const score = Object.values(tests).reduce((a, b) => a + b, 0);
  return {
    score,
    max: 9,
    band: score >= 7 ? "solide" : score >= 4 ? "moyen" : "faible",
    tests,
    missing,
    ok: missing.length <= 3, // au-delà de 3 trous, le score n'est pas fiable
  };
}

// --- Qualité des earnings (accruals) --------------------------------------
// Accruals ratio = (résultat net − CFO) / actifs. Élevé = bénéfices "papier"
// peu adossés au cash -> qualité faible. fcf/ni complète la lecture.
export function earningsQuality(income, cashflow, balance) {
  const ni = num(income?.netIncome);
  const cfo = num(cashflow?.operatingCashFlow ?? cashflow?.netCashProvidedByOperatingActivities);
  const fcf = num(cashflow?.freeCashFlow);
  const assets = num(balance?.totalAssets);
  if (ni == null || cfo == null || !(assets > 0)) return null;
  const accruals_ratio = round((ni - cfo) / assets, 4);
  const fcf_to_ni = ni !== 0 && fcf != null ? round(fcf / ni, 3) : null;
  // Seuils usuels : accruals > 10% des actifs = drapeau ; fcf/ni < 0.5 = bénéfices peu cashés.
  let flag = "vert";
  if (accruals_ratio > 0.1 || (fcf_to_ni != null && fcf_to_ni < 0.5)) flag = "ambre";
  if (accruals_ratio > 0.2 || (fcf_to_ni != null && fcf_to_ni < 0)) flag = "rouge";
  return { accruals_ratio, fcf_to_ni, flag, ok: true };
}

// --- Score de régime macro (FRED) -----------------------------------------
// inputs : { t10y2y, unrate, unrate_prev, cpi_yoy, fedfunds } (valeurs ou null).
// Renvoie un cadran aligné sur method §E/§H : RISK-ON SAIN / NORMAL / SURCHAUFFE / STRESS.
export function regimeScore(inputs) {
  const flags = [];
  let stress = 0;
  let heat = 0;

  if (inputs.t10y2y != null) {
    if (inputs.t10y2y < 0) { stress += 2; flags.push("courbe des taux inversée (10Y-2Y<0)"); }
    else if (inputs.t10y2y < 0.2) { stress += 1; flags.push("courbe des taux plate"); }
  }
  if (inputs.unrate != null && inputs.unrate_prev != null) {
    if (inputs.unrate - inputs.unrate_prev > 0.3) { stress += 1; flags.push("chômage en hausse nette"); }
  }
  if (inputs.cpi_yoy != null) {
    if (inputs.cpi_yoy > 4) { heat += 1; flags.push("inflation élevée (>4%)"); }
  }

  const known = ["t10y2y", "unrate", "cpi_yoy"].filter((k) => inputs[k] != null).length;
  if (known === 0) {
    return { label: "inconnu", score: null, cash_floor: 0.15, flags: ["aucune donnée FRED"], ok: false };
  }

  let label, cash_floor;
  if (stress >= 2) { label = "STRESS"; cash_floor = 0.3; }
  else if (heat >= 1 && stress === 0) { label = "SURCHAUFFE"; cash_floor = 0.3; }
  else if (stress === 1) { label = "NORMAL"; cash_floor = 0.15; }
  else { label = "RISK-ON SAIN"; cash_floor = 0.05; }

  return { label, score: { stress, heat }, cash_floor, flags, ok: true };
}

// --- Gate de décision : agrège les signaux d'un titre en feu vert/orange/rouge.
// Ce n'est PAS un ordre : c'est un garde-fou que l'IA doit justifier d'outrepasser.
export function gate({ fscore, momentum, eq }) {
  const reasons = [];
  let red = 0, amber = 0;

  // Combien de signaux exploitables ? Aucun -> on NE dit pas "vert" (droit au blanc).
  const usable = [fscore?.ok, momentum?.ok, eq?.ok].filter(Boolean).length;
  if (usable === 0) {
    return {
      verdict: "indéterminé",
      reasons: ["aucun signal quantitatif disponible (voir data_gaps)"],
      note:
        "garde-fou INDÉTERMINÉ : pas de feu factuel. Ne te repose pas dessus — décide sur la méthode qualitative (§A-§D) et note l'absence de signal.",
    };
  }

  if (fscore?.ok) {
    if (fscore.score <= 3) { red++; reasons.push(`F-Score faible (${fscore.score}/9)`); }
    else if (fscore.score <= 5) { amber++; reasons.push(`F-Score moyen (${fscore.score}/9)`); }
  }
  if (eq?.ok) {
    if (eq.flag === "rouge") { red++; reasons.push("qualité des earnings rouge (accruals élevés)"); }
    else if (eq.flag === "ambre") { amber++; reasons.push("qualité des earnings à surveiller"); }
  }
  if (momentum?.ok) {
    if (momentum.overheated) { amber++; reasons.push("momentum en surchauffe (>+60%/an)"); }
    else if (momentum.sign === "négatif") { amber++; reasons.push("momentum 12-1 négatif"); }
  }

  const verdict = red > 0 ? "rouge" : amber >= 2 ? "ambre" : "vert";
  return {
    verdict,
    reasons,
    note:
      verdict === "rouge"
        ? "garde-fou ROUGE : n'ouvre pas / réduis, sauf thèse exceptionnelle écrite et défendue."
        : verdict === "ambre"
        ? "garde-fou ORANGE : taille réduite et hypothèse pivot renforcée."
        : "garde-fou VERT : feu factuel cohérent avec une prise de position (sizing selon §H).",
  };
}

// ---- petits utilitaires --------------------------------------------------
function num(v) { const n = Number(v); return Number.isFinite(n) ? n : null; }
function safeDiv(a, b) { a = num(a); b = num(b); return a != null && b != null && b !== 0 ? a / b : null; }
function gt(a, b) { return a == null ? null : a > b; }
function lte(a, b) { return a == null || b == null ? null : a <= b; }
function cmp(cur, prev) { return cur == null || prev == null ? null : cur > prev; }
function round(x, d) { const p = 10 ** d; return Math.round(x * p) / p; }
