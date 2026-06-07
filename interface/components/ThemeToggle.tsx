"use client";

import { useEffect, useState } from "react";

// Bascule clair/sombre. Light par défaut ; la préférence est mémorisée (localStorage).
// Le script anti-flash dans le layout applique la classe `.dark` avant le rendu.
export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
    setMounted(true);
  }, []);

  function toggle() {
    const root = document.documentElement;
    root.classList.add("theme-anim");
    const next = !root.classList.contains("dark");
    root.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      /* stockage indisponible — sans effet */
    }
    setDark(next);
    window.setTimeout(() => root.classList.remove("theme-anim"), 400);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Activer le mode clair" : "Activer le mode sombre"}
      title={dark ? "Mode clair" : "Mode sombre"}
      className="btn btn-ghost h-9 w-9 rounded-full p-0"
    >
      {/* Avant montage : icône neutre pour éviter tout mismatch d'hydratation. */}
      {mounted && dark ? (
        // Soleil
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      ) : (
        // Lune
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
        </svg>
      )}
    </button>
  );
}
