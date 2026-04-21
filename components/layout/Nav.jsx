"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import LangToggle from "@/components/ui/LangToggle";

export default function Nav() {
  const t = useTranslations("nav");
  const pathname = usePathname();

  const items = [
    { href: "/", key: "home" },
    { href: "/work", key: "work" },
    { href: "/notes", key: "notes" },
  ];

  function isActive(href) {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <nav className="tab-nav">
      <div className="tab-nav-inner">
        {items.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            className={isActive(item.href) ? "active" : ""}
          >
            {t(item.key)}
          </Link>
        ))}
        <div className="tab-nav-controls">
          <LangToggle />
        </div>
      </div>
    </nav>
  );
}
