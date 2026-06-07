import type { AiFundFile, Calibration, Decision, DecisionsFile, MarketSignals } from "./types";

const GH_REPO = process.env.GITHUB_REPO || "ClemRulles/comptoir-engine";
const GH_BRANCH = process.env.GITHUB_BRANCH || "claude/memory";

// Lit un fichier texte du repo privé via l'API GitHub (token lecture seule).
// `ref` optionnel : un SHA de commit pour lire une VERSION PASSÉE du fichier
// (sinon la branche runtime). Sert à la navigation par semaine (historique).
export async function fetchRepoFile(path: string, ref?: string): Promise<string | null> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return null;

  try {
    const url = `https://api.github.com/repos/${GH_REPO}/contents/${path}?ref=${ref || GH_BRANCH}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.raw+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

export interface FileCommit {
  sha: string;
  date: string; // ISO
  message: string;
}

// Liste les commits qui ont touché un fichier (les plus récents d'abord).
// Chaque run hebdomadaire d'une routine = un commit → sert d'ancre « semaine ».
export async function fetchFileCommits(path: string, perPage = 14): Promise<FileCommit[]> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return [];

  try {
    const url = `https://api.github.com/repos/${GH_REPO}/commits?path=${encodeURIComponent(
      path
    )}&sha=${GH_BRANCH}&per_page=${perPage}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = (await res.json()) as {
      sha: string;
      commit: { message: string; committer?: { date?: string }; author?: { date?: string } };
    }[];
    return (data ?? []).map((c) => ({
      sha: c.sha,
      date: c.commit?.committer?.date ?? c.commit?.author?.date ?? "",
      message: (c.commit?.message ?? "").split("\n")[0],
    }));
  } catch {
    return [];
  }
}

export async function fetchAiFund(): Promise<AiFundFile | null> {
  const raw = await fetchRepoFile("memory/fund/ai-fund.json");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AiFundFile;
  } catch {
    return null;
  }
}

export async function fetchDecisions(): Promise<Decision[] | null> {
  const raw = await fetchRepoFile("memory/fund/decisions.json");
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as DecisionsFile | Decision[];
    return Array.isArray(parsed) ? parsed : parsed.decisions ?? [];
  } catch {
    return null;
  }
}

export async function fetchCalibration(): Promise<Calibration | null> {
  const raw = await fetchRepoFile("memory/fund/calibration.json");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Calibration;
  } catch {
    return null;
  }
}

export async function fetchMemoryMarkdown(file: string): Promise<string | null> {
  return fetchRepoFile(`memory/${file}`);
}

export async function fetchCatalysts(): Promise<string | null> {
  return fetchRepoFile("memory/catalysts.md");
}

// Signaux quantitatifs par titre, produits par le moteur (engine/signals.js).
export async function fetchSignals(): Promise<MarketSignals | null> {
  const raw = await fetchRepoFile("memory/fund/signals.json");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as MarketSignals;
  } catch {
    return null;
  }
}
