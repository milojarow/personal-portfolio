import { getTranslations, setRequestLocale } from "next-intl/server";
import { getAllNotes } from "@/lib/notes";
import NotesTable from "@/components/content/NotesTable";

export default async function NotesPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "notes" });
  const notes = getAllNotes(locale);

  return (
    <div className="fade-in">
      <div className="section-banner">
        <h1>{t("heading")}</h1>
      </div>
      <section className="section">
        <div className="body-prose mb-6">
          <p>{t("intro")}</p>
        </div>
        <NotesTable notes={notes} title={t("heading")} />
      </section>
    </div>
  );
}
