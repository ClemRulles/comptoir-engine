// QuizLeaderboard — le classement mensuel du quiz (page Groupe) : bonnes réponses sur les
// questions posées ce mois-ci, % de réussite sur ce qu'on a joué, série de bonnes réponses.
import Link from "next/link";
import { ChevronLeft, ChevronRight, Trophy } from "lucide-react";
import { CardHead, DemoTag, Empty } from "@/components/ui";
import { monthLabel, type QuizBoard } from "@/lib/quiz";

const MEDAL = ["🥇", "🥈", "🥉"];

export function QuizLeaderboard({ board }: { board: QuizBoard }) {
  const { rows, questions } = board;
  return (
    <section id="quiz" className="card scroll-mt-24 p-5 md:p-6">
      <CardHead
        icon={Trophy}
        title="Le classement du quiz"
        sub={`${monthLabel(board.month)} · ${questions} question${questions > 1 ? "s" : ""}`}
        right={
          <div className="flex items-center gap-1">
            <DemoTag show={board.demo} />
            <Link href={`/groupe?quiz=${board.prev}#quiz`} aria-label="Mois précédent" className="pager-btn" scroll={false}>
              <ChevronLeft size={16} />
            </Link>
            {board.next ? (
              <Link href={`/groupe?quiz=${board.next}#quiz`} aria-label="Mois suivant" className="pager-btn" scroll={false}>
                <ChevronRight size={16} />
              </Link>
            ) : (
              <span className="pager-btn opacity-40" aria-hidden>
                <ChevronRight size={16} />
              </span>
            )}
          </div>
        }
      />

      {!board.ready ? (
        <Empty icon={Trophy} title="Classement à activer">
          Une seule étape : lancer <code>supabase/migration-7-quiz.sql</code> dans Supabase → SQL Editor. Le quiz fonctionne déjà, les scores
          s&apos;enregistreront ensuite.
        </Empty>
      ) : rows.length === 0 ? (
        <Empty icon={Trophy} title="Personne n'a encore joué ce mois-ci">
          La première bonne réponse prend la tête. La question du jour est sur l&apos;accueil.
        </Empty>
      ) : (
        <ol className="divide-y divide-line/70">
          {rows.map((r, i) => (
            <li key={r.userId} className={`flex items-center gap-3 py-2.5 ${r.isMe ? "-mx-2 rounded-xl bg-brand/[0.06] px-2" : ""}`}>
              <span className="w-7 shrink-0 text-center text-[15px] font-semibold tabular-nums text-muted">{MEDAL[i] ?? i + 1}</span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5 truncate text-[14px] font-semibold">
                  {r.name}
                  {r.isMe && <span className="rounded-full bg-brand/10 px-1.5 py-px text-[10px] font-semibold text-brand-600 dark:text-brand-500">toi</span>}
                </span>
                <span className="mt-1 block h-1.5 w-full max-w-[220px] overflow-hidden rounded-full bg-slate-500/15">
                  <span className="block h-full rounded-full bg-violet-500" style={{ width: `${Math.round(r.pct * 100)}%` }} />
                </span>
              </span>
              <span className="w-[76px] shrink-0 whitespace-nowrap text-right">
                <span className="num block text-[15px] font-semibold">
                  {r.correct}/{questions}
                </span>
                <span className="block text-[11px] text-muted">{Math.round(r.pct * 100)} % juste</span>
              </span>
              <span className="w-10 shrink-0 text-right text-[13px] tabular-nums" title="Bonnes réponses d'affilée">
                {r.streak >= 2 ? `🔥${r.streak}` : ""}
              </span>
            </li>
          ))}
        </ol>
      )}
      {board.ready && rows.length > 0 && (
        <p className="mt-3 text-[11px] text-muted">
          Remis à zéro chaque mois. Score = bonnes réponses sur les questions du mois · % juste = sur les questions jouées · 🔥 = bonnes réponses d&apos;affilée.
        </p>
      )}
    </section>
  );
}
