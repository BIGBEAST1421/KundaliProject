import type { Dict } from "@/src/i18n/en";
import type { MatchFactor } from "@/src/reports/types";
import { VerdictBadge } from "@/components/ui/Badge";

interface Props {
  f: MatchFactor;
  d: Dict;
  boyName: string;
  girlName: string;
}

/** One koota: verdict, plain meaning, this couple's result, and both values side by side. */
export function FactorCard({ f, d, boyName, girlName }: Props) {
  const label = d[`verdict_${f.verdict}`];
  return (
    <li className="print-avoid rounded-[var(--radius-card)] border border-line bg-bg p-5">
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
          <dd className="font-medium">{f.boy}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted">{girlName}</dt>
          <dd className="font-medium">{f.girl}</dd>
        </div>
      </dl>
    </li>
  );
}
