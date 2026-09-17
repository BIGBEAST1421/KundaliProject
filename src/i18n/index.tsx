"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Dict } from "./en";
import type { Language } from "@/src/reports/types";
import { DICTS } from "./dict";
const STORAGE_KEY = "lang";

type StringKey = { [K in keyof Dict]: Dict[K] extends string ? K : never }[keyof Dict];
type ListKey = { [K in keyof Dict]: Dict[K] extends readonly string[] ? K : never }[keyof Dict];

interface I18n {
  lang: Language;
  setLang: (l: Language) => void;
  /** Translate a string key, interpolating `{name}` placeholders. */
  t: (key: StringKey, vars?: Record<string, string | number>) => string;
  list: (key: ListKey) => readonly string[];
}

const I18nContext = createContext<I18n | null>(null);

export function I18nProvider({ children, initial = "en" }: { children: ReactNode; initial?: Language }) {
  const [lang, setLangState] = useState<Language>(initial);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "en" || saved === "hi") setLangState(saved);
    } catch { /* storage unavailable */ }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Language) => {
    setLangState(l);
    try { localStorage.setItem(STORAGE_KEY, l); } catch { /* ignore */ }
  }, []);

  const value = useMemo<I18n>(() => {
    const dict = DICTS[lang];
    return {
      lang,
      setLang,
      t: (key, vars) => {
        let s = dict[key] as string;
        if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
        return s;
      },
      list: (key) => dict[key] as readonly string[],
    };
  }, [lang, setLang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18n {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return ctx;
}

