"use client";

// ModuleView — rendu d'un module de découverte, bloc par bloc (lecture, quiz, cartes…).
// Tolérant : un champ manquant n'affiche rien, un type inconnu s'affiche comme bloc libre.
// Tout est rendu en texte (jamais de HTML injecté) ; seuls les liens http(s) sont cliquables.
import { useState } from "react";
import { AlertTriangle, ArrowRight, Check, Clock, ExternalLink, Info, Lightbulb, Quote, RotateCcw, Sparkles, X } from "lucide-react";
import { arr, num, readingMinutes, safeUrl, str, strs, type Block, type LearnModule } from "@/lib/learn/module";

const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);

export function ModuleView({ module: m }: { module: LearnModule }) {
  const srcIndex = new Map(m.sources.map((s, i) => [s.id, i + 1]));
  const groups = groupBlocks(m.blocs);
  return (
    <article className="mx-auto w-full max-w-2xl">
      <ModuleHeader module={m} />
      <div className="mt-6 flex flex-col gap-4 md:mt-8 md:gap-5">
        {groups.map((g, i) =>
          Array.isArray(g) ? (
            <KeyFigures key={i} blocks={g} srcIndex={srcIndex} />
          ) : (
            <BlockView key={i} b={g} srcIndex={srcIndex} />
          )
        )}
      </div>
      {m.sources.length > 0 && (
        <section className="mt-8 border-t border-line pt-5">
          <h2 className="eyebrow mb-3">Sources</h2>
          <ol className="flex flex-col gap-2 text-[13px] leading-snug text-muted">
            {m.sources.map((s, i) => (
              <li key={s.id} id={`src-${s.id}`} className="flex scroll-mt-24 gap-2">
                <span className="num shrink-0 font-semibold text-ink">{i + 1}.</span>
                <span className="min-w-0">
                  {s.url ? (
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="break-words text-brand-600 underline-offset-2 hover:underline dark:text-brand-500">
                      {s.titre}
                    </a>
                  ) : (
                    <span className="text-ink">{s.titre}</span>
                  )}
                  {s.date && <span> · consulté {s.date}</span>}
                </span>
              </li>
            ))}
          </ol>
        </section>
      )}
    </article>
  );
}

export function ModuleHeader({ module: m }: { module: LearnModule }) {
  return (
    <header>
      <div className="flex items-start gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand/10 text-[28px] md:h-16 md:w-16 md:text-[32px]" aria-hidden>
          {m.emoji || "📘"}
        </span>
        <div className="min-w-0">
          <h1 className="text-[22px] font-semibold leading-tight tracking-tight md:text-[28px]">{m.titre}</h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted">
            <span>par <span className="font-medium text-ink">{m.auteur}</span></span>
            <span className="inline-flex items-center gap-1"><Clock size={13} /> {readingMinutes(m)} min</span>
            {m.niveau && <span className="capitalize">{m.niveau}</span>}
          </div>
        </div>
      </div>
      {m.resume && <p className="mt-4 text-[16px] leading-relaxed text-ink/90 md:text-[17px]">{m.resume}</p>}
      {m.etiquettes.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {m.etiquettes.map((t) => (
            <span key={t} className="chip bg-slate-100 text-slate-600">{t}</span>
          ))}
        </div>
      )}
    </header>
  );
}

// Les chiffres clés consécutifs se rangent côte à côte.
function groupBlocks(blocs: Block[]): (Block | Block[])[] {
  const out: (Block | Block[])[] = [];
  for (const b of blocs) {
    const prev = out[out.length - 1];
    if (b.type === "chiffre_cle" && Array.isArray(prev)) prev.push(b);
    else out.push(b.type === "chiffre_cle" ? [b] : b);
  }
  return out;
}

type SI = Map<string, number>;

function SrcRef({ id, srcIndex }: { id: unknown; srcIndex: SI }) {
  const n = srcIndex.get(str(id));
  if (!n) return null;
  return (
    <a href={`#src-${str(id)}`} className="ml-1 inline-flex translate-y-[-1px] items-center rounded bg-slate-100 px-1 text-[10px] font-semibold text-slate-600 no-underline hover:text-ink" title="Voir la source">
      {n}
    </a>
  );
}

function Title({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-2 text-[16px] font-semibold tracking-tight md:text-[17px]">{children}</h3>;
}

const P = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <p className={`whitespace-pre-line text-[15px] leading-relaxed md:text-[16px] ${className}`}>{children}</p>
);

function BlockView({ b, srcIndex }: { b: Block; srcIndex: SI }) {
  switch (b.type) {
    case "texte":
      return (
        <section>
          {str(b.titre) && <Title>{str(b.titre)}</Title>}
          <P>
            {str(b.contenu)}
            <SrcRef id={b.source_id} srcIndex={srcIndex} />
          </P>
        </section>
      );
    case "citation":
      return (
        <figure className="relative rounded-2xl border-l-4 border-brand/60 bg-brand/[0.05] py-4 pl-5 pr-4">
          <Quote size={18} className="absolute right-4 top-4 text-brand/40" aria-hidden />
          <blockquote className="pr-6 text-[16px] italic leading-relaxed md:text-[17px]">« {str(b.texte).replace(/^«\s*|\s*»$/g, "")} »</blockquote>
          {str(b.source) && <figcaption className="mt-2 text-[13px] text-muted">— {str(b.source)}</figcaption>}
        </figure>
      );
    case "saviez_vous":
      return (
        <aside className="flex gap-3 rounded-2xl bg-ai/[0.10] p-4">
          <Lightbulb size={20} className="mt-0.5 shrink-0 text-amber-700 dark:text-ai" />
          <div>
            <div className="mb-1 text-[12px] font-semibold uppercase tracking-wide text-amber-700 dark:text-ai">Le saviez-vous ?</div>
            <P className="!text-[15px]">
              {str(b.texte)}
              <SrcRef id={b.source_id} srcIndex={srcIndex} />
            </P>
          </div>
        </aside>
      );
    case "attention": {
      const warn = str(b.niveau) !== "info";
      return (
        <aside className={`flex gap-3 rounded-2xl border p-4 ${warn ? "border-danger/25 bg-danger/[0.05]" : "border-sky-500/25 bg-sky-500/[0.06]"}`}>
          {warn ? <AlertTriangle size={19} className="mt-0.5 shrink-0 text-danger" /> : <Info size={19} className="mt-0.5 shrink-0 text-sky-700 dark:text-sky-400" />}
          <P className="!text-[15px]">{str(b.texte)}</P>
        </aside>
      );
    }
    case "chronologie":
      return (
        <section>
          {str(b.titre) && <Title>{str(b.titre)}</Title>}
          <ol className="relative ml-2 border-l-2 border-line pl-5">
            {arr(b.etapes).filter(isObj).map((e, i) => (
              <li key={i} className="relative pb-4 last:pb-0">
                <span className="absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2 border-card bg-brand" aria-hidden />
                <div className="num text-[12px] font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-500">{str(e.quand)}</div>
                <div className="text-[15px] font-semibold">
                  {str(e.titre)}
                  <SrcRef id={e.source_id} srcIndex={srcIndex} />
                </div>
                {str(e.detail) && <p className="mt-0.5 text-[14px] leading-relaxed text-muted">{str(e.detail)}</p>}
              </li>
            ))}
          </ol>
        </section>
      );
    case "schema": {
      const steps = strs(b.etapes);
      return (
        <section className="well p-4">
          {str(b.titre) && <Title>{str(b.titre)}</Title>}
          <ol className="flex flex-col gap-2 md:flex-row md:flex-wrap md:items-center">
            {steps.map((s, i) => (
              <li key={i} className="flex items-center gap-2 md:contents">
                <span className="flex items-center gap-2 rounded-xl border border-line bg-card px-3 py-2 text-[14px] font-medium shadow-sm">
                  <span className="num flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand/15 text-[11px] font-bold text-brand-600 dark:text-brand-500">{i + 1}</span>
                  {s}
                </span>
                {i < steps.length - 1 && <ArrowRight size={16} className="hidden shrink-0 text-muted md:block" aria-hidden />}
              </li>
            ))}
          </ol>
          {str(b.explication) && <p className="mt-3 text-[14px] leading-relaxed text-muted">{str(b.explication)}</p>}
        </section>
      );
    }
    case "tableau": {
      const cols = strs(b.colonnes);
      const rows = arr(b.lignes).map((r) => arr(r).map(str));
      return (
        <section>
          {str(b.titre) && <Title>{str(b.titre)}<SrcRef id={b.source_id} srcIndex={srcIndex} /></Title>}
          <div className="-mx-3 overflow-x-auto px-3 sm:-mx-4 sm:px-4 md:mx-0 md:px-0">
            <table className="w-full min-w-[420px] border-separate border-spacing-0 overflow-hidden rounded-xl border border-line text-[14px]">
              {cols.length > 0 && (
                <thead>
                  <tr>
                    {cols.map((c, i) => (
                      <th key={i} className="border-b border-line bg-elev px-3 py-2 text-left text-[12px] font-semibold uppercase tracking-wide text-muted">{c}</th>
                    ))}
                  </tr>
                </thead>
              )}
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i}>
                    {r.map((c, j) => (
                      <td key={j} className={`px-3 py-2 align-top leading-snug ${i < rows.length - 1 ? "border-b border-line/70" : ""} ${j === 0 ? "font-medium" : ""}`}>{c}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {str(b.legende) && <p className="mt-2 text-[12px] text-muted">{str(b.legende)}</p>}
        </section>
      );
    }
    case "comparaison": {
      const side = (v: unknown, tone: "a" | "b") => {
        const o = isObj(v) ? v : {};
        return (
          <div className={`rounded-2xl border p-4 ${tone === "a" ? "border-line bg-elev" : "border-brand/25 bg-brand/[0.05]"}`}>
            <div className="mb-2 text-[15px] font-semibold">{str(o.titre)}</div>
            <ul className="flex flex-col gap-1.5">
              {strs(o.points).map((p, i) => (
                <li key={i} className="flex gap-2 text-[14px] leading-snug">
                  <span className={`mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full ${tone === "a" ? "bg-slate-500" : "bg-brand"}`} />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        );
      };
      return (
        <section>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {side(b.gauche, "a")}
            {side(b.droite, "b")}
          </div>
          {str(b.conclusion) && <p className="mt-3 text-[15px] font-medium leading-relaxed">{str(b.conclusion)}</p>}
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
          {str(b.titre) && <Title>{str(b.titre)}</Title>}
          <ul className="flex flex-col gap-2">
            {items.map((it, i) => (
              <li key={i} className="flex gap-3 text-[15px] leading-relaxed">
                {ordered ? (
                  <span className="num mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand/10 text-[12px] font-bold text-brand-600 dark:text-brand-500">{i + 1}</span>
                ) : (
                  <span className="mt-[10px] h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
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
          <div className="eyebrow mb-2">Vocabulaire</div>
          <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {arr(b.termes).filter(isObj).map((t, i) => (
              <div key={i} className="well p-3">
                <dt className="text-[14px] font-semibold">{str(t.terme)}</dt>
                <dd className="mt-0.5 text-[14px] leading-snug text-muted">{str(t.definition)}</dd>
              </div>
            ))}
          </dl>
        </section>
      );
    case "exemple": {
      const figs = arr(b.chiffres).filter(isObj);
      return (
        <section className="card p-4 md:p-5">
          <div className="eyebrow mb-1">Exemple</div>
          {str(b.titre) && <Title>{str(b.titre)}</Title>}
          <P className="!text-[15px]">{str(b.scenario)}</P>
          {figs.length > 0 && (
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {figs.map((f, i) => (
                <div key={i} className="well px-3 py-2">
                  <div className="text-[12px] text-muted">{str(f.label)}</div>
                  <div className="num text-[16px] font-semibold">
                    {str(f.valeur)}
                    <SrcRef id={f.source_id} srcIndex={srcIndex} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      );
    }
    case "temoignage":
      return (
        <figure className="rounded-2xl bg-elev p-4 md:p-5">
          <div className="eyebrow mb-2">Témoignage</div>
          <P className="italic">{str(b.texte)}</P>
          {str(b.auteur) && <figcaption className="mt-2 text-[13px] font-medium text-muted">— {str(b.auteur)}</figcaption>}
        </figure>
      );
    case "faq":
      return (
        <section>
          <div className="eyebrow mb-2">Questions fréquentes</div>
          <div className="flex flex-col gap-2">
            {arr(b.questions).filter(isObj).map((q, i) => (
              <details key={i} className="group rounded-xl border border-line bg-card">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-[15px] font-medium [&::-webkit-details-marker]:hidden">
                  {str(q.q)}
                  <span className="shrink-0 text-muted transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="px-4 pb-3 text-[14px] leading-relaxed text-muted">{str(q.r)}</p>
              </details>
            ))}
          </div>
        </section>
      );
    case "quiz":
      return <QuizBlock b={b} />;
    case "vrai_faux":
      return <TrueFalse b={b} />;
    case "cartes":
      return <Flashcards b={b} />;
    case "lien": {
      const url = safeUrl(b.url);
      const inner = (
        <>
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-semibold">{str(b.titre) || url}</span>
            {str(b.pourquoi) && <span className="mt-0.5 block text-[13px] leading-snug text-muted">{str(b.pourquoi)}</span>}
          </span>
          {url && <ExternalLink size={16} className="shrink-0 text-muted" />}
        </>
      );
      return url ? (
        <a href={url} target="_blank" rel="noopener noreferrer" className="card lift flex items-center gap-3 p-4">{inner}</a>
      ) : (
        <div className="card flex items-center gap-3 p-4">{inner}</div>
      );
    }
    default:
      return <FreeBlock b={b} />;
  }
}

function FreeBlock({ b }: { b: Block }) {
  const body = b.type === "libre" ? str(b.contenu) : Object.entries(b).filter(([k, v]) => k !== "type" && typeof v === "string").map(([, v]) => str(v)).join("\n\n");
  return (
    <section className="rounded-2xl border border-dashed border-line p-4">
      {str(b.description) && (
        <div className="mb-1.5 flex items-center gap-1.5 text-[12px] font-medium text-muted">
          <Sparkles size={13} /> {str(b.description)}
        </div>
      )}
      <P className="!text-[15px]">{body}</P>
    </section>
  );
}

function KeyFigures({ blocks, srcIndex }: { blocks: Block[]; srcIndex: SI }) {
  return (
    <div className={`grid gap-3 ${blocks.length === 1 ? "grid-cols-1" : blocks.length === 2 ? "grid-cols-2" : "grid-cols-2 md:grid-cols-3"}`}>
      {blocks.map((b, i) => (
        <div key={i} className={`card p-4 ${blocks.length === 3 && i === 2 ? "col-span-2 md:col-span-1" : ""}`}>
          <div className="num text-[30px] font-semibold leading-none tracking-tight text-brand-600 dark:text-brand-500 md:text-[34px]">
            {str(b.valeur)}
            <SrcRef id={b.source_id} srcIndex={srcIndex} />
          </div>
          <div className="mt-1.5 text-[14px] font-medium leading-snug">{str(b.label)}</div>
          {str(b.detail) && <div className="mt-1 text-[13px] leading-snug text-muted">{str(b.detail)}</div>}
        </div>
      ))}
    </div>
  );
}

const fmtN = (n: number) => n.toLocaleString("fr-FR", { maximumFractionDigits: 2 });

function Chart({ b, srcIndex }: { b: Block; srcIndex: SI }) {
  const data = arr(b.donnees)
    .filter(isObj)
    .map((d) => ({ label: str(d.label), v: num(d.valeur) }))
    .filter((d): d is { label: string; v: number } => d.v != null);
  const unit = str(b.unite);
  const line = str(b.forme) === "ligne";
  if (data.length === 0) return <FreeBlock b={{ type: "libre", description: "Graphique sans données lisibles", contenu: str(b.titre) }} />;
  const max = Math.max(...data.map((d) => Math.abs(d.v))) || 1;
  return (
    <section className="card p-4 md:p-5">
      {str(b.titre) && (
        <Title>
          {str(b.titre)}
          <SrcRef id={b.source_id} srcIndex={srcIndex} />
        </Title>
      )}
      {line && data.length >= 2 ? (
        <LineChart data={data} unit={unit} />
      ) : (
        <div className="flex flex-col gap-2">
          {data.map((d, i) => (
            <div key={i} className="grid grid-cols-[minmax(0,7.5rem)_1fr] items-center gap-3 text-[13px] sm:grid-cols-[minmax(0,10rem)_1fr]">
              <span className="truncate text-muted" title={d.label}>{d.label}</span>
              <span className="flex items-center gap-2">
                <span className={`h-5 rounded-md ${d.v < 0 ? "bg-danger/70" : "bg-brand/80"}`} style={{ width: `${Math.max(2, (Math.abs(d.v) / max) * 100)}%` }} />
                <span className="num shrink-0 font-semibold">{fmtN(d.v)}{unit ? ` ${unit}` : ""}</span>
              </span>
            </div>
          ))}
        </div>
      )}
      {str(b.legende) && <p className="mt-3 text-[12px] text-muted">{str(b.legende)}</p>}
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
  // Étiquettes : toutes si peu nombreuses, sinon début / milieu / fin.
  const shown = data.length <= 6 ? data.map((_, i) => i) : [0, Math.floor((data.length - 1) / 2), data.length - 1];
  return (
    <div>
      <div className="mb-2 text-[13px] text-muted">
        <span className="font-medium text-ink">{data[at].label}</span> · <span className="num font-semibold text-ink">{fmtN(data[at].v)}{unit ? ` ${unit}` : ""}</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-[140px] w-full overflow-visible md:h-[170px]" onPointerLeave={() => setHover(null)} role="img" aria-label="Courbe">
        <path d={`${d} L${xs[xs.length - 1]},${H} L${xs[0]},${H} Z`} fill="rgb(22 163 74 / 0.10)" />
        <path d={d} fill="none" stroke="#16a34a" strokeWidth={2.5} vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
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

function Verdict({ ok, text }: { ok: boolean; text: string }) {
  return (
    <div className={`mt-3 flex gap-2 rounded-xl p-3 text-[14px] leading-relaxed ${ok ? "bg-brand/[0.08]" : "bg-danger/[0.06]"}`}>
      {ok ? <Check size={17} className="mt-0.5 shrink-0 text-brand-600 dark:text-brand-500" /> : <X size={17} className="mt-0.5 shrink-0 text-danger" />}
      <span>
        <span className="font-semibold">{ok ? "Bien vu. " : "Pas tout à fait. "}</span>
        {text}
      </span>
    </div>
  );
}

function QuizBlock({ b }: { b: Block }) {
  const choices = strs(b.choix);
  const good = num(b.bonne_reponse);
  const [pick, setPick] = useState<number | null>(null);
  return (
    <section className="card p-4 md:p-5">
      <div className="eyebrow mb-1">Petit quiz</div>
      <Title>{str(b.question)}</Title>
      <div className="flex flex-col gap-2">
        {choices.map((c, i) => {
          const done = pick != null;
          const isGood = i === good;
          const cls = !done
            ? "border-line hover:border-brand/50 hover:bg-brand/[0.04]"
            : isGood
              ? "border-brand bg-brand/[0.08]"
              : i === pick
                ? "border-danger/60 bg-danger/[0.05]"
                : "border-line opacity-60";
          return (
            <button key={i} type="button" disabled={done} onClick={() => setPick(i)} className={`flex items-center gap-3 rounded-xl border px-3.5 py-3 text-left text-[15px] transition-colors ${cls}`}>
              <span className="num flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-line text-[12px] font-semibold">{String.fromCharCode(65 + i)}</span>
              <span className="flex-1">{c}</span>
              {done && isGood && <Check size={17} className="text-brand-600 dark:text-brand-500" />}
            </button>
          );
        })}
      </div>
      {pick != null && <Verdict ok={pick === good} text={str(b.explication)} />}
      {pick != null && (
        <button type="button" onClick={() => setPick(null)} className="mt-2 inline-flex items-center gap-1 text-[12px] font-medium text-muted hover:text-ink">
          <RotateCcw size={12} /> Rejouer
        </button>
      )}
    </section>
  );
}

function TrueFalse({ b }: { b: Block }) {
  const truth = b.reponse === true || str(b.reponse).toLowerCase() === "true" || str(b.reponse).toLowerCase() === "vrai";
  const [pick, setPick] = useState<boolean | null>(null);
  return (
    <section className="card p-4 md:p-5">
      <div className="eyebrow mb-1">Vrai ou faux ?</div>
      <Title>{str(b.affirmation)}</Title>
      <div className="grid grid-cols-2 gap-2">
        {[true, false].map((v) => (
          <button
            key={String(v)}
            type="button"
            disabled={pick != null}
            onClick={() => setPick(v)}
            className={`rounded-xl border py-3 text-[15px] font-semibold transition-colors ${
              pick == null ? "border-line hover:border-brand/50 hover:bg-brand/[0.04]" : v === truth ? "border-brand bg-brand/[0.08]" : pick === v ? "border-danger/60 bg-danger/[0.05]" : "border-line opacity-60"
            }`}
          >
            {v ? "Vrai" : "Faux"}
          </button>
        ))}
      </div>
      {pick != null && <Verdict ok={pick === truth} text={`C'est ${truth ? "vrai" : "faux"}. ${str(b.explication)}`} />}
    </section>
  );
}

function Flashcards({ b }: { b: Block }) {
  const cards = arr(b.cartes).filter(isObj).map((c) => ({ r: str(c.recto), v: str(c.verso) }));
  const [open, setOpen] = useState<Set<number>>(new Set());
  const toggle = (i: number) => setOpen((s) => { const n = new Set(s); if (n.has(i)) n.delete(i); else n.add(i); return n; });
  return (
    <section>
      <div className="eyebrow mb-2">Cartes · touche pour retourner</div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {cards.map((c, i) => {
          const flipped = open.has(i);
          return (
            <button key={i} type="button" onClick={() => toggle(i)} aria-pressed={flipped} className={`flex min-h-[92px] flex-col items-start justify-center rounded-2xl border p-4 text-left transition-colors ${flipped ? "border-brand/30 bg-brand/[0.06]" : "border-line bg-card hover:bg-bg"}`}>
              <span className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted">{flipped ? "Réponse" : "Question"}</span>
              <span className={`text-[15px] leading-snug ${flipped ? "" : "font-semibold"}`}>{flipped ? c.v : c.r}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
