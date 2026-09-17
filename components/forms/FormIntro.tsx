"use client";

import { useI18n } from "@/src/i18n";

export function FormIntro({ kind }: { kind: "report" | "match" }) {
  const { t } = useI18n();
  return (
    <header className="fade-up">
      <h1 className="text-4xl md:text-5xl">{kind === "report" ? t("form_title") : t("match_form_title")}</h1>
      <p className="mt-3 max-w-prose text-lg text-muted">{kind === "report" ? t("form_sub") : t("match_form_sub")}</p>
    </header>
  );
}
