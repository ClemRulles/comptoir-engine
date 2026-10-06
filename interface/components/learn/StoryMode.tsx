"use client";

// StoryMode — le module en plein écran, un écran par idée, façon « stories » : on touche à
// droite pour avancer, à gauche pour revenir (ou glisser), Échap / bouton retour pour fermer.
// Les textes longs sont découpés en écrans courts ; les quiz demandent une réponse avant de
// continuer ; les indices de l'énigme se débloquent quand on les atteint.
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, Lightbulb, Lock, RotateCcw, X, AlertTriangle, Sparkles, BookOpen } from "lucide-react";
import { arr, safeUrl, str, strs, type Block, type LearnModule } from "@/lib/learn/module";
import { BlockView, Burst, DevineBlock, EnigmeCtx, QuizBlock, TrueFalse, isObj } from "./blocks";

type Slide =
  | { kind: "cover" }
  | { kind: "chapter"; n: number; title: string }
  | { kind: "text"; text: string; label: string | null }
  | { kind: "figure"; b: Block }
  | { kind: "image"; b: Block }
  | { kind: "exergue"; text: string }
  | { kind: "saviez"; text: string }
  | { kind: "attention"; text: string }
  | { kind: "date"; quand: string; title: string; detail: string; i: number; total: number; label: string }
  | { kind: "steps"; title: string; steps: string[]; note: string }
  | { kind: "figs"; title: string; figs: { label: string; valeur: string }[] }
  | { kind: "game"; b: Block }
  | { kind: "enigme"; question: string }
  | { kind: "indice"; b: Block }
  | { kind: "block"; b: Block }
  | { kind: "finale"; title: string; text: string }
  | { kind: "end" };

type Placed = Slide & { ch: number };

// Découpe un texte en écrans d'environ `max` caractères, sans couper une phrase.
function chunks(text: string, max = 230): string[] {
  const sentences = text.split(/(?<=[.!?…])\s+(?=[«A-ZÀ-ÖØ-Ý0-9])/);
  const out: string[] = [];
  let cur = "";
  for (const s of sentences) {
    if (cur && (cur + " " + s).length > max) {
      out.push(cur);
      cur = s;
    } else cur = cur ? `${cur} ${s}` : s;
  }
  if (cur) out.push(cur);
  return out;
}

function buildSlides(m: LearnModule): { slides: Placed[]; chapters: number } {
  const out: Placed[] = [{ kind: "cover", ch: 0 }];
  let ch = 0;
  let label: string | null = null;
  const blocs = m.blocs;
  // Le dernier texte titré, seul en fin de module, devient la chute.
  const lastTitled = [...blocs].reverse().find((b) => b.type === "texte" && str(b.titre));
  const finale = lastTitled && blocs[blocs.length - 1] === lastTitled ? lastTitled : null;
  for (const b of blocs) {
    if (b === finale) break;
    switch (b.type) {
      case "texte":
        if (str(b.titre)) {
          ch += 1;
          label = str(b.titre);
          out.push({ kind: "chapter", n: ch, title: label, ch });
        }
        for (const t of chunks(str(b.contenu))) out.push({ kind: "text", text: t, label, ch });
        break;
      case "chiffre_cle":
        out.push({ kind: "figure", b, ch });
        break;
      case "image":
        if (safeUrl(b.url)) out.push({ kind: "image", b, ch });
        break;
      case "exergue":
        out.push({ kind: "exergue", text: str(b.texte), ch });
        break;
      case "saviez_vous":
        for (const t of chunks(str(b.texte), 260)) out.push({ kind: "saviez", text: t, ch });
        break;
      case "attention":
        out.push({ kind: "attention", text: str(b.texte), ch });
        break;
      case "chronologie": {
        const steps = arr(b.etapes).filter(isObj);
        steps.forEach((e, i) => out.push({ kind: "date", quand: str(e.quand), title: str(e.titre), detail: str(e.detail), i, total: steps.length, label: str(b.titre), ch }));
        break;
      }
      case "schema":
        out.push({ kind: "steps", title: str(b.titre), steps: strs(b.etapes), note: str(b.explication), ch });
        break;
      case "exemple": {
        const parts = chunks(str(b.scenario));
        parts.forEach((t, i) => out.push({ kind: "text", text: t, label: i === 0 ? str(b.titre) : `${str(b.titre)} (suite)`, ch }));
        const figs = arr(b.chiffres).filter(isObj).map((f) => ({ label: str(f.label), valeur: str(f.valeur) }));
        if (figs.length) out.push({ kind: "figs", title: str(b.titre), figs, ch });
        break;
      }
      case "quiz":
      case "vrai_faux":
      case "devine":
        out.push({ kind: "game", b, ch });
        break;
      case "enigme":
        out.push({ kind: "enigme", question: str(b.question), ch });
        break;
      case "indice":
        out.push({ kind: "indice", b, ch });
        break;
      default:
        out.push({ kind: "block", b, ch });
    }
  }
  if (finale) {
    ch += 1;
    out.push({ kind: "finale", title: str(finale.titre), text: str(finale.contenu), ch });
  }
  out.push({ kind: "end", ch });
  return { slides: out, chapters: ch };
}

export function StoryMode({ module: m, onClose }: { module: LearnModule; onClose: () => void }) {
  const { slides, chapters } = useMemo(() => buildSlides(m), [m]);
  const [i, setI] = useState(0);
  const [answered, setAnswered] = useState<Set<number>>(new Set());
  const [mounted, setMounted] = useState(false);
  const enigme = useContext(EnigmeCtx);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const s = slides[i];
  const blocked = s.kind === "game" && !answered.has(i);

  const next = useCallback(() => setI((x) => Math.min(slides.length - 1, x + 1)), [slides.length]);
  const prev = useCallback(() => setI((x) => Math.max(0, x - 1)), []);
  const markAnswered = useCallback(() => setAnswered((a) => (a.has(i) ? a : new Set(a).add(i))), [i]);

  // Bouton « retour » du téléphone = fermer la story.
  useEffect(() => {
    setMounted(true);
    history.pushState({ story: true }, "");
    const onPop = () => onClose();
    window.addEventListener("popstate", onPop);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("popstate", onPop);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);
  const close = useCallback(() => history.back(), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight" && !blocked) next();
      else if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close, next, prev, blocked]);

  // Un indice atteint se débloque.
  useEffect(() => {
    if (s.kind === "indice" && enigme) enigme.unlock(str(s.b.id));
  }, [s, enigme]);

  function onTap(e: React.MouseEvent<HTMLDivElement>) {
    if ((e.target as HTMLElement).closest("button, a, input, label, summary, details, select")) return;
    const r = e.currentTarget.getBoundingClientRect();
    if (e.clientX - r.left < r.width * 0.3) prev();
    else if (!blocked) next();
  }

  // Progression : un segment par chapitre (couverture comprise dans le premier).
  const segs = Array.from({ length: chapters + 1 }, (_, c) => {
    const idx = slides.map((x, k) => (x.ch === c ? k : -1)).filter((k) => k >= 0);
    if (!idx.length) return 0;
    if (i > idx[idx.length - 1]) return 1;
    if (i < idx[0]) return 0;
    return (i - idx[0] + 1) / idx.length;
  });

  const glow = ["left-[-20%] top-[-10%]", "right-[-25%] top-[10%]", "left-[-15%] bottom-[-10%]", "right-[-20%] bottom-[5%]"][s.ch % 4];

  if (!mounted) return null;
  return createPortal(
    <div className="learn fixed inset-0 z-[80] flex items-center justify-center bg-[#04060c]" data-accent={m.look?.accent ?? "vert"} role="dialog" aria-modal="true" aria-label={`Story : ${m.titre}`}>
      <div
        className="relative flex h-[100dvh] w-full select-none flex-col overflow-hidden bg-[#070b14] text-white md:h-[min(900px,94dvh)] md:w-[440px] md:rounded-[36px] md:shadow-[0_40px_120px_-20px_rgba(0,0,0,0.9)] md:ring-1 md:ring-white/10"
        onClick={onTap}
        onTouchStart={(e) => (touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY })}
        onTouchEnd={(e) => {
          const t = touch.current;
          if (!t) return;
          const dx = e.changedTouches[0].clientX - t.x;
          const dy = e.changedTouches[0].clientY - t.y;
          if (dy > 90 && Math.abs(dx) < 60) close();
          else if (dx < -50 && !blocked) next();
          else if (dx > 50) prev();
          touch.current = null;
        }}
      >
        {/* Fond : photo pour la couverture et les images, halos d'accent sinon */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          {s.kind === "cover" && m.look?.cover?.url ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={m.look.cover.url} alt="" className="h-full w-full object-cover" style={{ objectPosition: m.look.cover.position ?? "center" }} />
              <div className="absolute inset-0 bg-gradient-to-t from-[#070b14] via-[#070b14]/70 to-[#070b14]/20" />
            </>
          ) : (
            <>
              <div className={`absolute h-[70%] w-[90%] rounded-full bg-[rgb(var(--acc)/0.28)] blur-[90px] transition-all duration-700 ${glow}`} />
              <div className="absolute bottom-[-20%] right-[-30%] h-[50%] w-[80%] rounded-full bg-[rgb(var(--acc2)/0.18)] blur-[100px]" />
              <div className="dot-grid absolute inset-0 opacity-[0.12]" />
            </>
          )}
        </div>

        {/* En-tête : progression, énigme, fermer */}
        <div className="relative z-10 px-4 pt-[max(env(safe-area-inset-top),14px)]">
          <div className="flex gap-1">
            {segs.map((f, k) => (
              <span key={k} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/20">
                <span className="block h-full rounded-full bg-white transition-[width] duration-300" style={{ width: `${f * 100}%` }} />
              </span>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <span className="learn-grad flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-bold">{m.auteur.charAt(0).toUpperCase()}</span>
              <span className="truncate text-[13px] font-medium text-white/85">{m.titre}</span>
            </div>
            <button type="button" onClick={close} aria-label="Fermer la story" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur hover:bg-white/20">
              <X size={18} />
            </button>
          </div>
          {enigme && (
            <div className="mt-2 flex items-center gap-1.5">
              {enigme.indices.map((x) => {
                const on = enigme.unlocked.has(x.id);
                return (
                  <span key={x.id} className={`flex h-7 w-7 items-center justify-center rounded-full text-[15px] transition-all duration-500 ${on ? "quiz-pop bg-white/20" : "bg-white/5 opacity-40 grayscale"}`}>
                    {x.emoji}
                  </span>
                );
              })}
              <span className="ml-1 text-[11px] font-medium text-white/60">{enigme.unlocked.size}/{enigme.indices.length} indices</span>
            </div>
          )}
        </div>

        {/* Écran */}
        {/* my-auto (et non justify-center) : un écran plus haut que la fenêtre reste lisible depuis le haut. */}
        <div key={i} className="relative z-10 flex min-h-0 flex-1 animate-fade-up flex-col overflow-y-auto overscroll-contain px-6 py-6">
          <div className="my-auto">
            <SlideView s={s} m={m} onAnswer={markAnswered} />
          </div>
        </div>

        {/* Pied : aide ou bouton continuer */}
        <div className="relative z-10 flex min-h-[64px] items-center justify-center px-6 pb-[max(env(safe-area-inset-bottom),18px)]">
          {s.kind === "game" ? (
            answered.has(i) ? (
              <button type="button" onClick={next} className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-[15px] font-semibold text-[#0b1220] shadow-lift">
                Continuer <ArrowRight size={16} />
              </button>
            ) : (
              <button type="button" onClick={() => { markAnswered(); next(); }} className="text-[12px] font-medium text-white/50 hover:text-white/80">
                Passer
              </button>
            )
          ) : s.kind === "end" ? null : (
            <span className="text-[12px] font-medium text-white/45">{i === 0 ? "Touche l'écran pour commencer" : `${i + 1} / ${slides.length}`}</span>
          )}
        </div>

        {s.kind === "end" && (
          <div className="relative z-10 flex gap-2 px-6 pb-[max(env(safe-area-inset-bottom),24px)]">
            <button type="button" onClick={() => setI(0)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-white/10 py-3 text-[14px] font-semibold ring-1 ring-white/20 hover:bg-white/20">
              <RotateCcw size={15} /> Revoir
            </button>
            <button type="button" onClick={close} className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-white py-3 text-[14px] font-semibold text-[#0b1220]">
              <BookOpen size={15} /> Lire en entier
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

const Kicker = ({ children }: { children: React.ReactNode }) => (
  <div className="mb-4 text-[12px] font-semibold uppercase tracking-[0.12em] text-[rgb(var(--acc2))]">{children}</div>
);

function SlideView({ s, m, onAnswer }: { s: Placed; m: LearnModule; onAnswer: () => void }) {
  const noSrc = useMemo(() => new Map<string, number>(), []);
  const enigme = useContext(EnigmeCtx);
  switch (s.kind) {
    case "cover":
      return (
        <div className="mt-auto">
          <div className="mb-4 text-[40px]">{m.emoji || "📘"}</div>
          <h2 className="text-[34px] font-semibold leading-[1.05] tracking-[-0.025em]">{m.titre}</h2>
          {m.resume && <p className="mt-4 text-[17px] leading-relaxed text-white/80">{m.resume}</p>}
          <p className="mt-6 text-[13px] text-white/60">par {m.auteur}</p>
        </div>
      );
    case "chapter":
      return (
        <div>
          <div className="learn-grad-text num text-[120px] font-bold leading-none tracking-[-0.05em]">{String(s.n).padStart(2, "0")}</div>
          <h2 className="mt-4 text-[34px] font-semibold leading-[1.1] tracking-[-0.02em]">{s.title}</h2>
        </div>
      );
    case "text":
      return (
        <div>
          {s.label && <Kicker>{s.label}</Kicker>}
          <p className="text-[23px] font-medium leading-[1.45] tracking-[-0.01em]">{s.text}</p>
        </div>
      );
    case "figure":
      return (
        <div>
          <div className="learn-grad-text num text-[104px] font-bold leading-none tracking-[-0.05em]">{str(s.b.valeur)}</div>
          <p className="mt-5 text-[24px] font-semibold leading-snug">{str(s.b.label)}</p>
          {str(s.b.detail) && <p className="mt-3 text-[17px] leading-relaxed text-white/70">{str(s.b.detail)}</p>}
        </div>
      );
    case "image":
      return (
        <figure className="flex flex-col items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={safeUrl(s.b.url)!} alt={str(s.b.alt) || str(s.b.legende)} className="max-h-[56dvh] w-full rounded-3xl object-contain shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]" />
          <figcaption className="mt-4 w-full text-[15px] leading-snug text-white/85">
            {str(s.b.legende)}
            {str(s.b.credit) && <span className="mt-1 block text-[11px] text-white/50">{str(s.b.credit)}</span>}
          </figcaption>
        </figure>
      );
    case "exergue":
      return (
        <div className="relative pl-6">
          <span aria-hidden className="learn-grad absolute inset-y-0 left-0 w-1.5 rounded-full" />
          <p className="text-[29px] font-semibold leading-[1.25] tracking-[-0.02em]">{s.text}</p>
        </div>
      );
    case "saviez":
      return (
        <div className="rounded-[28px] bg-gradient-to-br from-amber-400/25 to-amber-500/5 p-6 ring-1 ring-amber-300/30">
          <div className="mb-3 inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.1em] text-amber-300">
            <Lightbulb size={16} /> Le saviez-vous ?
          </div>
          <p className="text-[20px] font-medium leading-[1.45]">{s.text}</p>
        </div>
      );
    case "attention":
      return (
        <div className="rounded-[28px] bg-red-500/15 p-6 ring-1 ring-red-400/30">
          <AlertTriangle size={26} className="mb-3 text-red-300" />
          <p className="text-[19px] font-medium leading-[1.45]">{s.text}</p>
        </div>
      );
    case "date": {
      const year = s.quand.match(/\b\d{4}\b/)?.[0] ?? null;
      const rest = year ? s.quand.replace(year, "").replace(/\s+/g, " ").trim() : s.quand;
      return (
        <div>
          <Kicker>{s.label || "Chronologie"} · {s.i + 1}/{s.total}</Kicker>
          {year ? <div className="learn-grad-text num text-[96px] font-bold leading-none tracking-[-0.05em]">{year}</div> : null}
          {rest && <div className="mt-2 text-[14px] font-semibold uppercase tracking-[0.1em] text-white/60">{rest}</div>}
          <h3 className="mt-5 text-[26px] font-semibold leading-tight">{s.title}</h3>
          {s.detail && <p className="mt-3 text-[17px] leading-relaxed text-white/75">{s.detail}</p>}
        </div>
      );
    }
    case "steps":
      return (
        <div>
          {s.title && <Kicker>{s.title}</Kicker>}
          <ol className="flex flex-col gap-3">
            {s.steps.map((t, k) => (
              <li key={k} className="flex animate-fade-up items-start gap-3" style={{ animationDelay: `${k * 120}ms` }}>
                <span className="learn-grad num flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[14px] font-bold">{k + 1}</span>
                <span className={`pt-1 text-[17px] leading-snug ${k === s.steps.length - 1 ? "font-semibold" : "text-white/85"}`}>{t}</span>
              </li>
            ))}
          </ol>
          {s.note && <p className="mt-5 text-[14px] leading-relaxed text-white/60">{s.note}</p>}
        </div>
      );
    case "figs":
      return (
        <div>
          <Kicker>{s.title} · en chiffres</Kicker>
          <div className="grid grid-cols-2 gap-3">
            {s.figs.map((f, k) => (
              <div key={k} className="animate-fade-up rounded-3xl bg-white/[0.07] p-4 ring-1 ring-white/10" style={{ animationDelay: `${k * 100}ms` }}>
                <div className="text-[21px] font-bold leading-tight text-[rgb(var(--acc2))]">{f.valeur}</div>
                <div className="mt-1.5 text-[13px] leading-snug text-white/65">{f.label}</div>
              </div>
            ))}
          </div>
        </div>
      );
    case "game":
      return (
        <div className="text-ink">
          {s.b.type === "quiz" ? (
            <QuizBlock b={s.b} srcIndex={noSrc} onAnswer={onAnswer} />
          ) : s.b.type === "vrai_faux" ? (
            <TrueFalse b={s.b} srcIndex={noSrc} onAnswer={onAnswer} />
          ) : (
            <DevineBlock b={s.b} srcIndex={noSrc} onAnswer={onAnswer} />
          )}
        </div>
      );
    case "enigme":
      return (
        <div>
          <Kicker>L&apos;énigme</Kicker>
          <p className="text-[27px] font-semibold leading-[1.25] tracking-[-0.015em]">{s.question}</p>
          <div className="mt-6 grid grid-cols-2 gap-2.5">
            {(enigme?.indices ?? []).map((x) => (
              <div key={x.id} className="flex flex-col items-center gap-1.5 rounded-2xl bg-white/[0.06] px-3 py-4 border border-dashed border-white/15">
                <span className="text-[30px] opacity-40 grayscale">{x.emoji}</span>
                <span className="inline-flex items-center gap-1 text-[12px] text-white/55"><Lock size={11} /> à découvrir</span>
              </div>
            ))}
          </div>
          <p className="mt-5 text-[14px] text-white/60">Chaque indice se débloque en avançant dans l&apos;histoire.</p>
        </div>
      );
    case "indice": {
      const id = str(s.b.id);
      const n = enigme ? enigme.indices.findIndex((x) => x.id === id) + 1 : 0;
      const emoji = str(s.b.emoji) || enigme?.indices.find((x) => x.id === id)?.emoji || "🔓";
      return (
        <div className="text-center">
          <div className="relative mx-auto mb-6 flex h-32 w-32 items-center justify-center rounded-[36px] bg-white/10 text-[72px] ring-1 ring-white/20 quiz-pop">
            {emoji}
            <Burst />
          </div>
          <div className="text-[13px] font-semibold uppercase tracking-[0.12em] text-[rgb(var(--acc2))]">
            Indice débloqué{n ? ` · ${n}/${enigme?.indices.length}` : ""}
          </div>
          <h3 className="mt-2 text-[30px] font-semibold leading-tight">{str(s.b.titre)}</h3>
          {str(s.b.texte) && <p className="mt-3 text-[17px] leading-relaxed text-white/75">{str(s.b.texte)}</p>}
        </div>
      );
    }
    case "finale":
      return (
        <div>
          <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.1em]">
            <Sparkles size={13} /> À retenir
          </div>
          <h2 className="text-[30px] font-semibold leading-tight tracking-[-0.02em]">{s.title}</h2>
          <p className="mt-4 text-[18px] leading-[1.6] text-white/85">{s.text}</p>
        </div>
      );
    case "end":
      return (
        <div className="text-center">
          <div className="mb-4 text-[64px]">{enigme && enigme.unlocked.size === enigme.indices.length ? "🏆" : m.emoji || "📘"}</div>
          <h2 className="text-[30px] font-semibold leading-tight">Fin du module</h2>
          <p className="mx-auto mt-3 max-w-[300px] text-[16px] leading-relaxed text-white/70">
            {enigme ? `Énigme : ${enigme.unlocked.size}/${enigme.indices.length} indices trouvés. ` : ""}
            Les sources sont listées en bas de la version complète.
          </p>
        </div>
      );
    case "block":
      return (
        <div className="max-h-full overflow-y-auto rounded-[28px] bg-card p-1 text-ink">
          <div className="p-4">
            <BlockView b={s.b} srcIndex={noSrc} dropCap={false} />
          </div>
        </div>
      );
  }
}
