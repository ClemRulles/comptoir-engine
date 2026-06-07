"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Petit éditeur de pseudo dans la barre du haut. Écrit `display_name` dans le
// profil Supabase de l'utilisateur — ce nom est ensuite utilisé pour signer ses
// propositions et les notifications envoyées au groupe.
export function PseudoEditor({ demo }: { demo: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<string | null>(demo ? "toi" : null);
  const [pseudo, setPseudo] = useState("");
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (demo) return;
    const supabase = createClient();
    supabase.auth
      .getUser()
      .then(({ data }) => {
        const u = data.user;
        if (!u) return;
        const display = (u.user_metadata?.display_name as string) || "";
        setCurrent(display || (u.email ? u.email.split("@")[0] : "membre"));
        setPseudo(display);
      })
      .catch(() => {});
  }, [demo]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const name = pseudo.trim();
    if (!name) return;
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ data: { display_name: name } });
      if (error) {
        setError(error.message);
      } else {
        setCurrent(name);
        setOk(true);
        setTimeout(() => setOk(false), 2000);
        setOpen(false);
        router.refresh();
      }
    } catch {
      setError("Erreur réseau");
    }
    setLoading(false);
  }

  // pas connecté / pas encore chargé (et hors démo) → on n'affiche rien
  if (current == null) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="chip bg-bg text-ink hover:bg-line/60"
        title="Changer mon pseudo"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-4.42 0-8 2.69-8 6v2h16v-2c0-3.31-3.58-6-8-6Z" />
        </svg>
        <span className="max-w-[8rem] truncate">{current}</span>
        {ok && <span className="text-brand-600">✓</span>}
      </button>

      {open && (
        <form
          onSubmit={save}
          className="absolute right-0 z-30 mt-2 w-64 rounded-xl border border-line bg-card p-3 shadow-lg"
        >
          <label className="label">Mon pseudo</label>
          <input
            className="input mt-1"
            value={pseudo}
            onChange={(e) => setPseudo(e.target.value)}
            placeholder="ex. Riri, Henri…"
            maxLength={24}
            autoFocus
          />
          <p className="mt-1.5 text-xs text-muted">
            Ce nom signe tes propositions et les notifications au groupe.
          </p>
          {demo ? (
            <p className="mt-2 rounded-lg border border-ai/30 bg-ai/5 px-2 py-1.5 text-xs">
              Mode démo : l&apos;enregistrement sera actif sur l&apos;app en ligne.
            </p>
          ) : (
            <button type="submit" disabled={loading} className="btn btn-primary mt-2 w-full">
              {loading ? "Enregistrement…" : "Enregistrer"}
            </button>
          )}
          {error && <p className="mt-1 text-xs text-danger">{error}</p>}
        </form>
      )}
    </div>
  );
}
