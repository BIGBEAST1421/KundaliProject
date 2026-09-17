"use client";

import Link from "next/link";
import { useI18n } from "@/src/i18n";
import { Logo } from "./Logo";

export function SiteFooter() {
  const { t } = useI18n();
  return (
    <footer className="no-print mt-24 border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <Logo text={t("brand")} />
          <p className="mt-2 max-w-sm text-sm text-muted">{t("footer_made")}</p>
        </div>
        <div className="flex gap-5 text-sm text-muted">
          <Link href="/app" className="hover:text-ink">{t("nav_report")}</Link>
          <Link href="/match" className="hover:text-ink">{t("nav_match")}</Link>
        </div>
      </div>
    </footer>
  );
}
