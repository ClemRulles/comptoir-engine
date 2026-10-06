"use client";

// Copie le prompt de co-écriture dans le presse-papiers (repli : sélection manuelle) et permet
// de le lire avant de le copier.
import { useRef, useState } from "react";
import { Check, ChevronDown, Copy } from "lucide-react";
import { MODULE_PROMPT, PROMPT_VERSION } from "@/lib/learn/prompt";

export function CopyPrompt() {
  const [state, setState] = useState<"idle" | "ok" | "manual">("idle");
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);

  async function copy() {
    try {
      await navigator.clipboard.writeText(MODULE_PROMPT);
      setState("ok");
      setTimeout(() => setState("idle"), 2500);
    } catch {
      // Presse-papiers refusé (ancien navigateur, permission) : on affiche le texte sélectionné.
      setShow(true);
      setState("manual");
      setTimeout(() => ref.current?.select(), 50);
    }
  }

  return (
    <div>
      <button type="button" onClick={copy} className="btn btn-primary w-full py-3 text-[15px]">
        {state === "ok" ? <Check size={17} /> : <Copy size={17} />}
        {state === "ok" ? "Prompt copié !" : "Copier le prompt"}
      </button>
      {state === "manual" && <p className="mt-2 text-[12px] text-muted">Copie automatique impossible : le texte est sélectionné ci-dessous, copie-le à la main.</p>}
      <button type="button" onClick={() => setShow((s) => !s)} className="mt-2 inline-flex w-full items-center justify-center gap-1 text-[13px] font-medium text-muted hover:text-ink" aria-expanded={show}>
        {show ? "Masquer le prompt" : "Lire le prompt avant de copier"}
        <ChevronDown size={14} className={`transition-transform ${show ? "rotate-180" : ""}`} />
      </button>
      {show && (
        <textarea
          ref={ref}
          readOnly
          value={MODULE_PROMPT}
          className="input mt-2 h-72 resize-y font-mono !text-[12px] leading-relaxed"
          aria-label={`Prompt de création de module, version ${PROMPT_VERSION}`}
        />
      )}
    </div>
  );
}
