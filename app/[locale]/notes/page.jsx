import { getTranslations, setRequestLocale } from "next-intl/server";
import { getAllNotes } from "@/lib/notes";
import NotesTable from "@/components/content/NotesTable";

export default async function NotesPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "notes" });
  const notes = getAllNotes(locale);

  return (
    <div className="fade-in mx-auto max-w-4xl px-6 py-14">
      <header className="mb-12">
        <h1 className="text-3xl md:text-4xl mb-3">{t("heading")}</h1>
        <p className="text-base-content/70 max-w-2xl">{t("intro")}</p>
      </header>
      <NotesTable notes={notes} />
    </div>
  );
}
