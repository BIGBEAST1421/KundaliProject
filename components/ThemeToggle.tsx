"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/src/i18n";

type Theme = "light" | "dark";
const KEY = "theme";

function apply(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

/** Light/dark toggle. Renders a neutral icon until mounted to avoid hydration mismatches. */
export function ThemeToggle() {
  const { t } = useI18n();
  const [dark, setDark] = useState<boolean | null>(null);

  useEffect(() => {
    let saved: Theme | null = null;
    try { saved = localStorage.getItem(KEY) as Theme | null; } catch { /* ignore */ }
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const isDark = saved ? saved === "dark" : mq.matches;
    setDark(isDark);
    const onChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem(KEY)) setDark(e.matches);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const toggle = () => {
    const next: Theme = dark ? "light" : "dark";
    setDark(next === "dark");
    apply(next);
    try { localStorage.setItem(KEY, next); } catch { /* ignore */ }
  };

  return (
    <button type="button" onClick={toggle} aria-label={t("theme_toggle")} title={t("theme_toggle")}
      className="grid size-9 place-items-center rounded-full text-muted hover:bg-surface hover:text-ink transition-colors">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
        {dark === null ? (
          <circle cx="12" cy="12" r="4" />
        ) : dark ? (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </>
        ) : (
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
        )}
      </svg>
    </button>
  );
}
