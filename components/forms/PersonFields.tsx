"use client";

import { useI18n } from "@/src/i18n";
import { Field, Input } from "./Field";
import { CityAutocomplete, type PickedCity } from "./CityAutocomplete";

export interface PersonFormValue {
  name: string;
  dob: string;
  time: string;
  timeKnown: boolean;
  place: PickedCity;
}

export const emptyPerson = (): PersonFormValue => ({
  name: "", dob: "", time: "", timeKnown: true,
  place: { city: "", state: "", country: "India", lat: null, lon: null },
});

export type PersonErrors = Partial<Record<"name" | "dob" | "time" | "city", string>>;

export function validatePerson(v: PersonFormValue, t: (k: "required_note") => string): PersonErrors {
  const e: PersonErrors = {};
  if (!v.name.trim()) e.name = t("required_note");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v.dob)) e.dob = t("required_note");
  if (!v.place.city.trim()) e.city = t("required_note");
  return e;
}

interface Props {
  value: PersonFormValue;
  onChange: (v: PersonFormValue) => void;
  errors?: PersonErrors;
  idPrefix: string;
  namePlaceholder: string;
  /** Multi-step forms collect the name on an earlier step. */
  hideName?: boolean;
}

/** Name, DOB, time (with unknown toggle) and place — shared by report and match forms. */
export function PersonFields({ value, onChange, errors = {}, idPrefix, namePlaceholder, hideName }: Props) {
  const { t } = useI18n();
  const set = <K extends keyof PersonFormValue>(k: K, v: PersonFormValue[K]) => onChange({ ...value, [k]: v });
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {!hideName && <div className="sm:col-span-2">
        <Field label={t("lbl_name")} htmlFor={`${idPrefix}-name`} error={errors.name}>
          <Input id={`${idPrefix}-name`} value={value.name} placeholder={namePlaceholder} autoComplete="name" maxLength={80}
            onChange={(e) => set("name", e.target.value)} />
        </Field>
      </div>}
      <Field label={t("lbl_dob")} htmlFor={`${idPrefix}-dob`} error={errors.dob}>
        <Input id={`${idPrefix}-dob`} type="date" value={value.dob} max={today} min="1900-01-01" onChange={(e) => set("dob", e.target.value)} />
      </Field>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor={`${idPrefix}-time`} className="text-sm font-medium">{t("lbl_time")}</label>
          <label className="flex items-center gap-1.5 text-xs text-muted cursor-pointer select-none">
            <input type="checkbox" className="accent-[var(--accent)]" checked={!value.timeKnown}
              onChange={(e) => onChange({ ...value, timeKnown: !e.target.checked, time: e.target.checked ? "" : value.time })} />
            {t("lbl_time_unknown")}
          </label>
        </div>
        <Input id={`${idPrefix}-time`} type="time" value={value.time} disabled={!value.timeKnown} onChange={(e) => set("time", e.target.value)} />
        {!value.timeKnown && <p className="text-xs text-muted">{t("time_unknown_hint")}</p>}
      </div>
      <div className="sm:col-span-2">
        <CityAutocomplete label={t("lbl_city")} value={value.place} onChange={(p) => set("place", p)} error={errors.city} />
      </div>
    </div>
  );
}
