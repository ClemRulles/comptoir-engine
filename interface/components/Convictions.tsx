import type { ConvictionItem } from "@/lib/types";
import { TickerCell } from "@/components/StockDrawer";

const VERDICT_CLS: Record<string, string> = {
  Acheter: "bg-brand/10 text-brand-600",
  Surveiller: "bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300",
  "Éviter": "bg-danger/10 text-danger",
};
const VERDICT_DOT: Record<string, string> = { Acheter: "🟢", Surveiller: "🟠", "Éviter": "🔴" };
const CONF_CLS: Record<string, string> = {
  Haute: "bg-brand/10 text-brand-600",
  Moyenne: "bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300",
  Basse: "bg-slate-100 text-slate-500 dark:bg-slate-400/15 dark:text-slate-300",
};

// Top convictions de l'IA (verdicts du deep-dive du mercredi). Max 3 par défaut.
export function Convictions({
  items,
  demo,
  updated,
  limit = 3,
}: {
  items: ConvictionItem[];
  demo: boolean;
  updated?: string;
  limit?: number;
}) {
  const top = items.slice(0, limit);
  return (
    <div className="card-p">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-bold tracking-tight">🎯 Convictions de l&apos;IA</h3>
          <span className="text-xs text-muted">top {top.length}</span>
        </div>
        {demo ? (
          <span className="chip bg-slate-100 text-slate-500">Démo</span>
        ) : updated ? (
          <span className="text-xs text-muted">maj {updated}</span>
        ) : null}
      </div>

      {top.length === 0 ? (
        <p className="text-sm text-muted">Aucune analyse cette semaine.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {top.map((c) => (
            <div key={c.ticker} className="flex flex-col rounded-2xl border border-line bg-bg/40 p-4">
              <div className="flex items-center justify-between">
                <TickerCell ticker={c.ticker} logoSize={26} />
                <span className={`chip text-xs ${VERDICT_CLS[c.verdict] ?? "bg-slate-100 text-slate-500"}`}>
                  {VERDICT_DOT[c.verdict] ?? ""} {c.verdict}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-1.5">
                <span className={`chip text-xs ${CONF_CLS[c.confidence] ?? ""}`}>Confiance {c.confidence}</span>
                {c.horizon && <span className="chip bg-bg text-muted text-xs">{c.horizon}</span>}
              </div>
              <p className="mt-2.5 text-sm text-ink">{c.thesis}</p>
              {c.risk && (
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-semibold">⚠ Risque :</span> {c.risk}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="mt-3 text-xs text-muted">
        Verdicts du <strong>deep-dive du mercredi</strong> (débat haussier/baissier). La confiance n&apos;est
        pas une probabilité de hausse : c&apos;est la force des preuves. Paper trading.
      </p>
    </div>
  );
}
