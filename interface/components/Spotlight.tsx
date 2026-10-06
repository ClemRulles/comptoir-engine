// Spotlight — « Cette semaine » sur l'accueil : la phrase de la semaine et DEUX carrés qui
// sautent aux yeux (sur quoi l'IA investirait, ce qu'elle a à l'œil). Un clic mène aux analyses.
import Link from "next/link";
import { ArrowUpRight, CalendarDays, Eye, Sparkles, TrendingUp } from "lucide-react";
import { DemoTag } from "@/components/ui";
import type { SpotlightView, SpotTile } from "@/lib/data";

const TONE_CHIP: Record<string, string> = {
  offensif: "bg-brand/10 text-brand-600 dark:text-brand-500",
  neutre: "bg-ai/10 text-amber-700 dark:text-ai",
  defensif: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
};

const TILE: Record<SpotTile["tone"], { box: string; icon: typeof Eye; iconCls: string }> = {
  buy: { box: "from-brand/[0.16] via-brand/[0.06] to-transparent ring-brand/25", icon: TrendingUp, iconCls: "bg-brand/15 text-brand-600 dark:text-brand-500" },
  none: { box: "from-slate-500/[0.12] via-slate-500/[0.04] to-transparent ring-line", icon: Sparkles, iconCls: "bg-slate-500/15 text-slate-600 dark:text-slate-300" },
  watch: { box: "from-ai/[0.18] via-ai/[0.06] to-transparent ring-ai/25", icon: Eye, iconCls: "bg-ai/15 text-amber-700 dark:text-ai" },
  event: { box: "from-sky-500/[0.16] via-sky-500/[0.05] to-transparent ring-sky-500/25", icon: CalendarDays, iconCls: "bg-sky-500/15 text-sky-700 dark:text-sky-400" },
};

export function Spotlight({ view }: { view: SpotlightView }) {
  return (
    <section aria-labelledby="week-title" className="animate-fade-up">
      <div className="mb-3 flex items-end justify-between gap-3 px-1">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 id="week-title" className="eyebrow">Cette semaine, en une phrase</h2>
            <DemoTag show={view.demo} />
          </div>
          <p className="mt-1.5 text-[15px] font-medium leading-snug text-ink md:text-base">
            <span className={`mr-2 inline-flex translate-y-[-1px] rounded-full px-2 py-0.5 align-middle text-[11px] font-semibold ${TONE_CHIP[view.posture.tone] ?? TONE_CHIP.neutre}`}>{view.posture.label}</span>
            {view.phrase}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        {view.tiles.map((t, i) => (
          <Tile key={i} t={t} />
        ))}
      </div>
    </section>
  );
}

function Tile({ t }: { t: SpotTile }) {
  const s = TILE[t.tone];
  const Icon = s.icon;
  const long = t.value.length > 16;
  return (
    <Link
      href={t.href}
      className={`spot-tile group relative flex min-h-[148px] flex-col overflow-hidden rounded-3xl bg-card bg-gradient-to-br p-4 ring-1 transition duration-200 hover:-translate-y-0.5 hover:shadow-lift active:translate-y-0 md:min-h-[168px] md:p-5 ${s.box}`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className={`flex h-8 w-8 items-center justify-center rounded-xl ${s.iconCls}`}>
          <Icon size={16} strokeWidth={2.2} />
        </span>
        <span className="flex items-center gap-1.5">
          {t.fresh && (
            <span className="relative flex h-2 w-2" title="Nouveau">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand" />
            </span>
          )}
          <ArrowUpRight size={16} className="text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
      </div>
      <p className="mt-3 text-[11.5px] font-medium leading-tight text-muted md:text-[12px]">{t.eyebrow}</p>
      <p
        className={`mt-1 font-semibold leading-tight tracking-tight ${t.tone === "none" ? "text-slate-500 dark:text-slate-300" : "text-ink"} ${
          long ? "text-[16px] md:text-lg" : "text-[24px] md:text-[28px]"
        }`}
      >
        {t.value}
        {t.label && <span className="ml-1.5 align-middle text-[11px] font-semibold tracking-normal text-muted">{t.label}</span>}
      </p>
      {t.sub && <p className="mt-auto line-clamp-3 pt-2 text-[12px] leading-snug text-muted md:text-[13px]">{t.sub}</p>}
    </Link>
  );
}
