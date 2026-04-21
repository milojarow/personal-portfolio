import { useTranslations } from "next-intl";
import { ArrowUpRight } from "lucide-react";

export default function WorkTable({
  projects,
  showCategoryHeader = false,
  categoryKey,
  title,
  dense = false,
}) {
  const t = useTranslations("work");

  if (projects.length === 0) return null;

  const headerText =
    title ?? (showCategoryHeader && categoryKey ? t(`categories.${categoryKey}`) : null);

  return (
    <div className="space-y-2">
      <table className="data-table">
        {headerText && (
          <thead>
            <tr>
              <th colSpan={2}>{headerText}</th>
            </tr>
          </thead>
        )}
        <tbody>
          {projects.map((project) => {
            const href = t(`projects.${project.slug}.href`);
            const hasHref = href && href.length > 0;
            const title = t(`projects.${project.slug}.title`);
            const summaryKey = dense ? "summaryShort" : "summary";
            let summary;
            try {
              summary = t(`projects.${project.slug}.${summaryKey}`);
            } catch {
              summary = t(`projects.${project.slug}.summary`);
            }

            return (
              <tr key={project.slug}>
                <td className="primary">
                  {hasHref ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1"
                    >
                      {title}
                      <ArrowUpRight
                        size={13}
                        className="text-base-content/40"
                        aria-hidden="true"
                      />
                    </a>
                  ) : (
                    <span>{title}</span>
                  )}
                </td>
                <td className="meta">{summary}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
