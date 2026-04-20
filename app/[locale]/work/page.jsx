import { getTranslations, setRequestLocale } from "next-intl/server";
import { groupByCategory, categories } from "@/lib/work";
import WorkTable from "@/components/content/WorkTable";

export default async function WorkPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "work" });

  const grouped = groupByCategory();

  return (
    <div className="fade-in mx-auto max-w-4xl px-6 py-14">
      <header className="mb-12">
        <h1 className="text-3xl md:text-4xl mb-3">{t("heading")}</h1>
        <p className="text-base-content/70 max-w-2xl">{t("intro")}</p>
      </header>
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
    </div>
  );
}
