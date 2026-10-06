// registry.ts — les modules publiés. Pour en ajouter un : déposer le JSON reçu (validé dans
// Apprendre → Aperçu) dans content/modules/<slug>.json, l'ajouter à RAW avec sa date, et lui
// donner son habillage (`look` : accent, image de couverture libre de droits). Voir
// content/modules/README.md : chaque nouveau module a droit à une vraie passe visuelle.
import { parseModule, type LearnModule, type Look } from "./module";
import aubergeAppli from "@/content/modules/de-l-auberge-a-l-appli.json";

export type Published = LearnModule & { publie: string };

const RAW: { slug: string; publie: string; data: unknown; look?: Look }[] = [
  {
    slug: "de-l-auberge-a-l-appli",
    publie: "2026-10-06",
    data: aubergeAppli,
    look: {
      accent: "vert",
      cover: {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Huis_ter_Beurze.JPG/1280px-Huis_ter_Beurze.JPG",
        credit: "Photo : Chivista, CC BY-SA 3.0",
        page: "https://commons.wikimedia.org/wiki/File:Huis_ter_Beurze.JPG",
        position: "center 30%",
      },
    },
  },
];

export const MODULES: Published[] = RAW.flatMap((r) => {
  const { module } = parseModule(r.data, r.slug);
  return module ? [{ ...module, publie: r.publie, look: r.look }] : [];
}).sort((a, b) => b.publie.localeCompare(a.publie));

export const getModule = (slug: string) => MODULES.find((m) => m.slug === slug) ?? null;
