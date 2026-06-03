"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const LINKS = [
  { href: "/", label: "Tableau de bord" },
  { href: "/groupe", label: "Fonds groupe" },
  { href: "/ia", label: "Fonds IA" },
  { href: "/brief", label: "Brief" },
];

export function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  if (pathname.startsWith("/login")) return null;

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="border-b border-edge bg-panel/60 backdrop-blur">
      <nav className="mx-auto flex max-w-5xl items-center gap-1 px-4 py-3">
        <span className="mr-3 font-semibold tracking-tight">🛎️ Comptoir</span>
        {LINKS.map((l) => {
          const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-lg px-3 py-1.5 text-sm ${
                active ? "bg-edge text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              {l.label}
            </Link>
          );
        })}
        <button onClick={signOut} className="ml-auto text-sm text-gray-400 hover:text-white">
          Déconnexion
        </button>
      </nav>
    </header>
  );
}
