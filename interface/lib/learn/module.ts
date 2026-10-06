// module.ts — format des « modules de découverte » écrits par les membres (avec leur IA, via le
// prompt de lib/learn/prompt.ts) et lecture tolérante : un JSON imparfait s'affiche quand même,
// et les écarts sont listés (page d'aperçu) au lieu de faire planter la page.
// Aucun HTML n'est jamais interprété : tout est rendu comme du texte par React.

export type Src = { id: string; titre: string; url: string | null; date: string | null };

export type Block = { type: string; [k: string]: unknown };

export interface LearnModule {
  slug: string;
  titre: string;
  auteur: string;
  resume: string;
  niveau: string | null;
  duree: number | null;
  etiquettes: string[];
  ton: string | null;
  emoji: string | null;
  blocs: Block[];
  sources: Src[];
  notes: string | null;
  version: string | null;
}

export const KNOWN_BLOCKS = [
  "texte", "citation", "saviez_vous", "attention", "chiffre_cle",
  "chronologie", "schema", "tableau", "comparaison", "graphique", "liste", "vocabulaire",
  "exemple", "temoignage", "faq",
  "quiz", "vrai_faux", "cartes",
  "lien", "libre",
] as const;

export const TAGS = ["bases", "bourse", "crypto", "immobilier", "budget", "histoire", "psychologie", "fiscalité", "entreprise", "risque", "métiers"];

const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);

export const str = (v: unknown): string => (typeof v === "string" ? v.trim() : typeof v === "number" ? String(v) : "");
export const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
export const strs = (v: unknown): string[] => arr(v).map(str).filter(Boolean);

// Nombre lisible depuis « 1 234,5 », « 12 % », 12.5… (graphiques). null si illisible.
export function num(v: unknown): number | null {
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  const s = str(v).replace(/[\s  ]/g, "").replace(",", ".").replace(/[^0-9.+-]/g, "");
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

// Seuls les liens http(s) sont cliquables (jamais javascript:, data:…).
export function safeUrl(v: unknown): string | null {
  const s = str(v);
  if (!s) return null;
  try {
    const u = new URL(s);
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : null;
  } catch {
    return null;
  }
}

export function slugify(s: string): string {
  return (
    s
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "module"
  );
}

// Accepte le JSON complet { module, sources, … } ou directement l'objet module.
export function parseModule(raw: unknown, slug?: string): { module: LearnModule | null; issues: string[] } {
  const issues: string[] = [];
  if (!isObj(raw)) return { module: null, issues: ["Le contenu n'est pas un objet JSON."] };
  const m = isObj(raw.module) ? raw.module : raw;

  const titre = str(m.titre);
  const auteur = str(m.auteur);
  const resume = str(m.resume);
  if (!titre) issues.push("Champ obligatoire manquant : titre.");
  if (!auteur) issues.push("Champ obligatoire manquant : auteur.");
  if (!resume) issues.push("Champ obligatoire manquant : resume.");

  const blocs: Block[] = [];
  arr(m.blocs).forEach((b, i) => {
    if (!isObj(b) || !str(b.type)) {
      issues.push(`Bloc ${i + 1} ignoré : pas de champ « type ».`);
      return;
    }
    const type = str(b.type);
    if (!(KNOWN_BLOCKS as readonly string[]).includes(type)) issues.push(`Bloc ${i + 1} : forme nouvelle « ${type} », affichée telle quelle pour l'instant (Clément pourra lui créer un rendu sur mesure).`);
    blocs.push({ ...b, type });
  });
  if (!blocs.length) issues.push("Champ obligatoire manquant : blocs (au moins un).");
  else if (blocs.length > 25) issues.push(`${blocs.length} blocs : le prompt en demande 25 au plus.`);

  const sources: Src[] = arr(raw.sources ?? m.sources)
    .filter(isObj)
    .map((s, i) => ({ id: str(s.id) || `s${i + 1}`, titre: str(s.titre) || "Source", url: safeUrl(s.url), date: str(s.date_consultee) || null }));
  const ids = new Set(sources.map((s) => s.id));
  const cited = new Set<string>();
  JSON.stringify(blocs, (k, v) => {
    if (k === "source_id" && typeof v === "string") cited.add(v);
    return v;
  });
  for (const id of cited) if (!ids.has(id)) issues.push(`source_id « ${id} » cité mais absent de la liste des sources.`);

  const etiquettes = strs(m.etiquettes).map((t) => t.toLowerCase()).slice(0, 3);
  for (const t of etiquettes) if (!TAGS.includes(t)) issues.push(`Nouvelle étiquette « ${t} » : gardée, Clément décidera de l'ajouter à la liste.`);

  const module: LearnModule = {
    slug: slug ?? slugify(titre),
    titre: titre || "Module sans titre",
    auteur: auteur || "Anonyme",
    resume,
    niveau: str(m.niveau) || null,
    duree: num(m.duree_lecture_min),
    etiquettes,
    ton: str(m.ton) || null,
    emoji: str(m.emoji) || null,
    blocs,
    sources,
    notes: str(raw.notes_pour_clement) || null,
    version: str(raw.version_prompt) || null,
  };
  return { module, issues };
}

// Durée affichée : celle annoncée, sinon une estimation (~200 mots/min, 1 min mini).
export function readingMinutes(m: LearnModule): number {
  if (m.duree && m.duree > 0) return Math.round(m.duree);
  const words = JSON.stringify(m.blocs).split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}
