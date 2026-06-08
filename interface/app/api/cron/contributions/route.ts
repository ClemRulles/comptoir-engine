import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { authorizeMaintenance } from "@/lib/cron-auth";
import type { Fund } from "@/lib/types";

export const dynamic = "force-dynamic";

// Apport mensuel collectif — déclenché par le Vercel Cron le 5 de chaque mois (0 6 5 * *).
// Le 5, chaque membre actif cotise `monthly_per_member` € (25 € par défaut). On insère UN
// apport collectif = (membres actifs × montant) dans le pot du groupe → +cash. Le book IA
// reçoit la même somme automatiquement (getAppData ajoute apportsTotal au cash + start_capital
// de l'IA), donc les deux fonds restent à armes égales.
//
// Idempotent : une étiquette « auto-YYYY-MM » dans la note empêche un double apport le même
// mois (si le cron rejoue ou si on déclenche la route à la main).
export async function GET(request: NextRequest) {
  if (!(await authorizeMaintenance(request))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

  const { data: funds } = await supabase.from("funds").select("*");
  const group = ((funds ?? []) as (Fund & { cash: number })[]).find((f) => f.kind === "group");
  if (!group) {
    return NextResponse.json({ error: "Fonds groupe introuvable (lancer la migration)." }, { status: 500 });
  }

  // Montant par membre (réglage modifiable) + nombre de membres actifs.
  const { data: setting } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "monthly_per_member")
    .maybeSingle();
  const perMember = Number(setting?.value ?? 25) || 25;

  const { count: activeCount } = await supabase
    .from("club_members")
    .select("id", { count: "exact", head: true })
    .eq("active", true);
  const activeMembers = activeCount ?? 0;
  const amount = activeMembers * perMember;

  // Étiquette du mois courant pour l'idempotence (ex. "auto-2026-07").
  const now = new Date();
  const tag = `auto-${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;

  if (amount <= 0) {
    return NextResponse.json({ ok: true, skipped: "aucun membre actif", tag, activeMembers });
  }

  // Déjà passé ce mois-ci ? on ne refait rien.
  const { data: existing } = await supabase
    .from("contributions")
    .select("id")
    .ilike("note", `%${tag}%`)
    .limit(1);
  if (existing && existing.length > 0) {
    return NextResponse.json({ ok: true, skipped: "déjà cotisé ce mois", tag });
  }

  const note = `Apport mensuel automatique (${activeMembers} × ${perMember} €) · ${tag}`;
  const { error: insErr } = await supabase
    .from("contributions")
    .insert({ fund_id: group.id, member_id: null, amount, note, kind: "apport" });
  if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });

  // On ne touche PAS funds.cash : getAppData ajoute le total des apports au cash ET au
  // start_capital des DEUX fonds (groupe + IA) → armes égales, apport ≠ rendement.
  return NextResponse.json({ ok: true, amount, activeMembers, perMember, tag });
}
