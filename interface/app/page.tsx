import { getAppData, getBook, getClubData, getMovers, getSpotlight, getWeek, getWorld, MEMORY_STALE_DAYS } from "@/lib/data";
import { getQuizState } from "@/lib/quiz";
import { AllocationDonut } from "@/components/Charts";
import { TopMovers } from "@/components/TopMovers";
import { QuizCard } from "@/components/QuizCard";
import { Spotlight } from "@/components/Spotlight";
import { HeroFund } from "@/components/HeroFund";
import { Card, CardHead, MoreLink } from "@/components/ui";
import { Activity, PieChart } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const data = await getAppData();
  const heldTickers = [...data.group.holdings, ...data.ai.holdings].map((h) => h.ticker);
  const book = await getBook(data);
  const [week, world, movers, club, quiz] = await Promise.all([getWeek(book), getWorld(heldTickers), getMovers(heldTickers), getClubData(), getQuizState()]);
  const spotlight = await getSpotlight(week, world);
  const g = data.group;
  const slices = [...g.holdings.map((h) => ({ name: h.ticker, value: h.marketValue })), { name: "Cash", value: g.cash }].filter((x) => x.value > 0);
  // Indice MSCI World (base 1) aligné sur les dates du fonds — pour « le marché a fait… ».
  const marketIndex = data.perf.some((p) => p.market != null)
    ? Object.fromEntries(data.perf.filter((p) => p.market != null).map((p) => [p.date, 1 + (p.market as number)]))
    : null;

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      {/* Panne : le book IA ne se lit plus (token GitHub expiré…). */}
      {!data.demo && !data.aiBookReadable && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          ⚠️ <b>Book IA illisible</b> — la lecture de <code>ai-fund.json</code> sur GitHub échoue (token expiré ?). Le fonds IA affiche son cash seul et ses snapshots
          quotidiens sont suspendus. Renouveler <code>GITHUB_TOKEN</code>/<code>GITHUB_WRITE_TOKEN</code> sur Vercel, puis ouvrir <code>/api/cron/value</code>.
        </div>
      )}
      {/* Panne SILENCIEUSE : les routines de nuit n'écrivent plus leur mémoire. */}
      {!data.demo && data.aiBookReadable && data.memoryAgeDays != null && data.memoryAgeDays >= MEMORY_STALE_DAYS && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          ⚠️ <b>Routines de nuit muettes depuis {data.memoryAgeDays} jours</b> — brief, signaux et book IA n&apos;évoluent plus. Vérifier
          <code> GITHUB_WRITE_TOKEN</code> sur Vercel et les routines sur claude.ai/code.
        </div>
      )}

      <HeroFund
        points={data.series.filter((p) => p.group != null).map((p) => ({ date: p.date, v: p.group as number }))}
        aiPoints={data.series.filter((p) => p.ai != null).map((p) => ({ date: p.date, v: p.ai as number }))}
        flows={data.contributions}
        market={marketIndex}
        demo={data.demo}
        contrib={club.rule}
      />

      {/* Ce qui saute aux yeux en 10 secondes ; les analyses détaillées sont sur la page Fonds IA. */}
      <Spotlight view={spotlight} />

      <QuizCard quiz={quiz.quiz} initialReveal={quiz.reveal} initialStats={quiz.stats} demo={quiz.demo} ready={quiz.ready} />

      <Card>
        <CardHead
          icon={PieChart}
          title="Répartition du groupe"
          sub={`${g.holdings.length} positions et le cash, au cours du jour.`}
          right={<MoreLink href="/groupe">Détail</MoreLink>}
        />
        <AllocationDonut slices={slices} total={g.nav} row />
      </Card>

      <Card>
        <CardHead icon={Activity} title="Ce qui bouge aujourd'hui" sub="Plus fortes variations du jour parmi les titres détenus." />
        <TopMovers gainers={movers.gainers} losers={movers.losers} />
      </Card>

      <p className="text-center text-xs text-muted">Paper trading — aucun ordre réel n&apos;est passé. Analyses à visée pédagogique, pas un conseil personnalisé.</p>
    </div>
  );
}
