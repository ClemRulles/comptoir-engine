import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { authorizeMaintenance } from "@/lib/cron-auth";
import { isSeedPosition } from "@/lib/data";
import { fetchAiFund } from "@/lib/github";
import { fetchPrices } from "@/lib/prices";
import type { Fund, Holding } from "@/lib/types";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Valorise les 2 fonds et écrit un snapshot NAV daté. Déclenché par le Vercel Cron.
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
    return NextResponse.json({ error: "funds non initialisés (lancer la migration)" }, { status: 500 });
  }

  const { data: ghData } = await supabase.from("holdings").select("*").eq("fund_id", group.id);
  const groupHoldings = (ghData ?? []) as Holding[];
  const aiFund = await fetchAiFund();
  const aiPositions = aiFund?.positions ?? [];

  // Apports membres reflétés dans le book IA (mêmes apports que le groupe).
  const { data: contribData } = await supabase.from("contributions").select("amount");
  const apportsTotal = ((contribData ?? []) as { amount: number }[]).reduce(
    (s, c) => s + Number(c.amount ?? 0),
    0
  );
  const aiCash = (aiFund?.cash ?? ai.cash ?? ai.start_capital) + apportsTotal;

  const tickers = [
    ...groupHoldings.map((h) => h.ticker),
    ...aiPositions.map((p) => p.ticker),
  ];
  const prices = await fetchPrices(tickers);

  // Valorise avec REPLI : si le cours manque (source throttlée), on retombe sur la valeur
  // de repli (coût de revient pour le groupe ; value_t0/coût pour l'IA) au lieu de 0 — la
  // NAV reste juste même si Stooq/FMP ne renvoient qu'une partie des cours.
  const valueWithFallback = (items: { ticker: string; quantity: number; fallback: number }[]) =>
    items.reduce((s, h) => {
      const p = prices[h.ticker.toUpperCase()];
      return s + (typeof p === "number" && p > 0 ? p * h.quantity : h.fallback);
    }, 0);

  const groupItems = groupHoldings.map((h) => ({
    ticker: h.ticker,
    quantity: h.quantity,
    fallback: h.avg_cost * h.quantity,
  }));
  const aiItems = aiPositions.map((p) => {
    const price = prices[p.ticker.toUpperCase()];
    // Même définition de « ligne seed » que getAppData (flag explicite > heuristique).
    const seed = isSeedPosition(p) && typeof p.value_t0 === "number" && p.value_t0 > 0;
    const quantity = seed && typeof price === "number" && price > 0 ? p.value_t0! / price : p.quantity;
    const fallback = typeof p.value_t0 === "number" ? p.value_t0 : p.avg_cost * p.quantity;
    return { ticker: p.ticker, quantity, fallback };
  });

  const groupPosVal = valueWithFallback(groupItems);
  const aiPosVal = valueWithFallback(aiItems);
  // Symétrie : les apports s'ajoutent au cash des DEUX fonds (comme l'IA ci-dessus et comme
  // getAppData). Sinon le snapshot du groupe ignorerait les apports → courbe désynchronisée.
  const groupCash = (group.cash ?? group.start_capital ?? 0) + apportsTotal;
  const groupNav = groupCash + groupPosVal;
  const aiNav = aiCash + aiPosVal;

  const date = new Date().toISOString().slice(0, 10);
  const rows = [
    { fund_id: group.id, date, cash: groupCash, positions_value: groupPosVal, nav: groupNav },
    { fund_id: ai.id, date, cash: aiCash, positions_value: aiPosVal, nav: aiNav },
  ];

  const { error } = await supabase
    .from("nav_snapshots")
    .upsert(rows, { onConflict: "fund_id,date" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // garde le cash du fonds IA aligné sur le book du repo
  if (aiFund) await supabase.from("funds").update({ cash: aiCash }).eq("id", ai.id);

  return NextResponse.json({
    ok: true,
    date,
    pricedTickers: Object.keys(prices).length,
    group: { nav: groupNav, positions_value: groupPosVal, cash: groupCash },
    ai: { nav: aiNav, positions_value: aiPosVal, cash: aiCash },
  });
}
