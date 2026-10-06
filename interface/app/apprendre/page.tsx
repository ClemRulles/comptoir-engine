import Link from "next/link";
import { BookOpen, Clock, Eye, PenLine } from "lucide-react";
import { Card, CardHead, Empty, PageHeader } from "@/components/ui";
import { CopyPrompt } from "@/components/learn/CopyPrompt";
import { MODULES } from "@/lib/learn/registry";
import { readingMinutes } from "@/lib/learn/module";

export const dynamic = "force-dynamic";

const STEPS = [
  "Copie le prompt et colle-le dans ton IA (Claude, ChatGPT…).",
  "Lâche-toi : le sujet, la forme et le ton sont libres, tant que ça parle d'argent.",
  "Ajuste avec ton IA jusqu'à ce que ça te ressemble.",
  "Vérifie le rendu dans l'aperçu, puis envoie-le à Clément.",
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
                  : "Personne n'a encore publié de module. Tu as un sujet qui te passionne ? La carte « Écris ton module » t'aide à l'écrire avec ton IA."}
              </Empty>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {list.map((m, idx) => {
                const cover = m.look?.cover?.url;
                const featured = idx === 0 && list.length % 2 === 1;
                return (
                  <Link
                    key={m.slug}
                    href={`/apprendre/${m.slug}`}
                    data-accent={m.look?.accent ?? "vert"}
                    className={`learn group relative isolate flex flex-col overflow-hidden rounded-[26px] border border-line/70 bg-card shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift ${featured ? "md:col-span-2" : ""}`}
                  >
                    <div className={`relative overflow-hidden ${featured ? "h-48 md:h-64" : "h-40"} ${cover ? "bg-[#0b1220]" : ""}`}>
                      {cover ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={cover} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" style={{ objectPosition: m.look?.cover?.position ?? "center" }} />
                          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                        </>
                      ) : (
                        <div aria-hidden className="absolute inset-0">
                          <div className="absolute -left-10 -top-16 h-48 w-48 rounded-full bg-[rgb(var(--acc)/0.25)] blur-3xl" />
                          <div className="absolute -right-10 top-4 h-40 w-40 rounded-full bg-[rgb(var(--acc2)/0.2)] blur-3xl" />
                          <div className="dot-grid absolute inset-0 opacity-40" />
                        </div>
                      )}
                      <span className="absolute bottom-3 left-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/85 text-[24px] shadow-sm backdrop-blur dark:bg-black/40" aria-hidden>{m.emoji || "📘"}</span>
                      <span className="absolute bottom-3 right-4 inline-flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1 text-[12px] font-medium text-white backdrop-blur"><Clock size={12} /> {readingMinutes(m)} min</span>
                    </div>
                    <div className="flex flex-1 flex-col gap-2 p-5">
                      <h2 className={`font-semibold leading-snug tracking-tight transition-colors group-hover:text-[rgb(var(--acc-ink))] ${featured ? "text-[20px] md:text-[24px]" : "text-[17px]"}`}>{m.titre}</h2>
                      {m.resume && <p className="line-clamp-2 text-[14px] leading-relaxed text-muted">{m.resume}</p>}
                      <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-2">
                        <span className="mr-1 text-[12px] text-muted">par <span className="font-medium text-ink">{m.auteur}</span></span>
                        {m.etiquettes.map((t) => <span key={t} className="chip bg-[rgb(var(--acc)/0.10)] text-[rgb(var(--acc-ink))]">{t}</span>)}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        <aside className="lg:sticky lg:top-20 lg:col-span-4">
          <Card>
            <CardHead icon={PenLine} title="Écris ton module" sub="Une histoire, ton parcours, une idée reçue à démonter, un jeu… Surprends-nous." />
            <ol className="mb-4 flex flex-col gap-2.5">
              {STEPS.map((s, i) => (
                <li key={i} className="flex gap-3 text-[14px] leading-snug">
                  <span className="num flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand/10 text-[12px] font-bold text-brand-600 dark:text-brand-500">{i + 1}</span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
            <CopyPrompt />
            <Link href="/apprendre/apercu" className="btn mt-4 w-full text-[13px]"><Eye size={15} /> Voir mon module avant de l&apos;envoyer</Link>
          </Card>
        </aside>
      </div>
    </div>
  );
}
