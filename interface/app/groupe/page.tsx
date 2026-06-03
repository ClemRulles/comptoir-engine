import { HoldingsEditor } from "@/components/HoldingsEditor";

export const dynamic = "force-dynamic";

export default function GroupePage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Fonds du groupe (réel)</h1>
        <p className="text-sm text-gray-400">
          Tenez à jour les positions du pot commun. Tout membre connecté peut ajouter, modifier
          ou retirer une ligne. La valorisation se met à jour chaque jour.
        </p>
      </div>
      <HoldingsEditor />
    </div>
  );
}
