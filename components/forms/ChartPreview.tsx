"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useI18n } from "@/src/i18n";
import { signLabel, nakshatraLabel, planetLabel } from "@/src/astro/i18n";
import { NorthChart } from "@/components/report/NorthChart";
import { CosmicLoader } from "@/components/ui/CosmicLoader";
import type { PersonFormValue } from "./PersonFields";

interface Preview { lagna: string; rashi: string; sunSign: string; d1: Record<string, string>; nakshatra: string; pada: number; mahadasha: string }

/** Debounced live chart while the user fills in birth details. */
export function ChartPreview({ value }: { value: PersonFormValue }) {
  const { t, lang } = useI18n();
  const [data, setData] = useState<Preview | null>(null);
  const [loading, setLoading] = useState(false);
  const ready = /^\d{4}-\d{2}-\d{2}$/.test(value.dob) && value.place.city.trim().length > 1;

  useEffect(() => {
    if (!ready) { setData(null); return; }
    const ctrl = new AbortController();
    const id = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/preview", { method: "POST", headers: { "Content-Type": "application/json" }, signal: ctrl.signal,
          body: JSON.stringify({ dob: value.dob, time: value.timeKnown ? value.time : "", city: value.place.city, state: value.place.state, country: value.place.country, lat: value.place.lat, lon: value.place.lon }) });
        if (res.ok) setData(await res.json());
      } catch { /* aborted */ } finally { setLoading(false); }
    }, 450);
    return () => { clearTimeout(id); ctrl.abort(); };
  }, [ready, value.dob, value.time, value.timeKnown, value.place.city, value.place.state, value.place.country, value.place.lat, value.place.lon]);

  return (
    <aside className="rounded-[var(--radius-card)] border border-line bg-surface/60 p-5">
      <h3 className="font-sans text-sm font-semibold">{t("preview_title")}</h3>
      <p className="mt-1 text-xs text-muted">{t("preview_sub")}</p>
      <div className="mt-4 min-h-[300px]">
        <AnimatePresence mode="wait">
          {!ready ? (
            <motion.p key="wait" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid h-[300px] place-items-center text-center text-sm text-muted">{t("preview_waiting")}</motion.p>
          ) : loading && !data ? (
            <motion.div key="load" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid h-[300px] place-items-center"><CosmicLoader size="sm" message={t("load_page")} /></motion.div>
          ) : data ? (
            <motion.div key="chart" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} className={loading ? "opacity-70 transition-opacity" : ""}>
              <NorthChart lagna={data.lagna} d1={data.d1} title={t("sec_chart")} lang={lang} />
              <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <dt className="text-muted">{t("lbl_lagna")}</dt><dd className="font-medium">{signLabel(data.lagna, lang)}</dd>
                <dt className="text-muted">{t("lbl_moonsign")}</dt><dd className="font-medium">{signLabel(data.rashi, lang)}</dd>
                <dt className="text-muted">{t("lbl_nakshatra")}</dt><dd className="font-medium">{nakshatraLabel(data.nakshatra, lang)} · {t("pada")} {data.pada}</dd>
                <dt className="text-muted">{t("lbl_mahadasha")}</dt><dd className="font-medium">{planetLabel(data.mahadasha, lang)}</dd>
              </dl>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </aside>
  );
}
