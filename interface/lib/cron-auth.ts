import { timingSafeEqual } from "crypto";
import { createClient } from "@/lib/supabase/server";

// Comparaison en temps constant : une égalité de chaînes classique peut laisser fuiter la
// longueur du préfixe correct via le temps de réponse (timing attack sur le secret).
export function secretEquals(provided: string | null, expected: string | undefined): boolean {
  if (!provided || !expected) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

// Autorise une route de maintenance si :
//  - l'en-tête porte le bon CRON_SECRET (appel par le Vercel Cron / curl), OU
//  - un membre est connecté (déclenchement depuis l'app, sans avoir à connaître le secret).
export async function authorizeMaintenance(request: Request): Promise<boolean> {
  const auth = request.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (secret && secretEquals(auth, `Bearer ${secret}`)) return true;
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
