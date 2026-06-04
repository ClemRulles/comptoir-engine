import type { CatalystRow } from "@/lib/types";

const MONTHS = ["jan", "fév", "mar", "avr", "mai", "jun", "jul", "aoû", "sep", "oct", "nov", "déc"];

function fmtDate(d: string): { day: string; month: string } | null {
  const m = d.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  return { day: m[3], month: MONTHS[Number(m[2]) - 1] ?? m[2] };
}

function typeChip(type: string): string {
  const t = type.toLowerCase();
  if (t.startsWith("macro")) return "bg-sky-100 text-sky-700";
  if (t.startsWith("poli")) return "bg-violet-100 text-violet-700";
  if (t.startsWith("régl") || t.startsWith("regl")) return "bg-teal-100 text-teal-700";
  if (t.startsWith("micro")) return "bg-brand/10 text-brand-600";
  return "bg-slate-100 text-slate-600";
}

function statusChip(status: string): { cls: string; label: string } {
  const s = status.toLowerCase();
  if (s.includes("actif")) return { cls: "bg-ai/15 text-amber-700", label: "Anticipé" };
  if (s.includes("pass")) return { cls: "bg-slate-100 text-slate-500", label: "Passé" };
  return { cls: "bg-slate-100 text-slate-600", label: status || "À surveiller" };
}

function riskTone(risk: string): string {
  return /binaire/i.test(risk) ? "text-danger" : "text-slate-500";
}

function CatalystCard({ row }: { row: CatalystRow }) {
  const d = fmtDate(row.date);
  const st = statusChip(row.status);
  return (
    <li className="flex gap-4 border-b border-line/60 py-3.5 last:border-0">
      <div className="flex w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-bg py-1.5 text-center">
        {d ? (
          <>
            <span className="text-lg font-bold leading-none tabular-nums">{d.day}</span>
            <span className="text-[10px] uppercase text-muted">{d.month}</span>
          </>
        ) : (
          <span className="text-[10px] text-muted">{row.date}</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold">{row.event}</span>
          <span className={`chip ${typeChip(row.type)}`}>{row.type}</span>
          <span className={`chip ${st.cls}`}>{st.label}</span>
        </div>
        <div className="mt-1 text-sm text-slate-600">
          <span className="text-muted">Impacte&nbsp;:</span> {row.affects}
          {row.risk && (
            <>
              {" · "}
              <span className={riskTone(row.risk)}>risque {row.risk}</span>
            </>
          )}
        </div>
        {row.positioning && row.positioning !== "—" && (
          <div className="mt-1 text-sm text-slate-500">
            <span className="font-medium text-slate-600">Posture&nbsp;:</span> {row.positioning}
          </div>
        )}
      </div>
    </li>
  );
}

export function CatalystsList({ upcoming, past }: { upcoming: CatalystRow[]; past: CatalystRow[] }) {
  if (upcoming.length === 0 && past.length === 0) {
    return (
      <p className="text-sm text-muted">
        Aucun catalyseur listé pour l&apos;instant — le Trend Radar du lundi remplit le calendrier.
      </p>
    );
  }
  return (
    <div className="space-y-6">
      {upcoming.length > 0 && (
        <ul>
          {upcoming.map((r, i) => (
            <CatalystCard key={`${r.date}-${r.event}-${i}`} row={r} />
          ))}
        </ul>
      )}
      {past.length > 0 && (
        <div>
          <h3 className="label mb-2">Passés — ce qu&apos;on en a tiré</h3>
          <ul className="opacity-80">
            {past.map((r, i) => (
              <CatalystCard key={`past-${r.date}-${r.event}-${i}`} row={r} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
