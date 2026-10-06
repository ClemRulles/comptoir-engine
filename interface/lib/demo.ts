import type { AiFundFile, Calibration, ClubMember, Contribution, ConvictionsFile, CryptoFile, Decision, DigestFile, GrokPulseWeek, MarketSignals, NewsFile, ProsFile } from "./types";

// Données de DÉMONSTRATION (affichées tant que Supabase n'est pas branché).
// Clairement étiquetées « Démo » dans l'UI — remplacées par les vraies données en prod.
// Instantané fidèle à l'état réel début octobre 2026 (cours Yahoo, books, 13F SEC réels) ;
// les dates sont RELATIVES à aujourd'hui pour que la démo ne vieillisse pas.

const DAY = 86_400_000;
const iso = (d: Date) => d.toISOString().slice(0, 10);
const daysAgo = (n: number) => iso(new Date(Date.now() - n * DAY));
const inDays = (n: number) => iso(new Date(Date.now() + n * DAY));
export const DEMO_INCEPTION_DAYS = 120;

// Cours € (par part) des titres des deux books.
export const DEMO_PRICES: Record<string, number> = {
  // book du groupe (quantité 1 par ligne → cours = valeur de la ligne)
  "SAF.PA": 813.87, "HO.PA": 695.8, AMZN: 718.84, NFLX: 519.57, EIMI: 470.17, AI: 442.08,
  LOTB: 463.65, BYD: 340.43, CI2: 360.25, "BNP.PA": 339.07, "SGO.PA": 257.4, SAP: 280.03,
  NOVOB: 214.45, MSTR: 273.62, "RMS.PA": 115.73,
  // book IA (vraies parts)
  EME: 693.24, CB: 294.03, GVA: 105.78, MSCI: 491.41, CEG: 238.1, "GLE.PA": 68.13,
  "IWDA.AS": 131.6, "BTC-EUR": 76578.84, "ETH-EUR": 2417.46, RTX: 163.99,
};
// Clés « book IA » distinctes pour les titres communs aux deux books (cours réels par part).
const AI_PX: Record<string, number> = { "SAF.PA": 331.6, AMZN: 223.67, EIMI: 49.97, AI: 168.92, LOTB: 12220, "BNP.PA": 95.13 };

// Positions réelles du groupe (Trade Republic) — coût base € par ligne (portfolio.md).
const GROUP_BOOK = [
  { ticker: "SAF.PA", quantity: 1, avg_cost: 805.2 },
  { ticker: "HO.PA", quantity: 1, avg_cost: 805.04 },
  { ticker: "AMZN", quantity: 1, avg_cost: 602.0 },
  { ticker: "NFLX", quantity: 1, avg_cost: 742.03 },
  { ticker: "EIMI", quantity: 1, avg_cost: 401.0 },
  { ticker: "AI", quantity: 1, avg_cost: 402.54 },
  { ticker: "LOTB", quantity: 1, avg_cost: 300.99 },
  { ticker: "BYD", quantity: 1, avg_cost: 401.08 },
  { ticker: "CI2", quantity: 1, avg_cost: 401.0 },
  { ticker: "BNP.PA", quantity: 1, avg_cost: 252.0 },
  { ticker: "SGO.PA", quantity: 1, avg_cost: 352.46 },
  { ticker: "SAP", quantity: 1, avg_cost: 401.0 },
  { ticker: "NOVOB", quantity: 1, avg_cost: 301.15 },
  { ticker: "MSTR", quantity: 1, avg_cost: 402.0 },
  { ticker: "RMS.PA", quantity: 1, avg_cost: 201.81 },
];

export const DEMO_GROUP = {
  name: "Fonds du groupe",
  startCapital: 10417.28,
  cash: 4108,
  holdings: GROUP_BOOK,
};

// Book IA : les 12 lignes réelles + l'état visé par le mandat (socle, crypto, un coup tactique,
// cash ramené vers 10 %). Les titres communs avec le groupe utilisent leur cours par part.
type P = AiFundFile["positions"][number];
const pos = (p: P): P => p;
const AI_POSITIONS: P[] = [
  pos({ ticker: "EME", quantity: 1.09, avg_cost: 662.33, entry_price: 662.33, confidence: "Moyenne", horizon: "coeur", sleeve: "coeur", desk: "desk-industrie-energie", sector: "Industrie", entry_date: daysAgo(38), thesis: "EMCOR installe l'électricité et la climatisation des data centers : carnet de commandes +44 % sur un an, marges deux fois plus élevées que le génie civil.", exit_rule: "Sortie si la marge passe durablement sous 8 % ou si le carnet recule de 15 %." }),
  pos({ ticker: "CB", quantity: 2.4, avg_cost: 292.6, entry_price: 292.6, confidence: "Moyenne", horizon: "coeur", sleeve: "coeur", desk: "desk-finance", sector: "Assurance", entry_date: daysAgo(17), thesis: "Chubb, le meilleur assureur au monde sur la rentabilité technique, gagne plus quand les taux montent : son matelas de 100 Md$ se replace mieux.", exit_rule: "Sortie si l'assurance perd de l'argent deux trimestres de suite." }),
  pos({ ticker: "AMZN", quantity: 3.1138, avg_cost: 208.8, entry_price: 219.5, entry_price_source: "clone 2026-06-08", confidence: "Moyenne", horizon: "coeur", sleeve: "coeur", desk: "desk-tech", sector: "Tech", entry_date: daysAgo(120), thesis: "AWS accélère (+37 % au T2) et la pub dope les marges : le cloud reste le moteur, l'investissement massif prépare la suite.", exit_rule: "Sortie si la croissance d'AWS passe sous 25 % ou si les investissements sont coupés de 15 %." }),
  pos({ ticker: "GVA", quantity: 6.57, avg_cost: 110.33, entry_price: 110.33, confidence: "Moyenne", horizon: "coeur", sleeve: "coeur", desk: "desk-industrie-energie", sector: "Infrastructures", entry_date: daysAgo(52), thesis: "Granite construit routes et data centers aux États-Unis : carnet record de 7,4 Md$, marges qui s'améliorent, 17 fois les bénéfices.", exit_rule: "Sortie si le carnet passe sous 6,5 Md$ ou si la marge retombe sous 10 %." }),
  pos({ ticker: "SAF.PA", quantity: 2.0929, avg_cost: 324.6, entry_price: 312.48, entry_price_source: "clone 2026-06-08", confidence: "Moyenne", horizon: "coeur", sleeve: "coeur", desk: "desk-industrie-energie", sector: "Aéronautique", entry_date: daysAgo(120), thesis: "Safran vit de la maintenance des moteurs d'avions : revenus récurrents +29 %, marge record, objectifs relevés.", exit_rule: "Sortie si la maintenance ralentit sous +20 % ou si l'objectif de marge est coupé." }),
  pos({ ticker: "MSCI", quantity: 1.36, avg_cost: 535.4, entry_price: 535.4, confidence: "Moyenne", horizon: "coeur", sleeve: "coeur", desk: "desk-finance", sector: "Services financiers", entry_date: daysAgo(115), thesis: "Quasi-monopole des indices boursiers : 95 % des clients renouvellent chaque année, et la valorisation est sous sa moyenne historique.", exit_rule: "Sortie si le taux de renouvellement passe sous 93 %." }),
  pos({ ticker: "CEG", quantity: 2.465, avg_cost: 252.49, entry_price: 252.49, confidence: "Moyenne", horizon: "coeur", sleeve: "coeur", desk: "desk-industrie-energie", sector: "Énergie", entry_date: daysAgo(108), thesis: "Premier producteur nucléaire américain : Microsoft, Meta et Amazon lui achètent son électricité sur 20 ans pour leurs data centers.", exit_rule: "Sortie si les géants de la tech coupent leurs investissements ou si le redémarrage de Crane glisse d'un an." }),
  pos({ ticker: "AI", quantity: 3.0794, avg_cost: 165.25, entry_price: 167.79, entry_price_source: "clone 2026-06-08", confidence: "Moyenne", horizon: "coeur", sleeve: "coeur", desk: "desk-industrie-energie", sector: "Chimie", entry_date: daysAgo(120), thesis: "Air Liquide, valeur défensive qui compose : contrats de 15 ans indexés, rentabilité du capital au-dessus de 10 %.", exit_rule: "Sortie si la rentabilité passe durablement sous 8 %." }),
  pos({ ticker: "LOTB", quantity: 0.0394, avg_cost: 7642.82, entry_price: 10940, entry_price_source: "clone 2026-06-08", confidence: "Moyenne", horizon: "coeur", sleeve: "coeur", desk: "desk-conso", sector: "Consommation", entry_date: daysAgo(120), thesis: "Lotus (Biscoff) : une marque premium qui gagne des parts dans le monde, mais payée cher (44 fois les bénéfices) — d'où une petite ligne.", exit_rule: "Alléger si la valorisation dépasse 55 fois les bénéfices sans accélération des ventes." }),
  pos({ ticker: "BNP.PA", quantity: 3.7222, avg_cost: 67.7, entry_price: 93.66, entry_price_source: "clone 2026-06-08", confidence: "Moyenne", horizon: "coeur", sleeve: "coeur", desk: "desk-finance", sector: "Banque", entry_date: daysAgo(120), thesis: "BNP profite de taux plus élevés : bénéfice +33 % au T2, banque diversifiée et peu chère.", exit_rule: "Sortie si le risque de crédit des banques européennes s'envole." }),
  pos({ ticker: "GLE.PA", quantity: 1.01, avg_cost: 66.08, entry_price: 66.08, confidence: "Basse", horizon: "coeur", sleeve: "coeur", desk: "desk-finance", sector: "Banque", entry_date: daysAgo(10), thesis: "Société Générale se paie sous la valeur de ses actifs alors que sa rentabilité remonte à 12 % : pari de rattrapage, en petite taille.", exit_rule: "Sortie si la rentabilité repasse sous 8 %." }),
  pos({ ticker: "EIMI", quantity: 9.7751, avg_cost: 41.02, entry_price: 46.52, entry_price_source: "clone 2026-06-08", confidence: "Moyenne", horizon: "coeur", sleeve: "socle", desk: "desk-macro", sector: "ETF Émergents", entry_date: daysAgo(120), thesis: "Les marchés émergents en un seul ETF : diversification hors États-Unis et Europe.", exit_rule: "Rééquilibrage seulement — pas de pari sur un titre." }),
  pos({ ticker: "IWDA.AS", quantity: 9, avg_cost: 130.4, entry_price: 130.4, confidence: "Moyenne", horizon: "coeur", sleeve: "socle", desk: "desk-macro", sector: "ETF Monde", entry_date: daysAgo(3), thesis: "Le MSCI World porte l'exposition au marché en attendant que les convictions trouvent leur prix d'achat.", exit_rule: "Vendu en premier pour financer une nouvelle conviction." }),
  pos({ ticker: "BTC-EUR", quantity: 0.0072, avg_cost: 75100, entry_price: 75100, confidence: "Moyenne", horizon: "coeur", sleeve: "crypto", desk: "desk-crypto", sector: "Crypto", entry_date: daysAgo(2), thesis: "Premier palier de la poche crypto : Bitcoin d'abord, acheté par étapes plutôt qu'en une fois.", exit_rule: "Pas de stop de prix : sortie si la détention devient interdite en Europe." }),
  pos({ ticker: "ETH-EUR", quantity: 0.12, avg_cost: 2380, entry_price: 2380, confidence: "Basse", horizon: "coeur", sleeve: "crypto", desk: "desk-crypto", sector: "Crypto", entry_date: daysAgo(2), thesis: "Ether, la deuxième brique de la poche crypto, en plus petite taille que Bitcoin.", exit_rule: "Pas de stop de prix : sortie sur faille majeure du protocole." }),
  pos({ ticker: "RTX", quantity: 2.4, avg_cost: 160.2, entry_price: 160.2, confidence: "Moyenne", horizon: "tactique", sleeve: "tactique", desk: "desk-tactique", sector: "Défense", entry_date: daysAgo(6), thesis: "Raytheon avant ses résultats du 20 : carnet record de 289 Md$, action revenue au plus bas après la trêve.", exit_rule: "Stop à −15 % ; sortie au plus tard 10 jours après les résultats." }),
];
// Cours côté IA : les titres communs au groupe sont valorisés à leur cours PAR PART.
export const DEMO_AI_PRICES: Record<string, number> = { ...DEMO_PRICES, ...AI_PX };

export const DEMO_AI: AiFundFile = {
  as_of: daysAgo(2),
  seeded: true,
  start_capital: 10417.28,
  cash: 1054.4,
  positions: AI_POSITIONS,
  trades: [
    { ts: daysAgo(120), side: "buy", ticker: "SEED", quantity: 0, price: 0, rationale: "Départ : le book IA clone le groupe (mêmes lignes, même cash)." },
    { ts: daysAgo(114), side: "sell", ticker: "MSTR", quantity: 1.355, price: 103.78, confidence: "Basse", horizon: "tactique", rationale: "Proxy bitcoin à levier : fondamentaux au plus bas et prime effondrée — thèse cassée, sortie." },
    { ts: daysAgo(115), side: "buy", ticker: "MSCI", quantity: 1.36, price: 535.4, confidence: "Moyenne", horizon: "coeur", sleeve: "coeur", desk: "desk-finance", rationale: "Quasi-monopole des indices, 95 % de clients fidèles, valorisation sous sa moyenne : première conviction propre." },
    { ts: daysAgo(108), side: "buy", ticker: "CEG", quantity: 2.926, price: 252.49, confidence: "Moyenne", horizon: "coeur", sleeve: "coeur", desk: "desk-industrie-energie", rationale: "Le nucléaire alimente l'IA : contrats de 20 ans avec Microsoft et Meta, action en repli de 35 % sur son plus haut." },
    { ts: daysAgo(52), side: "buy", ticker: "GVA", quantity: 6.57, price: 110.33, confidence: "Moyenne", horizon: "coeur", sleeve: "coeur", desk: "desk-industrie-energie", rationale: "Le pari marges de Granite est livré (12,8 %), carnet record : relais de CRH sur les infrastructures américaines, moins cher." },
    { ts: daysAgo(38), side: "buy", ticker: "EME", quantity: 1.09, price: 662.33, confidence: "Moyenne", horizon: "coeur", sleeve: "coeur", desk: "desk-industrie-energie", rationale: "EMCOR équipe l'intérieur des data centers : complémentaire de Granite, carnet +44 %, croissance raisonnablement payée." },
    { ts: daysAgo(17), side: "buy", ticker: "CB", quantity: 2.4, price: 292.6, confidence: "Moyenne", horizon: "coeur", sleeve: "coeur", desk: "desk-finance", rationale: "La Fed a remonté ses taux : Chubb replace mieux ses 100 Md$ de réserves. Diversifie un book sans assureur." },
    { ts: daysAgo(10), side: "buy", ticker: "GLE.PA", quantity: 1.01, price: 66.08, confidence: "Basse", horizon: "coeur", sleeve: "coeur", desk: "desk-finance", rationale: "Banque décotée dont la rentabilité remonte : petite ligne de rattrapage, confiance basse assumée." },
    { ts: daysAgo(6), side: "buy", ticker: "RTX", quantity: 2.4, price: 160.2, confidence: "Moyenne", horizon: "tactique", sleeve: "tactique", desk: "desk-tactique", rationale: "Coup daté avant résultats : action au plus bas après la trêve, carnet de commandes record. Stop −15 %, sortie 10 jours après les résultats." },
    { ts: daysAgo(3), side: "buy", ticker: "IWDA.AS", quantity: 9, price: 130.4, confidence: "Moyenne", horizon: "coeur", sleeve: "socle", desk: "desk-macro", rationale: "Le cash dépassait 30 % : premier palier vers 10 %. Sans conviction au bon prix, le surplus va à l'indice mondial." },
    { ts: daysAgo(2), side: "buy", ticker: "BTC-EUR", quantity: 0.0072, price: 75100, confidence: "Moyenne", horizon: "coeur", sleeve: "crypto", desk: "desk-crypto", rationale: "Premier palier de la poche crypto (5 % visés en marché qui chauffe), acheté un dimanche de repli." },
    { ts: daysAgo(2), side: "buy", ticker: "ETH-EUR", quantity: 0.12, price: 2380, confidence: "Basse", horizon: "coeur", sleeve: "crypto", desk: "desk-crypto", rationale: "Ether en complément de Bitcoin, taille plus petite : la poche reste majoritairement en Bitcoin." },
  ],
  note: "Données de démonstration — instantané début octobre 2026.",
};

// Série NAV JOURNALIÈRE (jours ouvrés) qui finit EXACTEMENT sur les NAV affichées par les cartes.
// Les deux fonds sont confondus jusqu'à la 1re décision indépendante de l'IA (clone à t0).
export function demoSeries(
  groupNav: number,
  aiNav: number,
  start: number,
  contributions: { date: string; amount: number }[]
): { date: string; group: number; ai: number }[] {
  const dates: string[] = [];
  for (let k = DEMO_INCEPTION_DAYS; k >= 0; k--) {
    const d = new Date(Date.now() - k * DAY);
    const w = d.getUTCDay();
    if (w !== 0 && w !== 6) dates.push(iso(d));
  }
  const N = dates.length;
  const shape = (i: number, a: number, b: number, c: number) =>
    Math.sin(i * a) * 0.006 + Math.sin(i * b + 1) * 0.014 - Math.exp(-Math.pow((i / N - c) * 7, 2)) * 0.012;
  const build = (drift: number, a: number, b: number, c: number) => {
    const out: number[] = [];
    let nav = start;
    for (let i = 0; i < N; i++) {
      if (i > 0) {
        const flow = contributions.filter((f) => f.date > dates[i - 1] && f.date <= dates[i]).reduce((s, f) => s + f.amount, 0);
        nav = nav * (1 + drift + shape(i, a, b, c) - shape(i - 1, a, b, c)) + flow;
      }
      out.push(nav);
    }
    return out;
  };
  const solve = (target: number, a: number, b: number, c: number) => {
    let lo = -0.01, hi = 0.01;
    for (let it = 0; it < 60; it++) {
      const mid = (lo + hi) / 2;
      if (build(mid, a, b, c)[N - 1] < target) lo = mid; else hi = mid;
    }
    return build((lo + hi) / 2, a, b, c);
  };
  const g = solve(groupNav, 0.21, 0.07, 0.55);
  const a = solve(aiNav, 0.17, 0.05, 0.62);
  const split = Math.min(4, N - 1);
  return dates.map((date, i) => ({
    date,
    group: Math.round(g[i] * 100) / 100,
    ai: Math.round((i <= split ? g[i] : a[i]) * 100) / 100,
  }));
}

// Indice MSCI World € (forme réelle de l'IWDA sur la période : ~+6,7 %).
export function DEMO_MARKET(dates: string[]): Record<string, number> {
  const out: Record<string, number> = {};
  const N = dates.length;
  dates.forEach((d, i) => {
    const t = i / Math.max(1, N - 1);
    out[d] = 123.3 * (1 + 0.067 * t + Math.sin(i * 0.13) * 0.008 - Math.exp(-Math.pow((t - 0.35) * 6, 2)) * 0.018);
  });
  return out;
}

export const DEMO_BRIEF = `# Brief de la semaine — démo

> Marché qui chauffe (taux à 10 ans ~5,2 %, hausse de la Fed probable fin octobre) : on reste investi, mais on n'achète qu'avec une vraie marge de sécurité.

## Ce qui a changé
- **Cash ramené de 35 % vers 10 %** : premier palier sur l'indice mondial, poche crypto lancée.
- **Un coup tactique daté** : Raytheon avant ses résultats, stop −15 %.

## En une phrase
On arrête de payer le prix d'être trop prudent : investi, diversifié, chaque achat a son prix plafond.`;

// La semaine EN CLAIR (digest.json) — démo.
export const DEMO_DIGEST: DigestFile = {
  updated: daysAgo(3),
  week: "2026-W41",
  posture: { label: "Investi mais sélectif", tone: "neutre", line: "Les taux montent : on garde des entreprises solides, on remet le cash au travail et on n'achète rien au-dessus de son prix plafond." },
  headline: "Le book arrête de payer sa prudence : le cash passe de 35 % à 10 %, par paliers.",
  points: [
    { title: "Les taux restent le sujet", text: "La Fed devrait encore monter ses taux fin octobre. Ça pèse sur les valeurs chères, ça aide nos assureurs et nos banques.", kind: "marche" },
    { title: "Le cash se remet au travail", text: "35 % de cash coûtaient environ 6 points contre l'indice depuis juin. Premier palier : indice mondial et début de poche crypto.", kind: "portefeuille" },
    { title: "Trois résultats à suivre", text: "Chubb, Raytheon puis Granite publient d'ici début novembre : ce sont les tests de nos thèses, pas des paris.", kind: "risque" },
  ],
  decisions: [
    { date: daysAgo(2), ticker: "BTC-EUR", name: "Bitcoin", action: "achat", sleeve: "crypto", desk: "desk-crypto", why: "Premier palier de la poche crypto, acheté par étapes : 5 % visés tant que le marché chauffe.", risk: "Une interdiction de détention en Europe.", confidence: "Moyenne", amount_eur: 540.7, weight_pct: 0.052 },
    { date: daysAgo(3), ticker: "IWDA.AS", name: "MSCI World", action: "achat", sleeve: "socle", desk: "desk-macro", why: "Le cash dépassait 30 % : sans conviction au bon prix, le surplus va à l'indice mondial plutôt que de dormir.", risk: "Rien : c'est la position par défaut, vendue en premier pour financer une conviction.", confidence: "Moyenne", amount_eur: 1173.6, weight_pct: 0.113 },
    { date: daysAgo(6), ticker: "RTX", name: "Raytheon", action: "achat", sleeve: "tactique", desk: "desk-tactique", why: "Action au plus bas après la trêve au Moyen-Orient alors que le carnet de commandes est record : on joue les résultats.", risk: "Stop à −15 % ; sortie 10 jours après les résultats.", confidence: "Moyenne", amount_eur: 384.5, weight_pct: 0.037 },
    { date: daysAgo(6), ticker: "MCO", name: "Moody's", action: "surveiller", sleeve: "coeur", desk: "desk-finance", why: "Excellente entreprise, mais trop chère aujourd'hui : on achètera si le cours revient sous 420 $.", risk: "Une récession qui ferait chuter les émissions d'obligations.", confidence: "Moyenne" },
  ],
  next: [
    { date: inDays(14), label: "Résultats Chubb", why: "Test de la thèse assurance + taux." },
    { date: inDays(14), label: "Résultats Raytheon", why: "Sortie du coup tactique au plus tard 10 jours après." },
    { date: inDays(21), label: "Décision de la Fed", why: "Hausse attendue : banques et assureurs favorisés." },
    { date: inDays(30), label: "Résultats Granite", why: "Carnet de commandes et marges : la thèse se joue là." },
  ],
  in_one_sentence: "Investi, diversifié, et chaque achat a désormais son prix plafond.",
};

// Le monde en clair (news.json) — démo, faits repris des fichiers mémoire du moteur.
export const DEMO_NEWS: NewsFile = {
  updated: daysAgo(0),
  items: [
    { id: "fed-hausse-octobre", date: daysAgo(1), category: "banques-centrales", title: "La Fed se prépare à remonter ses taux fin octobre", summary: "Les marchés donnent ~70 % de chances à une hausse lors de la réunion des 27-28 octobre ; le taux à 10 ans américain tient vers 5,2 %, un sommet depuis 2007.", why: "Des taux plus hauts rendent les actions chères moins attractives et profitent aux banques et assureurs.", impact: [{ target: "CB", kind: "ticker", direction: "positif", held: true }, { target: "BNP.PA", kind: "ticker", direction: "positif", held: true }, { target: "Valeurs de croissance chères", kind: "secteur", direction: "negatif" }], ai_take: "On garde nos financières et on n'achète aucune valeur chère avant la décision.", importance: 1, sources: [{ name: "CME FedWatch / Kalshi" }, { name: "FRED (T10Y)" }] },
    { id: "tarifs-section-301", date: daysAgo(5), category: "politique-us", title: "Washington remplace ses tarifs d'urgence par des tarifs ciblés", summary: "L'administration Trump bascule les droits de douane temporaires vers des tarifs « Section 301 » de 10 à 12,5 % sur une liste de produits, avec un calendrier d'application.", why: "Des tarifs prévisibles valent mieux que des tarifs surprises : le choc est connu, mais il pèse sur les exportateurs.", impact: [{ target: "EIMI", kind: "ticker", direction: "incertain", held: true }, { target: "Industriels exportateurs", kind: "secteur", direction: "negatif" }], ai_take: "Effet jugé neutre pour nos émergents ; on surveille les industriels européens exportateurs.", importance: 1, sources: [{ name: "USTR" }] },
    { id: "nucleaire-ppa-hyperscalers", date: daysAgo(4), category: "energie", title: "Amazon signe à son tour un contrat nucléaire de 20 ans", summary: "Après Microsoft et Meta, Amazon réserve 690 MW de la centrale de Calvert Cliffs pour ses data centers : quatre géants de la tech ont désormais signé des contrats nucléaires longs.", why: "L'électricité devient le goulot de l'IA : les producteurs bas carbone sécurisent des revenus sur deux décennies.", impact: [{ target: "CEG", kind: "ticker", direction: "positif", held: true }], ai_take: "Confirme la thèse Constellation ; pas de renfort tant que la dette (rachat de Calpine) n'est pas digérée.", importance: 1, sources: [{ name: "Communiqué Constellation" }] },
    { id: "petrole-hormuz-treve", date: daysAgo(6), category: "geopolitique", title: "Trêve fragile au Moyen-Orient, pétrole toujours vers 107 $", summary: "Un cessez-le-feu ralentit le rallye des valeurs de défense ; le Brent reste élevé car le détroit d'Ormuz n'est pas pleinement sécurisé.", why: "Un pétrole cher entretient l'inflation, donc des taux hauts ; la trêve a fait baisser les valeurs de défense.", impact: [{ target: "RTX", kind: "ticker", direction: "incertain", held: true }, { target: "Énergie", kind: "secteur", direction: "positif" }], ai_take: "La baisse de Raytheon a ouvert le coup tactique ; on ne parie pas sur l'issue du conflit.", importance: 2, sources: [{ name: "Reuters" }] },
    { id: "infra-iija-division-j", date: daysAgo(8), category: "politique-us", title: "Infrastructures : le Congrès prolonge le financement des routes", summary: "La loi de financement temporaire maintient les programmes routiers de la loi infrastructures ; seule une enveloppe complémentaire expire en attendant un vote avant le 12 décembre.", why: "Les chantiers déjà signés continuent : le risque de « falaise » budgétaire pour les constructeurs s'éloigne.", impact: [{ target: "GVA", kind: "ticker", direction: "positif", held: true }], ai_take: "Thèse Granite intacte ; décision finale à ses résultats début novembre.", importance: 2, sources: [{ name: "Congress.gov (P.L. 119-416)" }] },
    { id: "buffett-alphabet", date: daysAgo(50), category: "investisseurs", title: "Buffett renforce Alphabet, Ackman entre sur Microsoft", summary: "Les dernières déclarations officielles (13F, 2e trimestre) montrent Berkshire augmenter Alphabet de 83 % et Pershing Square ouvrir une ligne Microsoft à 15 % de son portefeuille.", why: "Deux investisseurs très sélectifs misent sur les géants de la tech rentables plutôt que sur les promesses.", impact: [{ target: "Méga-capitalisations tech", kind: "secteur", direction: "positif" }], ai_take: "Idée à instruire par le desk Tech, pas un signal : la photo date de fin juin.", importance: 3, sources: [{ name: "SEC EDGAR 13F-HR" }] },
    { id: "crypto-greed", date: daysAgo(1), category: "crypto", title: "Le bitcoin rebondit, l'indice de sentiment repasse en « avidité »", summary: "Le Fear & Greed crypto remonte à 73 ; la dominance du bitcoin reste élevée à ~59 %.", why: "L'euphorie précède souvent les replis : c'est le moment d'acheter par petits paliers, pas d'un coup.", impact: [{ target: "BTC-EUR", kind: "ticker", direction: "incertain", held: true }], ai_take: "Palier normal cette semaine ; aucun achat au-dessus de 80 d'avidité.", importance: 3, sources: [{ name: "alternative.me" }, { name: "CoinGecko" }] },
  ],
};

// Investisseurs pros — déclarations 13F réelles (SEC EDGAR, 2e trimestre 2026).
export const DEMO_PROS: ProsFile = {
  updated: daysAgo(0),
  investors: [{"cik": "0001067983", "investor": "Warren Buffett", "fund": "Berkshire Hathaway", "style": "valeur, très long terme", "filed": "2026-08-14", "period": "2026-06-30", "prev_period": "2026-03-31", "n_positions": 26, "top": [{"issuer": "APPLE INC", "weight_pct": 0.2204}, {"issuer": "AMERICAN EXPRESS CO", "weight_pct": 0.1714}, {"issuer": "ALPHABET INC", "weight_pct": 0.1262}, {"issuer": "COCA COLA CO", "weight_pct": 0.1086}, {"issuer": "BANK OF AMER CORP", "weight_pct": 0.092}], "moves": [{"issuer": "ALPHABET INC", "action": "renforce", "weight_pct": 0.1262, "shares_change_pct": 0.8324}, {"issuer": "DELTA AIR LINES INC", "action": "renforce", "weight_pct": 0.0179, "shares_change_pct": 0.4399}, {"issuer": "KROGER CO", "action": "allege", "weight_pct": 0.0072, "shares_change_pct": -0.22}, {"issuer": "LENNAR CORP", "action": "renforce", "weight_pct": 0.0041, "shares_change_pct": 0.2972}, {"issuer": "CAPITAL ONE FINL CORP", "action": "allege", "weight_pct": 0.002, "shares_change_pct": -0.5804}]}, {"cik": "0001336528", "investor": "Bill Ackman", "fund": "Pershing Square", "style": "concentré, activiste", "filed": "2026-05-15", "period": "2026-03-31", "prev_period": "2025-12-31", "n_positions": 10, "top": [{"issuer": "BROOKFIELD CORP", "weight_pct": 0.1762}, {"issuer": "AMAZON COM INC", "weight_pct": 0.1739}, {"issuer": "UBER TECHNOLOGIES INC", "weight_pct": 0.1571}, {"issuer": "MICROSOFT CORP", "weight_pct": 0.1526}, {"issuer": "RESTAURANT BRANDS INTL INC", "weight_pct": 0.122}], "moves": [{"issuer": "MICROSOFT CORP", "action": "nouvelle", "weight_pct": 0.1526, "shares_change_pct": null}, {"issuer": "HILTON WORLDWIDE HLDGS INC", "action": "sortie", "weight_pct": 0, "shares_change_pct": -1}, {"issuer": "ALPHABET INC", "action": "allege", "weight_pct": 0.0072, "shares_change_pct": -0.9497}]}, {"cik": "0001536411", "investor": "Stanley Druckenmiller", "fund": "Duquesne Family Office", "style": "macro, opportuniste", "filed": "2026-08-14", "period": "2026-06-30", "prev_period": "2026-03-31", "n_positions": 85, "top": [{"issuer": "Natera Inc", "weight_pct": 0.1986}, {"issuer": "Taiwan Semiconductor Manufac", "weight_pct": 0.0647}, {"issuer": "Stmicroelectronics N V", "weight_pct": 0.0534}, {"issuer": "Insmed Inc", "weight_pct": 0.0349}, {"issuer": "Fox Corp", "weight_pct": 0.0332}], "moves": [{"issuer": "Amazon Com Inc", "action": "renforce", "weight_pct": 0.0296, "shares_change_pct": 10.8253}, {"issuer": "United Airls Hldgs Inc", "action": "renforce", "weight_pct": 0.0248, "shares_change_pct": 2.0278}, {"issuer": "Seagate Technology Hldngs Pl", "action": "renforce", "weight_pct": 0.027, "shares_change_pct": 1.4063}, {"issuer": "Fox Corp", "action": "nouvelle", "weight_pct": 0.0332, "shares_change_pct": null}, {"issuer": "Alphabet Inc", "action": "nouvelle", "weight_pct": 0.0276, "shares_change_pct": null}]}, {"cik": "0001656456", "investor": "David Tepper", "fund": "Appaloosa", "style": "contrarien, cycle", "filed": "2026-08-14", "period": "2026-06-30", "prev_period": "2026-03-31", "n_positions": 25, "top": [{"issuer": "AMAZON COM INC", "weight_pct": 0.1595}, {"issuer": "MICRON TECHNOLOGY INC", "weight_pct": 0.1506}, {"issuer": "TAIWAN SEMICONDUCTOR MANUFAC", "weight_pct": 0.1055}, {"issuer": "ALPHABET INC", "weight_pct": 0.0875}, {"issuer": "UBER TECHNOLOGIES INC", "weight_pct": 0.0743}], "moves": [{"issuer": "MICRON TECHNOLOGY INC", "action": "allege", "weight_pct": 0.1506, "shares_change_pct": -0.4144}, {"issuer": "META PLATFORMS INC", "action": "renforce", "weight_pct": 0.0509, "shares_change_pct": 0.5464}, {"issuer": "TAIWAN SEMICONDUCTOR MANUFAC", "action": "renforce", "weight_pct": 0.1055, "shares_change_pct": 0.2429}, {"issuer": "SANDISK CORP", "action": "sortie", "weight_pct": 0, "shares_change_pct": -1}, {"issuer": "BOEING CO", "action": "nouvelle", "weight_pct": 0.0232, "shares_change_pct": null}]}, {"cik": "0001061768", "investor": "Seth Klarman", "fund": "Baupost Group", "style": "valeur, marge de sécurité", "filed": "2026-08-13", "period": "2026-06-30", "prev_period": "2026-03-31", "n_positions": 23, "top": [{"issuer": "AMAZON COM INC", "weight_pct": 0.1648}, {"issuer": "ELEVANCE HEALTH INC FORMERLY", "weight_pct": 0.0911}, {"issuer": "RESTAURANT BRANDS INTL INC", "weight_pct": 0.0904}, {"issuer": "ALPHABET INC", "weight_pct": 0.0895}, {"issuer": "FERGUSON ENTERPRISES INC", "weight_pct": 0.0636}], "moves": [{"issuer": "GENUINE PARTS CO", "action": "renforce", "weight_pct": 0.0613, "shares_change_pct": 0.8896}, {"issuer": "WILLIS TOWERS WATSON PLC LTD", "action": "sortie", "weight_pct": 0, "shares_change_pct": -1}, {"issuer": "NORWEGIAN CRUISE LINE HLDGS", "action": "renforce", "weight_pct": 0.0301, "shares_change_pct": 1.1295}, {"issuer": "AMAZON COM INC", "action": "renforce", "weight_pct": 0.1648, "shares_change_pct": 0.2004}, {"issuer": "CME GROUP INC", "action": "nouvelle", "weight_pct": 0.0252, "shares_change_pct": null}]}, {"cik": "0001709323", "investor": "Li Lu", "fund": "Himalaya Capital", "style": "valeur, très concentré", "filed": "2026-08-14", "period": "2026-06-30", "prev_period": "2026-03-31", "n_positions": 7, "top": [{"issuer": "ALPHABET INC", "weight_pct": 0.4794}, {"issuer": "PDD HOLDINGS INC", "weight_pct": 0.2217}, {"issuer": "BERKSHIRE HATHAWAY INC DEL", "weight_pct": 0.1498}, {"issuer": "EAST WEST BANCORP INC", "weight_pct": 0.0968}, {"issuer": "CROCS INC", "weight_pct": 0.0289}], "moves": [{"issuer": "PDD HOLDINGS INC", "action": "renforce", "weight_pct": 0.2217, "shares_change_pct": 1.3353}, {"issuer": "BK OF AMERICA CORP", "action": "sortie", "weight_pct": 0, "shares_change_pct": -1}, {"issuer": "BERKSHIRE HATHAWAY INC DEL", "action": "renforce", "weight_pct": 0.1498, "shares_change_pct": 0.2346}, {"issuer": "OCCIDENTAL PETE CORP", "action": "sortie", "weight_pct": 0, "shares_change_pct": -1}, {"issuer": "S&P GLOBAL INC", "action": "sortie", "weight_pct": 0, "shares_change_pct": -1}]}] as ProsFile["investors"],
};

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

// Apports mensuels (le 5) depuis le départ : 4 membres × 25 €.
export const DEMO_CONTRIBUTIONS: Contribution[] = (() => {
  const out: Contribution[] = [];
  const names = ["Clément", "Henri", "Alex", "Sam"];
  const start = Date.now() - DEMO_INCEPTION_DAYS * DAY;
  const d = new Date(start);
  d.setUTCDate(5);
  if (d.getTime() <= start) d.setUTCMonth(d.getUTCMonth() + 1);
  let k = 0;
  while (d.getTime() <= Date.now()) {
    names.forEach((n, i) => out.push({ id: `c${k}-${i}`, member_id: `m${i + 1}`, member_name: n, ts: iso(d), amount: 25, note: "Apport mensuel" }));
    d.setUTCMonth(d.getUTCMonth() + 1);
    k++;
  }
  return out.reverse();
})();

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

| Date | Événement | Type | Ce qui bouge (secteurs/tickers) | Sens du risque | Analyse de l'IA | Confiance | Statut |
|------|-----------|------|--------------------------------|----------------|-----------------|-----------|--------|
| ${inDays(3)} | Inflation US (CPI) | Macro | taux, croissance, banques | binaire | Pourquoi : une inflation qui résiste ancre la Fed sur une hausse · Prise en compte : aucun achat de valeur chère avant le chiffre · Orientation : si l'inflation ralentit, la tech de qualité redevient achetable dans sa zone | Moyenne | À surveiller |
| ${inDays(14)} | Résultats Chubb (CB) | Micro | CB | binaire | Pourquoi : c'est le test de la thèse « taux hauts = revenus financiers » · Prise en compte : position cœur, pas d'allègement avant · Orientation : thèse confirmée → renfort possible dans la zone 290-325 $ | Moyenne | ACTIF |
| ${inDays(14)} | Résultats Raytheon (RTX) | Micro | RTX | binaire | Pourquoi : le coup tactique se joue sur ce chiffre · Prise en compte : stop −15 % déjà écrit · Orientation : sortie au plus tard 10 jours après la publication | Moyenne | ACTIF |
| ${inDays(21)} | Décision de la Fed | Macro | taux, banques, assureurs, croissance | binaire | Pourquoi : une hausse renchérit le crédit et pèse sur les valeurs chères · Prise en compte : nos financières en profitent, on garde · Orientation : si la Fed fait une pause, on rouvre la porte à la croissance de qualité | Haute | À surveiller |
| ${inDays(30)} | Résultats Granite (GVA) | Micro | GVA | binaire | Pourquoi : carnet de commandes et marges = toute la thèse · Prise en compte : ne pas renforcer avant · Orientation : carnet en recul → sortie | Moyenne | À surveiller |
| ${inDays(67)} | Vote financement infrastructures | Politique | GVA, EME, matériaux | directionnel | Pourquoi : l'enveloppe complémentaire de la loi infrastructures expire sans vote · Prise en compte : risque connu, chantiers signés non concernés · Orientation : pas de vote → on réduit le thème | Basse | À surveiller |

## Archives

| ${daysAgo(9)} | Hausse de taux de la Fed | Macro | banques, assureurs | binaire | Pourquoi : condition d'entrée de Chubb · Prise en compte : achat déclenché après la décision · Orientation : thèse confirmée | Haute | PASSÉ |
`;

// Mouvements récents du book IA (démo) — pour le flux d'activité.
export const DEMO_AI_TRADES = DEMO_AI.trades
  .filter((t) => t.ticker !== "SEED")
  .slice()
  .reverse()
  .map((t) => ({ ts: t.ts, side: t.side, ticker: t.ticker, quantity: t.quantity, price: t.price, rationale: t.rationale, confidence: t.confidence }));

// Trades récents du groupe (démo) — saisis via l'interface par les membres.
export const DEMO_GROUP_TRADES = [
  { ts: daysAgo(12), side: "buy" as const, ticker: "SAF.PA", quantity: 1, price: 331.6, rationale: "Renfort Safran après la hausse des objectifs — saisi par un membre." },
  { ts: daysAgo(40), side: "buy" as const, ticker: "AMZN", quantity: 1, price: 205.0, rationale: "Renfort avant résultats AWS." },
  { ts: daysAgo(75), side: "sell" as const, ticker: "BYD", quantity: 1, price: 9.4, rationale: "Allègement EV, guerre des prix." },
];

// ── Radar de marché (signaux quantitatifs par titre) — démo ───────────
export const DEMO_SIGNALS: MarketSignals = {
  updated: new Date().toISOString(),
  regime: {
    label: "SURCHAUFFE",
    score: { stress: 0, heat: 1 },
    cash_floor: 0.05,
    cash_target: 0.1,
    cash_ceiling: 0.15,
    fear_greed: 58,
    flags: ["inflation élevée (>3 %)", "taux à 10 ans ~5,2 %"],
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
    week: "2026-W41",
    date: daysAgo(0),
    label: "Cette semaine",
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
    week: "2026-W40",
    date: daysAgo(7),
    label: "Semaine dernière",
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
    week: "2026-W39",
    date: daysAgo(14),
    label: "Il y a deux semaines",
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
  updated: daysAgo(0),
  market: {
    total_market_cap_eur: 2610000000000,
    total_volume_eur: 98000000000,
    market_cap_change_24h_pct: 1.4,
    btc_dominance_pct: 58.7,
    eth_dominance_pct: 11.2,
  },
  fear_greed: { value: 73, classification: "Greed" },
  sentiment_read: "avidité — on achète par petits paliers, jamais d'un coup",
  coins: [
    { id: "bitcoin", symbol: "BTC", name: "Bitcoin", price_eur: 76578.84, market_cap_eur: 1523000000000, change_24h_pct: 1.1, change_7d_pct: 4.2, change_30d_pct: 9.8 },
    { id: "ethereum", symbol: "ETH", name: "Ethereum", price_eur: 2417.46, market_cap_eur: 291000000000, change_24h_pct: 2.3, change_7d_pct: 6.1, change_30d_pct: 14.5 },
    { id: "binancecoin", symbol: "BNB", name: "BNB", price_eur: 522.99, market_cap_eur: 70574937207, change_24h_pct: 1.58, change_7d_pct: -10.31, change_30d_pct: -4.71 },
    { id: "ripple", symbol: "XRP", name: "XRP", price_eur: 1.92, market_cap_eur: 109000000000, change_24h_pct: 0.9, change_7d_pct: -7.2, change_30d_pct: -12.1 },
    { id: "solana", symbol: "SOL", name: "Solana", price_eur: 118.4, market_cap_eur: 62000000000, change_24h_pct: 4.1, change_7d_pct: -15.8, change_30d_pct: -28.3 },
  ],
};

// Convictions de démonstration (verdicts du deep-dive du mercredi, avec zone d'achat §N).
export const DEMO_CONVICTIONS: ConvictionsFile = {
  updated: daysAgo(5),
  items: [
    { ticker: "RTX", name: "Raytheon", verdict: "Acheter", confidence: "Moyenne", horizon: "coeur", sleeve: "coeur", desk: "desk-industrie-energie", headline: "Le réarmement américain remplit le carnet de commandes pour sept ans.", thesis: "Carnet record de 289 Md$ dont 119 Md$ en défense, commandes fermes pluriannuelles (missiles Tomahawk, radars).", risk: "Une paix durable au Moyen-Orient qui ralentirait les commandes ; valorisation sans grande marge.", price: 184.33, currency: "USD", buy_zone: { low: 150, high: 180, currency: "USD", basis: "22 fois les bénéfices attendus ; plus bas de 52 semaines" }, date: daysAgo(5) },
    { ticker: "CEG", name: "Constellation Energy", verdict: "Acheter", confidence: "Moyenne", horizon: "coeur", sleeve: "coeur", desk: "desk-industrie-energie", headline: "L'électricité nucléaire vendue 20 ans d'avance aux géants de l'IA.", thesis: "Contrats de 20 ans avec Microsoft, Meta et Amazon ; objectifs de bénéfices relevés.", risk: "La dette du rachat de Calpine coûte plus cher avec des taux hauts.", price: 267.62, currency: "USD", buy_zone: { low: 220, high: 275, currency: "USD", basis: "15 fois les bénéfices 2029 ; décote vs pairs" }, date: daysAgo(5) },
    { ticker: "GVA", name: "Granite Construction", verdict: "Acheter", confidence: "Moyenne", horizon: "coeur", sleeve: "coeur", desk: "desk-industrie-energie", headline: "Routes et data centers américains, carnet record, 17 fois les bénéfices.", thesis: "Carnet ferme de 7,4 Md$, objectifs relevés, marges en amélioration.", risk: "Un vote raté sur le financement des infrastructures en décembre.", price: 118.9, currency: "USD", buy_zone: { low: 100, high: 125, currency: "USD", basis: "17-19 fois les bénéfices ; analogues historiques à ce niveau de repli" }, date: daysAgo(5) },
    { ticker: "CB", name: "Chubb", verdict: "Acheter", confidence: "Moyenne", horizon: "coeur", sleeve: "coeur", desk: "desk-finance", headline: "Le meilleur assureur au monde gagne plus quand les taux montent.", thesis: "Rentabilité technique record, revenus financiers +11 %, 13 fois les bénéfices.", risk: "Une saison d'ouragans lourde ou une rentabilité qui revient à la moyenne.", price: 330.49, currency: "USD", buy_zone: { low: 280, high: 325, currency: "USD", basis: "13-14 fois les bénéfices ; objectif médian des analystes" }, date: daysAgo(5) },
    { ticker: "MCO", name: "Moody's", verdict: "Surveiller", confidence: "Moyenne", horizon: "coeur", sleeve: "coeur", desk: "desk-finance", headline: "Une rente de notation exceptionnelle, mais trop chère aujourd'hui.", thesis: "Duopole de la notation, marges record, émissions d'obligations liées à l'IA.", risk: "Un choc de taux ou une récession qui ferait chuter les émissions.", price: 448.15, currency: "USD", buy_zone: { low: 360, high: 420, currency: "USD", basis: "22-24 fois les bénéfices (moyenne historique basse)" }, date: daysAgo(5) },
    { ticker: "MSTR", name: "MicroStrategy", verdict: "Éviter", confidence: "Haute", horizon: "tactique", headline: "Un bitcoin à levier dont la prime s'est effondrée.", thesis: "Proxy bitcoin à effet de levier, fondamentaux au plus bas.", risk: "Rebond brutal du bitcoin.", date: daysAgo(30) },
  ],
};

// État du portefeuille du groupe vu par le Portfolio Doctor du jeudi (même format que
// memory/portfolio.md) — statut + règle de sortie par ligne.
export const DEMO_PORTFOLIO_MD = `| Ticker | Nom | Valeur € | Poids % | Depuis achat | Coût base € | Horizon | Statut | Règle de sortie | Vérifié le |
|--------|-----|---------:|-------:|------------:|------------:|---------|--------|-----------------|-----------|
| SAF.PA | Safran | 813 | 7,5 | +1 % | 805 | cœur | INTACT | Sortie si la maintenance moteurs ralentit ou si l'objectif de marge est coupé. Objectifs relevés au S1. | ${daysAgo(5)} |
| HO.PA | Thales | 696 | 6,4 | −14 % | 805 | cœur | À SURVEILLER | La trêve au Moyen-Orient freine les valeurs de défense ; la thèse budgets européens tient tant que les commandes suivent. | ${daysAgo(5)} |
| AMZN | Amazon | 719 | 6,6 | +19 % | 602 | cœur | INTACT | AWS +37 % au T2, investissements accélérés : thèse confirmée. | ${daysAgo(5)} |
| NFLX | Netflix | 520 | 4,8 | −30 % | 742 | cœur | À SURVEILLER | Abonnés en décélération depuis le départ du fondateur ; à revoir aux résultats. | ${daysAgo(5)} |
| MSTR | MicroStrategy | 274 | 2,5 | −32 % | 402 | tactique | SORTIE | Prime sur le bitcoin effondrée et fondamentaux au plus bas : l'IA conseille de vendre depuis 16 semaines. | ${daysAgo(5)} |
| SAP | SAP | 280 | 2,6 | −30 % | 401 | cœur | À SURVEILLER | Cloud +19 % mais cours −30 % : sortie si l'objectif 2026 est coupé. | ${daysAgo(5)} |
| BNP.PA | BNP Paribas | 339 | 3,1 | +35 % | 252 | cœur | INTACT | Bénéfice +33 % au T2, taux favorables. | ${daysAgo(5)} |
| LOTB.BR | Lotus Bakeries | 464 | 4,3 | +54 % | 301 | cœur | INTACT | Valorisation élevée (44 fois les bénéfices) : alléger au-delà de 55. | ${daysAgo(5)} |
`;
