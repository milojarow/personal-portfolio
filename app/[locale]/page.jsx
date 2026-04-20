import { getTranslations, setRequestLocale } from "next-intl/server";
import { getFeaturedProjects } from "@/lib/work";
import { getAllNotes } from "@/lib/notes";
import { Link } from "@/i18n/navigation";
import Avatar from "@/components/ui/Avatar";
import WorkTable from "@/components/content/WorkTable";
import NotesTable from "@/components/content/NotesTable";

export default async function HomePage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "home" });

  const featured = getFeaturedProjects();
  const notes = getAllNotes(locale).slice(0, 3);

  return (
    <div className="fade-in mx-auto max-w-4xl px-6 pt-14 pb-4">
      <section className="flex items-start gap-5 mb-16">
        <Avatar size={72} priority />
        <div className="flex-1 space-y-2">
          <h1 className="text-3xl md:text-4xl">{t("name")}</h1>
          <p className="text-lg text-base-content/85 max-w-2xl leading-snug">
            {t("positioning")}
          </p>
          <p className="text-sm text-base-content/60 mono pt-1">
            {t("location")} · {t("availability")}
          </p>
        </div>
      </section>

      <section className="mb-14">
        <div className="flex items-baseline justify-between mb-2">
          <h2 className="text-xl">{t("selectedWorkHeading")}</h2>
          <Link
            href="/work"
            className="text-xs uppercase tracking-widest text-base-content/60 hover:text-primary transition-colors"
          >
            {t("viewAllWork")} →
          </Link>
        </div>
        <WorkTable projects={featured} />
      </section>

      <section className="mb-20">
        <div className="flex items-baseline justify-between mb-2">
          <h2 className="text-xl">{t("recentNotesHeading")}</h2>
          <Link
            href="/notes"
            className="text-xs uppercase tracking-widest text-base-content/60 hover:text-primary transition-colors"
          >
            {t("viewAllNotes")} →
          </Link>
        </div>
        <NotesTable notes={notes} />
      </section>

      <section
        id="about"
        className="border-t border-base-300 pt-12 mb-4 scroll-mt-20"
      >
        <h2 className="text-2xl mb-6">{t("aboutHeading")}</h2>
        <div className="space-y-5 max-w-2xl text-base-content/85 leading-relaxed">
          <p>{t("aboutParagraph1")}</p>
          <p>{t("aboutParagraph2")}</p>
          <p>{t("aboutParagraph3")}</p>
        </div>
      </section>
    </div>
  );
}
