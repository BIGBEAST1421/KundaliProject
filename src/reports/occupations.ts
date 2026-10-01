import { dict } from "@/src/i18n/dict";
import type { Language } from "./types";

/** Canonical English values — stored on the report and sent to the AI prompt as context. */
export const OCCUPATIONS = ["Student", "Employed", "Business", "Government / Army", "Homemaker", "Retired", "Unemployed"] as const;

const OCCUPATION_KEY = {
  Student: "occ_student", Employed: "occ_employed", Business: "occ_business",
  "Government / Army": "occ_govt", Homemaker: "occ_homemaker", Retired: "occ_retired", Unemployed: "occ_unemployed",
} as const;

/** Display label for a stored occupation value, in the given language. Unknown values pass through unchanged. */
export function occupationLabel(value: string, lang: Language): string {
  const key = OCCUPATION_KEY[value as keyof typeof OCCUPATION_KEY];
  return key ? dict(lang)[key] : value;
}
