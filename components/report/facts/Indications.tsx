import type { Dict } from "@/src/i18n/en";
import type { ReportFacts } from "@/src/reports/facts-schema";
import { Badge, VerdictBadge } from "@/components/ui/Badge";

const CONF_LABEL = { direct: "●●●", moderate: "●●○", soft: "●○○" } as const;

/** Fired classical rules for one domain, ranked by weight. */
export function Indications({ rules, d }: { rules: ReportFacts["rules"]["marriage"]; d: Dict }) {
  if (rules.length === 0) return null;
  return (
    <section className="print-avoid rounded-[var(--radius-card)] border border-line bg-surface/60 p-5">
      <h3 className="font-sans text-base font-semibold">{d.indications}</h3>
      <p className="mt-1 text-sm text-muted">{d.indications_sub}</p>
      <ul className="mt-4 space-y-4">
        {rules.map((r) => (
          <li key={r.id} className="flex gap-3">
            <span className={`mt-1.5 size-2 shrink-0 rounded-full ${r.positive ? "bg-strength" : "bg-concern"}`} aria-hidden />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium">{r.title}</p>
                <VerdictBadge verdict={r.positive ? "strength" : "concern"} label={r.positive ? d.verdict_strength : d.verdict_concern} />
                <Badge tone="muted" className="font-mono">{CONF_LABEL[r.confidence]}</Badge>
              </div>
              <p className="mt-1 text-sm leading-relaxed">{r.text}</p>
              <p className="mt-1 text-xs text-muted">{r.because.join(" · ")}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
