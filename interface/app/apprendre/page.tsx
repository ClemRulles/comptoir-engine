import Link from "next/link";
import { BookOpen, Clock, Eye, PenLine } from "lucide-react";
import { Card, CardHead, Empty, PageHeader } from "@/components/ui";
import { CopyPrompt } from "@/components/learn/CopyPrompt";
import { MODULES } from "@/lib/learn/registry";
import { readingMinutes } from "@/lib/learn/module";

export const dynamic = "force-dynamic";

const STEPS = [
  "Copie le prompt et colle-le dans ton IA (Claude, ChatGPT…).",
  "Réponds à ses questions : ton sujet, ton vécu, ton ton.",
  "Relis la version lisible et ajuste jusqu'à ce que ça te ressemble.",
  "Colle le JSON final dans l'aperçu pour le voir en vrai, puis envoie-le à Clément.",
];

export default async function ApprendrePage({ searchParams }: { searchParams: Promise<{ tag?: string }> }) {
  const { tag } = await searchParams;
  const tags = [...new Set(MODULES.flatMap((m) => m.etiquettes))].sort();
  const list = tag ? MODULES.filter((m) => m.etiquettes.includes(tag)) : MODULES;

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <PageHeader
        eyebrow="Écrits par les membres"
        title="Apprendre"
        lead="Des petits modules à lire en quelques minutes, chacun écrit par un membre du club sur ce qu'il connaît. On découvre, on ne révise pas."
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:items-start">
        <section className="flex flex-col gap-3 lg:col-span-8" aria-label="Modules">
          {tags.length > 1 && (
            <div className="-mx-3 flex gap-1.5 overflow-x-auto px-3 pb-1 sm:-mx-4 sm:px-4 md:mx-0 md:flex-wrap md:px-0">
              <Link href="/apprendre" scroll={false} className={`chip shrink-0 border ${!tag ? "border-ink bg-ink text-card" : "border-line bg-card text-muted hover:text-ink"}`}>Tous</Link>
              {tags.map((t) => (
                <Link key={t} href={`/apprendre?tag=${encodeURIComponent(t)}`} scroll={false} className={`chip shrink-0 border ${tag === t ? "border-ink bg-ink text-card" : "border-line bg-card text-muted hover:text-ink"}`}>{t}</Link>
              ))}
            </div>
          )}

          {list.length === 0 ? (
            <Card>
              <Empty icon={BookOpen} title={MODULES.length ? "Aucun module avec cette étiquette" : "Le premier module arrive bientôt"}>
                {MODULES.length
                  ? "Essaie une autre étiquette."
                  : "Personne n'a encore publié de module. Tu as un sujet qui te passionne ? La carte « Écris ton module » t'aide à l'écrire avec ton IA."}
              </Empty>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {list.map((m) => (
                <Link key={m.slug} href={`/apprendre/${m.slug}`} className="card lift group flex flex-col gap-3 p-4 md:p-5">
                  <div className="flex items-start gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-[22px]" aria-hidden>{m.emoji || "📘"}</span>
                    <div className="min-w-0">
                      <h2 className="text-[16px] font-semibold leading-snug tracking-tight group-hover:text-brand-600 dark:group-hover:text-brand-500">{m.titre}</h2>
                      <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[12px] text-muted">
                        <span>par {m.auteur}</span>
                        <span className="inline-flex items-center gap-1"><Clock size={12} /> {readingMinutes(m)} min</span>
                      </div>
                    </div>
                  </div>
                  {m.resume && <p className="line-clamp-2 text-[14px] leading-relaxed text-muted">{m.resume}</p>}
                  {m.etiquettes.length > 0 && (
                    <div className="mt-auto flex flex-wrap gap-1.5">
                      {m.etiquettes.map((t) => <span key={t} className="chip bg-slate-100 text-slate-600">{t}</span>)}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </section>

        <aside className="lg:sticky lg:top-20 lg:col-span-4">
          <Card>
            <CardHead icon={PenLine} title="Écris ton module" sub="Sur ce que tu maîtrises ou ce qui te passionne, avec l'aide de ton IA." />
            <ol className="mb-4 flex flex-col gap-2.5">
              {STEPS.map((s, i) => (
                <li key={i} className="flex gap-3 text-[14px] leading-snug">
                  <span className="num flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand/10 text-[12px] font-bold text-brand-600 dark:text-brand-500">{i + 1}</span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
            <CopyPrompt />
            <div className="mt-4 grid grid-cols-2 gap-2 border-t border-line pt-4">
              <Link href="/apprendre/apercu" className="btn text-[13px]"><Eye size={15} /> Aperçu</Link>
              <Link href="/apprendre/apercu?exemple=1" className="btn text-[13px]"><BookOpen size={15} /> Exemple</Link>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
