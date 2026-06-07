import type { Mover } from "@/lib/data";
import { TickerCell } from "@/components/StockDrawer";

function pctSigned(n: number): string {
  return `${n >= 0 ? "+" : ""}${(n * 100).toFixed(1).replace(".", ",")} %`;
}

function Row({ m }: { m: Mover }) {
  const up = m.changePct >= 0;
  return (
    <li className="flex items-center justify-between py-1.5 text-sm">
      <TickerCell ticker={m.ticker} />
      <span className={`chip ${up ? "bg-brand/10 text-brand-600" : "bg-danger/10 text-danger"}`}>
        {up ? "▲" : "▼"} {pctSigned(m.changePct)}
      </span>
    </li>
  );
}

export function TopMovers({ gainers, losers }: { gainers: Mover[]; losers: Mover[] }) {
  if (gainers.length === 0 && losers.length === 0) {
    return <p className="text-sm text-muted">Variation du jour indisponible pour l&apos;instant.</p>;
  }
  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
      <div>
        <h3 className="label mb-1 text-brand-600">▲ Plus fortes hausses</h3>
        <ul className="divide-y divide-line/50">
          {gainers.length ? gainers.map((m) => <Row key={m.ticker} m={m} />) : <li className="py-1.5 text-sm text-muted">—</li>}
        </ul>
      </div>
      <div>
        <h3 className="label mb-1 text-danger">▼ Plus fortes baisses</h3>
        <ul className="divide-y divide-line/50">
          {losers.length ? losers.map((m) => <Row key={m.ticker} m={m} />) : <li className="py-1.5 text-sm text-muted">—</li>}
        </ul>
      </div>
    </div>
  );
}
