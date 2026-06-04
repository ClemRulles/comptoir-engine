"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ClubData } from "@/lib/data";
import { eur } from "@/lib/fund";

export function MembersManager({ club }: { club: ClubData }) {
  const router = useRouter();
  const { members, contributions, monthlyTotal, monthlyPerMember, activeMembers, contributedTotal, demo } = club;

  const [name, setName] = useState("");
  const [monthly, setMonthly] = useState(String(monthlyPerMember));
  const [memberId, setMemberId] = useState(members.find((m) => m.active)?.id ?? "");
  const [amount, setAmount] = useState(String(monthlyPerMember));
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  function flash(kind: "ok" | "err", text: string) {
    setMsg({ kind, text });
    setTimeout(() => setMsg(null), 2800);
  }

  async function addMember(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy("member");
    try {
      const res = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), monthly_amount: Number(monthly) || 25 }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) flash("err", j.error ?? "Erreur");
      else {
        setName("");
        setMonthly(String(monthlyPerMember));
        flash("ok", "Membre ajouté.");
        router.refresh();
      }
    } catch {
      flash("err", "Erreur réseau");
    }
    setBusy(null);
  }

  async function toggleMember(id: string, active: boolean) {
    setBusy(id);
    try {
      const res = await fetch("/api/members", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, active: !active }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) flash("err", j.error ?? "Erreur");
      else router.refresh();
    } catch {
      flash("err", "Erreur réseau");
    }
    setBusy(null);
  }

  async function addContribution(e: React.FormEvent) {
    e.preventDefault();
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) return flash("err", "Montant invalide");
    setBusy("contrib");
    try {
      const res = await fetch("/api/contributions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ member_id: memberId || null, amount: amt, note: note.trim() }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) flash("err", j.error ?? "Erreur");
      else {
        setNote("");
        flash("ok", "Apport enregistré (+ cash du pot).");
        router.refresh();
      }
    } catch {
      flash("err", "Erreur réseau");
    }
    setBusy(null);
  }

  return (
    <div className="space-y-4">
      {demo && (
        <div className="card-p border-ai/30 bg-ai/5 text-sm text-ink">
          Mode démo : l&apos;ajout de membres et d&apos;apports sera actif une fois Supabase branché
          (migration <code>migration-3-members.sql</code>). Les chiffres ci-dessous sont illustratifs.
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
        <div className="card-p">
          <div className="label">Membres actifs</div>
          <div className="kpi mt-1">{activeMembers}</div>
        </div>
        <div className="card-p">
          <div className="label">Apport mensuel</div>
          <div className="kpi mt-1">{eur(monthlyTotal)}</div>
          <div className="mt-2 text-sm text-muted">{activeMembers} × {eur(monthlyPerMember)} / mois</div>
        </div>
        <div className="card-p col-span-2 xl:col-span-1">
          <div className="label">Apports cumulés</div>
          <div className="kpi mt-1">{eur(contributedTotal)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Nouveau membre */}
        <form onSubmit={addMember} className="card-p space-y-3">
          <h3 className="text-sm font-bold">Nouveau membre</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="label">Nom</label>
              <input className="input mt-1" value={name} onChange={(e) => setName(e.target.value)} placeholder="Prénom" required />
            </div>
            <div>
              <label className="label">€/mois</label>
              <input className="input mt-1" type="number" min="0" step="1" value={monthly} onChange={(e) => setMonthly(e.target.value)} />
            </div>
          </div>
          <button type="submit" disabled={busy === "member"} className="btn btn-primary w-full">
            {busy === "member" ? "Ajout…" : "+ Ajouter le membre"}
          </button>
        </form>

        {/* Apport */}
        <form onSubmit={addContribution} className="card-p space-y-3">
          <h3 className="text-sm font-bold">Enregistrer un apport</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="label">Membre</label>
              <select className="input mt-1" value={memberId} onChange={(e) => setMemberId(e.target.value)}>
                <option value="">— (collectif)</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Montant €</label>
              <input className="input mt-1" type="number" min="1" step="1" value={amount} onChange={(e) => setAmount(e.target.value)} required />
            </div>
          </div>
          <input className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note (ex. rattrapage, mensuel…)" />
          <button type="submit" disabled={busy === "contrib"} className="btn btn-primary w-full">
            {busy === "contrib" ? "Enregistrement…" : "💶 Enregistrer l'apport"}
          </button>
        </form>
      </div>

      {msg && (
        <p className={`text-sm ${msg.kind === "ok" ? "text-brand-600" : "text-danger"}`}>
          {msg.kind === "ok" ? "✓ " : ""}{msg.text}
        </p>
      )}

      {/* Roster */}
      <div className="card-p overflow-x-auto">
        <h3 className="mb-3 text-sm font-bold">Membres du pot</h3>
        {members.length === 0 ? (
          <p className="text-sm text-muted">Aucun membre. Ajoutez-en un ci-dessus.</p>
        ) : (
          <table className="w-full text-sm row-hover">
            <thead>
              <tr className="label border-b border-line">
                <th className="py-2 text-left font-semibold">Membre</th>
                <th className="text-left font-semibold hidden sm:table-cell">Depuis</th>
                <th className="text-right font-semibold">€/mois</th>
                <th className="text-right font-semibold">Statut</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id} className="border-b border-line/60">
                  <td className="py-2.5 font-semibold">{m.name}</td>
                  <td className="text-muted hidden sm:table-cell">{m.joined_on}</td>
                  <td className="text-right tabular-nums">{eur(m.monthly_amount)}</td>
                  <td className="text-right">
                    <button
                      onClick={() => toggleMember(m.id, m.active)}
                      disabled={busy === m.id || demo}
                      className={`chip ${m.active ? "bg-brand/10 text-brand-600" : "bg-slate-100 text-slate-500"} disabled:opacity-60`}
                    >
                      {m.active ? "Actif" : "Inactif"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Historique des apports */}
      <div className="card-p">
        <h3 className="mb-3 text-sm font-bold">Derniers apports</h3>
        {contributions.length === 0 ? (
          <p className="text-sm text-muted">Aucun apport enregistré.</p>
        ) : (
          <ul className="space-y-2">
            {contributions.slice(0, 12).map((c) => (
              <li key={c.id} className="flex items-center justify-between border-b border-line/60 pb-2 text-sm last:border-0">
                <span>
                  <strong>{c.member_name ?? "Collectif"}</strong>{" "}
                  <span className="text-muted">· {String(c.ts).slice(0, 10)}{c.note ? ` · ${c.note}` : ""}</span>
                </span>
                <span className="tabular-nums font-semibold text-brand-600">+{eur(c.amount)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
