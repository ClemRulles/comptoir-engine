import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { PreviewTool } from "@/components/learn/PreviewTool";

export default function ApercuPage() {
  return (
    <div className="flex flex-col gap-5">
      <Link href="/apprendre" className="link w-fit !text-muted hover:!text-ink"><ArrowLeft size={15} /> Apprendre</Link>
      <PageHeader
        eyebrow="Avant d'envoyer"
        title="Aperçu d'un module"
        lead="Colle ici le JSON donné par ton IA pour voir ton module comme dans l'app, avec la liste de ce qui cloche. Rien n'est enregistré ni envoyé."
      />
      <PreviewTool />
    </div>
  );
}
