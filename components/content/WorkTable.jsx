import { useTranslations } from "next-intl";
import { ArrowUpRight } from "lucide-react";

export default function WorkTable({ projects, showCategoryHeader = false, categoryKey }) {
  const t = useTranslations("work");

  if (projects.length === 0) return null;

  return (
    <div className="space-y-3">
      {showCategoryHeader && categoryKey && (
        <h3 className="text-xs uppercase tracking-widest text-base-content/60 pt-2">
          {t(`categories.${categoryKey}`)}
        </h3>
      )}
      <table className="data-table">
        <tbody>
          {projects.map((project) => {
            const href = t(`projects.${project.slug}.href`);
            const hasHref = href && href.length > 0;
            const title = t(`projects.${project.slug}.title`);
            const summary = t(`projects.${project.slug}.summary`);

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
