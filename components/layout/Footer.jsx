import { useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-base-300 mt-24">
      <div className="mx-auto max-w-4xl px-6 py-10 space-y-6">
        <section>
          <h2 className="text-xs uppercase tracking-widest text-base-content/60 mb-3">
            {t("contactHeading")}
          </h2>
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <li>
              <a
                href={`mailto:${t("email")}`}
                className="hover:text-primary transition-colors mono"
              >
                {t("email")}
              </a>
            </li>
            <li>
              <a
                href={`https://wa.me/${t("whatsapp").replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors mono"
              >
                {t("whatsapp")}
              </a>
            </li>
            <li>
              <a
                href={`https://t.me/${t("telegram").replace("@", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors mono"
              >
                {t("telegram")}
              </a>
            </li>
            <li>
              <a
                href={`https://${t("github")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors mono"
              >
                {t("github")}
              </a>
            </li>
          </ul>
        </section>
        <hr className="border-base-300" />
        <section className="text-xs text-base-content/55 space-y-1">
          <p>{t("copyright", { year })}</p>
          <p>{t("colophon")}</p>
        </section>
      </div>
    </footer>
  );
}
