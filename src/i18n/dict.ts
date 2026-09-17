import { en, type Dict } from "./en";
import { hi } from "./hi";
import type { Language } from "@/src/reports/types";

export const DICTS: Record<Language, Dict> = { en, hi };

/** Fixed-language lookup — safe in server components (used to render stored reports). */
export function dict(lang: Language): Dict {
  return DICTS[lang];
}
