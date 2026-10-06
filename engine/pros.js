#!/usr/bin/env node
// pros.js — CE QUE FONT LES INVESTISSEURS PROS, sur données officielles SEC (13F-HR).
//
// Usage (lundi, Trend Radar) :   node engine/pros.js        (--force pour ignorer le cache)
//
// Pour chaque gérant suivi : les deux dernières déclarations 13F-HR (EDGAR, gratuit, sans clé),
// le portefeuille courant (top 10) et les mouvements du trimestre (nouvelles lignes, sorties,
// renforcements/allègements > 20 %). Écrit memory/fund/pros.json.
//
// Ce que c'est : une photo trimestrielle officielle, publiée ~45 jours après la fin du
// trimestre, limitée aux actions US détenues en direct. Ce que ce n'est PAS : un signal
// d'achat. Un gérant achète pour SON mandat ; on s'en sert comme d'une idée à instruire
// (desk + débat §D), jamais comme d'une preuve (method §F, discipline des sources).

import { readJsonSafe, writeJson, fundPath } from "./lib/io.js";
import { SEC_UA } from "./lib/sources.js";
import { parseInfoTable, diffHoldings } from "./lib/thirteenf.js";
import { TODAY } from "./lib/schema.js";

export const INVESTORS = [
  { cik: "0001067983", investor: "Warren Buffett", fund: "Berkshire Hathaway", style: "valeur, très long terme" },
  { cik: "0001336528", investor: "Bill Ackman", fund: "Pershing Square", style: "concentré, activiste" },
  { cik: "0001536411", investor: "Stanley Druckenmiller", fund: "Duquesne Family Office", style: "macro, opportuniste" },
  { cik: "0001656456", investor: "David Tepper", fund: "Appaloosa", style: "contrarien, cycle" },
  { cik: "0001061768", investor: "Seth Klarman", fund: "Baupost Group", style: "valeur, marge de sécurité" },
  { cik: "0001709323", investor: "Li Lu", fund: "Himalaya Capital", style: "valeur, très concentré" },
  { cik: "0001040273", investor: "Dan Loeb", fund: "Third Point", style: "événementiel, activiste" },
  { cik: "0001350694", investor: "Ray Dalio", fund: "Bridgewater Associates", style: "macro systématique" },
  { cik: "0001697748", investor: "Cathie Wood", fund: "ARK Invest", style: "croissance disruptive" },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function get(url, kind = "json") {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 15000);
      const res = await fetch(url, { signal: ctrl.signal, headers: { "User-Agent": SEC_UA, Accept: kind === "json" ? "application/json" : "application/xml" } });
      clearTimeout(t);
      await sleep(150); // politique fair-access de la SEC (≤ 10 req/s)
      if (!res.ok) return null;
      return kind === "json" ? await res.json() : await res.text();
    } catch {
      await sleep(500);
    }
  }
  return null;
}

async function loadFiling(cikNum, accession) {
  const folder = accession.replace(/-/g, "");
  const idx = await get(`https://www.sec.gov/Archives/edgar/data/${cikNum}/${folder}/index.json`);
  const items = idx?.directory?.item ?? [];
  // La table d'information est le XML qui n'est pas le formulaire principal (le plus gros).
  const xmls = items.filter((i) => /\.xml$/i.test(i.name) && !/primary_doc/i.test(i.name));
  xmls.sort((a, b) => (Number(b.size) || 0) - (Number(a.size) || 0));
  if (!xmls.length) return null;
  const xml = await get(`https://www.sec.gov/Archives/edgar/data/${cikNum}/${folder}/${xmls[0].name}`, "text");
  const rows = parseInfoTable(xml);
  return rows.length ? rows : null;
}

async function main() {
  const force = process.argv.includes("--force");
  const path = fundPath("pros.json");
  const prev = readJsonSafe(path).data ?? {};
  const prevBy = new Map((prev.investors ?? []).map((i) => [i.cik, i]));
  const out = [];
  const gaps = [];

  for (const inv of INVESTORS) {
    const sub = await get(`https://data.sec.gov/submissions/CIK${inv.cik}.json`);
    const r = sub?.filings?.recent;
    if (!r) {
      gaps.push(`${inv.fund}: soumissions EDGAR indisponibles`);
      if (prevBy.has(inv.cik)) out.push(prevBy.get(inv.cik));
      continue;
    }
    const idx = r.form.map((f, i) => (f === "13F-HR" ? i : -1)).filter((i) => i >= 0).slice(0, 2);
    if (idx.length < 1) {
      gaps.push(`${inv.fund}: aucun 13F-HR récent`);
      continue;
    }
    const [c, p] = idx;
    const filed = r.filingDate[c];
    const cached = prevBy.get(inv.cik);
    if (!force && cached?.filed === filed) {
      out.push(cached);
      continue;
    }
    const cikNum = String(Number(inv.cik));
    const cur = await loadFiling(cikNum, r.accessionNumber[c]);
    const old = p != null ? await loadFiling(cikNum, r.accessionNumber[p]) : null;
    if (!cur) {
      gaps.push(`${inv.fund}: table 13F illisible (${r.accessionNumber[c]})`);
      if (cached) out.push(cached);
      continue;
    }
    const d = diffHoldings(cur, old ?? []);
    const ageDays = Math.round((Date.now() - new Date(filed).getTime()) / 86400000);
    out.push({
      ...inv,
      filed,
      period: r.reportDate[c],
      prev_period: p != null ? r.reportDate[p] : null,
      age_days: ageDays,
      stale: ageDays > 140, // plus d'un trimestre sans dépôt : le gérant a pu cesser de déclarer
      ...d,
      source: `SEC EDGAR 13F-HR ${r.accessionNumber[c]}`,
    });
    console.log(`🏦 ${inv.investor} (${inv.fund}) · 13F au ${r.reportDate[c]} déposé le ${filed} · ${d.n_positions} lignes · ${d.moves.length} mouvements`);
  }

  writeJson(path, {
    _doc:
      "Ce que font les investisseurs pros, d'après leurs déclarations officielles 13F-HR (SEC EDGAR), recalculé par node engine/pros.js. Pour chaque gérant : période, date de dépôt, top 10 des lignes et mouvements du trimestre (nouvelle | renforce | allege | sortie, seuil ±20 % de titres). Photo publiée ~45 jours après le trimestre, actions US longues seulement : une IDÉE à instruire, jamais un signal d'achat. Ne pas éditer à la main.",
    updated: TODAY(),
    investors: out,
    data_gaps: gaps,
  });
  console.log("PROS_JSON:" + JSON.stringify({ ok: true, investors: out.length, gaps: gaps.length }));
}

main().catch((e) => {
  console.error("pros: erreur inattendue ->", e?.message || e);
  console.log("PROS_JSON:" + JSON.stringify({ ok: false, error: String(e?.message || e) }));
  process.exit(0);
});
