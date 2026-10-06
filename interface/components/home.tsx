// home.tsx — les blocs de l'accueil v2 : la course, la semaine en clair, les décisions
// expliquées, le monde qui compte, l'agenda et les fenêtres de décision.
import { AlertTriangle, CalendarClock, Compass, Gavel, Globe2, Lightbulb, ShieldAlert, ShoppingCart, TrendingUp } from "lucide-react";
import type { WeekView, WorldView } from "@/lib/data";
import type { DigestDecision } from "@/lib/types";
import { ACTION_LABEL, DESK_LABEL, SLEEVE_META, WINDOWS, fmtDay, nextBuyWindow } from "@/lib/insights";
import { NewsRow } from "@/components/news";
import { TickerCell } from "@/components/StockDrawer";
import { Badge, Card, CardHead, DemoTag, Empty, Explain, MoreLink, fmtEur, fmtShare } from "@/components/ui";

// ── La semaine en clair ──────────────────────────────────────────────────────────────
const KIND_ICON = { marche: Globe2, portefeuille: TrendingUp, risque: ShieldAlert, opportunite: Lightbulb } as const;
const TONE: Record<string, { cls: string; label: string }> = {
  offensif: { cls: "bg-brand/10 text-brand-600 dark:text-brand-500", label: "Offensif" },
  neutre: { cls: "bg-ai/10 text-amber-700 dark:text-ai", label: "Équilibré" },
  defensif: { cls: "bg-sky-500/10 text-sky-700 dark:text-sky-400", label: "Défensif" },
};

export function WeekCard({ week }: { week: WeekView }) {
  const tone = TONE[week.posture.tone] ?? TONE.neutre;
  return (
    <Card className="h-full animate-fade-up">
      <CardHead
        icon={Compass}
        title="Ce que pense l'IA cette semaine"
        sub={week.updated ? `Mis à jour le ${fmdLong(week.updated)}` : undefined}
        right={<DemoTag show={week.demo} />}
      />
      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tone.cls}`}>{week.posture.label}</span>
        <span className="text-[11px] font-medium uppercase tracking-wide text-muted">{tone.label}</span>
      </div>
      <p className="mt-3 text-[15px] leading-relaxed">{week.posture.line}</p>
      {week.headline && (
        <p className="mt-3 border-l-2 border-brand/60 pl-3 text-[15px] font-medium leading-relaxed text-ink">{week.headline}</p>
      )}
      {week.points.length > 0 ? (
        <ul className="mt-5 space-y-3">
          {week.points.slice(0, 3).map((p, i) => {
            const Icon = KIND_ICON[p.kind ?? "marche"] ?? Globe2;
            return (
              <li key={i} className="flex gap-3">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-500/10 text-slate-600">
                  <Icon size={14} />
                </span>
                <div className="min-w-0">
                  <div className="text-sm font-semibold">{p.title}</div>
                  <div className="text-[13px] leading-relaxed text-muted">{p.text}</div>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        week.derived && (
          <p className="mt-4 text-xs text-muted">
            La synthèse en clair arrive avec la prochaine routine du vendredi. En attendant, la posture vient du régime de marché.
          </p>
        )
      )}
    </Card>
  );
}

function fmdLong(d: string) {
  return fmtDay(d);
}

// ── Les décisions, et pourquoi ───────────────────────────────────────────────────────
export function DecisionsCard({ decisions, demo, href = "/ia#journal" }: { decisions: DigestDecision[]; demo: boolean; href?: string }) {
  return (
    <Card className="h-full animate-fade-up">
      <CardHead
        icon={Gavel}
        title="Les décisions de l'IA — et pourquoi"
        sub="Chaque mouvement avec sa raison et ce qui ferait changer d'avis."
        right={<MoreLink href={href}>Journal</MoreLink>}
      />
      {decisions.length === 0 ? (
        <Empty title="Aucune décision cette semaine">Ne rien faire est souvent la bonne décision : rien n&apos;a changé dans les faits.</Empty>
      ) : (
        <ul className="divide-y divide-line/70">
          {decisions.slice(0, 4).map((d, i) => (
            <DecisionRow key={`${d.ticker}-${i}`} d={d} />
          ))}
        </ul>
      )}
      {demo && <div className="mt-3"><DemoTag show label="Démo" /></div>}
    </Card>
  );
}

export function DecisionRow({ d }: { d: DigestDecision }) {
  const a = ACTION_LABEL[d.action] ?? ACTION_LABEL.conserver;
  const sleeve = d.sleeve ? SLEEVE_META[d.sleeve] : null;
  return (
    <li className="py-3.5 first:pt-0 last:pb-0">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${a.cls}`}>{a.label}</span>
        <TickerCell ticker={d.ticker} name={d.name} />
        {d.name && <span className="text-[13px] text-muted">{d.name}</span>}
        <span className="ml-auto flex items-center gap-2 text-[11px] text-muted">
          {sleeve && (
            <span className="inline-flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: sleeve.color }} />
              {sleeve.short}
            </span>
          )}
          {d.amount_eur ? <span className="num">{fmtEur(d.amount_eur)}</span> : null}
          <span>{fmtDay(d.date)}</span>
        </span>
      </div>
      <p className="mt-1.5 text-[14px] leading-relaxed">{d.why}</p>
      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-muted">
        {d.risk && (
          <span className="inline-flex items-start gap-1">
            <AlertTriangle size={12} className="mt-0.5 shrink-0" /> {d.risk}
          </span>
        )}
        {d.confidence && <span>Confiance {d.confidence.toLowerCase()}</span>}
        {d.desk && <span>{DESK_LABEL[d.desk] ?? d.desk}</span>}
      </div>
    </li>
  );
}

// ── Le monde (aperçu) ────────────────────────────────────────────────────────────────
export function WorldPreview({ world, limit = 3 }: { world: WorldView; limit?: number }) {
  return (
    <Card className="h-full animate-fade-up">
      <CardHead
        icon={Globe2}
        title="Le monde cette semaine"
        sub="Ce qui bouge les marchés, et ce que ça change pour nous."
        right={<MoreLink href="/monde">Tout le monde</MoreLink>}
      />
      {world.news.length === 0 ? (
        <Empty icon={Globe2} title="Pas encore d'actualité structurée">La routine du lundi publiera ici l&apos;actualité mondiale qui compte, en clair.</Empty>
      ) : (
        <ul className="space-y-4">
          {world.news.slice(0, limit).map((n) => (
            <NewsRow key={n.id} n={n} compact />
          ))}
        </ul>
      )}
      <div className="mt-3 flex gap-2">
        <DemoTag show={world.demo} />
        {world.derived && <Badge>Tiré du pouls hebdo</Badge>}
      </div>
    </Card>
  );
}

// ── Agenda ───────────────────────────────────────────────────────────────────────────
export function AgendaCard({ items, demo }: { items: { date: string; label: string; why?: string }[]; demo: boolean }) {
  return (
    <Card className="animate-fade-up">
      <CardHead icon={CalendarClock} title="À l'agenda" sub="Les rendez-vous datés qui peuvent bouger nos lignes." right={<DemoTag show={demo} />} />
      {items.length === 0 ? (
        <Empty title="Rien d'important au calendrier" />
      ) : (
        <ul className="space-y-3">
          {items.slice(0, 4).map((e, i) => {
            const m = e.date.match(/^(\d{4})-(\d{2})-(\d{2})/);
            const months = ["JANV", "FÉVR", "MARS", "AVR", "MAI", "JUIN", "JUIL", "AOÛT", "SEPT", "OCT", "NOV", "DÉC"];
            return (
              <li key={i} className="flex items-start gap-3">
                <div className="well flex h-12 w-12 shrink-0 flex-col items-center justify-center">
                  <span className="num text-[17px] font-semibold leading-none">{m ? Number(m[3]) : "—"}</span>
                  <span className="mt-0.5 text-[9px] font-semibold tracking-wider text-muted">{m ? months[Number(m[2]) - 1] : ""}</span>
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold">{e.label}</div>
                  {e.why && <div className="text-[13px] leading-snug text-muted">{e.why}</div>}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}

// ── Fenêtres de décision ─────────────────────────────────────────────────────────────
export function WindowsStrip() {
  const now = new Date();
  const today = now.getDay();
  const next = nextBuyWindow(now);
  const order = [1, 2, 3, 4, 5, 6, 0];
  return (
    <Card className="animate-fade-up">
      <CardHead
        icon={ShoppingCart}
        title="Quand l'IA décide"
        sub={`Prochaine fenêtre d'achat : ${next.inDays === 0 ? "ce soir" : next.inDays === 1 ? "demain soir" : `dans ${next.inDays} jours`} — ${next.window.title.toLowerCase()}.`}
        right={
          <Explain label="Comment ça marche">
            Les routines tournent la nuit. Les achats long terme n&apos;ont lieu que le vendredi, après une semaine d&apos;analyse ; les coups datés le mercredi ; les ventes défensives le jeudi ; la crypto le dimanche, car elle cote aussi le week-end.
          </Explain>
        }
      />
      <ol className="grid grid-cols-7 gap-1.5">
        {order.map((dow) => {
          const w = WINDOWS.find((x) => x.dow === dow)!;
          const isToday = dow === today;
          return (
            <li
              key={dow}
              title={w.what}
              className={`flex flex-col items-center gap-1 rounded-xl border px-1 py-2.5 text-center transition-colors ${
                isToday ? "border-brand/40 bg-brand/[0.07]" : "border-line/70 bg-elev"
              }`}
            >
              <span className={`text-[11px] font-semibold ${isToday ? "text-brand-600 dark:text-brand-500" : "text-muted"}`}>{w.day}</span>
              <span className="hidden text-[11px] font-medium leading-tight sm:block">{w.title}</span>
              <span className="flex h-4 items-center gap-0.5">
                {w.buys && <span className="h-1.5 w-1.5 rounded-full bg-brand" title="achats" />}
                {w.sells && <span className="h-1.5 w-1.5 rounded-full bg-danger" title="ventes" />}
              </span>
            </li>
          );
        })}
      </ol>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted">
        <span className="inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-brand" /> achats possibles</span>
        <span className="inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-danger" /> ventes possibles</span>
        <span>Aujourd&apos;hui : <b className="text-ink">{WINDOWS.find((x) => x.dow === today)?.what}</b></span>
      </div>
    </Card>
  );
}

// ── Cash vs réserve cible ────────────────────────────────────────────────────────────
export function CashNote({ cash, nav }: { cash: number; nav: number }) {
  const share = nav ? cash / nav : 0;
  const ok = share >= 0.05 && share <= 0.15;
  return (
    <span className={`text-[12px] ${ok ? "text-muted" : "text-amber-700 dark:text-ai"}`}>
      Cash {fmtShare(share)} {ok ? "· dans la réserve visée (≈ 10 %)" : share > 0.15 ? "· au-dessus des 10 % visés, en cours de déploiement" : "· sous la réserve minimale"}
    </span>
  );
}
