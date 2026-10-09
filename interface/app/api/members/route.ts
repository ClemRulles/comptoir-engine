import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isConfigured } from "@/lib/data";
import { perMemberFor, ymOf } from "@/lib/contrib-rule";
import type { Fund } from "@/lib/types";

type Sb = Awaited<ReturnType<typeof createClient>>;

// Un membre qui arrive (ou revient) APRÈS la cotisation automatique du mois verse sa part tout
// de suite : sinon il n'apparaîtrait qu'au 1er du mois suivant. Apport daté de son arrivée →
// visible sur la courbe ce jour-là. Étiquette « join-AAAA-MM-<id> » : une seule fois par mois.
async function joinContribution(supabase: Sb, member: { id: string; name: string }): Promise<number> {
  const ym = ymOf(new Date());
  const { data: monthRows } = await supabase.from("contributions").select("note").ilike("note", `%-${ym}%`);
  const notes = ((monthRows ?? []) as { note: string | null }[]).map((r) => r.note ?? "");
  if (!notes.some((n) => n.includes(`auto-${ym}`))) return 0; // le cron du 1er le comptera
  if (notes.some((n) => n.includes(`join-${ym}-${member.id}`))) return 0;
  const { data: funds } = await supabase.from("funds").select("*");
  const group = ((funds ?? []) as Fund[]).find((f) => f.kind === "group");
  if (!group) return 0;
  const amount = perMemberFor(ym);
  const { error } = await supabase.from("contributions").insert({
    fund_id: group.id,
    member_id: member.id,
    amount,
    note: `Cotisation de ${member.name}, arrivée en cours de mois · join-${ym}-${member.id}`,
    kind: "apport",
  });
  return error ? 0 : amount;
}

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
    .insert({ name, monthly_amount: Number.isFinite(monthly) && monthly > 0 ? monthly : perMemberFor(ymOf(new Date())) })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const joined = await joinContribution(supabase, { id: data.id, name });
  return NextResponse.json({ ok: true, member: data, joined });
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

  const { data: member, error } = await supabase.from("club_members").update(patch).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  // Retour d'un membre en cours de mois : il cotise aussi pour ce mois-ci.
  const joined = patch.active === true && member ? await joinContribution(supabase, { id: member.id, name: member.name }) : 0;
  return NextResponse.json({ ok: true, joined });
}
