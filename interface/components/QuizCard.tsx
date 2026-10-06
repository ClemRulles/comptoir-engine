"use client";

// QuizCard — le quiz du jour sur l'accueil : une question, 4 réponses, un seul essai. La
// correction (bonne réponse + explication) arrive du serveur après le clic. En démo, la réponse
// est gardée dans ce navigateur.
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Check, Lightbulb, Loader2, Trophy, X } from "lucide-react";
import type { QuizDayStats, QuizPublic, QuizReveal } from "@/lib/quiz";

const THEME_LABEL: Record<string, string> = {
  bases: "Les bases",
  histoire: "Histoire",
  actualite: "Actualité",
  "nos-lignes": "Nos lignes",
  psychologie: "Psychologie",
  crypto: "Crypto",
  fiscalite: "Fiscalité",
};
const LETTERS = ["A", "B", "C", "D"];

export function QuizCard({
  quiz,
  initialReveal,
  initialStats,
  demo,
  ready,
}: {
  quiz: QuizPublic;
  initialReveal: QuizReveal | null;
  initialStats: QuizDayStats | null;
  demo: boolean;
  ready: boolean;
}) {
  const key = `quiz:${quiz.date}`;
  const [rev, setRev] = useState<QuizReveal | null>(initialReveal);
  const [stats, setStats] = useState<QuizDayStats | null>(initialStats);
  const [pending, setPending] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fresh, setFresh] = useState(false); // vient de répondre → animation

  // Démo : la réponse du jour est gardée localement.
  useEffect(() => {
    if (!demo || rev) return;
    try {
      const saved = localStorage.getItem(key);
      if (saved) setRev(JSON.parse(saved));
    } catch {}
  }, [demo, key, rev]);

  async function answer(i: number) {
    if (rev || pending != null) return;
    setPending(i);
    setError(null);
    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: quiz.date, choice: i }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Réponse non enregistrée, réessaie.");
      setRev(data.reveal);
      if (data.stats) setStats(data.stats);
      setFresh(true);
      if (demo) {
        try {
          localStorage.setItem(key, JSON.stringify(data.reveal));
        } catch {}
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur réseau, réessaie.");
    }
    setPending(null);
  }

  const answered = rev != null;
  const others = stats?.answered ?? 0;

  return (
    <section className="card relative overflow-hidden p-5 md:p-6" aria-labelledby="quiz-title">
      <div aria-hidden className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-violet-500/10 blur-3xl" />
      <div className="relative mb-4 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-700 dark:text-violet-400">
            <Lightbulb size={16} strokeWidth={2.2} />
          </span>
          <div className="min-w-0">
            <h2 id="quiz-title" className="h-section">Le quiz du jour</h2>
            <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[12px] text-muted">
              {quiz.theme && <span className="font-medium text-violet-700 dark:text-violet-400">{THEME_LABEL[quiz.theme] ?? quiz.theme}</span>}
              {quiz.level && <span>· {quiz.level}</span>}
              <span>· une question par jour</span>
            </p>
          </div>
        </div>
        {demo ? (
          <span className="rounded-full bg-ai/10 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:text-ai">Démo</span>
        ) : stats && stats.answered > 0 ? (
          <span className="shrink-0 text-right text-[11px] text-muted">
            {others} membre{others > 1 ? "s" : ""}
            <br className="sm:hidden" /> {others > 1 ? "ont" : "a"} répondu
          </span>
        ) : null}
      </div>

      <p className="relative text-[17px] font-semibold leading-snug md:text-lg">{quiz.question}</p>

      <div className="relative mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2" role="group" aria-label="Réponses">
        {quiz.choices.map((c, i) => {
          const isAnswer = answered && rev!.answer === i;
          const isWrongPick = answered && rev!.choice === i && !rev!.correct;
          const dim = answered && !isAnswer && !isWrongPick;
          return (
            <button
              key={i}
              type="button"
              onClick={() => answer(i)}
              disabled={answered || pending != null}
              aria-pressed={answered ? rev!.choice === i : undefined}
              className={[
                "quiz-choice group flex min-h-[52px] items-center gap-3 rounded-2xl border px-3.5 py-2.5 text-left text-[14px] font-medium transition",
                !answered ? "border-line bg-card hover:-translate-y-px hover:border-violet-400/60 hover:shadow-soft active:translate-y-0" : "",
                isAnswer ? `border-brand/50 bg-brand/[0.09] text-ink ${fresh && rev!.correct ? "quiz-pop" : ""}` : "",
                isWrongPick ? `border-danger/50 bg-danger/[0.07] ${fresh ? "quiz-shake" : ""}` : "",
                dim ? "border-line/60 opacity-50" : "",
              ].join(" ")}
            >
              <span
                className={[
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-bold",
                  isAnswer ? "bg-brand text-white" : isWrongPick ? "bg-danger text-white" : "bg-slate-500/10 text-muted group-hover:bg-violet-500/15 group-hover:text-violet-700 dark:group-hover:text-violet-300",
                ].join(" ")}
              >
                {pending === i ? <Loader2 size={14} className="animate-spin" /> : isAnswer ? <Check size={15} strokeWidth={3} /> : isWrongPick ? <X size={15} strokeWidth={3} /> : LETTERS[i]}
              </span>
              <span className="min-w-0">{c}</span>
            </button>
          );
        })}
        {fresh && rev?.correct && (
          <span aria-hidden className="quiz-burst pointer-events-none absolute inset-0">
            {Array.from({ length: 12 }).map((_, k) => (
              <i key={k} style={{ ["--a" as string]: `${k * 30}deg`, ["--d" as string]: `${k * 18}ms` }} />
            ))}
          </span>
        )}
      </div>

      {error && <p className="mt-3 text-[13px] text-danger">{error}</p>}

      {answered && (
        <div className="relative mt-4 animate-fade-in rounded-2xl bg-bg/70 p-4 ring-1 ring-line/70" aria-live="polite">
          <p className={`text-[15px] font-semibold ${rev!.correct ? "text-brand-600 dark:text-brand-500" : "text-danger"}`}>
            {rev!.correct ? "Bonne réponse !" : `Raté : la bonne réponse était ${LETTERS[rev!.answer]}.`}
          </p>
          <p className="mt-1.5 text-[14px] leading-relaxed">{rev!.explanation}</p>
          {rev!.source?.name && (
            <p className="mt-2 text-[11px] text-muted">
              Source :{" "}
              {rev!.source.url ? (
                <a href={rev!.source.url} target="_blank" rel="noreferrer" className="underline decoration-dotted underline-offset-2">
                  {rev!.source.name}
                </a>
              ) : (
                rev!.source.name
              )}
            </p>
          )}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-line/70 pt-3 text-[12px] text-muted">
            <span>
              {stats && stats.answered > 0
                ? `${Math.round((stats.correct / stats.answered) * 100)} % des ${stats.answered} membres ont trouvé.`
                : "Nouvelle question demain."}
              {!demo && !ready && " Ton score s'enregistrera dès l'activation du classement."}
            </span>
            <Link href="/groupe#quiz" className="link group">
              <Trophy size={14} /> Classement du mois
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
