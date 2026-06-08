import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { authorizeMaintenance } from "@/lib/cron-auth";
import { fetchPrices } from "@/lib/prices";
import {
  SEED_BOOK,
  SEED_START_CAPITAL,
  SEED_BASE_CASH,
  SEED_MEMBERS,
  SEED_PER_MEMBER,
} from "@/lib/seed-book";
import type { Fund } from "@/lib/types";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// BOOTSTRAP du fonds GROUPE — un seul appel remet tout d'aplomb (idempotent) :
//   1) cash de base forcé à SEED_BASE_CASH (4108 €) + start_capital aligné ;
//   2) 10 membres du club + réglage 25 €/mois (si absents) — plus besoin de la migration SQL ;
//   3) positions réelles (SEED_BOOK, valeurs Trade Republic) converties en parts fractionnaires
//      via le cours live (quantité = valeur / cours) → l'affichage = valeur au seed puis suit le
//      marché ; ticker sans cours → ancré à sa valeur (signalé dans la réponse) ;
//   4) snapshots NAV effacés (on repart d'une courbe propre → relancer backfill puis value).
// GET /api/cron/seed-group  (Authorization: Bearer $CRON_SECRET ou session connectée)
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

  // ── 1) Cash de base + start_capital. SEED_BASE_CASH est la source de vérité (le book IA
  // est aligné dans ai-fund.json). On FORCE le cash : c'est ce qui réparait l'écart où le
  // groupe restait coincé à ~700 € faute d'avoir lancé la migration SQL. Les apports (table
  // contributions) sont ajoutés EN PLUS par getAppData/value/backfill aux DEUX fonds → on ne
  // les ajoute pas ici (sinon double comptage).
  await supabase
    .from("funds")
    .update({ start_capital: SEED_START_CAPITAL + SEED_BASE_CASH, cash: SEED_BASE_CASH })
    .eq("id", group.id);

  // ── 2) Club : réglage du montant mensuel + roster de 10 membres si vide (idempotent).
  await supabase
    .from("settings")
    .upsert({ key: "monthly_per_member", value: String(SEED_PER_MEMBER) }, { onConflict: "key" });
  const { count: memberCount } = await supabase
    .from("club_members")
    .select("id", { count: "exact", head: true });
  let membersCreated = 0;
  if ((memberCount ?? 0) === 0) {
    const newMembers = Array.from({ length: SEED_MEMBERS }, (_, i) => ({
      name: `Membre ${i + 1}`,
      monthly_amount: SEED_PER_MEMBER,
      active: true,
    }));
    const { error: memErr } = await supabase.from("club_members").insert(newMembers);
    if (!memErr) membersCreated = newMembers.length;
  }

  // ── 3) Positions réelles → parts fractionnaires via cours live.
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

  // ── 4) Repartir d'une courbe propre : on efface les snapshots NAV antérieurs. Relancer
  // ensuite « Courbes du passé » (backfill) puis « Valoriser le jour » (value) reconstruit
  // l'historique et écrit le 1er point réel.
  const ai = ((fundsData ?? []) as (Fund & { cash: number })[]).find((f) => f.kind === "ai");
  const fundIds = [group.id, ...(ai ? [ai.id] : [])];
  await supabase.from("nav_snapshots").delete().in("fund_id", fundIds);

  return NextResponse.json({
    ok: true,
    cash: SEED_BASE_CASH,
    startCapital: SEED_START_CAPITAL + SEED_BASE_CASH,
    membersCreated,
    positions: rows.length,
    pricedTickers: priced,
    anchoredTickers: anchored,
    next: "Lancer ?days=180 sur /api/cron/backfill puis /api/cron/value.",
    note: anchored.length
      ? `Cours introuvable pour ${anchored.join(", ")} → ancrés à leur valeur (à revoir).`
      : "Toutes les positions valorisées via cours live.",
  });
}
