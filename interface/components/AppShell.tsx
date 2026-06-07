"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { BottomNav } from "./BottomNav";
import { StockDrawerProvider } from "./StockDrawer";

export function AppShell({ demo, children }: { demo: boolean; children: React.ReactNode }) {
  const pathname = usePathname();
  const bare = pathname.startsWith("/login") || pathname.startsWith("/auth");

  if (bare) return <>{children}</>;

  return (
    <StockDrawerProvider>
      <Sidebar />
      <div className="md:pl-64">
        <Topbar demo={demo} />
        <main className="mx-auto max-w-6xl px-4 md:px-8 py-5 pb-28 md:pb-8">{children}</main>
      </div>
      <BottomNav />
    </StockDrawerProvider>
  );
}
