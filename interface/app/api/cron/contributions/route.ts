import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { authorizeMaintenance } from "@/lib/cron-auth";
import type { Fund } from "@/lib/types";
import { PER_MEMBER_SCHEDULE, perMemberFor, ymOf } from "@/lib/contrib-rule";

export const dynamic = "force-dynamic";

// Apport mensuel collectif — déclenché par le Vercel Cron le 1er de chaque mois (0 6 1 * *).
// Chaque membre actif cotise le montant de la règle datée (lib/contrib-rule.ts : 25 € jusqu'en
// août 2026, 30 € depuis septembre). On insère UN apport collectif = (membres actifs × montant)
// dans le pot du groupe → +cash. Le book IA reçoit la même somme automatiquement
// (getAppData ajoute apportsTotal au cash + start_capital de l'IA) : armes égales.
//
// Idempotent : une étiquette « auto-YYYY-MM » dans la note empêche un double apport le même
// mois (si le cron rejoue ou si on déclenche la route à la main).
//
// Rattrapage : un mois déjà cotisé AUTOMATIQUEMENT sous l'ancien montant (ex. septembre passé
// à 25 € alors que la règle dit 30 €) reçoit UNE fois la différence, datée d'aujourd'hui
// (étiquette « fix-YYYY-MM »). On ne réécrit jamais l'historique : la différence entre dans le
// cash le jour où elle est enregistrée, donc elle ne compte pas comme du rendement. Les apports
// saisis à la main (sans étiquette) ne sont jamais touchés.
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

  const { count: activeCount } = await supabase
    .from("club_members")
    .select("id", { count: "exact", head: true })
    .eq("active", true);
  const activeMembers = activeCount ?? 0;

  const ym = ymOf(new Date());
  const perMember = perMemberFor(ym);
  const amount = activeMembers * perMember;
  const tag = `auto-${ym}`;

  // Apports automatiques déjà enregistrés (+ rattrapages), pour l'idempotence et le rattrapage.
  // (Table petite : un apport par mois + quelques saisies à la main → on filtre en mémoire.)
  const { data: allRows } = await supabase.from("contributions").select("amount, note");
  const rows = ((allRows ?? []) as { amount: number; note: string | null }[]).filter((r) => /(auto|fix)-\d{4}-\d{2}/.test(r.note ?? ""));
  const tagged = (prefix: string, month: string) => rows.filter((r) => (r.note ?? "").includes(`${prefix}-${month}`));

  const report: Record<string, unknown> = { ok: true, tag, activeMembers, perMember };

  if (amount <= 0) {
    report.skipped = "aucun membre actif";
  } else if (tagged("auto", ym).length > 0) {
    report.skipped = "déjà cotisé ce mois";
  } else {
    const note = `Apport mensuel automatique (${activeMembers} × ${perMember} €) · ${tag}`;
    const { error: insErr } = await supabase
      .from("contributions")
      .insert({ fund_id: group.id, member_id: null, amount, note, kind: "apport" }); // daté de maintenant : le cron tourne le 1er
    if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });
    report.amount = amount;
  }

  // Rattrapage des mois cotisés automatiquement sous l'ancien montant.
  const fixes: { month: string; recorded: number; expected: number; added: number }[] = [];
  const months = new Set(rows.map((r) => /auto-(\d{4}-\d{2})/.exec(r.note ?? "")?.[1]).filter(Boolean) as string[]);
  // Seulement depuis le dernier changement de règle (septembre 2026) : les mois d'avant restent
  // tels qu'ils ont été cotisés.
  const changedFrom = PER_MEMBER_SCHEDULE[PER_MEMBER_SCHEDULE.length - 1].from;
  for (const month of [...months].filter((m) => m >= changedFrom).sort()) {
    const auto = tagged("auto", month);
    // Nombre de membres de CE mois-là, lu dans la note (« (10 × 25 €) »), sinon les actifs.
    const n = Number(/\((\d+)\s*×/.exec(auto[0]?.note ?? "")?.[1] ?? activeMembers) || activeMembers;
    const expected = n * perMemberFor(month);
    const recorded = [...auto, ...tagged("fix", month)].reduce((sum, r) => sum + Number(r.amount || 0), 0);
    const diff = Math.round((expected - recorded) * 100) / 100;
    if (diff > 0 && tagged("fix", month).length === 0) {
      const note = `Rattrapage cotisation ${month} (${n} × ${perMemberFor(month)} € attendus, ${recorded} € versés) · fix-${month}`;
      const { error } = await supabase
        .from("contributions")
        .insert({ fund_id: group.id, member_id: null, amount: diff, note, kind: "apport" });
      if (error) return NextResponse.json({ error: error.message, fixes }, { status: 500 });
      fixes.push({ month, recorded, expected, added: diff });
    }
  }
  report.fixes = fixes;

  // On ne touche PAS funds.cash : getAppData ajoute le total des apports au cash ET au
  // start_capital des DEUX fonds (groupe + IA) → armes égales, apport ≠ rendement.
  return NextResponse.json(report);
}
