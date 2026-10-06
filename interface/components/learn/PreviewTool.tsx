"use client";

// Aperçu local d'un module collé en JSON : tout reste dans le navigateur (rien n'est envoyé).
import { useState } from "react";
import { AlertTriangle, CheckCircle2, Eraser, Eye, MessageSquareText } from "lucide-react";
import { parseModule, type LearnModule } from "@/lib/learn/module";
import { EXAMPLE_MODULE } from "@/lib/learn/example";
import { ModuleView } from "./ModuleView";

type Result = { module: LearnModule | null; issues: string[]; error?: string };

// Retire les ``` éventuels et le texte autour de l'objet JSON.
function extractJson(text: string): string {
  const t = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  const a = t.indexOf("{"), b = t.lastIndexOf("}");
  return a >= 0 && b > a ? t.slice(a, b + 1) : t;
}

function run(text: string): Result {
  try {
    return parseModule(JSON.parse(extractJson(text)));
  } catch (e) {
    return { module: null, issues: [], error: `JSON illisible : ${(e as Error).message}. Demande à ton IA de redonner le JSON complet, dans un seul bloc de code.` };
  }
}

export function PreviewTool({ example }: { example: boolean }) {
  const initial = example ? JSON.stringify(EXAMPLE_MODULE, null, 2) : "";
  const [text, setText] = useState(initial);
  const [res, setRes] = useState<Result | null>(example ? run(initial) : null);

  function show() {
    setRes(run(text));
    setTimeout(() => document.getElementById("apercu")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="card p-4 md:p-5">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder='Colle ici le JSON complet, par exemple { "version_prompt": "2.1", "module": { … } }'
          className="input h-44 resize-y font-mono !text-[13px] md:h-56"
          spellCheck={false}
          aria-label="JSON du module"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={show} disabled={!text.trim()} className="btn btn-primary"><Eye size={16} /> Afficher l&apos;aperçu</button>
          <button type="button" onClick={() => { const t = JSON.stringify(EXAMPLE_MODULE, null, 2); setText(t); setRes(run(t)); }} className="btn">Charger l&apos;exemple</button>
          {text && <button type="button" onClick={() => { setText(""); setRes(null); }} className="btn btn-ghost text-muted"><Eraser size={15} /> Effacer</button>}
        </div>
      </div>

      {res && (
        <div id="apercu" className="flex scroll-mt-20 flex-col gap-5">
          {res.error ? (
            <div className="flex gap-3 rounded-2xl border border-danger/25 bg-danger/[0.05] p-4 text-[14px] leading-relaxed">
              <AlertTriangle size={18} className="mt-0.5 shrink-0 text-danger" /> {res.error}
            </div>
          ) : res.issues.length ? (
            <div className="rounded-2xl border border-ai/40 bg-ai/[0.08] p-4">
              <div className="mb-2 flex items-center gap-2 text-[14px] font-semibold"><AlertTriangle size={17} className="text-amber-700 dark:text-ai" /> {res.issues.length} remarque{res.issues.length > 1 ? "s" : ""} à corriger avec ton IA</div>
              <ul className="flex list-disc flex-col gap-1 pl-5 text-[14px] leading-snug">
                {res.issues.map((x, i) => <li key={i}>{x}</li>)}
              </ul>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-2xl border border-brand/25 bg-brand/[0.06] p-4 text-[14px] font-medium">
              <CheckCircle2 size={18} className="text-brand-600 dark:text-brand-500" /> Format correct : tu peux l&apos;envoyer à Clément.
            </div>
          )}
          {res.module?.notes && (
            <div className="well flex gap-3 p-4 text-[14px] leading-relaxed">
              <MessageSquareText size={17} className="mt-0.5 shrink-0 text-muted" />
              <span><span className="font-semibold">Notes pour Clément : </span>{res.module.notes}</span>
            </div>
          )}
          {res.module && (
            <div className="card p-4 md:p-8">
              <ModuleView module={res.module} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
