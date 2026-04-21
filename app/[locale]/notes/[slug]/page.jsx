import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { getNoteBySlug, getAllSlugs } from "@/lib/notes";
import { Link } from "@/i18n/navigation";

export function generateStaticParams() {
  const slugs = getAllSlugs();
  return routing.locales.flatMap((locale) =>
    slugs.map((slug) => ({ locale, slug })),
  );
}

export async function generateMetadata({ params }) {
  const { locale, slug } = await params;
  const note = await getNoteBySlug(slug, locale);
  if (!note) return {};
  return {
    title: note.title,
    description: note.description,
  };
}

export default async function NotePage({ params }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const note = await getNoteBySlug(slug, locale);
  if (!note) notFound();

  const t = await getTranslations({ locale, namespace: "notes" });
  const formatted = new Intl.DateTimeFormat(
    locale === "es" ? "es-MX" : "en-US",
    { year: "numeric", month: "long", day: "numeric" },
  ).format(new Date(note.date));

  return (
    <div className="fade-in">
      <Link
        href="/notes"
        className="text-xs uppercase tracking-widest text-base-content/60 hover:text-accent transition-colors mt-6 mb-8 inline-block"
      >
        {t("backToIndex")}
      </Link>
      <article className="prose-article">
        <h1>{note.title}</h1>
        <p className="text-sm text-base-content/60 mono -mt-3 mb-10 not-prose">
          <span>{formatted}</span>
          <span className="text-base-content/30 mx-2" aria-hidden="true">·</span>
          <span>
            {note.readingTime} {t("readingTimeSuffix")}
          </span>
        </p>
        {note.isFallback && (
          <p className="bg-base-200 border border-base-300 px-4 py-2 text-sm rounded-sm mb-8 not-prose">
            {t("fallbackNotice")}
          </p>
        )}
        <div dangerouslySetInnerHTML={{ __html: note.html }} />
      </article>
    </div>
  );
}
