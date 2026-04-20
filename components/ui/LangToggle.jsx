"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useTransition } from "react";

export default function LangToggle() {
  const t = useTranslations("lang");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function switchTo(nextLocale) {
    if (nextLocale === locale || isPending) return;
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  }

  return (
    <div
      role="group"
      aria-label={t("label")}
      className="inline-flex items-center gap-0 text-xs font-medium"
    >
      <button
        type="button"
        onClick={() => switchTo("en")}
        className={`px-1.5 py-0.5 transition-colors ${
          locale === "en"
            ? "text-primary underline underline-offset-4"
            : "text-base-content/60 hover:text-primary"
        }`}
        aria-current={locale === "en" ? "true" : undefined}
      >
        {t("en")}
      </button>
      <span className="text-base-content/30" aria-hidden="true">·</span>
      <button
        type="button"
        onClick={() => switchTo("es")}
        className={`px-1.5 py-0.5 transition-colors ${
          locale === "es"
            ? "text-primary underline underline-offset-4"
            : "text-base-content/60 hover:text-primary"
        }`}
        aria-current={locale === "es" ? "true" : undefined}
      >
        {t("es")}
      </button>
    </div>
  );
}
