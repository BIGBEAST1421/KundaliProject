"use client";

import { useEffect } from "react";
import { useI18n } from "@/src/i18n";
import { ErrorState } from "@/components/ui/States";
import { LinkButton } from "@/components/ui/Button";

/** Route error boundary: plain message, retry, way home. Technical details go to the console only. */
export default function RouteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { t } = useI18n();
  useEffect(() => { console.error(error); }, [error]);
  return (
    <main className="mx-auto max-w-lg px-4 py-24">
      <ErrorState title={t("err_title")} message={t("err_generic")} retryLabel={t("err_retry")} onRetry={reset} />
      <div className="mt-6 text-center"><LinkButton href="/" variant="ghost">{t("back_home")}</LinkButton></div>
    </main>
  );
}
