"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { BottomNav } from "./BottomNav";
import { StockDrawerProvider } from "./StockDrawer";

export function AppShell({ demo, children }: { demo: boolean; children: React.ReactNode }) {
  const pathname = usePathname();
  const bare =
    pathname.startsWith("/login") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/reset-password");

  if (bare) return <>{children}</>;

  return (
    <StockDrawerProvider>
      <Sidebar />
      <div className="md:pl-64">
        <Topbar demo={demo} />
        {/* key=pathname → léger fondu à chaque changement de page */}
        <main key={pathname} className="mx-auto max-w-6xl animate-fade-in px-4 py-5 pb-28 md:px-8 md:pb-8">
          {children}
        </main>
      </div>
      <BottomNav />
    </StockDrawerProvider>
  );
}
