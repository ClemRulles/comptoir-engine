import { getAppData, getMovers } from "@/lib/data";
import { AssetSearch } from "@/components/AssetSearch";
import { MoversBoard } from "@/components/MoversBoard";
import { SectionTitle, Reveal } from "@/components/Kpi";
import { PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function RecherchePage() {
  const data = await getAppData();
  const heldTickers = [...data.group.holdings, ...data.ai.holdings].map((h) => h.ticker);
  const movers = await getMovers(heldTickers);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Actions · ETF · crypto"
        title="Recherche"
        lead="Cherchez n'importe quel actif et ouvrez son graphique de cours. En attendant, les plus forts mouvements du jour parmi les titres suivis."
      />

      {/* Barre de recherche — pièce maîtresse (z élevé pour que le menu passe au-dessus) */}
      <Reveal delay={40} className="relative z-40">
        <AssetSearch />
      </Reveal>

      {/* Contenu par défaut : top mouvements du jour avec mini-courbe du mois */}
      <Reveal delay={100}>
        <div className="card-p">
          <SectionTitle
            right={
              movers.demo ? (
                <span className="chip bg-slate-100 text-slate-500">Démo</span>
              ) : (
                <span className="text-xs text-muted">variation du jour</span>
              )
            }
          >
            Top mouvements du jour
          </SectionTitle>
          <MoversBoard gainers={movers.gainers} losers={movers.losers} />
        </div>
      </Reveal>

      <p className="text-center text-xs text-muted">
        Cours différés (~15 min) · source Yahoo Finance. Clique un titre pour son graphique détaillé.
      </p>
    </div>
  );
}
