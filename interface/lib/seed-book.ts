// Positions réelles du groupe au 2026-06-04 (Trade Republic).
// value = valeur € de la ligne à t0 ; cost = coût de revient (dérivé du % « depuis achat »).
// Le seed convertit chaque ligne en parts fractionnaires : quantité = value / cours_live.

export interface SeedPosition {
  ticker: string;
  name: string;
  value: number; // valeur € de la ligne à t0
  cost: number; // coût de revient total de la ligne
}

export const SEED_BOOK: SeedPosition[] = [
  { ticker: "SAF.PA", name: "Safran", value: 732.81, cost: 805.2 },
  { ticker: "HO.PA", name: "Thales", value: 723.41, cost: 805.04 },
  { ticker: "AMZN", name: "Amazon", value: 703.31, cost: 602.0 },
  { ticker: "NFLX", name: "Netflix", value: 632.58, cost: 742.03 },
  { ticker: "EIMI", name: "iShares MSCI EM IMI", value: 449.46, cost: 401.0 },
  { ticker: "AI", name: "Air Liquide", value: 436.31, cost: 402.54 },
  { ticker: "LOTB", name: "Lotus Bakeries", value: 418.88, cost: 300.99 },
  { ticker: "BYD", name: "BYD", value: 407.08, cost: 401.08 },
  { ticker: "CI2", name: "Amundi MSCI India", value: 359.69, cost: 401.0 },
  { ticker: "BNP.PA", name: "BNP Paribas", value: 333.83, cost: 252.0 },
  { ticker: "SGO.PA", name: "Saint-Gobain", value: 294.06, cost: 352.46 },
  { ticker: "SAP", name: "SAP", value: 238.15, cost: 401.0 },
  { ticker: "NOVOB", name: "Novo Nordisk B", value: 234.11, cost: 301.15 },
  { ticker: "MSTR", name: "MicroStrategy", value: 200.39, cost: 402.0 },
  { ticker: "RMS.PA", name: "Hermès", value: 145.18, cost: 201.81 },
];

export const SEED_START_CAPITAL = 6309.28; // NAV des positions à t0
