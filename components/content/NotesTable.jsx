import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";

function formatDate(dateInput, locale) {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  return new Intl.DateTimeFormat(locale === "es" ? "es-MX" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export default function NotesTable({ notes, title }) {
  const t = useTranslations("notes");
  const locale = useLocale();

  if (!notes || notes.length === 0) {
    return <p className="text-sm text-base-content/60 py-4">{t("emptyState")}</p>;
  }

  return (
    <table className="data-table data-table-notes">
      {title && (
        <thead>
          <tr>
            <th colSpan={2}>{title}</th>
          </tr>
        </thead>
      )}
      <tbody>
        {notes.map((note) => (
          <tr key={note.slug}>
            <td className="primary">
              <Link href={`/notes/${note.slug}`}>{note.title}</Link>
            </td>
            <td className="meta">
              <span className="mono">{formatDate(note.date, locale)}</span>
              <span className="text-base-content/30 mx-2" aria-hidden="true">·</span>
              <span>
                {note.readingTime} {t("readingTimeSuffix")}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
