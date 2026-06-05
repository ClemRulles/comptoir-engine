import { createClient } from "@/lib/supabase/server";

// Autorise une route de maintenance si :
//  - l'en-tête porte le bon CRON_SECRET (appel par le Vercel Cron / curl), OU
//  - un membre est connecté (déclenchement depuis l'app, sans avoir à connaître le secret).
export async function authorizeMaintenance(request: Request): Promise<boolean> {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  if (secret && auth === `Bearer ${secret}`) return true;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return Boolean(user);
  } catch {
    return false;
  }
}
