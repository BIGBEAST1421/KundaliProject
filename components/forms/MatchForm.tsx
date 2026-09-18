"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useI18n } from "@/src/i18n";
import { postJson, ClientApiError } from "@/src/lib/api-client";
import { Button } from "@/components/ui/Button";
import { CosmicLoader } from "@/components/ui/CosmicLoader";
import { ErrorState } from "@/components/ui/States";
import { PersonFields, emptyPerson, validatePerson, type PersonErrors, type PersonFormValue } from "./PersonFields";
import { Stepper } from "./Stepper";
import { ChartPreview } from "./ChartPreview";

const EASE = [0.22, 1, 0.36, 1] as const;
const toPayload = (p: PersonFormValue) => ({
  name: p.name, dob: p.dob, time: p.time, timeKnown: p.timeKnown && !!p.time,
  city: p.place.city, state: p.place.state, country: p.place.country, lat: p.place.lat, lon: p.place.lon,
});

export function MatchForm() {
  const { t, list, lang } = useI18n();
  const router = useRouter();
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [boy, setBoy] = useState(emptyPerson);
  const [girl, setGirl] = useState(emptyPerson);
  const [errors, setErrors] = useState<{ boy: PersonErrors; girl: PersonErrors }>({ boy: {}, girl: {} });
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const steps = [t("lbl_groom"), t("lbl_bride"), t("step_review")];
  const go = (n: number) => { setDir(n > step ? 1 : -1); setStep(n); };
  const next = () => {
    if (step === 0) { const e = validatePerson(boy, t); setErrors((s) => ({ ...s, boy: e })); if (Object.keys(e).length) return; }
    if (step === 1) { const e = validatePerson(girl, t); setErrors((s) => ({ ...s, girl: e })); if (Object.keys(e).length) return; }
    go(step + 1);
  };

  const submit = async () => {
    setStatus("loading");
    try {
      const { uid } = await postJson<{ uid: string }>("/api/match", { boy: toPayload(boy), girl: toPayload(girl), language: lang }, t("err_generic"), t("err_network"));
      router.push(`/match/${uid}`);
    } catch (err) {
      setErrorMsg(err instanceof ClientApiError ? err.message : t("err_generic"));
      setStatus("error");
    }
  };

  if (status === "loading") {
    return <div className="sky flex min-h-[50vh] items-center justify-center"><CosmicLoader message={t("load_match")} steps={list("load_steps_match")} /></div>;
  }

  const panel = (key: string, children: React.ReactNode) => (
    <motion.div key={key} initial={reduce ? false : { opacity: 0, x: 32 * dir, filter: "blur(4px)" }} animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
      exit={reduce ? undefined : { opacity: 0, x: -24 * dir, filter: "blur(4px)", transition: { duration: 0.18 } }} transition={{ duration: 0.4, ease: EASE }}>
      {children}
    </motion.div>
  );

  const personStep = (label: string, value: PersonFormValue, onChange: (v: PersonFormValue) => void, errs: PersonErrors, prefix: string, ph: string) => (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="rounded-[var(--radius-card)] border border-line bg-bg/60 p-6 shadow-card md:p-8">
        <h2 className="text-2xl md:text-3xl">{label}</h2>
        <p className="mt-1 text-muted">{t("birth_sub")}</p>
        <div className="mt-6"><PersonFields value={value} onChange={onChange} errors={errs} idPrefix={prefix} namePlaceholder={ph} /></div>
      </div>
      <ChartPreview value={value} />
    </div>
  );

  const summary = (label: string, p: PersonFormValue) => (
    <div className="rounded-[var(--radius-card)] border border-line bg-surface/60 p-5">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 font-display text-2xl">{p.name}</p>
      <p className="mt-1 text-sm text-muted">{p.dob}{p.timeKnown && p.time ? ` · ${p.time}` : ` · ${t("time_unknown_badge")}`} · {p.place.city}{p.place.state ? `, ${p.place.state}` : ""}</p>
    </div>
  );

  return (
    <form onSubmit={(e) => { e.preventDefault(); step < 2 ? next() : submit(); }} noValidate>
      <Stepper steps={steps} current={step} label={t("step_of", { n: step + 1, total: 3 })} onJump={go} />
      <AnimatePresence mode="wait" initial={false}>
        {step === 0 && panel("boy", personStep(t("lbl_groom"), boy, setBoy, errors.boy, "boy", t("ph_groom")))}
        {step === 1 && panel("girl", personStep(t("lbl_bride"), girl, setGirl, errors.girl, "girl", t("ph_bride")))}
        {step === 2 && panel("review",
          <div className="rounded-[var(--radius-card)] border border-line bg-bg/60 p-6 shadow-card md:p-8">
            <h2 className="text-2xl md:text-3xl">{t("review_title")}</h2>
            <p className="mt-1 text-muted">{t("review_sub")}</p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">{summary(t("lbl_groom"), boy)}{summary(t("lbl_bride"), girl)}</div>
            {status === "error" && <div className="mt-6"><ErrorState title={t("err_title")} message={errorMsg} retryLabel={t("err_retry")} onRetry={submit} /></div>}
          </div>
        )}
      </AnimatePresence>
      <div className="mt-6 flex items-center justify-between gap-3">
        <Button type="button" variant="ghost" onClick={() => go(step - 1)} disabled={step === 0}>← {t("btn_back")}</Button>
        {step < 2 ? <Button type="submit" size="lg">{t("btn_next")} →</Button> : <Button type="submit" size="lg">✦ {t("btn_match")}</Button>}
      </div>
    </form>
  );
}
