import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/AppShell";
import { AmbientBackground } from "@/components/AmbientBackground";
import { isConfigured } from "@/lib/data";

// Inter (variable) : chiffres tabulaires et lisibilité des petits corps — la DA reste la même
// (vert HypeInvest, ambre IA, navy en sombre), la typo gagne en netteté.
const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-sans" });

// Applique le thème mémorisé AVANT le rendu (évite le flash clair→sombre).
const THEME_INIT = `(function(){try{var t=localStorage.getItem('theme');if(t==='dark')document.documentElement.classList.add('dark');}catch(e){}})();`;

export const metadata: Metadata = {
  title: "HypeInvest — Groupe vs IA",
  description:
    "Suivi du fonds commun et du fonds fictif géré par l'IA. Paper trading — aucun ordre réel.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "HypeInvest",
    // "default" : la barre d'état iOS reste opaque et le contenu démarre EN DESSOUS
    // (évite que l'heure/batterie chevauchent le header en mode plein écran PWA).
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#101f32",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const demo = !isConfigured();
  return (
    <html lang="fr" suppressHydrationWarning className={inter.variable}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
      </head>
      <body className="min-h-screen bg-bg font-sans text-ink antialiased">
        <AmbientBackground />
        <AppShell demo={demo}>{children}</AppShell>
      </body>
    </html>
  );
}
