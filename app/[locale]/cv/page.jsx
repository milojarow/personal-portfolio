import { setRequestLocale } from "next-intl/server";
import CardCV from "@/components/content/CardCV";

export default async function CvPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  // CardCV uses 'eng'/'esp' internally; map next-intl locale to its vocabulary
  const initialLanguage = locale === "es" ? "esp" : "eng";

  return (
    <div className="fade-in">
      <CardCV initialLanguage={initialLanguage} />
    </div>
  );
}
