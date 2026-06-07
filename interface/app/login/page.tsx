"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Brand } from "@/components/Brand";

type Mode = "signin" | "signup" | "magic";

const ERROR_MAP: Record<string, string> = {
  "Invalid login credentials": "Email ou mot de passe incorrect.",
  "Email not confirmed": "Confirme ton email avant de te connecter.",
  "User already registered": "Ce compte existe déjà — connecte-toi.",
  "Password should be at least 6 characters": "Le mot de passe doit faire au moins 6 caractères.",
  "Signup requires a valid password": "Mot de passe requis pour créer un compte.",
};

function translate(msg: string) {
  return ERROR_MAP[msg] ?? msg;
}

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pseudo, setPseudo] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();

      if (mode === "magic") {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        });
        if (error) setError(translate(error.message));
        else setSent(true);
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: pseudo.trim() || email.split("@")[0] },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) setError(translate(error.message));
        else setSent(true);
      } else {
        // signin
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) setError(translate(error.message));
        else {
          router.push("/");
          router.refresh();
        }
      }
    } catch {
      setError("Service non disponible — Supabase non configuré.");
    }
    setLoading(false);
  }

  const isSignin = mode === "signin";
  const isSignup = mode === "signup";
  const isMagic = mode === "magic";

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* panneau marque */}
      <div className="hidden lg:flex flex-col justify-between bg-brand-gradient p-10 text-white">
        <Brand size={36} variant="light" />
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

          {/* Onglets Connexion / Créer un compte */}
          {!sent && (
            <div className="seg mb-6 w-full">
              <button
                type="button"
                onClick={() => { setMode("signin"); setError(null); }}
                className={`flex-1 rounded-md px-3 py-1.5 text-sm font-semibold transition-colors ${
                  isSignin ? "bg-white shadow text-ink" : "text-muted hover:text-ink"
                }`}
              >
                Connexion
              </button>
              <button
                type="button"
                onClick={() => { setMode("signup"); setError(null); }}
                className={`flex-1 rounded-md px-3 py-1.5 text-sm font-semibold transition-colors ${
                  isSignup ? "bg-white shadow text-ink" : "text-muted hover:text-ink"
                }`}
              >
                Créer un compte
              </button>
            </div>
          )}

          <h1 className="text-2xl font-bold">
            {isMagic ? "Lien magique" : isSignup ? "Rejoindre le groupe" : "Bon retour"}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {isMagic
              ? "On t'envoie un lien par email, sans mot de passe."
              : isSignup
              ? "Crée ton compte pour accéder au tableau de bord."
              : "Connecte-toi avec ton email et ton mot de passe."}
          </p>

          {sent ? (
            <div className="card-p mt-6 space-y-2">
              <p className="text-sm font-semibold">
                {isSignup ? "✉️ Vérifie ta boîte mail" : "✉️ Lien envoyé !"}
              </p>
              <p className="text-sm text-muted">
                Un email a été envoyé à <strong>{email}</strong>.{" "}
                {isSignup
                  ? "Clique sur le lien pour confirmer ton compte."
                  : "Clique sur le lien pour entrer directement."}
              </p>
              <button
                type="button"
                onClick={() => { setSent(false); setMode("signin"); }}
                className="btn w-full mt-2"
              >
                Retour à la connexion
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-3">
              {isSignup && (
                <div>
                  <label className="label">Pseudo (affiché dans le groupe)</label>
                  <input
                    type="text"
                    value={pseudo}
                    onChange={(e) => setPseudo(e.target.value)}
                    placeholder="Ex : Alex"
                    className="input mt-1"
                    maxLength={40}
                  />
                </div>
              )}
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
              {!isMagic && (
                <div>
                  <label className="label">Mot de passe</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isSignup ? "6 caractères minimum" : "••••••••"}
                    className="input mt-1"
                    minLength={6}
                  />
                </div>
              )}

              <button type="submit" disabled={loading} className="btn btn-primary w-full mt-1">
                {loading
                  ? "Chargement…"
                  : isMagic
                  ? "Envoyer le lien"
                  : isSignup
                  ? "Créer mon compte"
                  : "Se connecter"}
              </button>

              {error && <p className="text-sm text-danger">{error}</p>}

              {/* Lien vers magic link (mot de passe oublié) */}
              {!isMagic && (
                <p className="text-center text-xs text-muted pt-1">
                  <button
                    type="button"
                    onClick={() => { setMode("magic"); setError(null); }}
                    className="underline hover:text-ink"
                  >
                    {isSignin ? "Mot de passe oublié ? Connexion par lien email" : "Recevoir un lien d'inscription par email"}
                  </button>
                </p>
              )}
              {isMagic && (
                <p className="text-center text-xs text-muted pt-1">
                  <button
                    type="button"
                    onClick={() => { setMode("signin"); setError(null); }}
                    className="underline hover:text-ink"
                  >
                    ← Retour à la connexion par mot de passe
                  </button>
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
