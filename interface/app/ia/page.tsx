import { BookOpenCheck, Layers, PieChart, ScrollText } from "lucide-react";
import { getAppData, getBook, getBuyZones } from "@/lib/data";
import { DuelChart } from "@/components/DuelChart";
import { PositionsBySleeve, SleeveBars, TradesJournal } from "@/components/book";
import { BuyZones } from "@/components/zones";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { Card, CardHead, Change, DemoTag, MoreLink, PageHeader, Stat, fmtPct, fmtShare } from "@/components/ui";
import { regimePlain } from "@/lib/insights";

export const dynamic = "force-dynamic";

export default async function IaPage() {
  const data = await getAppData();
  const book = await getBook(data);
  const held = [...data.group.holdings, ...data.ai.holdings].map((h) => h.ticker);
  const zones = await getBuyZones(held);
  const f = data.ai;
  const cashShare = f.nav ? f.cash / f.nav : 0;
  const vsMarket = data.marketPerf == null ? null : data.aiPerf.sinceInception - data.marketPerf;
  const rp = regimePlain(book.regime);

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <PageHeader
        eyebrow="Fonds fictif · géré par l'IA"
        title="Fonds IA"
        lead={
          <>
            Objectif : faire fructifier le fonds sur 3 à 5 ans, comme un gérant professionnel. Des convictions long terme au centre, des
            coups datés, une poche crypto, et 10 % de cash pour saisir les occasions. <span className="text-ink">{rp.line}</span>
          </>
        }
        right={<MoreLink href="/apprentissages">Ce que l&apos;IA a appris</MoreLink>}
      />

      <div className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
        <Stat label="Valeur du fonds" demo={data.demo} value={<AnimatedNumber value={f.nav} kind="eur" />} sub={<><Change value={data.aiPerf.sinceInception} /> <span className="text-[11px] text-muted">depuis le début</span></>} />
        <Stat
          label="Face au marché"
          value={<span className={vsMarket == null ? "" : vsMarket >= 0 ? "text-brand-600 dark:text-brand-500" : "text-danger"}>{vsMarket == null ? "—" : `${vsMarket >= 0 ? "+" : "−"}${Math.abs(vsMarket * 100).toFixed(1).replace(".", ",")} pts`}</span>}
          sub={<span className="text-[12px] text-muted">MSCI World : {fmtPct(data.marketPerf)}</span>}
        />
        <Stat
          label="Réserve de cash"
          value={fmtShare(cashShare)}
          sub={<span className={`text-[12px] ${cashShare > 0.15 ? "text-amber-700 dark:text-ai" : "text-muted"}`}>{cashShare > 0.15 ? "au-dessus des 10 % visés" : cashShare < 0.05 ? "sous le minimum de 5 %" : "visée : 10 %"}</span>}
        />
        <Stat
          label={book.risk ? "Risque du fonds" : "Positions"}
          value={book.risk ? `${Math.round(book.risk.vol * 100)} %/an` : String(book.positions.length)}
          sub={<span className="text-[12px] text-muted">{book.risk ? "volatilité · visée 13-20 %" : `dans ${new Set(book.positions.map((p) => p.sleeve)).size} poches`}</span>}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <Card className="lg:col-span-7">
          <CardHead icon={BookOpenCheck} title="L'IA face au marché" sub="Performance du fonds IA comparée au MSCI World, depuis le départ." />
          <DuelChart points={data.perf} show={["ai", "market"]} height={260} />
        </Card>
        <Card className="lg:col-span-5">
          <CardHead icon={PieChart} title="Où est l'argent" sub="Chaque poche face à sa cible (le repère) et sa plage autorisée (la zone grisée)." />
          <SleeveBars sleeves={book.sleeves} />
        </Card>
      </div>

      <Card>
        <CardHead icon={Layers} title="Les positions et leurs raisons" sub="Touchez une ligne pour voir pourquoi l'IA la détient et ce qui la ferait vendre." right={<DemoTag show={data.demo} />} />
        {book.positions.length === 0 ? <p className="text-sm text-muted">100 % cash — aucune position ouverte.</p> : <PositionsBySleeve positions={book.positions} />}
      </Card>

      <BuyZones items={zones.items} demo={zones.demo} />

      <div id="journal" className="scroll-mt-24">
        <Card>
          <CardHead icon={ScrollText} title="Journal des décisions" sub="Chaque achat et chaque vente, avec la raison en une phrase." />
          <TradesJournal trades={book.trades} />
        </Card>
      </div>
    </div>
  );
}

