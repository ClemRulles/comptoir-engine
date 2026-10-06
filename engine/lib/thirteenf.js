// thirteenf.js — fonctions PURES pour les déclarations 13F-HR de la SEC (positions
// trimestrielles des gérants > 100 M$ : Buffett, Ackman, Druckenmiller…). Aucune I/O.
// Sert à engine/pros.js : « ce que font les investisseurs pros », sur données OFFICIELLES.
//
// Rappel d'honnêteté : un 13F arrive ~45 jours après la fin du trimestre et ne montre que
// les actions US longues. C'est une photo datée, pas un signal temps réel.

const tag = (block, name) => {
  const m = block.match(new RegExp(`<(?:\\w+:)?${name}>([\\s\\S]*?)</(?:\\w+:)?${name}>`, "i"));
  return m ? m[1].trim() : null;
};

// XML de la table d'information → lignes agrégées par (émetteur, call/put). Les gérants
// déclarent souvent la même action sur plusieurs lignes (sous-gérants) et une même société
// sous plusieurs classes (Alphabet A et C = deux CUSIP) : on additionne par ÉMETTEUR, identifié
// par les 6 premiers caractères du CUSIP (code émetteur officiel) — pas par le libellé, qui
// change d'un trimestre à l'autre (« BANK OF AMER CORP » / « BANK AMERICA CORP »).
export function parseInfoTable(xml) {
  if (typeof xml !== "string") return [];
  const rows = new Map();
  const re = /<(?:\w+:)?infoTable>([\s\S]*?)<\/(?:\w+:)?infoTable>/gi;
  let m;
  while ((m = re.exec(xml))) {
    const b = m[1];
    const cusip = tag(b, "cusip");
    const issuer = tag(b, "nameOfIssuer");
    const value = Number(tag(b, "value"));
    const shares = Number(tag(b, "sshPrnamt"));
    const putCall = tag(b, "putCall");
    if (!cusip || !issuer || !Number.isFinite(value)) continue;
    const key = `${issuerId({ cusip, issuer })}|${putCall ?? ""}`;
    const r = rows.get(key) ?? { cusip, issuer: decode(issuer), cls: decode(tag(b, "titleOfClass") ?? ""), put_call: putCall, value: 0, shares: 0 };
    r.value += value;
    r.shares += Number.isFinite(shares) ? shares : 0;
    rows.set(key, r);
  }
  return [...rows.values()];
}

// Identifiant d'émetteur stable : CUSIP-6 si disponible, sinon libellé normalisé.
export function issuerId(r) {
  const c = String(r?.cusip ?? "").trim().toUpperCase();
  if (c.length >= 6) return c.slice(0, 6);
  return decode(String(r?.issuer ?? "")).toUpperCase().replace(/[^A-Z0-9]+/g, " ").trim();
}

function decode(s) {
  return s.replace(/&amp;/g, "&").replace(/&apos;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">");
}

const r4 = (x) => Math.round(x * 10000) / 10000;

// Compare deux trimestres (actions longues uniquement, options exclues).
// Renvoie le portefeuille courant (top lignes) et les mouvements significatifs :
// nouvelle ligne, sortie, renforcement / allègement (> 20 % de titres en plus/en moins).
export function diffHoldings(current, previous, { threshold = 0.2, top = 10, maxMoves = 10 } = {}) {
  const longs = (rows) => (rows ?? []).filter((r) => !r.put_call);
  const cur = longs(current), prev = longs(previous);
  const total = cur.reduce((a, r) => a + r.value, 0);
  const prevTotal = prev.reduce((a, r) => a + r.value, 0);
  const prevBy = new Map(prev.map((r) => [issuerId(r), r]));
  const curBy = new Map(cur.map((r) => [issuerId(r), r]));
  const moves = [];
  for (const r of cur) {
    const p = prevBy.get(issuerId(r));
    const weight = total ? r.value / total : 0;
    if (!p) moves.push({ issuer: r.issuer, cusip: r.cusip, action: "nouvelle", weight_pct: r4(weight), shares_change_pct: null, value_usd: r.value });
    else if (p.shares > 0) {
      const ch = r.shares / p.shares - 1;
      if (ch >= threshold) moves.push({ issuer: r.issuer, cusip: r.cusip, action: "renforce", weight_pct: r4(weight), shares_change_pct: r4(ch), value_usd: r.value });
      else if (ch <= -threshold) moves.push({ issuer: r.issuer, cusip: r.cusip, action: "allege", weight_pct: r4(weight), shares_change_pct: r4(ch), value_usd: r.value });
    }
  }
  for (const p of prev) {
    if (!curBy.has(issuerId(p)))
      moves.push({ issuer: p.issuer, cusip: p.cusip, action: "sortie", weight_pct: 0, prev_weight_pct: prevTotal ? r4(p.value / prevTotal) : null, shares_change_pct: -1, value_usd: 0, prev_value_usd: p.value });
  }
  // Les mouvements qui pèsent le plus (en dollars engagés ou retirés) d'abord.
  const size = (m) => Math.max(m.value_usd ?? 0, m.prev_value_usd ?? 0) * (m.action === "renforce" || m.action === "allege" ? Math.abs(m.shares_change_pct ?? 0) : 1);
  moves.sort((a, b) => size(b) - size(a));
  const topRows = [...cur].sort((a, b) => b.value - a.value).slice(0, top).map((r) => ({ issuer: r.issuer, cusip: r.cusip, weight_pct: total ? r4(r.value / total) : 0, value_usd: r.value }));
  return { total_value_usd: total, n_positions: cur.length, top: topRows, moves: moves.slice(0, maxMoves) };
}
