"use client";

import { useI18n } from "@/src/i18n";
import { ALL_PILLARS, PILLAR_LABELS, isAllPillars } from "@/src/reports/pillars";
import type { Pillar } from "@/src/reports/types";
import { Chip } from "@/components/ui/Chip";

interface Props {
  value: Pillar[];
  onChange: (v: Pillar[]) => void;
}

/** Multi-select pillar chips. "Everything" toggles all four. At least one stays selected. */
export function PillarPicker({ value, onChange }: Props) {
  const { t, lang } = useI18n();
  const all = isAllPillars(value);
  const toggle = (p: Pillar) => {
    const next = value.includes(p) ? value.filter((x) => x !== p) : [...value, p];
    onChange(next.length === 0 ? [p] : ALL_PILLARS.filter((x) => next.includes(x)));
  };
  return (
    <fieldset>
      <legend className="text-sm font-medium">{t("lbl_pillars")}</legend>
      <p className="mt-1 text-xs text-muted">{t("pillars_hint")}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Chip selected={all} onToggle={() => onChange([...ALL_PILLARS])}>{t("pillar_all")}</Chip>
        {ALL_PILLARS.map((p) => (
          <Chip key={p} selected={!all && value.includes(p)} onToggle={() => (all ? onChange([p]) : toggle(p))}>
            {PILLAR_LABELS[p][lang]}
          </Chip>
        ))}
      </div>
    </fieldset>
  );
}
