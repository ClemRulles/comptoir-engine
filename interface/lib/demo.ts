import type { AiFundFile, Calibration, ClubMember, Contribution, ConvictionsFile, CryptoFile, Decision, GrokPulseWeek, MarketSignals } from "./types";

// Données de DÉMONSTRATION (affichées tant que Supabase n'est pas branché).
// Clairement étiquetées « Démo » dans l'UI — remplacées par les vraies données en prod.

// Cours = valeur actuelle de la ligne (quantité 1 par position → valeur = cours).
export const DEMO_PRICES: Record<string, number> = {
  "SAF.PA": 732.81,
  "HO.PA": 723.41,
  AMZN: 703.31,
  NFLX: 632.58,
  EIMI: 449.46,
  AI: 436.31,
  LOTB: 418.88,
  BYD: 407.08,
  CI2: 359.69,
  "BNP.PA": 333.83,
  "SGO.PA": 294.06,
  SAP: 238.15,
  NOVOB: 234.11,
  MSTR: 200.39,
  "RMS.PA": 145.18,
};

// Positions réelles du groupe (Trade Republic), encodées au 2026-06-04.
// quantity 1 + avg_cost = coût base € → la perf par ligne reproduit le « depuis achat » TR.
const REAL_BOOK = [
  { ticker: "SAF.PA", quantity: 1, avg_cost: 805.20 },
  { ticker: "HO.PA", quantity: 1, avg_cost: 805.04 },
  { ticker: "AMZN", quantity: 1, avg_cost: 602.00 },
  { ticker: "NFLX", quantity: 1, avg_cost: 742.03 },
  { ticker: "EIMI", quantity: 1, avg_cost: 401.00 },
  { ticker: "AI", quantity: 1, avg_cost: 402.54 },
  { ticker: "LOTB", quantity: 1, avg_cost: 300.99 },
  { ticker: "BYD", quantity: 1, avg_cost: 401.08 },
  { ticker: "CI2", quantity: 1, avg_cost: 401.00 },
  { ticker: "BNP.PA", quantity: 1, avg_cost: 252.00 },
  { ticker: "SGO.PA", quantity: 1, avg_cost: 352.46 },
  { ticker: "SAP", quantity: 1, avg_cost: 401.00 },
  { ticker: "NOVOB", quantity: 1, avg_cost: 301.15 },
  { ticker: "MSTR", quantity: 1, avg_cost: 402.00 },
  { ticker: "RMS.PA", quantity: 1, avg_cost: 201.81 },
];

export const DEMO_GROUP = {
  name: "Fonds du groupe",
  startCapital: 6309.28,
  cash: 0,
  holdings: REAL_BOOK,
};

const AI_THESES: Record<string, string> = {
  "SAF.PA": "Aéronautique + défense, qualité industrielle. Hérité du groupe à t0.",
  "HO.PA": "Cycle défense européen structurel. Hérité du groupe à t0.",
  AMZN: "AWS + levier marge retail/pub. Hérité du groupe à t0.",
  NFLX: "Leader streaming, pricing power + pub. Hérité du groupe à t0.",
  EIMI: "Diversification marchés émergents (ETF). Hérité du groupe à t0.",
  AI: "Compounder gaz industriels, défensif. Hérité du groupe à t0.",
  LOTB: "Marque premium (Biscoff), valo tendue. Hérité du groupe à t0.",
  BYD: "Leader EV intégré verticalement. Hérité du groupe à t0.",
  CI2: "Croissance structurelle Inde (ETF). Hérité du groupe à t0.",
  "BNP.PA": "Banque diversifiée, valo basse. Hérité du groupe à t0.",
  "SGO.PA": "Matériaux, levier rénovation. Cyclique. Hérité du groupe à t0.",
  SAP: "Bascule cloud (RISE). Forte perte, à réévaluer. Hérité du groupe à t0.",
  NOVOB: "Leader GLP-1, concurrence en hausse. Hérité du groupe à t0.",
  MSTR: "Proxy bitcoin à levier, très volatil. Hérité du groupe à t0.",
  "RMS.PA": "Luxe ultra-premium, pricing power. Hérité du groupe à t0.",
};

// Book IA = clone du groupe à t0 (mêmes positions, même coût base).
export const DEMO_AI: AiFundFile = {
  as_of: "2026-06-04",
  seeded: true,
  start_capital: 6309.28,
  cash: 0,
  positions: REAL_BOOK.map((h) => ({ ...h, thesis: AI_THESES[h.ticker] })),
  trades: [
    { ts: "2026-06-04", side: "buy", ticker: "SEED", quantity: 0, price: 0, rationale: "SEED t0 : le book IA hérite des 15 positions du groupe à l'identique (course à armes égales). L'IA gère seule à partir d'ici." },
  ],
  note: "Données de démonstration — clone du groupe au 2026-06-04.",
};

// Série NAV JOURNALIÈRE déterministe (~400 jours), centrée sur la NAV de seed (~6 309 €).
// La course IA vs groupe démarre aujourd'hui : les deux fonds sont quasi confondus au départ.
// Dates complètes YYYY-MM-DD pour permettre le filtre par période (1J/1S/1M/3M/1A/Max).
export function demoSeries(): { date: string; group: number; ai: number }[] {
  const pts: { date: string; group: number; ai: number }[] = [];
  const start = 6309;
  const groupEnd = 6309;
  const aiEnd = 6309;
  const N = 400;
  const today = new Date();
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1);
    // tendance + harmoniques + une correction au milieu (réalisme)
    const dip = -Math.exp(-Math.pow((t - 0.55) * 6, 2)) * 700;
    const noiseG = Math.sin(i * 0.21) * 120 + Math.sin(i * 0.045) * 220 + Math.sin(i * 0.6) * 50;
    const noiseA = Math.sin(i * 0.18 + 1) * 160 + Math.sin(i * 0.05 + 2) * 300 + Math.sin(i * 0.5 + 1) * 70;
    const d = new Date(today);
    d.setDate(today.getDate() - (N - 1 - i));
    const group = start + (groupEnd - start) * t + noiseG + dip * 0.8;
    const ai = start + (aiEnd - start) * t + noiseA + dip;
    pts.push({
      date: d.toISOString().slice(0, 10),
      group: Math.round(i === N - 1 ? groupEnd : group),
      ai: Math.round(i === N - 1 ? aiEnd : ai),
    });
  }
  return pts;
}

export const DEMO_BRIEF = `# Brief de la semaine — démo

## Cadran de régime
**RISK-ON SAIN** — rester investi, exiger une marge de sécurité sur les nouveaux achats.

## 🎯 LA tendance de la semaine
**Infrastructure énergétique de l'IA.** Le goulot n'est plus les puces mais l'**électricité et le
refroidissement** des datacenters. Preuves dures : capex hyperscalers en hausse, contrats
d'énergie signés, guidance relevée chez les équipementiers.
- **Direct** : NVDA, TSM. **Pioches & pelles** : VRT (thermique), CEG (énergie).
- **Drapeau bulle** : vigilance sur les noms déjà paraboliques.

## Longs haute conviction
1. **NVDA** — cœur de cycle, pricing power. ⚠ Décélération capex hyperscalers.
2. **VRT** — second ordre, valorisation plus raisonnable. ⚠ Concurrence sur le refroidissement.

## En une phrase
La meilleure façon de jouer l'IA cette semaine, c'est l'**énergie** qui l'alimente.`;

// ── Données démo de l'onglet « Apprentissages de l'IA » ───────────────
export const DEMO_DECISIONS: Decision[] = [
  { thesis_id: "smci-2025q4", ticker: "SMCI", horizon: "tactique", confidence: "Haute", opened: "2025-11-03", closed: "2026-01-12", entry: 38, exit: 29, realized_pnl_pct: -0.237, outcome: "thèse cassée", hit: false, lesson: "Confiance Haute sur un momentum parabolique : le baissier (gouvernance, marges) avait raison. Trop gros, trop tôt." },
  { thesis_id: "asml-cycle", ticker: "ASML", horizon: "coeur", confidence: "Haute", opened: "2025-09-15", closed: "2026-02-28", entry: 620, exit: 712, realized_pnl_pct: 0.148, outcome: "thèse confirmée", hit: true, lesson: "Monopole EUV + carnet de commandes : thèse cœur qui tient. La marge de sécurité a payé." },
  { thesis_id: "vrt-secondordre", ticker: "VRT", horizon: "coeur", confidence: "Moyenne", opened: "2025-10-20", closed: "2026-03-10", entry: 78, exit: 96, realized_pnl_pct: 0.231, outcome: "thèse confirmée", hit: true, lesson: "Pioches & pelles (refroidissement datacenter) : meilleur rapport risque/rendement que le nom parabolique." },
  { thesis_id: "pltr-valo", ticker: "PLTR", horizon: "tactique", confidence: "Basse", opened: "2025-12-01", closed: "2026-01-20", entry: 71, exit: 66, realized_pnl_pct: -0.07, outcome: "neutre", hit: true, lesson: "Confiance Basse correctement traitée : petite taille, stop respecté, perte limitée. Pas d'erreur de process." },
  { thesis_id: "tsm-marge", ticker: "TSM", horizon: "coeur", confidence: "Moyenne", opened: "2025-08-12", closed: "2026-02-05", entry: 140, exit: 168, realized_pnl_pct: 0.20, outcome: "thèse confirmée", hit: true, lesson: "Goulot fonderie + valo vs pairs raisonnable : catalyseur résultats joué proprement." },
  { thesis_id: "arm-hype", ticker: "ARM", horizon: "tactique", confidence: "Haute", opened: "2025-11-18", closed: "2026-01-30", entry: 145, exit: 132, realized_pnl_pct: -0.09, outcome: "thèse cassée", hit: false, lesson: "Encore une Haute sur une valo tendue : narratif > chiffres. Le bucket Haute est sur-confiant → sizing réduit." },
];

export const DEMO_CALIBRATION: Calibration = {
  updated: "2026-03-31",
  buckets: [
    { confidence: "Haute", n: 3, hits: 1, hit_rate: 0.33, avg_return: -0.033 },
    { confidence: "Moyenne", n: 2, hits: 2, hit_rate: 1.0, avg_return: 0.216 },
    { confidence: "Basse", n: 1, hits: 1, hit_rate: 1.0, avg_return: -0.07 },
  ],
  global: {
    closed_decisions: 6,
    win_rate: 0.5,
    avg_win: 0.193,
    avg_loss: -0.132,
    profit_factor: 1.46,
    max_drawdown: -0.118,
  },
};

// ── Membres & apports (démo) ──────────────────────────────────────────
export const DEMO_MEMBERS: ClubMember[] = [
  { id: "m1", name: "Clément", joined_on: "2025-09-01", monthly_amount: 25, active: true },
  { id: "m2", name: "Henri", joined_on: "2025-09-01", monthly_amount: 25, active: true },
  { id: "m3", name: "Alex", joined_on: "2025-11-01", monthly_amount: 25, active: true },
  { id: "m4", name: "Sam", joined_on: "2026-02-01", monthly_amount: 25, active: true },
];

export const DEMO_CONTRIBUTIONS: Contribution[] = [
  { id: "c1", member_id: "m1", member_name: "Clément", ts: "2026-05-01", amount: 25, note: "Apport mensuel" },
  { id: "c2", member_id: "m2", member_name: "Henri", ts: "2026-05-01", amount: 25, note: "Apport mensuel" },
  { id: "c3", member_id: "m3", member_name: "Alex", ts: "2026-05-01", amount: 25, note: "Apport mensuel" },
  { id: "c4", member_id: "m4", member_name: "Sam", ts: "2026-05-01", amount: 50, note: "Rattrapage + mensuel" },
];

export const DEMO_LESSONS = `# Journal d'apprentissage

## Leçons vives

2026-03-31 · CALIBRATION · Le bucket « Haute » ne réussit qu'à 33 % (vs 100 % pour « Moyenne ») → taille cible Haute réduite de 12 % à 8 % du NAV, critères « Haute » durcis (valo tendue exclue).
2026-03-10 · VRT · Thèse pioches & pelles confirmée (+23 %) → privilégier le second ordre quand le nom direct est parabolique.
2026-02-28 · ASML · Thèse cœur confirmée (+15 %) : monopole EUV, la marge de sécurité a payé. La patience sur le cœur est un edge.
2026-01-30 · ARM · Haute sur valo tendue, cassée (−9 %) : narratif > chiffres. 2e Haute fautive du trimestre → problème de calibration, pas de malchance.
2026-01-20 · PLTR · Confiance Basse bien gérée : petite taille, stop respecté. Le process protège même quand on a tort.
2026-01-12 · SMCI · Haute sur momentum parabolique, cassée (−24 %) : le baissier (gouvernance) avait raison. Ne jamais sizer gros sur un momentum non confirmé par les bénéfices.`;

// ── Calendrier des catalyseurs (démo) — même format que memory/catalysts.md ──
export const DEMO_CATALYSTS = `# Indicateurs & catalyseurs

## Indicateurs à venir

| Date | Événement | Type | Ce qui bouge (secteurs/tickers) | Sens du risque | Analyse de l'IA | Confiance | Statut |
|------|-----------|------|--------------------------------|----------------|-----------------|-----------|--------|
| 2026-06-12 | Emploi US (NFP) | Macro | taux, growth/tech, banques | binaire | Pourquoi : un marché de l'emploi chaud repousse les baisses de taux et pèse sur le growth · Prise en compte : je n'augmente pas la tech avant le chiffre · Orientation : si l'emploi ralentit, je renforcerais le growth de qualité ; sinon je reste neutre | Moyenne | À surveiller |
| 2026-06-18 | Décision FOMC (taux) | Macro | growth, REIT, or, USD | binaire | Pourquoi : le coût du capital pilote la valo du growth et des REIT · Prise en compte : je garde AMZN/SAP (déjà avec marge), pas de pari directionnel avant la décision · Orientation : si dovish, tech de qualité ; si hawkish, value/défensif (banques, défense) | Moyenne | À surveiller |
| 2026-06-24 | Résultats NOVOB | Micro | NOVOB (GLP-1) | binaire | Pourquoi : la guidance GLP-1 face à la concurrence peut casser la thèse · Prise en compte : risque binaire sur une position détenue → j'allège avant si le doute domine · Orientation : si guidance solide, je garde ; sinon je sors et redéploie vers la santé défensive | Haute | ACTIF |
| 2026-07-01 | Échéance tarifaire UE–US | Politique | auto, SGO.PA, industriels | directionnel | Pourquoi : des tarifs frappent les industriels cycliques exportateurs · Prise en compte : je surveille SGO.PA avec un stop défini · Orientation : en cas de tarifs durs, je réduis le cyclique au profit du défensif domestique | Basse | À surveiller |
| 2026-07-09 | Résultats NFLX | Micro | NFLX | binaire | Pourquoi : croissance abonnés + pricing power = cœur de la thèse · Prise en compte : position cœur, je garde et regarde le coût d'acquisition · Orientation : si pricing power confirmé, je renforcerais ; sinon j'allège | Moyenne | À surveiller |

## Archives (événements passés + ce qu'on en a tiré)

| 2026-05-28 | Résultats AMZN | Micro | AMZN | binaire | Pourquoi : AWS pilote la marge du groupe · Prise en compte : anticipé, gardé avec marge · Orientation : guidance AWS solide → thèse confirmée, conservé | Haute | PASSÉ |
`;

// Mouvements récents du book IA (démo) — pour illustrer le flux d'activité.
export const DEMO_AI_TRADES = [
  { ts: "2026-06-04", side: "buy" as const, ticker: "VRT", quantity: 6, price: 96.0, rationale: "Pioches & pelles de l'infra IA (refroidissement) — meilleur risque/rendement que le nom direct.", confidence: "Moyenne" as const },
  { ts: "2026-06-04", side: "sell" as const, ticker: "MSTR", quantity: 1, price: 200.39, rationale: "Allègement proxy bitcoin à levier : trop volatil pour la taille héritée.", confidence: "Basse" as const },
  { ts: "2026-05-30", side: "buy" as const, ticker: "ASML", quantity: 1, price: 712.0, rationale: "Monopole EUV + carnet de commandes, marge de sécurité après repli.", confidence: "Haute" as const },
];

// Trades récents du groupe (démo) — saisis via l'interface par les membres.
export const DEMO_GROUP_TRADES = [
  { ts: "2026-06-03", side: "buy" as const, ticker: "AMZN", quantity: 1, price: 602.0, rationale: "Renfort avant résultats AWS — saisi par un membre." },
  { ts: "2026-05-20", side: "sell" as const, ticker: "MSTR", quantity: 1, price: 415.0, rationale: "Prise de bénéfice partielle, volatilité bitcoin." },
  { ts: "2026-05-12", side: "buy" as const, ticker: "RMS.PA", quantity: 1, price: 201.81, rationale: "Initiation luxe premium." },
];

// ── Radar de marché (signaux quantitatifs par titre) — démo ───────────
export const DEMO_SIGNALS: MarketSignals = {
  updated: new Date().toISOString(),
  regime: {
    label: "RISK-ON SAIN",
    score: 0.62,
    cash_floor: 0.1,
    fear_greed: 58,
    flags: ["10Y-2Y positif", "spreads HY contenus"],
    ok: true,
  },
  tickers: {
    NVDA: {
      ticker: "NVDA", asof: "2026-06-06", price: 1180, currency: "USD",
      momentum_12_1: { value: 0.41, sign: "positif", overheated: true, ok: true },
      rsi_14: { value: 78, zone: "suracheté", ok: true },
      rel_volume: { value: 1.9, ok: true },
      range_52w: { value: 0.96, zone: "proche plus-haut", ok: true },
      insider_90d: { buys: 0, sells: 3, ratio: 0, ok: true },
      fscore: { score: 8 }, eps_surprise: { value: 0.12 }, revenue_growth: { value: 0.42 },
      gate: { verdict: "ambre", composite: 0.55, coverage: 0.9, reasons: ["momentum en surchauffe", "RSI suracheté"] },
    },
    VRT: {
      ticker: "VRT", asof: "2026-06-06", price: 112, currency: "USD",
      momentum_12_1: { value: 0.22, sign: "positif", overheated: false, ok: true },
      rsi_14: { value: 61, zone: "fort", ok: true },
      rel_volume: { value: 1.1, ok: true },
      range_52w: { value: 0.71, zone: "moitié haute", ok: true },
      insider_90d: { buys: 2, sells: 0, ratio: 1, ok: true },
      fscore: { score: 7 }, eps_surprise: { value: 0.08 }, revenue_growth: { value: 0.24 },
      gate: { verdict: "vert", composite: 0.68, coverage: 0.9, reasons: [] },
    },
    ASML: {
      ticker: "ASML", asof: "2026-06-06", price: 690, currency: "EUR",
      momentum_12_1: { value: -0.06, sign: "négatif", overheated: false, ok: true },
      rsi_14: { value: 41, zone: "neutre", ok: true },
      rel_volume: { value: 0.8, ok: true },
      range_52w: { value: 0.38, zone: "moitié basse", ok: true },
      insider_90d: null,
      fscore: { score: 6 }, eps_surprise: { value: -0.03 }, revenue_growth: { value: 0.11 },
      gate: { verdict: "vert", composite: 0.52, coverage: 0.8, reasons: [] },
    },
    MSTR: {
      ticker: "MSTR", asof: "2026-06-06", price: 196, currency: "USD",
      momentum_12_1: { value: 0.05, sign: "positif", overheated: false, ok: true },
      rsi_14: { value: 28, zone: "survendu", ok: true },
      rel_volume: { value: 2.4, ok: true },
      range_52w: { value: 0.12, zone: "proche plus-bas", ok: true },
      insider_90d: { buys: 1, sells: 1, ratio: 0.5, ok: true },
      fscore: { score: 3 }, eps_surprise: null, revenue_growth: { value: -0.05 },
      gate: { verdict: "rouge", composite: 0.28, coverage: 0.7, reasons: ["F-Score faible (3)", "près du plus-bas 52s"] },
    },
    SAF: {
      ticker: "SAF.PA", asof: "2026-06-06", price: 298.5, currency: "EUR",
      momentum_12_1: { value: 0.13, sign: "positif", overheated: false, ok: true },
      rsi_14: { value: 67, zone: "fort", ok: true },
      rel_volume: { value: 0.75, ok: true },
      range_52w: { value: 0.47, zone: "moitié basse", ok: true },
      insider_90d: null,
      fscore: null, eps_surprise: null, revenue_growth: null,
      gate: { verdict: "vert", composite: 0.27, coverage: 0.39, reasons: [] },
    },
  },
  data_gaps: ["fscore/earnings indisponibles pour les valeurs EU (clé FMP)"],
};

// ── Pouls du marché (Grok/X) — démo, 3 semaines pour illustrer la navigation ──
export const DEMO_GROK_PULSE: GrokPulseWeek[] = [
  {
    week: "2026-W24",
    date: "2026-06-08",
    label: "Semaine du 8 juin 2026",
    headline: "L'infra IA garde la main ; la défense EU reste un fil conducteur, le GLP-1 sous pression.",
    themes: [
      {
        title: "Rotation vers les « pioches et pelles » de l'IA",
        detail: "Le marché délaisse les noms purs au profit de l'énergie, du refroidissement et des réseaux qui alimentent les data centers.",
        tickers: ["VRT", "NVDA"],
        corroborated: true,
      },
      {
        title: "Budgets défense européens revus à la hausse",
        detail: "Plusieurs annonces de commandes et de hausses de budget alimentent un cycle pluriannuel — porteur pour HO.PA et SAF.PA.",
        tickers: ["HO.PA", "SAF.PA"],
        corroborated: true,
      },
      {
        title: "Buzz spéculatif autour des proxies bitcoin",
        detail: "Forte agitation sur X autour des trésoreries bitcoin — narratif, pas de flux durs derrière. À traiter en contrarien.",
        tickers: ["MSTR"],
        corroborated: false,
      },
    ],
    movers: [
      { ticker: "NOVOB", direction: "down", reason: "Inquiétudes sur la concurrence GLP-1 et la guidance.", held: true },
      { ticker: "BNP.PA", direction: "up", reason: "Pentification de la courbe favorable aux banques.", held: true },
      { ticker: "VRT", direction: "up", reason: "Carnet de commandes data centers solide.", held: false },
    ],
    sources: ["Grok/X", "recoupé: FRED (courbe), communiqués défense"],
  },
  {
    week: "2026-W23",
    date: "2026-06-01",
    label: "Semaine du 1er juin 2026",
    headline: "Marché en attente du FOMC ; le luxe se stabilise, l'EV reste sous pression sur les prix.",
    themes: [
      {
        title: "Attentisme avant la décision de taux",
        detail: "Faible conviction directionnelle, volumes en baisse ; le growth de qualité tient mieux que la moyenne.",
        tickers: ["AMZN"],
        corroborated: true,
      },
      {
        title: "Guerre des prix persistante sur l'EV",
        detail: "Pression continue sur les marges des constructeurs ; BYD mieux placé grâce à son intégration verticale.",
        tickers: ["BYD"],
        corroborated: true,
      },
    ],
    movers: [
      { ticker: "RMS.PA", direction: "up", reason: "Rebond du luxe premium après des données de demande rassurantes.", held: true },
      { ticker: "SAP", direction: "down", reason: "Doutes persistants sur le rythme de bascule cloud (RISE).", held: true },
    ],
    sources: ["Grok/X", "recoupé: FMP sector-performance"],
  },
  {
    week: "2026-W22",
    date: "2026-05-25",
    label: "Semaine du 25 mai 2026",
    headline: "Résultats AMZN bien reçus ; l'appétit pour le risque progresse sans euphorie.",
    themes: [
      {
        title: "AWS rassure sur la marge",
        detail: "La guidance cloud confirme la thèse de levier sur la marge du groupe — soutien pour le growth de qualité.",
        tickers: ["AMZN"],
        corroborated: true,
      },
    ],
    movers: [
      { ticker: "AMZN", direction: "up", reason: "Guidance AWS solide, thèse confirmée.", held: true },
      { ticker: "MSTR", direction: "down", reason: "Repli du bitcoin, prime sur NAV qui se comprime.", held: true },
    ],
    sources: ["Grok/X", "recoupé: 8-K AMZN"],
  },
];

// Radar crypto de démonstration (CoinGecko + Fear & Greed).
export const DEMO_CRYPTO: CryptoFile = {
  updated: "2026-06-08",
  market: {
    total_market_cap_eur: 1968453478911,
    total_volume_eur: 85093408879,
    market_cap_change_24h_pct: 2.28,
    btc_dominance_pct: 56.2,
    eth_dominance_pct: 9.0,
  },
  fear_greed: { value: 8, classification: "Extreme Fear" },
  sentiment_read: "peur extrême — zone contrarienne potentielle (à corroborer)",
  coins: [
    { id: "bitcoin", symbol: "BTC", name: "Bitcoin", price_eur: 55037, market_cap_eur: 1103523531243, change_24h_pct: 2.24, change_7d_pct: -9.87, change_30d_pct: -19.42 },
    { id: "ethereum", symbol: "ETH", name: "Ethereum", price_eur: 1460.26, market_cap_eur: 176580516180, change_24h_pct: 3.41, change_7d_pct: -13.63, change_30d_pct: -25.4 },
    { id: "binancecoin", symbol: "BNB", name: "BNB", price_eur: 522.99, market_cap_eur: 70574937207, change_24h_pct: 1.58, change_7d_pct: -10.31, change_30d_pct: -4.71 },
    { id: "ripple", symbol: "XRP", name: "XRP", price_eur: 1.92, market_cap_eur: 109000000000, change_24h_pct: 0.9, change_7d_pct: -7.2, change_30d_pct: -12.1 },
    { id: "solana", symbol: "SOL", name: "Solana", price_eur: 118.4, market_cap_eur: 62000000000, change_24h_pct: 4.1, change_7d_pct: -15.8, change_30d_pct: -28.3 },
  ],
};

// Convictions de démonstration (verdicts du deep-dive du mercredi).
export const DEMO_CONVICTIONS: ConvictionsFile = {
  updated: "2026-06-08",
  items: [
    { ticker: "VRT", name: "Vertiv", verdict: "Acheter", confidence: "Haute", horizon: "coeur", thesis: "Pioches & pelles de l'IA : refroidissement/énergie des data centers, carnet de commandes solide.", risk: "Décélération du capex hyperscalers ou concurrence prix sur le thermique.", date: "2026-06-04" },
    { ticker: "ASML", name: "ASML", verdict: "Surveiller", confidence: "Moyenne", horizon: "coeur", thesis: "Monopole EUV, mais valorisation tendue après le rebond — attendre un meilleur point d'entrée.", risk: "Cyclicité des commandes mémoire/fonderie.", date: "2026-06-04" },
    { ticker: "MSTR", name: "MicroStrategy", verdict: "Éviter", confidence: "Haute", horizon: "tactique", thesis: "Proxy bitcoin à effet de levier : la prime sur la NAV se comprime, narratif X non corroboré.", risk: "Rebond brutal du bitcoin (à traiter en contrarien).", date: "2026-06-04" },
  ],
};
