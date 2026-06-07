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

export function KpiCard({
  label,
  value,
  sub,
  accent,
  delay = 0,
  spark,
  sparkColor,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  accent?: "group" | "ai" | "neutral";
  delay?: number;
  spark?: number[];
  sparkColor?: string;
}) {
  const bar = accent === "group" ? "bg-brand" : accent === "ai" ? "bg-ai" : "bg-slate-300";
  const sColor = sparkColor ?? (accent === "ai" ? "#f59e0b" : "#16a34a");
  return (
    <div
      className="card-p lift relative overflow-hidden animate-fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`absolute left-0 top-0 h-full w-1 ${bar}`} />
      {spark && spark.length > 1 && (
        <div className="pointer-events-none absolute right-3 top-3 opacity-90">
          <Sparkline data={spark} color={sColor} />
        </div>
      )}
      <div className="label">{label}</div>
      <div className="kpi mt-1">{value}</div>
      {sub && <div className="mt-2 text-sm text-muted">{sub}</div>}
    </div>
  );
}

export function SectionTitle({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-base font-bold tracking-tight">{children}</h2>
      {right}
    </div>
  );
}
