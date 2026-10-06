"use client";

// blocks.tsx — rendu de chaque type de bloc d'un module (lecture classique et mode story).
// Tolérant : un champ manquant n'affiche rien, un type inconnu s'affiche comme bloc libre.
// Tout est rendu en texte (jamais de HTML injecté) ; seuls les liens http(s) sont cliquables.
import { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  BookMarked,
  Check,
  ChevronDown,
  Clock,
  ExternalLink,
  HelpCircle,
  Info,
  Layers,
  Lightbulb,
  Lock,
  Quote,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  X,
} from "lucide-react";
import { arr, num, safeUrl, str, strs, type Block } from "@/lib/learn/module";

export const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);
export type SI = Map<string, number>;

// État de visibilité : « in » d'emblée si l'élément est déjà à l'écran au montage, sinon
// « wait » jusqu'à ce qu'il y entre (sans JS, tout reste visible).
// ── Énigme : indices à débloquer en lisant ────────────────────────────────
export type Indice = { id: string; emoji: string; label: string };
export type EnigmeState = { question: string; indices: Indice[]; unlocked: Set<string>; unlock: (id: string) => void };
export const EnigmeCtx = createContext<EnigmeState | null>(null);

export function enigmeOf(blocs: Block[]): { question: string; indices: Indice[] } | null {
  const e = blocs.find((b) => b.type === "enigme");
  if (!e) return null;
  const indices = arr(e.indices)
    .filter(isObj)
    .map((x, i) => ({ id: str(x.id) || `i${i + 1}`, emoji: str(x.emoji) || "❓", label: str(x.label) }));
  return indices.length ? { question: str(e.question), indices } : null;
}

export function useInView<T extends HTMLElement>(margin = "0px 0px -10% 0px") {
  const ref = useRef<T>(null);
  const [state, setState] = useState<"idle" | "wait" | "in">("idle");
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return setState("in");
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return setState("in");
    setState("wait");
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setState("in");
          io.disconnect();
        }
      },
      { rootMargin: margin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [margin]);
  return { ref, state };
}

export function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { ref, state } = useInView<HTMLDivElement>();
  return (
    <div ref={ref} data-reveal={state} className={`learn-reveal ${className}`}>
      {children}
    </div>
  );
}

// ── Blocs ───────────────────────────────────────────────────────────────────

// Les chiffres clés consécutifs se rangent côte à côte.
export function groupFigures(blocs: Block[]): (Block | Block[])[] {
  const out: (Block | Block[])[] = [];
  for (const b of blocs) {
    const prev = out[out.length - 1];
    if (b.type === "chiffre_cle" && Array.isArray(prev)) prev.push(b);
    else out.push(b.type === "chiffre_cle" ? [b] : b);
  }
  return out;
}

// Renvoi vers une ou plusieurs sources (source_id : "s1" ou ["s1", "s2"]) ; ouvre la liste.
export function SrcRef({ id, srcIndex }: { id: unknown; srcIndex: SI }) {
  const ids = (Array.isArray(id) ? id : [id]).map(str).filter((x) => srcIndex.has(x));
  if (!ids.length) return null;
  return (
    <>
      {ids.map((x) => (
        <a
          key={x}
          href={`#src-${x}`}
          onClick={() => document.getElementById(`src-${x}`)?.closest("details")?.setAttribute("open", "")}
          className="ml-1 inline-flex translate-y-[-2px] items-center rounded-md bg-[rgb(var(--acc)/0.10)] px-1 text-[10px] font-semibold text-[rgb(var(--acc-ink))] no-underline hover:bg-[rgb(var(--acc)/0.18)]"
          title="Voir la source"
        >
          {srcIndex.get(x)}
        </a>
      ))}
    </>
  );
}

export const Para = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <p className={`whitespace-pre-line text-[17px] leading-[1.75] text-ink/90 md:text-[18px] ${className}`}>{children}</p>
);

export const Label = ({ icon: Icon, children }: { icon?: React.ElementType; children: React.ReactNode }) => (
  <div className="mb-3 inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.08em] text-[rgb(var(--acc-ink))]">
    {Icon && <Icon size={14} />} {children}
  </div>
);

export function BlockView({ b, srcIndex, dropCap }: { b: Block; srcIndex: SI; dropCap: boolean }) {
  switch (b.type) {
    case "texte":
      return (
        <div>
          {str(b.titre) && <h3 className="mb-2 text-[19px] font-semibold tracking-tight">{str(b.titre)}</h3>}
          <Para className={dropCap ? "first-letter:float-left first-letter:mr-2.5 first-letter:mt-1 first-letter:text-[3.6em] first-letter:font-semibold first-letter:leading-[0.8] first-letter:text-[rgb(var(--acc-ink))]" : ""}>
            {str(b.contenu)}
            <SrcRef id={b.source_id} srcIndex={srcIndex} />
          </Para>
        </div>
      );
    case "citation":
      return (
        <figure className="relative py-2 pl-2 md:pl-4">
          <Quote size={44} className="mb-1 -scale-x-100 text-[rgb(var(--acc)/0.35)]" aria-hidden fill="currentColor" strokeWidth={0} />
          <blockquote className="text-[22px] font-medium leading-snug tracking-[-0.01em] md:text-[26px]">{str(b.texte).replace(/^«\s*|\s*»$/g, "")}</blockquote>
          {str(b.source) && <figcaption className="mt-3 text-[14px] text-muted">— {str(b.source)}</figcaption>}
        </figure>
      );
    case "saviez_vous":
      return (
        <aside className="relative overflow-hidden rounded-3xl border border-ai/25 bg-gradient-to-br from-ai/[0.14] via-ai/[0.06] to-transparent p-5 md:p-6">
          <Lightbulb aria-hidden size={120} className="absolute -right-6 -top-6 text-ai/[0.12]" strokeWidth={1.2} />
          <div className="relative">
            <div className="mb-2 inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-amber-700 dark:text-ai">
              <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-ai/20"><Lightbulb size={15} /></span>
              Le saviez-vous ?
            </div>
            <p className="whitespace-pre-line text-[16px] leading-relaxed md:text-[17px]">
              {str(b.texte)}
              <SrcRef id={b.source_id} srcIndex={srcIndex} />
            </p>
          </div>
        </aside>
      );
    case "attention": {
      const warn = str(b.niveau) !== "info";
      return (
        <aside className={`flex gap-4 rounded-3xl border p-5 ${warn ? "border-danger/25 bg-danger/[0.05]" : "border-sky-500/25 bg-sky-500/[0.06]"}`}>
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${warn ? "bg-danger/10 text-danger" : "bg-sky-500/10 text-sky-700 dark:text-sky-400"}`}>
            {warn ? <AlertTriangle size={19} /> : <Info size={19} />}
          </span>
          <p className="whitespace-pre-line text-[15px] leading-relaxed md:text-[16px]">{str(b.texte)}</p>
        </aside>
      );
    }
    case "chronologie":
      return <Timeline b={b} srcIndex={srcIndex} />;
    case "schema": {
      const steps = strs(b.etapes);
      return (
        <section className="rounded-3xl border border-line bg-card p-5 shadow-soft md:p-7">
          {str(b.titre) && (
            <Label icon={Layers}>
              {str(b.titre)}
              <SrcRef id={b.source_id} srcIndex={srcIndex} />
            </Label>
          )}
          <ol className="relative flex flex-col gap-3">
            {steps.map((s, i) => (
              <li key={i} className="relative flex items-start gap-4">
                {i < steps.length - 1 && <span aria-hidden className="absolute left-[17px] top-9 h-[calc(100%-12px)] w-[2px] bg-gradient-to-b from-[rgb(var(--acc)/0.45)] to-[rgb(var(--acc)/0.08)]" />}
                <span className="learn-grad num relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[14px] font-bold text-white shadow-[0_6px_16px_-6px_rgb(var(--acc)/0.7)]">{i + 1}</span>
                <span className={`flex-1 rounded-2xl px-4 py-2.5 text-[15px] leading-snug md:text-[16px] ${i === steps.length - 1 ? "bg-[rgb(var(--acc)/0.08)] font-semibold" : "bg-elev"}`}>{s}</span>
              </li>
            ))}
          </ol>
          {str(b.explication) && <p className="mt-5 border-t border-line pt-4 text-[15px] leading-relaxed text-muted">{str(b.explication)}</p>}
        </section>
      );
    }
    case "tableau": {
      const cols = strs(b.colonnes);
      const rows = arr(b.lignes).map((r) => arr(r).map(str));
      return (
        <section>
          {str(b.titre) && <Label>{str(b.titre)}<SrcRef id={b.source_id} srcIndex={srcIndex} /></Label>}
          <div className="-mx-3 overflow-x-auto px-3 sm:-mx-4 sm:px-4 md:mx-0 md:px-0">
            <table className="w-full min-w-[420px] border-separate border-spacing-0 overflow-hidden rounded-2xl border border-line bg-card text-[14px] shadow-soft">
              {cols.length > 0 && (
                <thead>
                  <tr>
                    {cols.map((c, i) => (
                      <th key={i} className="border-b border-line bg-[rgb(var(--acc)/0.06)] px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[rgb(var(--acc-ink))]">{c}</th>
                    ))}
                  </tr>
                </thead>
              )}
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="even:bg-elev/60">
                    {r.map((c, j) => (
                      <td key={j} className={`px-4 py-3 align-top leading-snug ${i < rows.length - 1 ? "border-b border-line/70" : ""} ${j === 0 ? "font-medium" : ""}`}>{c}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {str(b.legende) && <p className="mt-2 text-[13px] text-muted">{str(b.legende)}</p>}
        </section>
      );
    }
    case "comparaison": {
      const side = (v: unknown, tone: "a" | "b") => {
        const o = isObj(v) ? v : {};
        return (
          <div className={`h-full rounded-3xl border p-5 ${tone === "a" ? "border-line bg-card" : "border-[rgb(var(--acc)/0.3)] bg-[rgb(var(--acc)/0.06)]"}`}>
            <div className={`mb-3 text-[17px] font-semibold ${tone === "b" ? "text-[rgb(var(--acc-ink))]" : ""}`}>{str(o.titre)}</div>
            <ul className="flex flex-col gap-2">
              {strs(o.points).map((p, i) => (
                <li key={i} className="flex gap-2.5 text-[15px] leading-snug">
                  <span className={`mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full ${tone === "a" ? "bg-slate-500" : "bg-[rgb(var(--acc))]"}`} />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        );
      };
      return (
        <section>
          <div className="relative grid grid-cols-1 gap-3 sm:grid-cols-2">
            {side(b.gauche, "a")}
            <span className="learn-grad absolute left-1/2 top-1/2 z-10 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-[12px] font-bold text-white shadow-lift ring-4 ring-bg">VS</span>
            {side(b.droite, "b")}
          </div>
          {str(b.conclusion) && <p className="mt-4 text-[16px] font-medium leading-relaxed">{str(b.conclusion)}</p>}
        </section>
      );
    }
    case "graphique":
      return <Chart b={b} srcIndex={srcIndex} />;
    case "liste": {
      const items = strs(b.items);
      const ordered = b.ordonnee === true;
      return (
        <section>
          {str(b.titre) && <Label>{str(b.titre)}</Label>}
          <ul className="flex flex-col gap-2.5">
            {items.map((it, i) => (
              <li key={i} className="flex gap-3 text-[16px] leading-relaxed md:text-[17px]">
                {ordered ? (
                  <span className="num mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--acc)/0.12)] text-[13px] font-bold text-[rgb(var(--acc-ink))]">{i + 1}</span>
                ) : (
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--acc)/0.12)] text-[rgb(var(--acc-ink))]"><Check size={12} strokeWidth={3} /></span>
                )}
                <span>{it}</span>
              </li>
            ))}
          </ul>
        </section>
      );
    }
    case "vocabulaire":
      return (
        <section>
          <Label icon={BookMarked}>Vocabulaire</Label>
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {arr(b.termes).filter(isObj).map((t, i) => (
              <div key={i} className="rounded-2xl border border-line bg-card p-4 shadow-soft">
                <dt className="inline-flex rounded-lg bg-[rgb(var(--acc)/0.10)] px-2 py-0.5 text-[14px] font-semibold text-[rgb(var(--acc-ink))]">{str(t.terme)}</dt>
                <dd className="mt-2 text-[15px] leading-snug text-muted">{str(t.definition)}</dd>
              </div>
            ))}
          </dl>
        </section>
      );
    case "exemple":
      return <Story b={b} srcIndex={srcIndex} />;
    case "temoignage": {
      const who = str(b.auteur);
      return (
        <figure className="flex gap-4">
          <span className="learn-grad flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[15px] font-bold text-white shadow-sm">{(who || "?").charAt(0).toUpperCase()}</span>
          <div className="relative flex-1 rounded-3xl rounded-tl-md bg-elev p-5">
            <p className="whitespace-pre-line text-[16px] italic leading-relaxed md:text-[17px]">{str(b.texte)}</p>
            {who && <figcaption className="mt-2 text-[13px] font-semibold text-muted">{who}</figcaption>}
          </div>
        </figure>
      );
    }
    case "faq":
      return (
        <section>
          <Label>Questions fréquentes</Label>
          <div className="flex flex-col gap-2.5">
            {arr(b.questions).filter(isObj).map((q, i) => (
              <details key={i} className="group rounded-2xl border border-line bg-card shadow-soft">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 text-[16px] font-medium [&::-webkit-details-marker]:hidden">
                  {str(q.q)}
                  <ChevronDown size={17} className="shrink-0 text-muted transition-transform group-open:rotate-180" />
                </summary>
                <p className="px-5 pb-4 text-[15px] leading-relaxed text-muted">{str(q.r)}</p>
              </details>
            ))}
          </div>
        </section>
      );
    case "quiz":
      return <QuizBlock b={b} srcIndex={srcIndex} />;
    case "vrai_faux":
      return <TrueFalse b={b} srcIndex={srcIndex} />;
    case "cartes":
      return <Flashcards b={b} />;
    case "image":
      return <ImageBlock b={b} />;
    case "enigme":
      return <EnigmeBlock b={b} />;
    case "indice":
      return <IndiceBlock b={b} />;
    case "devine":
      return <DevineBlock b={b} srcIndex={srcIndex} />;
    case "exergue":
      return <Exergue b={b} srcIndex={srcIndex} />;
    case "lien": {
      const url = safeUrl(b.url);
      const host = url ? new URL(url).hostname.replace(/^www\./, "") : null;
      const inner = (
        <>
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[rgb(var(--acc)/0.10)] text-[rgb(var(--acc-ink))]"><ExternalLink size={18} /></span>
          <span className="min-w-0 flex-1">
            <span className="block text-[16px] font-semibold">{str(b.titre) || host}</span>
            {str(b.pourquoi) && <span className="mt-0.5 block text-[14px] leading-snug text-muted">{str(b.pourquoi)}</span>}
            {host && <span className="mt-1 block text-[12px] text-muted">{host}</span>}
          </span>
        </>
      );
      return url ? (
        <a href={url} target="_blank" rel="noopener noreferrer" className="card lift flex items-center gap-4 rounded-3xl p-5">{inner}</a>
      ) : (
        <div className="card flex items-center gap-4 rounded-3xl p-5">{inner}</div>
      );
    }
    default:
      return <FreeBlock b={b} />;
  }
}

function FreeBlock({ b }: { b: Block }) {
  const body = b.type === "libre" ? str(b.contenu) : Object.entries(b).filter(([k, v]) => k !== "type" && typeof v === "string").map(([, v]) => str(v)).join("\n\n");
  return (
    <section className="rounded-3xl border border-dashed border-line p-5">
      {str(b.description) && (
        <div className="mb-2 flex items-center gap-1.5 text-[12px] font-medium text-muted">
          <Sparkles size={13} /> {str(b.description)}
        </div>
      )}
      <p className="whitespace-pre-line text-[16px] leading-relaxed">{body}</p>
    </section>
  );
}

export function KeyFigures({ blocks, srcIndex }: { blocks: Block[]; srcIndex: SI }) {
  const solo = blocks.length === 1;
  return (
    <div className={`grid gap-3 ${solo ? "grid-cols-1" : blocks.length === 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-3"}`}>
      {blocks.map((b, i) => (
        <div key={i} className={`relative overflow-hidden rounded-3xl border border-line bg-card shadow-soft ${solo ? "p-6 md:flex md:items-center md:gap-8 md:p-8" : "p-5"}`}>
          <div aria-hidden className="absolute -left-10 -top-12 h-40 w-40 rounded-full bg-[rgb(var(--acc)/0.12)] blur-2xl" />
          <div className={`learn-grad-text num relative shrink-0 font-bold leading-none tracking-[-0.04em] ${solo ? "text-[64px] md:text-[84px]" : "text-[44px]"}`}>{str(b.valeur)}</div>
          <div className="relative mt-3 md:mt-0">
            <div className="text-[16px] font-semibold leading-snug md:text-[17px]">
              {str(b.label)}
              <SrcRef id={b.source_id} srcIndex={srcIndex} />
            </div>
            {str(b.detail) && <div className="mt-1.5 text-[14px] leading-relaxed text-muted md:text-[15px]">{str(b.detail)}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

// Frise : l'année en grand, le reste de la date en petit.
export function Timeline({ b, srcIndex }: { b: Block; srcIndex: SI }) {
  const steps = arr(b.etapes).filter(isObj);
  return (
    <section className="rounded-3xl border border-line bg-card p-5 shadow-soft md:p-7">
      {str(b.titre) && <Label icon={Clock}>{str(b.titre)}</Label>}
      <ol className="relative">
        {steps.map((e, i) => {
          const quand = str(e.quand);
          const year = quand.match(/\b\d{4}\b/)?.[0] ?? null;
          const rest = year ? quand.replace(year, "").replace(/\s+/g, " ").trim() : quand;
          return (
            <li key={i} className="relative grid grid-cols-[64px_1fr] gap-4 md:grid-cols-[84px_1fr] md:gap-5">
              <div className="pb-6 text-right">
                {year && <div className="learn-grad-text num text-[22px] font-bold leading-none tracking-[-0.02em] md:text-[26px]">{year}</div>}
                {rest && <div className={`text-[11px] font-medium uppercase tracking-wide text-muted ${year ? "mt-1" : "pt-1"}`}>{rest}</div>}
              </div>
              <div className={`relative border-l-2 border-[rgb(var(--acc)/0.18)] pl-5 ${i < steps.length - 1 ? "pb-6" : ""}`}>
                <span aria-hidden className="learn-grad absolute -left-[7px] top-1.5 h-3 w-3 rounded-full ring-4 ring-card" />
                <div className="text-[16px] font-semibold leading-snug md:text-[17px]">
                  {str(e.titre)}
                  <SrcRef id={e.source_id} srcIndex={srcIndex} />
                </div>
                {str(e.detail) && <p className="mt-1 text-[15px] leading-relaxed text-muted">{str(e.detail)}</p>}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function Story({ b, srcIndex }: { b: Block; srcIndex: SI }) {
  const figs = arr(b.chiffres).filter(isObj);
  return (
    <section className="relative overflow-hidden rounded-3xl border border-line bg-card shadow-soft">
      <div aria-hidden className="learn-grad absolute inset-y-0 left-0 w-1.5" />
      <div className="p-5 pl-6 md:p-7 md:pl-8">
        <Label icon={BookMarked}>Exemple</Label>
        {str(b.titre) && <h3 className="text-[20px] font-semibold leading-snug tracking-tight md:text-[22px]">{str(b.titre)}</h3>}
        <p className="mt-3 whitespace-pre-line text-[16px] leading-[1.75] md:text-[17px]">{str(b.scenario)}</p>
        {figs.length > 0 && (
          <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {figs.map((f, i) => (
              <div key={i} className="rounded-2xl bg-elev px-4 py-3">
                <div className="num text-[17px] font-semibold leading-tight text-[rgb(var(--acc-ink))] md:text-[19px]">
                  {str(f.valeur)}
                  <SrcRef id={f.source_id} srcIndex={srcIndex} />
                </div>
                <div className="mt-1 text-[12px] leading-snug text-muted">{str(f.label)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// Image hébergée ailleurs (Wikimedia Commons…), toujours avec légende et crédit. Si elle ne
// charge pas, on garde la légende et un lien vers la page de l'image.
export function ImageBlock({ b }: { b: Block }) {
  const url = safeUrl(b.url);
  const page = safeUrl(b.page);
  const [broken, setBroken] = useState(false);
  const caption = (
    <figcaption className="mt-3 flex flex-col gap-1 px-1 text-[14px] leading-snug text-muted sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
      <span>{str(b.legende)}</span>
      {str(b.credit) && (
        <span className="shrink-0 text-[11px] opacity-80">
          {page ? <a href={page} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline">{str(b.credit)}</a> : str(b.credit)}
        </span>
      )}
    </figcaption>
  );
  if (!url || broken)
    return (
      <figure className="rounded-3xl border border-dashed border-line p-5">
        {page && <a href={page} target="_blank" rel="noopener noreferrer" className="link text-[13px]">Voir l&apos;image <ExternalLink size={13} /></a>}
        {caption}
      </figure>
    );
  return (
    <figure>
      <div className="overflow-hidden rounded-3xl border border-line bg-elev shadow-lift">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt={str(b.alt) || str(b.legende)} loading="lazy" onError={() => setBroken(true)} className="max-h-[520px] w-full object-contain" />
      </div>
      {caption}
    </figure>
  );
}

const fmtN = (n: number) => n.toLocaleString("fr-FR", { maximumFractionDigits: 2 });

export function Chart({ b, srcIndex }: { b: Block; srcIndex: SI }) {
  const { ref, state } = useInView<HTMLElement>("0px 0px -15% 0px");
  const data = arr(b.donnees)
    .filter(isObj)
    .map((d) => ({ label: str(d.label), v: num(d.valeur) }))
    .filter((d): d is { label: string; v: number } => d.v != null);
  const unit = str(b.unite);
  const line = str(b.forme) === "ligne";
  if (data.length === 0) return <FreeBlock b={{ type: "libre", description: "Graphique sans données lisibles", contenu: str(b.titre) }} />;
  const max = Math.max(...data.map((d) => Math.abs(d.v))) || 1;
  const shown = state !== "wait";
  return (
    <section ref={ref} className="rounded-3xl border border-line bg-card p-5 shadow-soft md:p-7">
      {str(b.titre) && (
        <h3 className="mb-5 text-[18px] font-semibold leading-snug tracking-tight md:text-[20px]">
          {str(b.titre)}
          <SrcRef id={b.source_id} srcIndex={srcIndex} />
        </h3>
      )}
      {line && data.length >= 2 ? (
        <LineChart data={data} unit={unit} />
      ) : (
        <div className="flex flex-col gap-4">
          {data.map((d, i) => {
            const top = Math.abs(d.v) === max;
            return (
              <div key={i}>
                <div className="mb-1.5 flex items-baseline justify-between gap-3 text-[14px]">
                  <span className="text-muted">{d.label}</span>
                  <span className={`num shrink-0 font-semibold ${top ? "text-[rgb(var(--acc-ink))]" : ""}`}>{fmtN(d.v)}{unit ? ` ${unit}` : ""}</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-elev">
                  <div
                    className={`learn-bar h-full rounded-full ${d.v < 0 ? "bg-danger/70" : top ? "learn-grad" : "bg-[rgb(var(--acc)/0.45)]"}`}
                    style={{ width: shown ? `${Math.max(2, (Math.abs(d.v) / max) * 100)}%` : "0%", transitionDelay: `${i * 90}ms` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
      {str(b.legende) && <p className="mt-5 border-t border-line pt-4 text-[13px] leading-relaxed text-muted">{str(b.legende)}</p>}
    </section>
  );
}

function LineChart({ data, unit }: { data: { label: string; v: number }[]; unit: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 300, H = 110, pad = 8;
  const vals = data.map((d) => d.v);
  let lo = Math.min(...vals), hi = Math.max(...vals);
  if (lo === hi) { lo -= 1; hi += 1; }
  const xs = data.map((_, i) => pad + (i / (data.length - 1)) * (W - 2 * pad));
  const ys = vals.map((v) => pad + (1 - (v - lo) / (hi - lo)) * (H - 2 * pad));
  const d = xs.map((x, i) => `${i ? "L" : "M"}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(" ");
  const at = hover ?? data.length - 1;
  const shown = data.length <= 6 ? data.map((_, i) => i) : [0, Math.floor((data.length - 1) / 2), data.length - 1];
  return (
    <div>
      <div className="mb-2 text-[14px] text-muted">
        <span className="font-medium text-ink">{data[at].label}</span> · <span className="num font-semibold text-[rgb(var(--acc-ink))]">{fmtN(data[at].v)}{unit ? ` ${unit}` : ""}</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-[160px] w-full overflow-visible md:h-[200px]" onPointerLeave={() => setHover(null)} role="img" aria-label="Courbe">
        <defs>
          <linearGradient id="learn-area" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgb(var(--acc))" stopOpacity="0.28" />
            <stop offset="100%" stopColor="rgb(var(--acc))" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`${d} L${xs[xs.length - 1]},${H} L${xs[0]},${H} Z`} fill="url(#learn-area)" />
        <path d={d} fill="none" stroke="rgb(var(--acc))" strokeWidth={2.75} vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
        {xs.map((x, i) => (
          <rect key={i} x={i === 0 ? 0 : (xs[i - 1] + x) / 2} y={0} width={(i === xs.length - 1 ? W : (x + xs[i + 1]) / 2) - (i === 0 ? 0 : (xs[i - 1] + x) / 2)} height={H} fill="transparent" onPointerEnter={() => setHover(i)} onPointerDown={() => setHover(i)} />
        ))}
        <line x1={xs[at]} x2={xs[at]} y1={0} y2={H} stroke="rgb(var(--c-ink))" strokeOpacity={0.15} vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="relative mt-1 h-4 text-[11px] text-muted">
        {shown.map((i) => (
          <span key={i} className="absolute -translate-x-1/2 whitespace-nowrap" style={{ left: `${(xs[i] / W) * 100}%`, transform: i === 0 ? "none" : i === data.length - 1 ? "translateX(-100%)" : undefined }}>
            {data[i].label}
          </span>
        ))}
      </div>
    </div>
  );
}

// Éclats de la bonne réponse (mêmes que le quiz du jour).
export const Burst = () => (
  <span aria-hidden className="quiz-burst pointer-events-none absolute inset-0">
    {Array.from({ length: 12 }).map((_, k) => (
      <i key={k} style={{ ["--a" as string]: `${k * 30}deg`, ["--d" as string]: `${k * 18}ms` }} />
    ))}
  </span>
);

function Verdict({ ok, text, src }: { ok: boolean; text: string; src?: React.ReactNode }) {
  return (
    <div className={`mt-4 flex animate-fade-up gap-3 rounded-2xl p-4 text-[15px] leading-relaxed ${ok ? "bg-[rgb(var(--acc)/0.08)]" : "bg-danger/[0.06]"}`} aria-live="polite">
      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white ${ok ? "learn-grad" : "bg-danger"}`}>
        {ok ? <Check size={15} strokeWidth={3} /> : <X size={15} strokeWidth={3} />}
      </span>
      <span>
        <span className="font-semibold">{ok ? "Bien vu ! " : "Pas tout à fait. "}</span>
        {text}
        {src}
      </span>
    </div>
  );
}

export function GameCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="learn-grad rounded-[28px] p-[1.5px] shadow-lift">
      <div className="rounded-[27px] bg-card p-5 md:p-7">
        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-[rgb(var(--acc)/0.12)] px-3 py-1 text-[12px] font-semibold uppercase tracking-wide text-[rgb(var(--acc-ink))]">
          <Sparkles size={13} /> {label}
        </div>
        {children}
      </div>
    </section>
  );
}

export function QuizBlock({ b, srcIndex, onAnswer }: { b: Block; srcIndex: SI; onAnswer?: () => void }) {
  const choices = strs(b.choix);
  const good = num(b.bonne_reponse);
  const [pick, setPick] = useState<number | null>(null);
  useEffect(() => { if (pick != null) onAnswer?.(); }, [pick, onAnswer]);
  return (
    <GameCard label="Petit quiz">
      <h3 className="mb-4 text-[18px] font-semibold leading-snug tracking-tight md:text-[20px]">{str(b.question)}</h3>
      <div className="relative flex flex-col gap-2.5">
        {choices.map((c, i) => {
          const done = pick != null;
          const isGood = i === good;
          const cls = !done
            ? "border-line bg-card hover:-translate-y-0.5 hover:border-[rgb(var(--acc)/0.5)] hover:shadow-soft"
            : isGood
              ? `border-[rgb(var(--acc))] bg-[rgb(var(--acc)/0.08)] ${pick === i ? "quiz-pop" : ""}`
              : i === pick
                ? "quiz-shake border-danger/60 bg-danger/[0.05]"
                : "border-line opacity-50";
          return (
            <button key={i} type="button" disabled={done} onClick={() => setPick(i)} className={`flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-left text-[15px] transition-all md:text-[16px] ${cls}`}>
              <span className={`num flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-bold ${done && isGood ? "learn-grad text-white" : "bg-elev text-muted"}`}>{String.fromCharCode(65 + i)}</span>
              <span className="flex-1">{c}</span>
            </button>
          );
        })}
        {pick != null && pick === good && <Burst />}
      </div>
      {pick != null && <Verdict ok={pick === good} text={str(b.explication)} src={<SrcRef id={b.source_id} srcIndex={srcIndex} />} />}
      {pick != null && (
        <button type="button" onClick={() => setPick(null)} className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-medium text-muted hover:text-ink">
          <RotateCcw size={13} /> Rejouer
        </button>
      )}
    </GameCard>
  );
}

export function TrueFalse({ b, srcIndex, onAnswer }: { b: Block; srcIndex: SI; onAnswer?: () => void }) {
  const truth = b.reponse === true || str(b.reponse).toLowerCase() === "true" || str(b.reponse).toLowerCase() === "vrai";
  const [pick, setPick] = useState<boolean | null>(null);
  useEffect(() => { if (pick != null) onAnswer?.(); }, [pick, onAnswer]);
  return (
    <GameCard label="Vrai ou faux ?">
      <h3 className="mb-5 text-[20px] font-semibold leading-snug tracking-tight md:text-[24px]">«&nbsp;{str(b.affirmation)}&nbsp;»</h3>
      <div className="relative grid grid-cols-2 gap-3">
        {[true, false].map((v) => {
          const Icon = v ? ThumbsUp : ThumbsDown;
          const cls =
            pick == null
              ? "border-line bg-card hover:-translate-y-0.5 hover:border-[rgb(var(--acc)/0.5)] hover:shadow-soft"
              : v === truth
                ? `border-[rgb(var(--acc))] bg-[rgb(var(--acc)/0.08)] ${pick === v ? "quiz-pop" : ""}`
                : pick === v
                  ? "quiz-shake border-danger/60 bg-danger/[0.05]"
                  : "border-line opacity-50";
          return (
            <button key={String(v)} type="button" disabled={pick != null} onClick={() => setPick(v)} className={`flex flex-col items-center gap-2 rounded-2xl border py-5 text-[16px] font-semibold transition-all ${cls}`}>
              <Icon size={22} className={pick != null && v === truth ? "text-[rgb(var(--acc-ink))]" : "text-muted"} />
              {v ? "Vrai" : "Faux"}
            </button>
          );
        })}
        {pick != null && pick === truth && <Burst />}
      </div>
      {pick != null && (
        <Verdict
          ok={pick === truth}
          text={/^(vrai|faux)\b/i.test(str(b.explication)) ? str(b.explication) : `C'est ${truth ? "vrai" : "faux"}. ${str(b.explication)}`}
          src={<SrcRef id={b.source_id} srcIndex={srcIndex} />}
        />
      )}
    </GameCard>
  );
}

function Flashcards({ b }: { b: Block }) {
  const cards = arr(b.cartes).filter(isObj).map((c) => ({ r: str(c.recto), v: str(c.verso) }));
  const [open, setOpen] = useState<Set<number>>(new Set());
  const toggle = (i: number) => setOpen((s) => { const n = new Set(s); if (n.has(i)) n.delete(i); else n.add(i); return n; });
  return (
    <section>
      <Label icon={RotateCcw}>Cartes · touche pour retourner</Label>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {cards.map((c, i) => (
          <button key={i} type="button" onClick={() => toggle(i)} aria-pressed={open.has(i)} className={`flip text-left ${open.has(i) ? "is-flipped" : ""}`}>
            <span className="flip-inner">
              <span className="flip-face flex min-h-[120px] flex-col justify-between gap-3 rounded-3xl border border-line bg-card p-5 shadow-soft">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-muted">Question</span>
                <span className="text-[17px] font-semibold leading-snug">{c.r}</span>
              </span>
              <span className="flip-face flip-back learn-grad flex min-h-[120px] flex-col justify-between gap-3 rounded-3xl p-5 text-white shadow-lift">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-white/80">Réponse</span>
                <span className="text-[16px] leading-snug">{c.v}</span>
              </span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

// Phrase forte mise en avant (pas une citation : la phrase de l'auteur, en grand).
function Exergue({ b, srcIndex }: { b: Block; srcIndex: SI }) {
  return (
    <figure className="relative py-1 pl-6 md:pl-8">
      <span aria-hidden className="learn-grad absolute inset-y-0 left-0 w-1.5 rounded-full" />
      <p className="text-[23px] font-semibold leading-snug tracking-[-0.015em] md:text-[28px]">
        {str(b.texte)}
        <SrcRef id={b.source_id} srcIndex={srcIndex} />
      </p>
    </figure>
  );
}

// L'énigme : les indices restent verrouillés jusqu'à ce qu'on les atteigne dans la lecture.
export function EnigmeBlock({ b }: { b: Block }) {
  const ctx = useContext(EnigmeCtx);
  const indices = ctx?.indices ?? [];
  return (
    <section className="relative overflow-hidden rounded-[28px] border border-line bg-card p-5 shadow-lift md:p-7">
      <div aria-hidden className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[rgb(var(--acc)/0.14)] blur-3xl" />
      <div className="relative">
        <Label icon={HelpCircle}>L&apos;énigme</Label>
        <p className="text-[20px] font-semibold leading-snug tracking-tight md:text-[23px]">{str(b.question)}</p>
        <div className="mt-5 grid grid-cols-2 gap-2.5 md:grid-cols-4">
          {indices.map((x) => {
            const on = ctx?.unlocked.has(x.id);
            return (
              <div
                key={x.id}
                className={`flex flex-col items-center gap-1.5 rounded-2xl border px-3 py-4 text-center transition-all duration-500 ${
                  on ? "quiz-pop border-[rgb(var(--acc)/0.4)] bg-[rgb(var(--acc)/0.08)]" : "border-dashed border-line bg-elev"
                }`}
              >
                <span className={`text-[30px] leading-none transition-all duration-500 ${on ? "" : "opacity-30 grayscale"}`}>{x.emoji}</span>
                <span className={`text-[13px] font-medium leading-tight ${on ? "text-ink" : "text-muted"}`}>
                  {on ? x.label : <span className="inline-flex items-center gap-1"><Lock size={11} /> à découvrir</span>}
                </span>
              </div>
            );
          })}
        </div>
        <p className="mt-4 text-[13px] text-muted">Les indices se débloquent pendant ta lecture.</p>
      </div>
    </section>
  );
}

// Indice : se débloque (et l'annonce) quand il arrive à l'écran.
export function IndiceBlock({ b, live = true }: { b: Block; live?: boolean }) {
  const ctx = useContext(EnigmeCtx);
  const { ref, state } = useInView<HTMLElement>("0px 0px -25% 0px");
  const id = str(b.id);
  const [fresh, setFresh] = useState(false);
  useEffect(() => {
    if (!live || state !== "in" || !ctx || ctx.unlocked.has(id)) return;
    ctx.unlock(id);
    setFresh(true);
  }, [state, ctx, id, live]);
  const n = ctx ? ctx.indices.findIndex((x) => x.id === id) + 1 : 0;
  const total = ctx?.indices.length ?? 0;
  const emoji = str(b.emoji) || ctx?.indices.find((x) => x.id === id)?.emoji || "🔓";
  return (
    <section ref={ref} className="learn-grad relative rounded-[28px] p-[1.5px] shadow-lift">
      <div className="relative flex items-center gap-4 overflow-hidden rounded-[27px] bg-card p-5 md:gap-5 md:p-6">
        <span className={`relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[rgb(var(--acc)/0.1)] text-[36px] ${fresh ? "quiz-pop" : ""}`}>
          {emoji}
          {fresh && <Burst />}
        </span>
        <div className="min-w-0">
          <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[rgb(var(--acc-ink))]">
            Indice débloqué{n > 0 && total > 0 ? ` · ${n}/${total}` : ""}
          </div>
          <div className="mt-0.5 text-[18px] font-semibold leading-snug tracking-tight">{str(b.titre)}</div>
          {str(b.texte) && <p className="mt-1 text-[15px] leading-relaxed text-muted">{str(b.texte)}</p>}
        </div>
      </div>
    </section>
  );
}

// « Devine » : on estime avec un curseur avant de voir la vraie valeur.
export function DevineBlock({ b, srcIndex, onAnswer }: { b: Block; srcIndex: SI; onAnswer?: () => void }) {
  const min = num(b.min) ?? 0;
  const max = num(b.max) ?? 100;
  const step = num(b.pas) ?? 1;
  const ans = num(b.reponse);
  const unit = str(b.unite);
  const year = !unit && min >= 1000 && max <= 2100;
  const fmt = (n: number) => n.toLocaleString("fr-FR", { maximumFractionDigits: 2, useGrouping: !year });
  const [v, setV] = useState(() => Math.round((min + (max - min) / 2) / step) * step);
  const [done, setDone] = useState(false);
  useEffect(() => { if (done) onAnswer?.(); }, [done, onAnswer]);
  const diff = ans == null ? 0 : Math.abs(v - ans);
  const close = diff <= (max - min) * 0.05;
  // Bulle de la réponse : bornée pour ne pas sortir de la carte aux extrémités.
  const pct = (x: number) => `${Math.min(92, Math.max(8, ((x - min) / (max - min || 1)) * 100))}%`;
  return (
    <GameCard label="À toi de deviner">
      <h3 className="mb-5 text-[18px] font-semibold leading-snug tracking-tight md:text-[20px]">{str(b.question)}</h3>
      <div className="text-center">
        <div className="learn-grad-text num text-[48px] font-bold leading-none tracking-[-0.03em] md:text-[56px]">
          {fmt(v)}
          {unit && <span className="ml-1 text-[0.5em]">{unit}</span>}
        </div>
        <div className="mt-1 text-[12px] text-muted">{done ? "ta réponse" : "fais glisser le curseur"}</div>
      </div>
      <div className="relative mt-5">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={v}
          disabled={done}
          onChange={(e) => setV(Number(e.target.value))}
          className="h-2 w-full cursor-pointer appearance-auto"
          style={{ accentColor: "rgb(var(--acc))" }}
          aria-label="Ton estimation"
        />
        {done && ans != null && (
          <span className="pointer-events-none absolute -top-7 -translate-x-1/2 animate-fade-up rounded-full bg-ink px-2 py-0.5 text-[11px] font-bold text-card" style={{ left: pct(ans) }}>
            {fmt(ans)}{unit ? ` ${unit}` : ""}
          </span>
        )}
        <div className="mt-1 flex justify-between text-[11px] text-muted">
          <span>{fmt(min)}{unit ? ` ${unit}` : ""}</span>
          <span>{fmt(max)}{unit ? ` ${unit}` : ""}</span>
        </div>
      </div>
      {!done ? (
        <button type="button" onClick={() => setDone(true)} className="learn-grad mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-[15px] font-semibold text-white shadow-lift transition-transform hover:-translate-y-0.5">
          <SlidersHorizontal size={16} /> Valider mon estimation
        </button>
      ) : (
        <div className="relative">
          {close && <Burst />}
          <Verdict
            ok={close}
            text={`${diff === 0 ? "Pile ! " : `Réponse : ${fmt(ans ?? 0)}${unit ? ` ${unit}` : ""}, tu étais à ${fmt(diff)}${unit ? ` ${unit}` : ""} près. `}${str(b.explication)}`}
            src={<SrcRef id={b.source_id} srcIndex={srcIndex} />}
          />
        </div>
      )}
    </GameCard>
  );
}
