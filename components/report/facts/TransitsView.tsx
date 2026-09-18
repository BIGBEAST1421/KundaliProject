import type { Dict } from "@/src/i18n/en";
import type { ReportFacts } from "@/src/reports/facts-schema";
import { Badge } from "@/components/ui/Badge";
import { InsightList } from "@/components/ui/InsightList";

export function TransitsView({ f, d }: { f: ReportFacts; d: Dict }) {
  const t = f.transits;
  return (
    <div className="space-y-8">
      {t.intersections.length > 0 && (
        <div className="rounded-[var(--radius-card)] bg-accent-soft/50 p-5">
          <h3 className="font-sans text-sm font-semibold">{d.intersections}</h3>
          <div className="mt-3"><InsightList items={t.intersections} /></div>
        </div>
      )}
      <div className="overflow-x-auto rounded-[var(--radius-card)] border border-line">
        <table className="w-full min-w-[520px] text-sm">
          <thead className="bg-surface text-left text-xs text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">{d.col_planet}</th>
              <th className="px-4 py-3 font-medium">{d.col_sign}</th>
              <th className="px-4 py-3 font-medium">{d.col_house} {d.from_lagna}</th>
              <th className="px-4 py-3 font-medium">{d.col_house} {d.from_moon}</th>
              <th className="px-4 py-3 font-medium">{d.col_motion}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {t.planets.map((p) => (
              <tr key={p.planet}>
                <td className="px-4 py-3 font-semibold">{p.planet}</td>
                <td className="px-4 py-3">{p.sign}</td>
                <td className="px-4 py-3">{p.houseFromLagna}</td>
                <td className="px-4 py-3">{p.houseFromMoon}</td>
                <td className="px-4 py-3">{p.retrograde ? <Badge tone="concern">{d.retro_retro}</Badge> : <span className="text-muted">{d.retro_direct}</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted">{t.date}</p>
    </div>
  );
}
