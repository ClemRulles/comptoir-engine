"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TickerLogo } from "@/components/TickerLogo";

// ── Contexte global : permet à n'importe quelle cellule ticker d'ouvrir le tiroir ──
type DrawerState = { symbol: string; name?: string } | null;
const StockDrawerContext = createContext<(symbol: string, name?: string) => void>(() => {});

export function useStockDrawer() {
  return useContext(StockDrawerContext);
}

interface HistoryPoint {
  date: string;
  close: number;
}
interface HistoryData {
  symbol: string;
  name: string;
  exchange: string;
  currency: string;
  price: number | null;
  prevClose: number | null;
  points: HistoryPoint[];
}

const RANGES: { key: string; label: string; days: number }[] = [
  { key: "1M", label: "1M", days: 30 },
  { key: "3M", label: "3M", days: 90 },
  { key: "6M", label: "6M", days: 182 },
  { key: "1A", label: "1A", days: 365 },
];
const MONTHS = ["jan", "fév", "mar", "avr", "mai", "jun", "jul", "aoû", "sep", "oct", "nov", "déc"];

function fmtMoney(v: number, currency: string) {
  try {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: currency || "EUR",
      maximumFractionDigits: v < 10 ? 3 : 2,
    }).format(v);
  } catch {
    return `${v.toFixed(2)} ${currency}`;
  }
}

function fmtPct(v: number) {
  const s = (v * 100).toFixed(2).replace(".", ",");
  return `${v >= 0 ? "+" : ""}${s} %`;
}

function StockChartInner({ data }: { data: HistoryData }) {
  const [range, setRange] = useState("3M");

  const { filtered, days } = useMemo(() => {
    const pts = data.points;
    if (!pts.length) return { filtered: [] as HistoryPoint[], days: 0 };
    const r = RANGES.find((x) => x.key === range)!;
    const cutoff = new Date(pts[pts.length - 1].date);
    cutoff.setDate(cutoff.getDate() - r.days);
    const cutoffStr = cutoff.toISOString().slice(0, 10);
    const f = pts.filter((p) => p.date >= cutoffStr);
    return { filtered: f.length >= 2 ? f : pts.slice(-2), days: r.days };
  }, [data.points, range]);

  const perf = useMemo(() => {
    if (filtered.length < 2) return 0;
    const a = filtered[filtered.length - 1].close;
    const b = filtered[0].close;
    return b ? (a - b) / b : 0;
  }, [filtered]);

  const up = perf >= 0;
  const stroke = up ? "#16a34a" : "#ef4444";
  const gradId = up ? "g-stock-up" : "g-stock-down";

  const fmtTick = (d: string) => {
    const [, m, day] = d.split("-");
    if (days <= 31) return `${day}/${m}`;
    return MONTHS[Number(m) - 1] ?? m;
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className={`text-sm font-bold ${up ? "up" : "down"}`}>
          {fmtPct(perf)} <span className="font-normal text-muted">· {range}</span>
        </span>
        <div className="seg">
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={`seg-btn ${range === r.key ? "seg-btn-active" : ""}`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length < 2 ? (
        <div className="flex h-64 items-center justify-center text-sm text-muted">
          Pas assez de données pour tracer la courbe.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart key={range} data={filtered} margin={{ top: 10, right: 8, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="g-stock-up" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#16a34a" stopOpacity={0.32} />
                <stop offset="100%" stopColor="#16a34a" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="g-stock-down" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity={0.28} />
                <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgb(var(--chart-grid))" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="rgb(var(--chart-axis))"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              minTickGap={36}
              tickFormatter={fmtTick}
            />
            <YAxis
              stroke="rgb(var(--chart-axis))"
              fontSize={11}
              width={56}
              tickLine={false}
              axisLine={false}
              domain={["auto", "auto"]}
              tickFormatter={(v) => `${Number(v).toLocaleString("fr-FR", { maximumFractionDigits: 0 })}`}
            />
            <Tooltip
              contentStyle={{ background: "rgb(var(--chart-tooltip-bg))", border: "1px solid rgb(var(--c-line))", borderRadius: 12, color: "rgb(var(--c-ink))" }}
              labelFormatter={(d) => String(d).split("-").reverse().join("/")}
              formatter={(v: number) => [fmtMoney(v, data.currency), "Cours"]}
            />
            <Area
              type="monotone"
              dataKey="close"
              stroke={stroke}
              strokeWidth={2.5}
              fill={`url(#${gradId})`}
              animationDuration={600}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

function Drawer({ state, onClose }: { state: DrawerState; onClose: () => void }) {
  const [data, setData] = useState<HistoryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [dragY, setDragY] = useState(0);
  const startY = useRef<number | null>(null);

  const open = state !== null;

  // Charge l'historique à l'ouverture
  useEffect(() => {
    if (!state) return;
    setData(null);
    setErr(null);
    setLoading(true);
    setDragY(0);
    const ctrl = new AbortController();
    fetch(`/api/ticker-history?symbol=${encodeURIComponent(state.symbol)}`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((d) => {
        if (d.error || !d.points?.length) setErr("Données indisponibles pour ce titre.");
        else setData(d as HistoryData);
      })
      .catch(() => setErr("Erreur de chargement."))
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, [state]);

  // Verrouille le scroll du body quand le tiroir est ouvert + ferme sur Échap
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  // Glisser vers le bas pour replier (sur la poignée)
  const onTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (startY.current == null) return;
    const dy = e.touches[0].clientY - startY.current;
    if (dy > 0) setDragY(dy);
  };
  const onTouchEnd = () => {
    if (dragY > 110) onClose();
    else setDragY(0);
    startY.current = null;
  };

  const price = data?.price ?? data?.points[data.points.length - 1]?.close ?? null;
  const dayChange =
    data && price != null && data.prevClose
      ? (price - data.prevClose) / data.prevClose
      : null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      {/* Sheet */}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 mx-auto max-w-2xl rounded-t-3xl bg-card shadow-2xl transition-transform duration-300 ${
          open ? "" : "pointer-events-none"
        }`}
        style={{
          height: "92vh",
          transform: open ? `translateY(${dragY}px)` : "translateY(100%)",
          transition: startY.current != null ? "none" : undefined,
        }}
      >
        {/* Poignée (zone de glissement) */}
        <div
          className="flex cursor-grab touch-none justify-center pt-3 pb-1 active:cursor-grabbing"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <span className="h-1.5 w-12 rounded-full bg-slate-300" />
        </div>

        <div className="flex h-[calc(92vh-1.75rem)] flex-col px-5 pb-6">
          {/* En-tête */}
          <div className="flex items-start justify-between gap-3 pb-4">
            <div className="flex min-w-0 items-center gap-3">
              {state?.symbol && <TickerLogo ticker={state.symbol} size={44} />}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-extrabold tracking-tight">
                    {state?.symbol ?? ""}
                  </h2>
                  {data?.exchange && (
                    <span className="chip bg-bg text-muted text-xs">{data.exchange}</span>
                  )}
                </div>
                <p className="truncate text-sm text-muted">
                  {data?.name ?? state?.name ?? "Chargement…"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Fermer"
              className="btn btn-ghost shrink-0 px-2 py-1 text-xl leading-none"
            >
              ×
            </button>
          </div>

          {/* Prix courant */}
          {price != null && (
            <div className="flex items-baseline gap-3 pb-4">
              <span className="text-3xl font-bold tabular-nums">
                {fmtMoney(price, data?.currency ?? "")}
              </span>
              {dayChange != null && (
                <span className={`text-sm font-semibold ${dayChange >= 0 ? "up" : "down"}`}>
                  {fmtPct(dayChange)} <span className="font-normal text-muted">aujourd&apos;hui</span>
                </span>
              )}
            </div>
          )}

          {/* Contenu */}
          <div className="flex-1 overflow-y-auto">
            {loading && (
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <div className="skeleton h-6 w-24" />
                  <div className="skeleton h-7 w-40 rounded-lg" />
                </div>
                <div className="skeleton h-[260px] w-full rounded-xl" />
              </div>
            )}
            {err && !loading && (
              <div className="flex h-64 flex-col items-center justify-center gap-2 text-center text-sm text-muted">
                <span>{err}</span>
                <span className="text-xs">Le titre n&apos;est peut-être pas couvert par la source gratuite.</span>
              </div>
            )}
            {data && !loading && !err && (
              <>
                <StockChartInner data={data} />
                <p className="mt-4 text-center text-xs text-muted">
                  Cours différé (~15 min) · source Yahoo Finance · devise native ({data.currency})
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export function StockDrawerProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DrawerState>(null);
  const openStock = useCallback((symbol: string, name?: string) => {
    if (symbol) setState({ symbol, name });
  }, []);
  const close = useCallback(() => setState(null), []);

  return (
    <StockDrawerContext.Provider value={openStock}>
      {children}
      <Drawer state={state} onClose={close} />
    </StockDrawerContext.Provider>
  );
}

// Cellule ticker cliquable — à utiliser partout où un symbole est affiché.
// Affiche le logo de l'entreprise (repli monogramme) + le symbole.
export function TickerCell({
  ticker,
  name,
  className = "",
  hideLogo = false,
  logoSize = 22,
}: {
  ticker: string;
  name?: string;
  className?: string;
  hideLogo?: boolean;
  logoSize?: number;
}) {
  const openStock = useStockDrawer();
  return (
    <button
      type="button"
      onClick={() => openStock(ticker, name)}
      className={`group inline-flex items-center gap-1.5 align-middle font-semibold text-ink transition-colors hover:text-brand ${className}`}
    >
      {!hideLogo && <TickerLogo ticker={ticker} size={logoSize} />}
      <span className="decoration-dotted underline-offset-2 group-hover:underline">{ticker}</span>
    </button>
  );
}
