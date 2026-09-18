import type { Dict } from "@/src/i18n/en";
import type { ReportFacts } from "@/src/reports/facts-schema";
import { Badge } from "@/components/ui/Badge";

export function AspectsView({ f, d }: { f: ReportFacts; d: Dict }) {
  const byPlanet = new Map<string, ReportFacts["aspects"]>();
  for (const a of f.aspects) byPlanet.set(a.from, [...(byPlanet.get(a.from) ?? []), a]);
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {[...byPlanet.entries()].map(([p, list]) => (
        <li key={p} className="rounded-[var(--radius-card)] border border-line p-4">
          <p className="font-semibold">{p} <span className="text-xs text-muted">· {d.col_house} {list[0].fromHouse}</span></p>
          <ul className="mt-2 space-y-1.5 text-sm">
            {list.map((a) => (
              <li key={a.toHouse} className="flex flex-wrap items-center gap-2">
                <span className="text-muted">{d.aspect_to}</span> <span className="font-medium">{a.toHouse}</span>
                {a.special && <Badge tone="accent">special</Badge>}
                {a.toPlanets.length > 0 && <span className="text-muted">→ {a.toPlanets.join(", ")}</span>}
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}
