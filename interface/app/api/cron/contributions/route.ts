import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { authorizeMaintenance } from "@/lib/cron-auth";
import type { Fund, NavSnapshot } from "@/lib/types";
import { contribTs, PER_MEMBER_SCHEDULE, perMemberFor, ymOf } from "@/lib/contrib-rule";

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

  // Depuis le dernier changement de règle (septembre 2026), chaque mois cotisé doit apparaître
  // LE 1er, AU BON MONTANT. L'ancienne version du cron tournait le 5 à 25 € : septembre et
  // octobre 2026 ont été enregistrés « +250 € le 5 ». Deux corrections, idempotentes :
  //  1. recalage : un apport auto/rattrapage daté après le 1er est re-daté au 1er ;
  //  2. complément : s'il manque de l'argent pour le mois, on l'ajoute daté du 1er.
  // Dans les deux cas, les points NAV déjà écrits entre le 1er et l'entrée réelle de l'argent
  // ne le contenaient pas : on leur ajoute le montant (cash et NAV, groupe ET IA), sinon la
  // courbe montrerait un faux creux et la perf compterait l'apport comme une perte puis un gain.
  // Les mois d'avant septembre restent tels qu'ils ont été cotisés.
  const changedFrom = PER_MEMBER_SCHEDULE[PER_MEMBER_SCHEDULE.length - 1].from;
  const fundIds = ((funds ?? []) as Fund[]).filter((f) => f.kind === "group" || f.kind === "ai").map((f) => f.id);

  // Ajoute `amount` aux points NAV des deux fonds datés de [from, to) (to = null : jusqu'à aujourd'hui inclus).
  async function addToSnapshots(from: string, to: string | null, amount: number): Promise<number> {
    let q = supabase.from("nav_snapshots").select("*").in("fund_id", fundIds).gte("date", from);
    if (to) q = q.lt("date", to);
    const { data: snaps, error } = await q;
    if (error) throw new Error(error.message);
    const rows = ((snaps ?? []) as NavSnapshot[]).map((r) => ({
      fund_id: r.fund_id,
      date: r.date,
      cash: Number(r.cash) + amount,
      positions_value: Number(r.positions_value),
      nav: Number(r.nav) + amount,
    }));
    if (rows.length) {
      const { error: upErr } = await supabase.from("nav_snapshots").upsert(rows, { onConflict: "fund_id,date" });
      if (upErr) throw new Error(upErr.message);
    }
    return rows.length;
  }

  const redated: { month: string; amount: number; from: string; snapshots: number }[] = [];
  const fixes: { month: string; recorded: number; expected: number; added: number; snapshots: number }[] = [];
  try {
    const { data: rowsNow } = await supabase.from("contributions").select("id, ts, amount, note");
    const mine = ((rowsNow ?? []) as { id: string; ts: string; amount: number; note: string | null }[])
      .map((r) => ({ ...r, month: /(?:auto|fix)-(\d{4}-\d{2})/.exec(r.note ?? "")?.[1] ?? null }))
      .filter((r): r is typeof r & { month: string } => !!r.month && r.month >= changedFrom);

    // 1. Recalage au 1er.
    for (const r of mine) {
      const first = `${r.month}-01`;
      const day = String(r.ts).slice(0, 10);
      if (day <= first) continue;
      const { error } = await supabase.from("contributions").update({ ts: contribTs(r.month) }).eq("id", r.id);
      if (error) throw new Error(error.message);
      const n = await addToSnapshots(first, day, Number(r.amount));
      redated.push({ month: r.month, amount: Number(r.amount), from: day, snapshots: n });
    }

    // 2. Complément du montant manquant, daté du 1er.
    for (const month of [...new Set(mine.map((r) => r.month))].sort()) {
      const auto = mine.filter((r) => (r.note ?? "").includes(`auto-${month}`));
      const fix = mine.filter((r) => (r.note ?? "").includes(`fix-${month}`));
      if (!auto.length || fix.length) continue;
      // Nombre de membres de CE mois-là, lu dans la note (« (10 × 25 €) »), sinon les actifs.
      const n = Number(/\((\d+)\s*×/.exec(auto[0].note ?? "")?.[1] ?? activeMembers) || activeMembers;
      const expected = n * perMemberFor(month);
      const recorded = auto.reduce((sum, r) => sum + Number(r.amount || 0), 0);
      const diff = Math.round((expected - recorded) * 100) / 100;
      if (diff <= 0) continue;
      const note = `Complément cotisation ${month} (${n} × ${perMemberFor(month)} € attendus, ${recorded} € versés) · fix-${month}`;
      const { error } = await supabase
        .from("contributions")
        .insert({ fund_id: group.id, member_id: null, amount: diff, note, kind: "apport", ts: contribTs(month) });
      if (error) throw new Error(error.message);
      const s = await addToSnapshots(`${month}-01`, null, diff);
      fixes.push({ month, recorded, expected, added: diff, snapshots: s });
    }
  } catch (e) {
    return NextResponse.json({ ...report, redated, fixes, error: (e as Error).message }, { status: 500 });
  }
  report.redated = redated;
  report.fixes = fixes;

  // On ne touche PAS funds.cash : getAppData ajoute le total des apports au cash ET au
  // start_capital des DEUX fonds (groupe + IA) → armes égales, apport ≠ rendement.
  return NextResponse.json(report);
}
