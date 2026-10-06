// registry.ts — les modules publiés. Pour en ajouter un : déposer le JSON reçu (validé dans
// Apprendre → Aperçu) dans content/modules/<slug>.json, puis l'ajouter à RAW avec sa date.
import { parseModule, type LearnModule } from "./module";
// import tulipes from "@/content/modules/bulle-des-tulipes.json";

export type Published = LearnModule & { publie: string };

const RAW: { slug: string; publie: string; data: unknown }[] = [
  // { slug: "bulle-des-tulipes", publie: "2026-10-07", data: tulipes },
];

export const MODULES: Published[] = RAW.flatMap((r) => {
  const { module } = parseModule(r.data, r.slug);
  return module ? [{ ...module, publie: r.publie }] : [];
}).sort((a, b) => b.publie.localeCompare(a.publie));

export const getModule = (slug: string) => MODULES.find((m) => m.slug === slug) ?? null;
