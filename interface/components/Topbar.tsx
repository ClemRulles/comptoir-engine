"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brand } from "./Brand";

const TITLES: Record<string, string> = {
  "/": "Tableau de bord",
  "/groupe": "Fonds du groupe",
  "/ia": "Fonds IA (fictif)",
  "/brief": "Brief & tendance",
};

const MOBILE = [
  { href: "/", label: "Accueil" },
  { href: "/groupe", label: "Groupe" },
  { href: "/ia", label: "IA" },
  { href: "/brief", label: "Brief" },
];

export function Topbar({ demo }: { demo: boolean }) {
  const pathname = usePathname();
  const title = TITLES[pathname] ?? "HypeInvest";

  return (
    <header className="sticky top-0 z-10 border-b border-line bg-white/80 backdrop-blur">
      <div className="flex items-center gap-3 px-4 md:px-8 py-3.5">
        <div className="md:hidden">
          <Brand size={26} />
        </div>
        <h1 className="hidden md:block text-lg font-bold tracking-tight">{title}</h1>
        <div className="ml-auto flex items-center gap-2">
          {demo && (
            <span className="chip bg-ai/10 text-ai">
              <span className="h-1.5 w-1.5 rounded-full bg-ai" /> Démo
            </span>
          )}
          <span className="chip bg-brand/10 text-brand-600 hidden sm:inline-flex">Paper · fictif</span>
        </div>
      </div>
      <nav className="md:hidden flex gap-1 px-2 pb-2 overflow-x-auto">
        {MOBILE.map((l) => {
          const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-lg px-3 py-1.5 text-sm whitespace-nowrap ${
                active ? "bg-brand/10 text-brand-600 font-medium" : "text-muted"
              }`}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
