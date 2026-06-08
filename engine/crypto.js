#!/usr/bin/env node
// crypto.js — RADAR crypto du fonds IA (contexte, pas signal d'achat).
//
// Agrège des données crypto FACTUELLES et gratuites (sans clé) pour que l'IA puisse
// raisonner le contexte crypto au même titre que le régime macro actions :
//   • CoinGecko /global  : cap totale, volume, dominance BTC/ETH, variation 24h (EUR).
//   • CoinGecko /markets : cours + variations 24h/7j/30j des majors (EUR).
//   • alternative.me     : Fear & Greed Index crypto (0 peur extrême → 100 avidité extrême).
// Écrit memory/fund/crypto.json.
//
// Usage :
//   node engine/crypto.js                       # watchlist majors par défaut
//   node engine/crypto.js bitcoin ethereum solana   # ids CoinGecko ciblés
//
// Discipline (CLAUDE.md §F) : le sentiment/euphorie alimente la checklist bulle (contrarien) ;
// AUCUNE entrée de book sur le seul radar crypto — il faut une preuve dure (on-chain, chiffres,
// catalyseur). Sans réseau, on n'échoue pas : champs à null + data_gaps. On ne bloque jamais.

import { writeJson, fundPath } from "./lib/io.js";
import { coinGeckoGlobal, coinGeckoMarkets, cryptoFearGreed } from "./lib/sources.js";
import { TODAY } from "./lib/schema.js";

// Watchlist par défaut = majors liquides (ids CoinGecko). Élargir si le groupe détient une
// crypto précise (aligner l'id ici avec le ticker Yahoo -EUR de l'interface).
const DEFAULT_IDS = ["bitcoin", "ethereum", "solana", "ripple", "binancecoin"];

function resolveIds() {
  const args = process.argv.slice(2).filter((a) => !a.startsWith("-"));
  return args.length ? args : DEFAULT_IDS;
}

// Lecture contrarienne simple du sentiment (radar, pas un ordre).
function readSentiment(fng) {
  if (!fng || fng.value == null) return null;
  const v = fng.value;
  if (v >= 75) return "avidité extrême — prudence (case euphorie de la checklist bulle)";
  if (v >= 55) return "avidité — vigilance";
  if (v <= 25) return "peur extrême — zone contrarienne potentielle (à corroborer)";
  if (v <= 45) return "peur — sentiment déprimé";
  return "neutre";
}

async function main() {
  const ids = resolveIds();
  const gaps = [];

  const [global, markets, fng] = await Promise.all([
    coinGeckoGlobal(),
    coinGeckoMarkets(ids),
    cryptoFearGreed(),
  ]);

  if (!global) gaps.push("CoinGecko /global indisponible -> cap/dominance non calculées");
  if (!markets) gaps.push("CoinGecko /markets indisponible -> cours des majors absents");
  if (!fng) gaps.push("alternative.me Fear & Greed indisponible -> sentiment absent");

  const out = {
    _doc:
      "Radar crypto (contexte, JAMAIS un signal d'achat seul — CLAUDE.md §F). Sources gratuites " +
      "sans clé : CoinGecko (cap/dominance/cours EUR) + alternative.me (Fear & Greed). À corroborer " +
      "par une preuve dure avant toute décision de book.",
    updated: TODAY(),
    market: global,
    fear_greed: fng,
    sentiment_read: readSentiment(fng),
    coins: markets,
    watchlist_ids: ids,
    data_gaps: gaps,
  };

  writeJson(fundPath("crypto.json"), out);

  // Résumé console (pour le log de routine).
  const dom = global ? `BTC ${global.btc_dominance_pct?.toFixed(1)}% / ETH ${global.eth_dominance_pct?.toFixed(1)}%` : "dominance n/a";
  const senti = fng ? `F&G ${fng.value} (${fng.classification})` : "F&G n/a";
  console.log(`crypto.json écrit · ${dom} · ${senti} · ${markets?.length ?? 0} coins · ${gaps.length} gap(s)`);
  if (gaps.length) console.log("  gaps:", gaps.join(" | "));
}

main().catch((e) => {
  // Filet : même en cas d'imprévu, on écrit un fichier minimal valide (ne bloque pas la routine).
  console.error("crypto.js:", String(e));
  try {
    writeJson(fundPath("crypto.json"), {
      _doc: "Radar crypto — écriture de secours après erreur.",
      updated: TODAY(),
      market: null,
      fear_greed: null,
      sentiment_read: null,
      coins: null,
      watchlist_ids: DEFAULT_IDS,
      data_gaps: ["exception: " + String(e)],
    });
  } catch {}
  process.exit(0);
});
