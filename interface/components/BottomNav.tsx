"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV, isActive } from "./nav";

export function BottomNav() {
  const pathname = usePathname();
  if (pathname.startsWith("/login") || pathname.startsWith("/auth")) return null;
  const items = NAV.filter((n) => n.mobile);

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-card/90 backdrop-blur-xl md:hidden"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0px)" }}
    >
      <div className="grid" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
        {items.map((l) => {
          const active = isActive(l.href, pathname);
          const Icon = l.icon;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`flex flex-col items-center gap-1 py-2 text-[11px] font-medium transition-colors ${active ? "text-brand-600 dark:text-brand-500" : "text-muted"}`}
            >
              <span className={`flex h-8 w-12 items-center justify-center rounded-full transition-colors ${active ? "bg-brand/10" : ""}`}>
                <Icon size={20} strokeWidth={active ? 2.3 : 1.9} />
              </span>
              {l.short}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
