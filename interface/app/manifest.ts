import type { MetadataRoute } from "next";

// Manifest PWA — permet « Ajouter à l'écran d'accueil » avec le bon nom, la bonne
// icône et un lancement plein écran (sans la barre d'adresse Safari).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "HypeInvest — Groupe vs IA",
    short_name: "HypeInvest",
    description: "Suivi du fonds commun et du fonds fictif géré par l'IA. Paper trading.",
    start_url: "/",
    display: "standalone",
    background_color: "#101f32",
    theme_color: "#101f32",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
