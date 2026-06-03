import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/AppShell";
import { isConfigured } from "@/lib/data";

export const metadata: Metadata = {
  title: "HypeInvest — Groupe vs IA",
  description:
    "Suivi du fonds commun et du fonds fictif géré par l'IA. Paper trading — aucun ordre réel.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const demo = !isConfigured();
  return (
    <html lang="fr">
      <body className="min-h-screen bg-bg text-ink antialiased">
        <AppShell demo={demo}>{children}</AppShell>
      </body>
    </html>
  );
}
