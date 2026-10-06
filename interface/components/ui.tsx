// ui.tsx — primitives visuelles de l'interface v2 (même DA : vert HypeInvest, ambre IA,
// navy en sombre). Tout est serveur-compatible (aucun état) sauf mention contraire.
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, Info } from "lucide-react";

export function PageHeader({
  eyebrow,
  title,
  lead,
  right,
}: {
  eyebrow?: string;
  title: string;
  lead?: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        {eyebrow && <div className="eyebrow mb-1.5">{eyebrow}</div>}
        <h1 className="h-page">{title}</h1>
        {lead && <p className="mt-2 text-[15px] leading-relaxed text-muted">{lead}</p>}
      </div>
      {right && <div className="flex shrink-0 items-center gap-2">{right}</div>}
    </header>
  );
}

export function Card({
  children,
  className = "",
  as: Tag = "section",
  pad = true,
}: {
  children: React.ReactNode;
  className?: string;
  as?: "section" | "div" | "article";
  pad?: boolean;
}) {
  return <Tag className={`card ${pad ? "p-5 md:p-6" : ""} ${className}`}>{children}</Tag>;
}

export function CardHead({
  icon: Icon,
  title,
  sub,
  right,
  className = "",
}: {
  icon?: LucideIcon;
  title: React.ReactNode;
  sub?: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`mb-4 flex items-start justify-between gap-3 ${className}`}>
      <div className="flex min-w-0 items-start gap-3">
        {Icon && (
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand-600 dark:text-brand-500">
            <Icon size={16} strokeWidth={2.2} />
          </span>
        )}
        <div className="min-w-0">
          <h2 className="h-section">{title}</h2>
          {sub && <p className="mt-0.5 text-[13px] leading-snug text-muted">{sub}</p>}
        </div>
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  );
}

export function MoreLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="link group">
      {children}
      <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

export function Badge({
  children,
  tone = "neutral",
  className = "",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "good" | "bad" | "ai" | "info" | "violet";
  className?: string;
}) {
  const t = {
    neutral: "bg-slate-500/10 text-slate-600",
    good: "bg-brand/10 text-brand-600 dark:text-brand-500",
    bad: "bg-danger/10 text-danger",
    ai: "bg-ai/10 text-amber-700 dark:text-ai",
    info: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
    violet: "bg-violet-500/10 text-violet-700 dark:text-violet-400",
  }[tone];
  return <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${t} ${className}`}>{children}</span>;
}

// Variation signée, toujours lisible sans la couleur (signe + flèche).
export function Change({ value, suffix = "", className = "", size = "sm" }: { value: number | null | undefined; suffix?: string; className?: string; size?: "sm" | "lg" }) {
  if (value == null || !Number.isFinite(value)) return <span className={`text-muted ${className}`}>—</span>;
  const up = value >= 0;
  const txt = `${up ? "+" : "−"}${Math.abs(value * 100).toFixed(1).replace(".", ",")} %${suffix}`;
  return (
    <span className={`num inline-flex items-center gap-0.5 font-semibold ${up ? "text-brand-600 dark:text-brand-500" : "text-danger"} ${size === "lg" ? "text-base" : "text-sm"} ${className}`}>
      <span aria-hidden>{up ? "▲" : "▼"}</span>
      {txt}
    </span>
  );
}

export const fmtPct = (v: number | null | undefined, digits = 1) =>
  v == null || !Number.isFinite(v) ? "—" : `${v >= 0 ? "+" : "−"}${Math.abs(v * 100).toFixed(digits).replace(".", ",")} %`;
export const fmtShare = (v: number | null | undefined, digits = 0) =>
  v == null || !Number.isFinite(v) ? "—" : `${(v * 100).toFixed(digits).replace(".", ",")} %`;
export const fmtEur = (v: number | null | undefined, digits = 0) =>
  v == null || !Number.isFinite(v)
    ? "—"
    : new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: digits, minimumFractionDigits: digits }).format(v);
export const fmtPrice = (v: number | null | undefined, ccy = "EUR") =>
  v == null || !Number.isFinite(v)
    ? "—"
    : new Intl.NumberFormat("fr-FR", { style: "currency", currency: ccy, maximumFractionDigits: v >= 1000 ? 0 : 2 }).format(v);

// Explication courte au survol / au toucher (details natif : accessible clavier et mobile).
export function Explain({ children, label = "Pourquoi ?" }: { children: React.ReactNode; label?: string }) {
  return (
    <details className="group/x relative inline-block">
      <summary className="inline-flex cursor-pointer list-none items-center gap-1 text-xs font-medium text-muted hover:text-ink [&::-webkit-details-marker]:hidden">
        <Info size={13} /> {label}
      </summary>
      <div className="absolute right-0 z-30 mt-2 w-72 max-w-[calc(100vw-2.5rem)] rounded-xl border border-line bg-card p-3 text-xs leading-relaxed text-slate-600 shadow-lift">
        {children}
      </div>
    </details>
  );
}

export function Empty({ icon: Icon, title, children }: { icon?: LucideIcon; title: string; children?: React.ReactNode }) {
  return (
    <div className="well flex flex-col items-center gap-2 px-6 py-8 text-center">
      {Icon && <Icon size={20} className="text-muted" />}
      <div className="text-sm font-semibold">{title}</div>
      {children && <p className="max-w-sm text-[13px] leading-relaxed text-muted">{children}</p>}
    </div>
  );
}

export function DemoTag({ show, label = "Démo" }: { show: boolean; label?: string }) {
  if (!show) return null;
  return <Badge tone="ai">{label}</Badge>;
}

// Barre de progression horizontale (part d'un tout), avec repère de cible optionnel.
export function Meter({ value, target, color, max = 1 }: { value: number; target?: number; color: string; max?: number }) {
  const w = Math.max(0, Math.min(1, value / max)) * 100;
  const t = target != null ? Math.max(0, Math.min(1, target / max)) * 100 : null;
  return (
    <div className="relative h-2 w-full overflow-visible rounded-full bg-slate-500/15">
      <div className="h-2 rounded-full" style={{ width: `${w}%`, background: color }} />
      {t != null && (
        <div className="absolute -top-1 h-4 w-0.5 rounded-full bg-ink/70" style={{ left: `calc(${t}% - 1px)` }} title="cible" />
      )}
    </div>
  );
}

export function Stat({ label, value, sub, demo = false }: { label: string; value: React.ReactNode; sub?: React.ReactNode; demo?: boolean }) {
  return (
    <div className="card p-4 md:p-5">
      <div className="eyebrow flex items-center gap-2">
        {label} <DemoTag show={demo} />
      </div>
      <div className="num mt-1.5 text-2xl font-semibold md:text-[26px]">{value}</div>
      {sub && <div className="mt-1 flex flex-wrap items-center gap-1">{sub}</div>}
    </div>
  );
}
