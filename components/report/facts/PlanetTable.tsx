import type { Dict } from "@/src/i18n/en";
import type { ReportFacts } from "@/src/reports/facts-schema";
import { DIGNITY_LABEL, type Dignity } from "@/src/astro/dignity";
import { Badge } from "@/components/ui/Badge";

const DIG_TONE: Partial<Record<Dignity, "strength" | "concern" | "neutral">> = { exalted: "strength", moolatrikona: "strength", own: "strength", debilitated: "concern", enemy: "concern" };

/** Precise placements: sign + DMS, house, nakshatra/pada, dignity, strength bar, motion. */
export function PlanetTable({ f, d }: { f: ReportFacts; d: Dict }) {
  const retroLabel = (r: string) => r === "direct" ? d.retro_direct : r === "retrograde" ? d.retro_retro : r === "always-retrograde" ? d.retro_always : d.retro_never;
  return (
    <div className="overflow-x-auto rounded-[var(--radius-card)] border border-line">
      <table className="w-full min-w-[760px] text-sm">
        <thead className="bg-surface text-left text-xs text-muted">
          <tr>
            <th className="px-4 py-3 font-medium">{d.col_planet}</th>
            <th className="px-4 py-3 font-medium">{d.col_sign}</th>
            <th className="px-4 py-3 font-medium">{d.col_house}</th>
            <th className="px-4 py-3 font-medium">{d.col_nakshatra}</th>
            <th className="px-4 py-3 font-medium">{d.col_dignity}</th>
            <th className="px-4 py-3 font-medium">{d.col_strength}</th>
            <th className="px-4 py-3 font-medium">{d.col_motion}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {f.planets.map((p) => {
            const s = f.strengths.find((x) => x.planet === p.body);
            const isAsc = p.body === "Ascendant";
            return (
              <tr key={p.body} className={isAsc ? "bg-accent-soft/40" : ""}>
                <td className="px-4 py-3 font-semibold">{isAsc ? d.lbl_lagna : p.body}</td>
                <td className="px-4 py-3 whitespace-nowrap">{p.sign} <span className="font-mono text-xs text-muted">{p.dms}</span></td>
                <td className="px-4 py-3">{p.house}</td>
                <td className="px-4 py-3 whitespace-nowrap">{p.nakshatra.name} <span className="text-muted">· {d.pada} {p.nakshatra.pada}</span></td>
                <td className="px-4 py-3">
                  {s ? <Badge tone={DIG_TONE[s.dignity as Dignity] ?? "muted"}>{DIGNITY_LABEL[s.dignity as Dignity]}</Badge> : <span className="text-muted">·</span>}
                  {s?.combust && <Badge tone="concern" className="ml-1">{d.combust}</Badge>}
                </td>
                <td className="px-4 py-3 min-w-[140px]">
                  {s ? (
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-surface-2"><div className={`h-full ${s.band === "direct" ? "bg-strength" : s.band === "moderate" ? "bg-accent" : "bg-concern"}`} style={{ width: `${s.score}%` }} /></div>
                      <span className="font-mono text-xs">{s.score}</span>
                    </div>
                  ) : <span className="text-muted">·</span>}
                </td>
                <td className="px-4 py-3 text-muted whitespace-nowrap">{isAsc ? "·" : retroLabel(p.retro)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
