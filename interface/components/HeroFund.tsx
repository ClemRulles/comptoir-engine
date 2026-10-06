"use client";

// HeroFund — le premier écran : « à combien on est ». Un grand montant à rouleaux, la courbe
// RÉELLE du fonds depuis le début, teintée vert/rouge selon la période, un halo de la même
// couleur, un point qui pulse au bout. Au doigt ou à la souris, le montant suit la date
// survolée. Courbe en SVG maison (pas de librairie) : légère et fluide sur mobile.
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, ArrowDownRight, ArrowUpRight, Bot, Globe2, HandCoins, Users } from "lucide-react";
import { Odometer } from "@/components/Odometer";
import { ruleSentence, type ContribRule } from "@/lib/contrib-rule";

type Pt = { date: string; v: number };
type Flow = { date: string; amount: number };

const RANGES = [
  { key: "1S", label: "1S", days: 7, word: "cette semaine" },
  { key: "1M", label: "1M", days: 30, word: "ce mois-ci" },
  { key: "3M", label: "3M", days: 91, word: "sur 3 mois" },
  { key: "ALL", label: "Tout", days: Infinity, word: "depuis le début" },
] as const;

const MONTHS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
const dayLabel = (d: string) => {
  const [y, m, day] = d.split("-");
  return `${Number(day)} ${MONTHS[Number(m) - 1]} ${y}`;
};
const shortDay = (d?: string) => {
  if (!d) return "";
  const [, m, day] = d.split("-");
  return `${Number(day)} ${MONTHS[Number(m) - 1]}`;
};
const eur0 = (v: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(v);
const signedEur = (v: number) => `${v >= 0 ? "+" : "−"}${eur0(Math.abs(v))}`;
const signedPct = (v: number) => `${v >= 0 ? "+" : "−"}${Math.abs(v * 100).toFixed(1).replace(".", ",")} %`;

// Fenêtre + mesures : gain en € HORS apports et performance pondérée dans le temps (même
// définition que lib/perf.ts — un versement n'est jamais un gain).
function useWindow(points: Pt[], flows: Flow[], range: string) {
  return useMemo(() => {
    if (points.length < 2) return { win: points, idx: points.map(() => 1), flowsTo: points.map(() => 0) };
    const r = RANGES.find((x) => x.key === range)!;
    let a = 0;
    if (Number.isFinite(r.days)) {
      const cut = new Date(points[points.length - 1].date);
      cut.setDate(cut.getDate() - r.days);
      const from = cut.toISOString().slice(0, 10);
      for (let i = 0; i < points.length; i++) if (points[i].date <= from) a = i;
    }
    const win = points.slice(a);
    const idx: number[] = [1];
    const flowsTo: number[] = [0];
    for (let i = 1; i < win.length; i++) {
      const f = flows.filter((x) => x.date > win[i - 1].date && x.date <= win[i].date).reduce((s, x) => s + x.amount, 0);
      idx.push(idx[i - 1] * ((win[i].v - f) / win[i - 1].v));
      flowsTo.push(flowsTo[i - 1] + f);
    }
    return { win, idx, flowsTo };
  }, [points, flows, range]);
}

// Courbe lissée monotone (Fritsch-Carlson) : pas de dépassement artificiel entre deux points.
function smoothPath(xs: number[], ys: number[]): string {
  const n = xs.length;
  if (n < 2) return "";
  const dx = xs.slice(1).map((x, i) => x - xs[i]);
  const s = ys.slice(1).map((y, i) => (y - ys[i]) / (dx[i] || 1));
  const m = [s[0], ...s.slice(1).map((v, i) => (v * s[i] <= 0 ? 0 : (v + s[i]) / 2)), s[n - 2]];
  for (let i = 0; i < n - 1; i++) {
    if (s[i] === 0) {
      m[i] = 0;
      m[i + 1] = 0;
      continue;
    }
    const a = m[i] / s[i], b = m[i + 1] / s[i];
    const h = a * a + b * b;
    if (h > 9) {
      const t = 3 / Math.sqrt(h);
      m[i] = t * a * s[i];
      m[i + 1] = t * b * s[i];
    }
  }
  let d = `M${xs[0].toFixed(2)},${ys[0].toFixed(2)}`;
  for (let i = 0; i < n - 1; i++) {
    const h = dx[i] / 3;
    d += ` C${(xs[i] + h).toFixed(2)},${(ys[i] + m[i] * h).toFixed(2)} ${(xs[i + 1] - h).toFixed(2)},${(ys[i + 1] - m[i + 1] * h).toFixed(2)} ${xs[i + 1].toFixed(2)},${ys[i + 1].toFixed(2)}`;
  }
  return d;
}

export function HeroFund({
  title = "Notre fonds",
  points,
  flows,
  aiPoints,
  market,
  demo,
  compare = { label: "Fonds IA", href: "/ia", tone: "ai" },
  contrib,
  tone = "group",
}: {
  title?: string;
  points: Pt[];
  flows: Flow[];
  aiPoints: Pt[]; // série de l'autre fonds, affichée en seconde lecture (tuile `compare`)
  market: Record<string, number> | null;
  demo: boolean;
  compare?: { label: string; href: string; tone: "ai" | "group" };
  contrib?: ContribRule; // règle des apports, rappelée sous la courbe
  tone?: "ai" | "group"; // couleur du fonds affiché : vert (groupe) ou orange (IA)
}) {
  const [range, setRange] = useState<string>("3M");
  const [hover, setHover] = useState<number | null>(null);
  const { win, idx, flowsTo } = useWindow(points, flows, range);
  const ai = useWindow(aiPoints, flows, range);
  const boxRef = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(720);
  const H = 230;

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver((e) => setW(Math.max(280, Math.round(e[0].contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const last = win.length - 1;
  const at = hover ?? last;
  const value = win[at]?.v ?? 0;
  // Arrondi à l'euro AVANT soustraction : départ + apports + gains retombe pile sur le montant affiché.
  const gain = win.length ? Math.round(value) - Math.round(win[0].v) - Math.round(flowsTo[at]) : 0;
  const perf = idx.length ? idx[at] - 1 : 0;
  const rangePerf = idx.length ? idx[last] - 1 : 0;
  const up = (hover == null ? rangePerf : perf) >= 0;
  const r = RANGES.find((x) => x.key === range)!;

  // Géométrie
  const pad = { t: 18, b: 22 };
  const { xs, ys, path, area, baseY } = useMemo(() => {
    if (win.length < 2) return { xs: [], ys: [], path: "", area: "", baseY: 0 };
    const vals = win.map((p) => p.v);
    let lo = Math.min(...vals), hi = Math.max(...vals);
    const span = hi - lo || hi * 0.01 || 1;
    lo -= span * 0.12;
    hi += span * 0.12;
    const t0 = new Date(win[0].date).getTime(), t1 = new Date(win[last].date).getTime();
    // 16 px de marge à droite : le point final et son halo restent entiers dans la carte.
    const xs = win.map((p) => ((new Date(p.date).getTime() - t0) / Math.max(1, t1 - t0)) * (w - 20) + 4);
    const ys = vals.map((v) => pad.t + (1 - (v - lo) / (hi - lo)) * (H - pad.t - pad.b));
    const path = smoothPath(xs, ys);
    const area = `${path} L${xs[xs.length - 1].toFixed(2)},${H} L${xs[0].toFixed(2)},${H} Z`;
    const baseY = pad.t + (1 - (vals[0] - lo) / (hi - lo)) * (H - pad.t - pad.b);
    return { xs, ys, path, area, baseY };
  }, [win, w, last, pad.t, pad.b]);

  // Apports des membres visibles sur la courbe : un anneau au point où l'apport est entré (la
  // marche qu'on voit dans la courbe), avec son montant quand la place le permet.
  const flowMarks = useMemo(() => {
    const out: { i: number; amount: number; label: boolean }[] = [];
    if (xs.length < 2) return out;
    for (const f of flows) {
      if (f.date <= win[0].date || f.date > win[last].date) continue;
      const i = win.findIndex((p) => p.date >= f.date);
      if (i < 0) continue;
      const prev = out[out.length - 1];
      if (prev && prev.i === i) prev.amount += f.amount;
      else out.push({ i, amount: f.amount, label: false });
    }
    let lastX = -Infinity;
    for (const m of out) if (xs[m.i] - lastX >= 56) { m.label = true; lastX = xs[m.i]; }
    return out;
  }, [flows, win, last, xs, w]);
  const flowAt = hover != null ? flowMarks.find((m) => m.i === hover) : undefined;

  // Survol cadencé sur l'affichage (1 calcul par image) : fluide même sur un vieux téléphone.
  const raf = useRef<number | null>(null);
  const onMove = useCallback(
    (clientX: number) => {
      if (raf.current != null) return;
      raf.current = requestAnimationFrame(() => {
        raf.current = null;
        const el = boxRef.current;
        if (!el || xs.length < 2) return;
        const x = clientX - el.getBoundingClientRect().left;
        let best = 0;
        for (let i = 1; i < xs.length; i++) if (Math.abs(xs[i] - x) < Math.abs(xs[best] - x)) best = i;
        setHover((h) => (h === best ? h : best));
      });
    },
    [xs]
  );
  useEffect(() => () => { if (raf.current != null) cancelAnimationFrame(raf.current); }, []);

  const isAi = tone === "ai";
  // La couleur de la courbe identifie le fonds (orange IA, vert groupe, rouge si le groupe baisse) ;
  // pour l'IA elle reste orange en baisse, c'est la pastille (rouge) qui dit la tendance.
  const color = isAi ? "#d97706" : up ? "#16a34a" : "#ef4444";
  const colorSoft = isAi ? "#f59e0b" : up ? "#22c55e" : "#f87171";
  const posText = isAi ? "text-amber-700 dark:text-ai" : "text-brand-600 dark:text-brand-500";
  const posBg = isAi ? "bg-ai/[0.14]" : "bg-brand/[0.12]";
  const posBorder = isAi ? "border-ai/30" : "border-brand/25";
  const mk = useMemo(() => {
    if (!market || win.length < 2) return null;
    const md = Object.keys(market).sort();
    const pick = (d: string) => {
      let v: number | null = null;
      for (const k of md) if (k <= d) v = market[k];
      return v;
    };
    const a = pick(win[0].date), b = pick(win[last].date);
    return a && b ? b / a - 1 : null;
  }, [market, win, last]);
  // Dernière séance : variation hors apports entre les deux derniers points de la série complète.
  const day = useMemo(() => {
    const n = points.length;
    if (n < 2) return null;
    const a = points[n - 2], b = points[n - 1];
    const f = flows.filter((x) => x.date > a.date && x.date <= b.date).reduce((s, x) => s + x.amount, 0);
    return { date: b.date, eur: b.v - a.v - f, pct: (b.v - f) / a.v - 1 };
  }, [points, flows]);
  const aiPerf = ai.idx.length ? ai.idx[ai.idx.length - 1] - 1 : null;
  const aiNav = aiPoints[aiPoints.length - 1]?.v ?? null;

  return (
    <section className={`hero-fund relative overflow-hidden rounded-[28px] border border-line/70 bg-card ${up ? "is-up" : "is-down"} ${isAi ? "tone-ai" : ""}`}>
      {/* Halo d'ambiance, teinté par la tendance de la période (transition douce). */}
      <div aria-hidden className="hero-aura pointer-events-none absolute inset-0" />
      <div className="relative px-5 pb-4 pt-5 md:px-8 md:pt-7">
        <div className="flex items-center justify-between gap-3">
          <div className="eyebrow flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" style={{ background: color }} />
              <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: color }} />
            </span>
            {title}
            {demo && <span className="rounded-full bg-ai/15 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-ai">DÉMO</span>}
          </div>
          {day && (
            <span className={`hero-day inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] font-semibold tabular-nums ${day.pct >= 0 ? `${posBorder} ${posText}` : "border-danger/25 text-danger"}`} title="Variation sur la dernière séance, hors apports">
              <span className="font-normal text-muted">{shortDay(day.date)}</span>
              {day.pct >= 0 ? "▲" : "▼"} {signedPct(day.pct).replace(/^[+−]/, "")}
              <span className="hidden font-normal sm:inline">· {signedEur(day.eur)}</span>
            </span>
          )}
        </div>

        <div className="mt-3 md:mt-4">
          <Odometer text={eur0(value)} className="text-[44px] font-semibold leading-none tracking-[-0.035em] sm:text-[56px] md:text-[64px]" />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
          <span key={`${range}-${up}`} className={`hero-pill inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[13px] font-semibold tabular-nums ${up ? `${posBg} ${posText}` : "bg-danger/10 text-danger"}`}>
            {up ? <ArrowUpRight size={15} strokeWidth={2.5} className="hero-arrow" /> : <ArrowDownRight size={15} strokeWidth={2.5} className="hero-arrow" />}
            {signedEur(gain)} · {signedPct(perf)}
          </span>
          <span className="text-[13px] text-muted">
            {hover == null ? r.word : dayLabel(win[at].date)}
            {flowAt && <span className="font-medium text-ink"> · apport des membres +{eur0(flowAt.amount)}</span>}
          </span>
        </div>
      </div>

      {/* Courbe */}
      <div
        ref={boxRef}
        className="relative h-[230px] w-full select-none"
        style={{ touchAction: "pan-y" }}
        onPointerMove={(e) => onMove(e.clientX)}
        onPointerDown={(e) => onMove(e.clientX)}
        onPointerLeave={() => setHover(null)}
        onPointerUp={(e) => e.pointerType !== "mouse" && setHover(null)}
        onPointerCancel={() => setHover(null)}
      >
        {xs.length >= 2 ? (
          <svg width={w} height={H} viewBox={`0 0 ${w} ${H}`} className="absolute inset-0 overflow-visible" role="img" aria-label={`Valeur du fonds ${r.word}`}>
            <defs>
              <linearGradient id="hero-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={colorSoft} stopOpacity="0.32" />
                <stop offset="70%" stopColor={colorSoft} stopOpacity="0.04" />
                <stop offset="100%" stopColor={colorSoft} stopOpacity="0" />
              </linearGradient>
              <linearGradient id="hero-stroke" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={colorSoft} stopOpacity="0.55" />
                <stop offset="100%" stopColor={color} />
              </linearGradient>
            </defs>
            <line x1="0" x2={w} y1={baseY} y2={baseY} stroke="rgb(var(--chart-axis))" strokeOpacity="0.45" strokeDasharray="2 5" />
            <path key={`a-${range}`} d={area} fill="url(#hero-fill)" className="hero-area" />
            <path key={`l-${range}`} d={path} fill="none" stroke="url(#hero-stroke)" strokeWidth={2.75} strokeLinecap="round" strokeLinejoin="round" pathLength={1} className="hero-line" />
            {flowMarks.map((m) => (
              <g key={`f-${range}-${m.i}`} className="hero-flow">
                <circle cx={xs[m.i]} cy={ys[m.i]} r={4} fill="rgb(var(--c-card))" stroke="rgb(var(--c-ink))" strokeOpacity={0.55} strokeWidth={1.75} />
                {m.label && hover == null && (
                  <text
                    x={xs[m.i] > w - 44 ? xs[m.i] + 6 : xs[m.i]}
                    y={ys[m.i] < 34 ? ys[m.i] + 18 : ys[m.i] - 10}
                    textAnchor={xs[m.i] > w - 44 ? "end" : "middle"}
                    fontSize={10.5}
                    fontWeight={600}
                    fill="rgb(var(--c-muted))"
                  >
                    +{eur0(m.amount)}
                  </text>
                )}
              </g>
            ))}
            {hover != null ? (
              <g>
                <line x1={xs[at]} x2={xs[at]} y1={8} y2={H - 6} stroke="rgb(var(--c-ink))" strokeOpacity="0.18" />
                <circle cx={xs[at]} cy={ys[at]} r={6} fill={color} stroke="rgb(var(--c-card))" strokeWidth={3} />
              </g>
            ) : (
              <g key={`e-${range}`} className="hero-end">
                <circle cx={xs[last]} cy={ys[last]} r={11} fill={color} opacity={0.18} className="hero-pulse" style={{ transformOrigin: `${xs[last]}px ${ys[last]}px` }} />
                <circle cx={xs[last]} cy={ys[last]} r={5.5} fill={color} stroke="rgb(var(--c-card))" strokeWidth={2.5} />
              </g>
            )}
          </svg>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted">La courbe apparaîtra après la première valorisation quotidienne.</div>
        )}
        {win.length >= 2 && (
          <div className="pointer-events-none absolute inset-x-4 bottom-0 flex justify-between text-[11px] text-muted md:inset-x-8">
            <span>{dayLabel(win[0].date)}</span>
            <span>{dayLabel(win[last].date)}</span>
          </div>
        )}
      </div>

      <div className="relative flex flex-wrap items-center justify-between gap-3 px-5 pb-5 pt-4 md:px-8">
        <div className="seg" role="tablist" aria-label="Période">
          {RANGES.map((x) => (
            <button key={x.key} role="tab" aria-selected={range === x.key} onClick={() => { setRange(x.key); setHover(null); }} className={`seg-btn px-3 ${range === x.key ? "seg-btn-active" : ""}`}>
              {x.label}
            </button>
          ))}
        </div>
        <span className="flex items-start gap-1.5 text-[11px] leading-snug text-muted sm:max-w-[60%] sm:text-right">
          <svg width="10" height="10" viewBox="0 0 10 10" className="mt-[2px] shrink-0" aria-hidden>
            <circle cx="5" cy="5" r="3.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <span>
            {contrib && contrib.members > 0 ? <>Apports : {ruleSentence(contrib)}.</> : "Apports des membres."} Jamais comptés comme des gains.
          </span>
        </span>
      </div>

      {/* Contexte : l'IA et le marché, en seconde lecture. */}
      <div className="relative grid grid-cols-1 gap-px border-t border-line/70 bg-line/60 sm:grid-cols-3">
        <Link href={compare.href} className="group flex items-center gap-3 bg-card/80 px-5 py-3.5 transition-colors hover:bg-bg md:px-6">
          <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${compare.tone === "ai" ? "bg-ai/[0.12] text-amber-700 dark:text-ai" : "bg-brand/10 text-brand-600 dark:text-brand-500"}`}>
            {compare.tone === "ai" ? <Bot size={17} /> : <Users size={17} />}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[12px] text-muted">{compare.label}</span>
            <span className="num block text-[15px] font-semibold">
              {aiNav != null ? eur0(aiNav) : "—"}
              {aiPerf != null && <span className={`ml-2 text-[12px] ${aiPerf >= 0 ? "text-brand-600 dark:text-brand-500" : "text-danger"}`}>{signedPct(aiPerf)}</span>}
            </span>
          </span>
          <Spark pts={ai.win.map((p) => p.v)} color={compare.tone === "ai" ? "#d97706" : "#15803d"} />
          <ArrowRight size={15} className="text-muted transition-transform group-hover:translate-x-0.5" />
        </Link>
        <div className="flex items-center gap-3 bg-card/80 px-5 py-3.5 md:px-6">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-700 dark:text-sky-400"><Globe2 size={17} /></span>
          <span>
            <span className="block text-[12px] text-muted">Marché mondial (MSCI World)</span>
            <span className="num block text-[15px] font-semibold">{mk != null ? signedPct(mk) : "—"} <span className="text-[12px] font-normal text-muted">{r.word}</span></span>
          </span>
        </div>
        {/* D'où vient le montant : départ + apports + gains = valeur affichée (au centime près). */}
        <div className="flex items-center gap-3 bg-card/80 px-5 py-3.5 md:px-6">
          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${isAi ? "bg-ai/[0.12]" : "bg-brand/10"} ${posText}`}><HandCoins size={17} /></span>
          <span className="grid min-w-0 flex-1 grid-cols-[auto_auto_auto_auto_auto] items-end justify-start gap-x-2 text-[12px] text-muted">
            <span>{shortDay(win[0]?.date)}</span>
            <span />
            <span>Apports</span>
            <span />
            <span>Gains</span>
            <span className="num text-[15px] font-semibold text-ink">{eur0(win[0]?.v ?? 0)}</span>
            <span className="pb-px">+</span>
            <span className="num text-[15px] font-semibold text-ink">{eur0(flowsTo[at] ?? 0)}</span>
            <span className="pb-px">{gain >= 0 ? "+" : "−"}</span>
            <span className={`num text-[15px] font-semibold ${gain >= 0 ? posText : "text-danger"}`}>{eur0(Math.abs(gain))}</span>
          </span>
        </div>
      </div>
    </section>
  );
}

// Mini-courbe de l'autre fonds, à sa couleur (ambre IA / vert groupe) : la couleur suit le fonds,
// le signe du % dit la tendance. Sous-échantillonnée : 64 px n'affichent pas 90 points.
function Spark({ pts: all, color }: { pts: number[]; color: string }) {
  if (all.length < 2) return null;
  const step = Math.max(1, Math.ceil(all.length / 28));
  const pts = all.filter((_, i) => i % step === 0 || i === all.length - 1);
  const W = 64, H = 26;
  const lo = Math.min(...pts), hi = Math.max(...pts);
  const xs = pts.map((_, i) => (i / (pts.length - 1)) * W);
  const ys = pts.map((v) => H - 2 - ((v - lo) / (hi - lo || 1)) * (H - 4));
  return (
    <svg width={W} height={H} className="shrink-0" aria-hidden>
      <path d={smoothPath(xs, ys)} fill="none" stroke={color} strokeWidth={1.75} strokeLinecap="round" />
    </svg>
  );
}
