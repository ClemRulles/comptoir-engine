"use client";

import { usePathname } from "next/navigation";
import { Brand } from "./Brand";
import { LiveRefresher } from "./LiveRefresher";

const TITLES: Record<string, string> = {
  "/": "Tableau de bord",
  "/groupe": "Fonds du groupe",
  "/ia": "Fonds IA (fictif)",
  "/brief": "Brief & tendance",
};

export function Topbar({ demo }: { demo: boolean }) {
  const pathname = usePathname();
  const title = TITLES[pathname] ?? "HypeInvest";

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-white/85 backdrop-blur">
      <div className="flex items-center gap-3 px-4 md:px-8 py-3">
        <div className="md:hidden">
          <Brand size={28} />
        </div>
        <h1 className="hidden md:block text-lg font-bold tracking-tight">{title}</h1>
        <div className="ml-auto flex items-center gap-2">
          <LiveRefresher />
          {demo && (
            <span className="chip bg-ai/10 text-ai">
              <span className="h-1.5 w-1.5 rounded-full bg-ai" /> Démo
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
