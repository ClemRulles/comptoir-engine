import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
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
      <footer className="mx-auto mt-4 flex w-full max-w-2xl flex-col gap-4 border-t border-line pt-5">
        <p className="text-[12px] leading-relaxed text-muted">
          Écrit par {m.auteur} avec l&apos;aide de son IA, relu avant publication. Ce module explique et fait découvrir : ce n&apos;est pas un conseil d&apos;investissement.
        </p>
        {next && next.slug !== m.slug && (
          <Link href={`/apprendre/${next.slug}`} className="card lift flex items-center gap-3 p-4">
            <span className="text-[22px]" aria-hidden>{next.emoji || "📘"}</span>
            <span className="min-w-0 flex-1">
              <span className="block text-[12px] text-muted">Module suivant</span>
              <span className="block truncate text-[15px] font-semibold">{next.titre}</span>
            </span>
            <ArrowRight size={16} className="text-muted" />
          </Link>
        )}
      </footer>
    </div>
  );
}
