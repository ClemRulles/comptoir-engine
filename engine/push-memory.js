#!/usr/bin/env node
// push-memory.js — PERSISTE la mémoire quand `git push` est bloqué (sandbox cloud en
// lecture seule sur GitHub : push + MCP GitHub → 403). Au lieu de pousser, on POSTe les
// fichiers `memory/` modifiés à l'endpoint Vercel `/api/memory/push`, qui les commite sur
// `claude/memory` (Vercel a un token d'écriture). La routine sait faire du HTTP → ça marche.
//
// Usage (dernière étape de chaque routine, APRÈS le commit local) :
//   node engine/push-memory.js "trend-radar: 2026-06-09 — …"
//
// Env requis (dans l'environnement de la routine) :
//   MEMORY_PUSH_URL  = https://<app>.vercel.app/api/memory/push
//   CRON_SECRET      = le même secret que côté Vercel (authorizeMaintenance)
//
// Ne bloque jamais la routine : en cas d'échec, log clair + exit 0 (le commit local existe
// déjà, on pourra rejouer). Mais il IMPRIME le résultat pour qu'on voie si ça a persisté.

import { execSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// Liste de repli = tous les fichiers mémoire qu'une routine peut écrire.
const CURATED = [
  "memory/market-regime.md",
  "memory/trends.md",
  "memory/catalysts.md",
  "memory/watchlist.md",
  "memory/grok-pulse.json",
  "memory/lessons.md",
  "memory/portfolio.md",
  "memory/fund/ai-fund.json",
  "memory/fund/decisions.json",
  "memory/fund/calibration.json",
  "memory/fund/signals.json",
  "memory/fund/crypto.json",
];

// Fichiers modifiés par le dernier commit local (ce que la routine vient d'écrire).
function changedFiles() {
  try {
    const out = execSync("git diff-tree --no-commit-id --name-only -r HEAD", {
      cwd: REPO_ROOT,
      encoding: "utf8",
    });
    return out.split("\n").map((s) => s.trim()).filter((p) => p.startsWith("memory/"));
  } catch {
    return [];
  }
}

async function main() {
  const message = process.argv.slice(2).join(" ").trim() || `memory: maj ${new Date().toISOString().slice(0, 10)}`;
  const url = process.env.MEMORY_PUSH_URL;
  const secret = process.env.CRON_SECRET;

  if (!url || !secret) {
    console.error("push-memory: MEMORY_PUSH_URL ou CRON_SECRET absent → mémoire NON persistée (commit local seulement).");
    process.exit(0);
  }

  const paths = (changedFiles().length ? changedFiles() : CURATED).filter((p) => existsSync(resolve(REPO_ROOT, p)));
  if (!paths.length) {
    console.error("push-memory: aucun fichier memory/ à pousser.");
    process.exit(0);
  }

  const files = paths.map((p) => ({ path: p, content: readFileSync(resolve(REPO_ROOT, p), "utf8") }));

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${secret}` },
      body: JSON.stringify({ message, files }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.ok) {
      console.error(`push-memory: ÉCHEC (${res.status}) ${json.error ?? ""} → mémoire NON persistée.`);
      process.exit(0);
    }
    console.log(`push-memory: ✅ ${files.length} fichier(s) commités sur ${json.branch} (${json.commit?.slice(0, 7)}).`);
  } catch (e) {
    console.error(`push-memory: exception ${String(e)} → mémoire NON persistée.`);
    process.exit(0);
  }
}

main();
