import { HandCoins, LineChart, ListChecks, PieChart, Stethoscope, Users } from "lucide-react";
import { adviceFor, getAppData, getClubData, getGroupAdvice } from "@/lib/data";
import { eur } from "@/lib/fund";
import { AllocationDonut } from "@/components/Charts";
import { DuelChart } from "@/components/DuelChart";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { HoldingsEditor } from "@/components/HoldingsEditor";
import { MembersManager } from "@/components/MembersManager";
import { MaintenancePanel } from "@/components/MaintenancePanel";
import { TickerCell } from "@/components/StockDrawer";
import { Badge, Card, CardHead, Change, DemoTag, PageHeader, Stat, fmtEur, fmtPct, fmtShare } from "@/components/ui";
import { fmtDay } from "@/lib/insights";

export const dynamic = "force-dynamic";

const STATUS_TONE: Record<string, "good" | "ai" | "bad" | "neutral"> = { INTACT: "good", "À SURVEILLER": "ai", SORTIE: "bad" };
const STATUS_LABEL: Record<string, string> = { INTACT: "Thèse intacte", "À SURVEILLER": "À surveiller", SORTIE: "L'IA vendrait" };

export default async function GroupePage() {
  const [data, club, advice] = await Promise.all([getAppData(), getClubData(), getGroupAdvice()]);
  const f = data.group;
  const slices = [...f.holdings.map((h) => ({ name: h.ticker, value: h.marketValue })), { name: "Cash", value: f.cash }].filter((s) => s.value > 0);
  const rows = f.holdings.map((h) => ({ h, a: adviceFor(advice.byTicker, h.ticker) }));
  const alerts = rows.filter((r) => r.a && r.a.status !== "INTACT").sort((x, y) => (x.a!.status === "SORTIE" ? -1 : 0) - (y.a!.status === "SORTIE" ? -1 : 0));
  const cashShare = f.nav ? f.cash / f.nav : 0;

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <PageHeader
        eyebrow="Le pot commun · vrai argent"
        title="Fonds du groupe"
        lead="Les positions réelles du groupe, valorisées chaque jour. L'IA ne touche jamais à ce fonds : elle donne son avis, le groupe décide."
      />

      <div className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
        <Stat label="Valeur du fonds" demo={data.demo} value={<AnimatedNumber value={f.nav} kind="eur" />} sub={<><Change value={data.groupPerf.sinceInception} /> <span className="text-[11px] text-muted">depuis le début</span></>} />
        <Stat label="Gain net" value={fmtEur(data.groupPerf.gainEur)} sub={<span className="text-[12px] text-muted">hors apports · investi {fmtEur(data.groupPerf.invested)}</span>} />
        <Stat label="Cette semaine" value={fmtPct(data.groupPerf.week)} sub={<span className="text-[12px] text-muted">IA : {fmtPct(data.aiPerf.week)}</span>} />
        <Stat label="Cash" value={fmtEur(f.cash)} sub={<span className="text-[12px] text-muted">{fmtShare(cashShare)} du fonds</span>} />
      </div>

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

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <Card className="lg:col-span-8">
          <CardHead icon={LineChart} title="Le groupe face au marché" sub="Performance pondérée dans le temps, apports neutralisés." />
          <DuelChart points={data.perf} show={["group", "market"]} height={260} />
        </Card>
        <Card className="lg:col-span-4">
          <CardHead icon={PieChart} title="Répartition" />
          <AllocationDonut slices={slices} total={f.nav} />
        </Card>
      </div>

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
          sub={`${club.activeMembers} membres × 25 € versés le 5 de chaque mois — l'IA reçoit la même somme pour rester à armes égales.`}
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

