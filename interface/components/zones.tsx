// zones.tsx — les zones d'achat (method §N) : pour chaque conviction, le prix au-delà duquel
// l'IA n'achète plus, et où se situe le cours aujourd'hui.
import { Crosshair } from "lucide-react";
import type { ZoneView } from "@/lib/data";
import { fmtDay } from "@/lib/insights";
import { TickerCell } from "@/components/StockDrawer";
import { Badge, Card, CardHead, DemoTag, Empty, Explain, fmtPrice } from "@/components/ui";

const STATUS: Record<ZoneView["status"], { label: string; tone: "good" | "ai" | "bad" | "neutral" | "info"; line: string }> = {
  "dans-la-zone": { label: "Dans la zone", tone: "good", line: "Achat possible en taille pleine au prochain vendredi." },
  proche: { label: "Juste au-dessus", tone: "ai", line: "Moins de 5 % au-dessus : demi-taille seulement." },
  "au-dessus": { label: "Trop cher", tone: "bad", line: "On attend que le prix revienne — le capital prévu va au socle." },
  "sous-la-zone": { label: "Sous la zone", tone: "info", line: "Très bas : l'IA revérifie la thèse avant d'acheter." },
  "a-definir": { label: "Zone à définir", tone: "neutral", line: "La zone sera fixée au prochain débat du mercredi." },
};

export function BuyZones({ items, demo }: { items: ZoneView[]; demo: boolean }) {
  return (
    <Card>
      <CardHead
        icon={Crosshair}
        title="Zones d'achat"
        sub="Le prix maximum que l'IA accepte de payer, décidé avant d'avoir envie d'acheter."
        right={
          <div className="flex items-center gap-2">
            <DemoTag show={demo} />
            <Explain label="Pourquoi">
              Une excellente entreprise achetée trop cher est un mauvais placement. Chaque conviction reçoit une zone : sous le haut de la zone, l&apos;IA achète ; jusqu&apos;à 5 % au-dessus, elle achète la moitié ; au-delà, elle attend. Sous le bas, elle revérifie la thèse : le marché sait peut-être quelque chose.
            </Explain>
          </div>
        }
      />
      {items.length === 0 ? (
        <Empty icon={Crosshair} title="Aucune conviction en cours" />
      ) : (
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {items.map((z) => (
            <ZoneRow key={z.ticker} z={z} />
          ))}
        </ul>
      )}
    </Card>
  );
}

function ZoneRow({ z }: { z: ZoneView }) {
  const st = STATUS[z.status];
  return (
    <li className="well p-4">
      <div className="flex flex-wrap items-center gap-2">
        <TickerCell ticker={z.ticker} name={z.name} />
        {z.name && <span className="truncate text-[12px] text-muted">{z.name}</span>}
        {z.held && <Badge tone="good">détenu</Badge>}
        <span className="ml-auto">
          <Badge tone={st.tone}>{st.label}</Badge>
        </span>
      </div>
      <p className="mt-2 text-[13px] leading-relaxed">{z.headline}</p>
      {z.zone && z.price != null ? <Gauge z={z} /> : null}
      <p className="mt-2 text-[12px] text-muted">{st.line}</p>
      <div className="mt-1 flex flex-wrap gap-x-3 text-[11px] text-muted">
        <span>{z.verdict} · confiance {z.confidence.toLowerCase()}</span>
        {z.date && <span>analysé le {fmtDay(z.date)}</span>}
      </div>
    </li>
  );
}

function Gauge({ z }: { z: ZoneView }) {
  const { low, high } = z.zone!;
  const price = z.price!;
  const ccy = z.currency ?? z.zone!.currency ?? "USD";
  const min = Math.min(low * 0.88, price * 0.95);
  const max = Math.max(high * 1.15, price * 1.05);
  const at = (v: number) => ((v - min) / (max - min)) * 100;
  return (
    <div className="mt-3">
      <div className="relative h-2 rounded-full bg-slate-500/15">
        <div className="absolute inset-y-0 rounded-full bg-brand/40" style={{ left: `${at(low)}%`, width: `${at(high) - at(low)}%` }} />
        <div className="absolute inset-y-0 rounded-full bg-ai/30" style={{ left: `${at(high)}%`, width: `${at(high * 1.05) - at(high)}%` }} />
        <div className="absolute -top-1.5 h-5 w-5 -translate-x-1/2 rounded-full border-2 border-card bg-ink shadow" style={{ left: `${at(price)}%` }} title={`cours ${fmtPrice(price, ccy)}`} />
      </div>
      <div className="num mt-1.5 flex justify-between text-[11px] text-muted">
        <span>zone {fmtPrice(low, ccy)} – {fmtPrice(high, ccy)}</span>
        <span>
          cours <b className="text-ink">{fmtPrice(price, ccy)}</b>
          {z.distance != null && z.distance > 0 && <> · +{(z.distance * 100).toFixed(1).replace(".", ",")} %</>}
        </span>
      </div>
    </div>
  );
}
