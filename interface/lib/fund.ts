import type { Holding, NavSnapshot } from "./types";

export function positionsValue(
  holdings: Pick<Holding, "ticker" | "quantity">[],
  prices: Record<string, number>
): number {
  return holdings.reduce((sum, h) => {
    const p = prices[h.ticker.toUpperCase()];
    return sum + (typeof p === "number" ? p * h.quantity : 0);
  }, 0);
}

export function eur(n: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}

export function pct(n: number): string {
  const v = (n * 100).toFixed(1);
  return `${n >= 0 ? "+" : ""}${v}%`;
}

// Performance depuis l'origine = (nav - capital de départ) / capital de départ.
export function perfSinceInception(nav: number, startCapital: number): number {
  if (!startCapital) return 0;
  return (nav - startCapital) / startCapital;
}

// Fusionne les snapshots des 2 fonds par date pour le graphique.
export function mergeSeries(
  group: NavSnapshot[],
  ai: NavSnapshot[]
): { date: string; group: number | null; ai: number | null }[] {
  const byDate = new Map<string, { date: string; group: number | null; ai: number | null }>();
  for (const s of group) {
    byDate.set(s.date, { date: s.date, group: s.nav, ai: null });
  }
  for (const s of ai) {
    const row = byDate.get(s.date) ?? { date: s.date, group: null, ai: null };
    row.ai = s.nav;
    byDate.set(s.date, row);
  }
  return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));
}
