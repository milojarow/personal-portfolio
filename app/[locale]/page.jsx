import { getTranslations, setRequestLocale } from "next-intl/server";
import { getFeaturedProjects } from "@/lib/work";
import { getAllNotes } from "@/lib/notes";
import { Link } from "@/i18n/navigation";
import WorkTable from "@/components/content/WorkTable";
import NotesTable from "@/components/content/NotesTable";

export default async function HomePage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "home" });

  const featured = getFeaturedProjects();
  const notes = getAllNotes(locale).slice(0, 5);

  return (
    <div className="fade-in">
      <div className="section-banner">
        <h1>{t("welcomeHeading")}</h1>
      </div>

      <section id="welcome" className="section">
        <div className="body-prose">
          <p>{t("welcomeBody1")}</p>
          <p>
            {t.rich("welcomeBody2", {
              icarus: (chunks) => (
                <Link href="/notes/icarus-black-box">{chunks}</Link>
              ),
            })}
          </p>
          <p>
            {t.rich("welcomeBody3", {
              posteacasa: (chunks) => (
                <a
                  href="https://posteacasa.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {chunks}
                </a>
              ),
              blindando: (chunks) => (
                <a
                  href="https://blindandosuenos.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {chunks}
                </a>
              ),
              chatbots: (chunks) => (
                <Link href="/notes/n8n-chatbots-before-claude-code">
                  {chunks}
                </Link>
              ),
            })}
          </p>
          <p>
            {t.rich("welcomeBody4", {
              telegram: (chunks) => (
                <a
                  href="https://t.me/milojarow"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {chunks}
                </a>
              ),
              discord: (chunks) => <code>{chunks}</code>,
            })}
          </p>
        </div>
      </section>

      <section id="projects" className="section">
        <h2 className="section-title">{t("projectsHeading")}</h2>
        <WorkTable projects={featured} title={t("projectsHeading")} dense />
        <div className="mt-4">
          <Link href="/work" className="text-sm text-primary hover:text-accent transition-colors">
            → {t("allProjects")}
          </Link>
        </div>
      </section>

      <section id="notes" className="section">
        <h2 className="section-title">{t("notesHeading")}</h2>
        <NotesTable notes={notes} title={t("notesHeading")} />
        <div className="mt-4">
          <Link href="/notes" className="text-sm text-primary hover:text-accent transition-colors">
            → {t("allNotes")}
          </Link>
        </div>
      </section>

      <section id="tools" className="section">
        <h2 className="section-title">{t("toolsHeading")}</h2>
        <div className="body-prose">
          <p>{t("toolsBody")}</p>
        </div>
      </section>
    </div>
  );
}
