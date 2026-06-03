import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { fetchMemoryMarkdown } from "@/lib/github";

export const dynamic = "force-dynamic";

export default async function BriefPage() {
  const brief = await fetchMemoryMarkdown("morning-brief.md");
  const trends = await fetchMemoryMarkdown("trends.md");

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Brief & tendance de la semaine</h1>

      <div className="card">
        {brief ? (
          <div className="prose-comptoir">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{brief}</ReactMarkdown>
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            Aucun brief pour l&apos;instant. Il sera généré par la routine du vendredi dans{" "}
            <code>memory/morning-brief.md</code> (lecture via le token GitHub).
          </p>
        )}
      </div>

      {trends && (
        <div className="card">
          <h2 className="mb-2 text-lg font-semibold">Détail de la tendance</h2>
          <div className="prose-comptoir">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{trends}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
