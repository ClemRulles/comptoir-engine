import type { AiFundFile, Calibration, Decision, DecisionsFile, GrokPulseFile, MarketSignals } from "./types";

// Lit un fichier texte du repo privé via l'API GitHub (token lecture seule).
export async function fetchRepoFile(path: string): Promise<string | null> {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO || "ClemRulles/comptoir-engine";
  const branch = process.env.GITHUB_BRANCH || "claude/memory";
  if (!token) return null;

  try {
    const url = `https://api.github.com/repos/${repo}/contents/${path}?ref=${branch}`;
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

// Pouls hebdo du marché (Grok/X), écrit par la routine du lundi.
export async function fetchGrokPulse(): Promise<GrokPulseFile | null> {
  const raw = await fetchRepoFile("memory/grok-pulse.json");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as GrokPulseFile;
  } catch {
    return null;
  }
}
