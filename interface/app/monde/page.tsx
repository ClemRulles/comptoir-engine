import { CalendarDays, Newspaper, Radar } from "lucide-react";
import { getAppData, getCatalysts, getCrypto, getGrokPulse, getMarketRadar, getWorld } from "@/lib/data";
import { NewsFeed } from "@/components/news-feed";
import { ProsBoard, RegimeCard } from "@/components/world";
import { CatalystsList } from "@/components/Catalysts";
import { MarketRadar } from "@/components/MarketRadar";
import { MarketPulse } from "@/components/MarketPulse";
import { CryptoClimate } from "@/components/CryptoClimate";
import { Badge, Card, CardHead, DemoTag, PageHeader } from "@/components/ui";
import { fmtDay } from "@/lib/insights";

export const dynamic = "force-dynamic";

export default async function MondePage() {
  const data = await getAppData();
  const held = [...data.group.holdings, ...data.ai.holdings].map((h) => h.ticker);
  const [world, radar, cat, crypto, pulse] = await Promise.all([getWorld(held), getMarketRadar(), getCatalysts(), getCrypto(), getGrokPulse()]);
  const fg = typeof radar.signals.regime?.fear_greed === "number" ? radar.signals.regime.fear_greed : null;

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <PageHeader
        eyebrow="Actualité · investisseurs · macro"
        title="Le monde"
        lead="Ce qui bouge vraiment les marchés — Maison-Blanche, banques centrales, conflits, entreprises — et ce que l'IA en fait pour nos fonds."
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <RegimeCard label={radar.signals.regime?.label ?? null} flags={radar.signals.regime?.flags} fearGreed={fg} demo={radar.demo} />
        </div>
        <div className="lg:col-span-7">
          <CryptoClimate crypto={crypto.crypto} demo={crypto.demo} />
        </div>
      </div>

      <Card>
        <CardHead
          icon={Newspaper}
          title="L'actualité qui compte"
          sub={world.updated ? `Sélection de la semaine · mise à jour le ${fmtDay(world.updated)}` : "Sélection de la semaine"}
          right={
            <div className="flex gap-2">
              <DemoTag show={world.demo} />
              {world.derived && <Badge>Tiré du pouls hebdo</Badge>}
            </div>
          }
        />
        {world.news.length === 0 ? (
          <p className="well px-4 py-6 text-center text-sm text-muted">La routine du lundi publiera ici l&apos;actualité mondiale qui compte, en clair.</p>
        ) : (
          <NewsFeed items={world.news} />
        )}
      </Card>

      <div id="pros" className="scroll-mt-24">
        <ProsBoard pros={world.pros} demo={world.demo} updated={world.prosUpdated} />
      </div>

      <MarketPulse weeks={pulse.weeks} demo={pulse.demo} />

      <Card className="scroll-mt-24" as="section">
        <span id="agenda" className="relative -top-24 block" aria-hidden />
        <CardHead icon={CalendarDays} title="Le calendrier" sub="Les événements datés des prochaines semaines et la posture de l'IA pour chacun." right={<DemoTag show={cat.demo} />} />
        <CatalystsList upcoming={cat.upcoming} past={cat.past} />
      </Card>

      <details className="card group p-5 md:p-6">
        <summary className="flex cursor-pointer list-none items-center gap-3 [&::-webkit-details-marker]:hidden">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand/10 text-brand-600"><Radar size={16} /></span>
          <span>
            <span className="h-section block">Données brutes du moteur</span>
            <span className="text-[13px] text-muted">Signaux chiffrés par titre (qualité, momentum, initiés…) — pour qui veut creuser.</span>
          </span>
        </summary>
        <div className="mt-5">
          <MarketRadar signals={radar.signals} demo={radar.demo} />
        </div>
      </details>
    </div>
  );
}
