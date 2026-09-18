"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useI18n } from "@/src/i18n";
import { ALL_PILLARS } from "@/src/reports/pillars";
import type { Pillar } from "@/src/reports/types";
import { postJson, ClientApiError } from "@/src/lib/api-client";
import { Button } from "@/components/ui/Button";
import { CosmicLoader } from "@/components/ui/CosmicLoader";
import { ErrorState } from "@/components/ui/States";
import { Field, Input, Select } from "./Field";
import { PersonFields, emptyPerson, validatePerson, type PersonErrors } from "./PersonFields";
import { Stepper } from "./Stepper";
import { ChartPreview } from "./ChartPreview";
import { PillarCards } from "./PillarCards";

const OCCUPATIONS = ["Student", "Employed", "Business", "Government / Army", "Homemaker", "Retired", "Unemployed"];
const EASE = [0.22, 1, 0.36, 1] as const;

export function ReportForm() {
  const { t, list, lang } = useI18n();
  const router = useRouter();
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [person, setPerson] = useState(emptyPerson);
  const [gender, setGender] = useState("");
  const [occupation, setOccupation] = useState("");
  const [marital, setMarital] = useState("Unmarried");
  const [pillars, setPillars] = useState<Pillar[]>([...ALL_PILLARS]);
  const [errors, setErrors] = useState<PersonErrors>({});
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const steps = [t("step_who"), t("step_birth"), t("step_focus")];

  const go = (n: number) => { setDir(n > step ? 1 : -1); setStep(n); };
  const next = () => {
    if (step === 0) {
      if (!person.name.trim()) { setErrors({ name: t("required_note") }); return; }
      setErrors({});
    }
    if (step === 1) {
      const e = validatePerson(person, t);
      delete e.name;
      setErrors(e);
      if (Object.keys(e).length) return;
    }
    go(step + 1);
  };

  const submit = async () => {
    const errs = validatePerson(person, t);
    if (Object.keys(errs).length) { setErrors(errs); go(errs.name ? 0 : 1); return; }
    setStatus("loading");
    try {
      const { slug } = await postJson<{ uid: string; slug: string }>("/api/reports", {
        name: person.name, dob: person.dob, time: person.time, timeKnown: person.timeKnown && !!person.time,
        city: person.place.city, state: person.place.state, country: person.place.country,
        lat: person.place.lat, lon: person.place.lon,
        gender, occupation, maritalStatus: marital, pillars, language: lang,
      }, t("err_generic"), t("err_network"));
      router.push(`/${encodeURIComponent(slug)}`);
    } catch (err) {
      setErrorMsg(err instanceof ClientApiError ? err.message : t("err_generic"));
      setStatus("error");
    }
  };

  if (status === "loading") {
    return (
      <div className="sky flex min-h-[50vh] items-center justify-center">
        <CosmicLoader message={t("load_generate")} steps={list("load_steps_report")} />
      </div>
    );
  }

  const panel = (key: string, children: React.ReactNode) => (
    <motion.div key={key}
      initial={reduce ? false : { opacity: 0, x: 32 * dir, filter: "blur(4px)" }}
      animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
      exit={reduce ? undefined : { opacity: 0, x: -24 * dir, filter: "blur(4px)", transition: { duration: 0.18 } }}
      transition={{ duration: 0.4, ease: EASE }}>
      {children}
    </motion.div>
  );

  return (
    <form onSubmit={(e) => { e.preventDefault(); step < 2 ? next() : submit(); }} noValidate>
      <Stepper steps={steps} current={step} label={t("step_of", { n: step + 1, total: 3 })} onJump={go} />

      <AnimatePresence mode="wait" initial={false}>
        {step === 0 && panel("who",
          <div className="rounded-[var(--radius-card)] border border-line bg-bg/60 p-6 shadow-card md:p-8">
            <h2 className="text-2xl md:text-3xl">{t("who_title")}</h2>
            <p className="mt-1 text-muted">{t("who_sub")}</p>
            <div className="mt-6 grid gap-5">
              <Field label={t("lbl_name")} htmlFor="p-name" error={errors.name}>
                <Input id="p-name" value={person.name} placeholder={t("ph_name")} autoComplete="name" maxLength={80} autoFocus
                  onChange={(e) => setPerson({ ...person, name: e.target.value })} />
              </Field>
              <div className="grid gap-5 sm:grid-cols-3">
                <Field label={t("lbl_gender")} htmlFor="gender">
                  <Select id="gender" value={gender} onChange={(e) => setGender(e.target.value)}>
                    <option value="">{t("opt_gender_none")}</option><option value="Male">{t("opt_male")}</option><option value="Female">{t("opt_female")}</option><option value="Other">{t("opt_other")}</option>
                  </Select>
                </Field>
                <Field label={t("lbl_occupation")} htmlFor="occupation">
                  <Select id="occupation" value={occupation} onChange={(e) => setOccupation(e.target.value)}>
                    <option value="">{t("opt_occ_none")}</option>{OCCUPATIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                  </Select>
                </Field>
                <Field label={t("lbl_marital")} htmlFor="marital">
                  <Select id="marital" value={marital} onChange={(e) => setMarital(e.target.value)}>
                    <option value="Unmarried">{t("opt_unmarried")}</option><option value="Married">{t("opt_married")}</option><option value="Separated/Divorced">{t("opt_separated")}</option><option value="Widowed">{t("opt_widowed")}</option>
                  </Select>
                </Field>
              </div>
            </div>
          </div>
        )}

        {step === 1 && panel("birth",
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="rounded-[var(--radius-card)] border border-line bg-bg/60 p-6 shadow-card md:p-8">
              <h2 className="text-2xl md:text-3xl">{t("birth_title")}</h2>
              <p className="mt-1 text-muted">{t("birth_sub")}</p>
              <div className="mt-6">
                <PersonFields value={person} onChange={setPerson} errors={errors} idPrefix="p" namePlaceholder={t("ph_name")} hideName />
              </div>
            </div>
            <ChartPreview value={person} />
          </div>
        )}

        {step === 2 && panel("focus",
          <div className="rounded-[var(--radius-card)] border border-line bg-bg/60 p-6 shadow-card md:p-8">
            <h2 className="text-2xl md:text-3xl">{t("focus_title")}</h2>
            <p className="mt-1 text-muted">{t("focus_sub")}</p>
            <div className="mt-6"><PillarCards value={pillars} onChange={setPillars} /></div>
            <p className="mt-6 text-sm text-muted">{t("review_line", { name: person.name, dob: person.dob, place: person.place.city })}</p>
            {status === "error" && <div className="mt-6"><ErrorState title={t("err_title")} message={errorMsg} retryLabel={t("err_retry")} onRetry={submit} /></div>}
          </div>
        )}
      </AnimatePresence>

      <div className="mt-6 flex items-center justify-between gap-3">
        <Button type="button" variant="ghost" onClick={() => go(step - 1)} disabled={step === 0}>← {t("btn_back")}</Button>
        {step < 2
          ? <Button type="submit" size="lg">{t("btn_next")} →</Button>
          : <Button type="submit" size="lg">✦ {t("btn_generate")}</Button>}
      </div>
    </form>
  );
}
