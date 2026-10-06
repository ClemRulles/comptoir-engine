"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { titleFor } from "./nav";
import { Brand } from "./Brand";
import { LiveRefresher } from "./LiveRefresher";
import { NotificationBell } from "./NotificationBell";
import { PseudoEditor } from "./PseudoEditor";
import { ThemeToggle } from "./ThemeToggle";

export function Topbar({ demo }: { demo: boolean }) {
  const pathname = usePathname();
  const title = titleFor(pathname);

  return (
    <header
      className="sticky top-0 z-20 border-b border-line bg-card/85 backdrop-blur"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="flex min-w-0 items-center gap-2 px-4 py-3 md:gap-3 md:px-8">
        <div className="min-w-0 md:hidden">
          <Brand size={28} />
        </div>
        <div className="hidden text-[15px] font-semibold tracking-tight md:block">{title}</div>
        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
          <Link href="/recherche" aria-label="Rechercher un actif" className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-bg hover:text-ink md:w-auto md:gap-2 md:rounded-xl md:border md:border-line md:bg-elev md:px-3 md:text-[13px]">
            <Search size={16} />
            <span className="hidden md:inline">Rechercher</span>
          </Link>
          <PseudoEditor demo={demo} />
          <LiveRefresher />
          <ThemeToggle />
          <NotificationBell />
          {demo && (
            <span className="chip bg-ai/10 text-ai" title="Données de démonstration">
              <span className="h-1.5 w-1.5 rounded-full bg-ai" /> <span className="hidden sm:inline">Démo</span>
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
