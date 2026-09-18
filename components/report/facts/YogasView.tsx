import type { Dict } from "@/src/i18n/en";
import type { ReportFacts } from "@/src/reports/facts-schema";
import { Badge, VerdictBadge } from "@/components/ui/Badge";

export function YogasView({ f, d }: { f: ReportFacts; d: Dict }) {
  return (
    <ul className="space-y-3">
      {f.yogas.map((y) => {
        const verdict = !y.present ? null : y.kind === "dosha" ? (y.cancelled ? "neutral" : "concern") : (y.cancelled ? "neutral" : "strength");
        return (
          <li key={y.key} className={`print-avoid rounded-[var(--radius-card)] border border-line p-5 ${y.present ? "" : "opacity-60"}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-sans text-base font-semibold">{y.name}</p>
                <p className="text-xs text-muted">{y.kind === "rajayoga" ? "Raja Yoga" : y.kind === "dosha" ? "Dosha" : "Yoga"}{y.participants.length ? ` · ${y.participants.join(", ")}` : ""}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {y.present ? <VerdictBadge verdict={verdict!} label={y.cancelled ? d.yoga_cancelled : d.yoga_present} /> : <Badge>{d.yoga_absent}</Badge>}
                {y.present && <Badge tone="muted">{d.yoga_grade} {"●".repeat(y.grade)}{"○".repeat(3 - y.grade)}</Badge>}
                {y.present && y.activeInDasha && <Badge tone="accent">{d.yoga_active}</Badge>}
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted">{y.summary}</p>
            <p className="mt-2 text-sm leading-relaxed">{y.reason}</p>
            {y.cancelled && y.cancellationReasons.length > 0 && (
              <p className="mt-2 text-sm leading-relaxed"><span className="font-medium">{d.yoga_cancelled}:</span> {y.cancellationReasons.join("; ")}.</p>
            )}
          </li>
        );
      })}
    </ul>
  );
}
