// edgar.js — extraction PURE des fondamentaux depuis SEC EDGAR companyfacts (XBRL).
// Aucune I/O ici : sources.js fetch le JSON brut, ces fonctions le transforment en
// états financiers alignés sur le format attendu par piotroski()/earningsQuality()
// de calc.js (mêmes clés que FMP). Source officielle, gratuite, sans clé — c'est
// l'ancre anti-bullshit de CLAUDE.md appliquée au gate quantitatif. US uniquement.

// Tags us-gaap candidats par champ, par ordre de préférence (les déclarants n'utilisent
// pas tous les mêmes). unit: "USD" pour le monétaire, "shares" pour les actions.
const FIELD_TAGS = {
  netIncome: ["NetIncomeLoss", "ProfitLoss"],
  totalAssets: ["Assets"],
  operatingCashFlow: [
    "NetCashProvidedByUsedInOperatingActivities",
    "NetCashProvidedByUsedInOperatingActivitiesContinuingOperations",
  ],
  totalCurrentAssets: ["AssetsCurrent"],
  totalCurrentLiabilities: ["LiabilitiesCurrent"],
  longTermDebt: ["LongTermDebtNoncurrent", "LongTermDebt"],
  grossProfit: ["GrossProfit"],
  revenue: [
    "RevenueFromContractWithCustomerExcludingAssessedTax",
    "Revenues",
    "SalesRevenueNet",
  ],
  capex: ["PaymentsToAcquirePropertyPlantAndEquipment"],
};
const SHARE_TAGS = [
  "WeightedAverageNumberOfSharesOutstandingBasic",
  "WeightedAverageNumberOfDilutedSharesOutstanding",
];

// Les flux (compte de résultat / cash-flow) couvrent ~1 an dans un 10-K ; les stocks
// (bilan) sont des instantanés à la date de clôture. On distingue pour filtrer.
const FLOW_FIELDS = new Set(["netIncome", "operatingCashFlow", "grossProfit", "revenue", "capex"]);

function isAnnualEntry(e, isFlow) {
  if (!e || e.form !== "10-K" || !e.end || typeof e.val !== "number") return false;
  if (!isFlow) return true; // instantané : la date `end` du 10-K = clôture d'exercice
  if (!e.start) return false;
  const days = (new Date(e.end) - new Date(e.start)) / 86400000;
  return days > 300 && days < 400; // exercice complet (écarte trimestres et cumuls multi-ans)
}

// Pour un tag : map { endDate -> val } des valeurs ANNUELLES (10-K), en gardant
// la déclaration la plus récemment déposée (`filed`) par date de clôture.
function annualSeries(tagObj, isFlow, preferredUnit) {
  const units = tagObj?.units;
  if (!units) return null;
  const arr = units[preferredUnit] ?? units[Object.keys(units)[0]];
  if (!Array.isArray(arr)) return null;
  const byEnd = new Map();
  for (const e of arr) {
    if (!isAnnualEntry(e, isFlow)) continue;
    const prev = byEnd.get(e.end);
    if (!prev || String(e.filed ?? "") > String(prev.filed ?? "")) byEnd.set(e.end, e);
  }
  if (!byEnd.size) return null;
  const out = {};
  for (const [end, e] of byEnd) out[end] = e.val;
  return out;
}

function firstTagSeries(gaap, tags, isFlow, unit) {
  for (const t of tags) {
    const s = gaap[t] ? annualSeries(gaap[t], isFlow, unit) : null;
    if (s) return s;
  }
  return null;
}

// companyfacts JSON -> { cur, prev } au format calc.js (clés FMP), ou null si les
// deux derniers exercices ne sont pas reconstituables. Champs introuvables -> absents
// (piotroski tolère jusqu'à 3 trous ; earningsQuality exige NI + CFO + actifs).
export function annualFromFacts(facts) {
  const gaap = facts?.facts?.["us-gaap"];
  if (!gaap) return null;

  const series = {};
  for (const [field, tags] of Object.entries(FIELD_TAGS)) {
    series[field] = firstTagSeries(gaap, tags, FLOW_FIELDS.has(field), "USD");
  }
  series.weightedAverageShsOut = firstTagSeries(gaap, SHARE_TAGS, true, "shares");

  // Années d'ancrage = clôtures d'exercice du résultat net (le tag le plus universel).
  const anchor = series.netIncome;
  if (!anchor) return null;
  const ends = Object.keys(anchor).sort().reverse();
  if (ends.length < 2) return null;
  const [curEnd, prevEnd] = ends;

  const yearAt = (end) => {
    const y = { fiscalEnd: end };
    for (const [field, s] of Object.entries(series)) {
      if (field === "capex") continue;
      if (s && typeof s[end] === "number") y[field] = s[end];
    }
    // freeCashFlow = CFO − capex (absent si l'un des deux manque).
    const cfo = series.operatingCashFlow?.[end];
    const capex = series.capex?.[end];
    if (typeof cfo === "number" && typeof capex === "number") y.freeCashFlow = cfo - capex;
    return y;
  };

  return { cur: yearAt(curEnd), prev: yearAt(prevEnd), source: "SEC EDGAR (10-K)" };
}

// company_tickers.json de la SEC ({ "0": {cik_str, ticker, title}, … }) -> CIK
// (10 chiffres, zéro-paddé) pour un symbole, ou null. Pur, testable.
export function cikForSymbol(tickersJson, symbol) {
  if (!tickersJson || !symbol) return null;
  const want = symbol.toUpperCase();
  for (const row of Object.values(tickersJson)) {
    if (row && String(row.ticker).toUpperCase() === want && row.cik_str != null) {
      return String(row.cik_str).padStart(10, "0");
    }
  }
  return null;
}
