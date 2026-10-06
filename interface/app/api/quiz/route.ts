import { NextResponse, type NextRequest } from "next/server";
import { answerQuiz } from "@/lib/quiz";

export const dynamic = "force-dynamic";

// POST /api/quiz { date: "AAAA-MM-JJ", choice: 0-3 } → la correction (une seule réponse par jour).
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  try {
    const res = await answerQuiz(String(body?.date ?? ""), Number(body?.choice));
    if (!res.ok) return NextResponse.json({ error: res.error }, { status: res.status });
    return NextResponse.json(res);
  } catch (e) {
    console.error("POST /api/quiz:", e);
    return NextResponse.json({ error: "Réponse non enregistrée, réessaie dans un instant." }, { status: 500 });
  }
}
