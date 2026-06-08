import { createClient } from "@/lib/supabase/server";
import { getAppData, isConfigured } from "@/lib/data";
import { Chat } from "@/components/Chat";

export const dynamic = "force-dynamic";

export default async function PropositionsPage() {
  const demo = !isConfigured();

  // NAV du fonds groupe → conversion % ↔ € en direct dans le formulaire de proposition.
  const data = await getAppData();
  const groupNav = data.group.nav;

  // Récupération de l'ID utilisateur courant (pour différencier mes bulles des autres)
  let currentUserId: string | undefined;
  if (!demo) {
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      currentUserId = user?.id;
    } catch {
      // silently degrade
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Chat du groupe</h1>
        <p className="text-sm text-muted">
          Discutez en temps réel et proposez des idées d&apos;investissement. Le bouton 💡 envoie
          une proposition structurée et notifie tout le groupe.
        </p>
      </div>
      <Chat demo={demo} currentUserId={currentUserId} groupNav={groupNav} />
    </div>
  );
}
