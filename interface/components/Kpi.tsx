import { pct } from "@/lib/fund";
import { Sparkline } from "@/components/Sparkline";

export function Delta({ value, className = "" }: { value: number; className?: string }) {
  const up = value >= 0;
  return (
    <span
      className={`chip ${up ? "bg-brand/10 text-brand-600" : "bg-danger/10 text-danger"} ${className}`}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
        {up ? <path d="M7 14l5-5 5 5z" /> : <path d="M7 10l5 5 5-5z" />}
      </svg>
      {pct(value)}
    </span>
  );
}

export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <div className={`animate-fade-up ${className}`} style={{ animationDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

// Tuile chiffrée (même dessin que `Stat` de components/ui.tsx). Le liseré d'accent devient
// une pastille de couleur devant le libellé : plus sobre, même code couleur (vert groupe, ambre IA).
export function KpiCard({
  label,
  labelSub,
  value,
  sub,
  accent,
  delay = 0,
  spark,
  sparkColor,
}: {
  label: string;
  labelSub?: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  accent?: "group" | "ai" | "neutral";
  delay?: number;
  spark?: number[];
  sparkColor?: string;
}) {
  const dot = accent === "group" ? "bg-series-group" : accent === "ai" ? "bg-series-ai" : null;
  return (
    <div className="card relative overflow-hidden p-4 animate-fade-up md:p-5" style={{ animationDelay: `${delay}ms` }}>
      <div className="eyebrow flex items-center gap-1.5 leading-tight">
        {dot && <span className={`h-2 w-2 rounded-full ${dot}`} />}
        {label}
        {labelSub && <span className="font-normal normal-case tracking-normal text-muted">· {labelSub}</span>}
      </div>
      <div className={`num mt-1.5 text-2xl font-semibold md:text-[26px]${spark && spark.length > 1 ? " pr-14" : ""}`}>{value}</div>
      {sub && <div className="mt-1 text-sm text-muted">{sub}</div>}
      {spark && spark.length > 1 && (
        <div className="pointer-events-none absolute bottom-3 right-2">
          <Sparkline data={spark} color={sparkColor} interactive />
        </div>
      )}
    </div>
  );
}

export function SectionTitle({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="h-section">{children}</h2>
      {right}
    </div>
  );
}
