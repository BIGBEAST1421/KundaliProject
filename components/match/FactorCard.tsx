import type { Dict } from "@/src/i18n/en";
import type { MatchFactor, Language } from "@/src/reports/types";
import { signLabel, planetLabel, nakshatraLabel } from "@/src/astro/i18n";
import { VerdictBadge } from "@/components/ui/Badge";

interface Props {
  f: MatchFactor;
  d: Dict;
  boyName: string;
  girlName: string;
  lang?: Language;
}

// Only these three factors' boy/girl values are signs/planets/nakshatras — the rest (Varna,
// Vashya, Yoni, Gana, Nadi) use separate classification vocabulary not covered here.
const VALUE_LABEL: Partial<Record<string, (v: string, lang: Language) => string>> = {
  bhakoot: signLabel, maitri: planetLabel, tara: nakshatraLabel,
};

/** One koota: verdict, plain meaning, this couple's result, and both values side by side. */
export function FactorCard({ f, d, boyName, girlName, lang = "en" }: Props) {
  const label = d[`verdict_${f.verdict}`];
  const valueLabel = VALUE_LABEL[f.key];
  const boyValue = valueLabel ? valueLabel(f.boy, lang) : f.boy;
  const girlValue = valueLabel ? valueLabel(f.girl, lang) : f.girl;
  return (
    <div className="print-avoid h-full rounded-[var(--radius-card)] border border-line bg-bg p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-sans text-base font-semibold">{f.title}</h3>
          <p className="text-xs text-muted">{f.name}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-display text-xl">{f.points}<span className="text-sm text-muted">/{f.max}</span></span>
          <VerdictBadge verdict={f.verdict} label={label} />
        </div>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted">{f.meaning}</p>
      <p className="mt-2 text-sm leading-relaxed">{f.result}</p>
      <dl className="mt-4 grid grid-cols-2 gap-3 rounded-lg bg-surface p-3 text-sm">
        <div>
          <dt className="text-xs text-muted">{boyName}</dt>
          <dd className="font-medium">{boyValue}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted">{girlName}</dt>
          <dd className="font-medium">{girlValue}</dd>
        </div>
      </dl>
    </div>
  );
}
