import type { Dict } from "@/src/i18n/en";
import type { ChartSummary, Language } from "@/src/reports/types";
import { planetLabel } from "@/src/astro/i18n";
import { bhriguPredictions } from "@/src/astro/bhrigu";

/** Bhrigu Samhita: one prediction per planet, looked up by Ascendant + actual house placement. */
export function BhriguView({ chart, d, lang }: { chart: ChartSummary; d: Dict; lang: Language }) {
  const predictions = bhriguPredictions(chart, lang);
  if (predictions.length === 0) return <p className="rounded-[var(--radius-card)] border border-line bg-surface p-5 text-sm text-muted">{d.no_facts}</p>;

  return (
    <div>
      <p className="text-sm text-muted">{d.bhrigu_sub}</p>
      <ul className="mt-4 grid gap-4 sm:grid-cols-2">
        {predictions.map((p) => (
          <li key={p.planet} className="print-avoid rounded-[var(--radius-card)] border border-line p-5">
            <div className="flex items-baseline justify-between gap-2">
              <p className="font-sans text-base font-semibold">{planetLabel(p.planet, lang)}</p>
              <span className="text-xs text-muted">{d.col_house} {p.house}</span>
            </div>
            <p className="mt-2 text-sm leading-relaxed">{p.text}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
