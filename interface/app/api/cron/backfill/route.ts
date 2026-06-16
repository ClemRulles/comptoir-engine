import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { authorizeMaintenance } from "@/lib/cron-auth";
import { fetchAiFund } from "@/lib/github";
import type { Fund } from "@/lib/types";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// POINT DE BASE — pose l'ORIGINE de la courbe : un unique snapshot à plat au capital de
// départ, daté à l'inception du fonds. PAS de backcast : on ne reconstitue plus le passé en
// projetant le panier actuel sur des cours anciens (ça repeignait l'historique à chaque trade
// et inventait une perf jamais réalisée). La courbe = ce point d'origine + les vrais relevés
// quotidiens de `value`. Elle reste donc plate jusqu'au 1er marché, puis n'évolue qu'avec les
// achats/ventes/apports réels. Idempotent (upsert sur fund_id,date), n'écrase aucun vrai relevé
// (ils sont datés à leur jour, distinct de l'inception).
export async function GET(request: NextRequest) {
  if (!(await authorizeMaintenance(request))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data: fundsData } = await supabase.from("funds").select("*");
  const funds = (fundsData ?? []) as (Fund & { cash: number })[];
  const group = funds.find((f) => f.kind === "group");
  const ai = funds.find((f) => f.kind === "ai");
  if (!group || !ai) {
    return NextResponse.json({ error: "funds non initialisés" }, { status: 500 });
  }

  // Le book IA fait foi pour son capital/cash de départ (ai-fund.json), comme dans getAppData.
  const aiFund = await fetchAiFund();
  const aiStart = aiFund?.start_capital ?? ai.start_capital ?? 0;
  const aiCash = aiFund?.cash ?? ai.cash ?? ai.start_capital ?? 0;

  // NAV d'origine = capital de départ (cash de base + positions à t0), AVANT tout apport :
  // les apports arrivent plus tard et apparaissent comme des marches + marqueurs « apport »,
  // pas comme une origine gonflée. Donc on n'ajoute PAS apportsTotal ici.
  const baseline = (f: { id: string; inception_date: string }, startCapital: number, cash: number) => ({
    fund_id: f.id,
    date: f.inception_date,
    cash,
    positions_value: Math.max(0, startCapital - cash),
    nav: startCapital,
  });

  const rows = [
    baseline(group, group.start_capital ?? 0, group.cash ?? group.start_capital ?? 0),
    baseline(ai, aiStart, aiCash),
  ];

  const { error } = await supabase
    .from("nav_snapshots")
    .upsert(rows, { onConflict: "fund_id,date" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    ok: true,
    note: "Point de base posé à l'inception (capital de départ). Pas de backcast : la courbe est le track record réel.",
    baseline: rows.map((r) => ({ fund_id: r.fund_id, date: r.date, nav: r.nav })),
  });
}
