"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Brand } from "@/components/Brand";

// Page atteinte depuis le lien de réinitialisation (via /auth/callback qui a posé une
// session de récupération). L'utilisateur y choisit son nouveau mot de passe.
export default function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  // Vérifie qu'une session de récupération existe bien. Robuste si Supabase
  // n'est pas configuré (ex. environnement local de démo) : on n'explose pas.
  useEffect(() => {
    try {
      const supabase = createClient();
      supabase.auth
        .getSession()
        .then(({ data }) => setHasSession(!!data.session))
        .catch(() => setHasSession(false))
        .finally(() => setReady(true));
    } catch {
      setHasSession(false);
      setReady(true);
    }
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError("Le mot de passe doit faire au moins 6 caractères.");
      return;
    }
    if (password !== confirm) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setError(error.message);
      } else {
        setDone(true);
        setTimeout(() => {
          router.push("/");
          router.refresh();
        }, 1600);
      }
    } catch {
      setError("Une erreur est survenue. Réessaie.");
    }
    setLoading(false);
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* panneau marque */}
      <div className="hidden flex-col justify-between bg-brand-gradient p-10 text-white lg:flex">
        <Brand size={36} variant="light" />
        <div>
          <h2 className="text-3xl font-extrabold leading-tight">
            Nouveau départ.<br />Nouveau mot de passe.
          </h2>
          <p className="mt-4 max-w-md text-white/90">
            Choisis un mot de passe que tu retiendras — tu resteras connecté ensuite.
          </p>
        </div>
        <p className="text-sm text-white/70">Paper trading · 100 % fictif.</p>
      </div>

      {/* formulaire */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Brand size={30} />
          </div>
          <h1 className="text-2xl font-bold">Nouveau mot de passe</h1>

          {!ready ? (
            <p className="mt-6 text-sm text-muted">Vérification du lien…</p>
          ) : done ? (
            <div className="card-p mt-6 space-y-1">
              <p className="text-sm font-semibold text-brand-600">✅ Mot de passe enregistré</p>
              <p className="text-sm text-muted">Connexion en cours…</p>
            </div>
          ) : !hasSession ? (
            <div className="card-p mt-6 space-y-3">
              <p className="text-sm">
                Ce lien n&apos;est plus valide ou a expiré. Recommence depuis
                « Mot de passe oublié ».
              </p>
              <button onClick={() => router.push("/login")} className="btn btn-primary w-full">
                Retour à la connexion
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-6 space-y-3">
              <p className="text-sm text-muted">Choisis ton nouveau mot de passe.</p>
              <div>
                <label className="label">Nouveau mot de passe</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="6 caractères minimum"
                  className="input mt-1"
                  minLength={6}
                  autoFocus
                />
              </div>
              <div>
                <label className="label">Confirme le mot de passe</label>
                <input
                  type="password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  className="input mt-1"
                  minLength={6}
                />
              </div>
              <button type="submit" disabled={loading} className="btn btn-primary mt-1 w-full">
                {loading ? "Enregistrement…" : "Définir le mot de passe"}
              </button>
              {error && <p className="text-sm text-danger">{error}</p>}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
