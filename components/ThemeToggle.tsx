"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/src/i18n";

type Theme = "light" | "dark" | "system";
const KEY = "theme";

function apply(theme: Theme) {
  const root = document.documentElement;
  if (theme === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", theme);
}

export function ThemeToggle() {
  const { t } = useI18n();
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY) as Theme | null;
      if (saved === "light" || saved === "dark") { setTheme(saved); apply(saved); }
    } catch { /* ignore */ }
  }, []);

  const resolvedDark = theme === "dark" || (theme === "system" && typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  const toggle = () => {
    const next: Theme = resolvedDark ? "light" : "dark";
    setTheme(next);
    apply(next);
    try { localStorage.setItem(KEY, next); } catch { /* ignore */ }
  };

  return (
    <button type="button" onClick={toggle} aria-label={t("theme_toggle")} title={t("theme_toggle")}
      className="grid size-9 place-items-center rounded-full text-muted hover:bg-surface hover:text-ink transition-colors">
      {resolvedDark ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" /></svg>
      )}
    </button>
  );
}
