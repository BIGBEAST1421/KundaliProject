"use client";

import { useI18n } from "@/src/i18n";

export function LangToggle() {
  const { lang, setLang, t } = useI18n();
  return (
    <button type="button" onClick={() => setLang(lang === "en" ? "hi" : "en")}
      className="h-9 rounded-full border border-line-strong px-3 text-sm font-medium text-muted hover:text-ink hover:bg-surface transition-colors"
      aria-label={t("lang_toggle")}>
      {t("lang_toggle")}
    </button>
  );
}
