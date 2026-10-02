import type { Dict } from "@/src/i18n/en";
import type { ChartSummary, Language } from "@/src/reports/types";
import { planetLabel } from "@/src/astro/i18n";
import { bhriguPredictions } from "@/src/astro/bhrigu";
import { Badge } from "@/components/ui/Badge";

interface Props {
  chart: ChartSummary;
  d: Dict;
  lang: Language;
  /** Grounded 2-3 sentence AI synthesis naming the current dasha lord's reading (report.core.bhriguSynthesis). Absent on reports created before this field shipped. */
  synthesis?: string;
}

/** Bhrigu Samhita: one prediction per planet, looked up by Ascendant + actual house placement. */
export function BhriguView({ chart, d, lang, synthesis }: Props) {
  const predictions = bhriguPredictions(chart, lang);
  if (predictions.length === 0) return <p className="rounded-[var(--radius-card)] border border-line bg-surface p-5 text-sm text-muted">{d.no_facts}</p>;

  return (
    <div>
      {synthesis && <p className="max-w-prose text-[1.05rem] leading-relaxed">{synthesis}</p>}
      <p className="mt-4 text-sm text-muted">{d.bhrigu_sub}</p>
      <ul className="mt-4 grid gap-4 sm:grid-cols-2">
        {predictions.map((p) => {
          const active = p.planet === chart.dasha.mahadasha;
          return (
            <li key={p.planet} className={`print-avoid rounded-[var(--radius-card)] border p-5 ${active ? "border-accent" : "border-line"}`}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-sans text-base font-semibold">{planetLabel(p.planet, lang)}</p>
                <div className="flex items-center gap-2">
                  {active && <Badge tone="accent">{d.yoga_active}</Badge>}
                  <span className="text-xs text-muted">{d.col_house} {p.house}</span>
                </div>
              </div>
              <p className="mt-2 text-sm leading-relaxed">{p.text}</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
