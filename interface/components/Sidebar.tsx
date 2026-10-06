"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Brand } from "./Brand";
import { NAV, isActive } from "./nav";
import { createClient } from "@/lib/supabase/client";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="hidden border-r border-line bg-card/80 backdrop-blur md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
      <div className="px-5 py-5">
        <Brand />
      </div>
      <nav className="flex-1 space-y-0.5 px-3 py-2">
        {NAV.map((l) => {
          const active = isActive(l.href, pathname);
          const Icon = l.icon;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium transition-colors ${
                active ? "bg-brand/10 text-brand-600 dark:text-brand-500" : "text-muted hover:bg-bg hover:text-ink"
              }`}
            >
              {active && <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-brand" />}
              <Icon size={18} strokeWidth={active ? 2.3 : 2} />
              {l.label}
            </Link>
          );
        })}
      </nav>
      <div className="space-y-2 px-3 py-4">
        <div className="rounded-2xl bg-brand-gradient p-3.5 text-xs leading-snug text-white shadow-glow">
          <p className="font-semibold">Paper trading</p>
          <p className="mt-0.5 opacity-90">100 % fictif — aucun ordre réel n&apos;est passé.</p>
        </div>
        <button onClick={signOut} className="btn btn-ghost w-full justify-start text-muted">
          <LogOut size={16} /> Déconnexion
        </button>
      </div>
    </aside>
  );
}
