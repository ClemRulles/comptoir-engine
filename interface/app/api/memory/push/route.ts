import { NextResponse, type NextRequest } from "next/server";
import { authorizeMaintenance, secretEquals } from "@/lib/cron-auth";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const GH_REPO = process.env.GITHUB_REPO || "ClemRulles/comptoir-engine";
const GH_BRANCH = process.env.GITHUB_BRANCH || "claude/memory";

// Canal d'ÉCRITURE de la mémoire. Les routines cloud tournent dans un sandbox en LECTURE SEULE
// sur GitHub (git push + MCP GitHub → 403) : leur travail ne pouvait jamais atterrir sur
// `claude/memory`. Cet endpoint donne un chemin d'écriture : la routine POSTe ses fichiers
// mémoire (elle sait faire des appels HTTP), et Vercel — qui a un token d'écriture — crée un
// commit sur la branche mémoire via l'API git-data de GitHub.
//
// POST /api/memory/push
//   Authorization: Bearer $CRON_SECRET
//   { "message": "trend-radar: 2026-06-09 …", "files": [{ "path": "memory/…", "content": "…" }] }
//
// Garde-fous : auth maintenance + chemins limités à `memory/` (rien d'autre n'est commitable).
async function gh(method: string, path: string, token: string, body?: unknown) {
  const res = await fetch(`https://api.github.com/repos/${GH_REPO}/${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(`GitHub ${method} ${path} → ${res.status} ${json?.message ?? ""}`);
    (err as Error & { status?: number }).status = res.status;
    throw err;
  }
  return json;
}

// Tokens candidats pour l'écriture, dans l'ordre de préférence, dédoublonnés par VALEUR.
// Piège vécu (09/07 → 07/08/2026, un mois de mémoire perdue) : l'ancien code faisait
// `GITHUB_WRITE_TOKEN || GITHUB_TOKEN` → GITHUB_WRITE_TOKEN gagnait dès qu'il était défini,
// même périmé, et masquait GITHUB_TOKEN pourtant renouvelé et valide. Renouveler une seule des
// deux variables ne réparait donc rien, en silence — pendant que la LECTURE (lib/github.ts,
// qui essaie déjà les deux) continuait de marcher et masquait la panne côté interface.
function writeTokenCandidates(): [string, string][] {
  return (
    [
      ["GITHUB_WRITE_TOKEN", process.env.GITHUB_WRITE_TOKEN],
      ["GITHUB_TOKEN", process.env.GITHUB_TOKEN],
    ] as [string, string | undefined][]
  ).filter((c, i, a): c is [string, string] => Boolean(c[1]) && a.findIndex(([, v]) => v === c[1]) === i);
}

// Une erreur d'AUTORISATION (token périmé, ou valide mais sans Contents:write) justifie de
// réessayer avec le token suivant. Tout le reste (réseau, conflit, 422) est une vraie erreur.
function isAuthError(e: unknown): boolean {
  const s = (e as Error & { status?: number })?.status;
  return s === 401 || s === 403;
}

export async function POST(request: NextRequest) {
  // Auth : secret DÉDIÉ MEMORY_PUSH_SECRET (que les routines envoient), OU la maintenance
  // habituelle (Bearer CRON_SECRET / session connectée). Le secret dédié évite de réutiliser
  // CRON_SECRET (illisible sur Vercel) et limite la portée à l'écriture mémoire.
  const pushSecret = process.env.MEMORY_PUSH_SECRET;
  const auth = request.headers.get("authorization");
  const okDedicated = Boolean(pushSecret) && secretEquals(auth, `Bearer ${pushSecret}`);
  if (!okDedicated && !(await authorizeMaintenance(request))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const candidates = writeTokenCandidates();
  if (!candidates.length) {
    return NextResponse.json(
      { error: "aucun token GitHub configuré (GITHUB_WRITE_TOKEN / GITHUB_TOKEN)", tokenSource: "none" },
      { status: 500 }
    );
  }

  const body = (await request.json().catch(() => null)) as {
    message?: string;
    files?: { path?: string; content?: string }[];
  } | null;

  const files = (body?.files ?? []).filter(
    (f): f is { path: string; content: string } =>
      typeof f?.path === "string" && typeof f?.content === "string"
  );
  if (!files.length) {
    return NextResponse.json({ error: "aucun fichier (files: [{path, content}])" }, { status: 400 });
  }

  // Sécurité : on n'autorise QUE des chemins sous memory/ (pas de traversée, pas de code).
  const bad = files.find((f) => !/^memory\/[^.][^\0]*$/.test(f.path) || f.path.includes(".."));
  if (bad) {
    return NextResponse.json(
      { error: `chemin non autorisé: ${bad.path} (doit être sous memory/)` },
      { status: 400 }
    );
  }

  // Garde-fous de contenu : un fichier mémoire est petit (markdown/JSON de routine).
  // Plafonds larges mais fermes pour qu'un appel mal formé ne commite pas n'importe quoi.
  const MAX_FILES = 24;
  const MAX_FILE_BYTES = 512 * 1024; // 512 Ko par fichier
  if (files.length > MAX_FILES) {
    return NextResponse.json({ error: `trop de fichiers (${files.length} > ${MAX_FILES})` }, { status: 400 });
  }
  const tooBig = files.find((f) => Buffer.byteLength(f.content, "utf8") > MAX_FILE_BYTES);
  if (tooBig) {
    return NextResponse.json(
      { error: `fichier trop volumineux: ${tooBig.path} (max ${MAX_FILE_BYTES / 1024} Ko)` },
      { status: 400 }
    );
  }

  // Un .json invalide commité casserait l'interface en silence (les lecteurs retombent sur
  // la démo). On refuse AVANT de commiter, avec l'erreur de parse pour corriger côté routine.
  for (const f of files) {
    if (!f.path.endsWith(".json")) continue;
    try {
      JSON.parse(f.content);
    } catch (e) {
      return NextResponse.json(
        { error: `JSON invalide: ${f.path} — ${e instanceof Error ? e.message : String(e)}` },
        { status: 400 }
      );
    }
  }

  const message =
    typeof body?.message === "string" && body.message.trim()
      ? body.message.trim()
      : `memory: mise à jour automatique (${new Date().toISOString().slice(0, 10)})`;

  // On tente le flux COMPLET avec chaque token, en basculant sur le suivant à la moindre
  // erreur d'autorisation. Un GET de sonde ne suffirait pas : un token en lecture seule
  // s'authentifie très bien puis échoue au moment d'écrire. Les étapes 1-2 sont idempotentes
  // et un arbre créé sans commit reste un objet orphelin inoffensif — réessayer est sûr.
  const tried: string[] = [];
  let lastError: unknown = null;
  for (const [tokenSource, token] of candidates) {
    tried.push(tokenSource);
    try {
      // 1) tête de branche + arbre de base
      const ref = await gh("GET", `git/ref/heads/${GH_BRANCH}`, token);
      const baseCommitSha = ref.object.sha as string;
      const baseCommit = await gh("GET", `git/commits/${baseCommitSha}`, token);
      const baseTreeSha = baseCommit.tree.sha as string;

      // 2) nouvel arbre (contenu inline → pas d'appel blob séparé)
      const newTree = await gh("POST", "git/trees", token, {
        base_tree: baseTreeSha,
        tree: files.map((f) => ({ path: f.path, mode: "100644", type: "blob", content: f.content })),
      });

      // 3) commit + 4) avance la branche
      const commit = await gh("POST", "git/commits", token, {
        message,
        tree: newTree.sha,
        parents: [baseCommitSha],
      });
      await gh("PATCH", `git/refs/heads/${GH_BRANCH}`, token, { sha: commit.sha });

      return NextResponse.json({
        ok: true,
        branch: GH_BRANCH,
        commit: commit.sha,
        files: files.map((f) => f.path),
        tokenSource,
      });
    } catch (e) {
      lastError = e;
      if (!isAuthError(e)) break; // vraie erreur (réseau, conflit) : changer de token n'aiderait pas
      // 401/403 : token périmé ou sans Contents:write → on tente le candidat suivant
    }
  }

  return NextResponse.json(
    {
      error: String(lastError),
      tried,
      hint: isAuthError(lastError)
        ? "Tous les tokens ont échoué en autorisation : PAT expiré, ou sans permission Contents:write sur le dépôt."
        : undefined,
    },
    { status: 502 }
  );
}
