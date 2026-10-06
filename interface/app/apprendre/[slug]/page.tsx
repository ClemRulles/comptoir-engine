import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, PenLine } from "lucide-react";
import { ModuleView } from "@/components/learn/ModuleView";
import { getModule, MODULES } from "@/lib/learn/registry";

export function generateStaticParams() {
  return MODULES.map((m) => ({ slug: m.slug }));
}

export default async function ModulePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const m = getModule(slug);
  if (!m) notFound();
  const i = MODULES.findIndex((x) => x.slug === slug);
  const next = MODULES[(i + 1) % MODULES.length];

  return (
    <div className="flex flex-col gap-5">
      <Link href="/apprendre" className="link w-fit !text-muted hover:!text-ink"><ArrowLeft size={15} /> Tous les modules</Link>
      <ModuleView module={m} />
      <footer className="mt-6 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_220px] lg:gap-14">
        <div className="mx-auto flex w-full max-w-[680px] flex-col gap-4">
        <div className="w-full rounded-3xl border border-line bg-card p-5 shadow-soft md:p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-gradient text-[16px] font-bold text-white">{m.auteur.charAt(0).toUpperCase()}</span>
            <div>
              <div className="text-[15px] font-semibold">Écrit par {m.auteur}</div>
              <div className="text-[13px] text-muted">avec l&apos;aide de son IA, relu avant publication</div>
            </div>
          </div>
          <p className="mt-4 text-[12px] leading-relaxed text-muted">Ce module explique et fait découvrir : ce n&apos;est pas un conseil d&apos;investissement.</p>
          <Link href="/apprendre" className="btn mt-4 w-full sm:w-auto"><PenLine size={15} /> Écrire mon module</Link>
        </div>
        {next && next.slug !== m.slug && (
          <Link href={`/apprendre/${next.slug}`} className="card lift flex w-full items-center gap-3 rounded-3xl p-5">
            <span className="text-[26px]" aria-hidden>{next.emoji || "📘"}</span>
            <span className="min-w-0 flex-1">
              <span className="block text-[12px] text-muted">Module suivant</span>
              <span className="block truncate text-[16px] font-semibold">{next.titre}</span>
            </span>
            <ArrowRight size={17} className="text-muted" />
          </Link>
        )}
        </div>
      </footer>
    </div>
  );
}
