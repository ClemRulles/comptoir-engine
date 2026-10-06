// perf.ts — UNE seule définition de la performance, partout dans l'app.
//
// Pourquoi : la carte « Fonds » calculait (NAV − capital investi) / capital investi depuis
// l'origine, tandis que la courbe affichait la variation de NAV sur la période choisie (3 mois
// par défaut) avec une correction d'apports approximative. Deux chiffres différents sous le
// même mot « performance » : c'est le bug « les % ne collent pas avec la courbe ».
//
// Méthode retenue : rendement PONDÉRÉ DANS LE TEMPS (TWR), le standard des gérants. Chaque jour,
// r = (NAV_jour − apports du jour) / NAV_veille − 1 : un versement de membre ne compte jamais
// comme du rendement, et deux fonds qui reçoivent les mêmes apports restent comparables entre
// eux ET avec un indice. La carte, la légende de la courbe et la variation de la semaine lisent
// toutes cette même série.

export type FundPoint = { date: string; group: number | null; ai: number | null };
export type Flow = { date: string; amount: number };
export type PerfPoint = { date: string; group: number | null; ai: number | null; market: number | null };

const finite = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

// Indice cumulé (base 1) d'un fonds ; null là où le fonds n'a pas de valeur.
export function twrIndex(series: FundPoint[], flows: Flow[], key: "group" | "ai"): (number | null)[] {
  const sortedFlows = [...flows].filter((f) => finite(f.amount)).sort((a, b) => a.date.localeCompare(b.date));
  let idx = 1;
  let prev: { date: string; v: number } | null = null;
  return series.map((p) => {
    const v = p[key];
    if (!finite(v) || v <= 0) return null;
    if (!prev) {
      prev = { date: p.date, v };
      return 1;
    }
    const prevDate: string = prev.date;
    const flow = sortedFlows.filter((f) => f.date > prevDate && f.date <= p.date).reduce((s, f) => s + f.amount, 0);
    const r = prev.v > 0 ? (v - flow) / prev.v - 1 : 0;
    idx *= 1 + r;
    prev = { date: p.date, v };
    return idx;
  });
}

// Série de performance cumulée (0 = point de départ) pour les deux fonds + l'indice.
// `market` = { date: cours } de l'indice de référence (MSCI World en €), ramené au même départ.
export function perfSeries(series: FundPoint[], flows: Flow[], market?: Record<string, number> | null): PerfPoint[] {
  const g = twrIndex(series, flows, "group");
  const a = twrIndex(series, flows, "ai");
  const mk = alignMarket(series.map((p) => p.date), market);
  return series.map((p, i) => ({
    date: p.date,
    group: g[i] == null ? null : (g[i] as number) - 1,
    ai: a[i] == null ? null : (a[i] as number) - 1,
    market: mk[i],
  }));
}

// Aligne l'indice sur les dates des fonds (dernier cours connu ≤ date), base = 1er point.
function alignMarket(dates: string[], market?: Record<string, number> | null): (number | null)[] {
  if (!market) return dates.map(() => null);
  const md = Object.keys(market).filter((d) => finite(market[d]) && market[d] > 0).sort();
  if (!md.length) return dates.map(() => null);
  let j = -1;
  let base: number | null = null;
  return dates.map((d) => {
    while (j + 1 < md.length && md[j + 1] <= d) j++;
    if (j < 0) return null;
    const close = market[md[j]];
    if (base == null) base = close;
    return close / base - 1;
  });
}

// Performance entre le premier et le dernier point VISIBLES d'une fenêtre (même définition que
// la série) : (1 + p_fin) / (1 + p_début) − 1.
export function windowReturn(points: PerfPoint[], key: "group" | "ai" | "market"): number | null {
  const vals = points.map((p) => p[key]).filter(finite);
  if (vals.length < 2) return vals.length === 1 ? 0 : null;
  return (1 + vals[vals.length - 1]) / (1 + vals[0]) - 1;
}

// Rendement sur les N derniers jours calendaires.
export function trailingReturn(points: PerfPoint[], key: "group" | "ai" | "market", days: number): number | null {
  if (!points.length) return null;
  const last = points[points.length - 1].date;
  const cut = new Date(last);
  cut.setDate(cut.getDate() - days);
  const from = cut.toISOString().slice(0, 10);
  // point d'ancrage = dernier point ≤ date de coupe (sinon le premier disponible)
  let anchor = 0;
  for (let i = 0; i < points.length; i++) if (points[i].date <= from) anchor = i;
  return windowReturn(points.slice(anchor), key);
}

export interface PerfSummary {
  sinceInception: number; // TWR depuis le départ (identique à la courbe « Max »)
  week: number | null; // TWR 7 jours
  month: number | null; // TWR 30 jours
  gainEur: number; // NAV − (capital de départ + apports) : le gain en euros, hors versements
  invested: number; // capital de départ + apports
}

export function summarize(points: PerfPoint[], key: "group" | "ai", nav: number, invested: number): PerfSummary {
  const sinceInception = windowReturn(points, key);
  return {
    // Sans historique (fonds tout neuf), on retombe sur la définition simple : même résultat
    // tant qu'aucun apport n'a eu lieu.
    sinceInception: sinceInception ?? (invested ? (nav - invested) / invested : 0),
    week: trailingReturn(points, key, 7),
    month: trailingReturn(points, key, 30),
    gainEur: nav - invested,
    invested,
  };
}
