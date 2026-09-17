"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/src/i18n";
import { postJson, ClientApiError } from "@/src/lib/api-client";
import { Button } from "@/components/ui/Button";
import { CosmicLoader } from "@/components/ui/CosmicLoader";
import { ErrorState } from "@/components/ui/States";
import { PersonFields, emptyPerson, validatePerson, type PersonErrors, type PersonFormValue } from "./PersonFields";

const toPayload = (p: PersonFormValue) => ({
  name: p.name, dob: p.dob, time: p.time, timeKnown: p.timeKnown && !!p.time,
  city: p.place.city, state: p.place.state, country: p.place.country, lat: p.place.lat, lon: p.place.lon,
});

export function MatchForm() {
  const { t, list, lang } = useI18n();
  const router = useRouter();
  const [boy, setBoy] = useState(emptyPerson);
  const [girl, setGirl] = useState(emptyPerson);
  const [errors, setErrors] = useState<{ boy: PersonErrors; girl: PersonErrors }>({ boy: {}, girl: {} });
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const errs = { boy: validatePerson(boy, t), girl: validatePerson(girl, t) };
    setErrors(errs);
    if (Object.keys(errs.boy).length || Object.keys(errs.girl).length) return;
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
    return (
      <div className="sky flex min-h-[50vh] items-center justify-center">
        <CosmicLoader message={t("load_match")} steps={list("load_steps_match")} />
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-10">
      <div className="grid gap-10 lg:grid-cols-2">
        <fieldset className="rounded-[var(--radius-card)] border border-line p-6">
          <legend className="px-2 font-display text-xl">{t("lbl_groom")}</legend>
          <PersonFields value={boy} onChange={setBoy} errors={errors.boy} idPrefix="boy" namePlaceholder={t("ph_groom")} />
        </fieldset>
        <fieldset className="rounded-[var(--radius-card)] border border-line p-6">
          <legend className="px-2 font-display text-xl">{t("lbl_bride")}</legend>
          <PersonFields value={girl} onChange={setGirl} errors={errors.girl} idPrefix="girl" namePlaceholder={t("ph_bride")} />
        </fieldset>
      </div>

      {status === "error" && (
        <ErrorState title={t("err_title")} message={errorMsg} retryLabel={t("err_retry")} onRetry={() => submit()} />
      )}

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" size="lg">{t("btn_match")}</Button>
        <p className="text-sm text-muted">{t("required_note")}</p>
      </div>
    </form>
  );
}
