import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isConfigured } from "@/lib/data";
import { fetchPrices } from "@/lib/prices";

async function groupFund(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data } = await supabase
    .from("funds")
    .select("id, cash, start_capital")
    .eq("kind", "group")
    .single();
  return data as { id: string; cash: number; start_capital: number } | null;
}

async function adjustCash(
  supabase: Awaited<ReturnType<typeof createClient>>,
  fund: { id: string; cash: number; start_capital: number },
  delta: number
) {
  const current = fund.cash ?? fund.start_capital ?? 0;
  await supabase.from("funds").update({ cash: current + delta }).eq("id", fund.id);
}

export async function GET() {
  if (!isConfigured()) return NextResponse.json({ holdings: [], demo: true });
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const fund = await groupFund(supabase);
  if (!fund) return NextResponse.json({ error: "group fund missing" }, { status: 404 });

  const { data, error } = await supabase
    .from("holdings")
    .select("*")
    .eq("fund_id", fund.id)
    .order("ticker");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ holdings: data });
}

export async function POST(request: NextRequest) {
  if (!isConfigured()) {
    return NextResponse.json(
      { error: "Mode démo : connecte Supabase (déploiement) pour enregistrer." },
      { status: 503 }
    );
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  // Modèle SIMPLE en EUROS :
  //  - INVESTIR / RENFORCER : { ticker, amount }  → amount € s'AJOUTENT à la position ;
  //    le cash baisse de `amount`, la valeur des positions monte de `amount` → la NAV ne bouge pas.
  //  - VENDRE (clôture)      : { ticker, sell:true } → on retire la ligne et on recrédite le cash
  //    à sa VALEUR DE MARCHÉ (cours live), pas au coût.
  const body = await request.json().catch(() => null);
  const ticker = String(body?.ticker ?? "").trim().toUpperCase();
  const sell = body?.sell === true;
  const amount = Number(body?.amount);
  if (!ticker) return NextResponse.json({ error: "ticker requis" }, { status: 400 });

  const fund = await groupFund(supabase);
  if (!fund) return NextResponse.json({ error: "group fund missing" }, { status: 404 });

  // Position existante (parts + PRU pondéré).
  const { data: existing } = await supabase
    .from("holdings")
    .select("quantity, avg_cost")
    .eq("fund_id", fund.id)
    .eq("ticker", ticker)
    .maybeSingle();
  const oldQty = existing ? Number(existing.quantity) || 0 : 0;
  const oldAvg = existing ? Number(existing.avg_cost) || 0 : 0;

  // Cours live (EUR) — sert à convertir un montant € en parts (et à valoriser une vente).
  const prices = await fetchPrices([ticker]);
  const price = prices[ticker];

  // ── VENTE (clôture totale) ──────────────────────────────────────────
  if (sell) {
    if (!existing) return NextResponse.json({ error: "position introuvable" }, { status: 400 });
    const back = typeof price === "number" && price > 0 ? oldQty * price : oldQty * oldAvg;
    await supabase.from("holdings").delete().eq("fund_id", fund.id).eq("ticker", ticker);
    await adjustCash(supabase, fund, back); // on récupère la valeur de marché en cash
    await supabase.from("trades").insert({
      fund_id: fund.id,
      side: "sell",
      ticker,
      quantity: oldQty,
      price: typeof price === "number" ? price : oldAvg,
      rationale: "Vente totale via l'interface",
      source: "member",
    });
    return NextResponse.json({ ok: true, removed: true, creditedCash: Math.round(back) });
  }

  // ── INVESTIR / RENFORCER (montant en euros) ─────────────────────────
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "Indique un montant en euros (> 0) à investir." }, { status: 400 });
  }
  if (!(typeof price === "number" && price > 0)) {
    return NextResponse.json(
      { error: `Cours indisponible pour ${ticker} pour l'instant — réessaie dans un moment.` },
      { status: 502 }
    );
  }

  const addedQty = amount / price; // parts achetées maintenant au cours live
  const newQty = oldQty + addedQty;
  const newCost = oldQty * oldAvg + amount; // coût total cumulé
  const newAvg = newCost / newQty; // PRU pondéré

  const { error } = await supabase
    .from("holdings")
    .upsert(
      { fund_id: fund.id, ticker, quantity: newQty, avg_cost: newAvg, updated_at: new Date().toISOString() },
      { onConflict: "fund_id,ticker" }
    );
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await adjustCash(supabase, fund, -amount); // l'argent investi sort du cash

  await supabase.from("trades").insert({
    fund_id: fund.id,
    side: "buy",
    ticker,
    quantity: addedQty,
    price,
    rationale: `Investissement de ${Math.round(amount)} € via l'interface`,
    source: "member",
  });

  return NextResponse.json({ ok: true, invested: Math.round(amount), price, reinforced: oldQty > 0 });
}
