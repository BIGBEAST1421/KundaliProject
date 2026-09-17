"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/src/i18n";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { LangToggle } from "./LangToggle";
import { LinkButton } from "./ui/Button";

export function SiteHeader() {
  const { t } = useI18n();
  const path = usePathname();
  const isActive = (href: string) => path === href || (href !== "/" && path.startsWith(href + "/"));
  const link = (href: string, label: string) => (
    <Link href={href} aria-current={isActive(href) ? "page" : undefined}
      className={`relative rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive(href) ? "text-ink" : "text-muted hover:text-ink"}`}>
      {label}
      {isActive(href) && <span className="absolute inset-x-3 -bottom-[13px] h-0.5 rounded-full bg-accent" aria-hidden />}
    </Link>
  );

  return (
    <header className="no-print sticky top-0 z-30 border-b border-line bg-bg/90 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6" aria-label="Main">
        <Link href="/" className="shrink-0"><Logo text={t("brand")} /></Link>
        <div className="hidden md:flex items-center gap-1">
          {link("/app", t("nav_report"))}
          {link("/match", t("nav_match"))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <LangToggle />
          <ThemeToggle />
          <LinkButton href="/app" size="sm" className="hidden sm:inline-flex">{t("nav_cta")}</LinkButton>
        </div>
      </nav>
      <div className="md:hidden flex gap-1 px-3 pb-2">
        {link("/app", t("nav_report"))}
        {link("/match", t("nav_match"))}
      </div>
    </header>
  );
}
