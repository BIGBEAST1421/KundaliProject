"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/src/i18n";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { LangToggle } from "./LangToggle";

export function SiteHeader() {
  const { t } = useI18n();
  const path = usePathname();
  const link = (href: string, label: string) => (
    <Link href={href} aria-current={path === href ? "page" : undefined}
      className={`rounded-full px-3 py-1.5 text-sm transition-colors ${path === href ? "text-ink font-medium bg-surface" : "text-muted hover:text-ink"}`}>
      {label}
    </Link>
  );
  return (
    <header className="no-print sticky top-0 z-30 border-b border-line bg-bg/85 backdrop-blur-sm">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6" aria-label="Main">
        <Link href="/" className="shrink-0"><Logo text={t("brand")} /></Link>
        <div className="hidden sm:flex items-center gap-1">
          {link("/app", t("nav_report"))}
          {link("/match", t("nav_match"))}
        </div>
        <div className="flex items-center gap-1.5">
          <LangToggle />
          <ThemeToggle />
        </div>
      </nav>
      <div className="sm:hidden flex gap-1 px-4 pb-2">
        {link("/app", t("nav_report"))}
        {link("/match", t("nav_match"))}
      </div>
    </header>
  );
}
