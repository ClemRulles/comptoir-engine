import { fetchAiFund } from "@/lib/github";
import { eur } from "@/lib/fund";

export const dynamic = "force-dynamic";

export default async function IaPage() {
  const fund = await fetchAiFund();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Fonds IA (fictif)</h1>
        <p className="text-sm text-gray-400">
          Positions décidées par le moteur le vendredi, à partir de ses convictions. 100 %
          fictif — aucun ordre réel.
        </p>
      </div>

      {!fund ? (
        <div className="card text-sm text-gray-500">
          Le book de l&apos;IA apparaîtra ici après le premier passage de la routine du vendredi
          (fichier <code>memory/fund/ai-fund.json</code>). Nécessite le token GitHub côté serveur.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="card">
              <div className="text-xs uppercase text-gray-400">Cash disponible</div>
              <div className="mt-1 text-xl font-semibold">{eur(fund.cash)}</div>
            </div>
            <div className="card">
              <div className="text-xs uppercase text-gray-400">Capital de départ</div>
              <div className="mt-1 text-xl font-semibold">{eur(fund.start_capital)}</div>
            </div>
            <div className="card">
              <div className="text-xs uppercase text-gray-400">Mis à jour le</div>
              <div className="mt-1 text-xl font-semibold">{fund.as_of}</div>
            </div>
          </div>

          <div className="card overflow-x-auto">
            <h2 className="mb-2 text-lg font-semibold">Positions</h2>
            {fund.positions.length === 0 ? (
              <p className="text-sm text-gray-500">Aucune position ouverte (100 % cash).</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400">
                    <th className="py-2">Ticker</th>
                    <th>Quantité</th>
                    <th>Prix de revient</th>
                    <th>Thèse</th>
                  </tr>
                </thead>
                <tbody>
                  {fund.positions.map((p) => (
                    <tr key={p.ticker} className="border-t border-edge align-top">
                      <td className="py-2 font-medium">{p.ticker}</td>
                      <td>{p.quantity}</td>
                      <td>{p.avg_cost} €</td>
                      <td className="text-gray-300">{p.thesis ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="card">
            <h2 className="mb-2 text-lg font-semibold">Derniers trades fictifs</h2>
            {fund.trades.length === 0 ? (
              <p className="text-sm text-gray-500">Aucun trade enregistré.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {fund.trades.slice(-12).reverse().map((t, i) => (
                  <li key={i} className="border-b border-edge pb-2">
                    <span className={t.side === "buy" ? "text-green-400" : "text-red-400"}>
                      {t.side === "buy" ? "ACHAT" : "VENTE"}
                    </span>{" "}
                    <strong>{t.ticker}</strong> · {t.quantity} @ {t.price} € ·{" "}
                    <span className="text-gray-500">{t.ts}</span>
                    <div className="text-gray-400">{t.rationale}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
