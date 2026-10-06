import { HandCoins, ListChecks, PieChart, Stethoscope, Users } from "lucide-react";
import { adviceFor, getAppData, getClubData, getGroupAdvice } from "@/lib/data";
import { eur } from "@/lib/fund";
import { AllocationDonut } from "@/components/Charts";
import { HeroFund } from "@/components/HeroFund";
import { HoldingsEditor } from "@/components/HoldingsEditor";
import { MembersManager } from "@/components/MembersManager";
import { MaintenancePanel } from "@/components/MaintenancePanel";
import { TickerCell } from "@/components/StockDrawer";
import { Badge, Card, CardHead, Change, DemoTag, PageHeader, Stat, fmtEur, fmtPct, fmtShare } from "@/components/ui";
import { fmtDay } from "@/lib/insights";
import { ruleSentence } from "@/lib/contrib-rule";
import { getQuizBoard } from "@/lib/quiz";
import { QuizLeaderboard } from "@/components/QuizLeaderboard";

export const dynamic = "force-dynamic";

const STATUS_TONE: Record<string, "good" | "ai" | "bad" | "neutral"> = { INTACT: "good", "À SURVEILLER": "ai", SORTIE: "bad" };
const STATUS_LABEL: Record<string, string> = { INTACT: "Thèse intacte", "À SURVEILLER": "À surveiller", SORTIE: "L'IA vendrait" };

export default async function GroupePage({ searchParams }: { searchParams: Promise<{ quiz?: string }> }) {
  const { quiz: quizMonth } = await searchParams;
  const [data, club, advice, board] = await Promise.all([getAppData(), getClubData(), getGroupAdvice(), getQuizBoard(quizMonth)]);
  const f = data.group;
  const slices = [...f.holdings.map((h) => ({ name: h.ticker, value: h.marketValue })), { name: "Cash", value: f.cash }].filter((s) => s.value > 0);
  const rows = f.holdings.map((h) => ({ h, a: adviceFor(advice.byTicker, h.ticker) }));
  const alerts = rows.filter((r) => r.a && r.a.status !== "INTACT").sort((x, y) => (x.a!.status === "SORTIE" ? -1 : 0) - (y.a!.status === "SORTIE" ? -1 : 0));
  const cashShare = f.nav ? f.cash / f.nav : 0;
  const marketIndex = data.perf.some((p) => p.market != null)
    ? Object.fromEntries(data.perf.filter((p) => p.market != null).map((p) => [p.date, 1 + (p.market as number)]))
    : null;

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <PageHeader
        eyebrow="Le pot commun · vrai argent"
        title="Fonds du groupe"
        lead="Les positions réelles du groupe, valorisées chaque jour. L'IA ne touche jamais à ce fonds : elle donne son avis, le groupe décide."
      />

      <HeroFund
        title="Fonds du groupe"
        points={data.series.filter((p) => p.group != null).map((p) => ({ date: p.date, v: p.group as number }))}
        aiPoints={data.series.filter((p) => p.ai != null).map((p) => ({ date: p.date, v: p.ai as number }))}
        flows={data.contributions}
        market={marketIndex}
        demo={data.demo}
        contrib={club.rule}
      />

      <div className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
        <Stat label="Gain net" value={<span className={data.groupPerf.gainEur >= 0 ? "text-brand-600 dark:text-brand-500" : "text-danger"}>{data.groupPerf.gainEur >= 0 ? "+" : "−"}{fmtEur(Math.abs(data.groupPerf.gainEur))}</span>} sub={<span className="text-[12px] text-muted">hors apports des membres</span>} />
        <Stat label="Cette semaine" value={fmtPct(data.groupPerf.week)} sub={<span className="text-[12px] text-muted">performance sur 7 jours</span>} />
        <Stat label="Cash" value={fmtEur(f.cash)} sub={<span className="text-[12px] text-muted">{fmtShare(cashShare)} du fonds</span>} />
        <Stat label="Positions" value={String(f.holdings.length)} sub={<span className="text-[12px] text-muted">{alerts.length} à regarder</span>} />
      </div>

      <QuizLeaderboard board={board} />

      {alerts.length > 0 && (
        <Card className="border-ai/30">
          <CardHead icon={Stethoscope} title="L'avis de l'IA sur vos positions" sub="Ce que le bilan de santé du jeudi recommande au groupe. Vous décidez." right={<DemoTag show={advice.demo} />} />
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {alerts.map(({ h, a }) => (
              <li key={h.ticker} className={`well p-4 ${a!.status === "SORTIE" ? "border-danger/30 bg-danger/[0.04]" : ""}`}>
                <div className="flex items-center gap-2">
                  <TickerCell ticker={h.ticker} />
                  <Badge tone={STATUS_TONE[a!.status] ?? "neutral"}>{STATUS_LABEL[a!.status] ?? a!.status}</Badge>
                  <span className="ml-auto"><Change value={h.pnlPct} /></span>
                </div>
                <p className="mt-2 text-[13px] leading-relaxed">{a!.note}</p>
                {a!.checked && <p className="mt-1 text-[11px] text-muted">vérifié le {fmtDay(a!.checked)}</p>}
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card>
        <CardHead icon={PieChart} title="Répartition" />
        <AllocationDonut slices={slices} total={f.nav} />
      </Card>

      <Card className="overflow-x-auto">
        <CardHead icon={ListChecks} title="Positions" sub="Avec l'avis de l'IA ligne par ligne." />
        {f.holdings.length === 0 ? (
          <p className="text-sm text-muted">Aucune position pour l&apos;instant.</p>
        ) : (
          <table className="w-full text-sm row-hover">
            <thead>
              <tr className="eyebrow border-b border-line">
                <th className="py-2 text-left font-semibold">Titre</th>
                <th className="hidden text-right font-semibold sm:table-cell">Qté</th>
                <th className="hidden text-right font-semibold md:table-cell">PRU</th>
                <th className="text-right font-semibold">Valeur</th>
                <th className="hidden text-right font-semibold sm:table-cell">Poids</th>
                <th className="text-right font-semibold">+/-</th>
                <th className="hidden pl-4 text-left font-semibold lg:table-cell">Avis IA</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ h, a }) => (
                <tr key={h.ticker} className="border-b border-line/60">
                  <td className="py-2.5"><TickerCell ticker={h.ticker} /></td>
                  <td className="hidden text-right tabular-nums sm:table-cell">{h.quantity}</td>
                  <td className="hidden text-right tabular-nums text-muted md:table-cell">{h.avgCost} €</td>
                  <td className="text-right tabular-nums">{eur(h.marketValue)}</td>
                  <td className="hidden text-right tabular-nums text-muted sm:table-cell">{fmtShare(h.weight, 1)}</td>
                  <td className="text-right"><Change value={h.pnlPct} /></td>
                  <td className="hidden pl-4 lg:table-cell">{a ? <Badge tone={STATUS_TONE[a.status] ?? "neutral"}>{STATUS_LABEL[a.status] ?? a.status}</Badge> : <span className="text-muted">—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <section>
        <CardHead icon={HandCoins} title="Investir / renforcer une position" />
        {data.demo && <div className="card mb-3 border-ai/30 bg-ai/5 p-4 text-sm">Mode démo : l&apos;enregistrement sera actif une fois Supabase branché.</div>}
        <HoldingsEditor />
      </section>

      <section>
        <CardHead
          icon={Users}
          title="Membres & apports"
          sub={`Apports : ${ruleSentence(club.rule)}. L'IA reçoit la même somme pour rester à armes égales ; un apport n'est jamais compté comme un gain.`}
          right={<span className="eyebrow">{eur(club.monthlyTotal)} / mois</span>}
        />
        <MembersManager club={club} />
      </section>

      <details>
        <summary className="mb-2 cursor-pointer text-sm font-semibold text-muted">⚙️ Outils de synchronisation des données (avancé)</summary>
        <MaintenancePanel demo={data.demo} />
      </details>
    </div>
  );
}

