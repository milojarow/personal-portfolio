"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const t = useTranslations("theme");
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("rolando-theme");
    const initial = stored === "rolando-dark"
      ? true
      : stored === "rolando-light"
        ? false
        : window.matchMedia("(prefers-color-scheme: dark)").matches;
    setIsDark(initial);
    document.documentElement.setAttribute(
      "data-theme",
      initial ? "rolando-dark" : "rolando-light",
    );
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    const theme = next ? "rolando-dark" : "rolando-light";
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("rolando-theme", theme);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={t("toggleLabel")}
      className="inline-flex items-center justify-center w-7 h-7 rounded-sm text-base-content/75 hover:text-primary transition-colors"
    >
      {mounted && (isDark ? <Sun size={16} /> : <Moon size={16} />)}
      {!mounted && <span className="w-4 h-4" aria-hidden="true" />}
    </button>
  );
}
