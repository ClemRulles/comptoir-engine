import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isConfigured } from "@/lib/data";

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

  const body = await request.json().catch(() => null);
  const ticker = String(body?.ticker ?? "").trim().toUpperCase();
  const quantity = Number(body?.quantity);
  const avg_cost = Number(body?.avg_cost);
  if (!ticker || !Number.isFinite(quantity) || !Number.isFinite(avg_cost)) {
    return NextResponse.json({ error: "ticker, quantity, avg_cost requis" }, { status: 400 });
  }

  const fund = await groupFund(supabase);
  if (!fund) return NextResponse.json({ error: "group fund missing" }, { status: 404 });

  // position existante (pour ajuster le cash de façon conservatrice)
  const { data: existing } = await supabase
    .from("holdings")
    .select("quantity, avg_cost")
    .eq("fund_id", fund.id)
    .eq("ticker", ticker)
    .maybeSingle();
  const oldValue = existing ? existing.quantity * existing.avg_cost : 0;

  if (quantity <= 0) {
    // vente totale : on retire la position, on recrédite le cash au coût de revient
    await supabase.from("holdings").delete().eq("fund_id", fund.id).eq("ticker", ticker);
    await adjustCash(supabase, fund, oldValue);
    await supabase.from("trades").insert({
      fund_id: fund.id,
      side: "sell",
      ticker,
      quantity: 0,
      price: avg_cost,
      rationale: "Position clôturée via l'interface",
      source: "member",
    });
    return NextResponse.json({ ok: true, removed: true });
  }

  const newValue = quantity * avg_cost;
  const { error } = await supabase
    .from("holdings")
    .upsert(
      { fund_id: fund.id, ticker, quantity, avg_cost, updated_at: new Date().toISOString() },
      { onConflict: "fund_id,ticker" }
    );
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // l'argent investi sort du cash (delta vs ancienne valeur de la ligne)
  await adjustCash(supabase, fund, -(newValue - oldValue));

  await supabase.from("trades").insert({
    fund_id: fund.id,
    side: "buy",
    ticker,
    quantity,
    price: avg_cost,
    rationale: "Position saisie/mise à jour via l'interface",
    source: "member",
  });

  return NextResponse.json({ ok: true });
}
