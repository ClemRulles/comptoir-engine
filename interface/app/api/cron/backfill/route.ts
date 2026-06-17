import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { authorizeMaintenance } from "@/lib/cron-auth";
import { fetchHistoricalCloses } from "@/lib/prices";
import { SEED_BOOK, SEED_BASE_CASH } from "@/lib/seed-book";
import type { Fund } from "@/lib/types";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// HISTORIQUE FIGÉ SUR LE CLONE D'ORIGINE — reconstruit le passé AVANT l'inception à partir du
// panier d'origine (SEED_BOOK, le clone du 04/06, CONSTANT), identique pour les DEUX fonds.
// Conséquences voulues :
//   • l'IA et le groupe partagent exactement le même passé → « l'IA suit le groupe »,
//   • ils ne divergent qu'à partir de l'inception, via les VRAIS relevés `value` (les derniers
//     changements : achats/ventes/apports réels),
//   • on n'utilise PAS les positions ACTUELLES (origine figée) → ça ne se redéforme jamais quand
//     l'IA trade, contrairement à l'ancien backcast du panier du moment.
// On n'écrit QUE les dates < inception_date (le réel prime au-delà). Idempotent (upsert
// fund_id,date) — n'écrase aucun vrai relevé (eux sont datés ≥ inception). C'est une
// reconstruction (estimation du passé), pas un relevé réel. Param ?days=180 (30..365).
export async function GET(request: NextRequest) {
  if (!(await authorizeMaintenance(request))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const days = Math.min(365, Math.max(30, Number(new URL(request.url).searchParams.get("days") ?? 180)));
  const from = new Date();
  from.setDate(from.getDate() - days);
  const fromStr = from.toISOString().slice(0, 10);

  const supabase = createAdminClient();
  const { data: fundsData } = await supabase.from("funds").select("*");
  const funds = (fundsData ?? []) as (Fund & { cash: number })[];
  const group = funds.find((f) => f.kind === "group");
  const ai = funds.find((f) => f.kind === "ai");
  if (!group || !ai) {
    return NextResponse.json({ error: "funds non initialisés" }, { status: 500 });
  }

  // Pré-historique = dates strictement avant l'inception (la plus tardive des deux sert de borne
  // au pool ; chaque fonds est ensuite filtré sur SA propre inception).
  const incs = [group.inception_date, ai.inception_date].sort();
  const latestInception = incs[incs.length - 1];

  // Panier d'origine figé (le clone du 04/06). Mêmes tickers/valeurs pour les 2 fonds.
  const tickers = SEED_BOOK.map((p) => p.ticker);
  const hist = await fetchHistoricalCloses(tickers, fromStr);
  const covered = Object.keys(hist);
  if (covered.length === 0) {
    return NextResponse.json({ error: "pas de données historiques pour le panier d'origine" }, { status: 502 });
  }

  const dateSet = new Set<string>();
  for (const t of covered) for (const d of Object.keys(hist[t])) if (d < latestInception) dateSet.add(d);
  const preDates = Array.from(dateSet).sort();
  if (preDates.length === 0) {
    return NextResponse.json({
      ok: true,
      note: "Aucune date avant l'inception — fonds trop récent, rien à reconstituer.",
      inception: latestInception,
    });
  }

  // Clôtures forward-fill par date (dernière connue ≤ date), pour chaque date du pré-historique.
  const last: Record<string, number> = {};
  const ffByDate: Record<string, Record<string, number>> = {};
  for (const date of preDates) {
    for (const p of SEED_BOOK) {
      const c = hist[p.ticker.toUpperCase()]?.[date];
      if (typeof c === "number") last[p.ticker.toUpperCase()] = c;
    }
    ffByDate[date] = { ...last };
  }

  // Parts ancrées sur la DERNIÈRE clôture avant l'inception : ainsi, à ce point de raccord, chaque
  // ligne vaut sa valeur d'origine (SEED_BOOK.value) → la NAV rejoint le capital de départ
  // (cash + Σ value ≈ start_capital), sans marche entre le backcast et le réel.
  const anchorCloses = ffByDate[preDates[preDates.length - 1]] ?? {};
  const shares: Record<string, number | null> = {};
  for (const p of SEED_BOOK) {
    const ac = anchorCloses[p.ticker.toUpperCase()];
    shares[p.ticker.toUpperCase()] = typeof ac === "number" && ac > 0 ? p.value / ac : null;
  }

  // NAV(date) = cash de base + Σ (parts × clôture ff ≤ date) ; ligne sans historique → à plat à
  // sa valeur d'origine. Courbe IDENTIQUE pour les deux fonds (même SEED_BOOK).
  const navByDate: Record<string, number> = {};
  for (const date of preDates) {
    let pos = 0;
    for (const p of SEED_BOOK) {
      const T = p.ticker.toUpperCase();
      const c = ffByDate[date][T];
      const sh = shares[T];
      pos += sh != null && typeof c === "number" ? c * sh : p.value;
    }
    navByDate[date] = SEED_BASE_CASH + pos;
  }

  const rowsFor = (fundId: string, fundInception: string) =>
    preDates
      .filter((d) => d < fundInception)
      .map((d) => ({
        fund_id: fundId,
        date: d,
        cash: SEED_BASE_CASH,
        positions_value: navByDate[d] - SEED_BASE_CASH,
        nav: navByDate[d],
      }));

  const payload = [...rowsFor(group.id, group.inception_date), ...rowsFor(ai.id, ai.inception_date)];

  // Purge le pré-historique AVANT de réécrire. Un simple upsert ne remplace que les dates
  // qu'on régénère : d'anciens snapshots d'un backcast précédent, datés sur des jours absents
  // du nouveau jeu (jours de bourse différents, couverture différente), survivraient et
  // créeraient de faux « pics » en V. On efface donc TOUT le pré-inception par fonds, puis on
  // réécrit la reconstruction propre. Les vrais relevés (≥ inception) ne sont jamais touchés.
  await supabase.from("nav_snapshots").delete().eq("fund_id", group.id).lt("date", group.inception_date);
  await supabase.from("nav_snapshots").delete().eq("fund_id", ai.id).lt("date", ai.inception_date);

  let written = 0;
  for (let i = 0; i < payload.length; i += 500) {
    const chunk = payload.slice(i, i + 500);
    const { error } = await supabase.from("nav_snapshots").upsert(chunk, { onConflict: "fund_id,date" });
    if (error) return NextResponse.json({ error: error.message, written }, { status: 500 });
    written += chunk.length;
  }

  return NextResponse.json({
    ok: true,
    note: "Historique figé sur le clone d'origine (SEED_BOOK) — IA = groupe avant l'inception, divergence réelle ensuite. Reconstruction, pas un relevé réel.",
    inception: latestInception,
    coveredTickers: covered,
    flatTickers: tickers.filter((t) => shares[t.toUpperCase()] == null), // sans histo → maintenus à plat
    datesReconstituted: preDates.length,
    written,
  });
}
