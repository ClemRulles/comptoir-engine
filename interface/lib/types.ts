export type FundKind = "group" | "ai";

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

// Shape of memory/fund/ai-fund.json maintained by the Friday routine.
export interface AiFundFile {
  as_of: string;
  start_capital: number;
  cash: number;
  positions: { ticker: string; quantity: number; avg_cost: number; thesis?: string }[];
  trades: {
    ts: string;
    side: "buy" | "sell";
    ticker: string;
    quantity: number;
    price: number;
    rationale: string;
  }[];
  note?: string;
}
