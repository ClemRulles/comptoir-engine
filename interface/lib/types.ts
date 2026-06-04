export type FundKind = "group" | "ai";

export interface ClubMember {
  id: string;
  name: string;
  joined_on: string;
  monthly_amount: number;
  active: boolean;
}

export interface Contribution {
  id: string;
  member_id: string | null;
  member_name?: string | null;
  ts: string;
  amount: number;
  note: string | null;
}

export interface Fund {
  id: string;
  kind: FundKind;
  name: string;
  inception_date: string;
  start_capital: number;
}

export interface Holding {
  id: string;
  fund_id: string;
  ticker: string;
  quantity: number;
  avg_cost: number;
  updated_at: string;
}

export interface Trade {
  id: string;
  fund_id: string;
  ts: string;
  side: "buy" | "sell";
  ticker: string;
  quantity: number;
  price: number;
  rationale: string | null;
  source: "member" | "engine";
}

export interface NavSnapshot {
  id: string;
  fund_id: string;
  date: string; // YYYY-MM-DD
  cash: number;
  positions_value: number;
  nav: number;
}

export type Confidence = "Haute" | "Moyenne" | "Basse";
export type Horizon = "coeur" | "tactique";

// Shape of memory/fund/ai-fund.json maintained by the Friday routine.
export interface AiFundFile {
  as_of: string;
  seeded?: boolean;
  start_capital: number;
  cash: number;
  positions: {
    ticker: string;
    quantity: number;
    avg_cost: number;
    thesis?: string;
    confidence?: Confidence;
    thesis_id?: string;
    horizon?: Horizon;
    entry_date?: string;
    target?: number;
    exit_rule?: string;
  }[];
  trades: {
    ts: string;
    side: "buy" | "sell";
    ticker: string;
    quantity: number;
    price: number;
    rationale: string;
    confidence?: Confidence;
    thesis_id?: string;
    horizon?: Horizon;
  }[];
  note?: string;
}

// memory/fund/decisions.json — append-only ledger of CLOSED decisions.
export interface Decision {
  thesis_id: string;
  ticker: string;
  horizon: Horizon;
  confidence: Confidence;
  opened: string;
  closed: string;
  entry: number;
  exit: number;
  realized_pnl_pct: number;
  outcome: "thèse confirmée" | "thèse cassée" | "neutre";
  hit: boolean;
  lesson: string;
}
export interface DecisionsFile {
  _doc?: string;
  decisions: Decision[];
}

// memory/fund/calibration.json — aggregates recomputed by the engine.
export interface CalibrationBucket {
  confidence: Confidence;
  n: number;
  hits: number;
  hit_rate: number;
  avg_return: number;
}
export interface Calibration {
  _doc?: string;
  updated: string;
  buckets: CalibrationBucket[];
  global: {
    closed_decisions: number;
    win_rate: number;
    avg_win: number;
    avg_loss: number;
    profit_factor: number;
    max_drawdown: number;
  };
}
