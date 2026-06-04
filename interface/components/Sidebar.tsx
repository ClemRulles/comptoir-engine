"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Brand } from "./Brand";
import { createClient } from "@/lib/supabase/client";

const ICONS: Record<string, React.ReactNode> = {
  dash: (
    <path d="M3 13h8V3H3v10Zm0 8h8v-6H3v6Zm10 0h8V11h-8v10Zm0-18v6h8V3h-8Z" />
  ),
  group: (
    <path d="M16 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3Zm-8 0c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3Zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13Zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5Z" />
  ),
  ai: (
    <path d="M12 2a2 2 0 0 1 2 2v1h2a3 3 0 0 1 3 3v2h1a1 1 0 1 1 0 2h-1v2a3 3 0 0 1-3 3h-2v1a2 2 0 1 1-4 0v-1H8a3 3 0 0 1-3-3v-2H4a1 1 0 1 1 0-2h1V8a3 3 0 0 1 3-3h2V4a2 2 0 0 1 2-2Zm-3 7v6h6V9H9Z" />
  ),
  brief: (
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Zm2 16H8v-2h8v2Zm0-4H8v-2h8v2Zm-3-5V3.5L18.5 9H13Z" />
  ),
  bulb: (
    <path d="M9 21h6v-1H9v1Zm3-19a7 7 0 0 0-4 12.74V17h8v-2.26A7 7 0 0 0 12 2Zm-1 16v-2h2v2h-2Z" />
  ),
  learn: (
    <path d="M12 3 1 9l11 6 9-4.91V17h2V9L12 3Zm-6 9.18v3.5L12 19l6-3.32v-3.5L12 15l-6-2.82Z" />
  ),
};

const LINKS = [
  { href: "/", label: "Tableau de bord", icon: "dash" },
  { href: "/groupe", label: "Fonds groupe", icon: "group" },
  { href: "/ia", label: "Fonds IA", icon: "ai" },
  { href: "/apprentissages", label: "Apprentissages", icon: "learn" },
  { href: "/propositions", label: "Propositions", icon: "bulb" },
  { href: "/brief", label: "Brief & tendance", icon: "brief" },
];

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
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r border-line bg-white">
      <div className="px-5 py-5 border-b border-line">
        <Brand />
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {LINKS.map((l) => {
          const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active ? "bg-brand/10 text-brand-600" : "text-muted hover:bg-bg hover:text-ink"
              }`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                {ICONS[l.icon]}
              </svg>
              {l.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-3 py-4 border-t border-line space-y-2">
        <div className="rounded-lg bg-brand-gradient p-3 text-white text-xs leading-snug">
          <p className="font-semibold">Paper trading</p>
          <p className="opacity-90">100 % fictif — aucun ordre réel n&apos;est passé.</p>
        </div>
        <button onClick={signOut} className="btn btn-ghost w-full justify-start text-muted">
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
