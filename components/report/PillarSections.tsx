import type { Dict } from "@/src/i18n/en";
import type { CareerSection, HealthSection, LoveSection, WealthSection } from "@/src/reports/types";
import { Section } from "@/components/ui/Section";
import { InsightList } from "@/components/ui/InsightList";
import { Timeline } from "./Timeline";

function Balanced({ d, summary, positives, concerns }: { d: Dict; summary: string; positives: string[]; concerns: string[] }) {
  return (
    <>
      <p className="max-w-prose text-[1.05rem] leading-relaxed">{summary}</p>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="font-sans text-sm font-semibold text-strength">{d.strengths}</h3>
          <div className="mt-3"><InsightList items={positives} tone="strength" /></div>
        </div>
        <div>
          <h3 className="font-sans text-sm font-semibold text-concern">{d.concerns}</h3>
          <div className="mt-3"><InsightList items={concerns} tone="concern" emptyText={d.no_concerns} /></div>
        </div>
      </div>
    </>
  );
}

function Sub({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-8">
      <h3 className="font-sans text-sm font-semibold">{title}</h3>
      <div className="mt-3">{children}</div>
    </div>
  );
}

export function CareerBlock({ s, d }: { s: CareerSection; d: Dict }) {
  return (
    <Section id="career" title={d.sec_career}>
      <Balanced d={d} summary={s.summary} positives={s.positives} concerns={s.concerns} />
      {s.sectors.length > 0 && (
        <Sub title={d.career_sectors}>
          <dl className="grid gap-3 sm:grid-cols-3">
            {s.sectors.map((x) => (
              <div key={x.sector} className="rounded-xl bg-surface p-4">
                <dt className="font-medium">{x.sector}</dt>
                <dd className="mt-1 text-sm leading-relaxed text-muted">{x.reason}</dd>
              </div>
            ))}
          </dl>
        </Sub>
      )}
      {s.switchTiming && <Sub title={d.career_timing}><p className="max-w-prose leading-relaxed">{s.switchTiming}</p></Sub>}
      {s.timeline.length > 0 && <Sub title={d.career_timeline}><Timeline items={s.timeline} /></Sub>}
    </Section>
  );
}

export function LoveBlock({ s, d }: { s: LoveSection; d: Dict }) {
  return (
    <Section id="love" title={d.sec_love}>
      <Balanced d={d} summary={s.summary} positives={s.positives} concerns={s.concerns} />
      {s.notes.map((n) => (
        <Sub key={n.label} title={n.label}><p className="max-w-prose leading-relaxed">{n.text}</p></Sub>
      ))}
      {s.marriageWindows.length > 0 && (
        <Sub title={d.love_windows}>
          <Timeline items={s.marriageWindows.map((w) => ({ period: w.period, desc: w.reason }))} />
        </Sub>
      )}
      {s.partner && <Sub title={d.love_partner}><p className="max-w-prose leading-relaxed">{s.partner}</p></Sub>}
    </Section>
  );
}

export function HealthBlock({ s, d }: { s: HealthSection; d: Dict }) {
  return (
    <Section id="health" title={d.sec_health}>
      <Balanced d={d} summary={s.summary} positives={s.positives} concerns={s.concerns} />
      {s.watch.length > 0 && <Sub title={d.health_watch}><InsightList items={s.watch} /></Sub>}
    </Section>
  );
}

export function WealthBlock({ s, d }: { s: WealthSection; d: Dict }) {
  return (
    <Section id="wealth" title={d.sec_wealth} caption={s.pattern ? `${d.wealth_pattern}: ${s.pattern}` : undefined}>
      <Balanced d={d} summary={s.summary} positives={s.positives} concerns={s.concerns} />
      {s.timeline.length > 0 && <Sub title={d.wealth_timeline}><Timeline items={s.timeline} /></Sub>}
      {s.muhurta.length > 0 && (
        <Sub title={d.wealth_muhurta}>
          <dl className="grid gap-3 sm:grid-cols-3">
            {s.muhurta.map((m) => (
              <div key={m.type} className="rounded-xl bg-surface p-4">
                <dt className="text-xs text-muted">{m.type}</dt>
                <dd className="mt-1 font-medium">{m.window}</dd>
                <dd className="mt-1 text-sm leading-relaxed text-muted">{m.reason}</dd>
              </div>
            ))}
          </dl>
        </Sub>
      )}
    </Section>
  );
}
