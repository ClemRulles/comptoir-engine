import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getAppData, isConfigured } from "@/lib/data";
import { fetchMemoryMarkdown } from "@/lib/github";
import { SectionTitle } from "@/components/Kpi";

export const dynamic = "force-dynamic";

export default async function BriefPage() {
  const data = await getAppData();
  const trends = isConfigured() ? await fetchMemoryMarkdown("trends.md") : null;

  return (
    <div className="space-y-4">
      <div className="card-p">
        <SectionTitle>Brief de la semaine</SectionTitle>
        {data.brief ? (
          <div className="prose-hi">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{data.brief}</ReactMarkdown>
          </div>
        ) : (
          <p className="text-sm text-muted">
            Le brief sera généré chaque vendredi par le moteur dans{" "}
            <code>memory/morning-brief.md</code>.
          </p>
        )}
      </div>

      {trends && (
        <div className="card-p">
          <SectionTitle>Détail de la tendance</SectionTitle>
          <div className="prose-hi">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{trends}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
