"use client";

import { motion, useReducedMotion } from "motion/react";
import { useI18n } from "@/src/i18n";
import { ALL_PILLARS, PILLAR_LABELS, isMinorDob } from "@/src/reports/pillars";
import type { Pillar } from "@/src/reports/types";

const ICON: Record<Pillar | "all", string> = {
  all: "M12 3l2.5 5 5.5.8-4 3.9.9 5.5L12 15.6 7.1 18.2l.9-5.5-4-3.9L9.5 8z",
  career: "M4 7h16v13H4zM9 7V4h6v3M4 12h16",
  love: "M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z",
  health: "M12 3v18M3 12h18",
  wealth: "M4 6h16v12H4zM8 6V4h8v2M12 10v4",
};

/** Selectable cards for focus areas. "Everything" selects all; picking a single card narrows.
 * When `dob` belongs to a minor, Love & Relationships (marriage predictions) is unavailable --
 * a report for a child should never generate marriage-timing content. */
export function PillarCards({ value, onChange, dob }: { value: Pillar[]; onChange: (v: Pillar[]) => void; dob?: string }) {
  const { t, lang } = useI18n();
  const reduce = useReducedMotion();
  const isMinor = !!dob && isMinorDob(dob);
  const available = isMinor ? ALL_PILLARS.filter((p) => p !== "love") : ALL_PILLARS;
  const all = available.every((p) => value.includes(p)) && value.every((p) => available.includes(p));
  const toggle = (p: Pillar) => {
    if (all) return onChange([p]);
    const next = value.includes(p) ? value.filter((x) => x !== p) : [...value, p];
    onChange(next.length === 0 ? [p] : available.filter((x) => next.includes(x)));
  };
  const card = (key: Pillar | "all", label: string, desc: string, selected: boolean, onClick: () => void, disabled = false) => (
    <motion.button key={key} type="button" role="checkbox" aria-checked={selected} aria-disabled={disabled} disabled={disabled} onClick={onClick}
      whileTap={reduce || disabled ? undefined : { scale: 0.985 }}
      className={`relative flex items-start gap-3 rounded-[var(--radius-card)] border p-4 text-left transition-colors ${disabled ? "cursor-not-allowed border-line bg-surface/30 opacity-60" : selected ? "border-accent bg-accent-soft/60" : "border-line bg-surface/50 hover:border-line-strong"}`}>
      <span className={`grid size-9 shrink-0 place-items-center rounded-lg ${selected && !disabled ? "bg-accent text-accent-ink" : "bg-surface-2 text-muted"}`}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden><path d={ICON[key]} /></svg>
      </span>
      <span>
        <span className="block font-semibold">{label}</span>
        <span className="mt-0.5 block text-sm text-muted">{desc}</span>
      </span>
      {!disabled && <span className={`absolute right-3 top-3 size-2.5 rounded-full ${selected ? "bg-accent" : "bg-line"}`} aria-hidden />}
    </motion.button>
  );
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="sm:col-span-2">{card("all", t("pillar_all"), t("pillar_all_d"), all, () => onChange([...available]))}</div>
      {ALL_PILLARS.map((p) => p === "love" && isMinor
        ? card(p, PILLAR_LABELS[p][lang], t("pillar_love_minor_d"), false, () => {}, true)
        : card(p, PILLAR_LABELS[p][lang], t(`pillar_${p}_d`), !all && value.includes(p), () => toggle(p)))}
    </div>
  );
}
