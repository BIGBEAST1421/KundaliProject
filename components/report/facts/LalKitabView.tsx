import type { Dict } from "@/src/i18n/en";
import type { ReportFacts } from "@/src/reports/facts-schema";
import type { Language } from "@/src/reports/types";
import { PLANETS } from "@/src/astro/signs";
import { planetLabel } from "@/src/astro/i18n";
import { planetStatusLabel, debtNameLabel, debtMeaningLabel, debtRemedies } from "@/src/astro/lalkitab/content";
import { Badge, VerdictBadge } from "@/components/ui/Badge";

const STATUS_TONE = { awake: "strength", sleeping: "concern", static: "neutral" } as const;

interface Props {
  f: ReportFacts;
  d: Dict;
  lang: Language;
  /** Grounded 2-3 sentence AI synthesis of the facts below (report.core.lalKitabSynthesis). */
  synthesis?: string;
}

/** Lal Kitab facts: planet sleeping/awake/static status, debts (Rin) and their remedies. */
export function LalKitabView({ f, d, lang, synthesis }: Props) {
  const lalKitab = f.lalKitab;
  if (!lalKitab) return null;

  const presentDebts = lalKitab.debts.filter((debt) => debt.present);

  return (
    <div className="space-y-10">
      {synthesis && (
        <p className="max-w-prose text-[1.05rem] leading-relaxed">{synthesis}</p>
      )}

      <section className="print-avoid">
        <h3 className="font-sans text-base font-semibold">{d.lk_status}</h3>
        <p className="mt-1 text-sm text-muted">{d.lk_status_sub}</p>
        <div className="mt-4 overflow-x-auto rounded-[var(--radius-card)] border border-line">
          <table className="w-full min-w-[420px] text-sm">
            <thead className="bg-surface text-left text-xs text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">{d.col_planet}</th>
                <th className="px-4 py-3 font-medium">{d.col_house}</th>
                <th className="px-4 py-3 font-medium">{d.lk_status}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {PLANETS.map((p) => {
                const status = lalKitab.planetStatus[p];
                const house = f.planets.find((pl) => pl.body === p)?.house;
                return (
                  <tr key={p}>
                    <td className="px-4 py-3 font-semibold">{planetLabel(p, lang)}</td>
                    <td className="px-4 py-3">{house}</td>
                    <td className="px-4 py-3"><VerdictBadge verdict={STATUS_TONE[status]} label={planetStatusLabel(status, lang)} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <div className="print-keep">
          <h3 className="font-sans text-base font-semibold">{d.lk_debts_title}</h3>
          <p className="mt-1 text-sm text-muted">{d.lk_debts_sub}</p>
        </div>
        {presentDebts.length === 0 ? (
          <p className="mt-4 rounded-[var(--radius-card)] border border-line bg-surface p-5 text-sm text-muted">{d.lk_no_debts}</p>
        ) : (
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {lalKitab.debts.map((debt) => (
              <li key={debt.key} className="print-avoid rounded-[var(--radius-card)] border border-line p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-sans text-base font-semibold">{debtNameLabel(debt.key, lang)}</p>
                  <Badge tone={debt.present ? "concern" : "muted"}>{debt.present ? d.yoga_present : d.yoga_absent}</Badge>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted">{debtMeaningLabel(debt.key, lang)}</p>
                {debt.present && (
                  <ul className="mt-4 space-y-3">
                    {debtRemedies(debt.key, lang).map((r, i) => (
                      <li key={i} className="flex gap-3 rounded-xl bg-surface p-3">
                        <span className="text-xl leading-none" aria-hidden>{r.icon}</span>
                        <div><p className="text-sm font-medium">{r.title}</p><p className="mt-0.5 text-xs leading-relaxed text-muted">{r.desc}</p></div>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
