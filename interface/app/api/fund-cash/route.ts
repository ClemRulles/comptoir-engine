import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isConfigured } from "@/lib/data";
import { SEED_START_CAPITAL } from "@/lib/seed-book";
import type { Fund } from "@/lib/types";

// Fixe la trésorerie (cash de marge) du fonds groupe. Le cash entre dans le NAV ;
// le capital de départ devient positions(t0) + cash + apports déjà reçus, pour que la
// perf reste un vrai rendement (le cash n'est pas un gain).
// POST { cash: number }
export async function POST(request: NextRequest) {
  if (!isConfigured()) {
    return NextResponse.json({ error: "Mode démo : indisponible." }, { status: 503 });
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const cash = Number(body?.cash);
  if (!Number.isFinite(cash) || cash < 0) {
    return NextResponse.json({ error: "Montant de cash invalide." }, { status: 400 });
  }

  const { data: funds } = await supabase.from("funds").select("*");
  const group = ((funds ?? []) as (Fund & { cash: number })[]).find((f) => f.kind === "group");
  if (!group) return NextResponse.json({ error: "Fonds groupe introuvable." }, { status: 500 });

  const { data: contribData } = await supabase.from("contributions").select("amount");
  const contributed = ((contribData ?? []) as { amount: number }[]).reduce((s, c) => s + Number(c.amount ?? 0), 0);

  // Capital injecté = NAV à t0 (positions + cash de marge) + apports déjà reçus.
  const startCapital = SEED_START_CAPITAL + cash + contributed;
  const { error } = await supabase
    .from("funds")
    .update({ cash, start_capital: startCapital })
    .eq("id", group.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, cash, start_capital: startCapital });
}
