"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { TickerSearch } from "@/components/TickerSearch";
import { TickerCell } from "@/components/StockDrawer";

interface Message {
  id: string;
  author_id: string;
  author_name: string | null;
  content: string;
  kind: "text" | "proposal";
  proposal_ticker?: string | null;
  proposal_thesis?: string | null;
  proposal_size?: string | null;
  proposal_horizon?: string | null;
  proposal_status?: string | null;
  created_at: string;
}

const DEMO_MESSAGES: Message[] = [
  {
    id: "d1",
    author_id: "demo-1",
    author_name: "Sacha",
    content: "💡 Proposition : ASML",
    kind: "proposal",
    proposal_ticker: "ASML",
    proposal_thesis: "Quasi-monopole sur la litho EUV, carnet de commandes record. Le repli récent crée un bon point d'entrée.",
    proposal_size: "5%",
    proposal_horizon: "Long terme",
    proposal_status: "open",
    created_at: new Date(Date.now() - 3 * 3600_000).toISOString(),
  },
  {
    id: "d2",
    author_id: "demo-2",
    author_name: "Inès",
    content: "Je suis pour ASML, on en discute vendredi ?",
    kind: "text",
    created_at: new Date(Date.now() - 1800_000).toISOString(),
  },
  {
    id: "d3",
    author_id: "demo-1",
    author_name: "Sacha",
    content: "Oui ! On peut regarder aussi CEG pour la demande électrique des datacenters IA.",
    kind: "text",
    created_at: new Date(Date.now() - 900_000).toISOString(),
  },
];

function timeAgo(isoDate: string) {
  const diff = Date.now() - new Date(isoDate).getTime();
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "à l'instant";
  if (min < 60) return `il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `il y a ${h}h`;
  return new Date(isoDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function Avatar({ name }: { name: string | null }) {
  const initials = (name ?? "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  return (
    <div className="h-7 w-7 rounded-full bg-brand/20 text-brand-600 flex items-center justify-center text-xs font-bold shrink-0">
      {initials}
    </div>
  );
}

export function Chat({ demo, currentUserId }: { demo: boolean; currentUserId?: string }) {
  const [messages, setMessages] = useState<Message[]>(demo ? DEMO_MESSAGES : []);
  const [text, setText] = useState("");
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [pTicker, setPTicker] = useState("");
  const [pTickerName, setPTickerName] = useState("");
  const [pThesis, setPThesis] = useState("");
  const [pSize, setPSize] = useState("");
  const [pHorizon, setPHorizon] = useState("Long terme");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Chargement initial + abonnement Realtime
  useEffect(() => {
    if (demo) return;
    const supabase = createClient();

    fetch("/api/messages")
      .then((r) => r.json())
      .then((d) => setMessages(d.messages ?? []));

    const channel = supabase
      .channel("chat-messages")
      .on(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        "postgres_changes" as any,
        { event: "INSERT", schema: "public", table: "messages" },
        (payload: { new: Message }) => {
          setMessages((prev) => {
            if (prev.some((m) => m.id === payload.new.id)) return prev;
            return [...prev, payload.new];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [demo]);

  const sendText = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!text.trim() || demo || sending) return;
      setSending(true);
      setError(null);
      try {
        const res = await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ kind: "text", content: text.trim() }),
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          setError(j.error ?? "Erreur réseau");
        } else {
          setText("");
        }
      } catch {
        setError("Erreur réseau.");
      }
      setSending(false);
    },
    [text, demo, sending]
  );

  async function sendProposal(e: React.FormEvent) {
    e.preventDefault();
    if (!pTicker.trim() || !pThesis.trim() || demo || sending) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "proposal",
          content: `💡 Proposition : ${pTicker.trim().toUpperCase()}`,
          proposal_ticker: pTicker.trim().toUpperCase(),
          proposal_thesis: pThesis.trim(),
          proposal_size: pSize.trim() || null,
          proposal_horizon: pHorizon.trim() || null,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j.error ?? "Erreur");
      } else {
        setShowProposalForm(false);
        setPTicker(""); setPTickerName(""); setPThesis(""); setPSize(""); setPHorizon("Long terme");
      }
    } catch {
      setError("Erreur réseau.");
    }
    setSending(false);
  }

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 14rem)", minHeight: "380px" }}>
      {/* Liste des messages */}
      <div className="flex-1 overflow-y-auto space-y-3 py-2 pr-1">
        {messages.length === 0 && !demo && (
          <p className="text-sm text-muted text-center pt-10">
            Aucun message — lancez la discussion !
          </p>
        )}
        {messages.map((msg) => {
          const isMe = msg.author_id === currentUserId;

          if (msg.kind === "proposal") {
            return (
              <div key={msg.id} className="card-p border border-brand/25 bg-brand/[0.03] space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="chip bg-brand/10 text-brand-600 text-xs">💡 Proposition</span>
                    {msg.proposal_ticker && (
                      <TickerCell ticker={msg.proposal_ticker} className="text-base" />
                    )}
                    {msg.proposal_horizon && (
                      <span className="chip bg-bg text-muted text-xs">{msg.proposal_horizon}</span>
                    )}
                    {msg.proposal_size && (
                      <span className="chip bg-bg text-muted text-xs">{msg.proposal_size}</span>
                    )}
                  </div>
                  <span className="text-xs text-muted shrink-0">{timeAgo(msg.created_at)}</span>
                </div>
                <p className="text-sm text-slate-700">{msg.proposal_thesis}</p>
                <p className="text-xs text-muted">— {msg.author_name ?? "Membre"}</p>
              </div>
            );
          }

          return (
            <div key={msg.id} className={`flex gap-2 ${isMe ? "flex-row-reverse" : ""}`}>
              {!isMe && <Avatar name={msg.author_name} />}
              <div className={`max-w-[78%] ${isMe ? "items-end" : "items-start"} flex flex-col gap-0.5`}>
                {!isMe && (
                  <span className="text-xs font-medium text-muted ml-1">
                    {msg.author_name ?? "Membre"}
                  </span>
                )}
                <div
                  className={`rounded-2xl px-4 py-2.5 text-sm leading-snug ${
                    isMe
                      ? "bg-brand text-white rounded-tr-sm"
                      : "bg-slate-100 text-ink rounded-tl-sm"
                  }`}
                >
                  {msg.content}
                </div>
                <span className={`text-[10px] text-muted ${isMe ? "mr-1 text-right" : "ml-1"}`}>
                  {timeAgo(msg.created_at)}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Formulaire proposition (inline, au-dessus du composer) */}
      {showProposalForm && (
        <form
          onSubmit={sendProposal}
          className="card-p mb-2 space-y-2 border border-brand/30 bg-brand/[0.02] shrink-0"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">💡 Proposer un investissement</span>
            <button
              type="button"
              onClick={() => setShowProposalForm(false)}
              className="text-muted hover:text-ink text-lg leading-none"
            >
              ×
            </button>
          </div>
          <div>
            <TickerSearch
              value={pTicker}
              onChange={(text) => {
                setPTicker(text.toUpperCase());
                setPTickerName("");
              }}
              onSelect={(symbol, name) => {
                setPTicker(symbol);
                setPTickerName(name);
              }}
            />
            {pTickerName && (
              <p className="mt-1 text-xs text-muted truncate">✓ {pTickerName}</p>
            )}
            {/* champ caché pour validation HTML required */}
            <input type="text" value={pTicker} required readOnly className="sr-only" tabIndex={-1} />
          </div>
          <textarea
            value={pThesis}
            onChange={(e) => setPThesis(e.target.value)}
            placeholder="Thèse d'investissement (obligatoire) — catalyseur, valorisation, risque principal…"
            className="input min-h-20 resize-none"
            required
            maxLength={500}
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              value={pSize}
              onChange={(e) => setPSize(e.target.value)}
              placeholder="Taille suggérée (ex : 5%)"
              className="input"
              maxLength={20}
            />
            <select
              value={pHorizon}
              onChange={(e) => setPHorizon(e.target.value)}
              className="input"
            >
              <option>Long terme</option>
              <option>Tactique</option>
              <option>Court terme</option>
            </select>
          </div>
          <button type="submit" disabled={sending} className="btn btn-primary w-full">
            {sending ? "Envoi…" : "Envoyer & notifier le groupe"}
          </button>
        </form>
      )}

      {/* Composer */}
      {error && <p className="text-sm text-danger mb-1 shrink-0">{error}</p>}
      <form onSubmit={sendText} className="flex gap-2 items-end shrink-0 pt-2 border-t border-line">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={demo ? "Connectez-vous pour écrire…" : "Votre message… (Entrée pour envoyer)"}
          disabled={demo}
          rows={1}
          className="input flex-1 resize-none min-h-[40px] max-h-32"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendText(e as unknown as React.FormEvent);
            }
          }}
        />
        <button
          type="button"
          onClick={() => setShowProposalForm((v) => !v)}
          disabled={demo}
          title="Proposer un investissement"
          className={`btn shrink-0 px-3 ${showProposalForm ? "bg-brand/10 border-brand/30 text-brand-600" : ""}`}
        >
          💡
        </button>
        <button
          type="submit"
          disabled={sending || demo || !text.trim()}
          className="btn btn-primary shrink-0 px-4"
        >
          ↑
        </button>
      </form>
    </div>
  );
}
