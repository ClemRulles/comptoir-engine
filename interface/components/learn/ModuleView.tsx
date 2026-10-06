"use client";

// ModuleView — mise en page de lecture d'un module : couverture, chapitres numérotés (chaque
// bloc « texte » titré ouvre un chapitre), barre de progression, sommaire (ordinateur), énigme
// dont les indices se débloquent en lisant, et bouton vers le mode story (plein écran).
// Le rendu de chaque bloc est dans blocks.tsx, le mode story dans StoryMode.tsx.
import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { BookMarked, ChevronDown, Clock, Layers, Play, Sparkles } from "lucide-react";
import { readingMinutes, safeUrl, str, type Block, type LearnModule } from "@/lib/learn/module";
import { BlockView, EnigmeCtx, enigmeOf, groupFigures, KeyFigures, Reveal, type EnigmeState } from "./blocks";
import { StoryMode } from "./StoryMode";

// Un chapitre = un bloc « texte » titré + les blocs qui le suivent.
export type Chapter = { id: string; title: string | null; blocks: Block[] };
export function chapters(blocs: Block[]): Chapter[] {
  const out: Chapter[] = [];
  for (const b of blocs) {
    if (b.type === "texte" && str(b.titre)) {
      out.push({ id: `ch-${out.length + 1}`, title: str(b.titre), blocks: [{ ...b, titre: "" }] });
    } else {
      if (!out.length) out.push({ id: "ch-0", title: null, blocks: [] });
      out[out.length - 1].blocks.push(b);
    }
  }
  return out;
}

// État de l'énigme partagé entre la lecture et la story.
export function useEnigme(m: LearnModule): EnigmeState | null {
  const e = useMemo(() => enigmeOf(m.blocs), [m.blocs]);
  const [unlocked, setUnlocked] = useState<Set<string>>(new Set());
  const unlock = useCallback((id: string) => setUnlocked((s) => (s.has(id) ? s : new Set(s).add(id))), []);
  return useMemo(() => (e ? { ...e, unlocked, unlock } : null), [e, unlocked, unlock]);
}

export function ModuleView({ module: m, preview = false }: { module: LearnModule; preview?: boolean }) {
  const srcIndex = new Map(m.sources.map((s, i) => [s.id, i + 1]));
  const chs = chapters(m.blocs);
  const titled = chs.filter((c) => c.title);
  const last = chs[chs.length - 1];
  // Dernier chapitre fait d'un seul texte : c'est la chute → carte « À retenir ».
  const finale = chs.length > 1 && last.title && last.blocks.length === 1 && last.blocks[0].type === "texte" ? last : null;
  const body = finale ? chs.slice(0, -1) : chs;
  const articleRef = useRef<HTMLElement>(null);
  const enigme = useEnigme(m);
  const [story, setStory] = useState(false);

  return (
    <EnigmeCtx.Provider value={enigme}>
      <div className="learn" data-accent={m.look?.accent ?? "vert"}>
        {!preview && <ProgressBar target={articleRef} />}
        <Cover module={m} onStory={() => setStory(true)} />
        <div className="mt-8 grid grid-cols-1 gap-10 md:mt-12 lg:grid-cols-[minmax(0,1fr)_220px] lg:gap-14">
          <article ref={articleRef} className="mx-auto w-full min-w-0 max-w-[680px]">
            {enigme && <EnigmeBar />}
            {body.map((c, ci) => (
              <section key={c.id} id={c.id} className={`scroll-mt-28 ${ci ? "mt-14 md:mt-20" : ""}`}>
                {c.title && <ChapterHead n={titled.indexOf(c) + 1} title={c.title} />}
                <div className="flex flex-col gap-6 md:gap-8">
                  {groupFigures(c.blocks).map((g, i) => (
                    <Reveal key={i}>
                      {Array.isArray(g) ? <KeyFigures blocks={g} srcIndex={srcIndex} /> : <BlockView b={g} srcIndex={srcIndex} dropCap={ci === 0 && i === 0} />}
                    </Reveal>
                  ))}
                </div>
              </section>
            ))}
            {finale && (
              <Reveal className="mt-14 md:mt-20">
                <Finale id={finale.id} title={finale.title!} text={str(finale.blocks[0].contenu)} />
              </Reveal>
            )}
            {m.sources.length > 0 && <Sources module={m} />}
          </article>
          {titled.length > 1 && !preview && <Toc chapters={titled} />}
        </div>
        {story && <StoryMode module={m} onClose={() => setStory(false)} />}
      </div>
    </EnigmeCtx.Provider>
  );
}

// Barre collante : où en est l'énigme.
function EnigmeBar() {
  return (
    <EnigmeCtx.Consumer>
      {(e) =>
        e && (
          <div className="pointer-events-none sticky top-[70px] z-10 mb-8 flex h-12 justify-center md:top-[76px]">
            <div className="pointer-events-auto flex items-center gap-1.5 rounded-full border border-line/80 bg-card/90 py-1.5 pl-3 pr-1.5 shadow-lift backdrop-blur">
              <span className="mr-1 text-[12px] font-semibold text-muted">
                {e.unlocked.size === e.indices.length ? "Énigme résolue" : `Indices ${e.unlocked.size}/${e.indices.length}`}
              </span>
              {e.indices.map((x) => {
                const on = e.unlocked.has(x.id);
                return (
                  <span
                    key={x.id}
                    title={on ? x.label : "À découvrir"}
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-[17px] transition-all duration-500 ${on ? "quiz-pop bg-[rgb(var(--acc)/0.14)]" : "bg-elev opacity-40 grayscale"}`}
                  >
                    {x.emoji}
                  </span>
                );
              })}
            </div>
          </div>
        )
      }
    </EnigmeCtx.Consumer>
  );
}

// ── Couverture ───────────────────────────────────────────────────────────────

function Cover({ module: m, onStory }: { module: LearnModule; onStory: () => void }) {
  const cover = m.look?.cover;
  const img = cover ? safeUrl(cover.url) : null;
  const [broken, setBroken] = useState(false);
  const photo = !!img && !broken;
  const initial = (m.auteur || "?").trim().charAt(0).toUpperCase();
  const page = cover?.page ? safeUrl(cover.page) : null;
  return (
    <header className={`relative isolate overflow-hidden rounded-[28px] border border-line/70 shadow-lift ${photo ? "bg-[#0b1220]" : "bg-card"}`}>
      {photo ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img!} alt="" onError={() => setBroken(true)} className="absolute inset-0 -z-10 h-full w-full object-cover" style={{ objectPosition: cover?.position ?? "center" }} />
          <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-[#060a14] via-[#060a14]/75 to-[#060a14]/10" />
        </>
      ) : (
        <div aria-hidden className="absolute inset-0 -z-10">
          <div className="absolute -left-20 -top-24 h-72 w-72 rounded-full bg-[rgb(var(--acc)/0.22)] blur-3xl" />
          <div className="absolute -right-16 top-10 h-64 w-64 rounded-full bg-[rgb(var(--acc2)/0.16)] blur-3xl" />
          <div className="dot-grid absolute inset-0 opacity-40" />
          <span className="absolute -right-4 -top-6 select-none text-[160px] leading-none opacity-[0.12] md:text-[220px]">{m.emoji || "📘"}</span>
        </div>
      )}
      <div className={`flex min-h-[420px] flex-col justify-end gap-4 p-6 md:min-h-[480px] md:p-10 ${photo ? "text-white" : ""}`}>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`flex h-11 w-11 items-center justify-center rounded-2xl text-[24px] ${photo ? "bg-white/15 ring-1 ring-white/25 backdrop-blur" : "bg-[rgb(var(--acc)/0.12)]"}`} aria-hidden>
            {m.emoji || "📘"}
          </span>
          {m.etiquettes.map((t) => (
            <span key={t} className={`chip ${photo ? "bg-white/15 text-white ring-1 ring-white/20 backdrop-blur" : "bg-[rgb(var(--acc)/0.10)] text-[rgb(var(--acc-ink))]"}`}>{t}</span>
          ))}
        </div>
        <h1 className="max-w-3xl text-[30px] font-semibold leading-[1.08] tracking-[-0.025em] md:text-[46px]">{m.titre}</h1>
        {m.resume && <p className={`max-w-2xl text-[16px] leading-relaxed md:text-[18px] ${photo ? "text-white/85" : "text-muted"}`}>{m.resume}</p>}
        <div className={`mt-1 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] ${photo ? "text-white/80" : "text-muted"}`}>
          <span className="flex items-center gap-2">
            <span className="learn-grad flex h-8 w-8 items-center justify-center rounded-full text-[13px] font-bold text-white shadow-sm">{initial}</span>
            <span>
              par <span className={`font-semibold ${photo ? "text-white" : "text-ink"}`}>{m.auteur}</span>
            </span>
          </span>
          <span className="inline-flex items-center gap-1.5"><Clock size={14} /> {readingMinutes(m)} min de lecture</span>
          {m.niveau && <span className="inline-flex items-center gap-1.5 capitalize"><Layers size={14} /> {m.niveau}</span>}
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <button type="button" onClick={onStory} className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-[15px] font-semibold shadow-lift transition-transform hover:-translate-y-0.5 ${photo ? "bg-white text-[#0b1220]" : "learn-grad text-white"}`}>
            <Play size={16} fill="currentColor" /> Vivre la story
          </button>
          <a href="#ch-1" className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-[15px] font-semibold transition-colors ${photo ? "bg-white/15 text-white ring-1 ring-white/25 backdrop-blur hover:bg-white/25" : "border border-line bg-card hover:bg-bg"}`}>
            Lire en entier
          </a>
        </div>
      </div>
      {photo && cover?.credit && (
        <span className="absolute right-3 top-3 max-w-[70%] truncate rounded-full bg-black/40 px-2.5 py-0.5 text-[10px] text-white/85 backdrop-blur">
          {page ? <a href={page} target="_blank" rel="noopener noreferrer">{cover.credit}</a> : cover.credit}
        </span>
      )}
    </header>
  );
}

function ChapterHead({ n, title }: { n: number; title: string }) {
  return (
    <div className="mb-5 md:mb-6">
      <div className="mb-2 flex items-center gap-3">
        <span className="learn-grad flex h-9 min-w-9 items-center justify-center rounded-xl px-2 text-[13px] font-bold tracking-[0.06em] text-white shadow-[0_8px_20px_-8px_rgb(var(--acc)/0.8)]">{String(n).padStart(2, "0")}</span>
        <span className="h-px flex-1 bg-gradient-to-r from-[rgb(var(--acc)/0.45)] to-transparent" />
      </div>
      <h2 className="text-[26px] font-semibold leading-tight tracking-[-0.02em] md:text-[32px]">{title}</h2>
    </div>
  );
}

function Finale({ id, title, text }: { id: string; title: string; text: string }) {
  return (
    <section id={id} className="learn-grad relative scroll-mt-28 overflow-hidden rounded-[28px] p-[1.5px] shadow-lift">
      <div className="relative overflow-hidden rounded-[27px] bg-card p-6 md:p-9">
        <div aria-hidden className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[rgb(var(--acc)/0.14)] blur-3xl" />
        <div className="relative">
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-[rgb(var(--acc)/0.12)] px-3 py-1 text-[12px] font-semibold uppercase tracking-wide text-[rgb(var(--acc-ink))]">
            <Sparkles size={13} /> À retenir
          </div>
          <h2 className="text-[24px] font-semibold leading-tight tracking-[-0.02em] md:text-[30px]">{title}</h2>
          <p className="mt-3 whitespace-pre-line text-[17px] leading-[1.75] md:text-[18px]">{text}</p>
        </div>
      </div>
    </section>
  );
}

function Sources({ module: m }: { module: LearnModule }) {
  return (
    <details className="group mt-12 rounded-2xl border border-line bg-card/70">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 [&::-webkit-details-marker]:hidden">
        <span className="flex items-center gap-2 text-[14px] font-semibold"><BookMarked size={16} className="text-[rgb(var(--acc-ink))]" /> Sources ({m.sources.length})</span>
        <ChevronDown size={16} className="text-muted transition-transform group-open:rotate-180" />
      </summary>
      <ol className="flex flex-col gap-2.5 border-t border-line px-5 py-4 text-[13px] leading-snug text-muted">
        {m.sources.map((s, i) => (
          <li key={s.id} id={`src-${s.id}`} className="flex scroll-mt-28 gap-2.5">
            <span className="num flex h-5 min-w-5 shrink-0 items-center justify-center rounded-md bg-slate-100 px-1 text-[11px] font-semibold text-ink">{i + 1}</span>
            <span className="min-w-0">
              {s.url ? (
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="break-words text-ink underline-offset-2 hover:underline">{s.titre}</a>
              ) : (
                <span className="text-ink">{s.titre}</span>
              )}
              {s.date && <span> · consulté {s.date}</span>}
            </span>
          </li>
        ))}
      </ol>
    </details>
  );
}

// Barre de progression de lecture, fixée en haut de l'écran.
function ProgressBar({ target }: { target: React.RefObject<HTMLElement | null> }) {
  const [p, setP] = useState(0);
  useEffect(() => {
    let raf = 0;
    const on = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = target.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const total = r.height - window.innerHeight * 0.6;
        setP(Math.min(1, Math.max(0, -r.top / Math.max(1, total))));
      });
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
    };
  }, [target]);
  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-50 h-[3px]">
      <div className="learn-grad h-full origin-left rounded-r-full" style={{ transform: `scaleX(${p})` }} />
    </div>
  );
}

// Sommaire (ordinateur) : chapitre en cours surligné.
function Toc({ chapters: chs }: { chapters: Chapter[] }) {
  const [active, setActive] = useState(chs[0]?.id);
  useEffect(() => {
    const els = chs.map((c) => document.getElementById(c.id)).filter((e): e is HTMLElement => !!e);
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) setActive(vis[0].target.id);
      },
      { rootMargin: "-20% 0px -65% 0px" }
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [chs]);
  return (
    <nav aria-label="Sommaire" className="hidden lg:block">
      <div className="sticky top-24">
        <div className="eyebrow mb-3">Sommaire</div>
        <ol className="flex flex-col gap-1 border-l border-line">
          {chs.map((c, i) => (
            <li key={c.id}>
              <a
                href={`#${c.id}`}
                className={`-ml-px flex gap-2.5 border-l-2 py-1.5 pl-3 text-[13px] leading-snug transition-colors ${
                  active === c.id ? "border-[rgb(var(--acc))] font-medium text-ink" : "border-transparent text-muted hover:text-ink"
                }`}
              >
                <span className="num text-[11px] font-semibold opacity-70">{String(i + 1).padStart(2, "0")}</span>
                {c.title}
              </a>
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
