// insights.ts — tout ce qui rend la pensée de l'IA LISIBLE : règles du mandat (miroir du
// moteur), fenêtres de décision, catégories d'actualité, et nettoyage du jargon interne pour
// les données écrites avant que les routines ne produisent leurs versions « en clair ».
import type { Sleeve } from "./types";

// ── Mandat (miroir de MANDATE / sleeveTargets dans engine/lib/calc.js) ──────────────────
export const SLEEVES: Sleeve[] = ["coeur", "socle", "tactique", "crypto"];

export const SLEEVE_META: Record<Sleeve | "cash", { label: string; short: string; desc: string; color: string }> = {
  coeur: { label: "Convictions long terme", short: "Cœur", desc: "Entreprises choisies une à une, gardées 3-5 ans tant que la thèse tient.", color: "#15803d" },
  socle: { label: "Socle indiciel", short: "Socle", desc: "ETF larges : l'exposition au marché en attendant de meilleures idées.", color: "#2563eb" },
  tactique: { label: "Coups court terme", short: "Tactique", desc: "Paris datés sur un événement, avec date de sortie et stop.", color: "#d97706" },
  crypto: { label: "Crypto", short: "Crypto", desc: "Bitcoin et Ether d'abord, construite par paliers.", color: "#9333ea" },
  cash: { label: "Réserve de tir", short: "Cash", desc: "10 % gardés pour saisir les occasions.", color: "#94a3b8" },
};

const BASE = { coeur: 0.6, socle: 0.12, tactique: 0.1, crypto: 0.08 };
const BANDS: Record<Sleeve | "cash", [number, number]> = {
  coeur: [0.45, 0.75], socle: [0, 0.2], tactique: [0, 0.15], crypto: [0, 0.1], cash: [0.05, 0.15],
};
const TILT: Record<string, { crypto: number; tactique: number }> = {
  "RISK-ON SAIN": { crypto: 0.08, tactique: 0.1 },
  NORMAL: { crypto: 0.06, tactique: 0.1 },
  SURCHAUFFE: { crypto: 0.05, tactique: 0.08 },
  STRESS: { crypto: 0.03, tactique: 0.05 },
};

export function sleeveTargets(regime?: string | null): Record<Sleeve | "cash", number> {
  const t = TILT[String(regime ?? "").toUpperCase()] ?? TILT.NORMAL;
  const freed = BASE.crypto - t.crypto + (BASE.tactique - t.tactique);
  const toSocle = Math.min(freed, BANDS.socle[1] - BASE.socle);
  return {
    coeur: BASE.coeur + freed - toSocle,
    socle: BASE.socle + toSocle,
    tactique: t.tactique,
    crypto: t.crypto,
    cash: 0.1,
  };
}
export const sleeveBand = (s: Sleeve | "cash") => BANDS[s];

const ETF = new Set(["IWDA", "IWDA.AS", "EUNL", "EUNL.DE", "VWCE", "VWCE.DE", "VWRL", "CSPX", "SXR8", "SPY", "VOO", "QQQ", "EIMI", "EIMI.L", "CI2", "CI2.MI", "MEUD", "PAEEM", "IS3N", "XDWD", "SMH", "URA", "ICLN"]);
export const isCrypto = (t: string) => /^[A-Z0-9]{2,10}-(EUR|USD|USDT)$/i.test(t);

export function inferSleeve(p: { ticker: string; sleeve?: string; horizon?: string; thesis_id?: string }): Sleeve {
  if (p.sleeve && (SLEEVES as string[]).includes(p.sleeve)) return p.sleeve as Sleeve;
  const t = p.ticker.toUpperCase();
  if (isCrypto(t)) return "crypto";
  if (ETF.has(t) || p.thesis_id === "residu-indiciel" || p.thesis_id === "socle-indiciel") return "socle";
  if (p.horizon === "tactique") return "tactique";
  return "coeur";
}

export const DESK_LABEL: Record<string, string> = {
  "desk-tech": "Desk Tech",
  "desk-sante": "Desk Santé",
  "desk-industrie-energie": "Desk Industrie & Énergie",
  "desk-finance": "Desk Finance",
  "desk-conso": "Desk Conso",
  "desk-macro": "Desk Macro",
  "desk-crypto": "Desk Crypto",
  "desk-tactique": "Desk Tactique",
};

// ── Régime de marché, en clair ─────────────────────────────────────────────────────
export const REGIME_PLAIN: Record<string, { label: string; tone: "offensif" | "neutre" | "defensif"; line: string }> = {
  "RISK-ON SAIN": { label: "Marché porteur", tone: "offensif", line: "Croissance correcte, inflation sous contrôle : on reste pleinement investi." },
  NORMAL: { label: "Marché normal", tone: "neutre", line: "Quelques signaux de tension : investi, mais on choisit avec soin." },
  SURCHAUFFE: { label: "Marché qui chauffe", tone: "neutre", line: "Inflation et taux élevés : on reste investi mais on n'achète qu'avec une vraie marge de sécurité." },
  STRESS: { label: "Marché sous stress", tone: "defensif", line: "Tensions fortes : on protège, et la réserve de cash sert à acheter les bonnes affaires soldées." },
};
export function regimePlain(label?: string | null) {
  return REGIME_PLAIN[String(label ?? "").toUpperCase()] ?? { label: label || "Régime inconnu", tone: "neutre" as const, line: "Pas de lecture macro disponible cette semaine." };
}

// ── Fenêtres de décision (miroir de routines/ et method §H) ──────────────────────────
export interface DecisionWindow {
  dow: number; // 0 = dimanche … 6 = samedi (getDay)
  day: string;
  title: string;
  what: string;
  buys: boolean;
  sells: boolean;
}
export const WINDOWS: DecisionWindow[] = [
  { dow: 1, day: "Lun", title: "Radar", what: "Régime, tendance, actualité mondiale, 13F des pros", buys: false, sells: false },
  { dow: 2, day: "Mar", title: "Scout", what: "Les desks cherchent des idées", buys: false, sells: false },
  { dow: 3, day: "Mer", title: "Débat + coups", what: "Débat à 3 voix, zones d'achat, achats tactiques datés", buys: true, sells: false },
  { dow: 4, day: "Jeu", title: "Défense", what: "Ventes si une thèse casse, suivi des résultats", buys: false, sells: true },
  { dow: 5, day: "Ven", title: "Fenêtre principale", what: "Achats long terme dans leur zone, rééquilibrage", buys: true, sells: true },
  { dow: 6, day: "Sam", title: "Repos", what: "Pas de routine", buys: false, sells: false },
  { dow: 0, day: "Dim", title: "Crypto", what: "Paliers crypto, achats en peur extrême, stops", buys: true, sells: true },
];
// Les routines tournent la NUIT (≈ 23 h Paris) : la fenêtre du jour J s'exécute le soir de J.
export function nextBuyWindow(now = new Date()): { window: DecisionWindow; inDays: number } {
  for (let k = 0; k < 7; k++) {
    const d = (now.getDay() + k) % 7;
    const w = WINDOWS.find((x) => x.dow === d)!;
    if (w.buys) return { window: w, inDays: k };
  }
  return { window: WINDOWS[4], inDays: 0 };
}

// ── Actualité ───────────────────────────────────────────────────────────────────────
export const NEWS_CATEGORY: Record<string, { label: string; cls: string }> = {
  "politique-us": { label: "Politique US", cls: "bg-sky-500/10 text-sky-600 dark:text-sky-400" },
  geopolitique: { label: "Géopolitique", cls: "bg-rose-500/10 text-rose-600 dark:text-rose-400" },
  "banques-centrales": { label: "Banques centrales", cls: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" },
  macro: { label: "Macro", cls: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400" },
  entreprises: { label: "Entreprises", cls: "bg-brand/10 text-brand-600 dark:text-brand-500" },
  energie: { label: "Énergie", cls: "bg-amber-500/10 text-amber-700 dark:text-amber-400" },
  crypto: { label: "Crypto", cls: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
  regulation: { label: "Régulation", cls: "bg-teal-500/10 text-teal-700 dark:text-teal-400" },
  investisseurs: { label: "Investisseurs pros", cls: "bg-orange-500/10 text-orange-600 dark:text-orange-400" },
};

// ── Nettoyage du jargon (repli tant que les routines n'écrivent pas de version claire) ──
const JARGON: [RegExp, string][] = [
  [/\[P-\d{3}\]|\(P-\d{3}[^)]*\)|P-\d{3}/g, ""],
  [/§[A-N](?:\/§?[A-N])*/g, ""],
  [/[🟢🟠🔴⚪✓✅⚠️❌★]/gu, ""],
  [/\bgate\s*[+-]?\d[.,]\d+/gi, ""],
  [/\bcov\s?\d+%/gi, ""],
  [/\bF(\d)\/9\b/g, "fondamentaux $1/9"],
  [/\bRSI\s?(\d+[.,]?\d*)/g, "RSI $1"],
  [/\bsaisine\b/gi, "réexamen"],
  [/\bhystérésis\b/gi, "règle anti-allers-retours"],
  [/\bDÉTENU \(GARDER\)\s*[—-]\s*/g, ""],
  [/\bDeep-dive \d{2}\/\d{2}\s*[—-]\s*/gi, ""],
];
export function dejargon(text?: string | null): string {
  if (!text) return "";
  let t = text;
  for (const [re, rep] of JARGON) t = t.replace(re, rep);
  return t.replace(/\(\s*\)/g, "").replace(/\s{2,}/g, " ").replace(/\s+([,.])/g, "$1").trim();
}

// Première phrase utile, coupée proprement à `max` caractères.
export function firstSentence(text?: string | null, max = 160): string {
  const t = dejargon(text);
  if (!t) return "";
  const m = t.match(/^(.+?[.!?])(\s|$)/);
  let s = (m ? m[1] : t).trim();
  if (s.length > max) {
    const cut = s.slice(0, max);
    s = cut.slice(0, Math.max(cut.lastIndexOf(" "), max * 0.6)).replace(/[,;:—–-]\s*$/, "") + "…";
  }
  return s;
}

export const ACTION_LABEL: Record<string, { label: string; cls: string }> = {
  achat: { label: "Achat", cls: "bg-brand/10 text-brand-600 dark:text-brand-500" },
  renforcement: { label: "Renforce", cls: "bg-brand/10 text-brand-600 dark:text-brand-500" },
  vente: { label: "Vente", cls: "bg-danger/10 text-danger" },
  allegement: { label: "Allège", cls: "bg-danger/10 text-danger" },
  conserver: { label: "Garde", cls: "bg-slate-500/10 text-slate-600" },
  surveiller: { label: "Surveille", cls: "bg-ai/10 text-amber-700 dark:text-ai" },
};

export const fmtDay = (d?: string | null) => {
  const m = String(d ?? "").match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return d ?? "";
  const months = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
  return `${Number(m[3])} ${months[Number(m[2]) - 1]}`;
};
