"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

// Rafraîchit les données serveur (cours live) périodiquement quand l'onglet est visible,
// + bouton manuel et horodatage « mis à jour à ».
export function LiveRefresher({ intervalMs = 120000 }: { intervalMs?: number }) {
  const router = useRouter();
  const [updatedAt, setUpdatedAt] = useState<Date>(new Date());
  const [spinning, setSpinning] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  function refresh() {
    setSpinning(true);
    router.refresh();
    setUpdatedAt(new Date());
    setTimeout(() => setSpinning(false), 700);
  }

  useEffect(() => {
    function tick() {
      if (document.visibilityState === "visible") {
        router.refresh();
        setUpdatedAt(new Date());
      }
    }
    timer.current = setInterval(tick, intervalMs);
    const onVis = () => {
      if (document.visibilityState === "visible") tick();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      if (timer.current) clearInterval(timer.current);
      document.removeEventListener("visibilitychange", onVis);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intervalMs]);

  const hh = updatedAt.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  return (
    <button
      onClick={refresh}
      className="chip bg-brand/10 text-brand-600 hover:bg-brand/20 transition-colors"
      title="Rafraîchir les cours"
    >
      <svg
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={spinning ? "animate-spin" : ""}
      >
        <path d="M21 12a9 9 0 1 1-2.64-6.36" />
        <path d="M21 3v6h-6" />
      </svg>
      <span className="hidden sm:inline">Mis à jour {hh}</span>
      <span className="sm:hidden">{hh}</span>
    </button>
  );
}
