"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/src/i18n";
import { ALL_PILLARS } from "@/src/reports/pillars";
import type { Pillar } from "@/src/reports/types";
import { postJson, ClientApiError } from "@/src/lib/api-client";
import { Button } from "@/components/ui/Button";
import { CosmicLoader } from "@/components/ui/CosmicLoader";
import { ErrorState } from "@/components/ui/States";
import { Field, Select } from "./Field";
import { PersonFields, emptyPerson, validatePerson, type PersonErrors } from "./PersonFields";
import { PillarPicker } from "./PillarPicker";

const OCCUPATIONS = ["Student", "Employed", "Business", "Government / Army", "Homemaker", "Retired", "Unemployed"];

export function ReportForm() {
  const { t, list, lang } = useI18n();
  const router = useRouter();
  const [person, setPerson] = useState(emptyPerson);
  const [gender, setGender] = useState("");
  const [occupation, setOccupation] = useState("");
  const [marital, setMarital] = useState("Unmarried");
  const [pillars, setPillars] = useState<Pillar[]>([...ALL_PILLARS]);
  const [errors, setErrors] = useState<PersonErrors>({});
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const errs = validatePerson(person, t);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setStatus("loading");
    try {
      const { slug } = await postJson<{ uid: string; slug: string }>("/api/reports", {
        name: person.name, dob: person.dob, time: person.time, timeKnown: person.timeKnown && !!person.time,
        city: person.place.city, state: person.place.state, country: person.place.country,
        lat: person.place.lat, lon: person.place.lon,
        gender, occupation, maritalStatus: marital, pillars, language: lang,
      }, t("err_generic"), t("err_network"));
      // The URL is the navigation state; the report page fetches from Supabase.
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

  return (
    <form onSubmit={submit} noValidate className="space-y-8">
      <PersonFields value={person} onChange={setPerson} errors={errors} idPrefix="p" namePlaceholder={t("ph_name")} />

      <div className="grid gap-5 sm:grid-cols-3">
        <Field label={t("lbl_gender")} htmlFor="gender">
          <Select id="gender" value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="">{t("opt_gender_none")}</option>
            <option value="Male">{t("opt_male")}</option>
            <option value="Female">{t("opt_female")}</option>
            <option value="Other">{t("opt_other")}</option>
          </Select>
        </Field>
        <Field label={t("lbl_occupation")} htmlFor="occupation">
          <Select id="occupation" value={occupation} onChange={(e) => setOccupation(e.target.value)}>
            <option value="">{t("opt_occ_none")}</option>
            {OCCUPATIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </Select>
        </Field>
        <Field label={t("lbl_marital")} htmlFor="marital">
          <Select id="marital" value={marital} onChange={(e) => setMarital(e.target.value)}>
            <option value="Unmarried">{t("opt_unmarried")}</option>
            <option value="Married">{t("opt_married")}</option>
            <option value="Separated/Divorced">{t("opt_separated")}</option>
            <option value="Widowed">{t("opt_widowed")}</option>
          </Select>
        </Field>
      </div>

      <PillarPicker value={pillars} onChange={setPillars} />

      {status === "error" && (
        <ErrorState title={t("err_title")} message={errorMsg} retryLabel={t("err_retry")} onRetry={() => submit()} />
      )}

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" size="lg">{t("btn_generate")}</Button>
        <p className="text-sm text-muted">{t("required_note")}</p>
      </div>
    </form>
  );
}
