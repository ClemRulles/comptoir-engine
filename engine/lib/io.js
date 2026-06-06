// io.js — lecture/écriture JSON sûres pour les fichiers d'état du fonds.
import { readFileSync, writeFileSync, existsSync, mkdirSync, renameSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
// engine/lib -> racine repo
export const REPO_ROOT = resolve(HERE, "..", "..");
export const FUND_DIR = join(REPO_ROOT, "memory", "fund");

export function fundPath(file) {
  return join(FUND_DIR, file);
}

// Résultat de lecture : { status, data, raw }
//   status: "ok" | "missing" | "corrupt"
export function readJsonSafe(path) {
  if (!existsSync(path)) return { status: "missing", data: null, raw: null };
  let raw;
  try {
    raw = readFileSync(path, "utf8");
  } catch (e) {
    return { status: "corrupt", data: null, raw: null, error: String(e) };
  }
  if (raw.trim() === "") return { status: "corrupt", data: null, raw, error: "fichier vide" };
  try {
    return { status: "ok", data: JSON.parse(raw), raw };
  } catch (e) {
    return { status: "corrupt", data: null, raw, error: String(e) };
  }
}

// Écrit du JSON formaté (2 espaces), avec newline final, en créant le dossier.
export function writeJson(path, obj) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(obj, null, 2) + "\n", "utf8");
}

// Met de côté un fichier corrompu avant de le recréer : <file>.corrupt-<ts>
// Retourne le chemin de sauvegarde, ou null si rien à sauver.
export function quarantine(path) {
  if (!existsSync(path)) return null;
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const dest = `${path}.corrupt-${ts}`;
  try {
    renameSync(path, dest);
    return dest;
  } catch {
    return null;
  }
}
