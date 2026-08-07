import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { authorizeMaintenance } from "@/lib/cron-auth";
import { fetchHistoricalCloses } from "@/lib/prices";
import { fetchAiFund } from "@/lib/github";
import { isSeedPosition } from "@/lib/data";
import type { Fund } from "@/lib/types";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// COMBLE LE TROU IA D'UNE PANNE DE LECTURE — quand le book est resté illisible plusieurs
// semaines (token GitHub expiré, incident du 2026-07-09), le cron value a valorisé le groupe
// chaque soir mais a sauté le snapshot IA (garde-fou de #71). Résultat : un trou de plusieurs
// semaines dans la courbe IA, que le graphe relie en une longue ligne droite (connectNulls).
//
// Cette reconstruction est LÉGITIME (pas un backcast biaisé) : pendant la panne, la
// persistance des routines était morte elle aussi → le book n'a PAS bougé. Le book actuel
// est donc exactement celui détenu pendant tout le trou : NAV(d) = cash(d) + Σ parts × clôture(d).
// On ne remplit QUE les dates où le groupe a un vrai relevé et où l'IA n'en a pas
// (jamais d'écrasement d'un vrai snapshot IA), et on s'arrête à hier (le point du jour
// appartient au cron value). Idempotent, rejouable.
//
// Usage (connecté, ou Bearer CRON_SECRET) : /api/cron/gapfill?from=2026-07-09
const DEFAULT_FROM = "2026-07-09"; // début de l'incident token

export async function GET(request: NextRequest) {
  if (!(await authorizeMaintenance(request))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const fromParam = new URL(request.url).searchParams.get("from") ?? DEFAULT_FROM;
  const from = /^\d{4}-\d{2}-\d{2}$/.test(fromParam) ? fromParam : DEFAULT_FROM;

  const aiFund = await fetchAiFund();
  if (!aiFund) {
    return NextResponse.json(
      { error: "book IA illisible — renouveler GITHUB_TOKEN/GITHUB_WRITE_TOKEN sur Vercel avant de reboucher la courbe" },
      { status: 502 }
    );
  }

  const supabase = createAdminClient();
  const { data: fundsData } = await supabase.from("funds").select("*");
  const funds = (fundsData ?? []) as (Fund & { cash: number })[];
  const group = funds.find((f) => f.kind === "group");
  const ai = funds.find((f) => f.kind === "ai");
  if (!group || !ai) {
    return NextResponse.json({ error: "funds non initialisés" }, { status: 500 });
  }

  const today = new Date().toISOString().slice(0, 10);

  // Dates à combler = relevés RÉELS du groupe (dates de bourse où value a tourné), sans
  // snapshot IA valide le même jour. Bornées à [from, hier].
  const { data: snapData } = await supabase
    .from("nav_snapshots")
    .select("fund_id, date, positions_value")
    .gte("date", from)
    .lt("date", today);
  const snaps = (snapData ?? []) as { fund_id: string; date: string; positions_value: number }[];
  const groupDates = snaps.filter((s) => s.fund_id === group.id).map((s) => s.date);
  const aiDates = new Set(
    snaps.filter((s) => s.fund_id === ai.id && s.positions_value > 0).map((s) => s.date)
  );
  const missing = Array.from(new Set(groupDates)).filter((d) => !aiDates.has(d)).sort();
  if (missing.length === 0) {
    return NextResponse.json({ ok: true, note: "aucun trou IA à combler", from, today });
  }

  // Apports par date (les apports pendant le trou — ex. l'auto-cotisation du 5 — doivent
  // apparaître au bon jour, pas rétroactivement) : cash(d) = cash de base + apports ≤ d.
  const { data: contribData } = await supabase.from("contributions").select("ts, amount");
  const contribs = ((contribData ?? []) as { ts?: string | null; amount: number }[])
    .map((c) => ({ date: String(c.ts ?? "").slice(0, 10), amount: Number(c.amount ?? 0) }))
    .filter((c) => c.date);
  const apportsUpTo = (d: string) =>
    contribs.reduce((s, c) => s + (c.date <= d ? c.amount : 0), 0);

  // Clôtures historiques (EUR) depuis quelques jours AVANT le trou, pour que le forward-fill
  // ait toujours une clôture ≤ première date manquante (week-end, jour férié).
  const histFrom = new Date(missing[0]);
  histFrom.setDate(histFrom.getDate() - 7);
  const positions = aiFund.positions ?? [];
  const hist = await fetchHistoricalCloses(positions.map((p) => p.ticker), histFrom.toISOString().slice(0, 10));

  // Forward-fill par date : dernière clôture connue ≤ date, pour chaque titre.
  const allDates = new Set<string>(missing);
  for (const t of Object.keys(hist)) for (const d of Object.keys(hist[t])) allDates.add(d);
  const sortedDates = Array.from(allDates).sort();
  const last: Record<string, number> = {};
  const ffByDate: Record<string, Record<string, number>> = {};
  for (const d of sortedDates) {
    for (const p of positions) {
      const c = hist[p.ticker.toUpperCase()]?.[d];
      if (typeof c === "number" && c > 0) last[p.ticker.toUpperCase()] = c;
    }
    ffByDate[d] = { ...last };
  }

  // NAV IA à chaque date manquante. Ligne « seed » (quantity=1 + value_t0) : sa valeur est
  // value_t0 par construction, quelle que soit la clôture. Garde-fou de couverture (comme
  // value) : une date où trop de titres n'ont pas de clôture est SAUTÉE plutôt que gravée fausse.
  const rows: { fund_id: string; date: string; cash: number; positions_value: number; nav: number }[] = [];
  const skipped: string[] = [];
  for (const d of missing) {
    const closes = ffByDate[d] ?? {};
    let pos = 0;
    let priced = 0;
    for (const p of positions) {
      const seed = isSeedPosition(p) && typeof p.value_t0 === "number" && p.value_t0 > 0;
      const c = closes[p.ticker.toUpperCase()];
      if (seed) {
        pos += p.value_t0!;
        priced++; // valeur exacte par construction, ne pénalise pas la couverture
      } else if (typeof c === "number" && c > 0) {
        pos += c * p.quantity;
        priced++;
      } else {
        pos += p.avg_cost * p.quantity; // repli coût (titre jamais coté sur la fenêtre)
      }
    }
    const coverage = positions.length ? priced / positions.length : 1;
    if (positions.length > 0 && coverage < 0.7) {
      skipped.push(d);
      continue;
    }
    const cash = aiFund.cash + apportsUpTo(d);
    rows.push({ fund_id: ai.id, date: d, cash, positions_value: pos, nav: cash + pos });
  }

  let written = 0;
  for (let i = 0; i < rows.length; i += 500) {
    const chunk = rows.slice(i, i + 500);
    const { error } = await supabase.from("nav_snapshots").upsert(chunk, { onConflict: "fund_id,date" });
    if (error) return NextResponse.json({ error: error.message, written }, { status: 500 });
    written += chunk.length;
  }

  return NextResponse.json({
    ok: true,
    note: "trou IA rebouché avec le book figé × clôtures historiques (le book n'a pas bougé pendant la panne — reconstruction fidèle, pas un backcast)",
    from,
    missingDates: missing.length,
    written,
    skippedLowCoverage: skipped,
  });
}
