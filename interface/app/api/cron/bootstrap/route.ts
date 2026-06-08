import { NextResponse, type NextRequest } from "next/server";
import { authorizeMaintenance } from "@/lib/cron-auth";
import { GET as seedGroup } from "../seed-group/route";
import { GET as backfill } from "../backfill/route";
import { GET as value } from "../value/route";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// BOOTSTRAP UN CLIC — enchaîne, dans le bon ordre, les 3 étapes qui remettent tout d'aplomb :
//   1) seed-group : cash 4108 € + 10 membres + positions TR (et efface l'ancienne courbe) ;
//   2) backfill   : reconstruit l'historique de la courbe (panier actuel, ~180 j) ;
//   3) value      : écrit le point du jour.
// Évite l'erreur d'ordre (lancer seed seul efface la courbe sans la reconstruire). Idempotent.
// GET /api/cron/bootstrap[?days=180]  (session connectée ou Bearer $CRON_SECRET)
export async function GET(request: NextRequest) {
  if (!(await authorizeMaintenance(request))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const steps: Record<string, unknown> = {};
  const run = async (name: string, fn: (r: NextRequest) => Promise<Response>) => {
    const res = await fn(request);
    const body = await res.json().catch(() => ({ error: "réponse illisible" }));
    steps[name] = { status: res.status, ...body };
    return res.ok;
  };

  // 1) Seed (cash + membres + positions + purge courbe). On s'arrête si ça échoue : inutile
  // de reconstruire une courbe sur des positions absentes.
  if (!(await run("seedGroup", seedGroup))) {
    return NextResponse.json({ ok: false, failedAt: "seedGroup", steps }, { status: 500 });
  }
  // 2) Historique de la courbe (best-effort : si l'historique manque, on garde quand même le
  // point du jour ci-dessous).
  await run("backfill", backfill);
  // 3) Point du jour.
  const valueOk = await run("value", value);

  return NextResponse.json({
    ok: valueOk,
    note: "Bootstrap terminé : cash 4108 €, 10 membres, positions TR, courbe reconstruite + point du jour.",
    steps,
  });
}
