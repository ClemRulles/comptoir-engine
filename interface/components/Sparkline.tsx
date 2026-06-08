"use client";

import { useId } from "react";

// Mini-courbe de tendance (SVG pur, sans dépendance). Sobre : ligne + dégradé léger.
// En mode `interactive`, elle se colore selon la tendance (vert/rouge) et réagit au
// survol/appui de la carte parente (groupe) : la ligne se redessine, un léger halo
// coloré apparaît et l'aire se révèle — micro-interaction discrète et classe.
export function Sparkline({
  data,
  color,
  up,
  interactive = false,
  width = 84,
  height = 26,
  className = "",
}: {
  data: number[];
  color?: string;
  up?: boolean;
  interactive?: boolean;
  width?: number;
  height?: number;
  className?: string;
}) {
  const id = useId();
  const pts = (data ?? []).filter((v) => Number.isFinite(v));
  if (pts.length < 2) return null;

  const trendUp = up ?? pts[pts.length - 1] >= pts[0];
  const stroke = color ?? (trendUp ? "#16a34a" : "#ef4444");

  const min = Math.min(...pts);
  const max = Math.max(...pts);
  const range = max - min || 1;
  const coords = pts.map((v, i) => {
    const x = (i / (pts.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 3) - 1.5;
    return [x, y] as const;
  });

  const line = coords.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${line} L${width},${height} L0,${height} Z`;

  // Classes d'interaction (présentes en entier pour que Tailwind les compile).
  const glow = trendUp
    ? "group-hover:[filter:drop-shadow(0_0_5px_rgba(22,163,74,0.55))] group-active:[filter:drop-shadow(0_0_5px_rgba(22,163,74,0.55))]"
    : "group-hover:[filter:drop-shadow(0_0_5px_rgba(239,68,68,0.55))] group-active:[filter:drop-shadow(0_0_5px_rgba(239,68,68,0.55))]";
  const svgCls = interactive
    ? `transition-transform duration-300 will-change-transform group-hover:scale-[1.04] group-active:scale-[1.04] ${glow}`
    : "";
  const lineCls = interactive
    ? "transition-[stroke-width] duration-200 group-hover:[stroke-width:2.4] group-active:[stroke-width:2.4] group-hover:animate-spark-draw group-active:animate-spark-draw"
    : "";
  const areaCls = interactive
    ? "transition-opacity duration-300 opacity-60 group-hover:opacity-100 group-active:opacity-100"
    : "";

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={`${svgCls} ${className}`}
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.28" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} className={areaCls} />
      <path
        d={line}
        fill="none"
        stroke={stroke}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={lineCls}
        {...(interactive ? { pathLength: 1, strokeDasharray: 1, strokeDashoffset: 0 } : {})}
      />
    </svg>
  );
}
