// contrib-rule.ts — LA règle des apports du club, en un seul endroit (cron, affichage, démo).
// Le 1er de chaque mois, chaque membre actif verse sa cotisation dans le pot commun ; le fonds
// IA reçoit la même somme (armes égales). La cotisation est passée de 25 € à 30 € par membre
// à partir de septembre 2026 : les mois d'avant gardent l'ancien montant.
export const CONTRIB_DAY = 1;

export const PER_MEMBER_SCHEDULE: { from: string; perMember: number }[] = [
  { from: "2000-01", perMember: 25 },
  { from: "2026-09", perMember: 30 },
];

const MONTHS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];

// Montant par membre pour un mois « AAAA-MM ».
export function perMemberFor(ym: string): number {
  let v = PER_MEMBER_SCHEDULE[0].perMember;
  for (const s of PER_MEMBER_SCHEDULE) if (ym >= s.from) v = s.perMember;
  return v;
}

export const ymOf = (d: Date | string) => (typeof d === "string" ? d.slice(0, 7) : `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`);

// Date d'apport d'un mois (le 1er, 06:00 UTC — heure du cron).
export const contribTs = (ym: string) => `${ym}-${String(CONTRIB_DAY).padStart(2, "0")}T06:00:00.000Z`;

export type ContribRule = { day: number; perMember: number; members: number; total: number; changedFrom?: string; previous?: number };

// Règle en vigueur ce mois-ci, avec le dernier changement (pour « 25 € avant sept. »).
export function currentRule(members: number, now: Date = new Date()): ContribRule {
  const ym = ymOf(now);
  const perMember = perMemberFor(ym);
  const idx = PER_MEMBER_SCHEDULE.reduce((k, s, i) => (ym >= s.from ? i : k), 0);
  const prev = idx > 0 ? PER_MEMBER_SCHEDULE[idx - 1] : null;
  return { day: CONTRIB_DAY, perMember, members, total: perMember * members, changedFrom: prev ? PER_MEMBER_SCHEDULE[idx].from : undefined, previous: prev?.perMember };
}

// « 300 € le 1er de chaque mois (10 × 30 €, 25 € avant sept. 2026) »
export function ruleSentence(r: ContribRule): string {
  const eur = (v: number) => `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(v)} €`;
  const day = r.day === 1 ? "1er" : String(r.day);
  let s = `${eur(r.total)} le ${day} de chaque mois (${r.members} × ${eur(r.perMember)}`;
  if (r.changedFrom && r.previous != null) {
    const [y, m] = r.changedFrom.split("-");
    s += `, ${eur(r.previous)} avant ${MONTHS[Number(m) - 1]} ${y}`;
  }
  return `${s})`;
}
