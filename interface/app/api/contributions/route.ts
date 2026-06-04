import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isConfigured } from "@/lib/data";
import type { Fund } from "@/lib/types";

export async function GET() {
  if (!isConfigured()) return NextResponse.json({ contributions: [] });
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("contributions")
    .select("*")
    .order("ts", { ascending: false })
    .limit(100);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ contributions: data });
}

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
  const amount = Number(body?.amount);
  const member_id = body?.member_id ? String(body.member_id) : null;
  const note = String(body?.note ?? "").trim() || "Apport";
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "Montant invalide." }, { status: 400 });
  }

  // L'apport va dans le pot commun (fonds du groupe) → +cash.
  const { data: funds } = await supabase.from("funds").select("*");
  const group = ((funds ?? []) as (Fund & { cash: number })[]).find((f) => f.kind === "group");
  if (!group) {
    return NextResponse.json({ error: "Fonds groupe introuvable (lancer la migration)." }, { status: 500 });
  }

  const { error: insErr } = await supabase
    .from("contributions")
    .insert({ fund_id: group.id, member_id, amount, note, kind: "apport" });
  if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });

  const newCash = Number(group.cash ?? group.start_capital ?? 0) + amount;
  const { error: updErr } = await supabase.from("funds").update({ cash: newCash }).eq("id", group.id);
  if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });

  return NextResponse.json({ ok: true, cash: newCash });
}
