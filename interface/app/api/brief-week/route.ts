import { NextResponse, type NextRequest } from "next/server";
import { isConfigured } from "@/lib/data";
import { fetchFileCommits, fetchRepoFile } from "@/lib/github";
import { DEMO_BRIEF } from "@/lib/demo";

export const dynamic = "force-dynamic";

// Le Trend Radar du lundi met à jour trends.md → on s'en sert d'ancre « semaine ».
const ANCHOR = "memory/trends.md";

const DEMO_TENDANCE = `## 🎯 Tendance — Infrastructure énergétique de l'IA
Le goulot n'est plus les puces mais **l'électricité et le refroidissement** des datacenters.
- **Pioches & pelles** : VRT (thermique), CEG (énergie).
- **Drapeau bulle** : prudence sur les noms paraboliques.`;

const DEMO_REGIME = `# Régime de marché — démo
- **Cadran** : RISK-ON SAIN
- **Consigne** : rester investi, marge de sécurité sur les nouveaux achats.
- **Largeur** : correcte.`;

export async function GET(request: NextRequest) {
  const i = Math.max(0, parseInt(new URL(request.url).searchParams.get("i") ?? "0", 10) || 0);

  // Mode démo : une seule « semaine ».
  if (!isConfigured()) {
    return NextResponse.json({
      total: 1,
      index: 0,
      demo: true,
      date: new Date().toISOString(),
      message: "Brief de démonstration",
      brief: DEMO_BRIEF,
      tendance: DEMO_TENDANCE,
      regime: DEMO_REGIME,
    });
  }

  const commits = await fetchFileCommits(ANCHOR, 14);

  // Pas d'historique encore : on renvoie l'état courant (branche runtime).
  if (commits.length === 0) {
    const [brief, tendance, regime] = await Promise.all([
      fetchRepoFile("memory/morning-brief.md"),
      fetchRepoFile("memory/trends.md"),
      fetchRepoFile("memory/market-regime.md"),
    ]);
    return NextResponse.json({
      total: brief || tendance || regime ? 1 : 0,
      index: 0,
      demo: false,
      date: null,
      message: null,
      brief,
      tendance,
      regime,
    });
  }

  const idx = Math.min(i, commits.length - 1);
  const c = commits[idx];

  // Snapshot cohérent : les 3 fichiers tels qu'ils étaient à CE commit.
  const [brief, tendance, regime] = await Promise.all([
    fetchRepoFile("memory/morning-brief.md", c.sha),
    fetchRepoFile("memory/trends.md", c.sha),
    fetchRepoFile("memory/market-regime.md", c.sha),
  ]);

  return NextResponse.json({
    total: commits.length,
    index: idx,
    demo: false,
    date: c.date,
    message: c.message,
    brief,
    tendance,
    regime,
  });
}
