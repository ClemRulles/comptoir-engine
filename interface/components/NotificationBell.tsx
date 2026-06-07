"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type Notif = {
  id: string;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  created_at: string;
};

export function NotificationBell() {
  const [items, setItems] = useState<Notif[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  async function load() {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const { notifications, unread } = await res.json();
        setItems(notifications ?? []);
        setUnread(unread ?? 0);
      }
    } catch {
      /* ignore */
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(() => {
      if (document.visibilityState === "visible") load();
    }, 60000);
    return () => clearInterval(t);
  }, []);

  // fermer au clic extérieur
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  async function toggle() {
    const next = !open;
    setOpen(next);
    if (next && unread > 0) {
      setUnread(0);
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
      try {
        await fetch("/api/notifications/read", { method: "POST" });
      } catch {
        /* ignore */
      }
    }
  }

  function timeAgo(iso: string) {
    const d = Math.max(0, Date.now() - new Date(iso).getTime());
    const m = Math.floor(d / 60000);
    if (m < 1) return "à l'instant";
    if (m < 60) return `il y a ${m} min`;
    const h = Math.floor(m / 60);
    if (h < 24) return `il y a ${h} h`;
    return `il y a ${Math.floor(h / 24)} j`;
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={toggle}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-bg hover:text-ink transition-colors"
        title="Notifications"
        aria-label="Notifications"
      >
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-w-[90vw] overflow-hidden rounded-xl border border-line bg-card shadow-card z-40">
          <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
            <span className="text-sm font-semibold">Notifications</span>
            <Link href="/propositions" onClick={() => setOpen(false)} className="text-xs text-brand hover:underline">
              Voir les propositions
            </Link>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-muted">Aucune notification.</p>
            ) : (
              items.map((n) => (
                <Link
                  key={n.id}
                  href={n.link || "#"}
                  onClick={() => setOpen(false)}
                  className="block border-b border-line/60 px-4 py-3 hover:bg-bg"
                >
                  <div className="text-sm font-medium text-ink">{n.title}</div>
                  {n.body && <div className="mt-0.5 text-xs text-slate-600 line-clamp-2">{n.body}</div>}
                  <div className="mt-1 text-[11px] text-muted">{timeAgo(n.created_at)}</div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
