import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isConfigured } from "@/lib/data";

// Marque toutes les notifications de l'utilisateur courant comme lues.
export async function POST() {
  if (!isConfigured()) return NextResponse.json({ ok: true });
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", user.id)
    .eq("read", false);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
