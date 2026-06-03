import type { AiFundFile } from "./types";

// Données de DÉMONSTRATION (affichées tant que Supabase n'est pas branché).
// Clairement étiquetées « Démo » dans l'UI — remplacées par les vraies données en prod.

export const DEMO_PRICES: Record<string, number> = {
  NVDA: 135.4,
  MSFT: 432.1,
  ASML: 690.0,
  VRT: 95.2,
  TSM: 178.3,
  CEG: 235.6,
};

export const DEMO_GROUP = {
  name: "Fonds du groupe",
  startCapital: 10000,
  cash: 3213,
  holdings: [
    { ticker: "NVDA", quantity: 18, avg_cost: 92 },
    { ticker: "MSFT", quantity: 5, avg_cost: 395 },
    { ticker: "ASML", quantity: 2, avg_cost: 720 },
    { ticker: "VRT", quantity: 22, avg_cost: 78 },
  ],
};

export const DEMO_AI: AiFundFile = {
  as_of: "2026-06-03",
  start_capital: 10000,
  cash: 2740,
  positions: [
    { ticker: "NVDA", quantity: 26, avg_cost: 90, thesis: "Cycle capex IA, pricing power datacenter." },
    { ticker: "TSM", quantity: 18, avg_cost: 140, thesis: "Goulot d'étranglement fonderie, pioches & pelles." },
    { ticker: "VRT", quantity: 15, avg_cost: 80, thesis: "Refroidissement/énergie datacenter — second ordre IA." },
    { ticker: "CEG", quantity: 6, avg_cost: 200, thesis: "Électricité bas-carbone pour datacenters." },
  ],
  trades: [
    { ts: "2026-05-29", side: "buy", ticker: "CEG", quantity: 6, price: 200, rationale: "Conviction haute : demande électrique IA." },
    { ts: "2026-05-22", side: "buy", ticker: "VRT", quantity: 15, price: 80, rationale: "Exposition infra, valorisation raisonnable." },
    { ts: "2026-05-15", side: "buy", ticker: "TSM", quantity: 18, price: 140, rationale: "Marge de sécurité vs pairs, catalyseur résultats." },
    { ts: "2026-05-08", side: "buy", ticker: "NVDA", quantity: 26, price: 90, rationale: "Cœur de la tendance, confiance haute." },
  ],
  note: "Données de démonstration.",
};

// Série NAV hebdomadaire déterministe (14 points) — l'IA finit devant le groupe.
export function demoSeries(): { date: string; group: number; ai: number }[] {
  const pts: { date: string; group: number; ai: number }[] = [];
  const groupEnd = 11273;
  const aiEnd = 12289;
  const start = 10000;
  const n = 14;
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const wobbleG = Math.sin(i * 1.1) * 130 * (1 - t);
    const wobbleA = Math.sin(i * 1.4 + 1) * 180 * (1 - t);
    const d = new Date(2026, 2, 2);
    d.setDate(d.getDate() + i * 7);
    pts.push({
      date: d.toISOString().slice(5, 10),
      group: Math.round(start + (groupEnd - start) * t + wobbleG),
      ai: Math.round(start + (aiEnd - start) * t + wobbleA),
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
