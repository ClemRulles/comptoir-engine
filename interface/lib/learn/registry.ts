// registry.ts — les modules publiés. Pour en ajouter un : déposer le JSON reçu (validé dans
// Apprendre → Aperçu) dans content/modules/<slug>.json, puis l'ajouter à RAW avec sa date.
import { parseModule, type LearnModule } from "./module";
import aubergeAppli from "@/content/modules/de-l-auberge-a-l-appli.json";

export type Published = LearnModule & { publie: string };

const RAW: { slug: string; publie: string; data: unknown }[] = [
  { slug: "de-l-auberge-a-l-appli", publie: "2026-10-06", data: aubergeAppli },
];

export const MODULES: Published[] = RAW.flatMap((r) => {
  const { module } = parseModule(r.data, r.slug);
  return module ? [{ ...module, publie: r.publie }] : [];
}).sort((a, b) => b.publie.localeCompare(a.publie));

export const getModule = (slug: string) => MODULES.find((m) => m.slug === slug) ?? null;
