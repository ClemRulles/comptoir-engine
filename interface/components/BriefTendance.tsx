"use client";

import { useCallback, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Week {
  total: number;
  index: number;
  demo: boolean;
  date: string | null;
  message: string | null;
  brief: string | null;
  tendance: string | null;
  regime: string | null;
}

function fmtWeek(date: string | null): string {
  if (!date) return "Semaine courante";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "Semaine courante";
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

export function BriefTendance() {
  const [week, setWeek] = useState<Week | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (i: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/brief-week?i=${i}`);
      const data = (await res.json()) as Week;
      setWeek(data);
    } catch {
      setWeek(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load(0);
  }, [load]);

  const idx = week?.index ?? 0;
  const total = week?.total ?? 0;
  // index 0 = semaine la plus récente ; aller « avant » = index plus grand (plus ancien).
  const canNewer = idx > 0;
  const canOlder = total > 0 && idx < total - 1;

  const empty = !loading && (!week || (!week.brief && !week.tendance && !week.regime));

  return (
    <div className="space-y-4">
      {/* En-tête + navigation semaine */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-bold tracking-tight">Brief &amp; Tendance de la semaine</h2>
          <p className="truncate text-xs text-muted">
            {loading
              ? "Chargement…"
              : week?.demo
              ? "Démonstration"
              : `${fmtWeek(week?.date ?? null)}${total > 1 ? ` · semaine ${total - idx}/${total}` : ""}`}
          </p>
        </div>
        {total > 1 && (
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => canOlder && load(idx + 1)}
              disabled={!canOlder || loading}
              aria-label="Semaine précédente"
              className="btn btn-ghost h-8 w-8 rounded-full p-0 disabled:opacity-30"
              title="Semaine précédente"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => canNewer && load(idx - 1)}
              disabled={!canNewer || loading}
              aria-label="Semaine suivante"
              className="btn btn-ghost h-8 w-8 rounded-full p-0 disabled:opacity-30"
              title="Semaine suivante"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          <div className="skeleton h-5 w-48" />
          <div className="skeleton h-24 w-full rounded-xl" />
          <div className="skeleton h-40 w-full rounded-xl" />
        </div>
      ) : empty ? (
        <div className="card-p text-sm text-muted">
          Le brief et la tendance seront générés par les routines (Trend Radar le lundi,
          Brief le vendredi).
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Régime — issu du Trend Radar du lundi */}
          {week?.regime && (
            <div className="card-p lg:col-span-1">
              <div className="label mb-2">Régime de marché · lundi</div>
              <div className="prose-hi text-sm">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{week.regime}</ReactMarkdown>
              </div>
            </div>
          )}

          {/* Brief + tendance */}
          <div className={`space-y-4 ${week?.regime ? "lg:col-span-2" : "lg:col-span-3"}`}>
            {week?.brief && (
              <div className="card-p">
                <div className="label mb-2">Brief · vendredi</div>
                <div className="prose-hi">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{week.brief}</ReactMarkdown>
                </div>
              </div>
            )}
            {week?.tendance && (
              <div className="card-p">
                <div className="label mb-2">Tendance détaillée · Trend Radar du lundi</div>
                <div className="prose-hi">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{week.tendance}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
