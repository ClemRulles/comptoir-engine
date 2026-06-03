"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setLoading(false);
    if (error) setError(error.message);
    else setSent(true);
  }

  return (
    <div className="mx-auto mt-16 max-w-sm">
      <h1 className="mb-1 text-2xl font-semibold">🛎️ Comptoir</h1>
      <p className="mb-6 text-sm text-gray-400">
        Suivi du fonds commun et du fonds fictif de l&apos;IA. Accès réservé au groupe.
      </p>

      {sent ? (
        <div className="card">
          <p className="text-sm">
            Lien de connexion envoyé à <strong>{email}</strong>. Ouvre ton email et clique
            sur le lien pour entrer.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="card space-y-3">
          <label className="block text-sm text-gray-400">Ton email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="prenom@email.com"
            className="input"
          />
          <button type="submit" disabled={loading} className="btn btn-primary w-full">
            {loading ? "Envoi…" : "Recevoir un lien de connexion"}
          </button>
          {error && <p className="text-sm text-red-400">{error}</p>}
        </form>
      )}
    </div>
  );
}
