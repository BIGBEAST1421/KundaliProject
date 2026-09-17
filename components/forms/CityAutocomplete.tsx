"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useI18n } from "@/src/i18n";
import type { CityMatch } from "@/src/lib/cities";
import { Field, Input } from "./Field";

export interface PickedCity {
  city: string;
  state: string;
  country: string;
  lat: number | null;
  lon: number | null;
}

interface Props {
  value: PickedCity;
  onChange: (v: PickedCity) => void;
  error?: string;
  label: string;
}

/** City input with ranked suggestions from /api/geocode. Free text is allowed (server geocodes). */
export function CityAutocomplete({ value, onChange, error, label }: Props) {
  const { t } = useI18n();
  const id = useId();
  const [query, setQuery] = useState(value.city);
  const [results, setResults] = useState<CityMatch[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim().length < 2 || value.lat != null) { setResults([]); return; }
    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`, { signal: ctrl.signal });
        const data = (await res.json()) as { results: CityMatch[] };
        setResults(data.results);
        setOpen(data.results.length > 0);
      } catch { /* aborted or offline — keep typing */ }
    }, 150);
    return () => { clearTimeout(timer); ctrl.abort(); };
  }, [query, value.lat]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => { if (!wrap.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const pick = (c: CityMatch) => {
    setQuery(`${c.c}, ${c.s}`);
    onChange({ city: c.c, state: c.s, country: c.co, lat: c.lat, lon: c.lon });
    setOpen(false);
    setResults([]);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (!open) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === "Enter" && active >= 0) { e.preventDefault(); pick(results[active]); }
    else if (e.key === "Escape") setOpen(false);
  };

  return (
    <Field label={label} htmlFor={id} error={error} hint={value.lat != null ? `✓ ${t("city_picked")}` : t("city_hint")}>
      <div ref={wrap} className="relative">
        <Input
          id={id} value={query} autoComplete="off" spellCheck={false} placeholder={t("ph_city")}
          role="combobox" aria-expanded={open} aria-controls={`${id}-list`} aria-autocomplete="list"
          onChange={(e) => { setQuery(e.target.value); onChange({ city: e.target.value, state: "", country: "India", lat: null, lon: null }); setActive(-1); }}
          onFocus={() => results.length && setOpen(true)}
          onKeyDown={onKey}
        />
        {open && (
          <ul id={`${id}-list`} role="listbox" className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-line bg-bg p-1 shadow-card">
            {results.map((c, i) => (
              <li key={`${c.c}|${c.s}`} role="option" aria-selected={i === active}
                onMouseDown={(e) => { e.preventDefault(); pick(c); }}
                className={`cursor-pointer rounded-md px-3 py-2 text-sm ${i === active ? "bg-surface" : "hover:bg-surface"}`}>
                <span className="font-medium">{c.c}</span><span className="text-muted">, {c.s} · {c.co}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Field>
  );
}
