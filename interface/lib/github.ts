import type { AiFundFile, Calibration, ConvictionsFile, CryptoFile, Decision, DecisionsFile, GrokPulseFile, MarketSignals } from "./types";

const GH_REPO = process.env.GITHUB_REPO || "ClemRulles/comptoir-engine";
const GH_BRANCH = process.env.GITHUB_BRANCH || "claude/memory";

// Jeton(s) de lecture : on essaie GITHUB_TOKEN puis, en repli, GITHUB_WRITE_TOKEN.
// Robustesse : si le token de lecture est expiré/absent, on bascule sur le token
// d'écriture (valide) → les lectures (book IA, signaux, pouls…) ne tombent jamais à vide
// pour un simple souci de jeton. Dédoublonné.
function readTokens(): string[] {
  return [process.env.GITHUB_TOKEN, process.env.GITHUB_WRITE_TOKEN].filter(
    (t, i, a): t is string => Boolean(t) && a.indexOf(t) === i
  );
}

// Lit un fichier texte du repo privé via l'API GitHub.
// `ref` optionnel : un SHA de commit pour lire une VERSION PASSÉE du fichier
// (sinon la branche runtime). Sert à la navigation par semaine (historique).
export async function fetchRepoFile(path: string, ref?: string): Promise<string | null> {
  const tokens = readTokens();
  if (!tokens.length) return null;

  const url = `https://api.github.com/repos/${GH_REPO}/contents/${path}?ref=${ref || GH_BRANCH}`;
  for (const token of tokens) {
    try {
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.raw+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
        cache: "no-store",
      });
      if (res.ok) return await res.text();
      if (res.status === 404) return null; // fichier absent : inutile d'insister
      // 401/403 (jeton invalide/expiré) → on tente le token suivant
    } catch {
      // réseau : on tente le token suivant
    }
  }
  return null;
}

export interface FileCommit {
  sha: string;
  date: string; // ISO
  message: string;
}

// Liste les commits qui ont touché un fichier (les plus récents d'abord).
// Chaque run hebdomadaire d'une routine = un commit → sert d'ancre « semaine ».
export async function fetchFileCommits(path: string, perPage = 14): Promise<FileCommit[]> {
  const tokens = readTokens();
  if (!tokens.length) return [];

  const url = `https://api.github.com/repos/${GH_REPO}/commits?path=${encodeURIComponent(
    path
  )}&sha=${GH_BRANCH}&per_page=${perPage}`;
  for (const token of tokens) {
    try {
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
        cache: "no-store",
      });
      if (!res.ok) {
        if (res.status === 404) return [];
        continue; // jeton invalide → suivant
      }
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
      // réseau : on tente le token suivant
    }
  }
  return [];
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

// Radar crypto (CoinGecko + Fear & Greed), écrit par la routine du lundi.
export async function fetchCrypto(): Promise<CryptoFile | null> {
  const raw = await fetchRepoFile("memory/fund/crypto.json");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CryptoFile;
  } catch {
    return null;
  }
}

// Convictions de l'IA (verdicts du deep-dive du mercredi).
export async function fetchConvictions(): Promise<ConvictionsFile | null> {
  const raw = await fetchRepoFile("memory/fund/convictions.json");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ConvictionsFile;
  } catch {
    return null;
  }
}
