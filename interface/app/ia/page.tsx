import { Layers, PieChart, ScrollText } from "lucide-react";
import { getAppData, getBook, getBuyZones, getClubData, getWeek } from "@/lib/data";
import { DecisionsCard, WeekCard, WindowsStrip } from "@/components/home";
import { HeroFund } from "@/components/HeroFund";
import { PositionsBySleeve, SleeveBars, TradesJournal } from "@/components/book";
import { BuyZones } from "@/components/zones";
import { Card, CardHead, DemoTag, MoreLink, PageHeader, Stat, fmtPct, fmtShare } from "@/components/ui";
import { regimePlain } from "@/lib/insights";

export const dynamic = "force-dynamic";

export default async function IaPage() {
  const data = await getAppData();
  const book = await getBook(data);
  const held = [...data.group.holdings, ...data.ai.holdings].map((h) => h.ticker);
  const [zones, club, week] = await Promise.all([getBuyZones(held), getClubData(), getWeek(book)]);
  const f = data.ai;
  const cashShare = f.nav ? f.cash / f.nav : 0;
  const vsMarket = data.marketPerf == null ? null : data.aiPerf.sinceInception - data.marketPerf;
  const rp = regimePlain(book.regime);
  const marketIndex = data.perf.some((p) => p.market != null)
    ? Object.fromEntries(data.perf.filter((p) => p.market != null).map((p) => [p.date, 1 + (p.market as number)]))
    : null;

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

      <HeroFund
        title="Fonds IA"
        points={data.series.filter((p) => p.ai != null).map((p) => ({ date: p.date, v: p.ai as number }))}
        aiPoints={data.series.filter((p) => p.group != null).map((p) => ({ date: p.date, v: p.group as number }))}
        compare={{ label: "Notre fonds", href: "/groupe", tone: "group" }}
        flows={data.contributions}
        market={marketIndex}
        demo={data.demo}
        contrib={club.rule}
      />

      {/* Les analyses de la semaine — là où mènent les deux carrés de l'accueil. */}
      <section id="analyses" className="grid scroll-mt-24 grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <WeekCard week={week} />
        </div>
        <div className="lg:col-span-7">
          <DecisionsCard decisions={week.decisions} demo={week.demo} href="#journal" />
        </div>
      </section>

      <WindowsStrip />

      <div className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
        <Stat
          label="Face au marché"
          value={<span className={vsMarket == null ? "" : vsMarket >= 0 ? "text-brand-600 dark:text-brand-500" : "text-danger"}>{vsMarket == null ? "—" : `${vsMarket >= 0 ? "+" : "−"}${Math.abs(vsMarket * 100).toFixed(1).replace(".", ",")} pts`}</span>}
          sub={<span className="text-[12px] text-muted">depuis le début · MSCI World {fmtPct(data.marketPerf)}</span>}
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
        <Stat label="Mouvements" value={String(book.trades.length)} sub={<span className="text-[12px] text-muted">depuis le départ</span>} />
      </div>

      <Card>
        <CardHead icon={PieChart} title="Où est l'argent" sub="Chaque poche face à sa cible (le repère) et sa plage autorisée (la zone grisée)." />
        <SleeveBars sleeves={book.sleeves} />
      </Card>

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

