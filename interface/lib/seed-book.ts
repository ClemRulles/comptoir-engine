// Positions réelles du groupe — valeurs Trade Republic au 2026-06-08.
// value = valeur € actuelle de la ligne ; cost = coût de revient (inchangé depuis l'achat,
// vérifié contre le % « depuis achat »). Le seed convertit chaque ligne en parts
// fractionnaires : quantité = value / cours_live → au moment du seed, l'affichage = value
// exactement, puis suit le marché.

export interface SeedPosition {
  ticker: string;
  name: string;
  value: number; // valeur € de la ligne (TR, 2026-06-08)
  cost: number; // coût de revient total de la ligne (inchangé)
}

export const SEED_BOOK: SeedPosition[] = [
  { ticker: "SAF.PA", name: "Safran", value: 793.0, cost: 805.2 },
  { ticker: "HO.PA", name: "Thales", value: 767.06, cost: 805.04 },
  { ticker: "AMZN", name: "Amazon", value: 666.49, cost: 602.0 },
  { ticker: "NFLX", name: "Netflix", value: 600.9, cost: 742.03 },
  { ticker: "EIMI", name: "iShares MSCI EM IMI", value: 454.71, cost: 401.0 },
  { ticker: "AI", name: "Air Liquide", value: 413.24, cost: 402.54 },
  { ticker: "LOTB", name: "Lotus Bakeries", value: 430.84, cost: 300.99 },
  { ticker: "BYD", name: "BYD", value: 379.56, cost: 401.08 },
  { ticker: "CI2", name: "Amundi MSCI India", value: 358.66, cost: 401.0 },
  { ticker: "BNP.PA", name: "BNP Paribas", value: 348.62, cost: 252.0 },
  { ticker: "SGO.PA", name: "Saint-Gobain", value: 293.03, cost: 352.46 },
  { ticker: "SAP", name: "SAP", value: 259.72, cost: 401.0 },
  { ticker: "NOVOB", name: "Novo Nordisk B", value: 225.67, cost: 301.15 },
  { ticker: "MSTR", name: "MicroStrategy", value: 141.42, cost: 402.0 },
  { ticker: "RMS.PA", name: "Hermès", value: 146.65, cost: 201.81 },
];

// Baseline de la course = NAV des positions au t0 du 2026-06-04 (inchangé pour ne pas
// réinitialiser la compétition). Les valeurs ci-dessus (≈ 6 279 € au 08/06) sont la valo
// actuelle ; l'écart avec ce baseline = la perf depuis t0.
export const SEED_START_CAPITAL = 6309.28;
