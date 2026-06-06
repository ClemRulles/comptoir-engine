#!/usr/bin/env node
// guard.js — garde-fou de la mémoire du fonds IA.
//
// À jouer en TOUT DÉBUT de chaque routine, avant de lire/écrire l'état :
//     node engine/guard.js
//
// Rôle : garantir que decisions.json, calibration.json, signals.json et ai-fund.json
// sont présents et structurellement valides. Si un fichier manque ou est illisible,
// il est recréé proprement (le corrompu est mis en quarantaine, jamais perdu). Si un
// fichier est lisible mais incomplet (clé manquante, bucket absent…), il est COMPLÉTÉ
// sans toucher aux données présentes. La routine ne plante donc jamais silencieusement.
//
// Sortie : rapport lisible + JSON de synthèse sur la dernière ligne (préfixe GUARD_JSON:)
// pour que la routine puisse le citer dans le brief. Code de sortie 0 = mémoire saine
// (réparée si besoin) ; 2 = une réparation a dû recréer un fichier (à signaler au groupe).

import { SCHEMAS, fillMissing } from "./lib/schema.js";
import { readJsonSafe, writeJson, quarantine, fundPath } from "./lib/io.js";

function bucketFor(conf) {
  return { confidence: conf, n: 0, hits: 0, hit_rate: 0, avg_return: 0 };
}

// Applique les réparations "douces" issues de schema.check(), en place.
function applySoftRepairs(schema, obj, problems) {
  const actions = [];

  // Drop des entrées non-objet dans decisions[] (du plus grand index au plus petit).
  const drops = problems.filter((p) => typeof p.drop === "number").map((p) => p.drop);
  for (const i of drops.sort((a, b) => b - a)) {
    obj.decisions.splice(i, 1);
    actions.push(`decisions[${i}] retiré (entrée invalide)`);
  }

  for (const p of problems) {
    if (p.addBucket) {
      obj.buckets.push(bucketFor(p.addBucket));
      actions.push(`bucket "${p.addBucket}" ajouté`);
    }
    if (p.resetGlobal) {
      obj.global = schema.template().global;
      actions.push("`global` réinitialisé");
    }
    if (p.resetRegime) {
      obj.regime = schema.template().regime;
      actions.push("`regime` réinitialisé");
    }
    if (p.resetTickers) {
      obj.tickers = {};
      actions.push("`tickers` réinitialisé");
    }
    if (p.resetTrades) {
      obj.trades = [];
      actions.push("`trades` réinitialisé");
    }
  }
  return actions;
}

function guardOne(schema) {
  const path = fundPath(schema.file);
  const res = readJsonSafe(path);
  const report = { file: schema.file, status: res.status, actions: [], recreated: false };

  // Cas 1 — absent ou illisible : on (sauvegarde puis) recrée depuis le template.
  if (res.status === "missing" || res.status === "corrupt") {
    let quarantined = null;
    if (res.status === "corrupt") quarantined = quarantine(path);
    writeJson(path, schema.template());
    report.recreated = true;
    report.actions.push(
      res.status === "missing"
        ? "fichier absent -> recréé depuis le schéma canonique"
        : `fichier illisible (${res.error}) -> recréé${quarantined ? `, original sauvé en ${quarantined.split("/").pop()}` : ""}`
    );
    return report;
  }

  // Cas 2 — lisible : on valide et on complète sans détruire.
  let obj = res.data;
  let problems = schema.check(obj);

  // Problème "dur" sur la racine (ex. `positions`/`decisions` n'est pas un tableau)
  // => structure trop abîmée pour une complétion sûre : on recrée (avec quarantaine).
  if (problems.some((p) => p.hard)) {
    const quarantined = quarantine(path);
    writeJson(path, schema.template());
    report.recreated = true;
    report.status = "corrupt-structure";
    report.actions.push(
      `structure invalide (${problems.filter((p) => p.hard).map((p) => p.msg).join("; ")}) -> recréé${quarantined ? `, original sauvé en ${quarantined.split("/").pop()}` : ""}`
    );
    return report;
  }

  // Complétion des clés requises manquantes.
  const { added } = fillMissing(schema, obj);
  if (added.length) report.actions.push(`clés ajoutées : ${added.join(", ")}`);

  // Réparations douces (buckets, global, trades…). On re-check après fillMissing.
  problems = schema.check(obj);
  const softActions = applySoftRepairs(schema, obj, problems);
  report.actions.push(...softActions);

  // Réécrit seulement si quelque chose a changé (évite les diffs git inutiles).
  if (report.actions.length) writeJson(path, obj);
  return report;
}

function main() {
  const reports = Object.values(SCHEMAS).map(guardOne);
  const recreated = reports.filter((r) => r.recreated);
  const touched = reports.filter((r) => r.actions.length);

  console.log("🛡️  guard — intégrité de memory/fund/");
  for (const r of reports) {
    if (!r.actions.length) {
      console.log(`  ✓ ${r.file} : OK`);
    } else {
      const icon = r.recreated ? "♻️ " : "🔧";
      console.log(`  ${icon} ${r.file} : ${r.actions.join(" · ")}`);
    }
  }
  if (!touched.length) console.log("  → rien à réparer, mémoire saine.");

  const summary = {
    ok: true,
    recreated: recreated.map((r) => r.file),
    repaired: touched.filter((r) => !r.recreated).map((r) => r.file),
  };
  console.log("GUARD_JSON:" + JSON.stringify(summary));
  // Code 2 si une recréation a eu lieu : la routine doit le mentionner au groupe.
  process.exit(recreated.length ? 2 : 0);
}

main();
