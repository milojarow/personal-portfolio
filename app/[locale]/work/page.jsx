import { getTranslations, setRequestLocale } from "next-intl/server";
import { groupByCategory, categories } from "@/lib/work";
import WorkTable from "@/components/content/WorkTable";

export default async function WorkPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "work" });

  const grouped = groupByCategory();

  return (
    <div className="fade-in">
      <div className="section-banner">
        <h1>{t("heading")}</h1>
      </div>
      <section className="section">
        <div className="body-prose mb-6">
          <p>{t("intro")}</p>
        </div>
        <div className="space-y-10">
          {categories.map((cat) =>
            grouped[cat].length > 0 ? (
              <WorkTable
                key={cat}
                projects={grouped[cat]}
                showCategoryHeader
                categoryKey={cat}
              />
            ) : null,
          )}
        </div>
      </section>
    </div>
  );
}
