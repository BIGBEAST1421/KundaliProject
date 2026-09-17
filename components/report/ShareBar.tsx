"use client";

import { useState } from "react";
import { useI18n } from "@/src/i18n";
import { Button, LinkButton } from "@/components/ui/Button";

interface Props {
  sharePath: string;
  newHref: string;
  newLabel: string;
}

/** Copy public link · print-to-PDF · start again. Hidden in print. */
export function ShareBar({ sharePath, newHref, newLabel }: Props) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    const url = `${window.location.origin}${sharePath}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt(t("share_copy"), url);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="no-print flex flex-wrap items-center gap-2">
      <Button variant="secondary" onClick={copy} aria-live="polite">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" /></svg>
        {copied ? t("share_copied") : t("share_copy")}
      </Button>
      <Button variant="secondary" onClick={() => window.print()}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden><path d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14" /></svg>
        {t("share_pdf")}
      </Button>
      <LinkButton href={newHref} variant="ghost">{newLabel}</LinkButton>
    </div>
  );
}
