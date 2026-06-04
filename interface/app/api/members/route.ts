import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isConfigured } from "@/lib/data";

export async function GET() {
  if (!isConfigured()) return NextResponse.json({ members: [] });
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("club_members")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ members: data });
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
  const name = String(body?.name ?? "").trim();
  const monthly = Number(body?.monthly_amount);
  if (!name) return NextResponse.json({ error: "Nom requis." }, { status: 400 });

  const { data, error } = await supabase
    .from("club_members")
    .insert({ name, monthly_amount: Number.isFinite(monthly) && monthly >= 0 ? monthly : 25 })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, member: data });
}

// Activer/désactiver un membre (sort du pot → ne compte plus dans le mensuel).
export async function PATCH(request: NextRequest) {
  if (!isConfigured()) {
    return NextResponse.json({ error: "Mode démo : indisponible." }, { status: 503 });
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const id = String(body?.id ?? "");
  if (!id) return NextResponse.json({ error: "id requis." }, { status: 400 });
  const patch: Record<string, unknown> = {};
  if (typeof body?.active === "boolean") patch.active = body.active;
  if (Number.isFinite(Number(body?.monthly_amount))) patch.monthly_amount = Number(body.monthly_amount);
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "rien à modifier." }, { status: 400 });
  }

  const { error } = await supabase.from("club_members").update(patch).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
