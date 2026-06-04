import { NextResponse, type NextRequest } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { isConfigured } from "@/lib/data";

export async function GET() {
  if (!isConfigured()) return NextResponse.json({ proposals: [] });
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("proposals")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ proposals: data });
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
  const ticker = String(body?.ticker ?? "").trim().toUpperCase();
  const thesis = String(body?.thesis ?? "").trim();
  const size = String(body?.size ?? "").trim() || null;
  const horizon = String(body?.horizon ?? "").trim() || null;
  if (!ticker || !thesis) {
    return NextResponse.json({ error: "Ticker et thèse requis." }, { status: 400 });
  }

  const authorName =
    (user.user_metadata?.display_name as string) ||
    (user.email ? user.email.split("@")[0] : "Un membre");

  const { data: proposal, error } = await supabase
    .from("proposals")
    .insert({ author_id: user.id, author_name: authorName, ticker, thesis, size, horizon })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Fan-out des notifications à tous les membres (via service role) sauf l'auteur.
  try {
    const admin = createAdminClient();
    const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const recipients = (list?.users ?? []).filter((u: { id: string }) => u.id !== user.id);
    if (recipients.length) {
      await admin.from("notifications").insert(
        recipients.map((u: { id: string }) => ({
          user_id: u.id,
          type: "proposal",
          title: `Nouvelle proposition : ${ticker}`,
          body: `${authorName} propose ${ticker} — ${thesis.slice(0, 120)}`,
          link: "/propositions",
        }))
      );
    }
  } catch {
    // la proposition est créée même si la notif échoue
  }

  return NextResponse.json({ ok: true, proposal });
}
