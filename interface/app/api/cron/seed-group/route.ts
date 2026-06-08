import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { authorizeMaintenance } from "@/lib/cron-auth";
import { fetchPrices } from "@/lib/prices";
import { SEED_BOOK, SEED_START_CAPITAL } from "@/lib/seed-book";
import type { Fund } from "@/lib/types";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Seed du fonds GROUPE dans Supabase à partir des positions réelles (SEED_BOOK).
// Convertit chaque ligne € en parts fractionnaires via le cours live (quantité = valeur / cours),
// pour que la valorisation suive le marché. Ticker sans cours → ancré à sa valeur (quantité=1),
// signalé dans la réponse. Idempotent (upsert). À lancer une fois.
// GET /api/cron/seed-group  (Authorization: Bearer $CRON_SECRET)
export async function GET(request: NextRequest) {
  if (!(await authorizeMaintenance(request))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data: fundsData } = await supabase.from("funds").select("*");
  const group = ((fundsData ?? []) as (Fund & { cash: number })[]).find((f) => f.kind === "group");
  if (!group) {
    return NextResponse.json({ error: "fonds groupe absent (lancer la migration)" }, { status: 500 });
  }

  const prices = await fetchPrices(SEED_BOOK.map((p) => p.ticker));

  const priced: string[] = [];
  const anchored: string[] = [];
  const rows = SEED_BOOK.map((p) => {
    const price = prices[p.ticker.toUpperCase()];
    if (typeof price === "number" && price > 0) {
      const quantity = p.value / price; // parts fractionnaires
      priced.push(p.ticker);
      return {
        fund_id: group.id,
        ticker: p.ticker,
        quantity,
        avg_cost: p.cost / quantity, // coût de revient par action
        updated_at: new Date().toISOString(),
      };
    }
    // pas de cours : ancrage valeur (1 « part » = valeur €, coût = valeur → pnl 0 en attendant)
    anchored.push(p.ticker);
    return {
      fund_id: group.id,
      ticker: p.ticker,
      quantity: 1,
      avg_cost: p.value,
      updated_at: new Date().toISOString(),
    };
  });

  const { error } = await supabase.from("holdings").upsert(rows, { onConflict: "fund_id,ticker" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Aligne le fonds groupe sans toucher au cash existant (4108 € de réserve) :
  // start_capital BASE = NAV des positions t0 + cash de marge. Les apports (table contributions)
  // sont ajoutés au cash ET au start_capital des deux fonds par getAppData (apportsTotal) → on ne
  // les ajoute donc PAS ici (sinon double comptage). (Avant : cash remis à 0, ce qui l'effaçait.)
  const cash = Number(group.cash ?? 0);
  await supabase
    .from("funds")
    .update({ start_capital: SEED_START_CAPITAL + cash, cash })
    .eq("id", group.id);

  // Encoder le book = repartir d'une courbe propre : on efface les snapshots NAV
  // antérieurs (points « placeholder » à 1 000 € d'avant l'encodage). Relancer ensuite
  // « Valoriser le jour » écrit le 1er point réel, et la courbe grandit jour après jour.
  const ai = ((fundsData ?? []) as (Fund & { cash: number })[]).find((f) => f.kind === "ai");
  const fundIds = [group.id, ...(ai ? [ai.id] : [])];
  await supabase.from("nav_snapshots").delete().in("fund_id", fundIds);

  return NextResponse.json({
    ok: true,
    positions: rows.length,
    pricedTickers: priced,
    anchoredTickers: anchored,
    note: anchored.length
      ? `Cours introuvable pour ${anchored.join(", ")} → ancrés à leur valeur (à revoir).`
      : "Toutes les positions valorisées via cours live.",
  });
}
