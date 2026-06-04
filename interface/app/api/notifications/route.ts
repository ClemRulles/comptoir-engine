import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isConfigured } from "@/lib/data";

export async function GET() {
  if (!isConfigured()) return NextResponse.json({ notifications: [], unread: 0 });
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ notifications: [], unread: 0 });

  const { data } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(30);
  const notifications = data ?? [];
  const unread = notifications.filter((n: { read: boolean }) => !n.read).length;
  return NextResponse.json({ notifications, unread });
}
