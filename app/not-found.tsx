"use client";

import { EmptyState } from "@/components/ui/States";
import { useI18n } from "@/src/i18n";

export default function NotFound() {
  const { t } = useI18n();
  return (
    <main className="px-4">
      <EmptyState title={t("nf_title")} message={t("nf_sub")} ctaLabel={t("nf_cta")} ctaHref="/app" secondaryLabel={t("nf_home")} secondaryHref="/" />
    </main>
  );
}
