"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Brand } from "@/components/Brand";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) setError(error.message);
      else setSent(true);
    } catch {
      setError("Connexion non configurée (Supabase manquant).");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* panneau marque */}
      <div className="hidden lg:flex flex-col justify-between bg-brand-gradient p-10 text-white">
        <Brand size={34} />
        <div>
          <h2 className="text-3xl font-extrabold leading-tight">
            Votre fonds commun.<br />Le fonds de l&apos;IA.<br />Qui gagne ?
          </h2>
          <p className="mt-4 max-w-md text-white/90">
            HypeInvest suit en parallèle votre portefeuille et celui géré par l&apos;IA à partir de
            ses convictions hebdomadaires. 100 % fictif — aucun ordre réel.
          </p>
        </div>
        <p className="text-sm text-white/70">Paper trading · ce n&apos;est pas un conseil en investissement.</p>
      </div>

      {/* formulaire */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8">
            <Brand size={30} />
          </div>
          <h1 className="text-2xl font-bold">Connexion</h1>
          <p className="mt-1 text-sm text-muted">Accès réservé aux membres du groupe.</p>

          {sent ? (
            <div className="card-p mt-6">
              <p className="text-sm">
                Lien de connexion envoyé à <strong>{email}</strong>. Ouvre ton email et clique
                dessus pour entrer.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-3">
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="prenom@email.com"
                  className="input mt-1"
                />
              </div>
              <button type="submit" disabled={loading} className="btn btn-primary w-full">
                {loading ? "Envoi…" : "Recevoir un lien de connexion"}
              </button>
              {error && <p className="text-sm text-danger">{error}</p>}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
