"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import LangToggle from "@/components/ui/LangToggle";
import ThemeToggle from "@/components/ui/ThemeToggle";

export default function Nav() {
  const t = useTranslations("nav");
  const pathname = usePathname();

  const items = [
    { href: "/", key: "home" },
    { href: "/work", key: "work" },
    { href: "/notes", key: "notes" },
    { href: "/cv", key: "cv" },
  ];

  function isActive(href) {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <header className="border-b border-base-300">
      <nav className="mx-auto max-w-4xl px-6 py-5 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="text-sm font-medium tracking-tight hover:text-primary transition-colors"
        >
          rolandoahuja.com
        </Link>
        <ul className="flex items-center gap-5 text-sm">
          {items.map((item) => (
            <li key={item.key}>
              <Link
                href={item.href}
                className={`transition-colors hover:text-primary ${
                  isActive(item.href)
                    ? "text-primary"
                    : "text-base-content/75"
                }`}
              >
                {t(item.key)}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/#about"
              className="transition-colors text-base-content/75 hover:text-primary"
            >
              {t("about")}
            </Link>
          </li>
        </ul>
        <div className="flex items-center gap-3">
          <LangToggle />
          <span className="h-4 w-px bg-base-300" aria-hidden="true" />
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
