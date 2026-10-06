// quiz.ts — le quiz du jour (serveur uniquement : la bonne réponse ne quitte jamais le serveur
// avant que le membre ait répondu). La question vient de memory/fund/quiz.json, écrite chaque
// nuit par la routine (skills/quiz.md) ; à défaut, de la réserve (lib/quiz-bank.ts). Les
// réponses vivent dans Supabase (table quiz_answers, migration-7-quiz.sql) et ne s'écrivent que
// par le serveur, après vérification : impossible de s'attribuer une bonne réponse.
import { fetchRepoJson } from "./github";
import { QUIZ_BANK } from "./quiz-bank";
import { createAdminClient, createClient } from "./supabase/server";

export type QuizTheme = "bases" | "histoire" | "actualite" | "nos-lignes" | "psychologie" | "crypto" | "fiscalite";
export type QuizLevel = "facile" | "moyen" | "difficile";

export interface QuizQuestion {
  date: string;
  theme?: QuizTheme;
  level?: QuizLevel;
  question: string;
  choices: string[];
  answer: number;
  explanation: string;
  source?: { name: string; url?: string };
}

// Ce que voit le navigateur AVANT de répondre.
export interface QuizPublic {
  date: string;
  theme?: QuizTheme;
  level?: QuizLevel;
  question: string;
  choices: string[];
  origin: "ia" | "reserve";
}

// Ce qu'il reçoit APRÈS avoir répondu.
export interface QuizReveal {
  choice: number;
  correct: boolean;
  answer: number;
  explanation: string;
  source?: { name: string; url?: string };
}

export interface QuizDayStats {
  answered: number;
  correct: number;
}

export const THEME_LABEL: Record<QuizTheme, string> = {
  bases: "Les bases",
  histoire: "Histoire",
  actualite: "Actualité",
  "nos-lignes": "Nos lignes",
  psychologie: "Psychologie",
  crypto: "Crypto",
  fiscalite: "Fiscalité",
};

const isConfigured = () => Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// Date du jour à Paris (le quiz change à minuit, heure de Paris).
export function parisDate(d: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}

const dayNumber = (date: string) => Math.floor(Date.parse(`${date}T00:00:00Z`) / 86_400_000);

function validQuestion(q: unknown): q is QuizQuestion {
  const x = q as QuizQuestion;
  return Boolean(
    x &&
      typeof x.date === "string" &&
      typeof x.question === "string" &&
      x.question.trim() &&
      Array.isArray(x.choices) &&
      x.choices.length === 4 &&
      x.choices.every((c) => typeof c === "string" && c.trim()) &&
      Number.isInteger(x.answer) &&
      x.answer >= 0 &&
      x.answer <= 3 &&
      typeof x.explanation === "string"
  );
}

// Mélange déterministe (même ordre pour tout le monde ce jour-là) : la bonne réponse de la
// réserve ne tombe pas toujours au même endroit.
function seededOrder(seed: number): number[] {
  const order = [0, 1, 2, 3];
  let s = (seed * 2654435761) >>> 0;
  for (let i = order.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) >>> 0;
    const j = s % (i + 1);
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

export async function quizFor(date: string): Promise<{ q: QuizQuestion; origin: "ia" | "reserve" }> {
  const file = await fetchRepoJson<{ questions?: unknown[] }>("memory/fund/quiz.json");
  const hit = (file?.questions ?? []).find((q) => validQuestion(q) && q.date === date) as QuizQuestion | undefined;
  if (hit) return { q: hit, origin: "ia" };
  const n = dayNumber(date);
  const base = QUIZ_BANK[((n % QUIZ_BANK.length) + QUIZ_BANK.length) % QUIZ_BANK.length];
  const order = seededOrder(n);
  return {
    q: { ...base, date, choices: order.map((i) => base.choices[i]), answer: order.indexOf(base.answer) },
    origin: "reserve",
  };
}

export const toPublic = (q: QuizQuestion, origin: "ia" | "reserve"): QuizPublic => ({
  date: q.date,
  theme: q.theme,
  level: q.level,
  question: q.question,
  choices: q.choices,
  origin,
});

export const reveal = (q: QuizQuestion, choice: number): QuizReveal => ({
  choice,
  correct: choice === q.answer,
  answer: q.answer,
  explanation: q.explanation,
  source: q.source,
});

// Table absente (migration pas encore lancée) : le quiz marche, rien ne s'enregistre.
const tableMissing = (e: { code?: string; message?: string } | null) =>
  Boolean(e && (e.code === "42P01" || e.code === "PGRST205" || /quiz_answers/.test(e.message ?? "")));

export const memberName = (user: { email?: string | null; user_metadata?: Record<string, unknown> }) =>
  (user.user_metadata?.display_name as string) || (user.email ? user.email.split("@")[0] : "Membre");

export interface QuizState {
  demo: boolean;
  ready: boolean; // false : table quiz_answers absente → pas d'enregistrement ni de classement
  quiz: QuizPublic;
  reveal: QuizReveal | null;
  stats: QuizDayStats | null;
}

// État du quiz du jour pour le membre connecté (accueil, rendu serveur).
export async function getQuizState(): Promise<QuizState> {
  const today = parisDate();
  const { q, origin } = await quizFor(today);
  const base = { quiz: toPublic(q, origin), reveal: null, stats: null };
  if (!isConfigured()) return { demo: true, ready: true, ...base };
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data, error } = await supabase.from("quiz_answers").select("user_id, choice, correct").eq("quiz_date", today);
    if (error) return { demo: false, ready: !tableMissing(error), ...base };
    const rows = (data ?? []) as { user_id: string; choice: number; correct: boolean }[];
    const stats = { answered: rows.length, correct: rows.filter((r) => r.correct).length };
    const mine = user ? rows.find((r) => r.user_id === user.id) : undefined;
    return { demo: false, ready: true, quiz: base.quiz, reveal: mine ? reveal(q, mine.choice) : null, stats };
  } catch (e) {
    console.error("getQuizState:", e);
    return { demo: false, ready: false, ...base };
  }
}

export type AnswerResult =
  | { ok: true; reveal: QuizReveal; stats: QuizDayStats | null; stored: boolean; demo: boolean }
  | { ok: false; status: number; error: string };

// Enregistre la réponse (une seule par jour et par membre) et renvoie la correction.
export async function answerQuiz(date: string, choice: number): Promise<AnswerResult> {
  const today = parisDate();
  if (date !== today) return { ok: false, status: 409, error: "La question du jour a changé : recharge la page." };
  if (!Number.isInteger(choice) || choice < 0 || choice > 3) return { ok: false, status: 400, error: "Réponse invalide." };
  const { q } = await quizFor(today);
  if (!isConfigured()) return { ok: true, reveal: reveal(q, choice), stats: null, stored: false, demo: true };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, status: 401, error: "Connecte-toi pour répondre." };

  const admin = createAdminClient();
  const { data: existing, error: readErr } = await admin
    .from("quiz_answers")
    .select("choice")
    .eq("user_id", user.id)
    .eq("quiz_date", today)
    .maybeSingle();
  if (tableMissing(readErr)) return { ok: true, reveal: reveal(q, choice), stats: null, stored: false, demo: false };
  if (readErr) return { ok: false, status: 500, error: readErr.message };

  // Déjà répondu : on renvoie SA réponse, pas la nouvelle (un seul essai).
  let final = existing ? Number((existing as { choice: number }).choice) : choice;
  if (!existing) {
    const { error } = await admin.from("quiz_answers").insert({
      user_id: user.id,
      quiz_date: today,
      choice,
      correct: choice === q.answer,
      user_name: memberName(user),
    });
    if (error && error.code === "23505") {
      const { data: again } = await admin.from("quiz_answers").select("choice").eq("user_id", user.id).eq("quiz_date", today).maybeSingle();
      if (again) final = Number((again as { choice: number }).choice);
    } else if (error) {
      return { ok: false, status: 500, error: error.message };
    }
  }

  const { data: day } = await admin.from("quiz_answers").select("correct").eq("quiz_date", today);
  const rows = (day ?? []) as { correct: boolean }[];
  return { ok: true, reveal: reveal(q, final), stats: { answered: rows.length, correct: rows.filter((r) => r.correct).length }, stored: true, demo: false };
}

// ── Classement mensuel (page Groupe) ───────────────────────────────────────────────────
export interface QuizBoardRow {
  userId: string;
  name: string;
  correct: number;
  answered: number;
  pct: number;
  streak: number;
  isMe: boolean;
}

export interface QuizBoard {
  demo: boolean;
  ready: boolean;
  month: string; // AAAA-MM
  questions: number; // questions posées ce mois-ci (jusqu'à aujourd'hui)
  rows: QuizBoardRow[];
  prev: string;
  next: string | null;
}

const MONTHS = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
export const monthLabel = (ym: string) => `${MONTHS[Number(ym.slice(5, 7)) - 1] ?? ""} ${ym.slice(0, 4)}`;

function shiftMonth(ym: string, d: number): string {
  const [y, m] = ym.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1 + d, 1));
  return `${t.getUTCFullYear()}-${String(t.getUTCMonth() + 1).padStart(2, "0")}`;
}
const lastDay = (ym: string) => {
  const [y, m] = ym.split("-").map(Number);
  return `${ym}-${String(new Date(Date.UTC(y, m, 0)).getUTCDate()).padStart(2, "0")}`;
};
const addDays = (date: string, d: number) => new Date(Date.parse(`${date}T00:00:00Z`) + d * 86_400_000).toISOString().slice(0, 10);

type AnswerRow = { user_id: string; user_name: string | null; quiz_date: string; correct: boolean };

export function buildBoard(rows: AnswerRow[], month: string, today: string, meId: string | null): Pick<QuizBoard, "questions" | "rows"> {
  const start = `${month}-01`;
  const end = lastDay(month);
  const upTo = today < end ? today : end;
  const questions = today < start ? 0 : dayNumber(upTo) - dayNumber(start) + 1;
  const isCurrent = today >= start && today <= end;

  const byUser = new Map<string, AnswerRow[]>();
  for (const r of rows) byUser.set(r.user_id, [...(byUser.get(r.user_id) ?? []), r]);

  const out: QuizBoardRow[] = [];
  for (const [userId, list] of byUser) {
    const inMonth = list.filter((r) => r.quiz_date >= start && r.quiz_date <= end);
    if (!inMonth.length) continue;
    const correct = inMonth.filter((r) => r.correct).length;
    const latest = [...list].sort((a, b) => b.quiz_date.localeCompare(a.quiz_date))[0];
    // Série : bonnes réponses d'affilée, jusqu'à aujourd'hui (ou hier si pas encore joué).
    let streak = 0;
    if (isCurrent) {
      const ok = new Map(list.map((r) => [r.quiz_date, r.correct]));
      let d = ok.has(today) ? today : addDays(today, -1);
      while (ok.get(d) === true) {
        streak++;
        d = addDays(d, -1);
      }
    }
    out.push({ userId, name: latest.user_name || "Membre", correct, answered: inMonth.length, pct: correct / inMonth.length, streak, isMe: userId === meId });
  }
  out.sort((a, b) => b.correct - a.correct || b.pct - a.pct || a.name.localeCompare(b.name, "fr"));
  return { questions, rows: out };
}

const DEMO_BOARD: AnswerRow[] = (() => {
  // Démo : quelques membres fictifs, résultats illustratifs.
  const today = parisDate();
  const names = ["Henri", "Léa", "Clément", "Sam", "Inès", "Nico"];
  const rate = [0.85, 0.75, 0.7, 0.6, 0.55, 0.4];
  const rows: AnswerRow[] = [];
  for (let k = 0; k < 20; k++) {
    const d = addDays(today, -k);
    names.forEach((n, i) => {
      if ((k + i) % 5 === 4) return; // quelques jours sans réponse
      rows.push({ user_id: `demo-${i}`, user_name: n, quiz_date: d, correct: ((k * 7 + i * 3) % 20) / 20 < rate[i] });
    });
  }
  return rows;
})();

export async function getQuizBoard(monthParam?: string | null): Promise<QuizBoard> {
  const today = parisDate();
  const current = today.slice(0, 7);
  const month = monthParam && /^\d{4}-\d{2}$/.test(monthParam) && monthParam <= current ? monthParam : current;
  const nav = { month, prev: shiftMonth(month, -1), next: month < current ? shiftMonth(month, 1) : null };
  if (!isConfigured()) return { demo: true, ready: true, ...nav, ...buildBoard(DEMO_BOARD, month, today, "demo-2") };
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const from = addDays(`${month}-01`, -62); // assez d'historique pour la série
    const { data, error } = await supabase
      .from("quiz_answers")
      .select("user_id, user_name, quiz_date, correct")
      .gte("quiz_date", from)
      .lte("quiz_date", lastDay(month));
    if (error) return { demo: false, ready: !tableMissing(error), ...nav, questions: 0, rows: [] };
    return { demo: false, ready: true, ...nav, ...buildBoard((data ?? []) as AnswerRow[], month, today, user?.id ?? null) };
  } catch (e) {
    console.error("getQuizBoard:", e);
    return { demo: false, ready: false, ...nav, questions: 0, rows: [] };
  }
}
