import { useTranslations } from "next-intl";

export default function Sidebar() {
  const t = useTranslations("home");
  const th = useTranslations("nav");

  const items = [
    { id: "welcome", label: t("welcomeHeading") },
    { id: "projects", label: t("projectsHeading") },
    { id: "notes", label: t("notesHeading") },
    { id: "tools", label: t("toolsHeading") },
  ];

  return (
    <nav aria-label={th("tableOfContents")}>
      <div className="toc-header">{th("tableOfContents")}</div>
      <ul className="toc-list">
        {items.map((item) => (
          <li key={item.id}>
            <a href={`#${item.id}`}>{item.label}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
