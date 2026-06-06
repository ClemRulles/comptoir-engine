// schema.js — schémas canoniques des fichiers d'état du fonds IA.
//
// Chaque entrée décrit UN fichier de memory/fund/ :
//  - template()  : la forme canonique « vide » à recréer si le fichier manque ou
//                  est illisible (JSON cassé). C'est la source de vérité du schéma.
//  - required    : clés de premier niveau qui DOIVENT exister. Si l'une manque sur
//                  un fichier par ailleurs lisible, on la complète sans toucher au reste.
//  - check(obj)  : validations structurelles fines -> liste de problèmes (strings).
//                  Un problème "dur" (type de la racine faux) force une recréation ;
//                  un problème "doux" (clé manquante) est réparé par complétion.
//
// Principe directeur : RÉPARER, JAMAIS DÉTRUIRE. On ne recrée intégralement un
// fichier que s'il est absent ou non-parsable. Sinon on complète les trous en
// préservant les données présentes (decisions[], positions[], trades[]…).

export const TODAY = () => new Date().toISOString().slice(0, 10);

// ---------------------------------------------------------------------------
// decisions.json — registre APPEND-ONLY des décisions clôturées
// ---------------------------------------------------------------------------
const decisions = {
  file: "decisions.json",
  required: ["decisions"],
  template: () => ({
    _doc:
      "Registre APPEND-ONLY des décisions de book IA CLÔTURÉES. La passe d'apprentissage du vendredi y ajoute une entrée à chaque position fermée. C'est l'historique sur lequel se calcule la calibration. Ne jamais réécrire le passé : on corrige par une nouvelle leçon, pas en effaçant. Schéma d'une entrée : { thesis_id, ticker, horizon (coeur|tactique), confidence (Haute|Moyenne|Basse), opened (YYYY-MM-DD), closed (YYYY-MM-DD), entry (prix moyen), exit (prix), realized_pnl_pct (nombre, ex 0.124 = +12.4%), outcome ('thèse confirmée'|'thèse cassée'|'neutre'), hit (true si le résultat valide la confiance annoncée), lesson (1 phrase actionnable) }.",
    decisions: [],
  }),
  check(obj) {
    const problems = [];
    if (!Array.isArray(obj.decisions)) {
      problems.push({ hard: true, msg: "`decisions` n'est pas un tableau" });
      return problems;
    }
    const CONF = new Set(["Haute", "Moyenne", "Basse"]);
    obj.decisions.forEach((d, i) => {
      if (d == null || typeof d !== "object") {
        problems.push({ hard: false, msg: `decisions[${i}] n'est pas un objet`, drop: i });
        return;
      }
      if (!d.ticker) problems.push({ hard: false, msg: `decisions[${i}].ticker manquant` });
      if (!CONF.has(d.confidence))
        problems.push({ hard: false, msg: `decisions[${i}].confidence invalide ("${d.confidence}")` });
      if (typeof d.realized_pnl_pct !== "number")
        problems.push({ hard: false, msg: `decisions[${i}].realized_pnl_pct non numérique` });
      if (typeof d.hit !== "boolean")
        problems.push({ hard: false, msg: `decisions[${i}].hit non booléen` });
    });
    return problems;
  },
};

// ---------------------------------------------------------------------------
// calibration.json — agrégats recalculés à chaque passe
// ---------------------------------------------------------------------------
const BUCKET = (confidence) => ({ confidence, n: 0, hits: 0, hit_rate: 0, avg_return: 0 });

const calibration = {
  file: "calibration.json",
  required: ["buckets", "global"],
  template: () => ({
    _doc:
      "Agrégats recalculés à chaque passe (vendredi + revue mensuelle) à partir de decisions.json. 'buckets' = un objet par niveau de confiance annoncé : n (décisions clôturées), hits (résultats qui valident la confiance), hit_rate (hits/n), avg_return (rendement réalisé moyen). 'global' = stats du book IA. Une IA bien calibrée a un hit_rate qui CROÎT avec la confiance (Basse < Moyenne < Haute) ; sinon la passe mensuelle corrige le sizing (method §I).",
    updated: TODAY(),
    buckets: [BUCKET("Haute"), BUCKET("Moyenne"), BUCKET("Basse")],
    global: {
      closed_decisions: 0,
      win_rate: 0,
      avg_win: 0,
      avg_loss: 0,
      profit_factor: 0,
      max_drawdown: 0,
    },
  }),
  check(obj) {
    const problems = [];
    if (!Array.isArray(obj.buckets)) {
      problems.push({ hard: true, msg: "`buckets` n'est pas un tableau" });
    } else {
      // Garantit la présence des 3 buckets canoniques (complétion sans destruction).
      for (const conf of ["Haute", "Moyenne", "Basse"]) {
        if (!obj.buckets.some((b) => b && b.confidence === conf))
          problems.push({ hard: false, msg: `bucket "${conf}" manquant`, addBucket: conf });
      }
    }
    if (obj.global == null || typeof obj.global !== "object")
      problems.push({ hard: false, msg: "`global` manquant ou invalide", resetGlobal: true });
    return problems;
  },
};

// ---------------------------------------------------------------------------
// signals.json — cache des signaux quantitatifs (produit par signals.js)
// ---------------------------------------------------------------------------
const signals = {
  file: "signals.json",
  required: ["regime", "tickers"],
  template: () => ({
    _doc:
      "Cache des signaux QUANTITATIFS calculés par engine/signals.js. 'regime' = score macro FRED agrégé (gate global). 'tickers' = map ticker -> { fscore, momentum_12_1, earnings_quality, gate } horodatés. L'IA LIT ce fichier avant d'ouvrir/fermer une position (method §A/§H) : les signaux sont des garde-fous factuels, pas une boîte noire. 'data_gaps' liste les sources indisponibles (clé manquante / quota) pour rester honnête sur l'incertitude. Régénéré par les routines ; ne pas éditer à la main.",
    updated: null,
    regime: {
      label: "inconnu",
      score: null,
      asof: null,
      inputs: {},
      source: "FRED",
      note: "jamais calculé",
    },
    tickers: {},
    data_gaps: [],
  }),
  check(obj) {
    const problems = [];
    if (obj.regime == null || typeof obj.regime !== "object")
      problems.push({ hard: false, msg: "`regime` manquant", resetRegime: true });
    if (obj.tickers == null || typeof obj.tickers !== "object" || Array.isArray(obj.tickers))
      problems.push({ hard: false, msg: "`tickers` manquant ou non-map", resetTickers: true });
    return problems;
  },
};

// ---------------------------------------------------------------------------
// ai-fund.json — le book vivant. On NE le recrée que s'il est absent/illisible,
// et alors en mode seeded:false (le seed clone-à-t0 du vendredi reprendra la main).
// Jamais de réécriture destructive d'un book valide.
// ---------------------------------------------------------------------------
const aiFund = {
  file: "ai-fund.json",
  required: ["seeded", "positions", "trades"],
  protected: true, // guard ne recrée ce fichier QUE s'il manque ou est illisible
  template: () => ({
    as_of: TODAY(),
    seeded: false,
    start_capital: 0,
    cash: 0,
    positions: [],
    trades: [],
    note:
      "Recréé par engine/guard.js après fichier manquant/illisible. seeded:false -> la PASSE 0 du vendredi (routines/friday-brief.md) reclonera le groupe depuis memory/portfolio.md.",
  }),
  check(obj) {
    const problems = [];
    if (typeof obj.seeded !== "boolean")
      problems.push({ hard: false, msg: "`seeded` non booléen" });
    if (!Array.isArray(obj.positions))
      problems.push({ hard: true, msg: "`positions` n'est pas un tableau" });
    if (!Array.isArray(obj.trades))
      problems.push({ hard: false, msg: "`trades` n'est pas un tableau", resetTrades: true });
    return problems;
  },
};

export const SCHEMAS = { decisions, calibration, signals, aiFund };

// Complète un objet parsé avec les clés requises manquantes de son template,
// SANS écraser les valeurs présentes. Retourne { obj, added: [clés ajoutées] }.
export function fillMissing(schema, obj) {
  const tpl = schema.template();
  const added = [];
  for (const key of schema.required) {
    if (!(key in obj)) {
      obj[key] = tpl[key];
      added.push(key);
    }
  }
  // _doc/updated utiles mais non requis : on les ajoute s'ils manquent.
  for (const key of ["_doc", "updated", "as_of"]) {
    if (key in tpl && !(key in obj)) {
      obj[key] = tpl[key];
      added.push(key);
    }
  }
  return { obj, added };
}
