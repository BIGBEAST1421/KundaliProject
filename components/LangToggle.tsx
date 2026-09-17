"use client";

import { useI18n } from "@/src/i18n";

/** Segmented EN / हिं switch. */
export function LangToggle() {
  const { lang, setLang } = useI18n();
  const opt = (l: "en" | "hi", label: string) => (
    <button type="button" onClick={() => setLang(l)} aria-pressed={lang === l}
      className={`h-8 rounded-lg px-2.5 text-xs font-semibold transition-colors ${lang === l ? "bg-bg text-ink shadow-sm" : "text-muted hover:text-ink"}`}>
      {label}
    </button>
  );
  return (
    <div role="group" aria-label="Language" className="flex items-center gap-0.5 rounded-xl bg-surface-2 p-0.5">
      {opt("en", "EN")}
      {opt("hi", "हिं")}
    </div>
  );
}
