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

// memory/catalysts.md — calendrier des événements datés (rempli le lundi, re-validé le vendredi).
export interface CatalystRow {
  date: string;        // "2026-06-18" ou texte libre si non normalisé
  event: string;
  type: string;        // Macro | Politique | Réglementaire | Micro
  affects: string;     // secteurs / tickers concernés
  risk: string;        // binaire | directionnel
  positioning: string; // pré-positionnement / posture
  confidence: string;  // Haute | Moyenne | Basse | —
  status: string;      // À surveiller | ACTIF | PASSÉ
}

// Mouvement réalisé (achat/vente) d'un des deux fonds, pour le flux d'activité.
export interface ActivityItem {
  fund: "ai" | "group";
  ts: string;
  side: "buy" | "sell";
  ticker: string;
  quantity: number;
  price: number;
  amount: number;            // quantity × price (montant de l'opération)
  weightPct?: number | null; // part du fonds que représente l'opération, si connue
  rationale?: string | null;
  confidence?: Confidence;
}

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
    value_t0?: number; // valeur € de la ligne à t0 (pour normaliser quantity=1 → parts réelles)
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

// memory/fund/signals.json — signaux quantitatifs par titre (engine/signals.js).
export interface SignalNum<Z = string> {
  value: number | null;
  zone?: Z;
  sign?: string;
  overheated?: boolean;
  ok?: boolean;
}
export interface InsiderSignal {
  buys?: number;
  sells?: number;
  ratio?: number | null;
  ok?: boolean;
}
export interface TickerSignals {
  ticker: string;
  asof?: string;
  price?: number | null;
  currency?: string;
  momentum_12_1?: SignalNum | null;
  rsi_14?: SignalNum | null;
  rel_volume?: SignalNum | null;
  range_52w?: SignalNum | null;
  insider_90d?: InsiderSignal | null;
  fscore?: { score?: number | null } | null;
  earnings_quality?: { flag?: string | null } | null;
  eps_surprise?: SignalNum | null;
  revenue_growth?: SignalNum | null;
  gate?: {
    verdict: "vert" | "ambre" | "rouge" | "indéterminé" | string;
    composite?: number;
    coverage?: number;
    reasons?: string[];
  } | null;
}
export interface MarketRegime {
  label: string;
  score: number | null;
  cash_floor?: number;
  fear_greed?: number | null;
  flags?: string[];
  ok?: boolean;
}
export interface MarketSignals {
  _doc?: string;
  updated?: string;
  regime?: MarketRegime;
  tickers: Record<string, TickerSignals>;
  data_gaps?: string[];
}

// memory/grok-pulse.json — pouls hebdo du marché (Grok, accès X).
// Radar à corroborer : un thème non recoupé par une source dure ne crée aucun signal d'achat.
export interface GrokPulseTheme {
  title: string;
  detail?: string;
  tickers?: string[];
  corroborated?: boolean; // true = recoupé par une source dure (SEC/FRED/chiffres)
}
export interface GrokPulseMover {
  ticker: string;
  direction: "up" | "down";
  reason?: string;
  held?: boolean; // détenu par le groupe / l'IA
}
export interface GrokPulseWeek {
  week: string;       // "2026-W24"
  date: string;       // "2026-06-08"
  label?: string;     // "Semaine du 8 juin 2026"
  headline?: string;  // synthèse en une ligne
  themes?: GrokPulseTheme[];
  movers?: GrokPulseMover[];
  sources?: string[];
}
export interface GrokPulseFile {
  _doc?: string;
  updated?: string;
  weeks: GrokPulseWeek[];
}

// ── Radar crypto (CoinGecko + Fear & Greed) — engine: memory/fund/crypto.json ──
export interface CryptoCoin {
  id: string;
  symbol: string;
  name: string;
  price_eur: number | null;
  market_cap_eur: number | null;
  change_24h_pct: number | null;
  change_7d_pct: number | null;
  change_30d_pct: number | null;
}
export interface CryptoMarket {
  total_market_cap_eur?: number | null;
  total_volume_eur?: number | null;
  market_cap_change_24h_pct?: number | null;
  btc_dominance_pct?: number | null;
  eth_dominance_pct?: number | null;
}
export interface CryptoFile {
  _doc?: string;
  updated?: string;
  market?: CryptoMarket | null;
  fear_greed?: { value: number | null; classification: string | null } | null;
  sentiment_read?: string | null;
  coins?: CryptoCoin[] | null;
}

// ── Convictions de l'IA (deep-dive du mercredi) — engine: memory/fund/convictions.json ──
export type Verdict = "Acheter" | "Surveiller" | "Éviter";
export interface ConvictionItem {
  ticker: string;
  name?: string;
  verdict: Verdict;
  confidence: "Haute" | "Moyenne" | "Basse";
  horizon?: string;            // "coeur" | "tactique"
  thesis: string;              // thèse en une ligne
  risk?: string;               // le risque qui invaliderait la thèse
  date?: string;               // date d'analyse
}
export interface ConvictionsFile {
  _doc?: string;
  updated?: string;
  items: ConvictionItem[];
}
