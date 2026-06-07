import { NextResponse, type NextRequest } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { isConfigured } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isConfigured()) return NextResponse.json({ messages: [] });
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .order("created_at", { ascending: true })
    .limit(300);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ messages: data ?? [] });
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
  const kind = body?.kind === "proposal" ? "proposal" : "text";
  const content = String(body?.content ?? "").trim();
  if (!content) return NextResponse.json({ error: "Contenu vide." }, { status: 400 });
  if (content.length > 2000) return NextResponse.json({ error: "Message trop long (max 2000)." }, { status: 400 });

  const authorName =
    (user.user_metadata?.display_name as string) ||
    (user.email ? user.email.split("@")[0] : "Membre");

  const row: Record<string, unknown> = {
    author_id: user.id,
    author_name: authorName,
    content,
    kind,
  };

  if (kind === "proposal") {
    const ticker = String(body?.proposal_ticker ?? "").trim().toUpperCase();
    const thesis = String(body?.proposal_thesis ?? "").trim();
    if (!ticker || !thesis) {
      return NextResponse.json({ error: "Ticker et thèse requis pour une proposition." }, { status: 400 });
    }
    row.proposal_ticker = ticker;
    row.proposal_thesis = thesis;
    row.proposal_size = String(body?.proposal_size ?? "").trim() || null;
    row.proposal_horizon = String(body?.proposal_horizon ?? "").trim() || null;
  }

  const { data: message, error: insertErr } = await supabase
    .from("messages")
    .insert(row)
    .select()
    .single();
  if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 });

  // Fan-out notifications pour les propositions uniquement
  if (kind === "proposal") {
    try {
      const admin = createAdminClient();
      const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      const recipients = (list?.users ?? []).filter((u: { id: string }) => u.id !== user.id);
      if (recipients.length) {
        await admin.from("notifications").insert(
          recipients.map((u: { id: string }) => ({
            user_id: u.id,
            kind: "proposal",
            title: `💡 Proposition : ${row.proposal_ticker}`,
            body: row.proposal_thesis ? String(row.proposal_thesis).slice(0, 120) : "",
            href: "/propositions",
          }))
        );
      }
    } catch {
      // Notifications non bloquantes — on continue même en cas d'erreur
    }
  }

  return NextResponse.json({ message });
}
