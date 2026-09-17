import { dict } from "@/src/i18n/dict";
import { PILLAR_LABELS } from "@/src/reports/pillars";
import type { PersonReport } from "@/src/reports/types";
import { Badge } from "@/components/ui/Badge";
import { Section } from "@/components/ui/Section";
import { InsightList } from "@/components/ui/InsightList";
import { Tabs, type TabPanel } from "@/components/motion/Tabs";
import { Reveal, RevealItem } from "@/components/motion/Reveal";
import { HoverLift } from "@/components/motion/Hover";
import { NorthChart } from "./NorthChart";
import { StatCard } from "./StatCard";
import { Timeline } from "./Timeline";
import { ShareBar } from "./ShareBar";
import { CareerBlock, HealthBlock, LoveBlock, WealthBlock } from "./PillarSections";

/**
 * Renders a stored PersonReport as a tabbed reading. Server component — the same markup serves
 * the name route, the public share route and print (print shows every tab in order).
 */
export function ReportView({ report }: { report: PersonReport }) {
  const d = dict(report.language);
  const { chart, birth, profile } = report;
  const initials = report.name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const place = [birth.city, birth.state, birth.country].filter(Boolean).join(", ");
  const created = new Date(report.createdAt).toLocaleDateString(report.language === "hi" ? "hi-IN" : "en-IN", { day: "numeric", month: "short", year: "numeric" });
  const pillarNames = report.pillars.map((p) => PILLAR_LABELS[p][report.language]).join(" · ");

  const overview = (
    <div className="space-y-14">
      <Reveal stagger={0.08}>
        <div className="grid gap-8 md:grid-cols-[minmax(0,320px)_1fr] md:items-start">
          <RevealItem className="print-avoid">
            <NorthChart lagna={chart.lagna} d1={chart.d1} title={d.sec_chart} />
            <p className="mt-2 text-center text-xs text-muted">{d.ayanamsa} {chart.ayanamsa}° · {chart.utcTime}</p>
          </RevealItem>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              [d.lbl_lagna, chart.lagna, `${d.sub_lagna} · ${chart.lagnaDegree}°`],
              [d.lbl_moonsign, chart.rashi, d.sub_moonsign],
              [d.lbl_nakshatra, chart.nakshatra.name, `${d.pada} ${chart.nakshatra.pada} · ${chart.nakshatra.lord}`],
              [d.lbl_sunsign, chart.sunSign, ""],
              [d.lbl_mahadasha, chart.dasha.mahadasha, `${chart.dasha.mahadashaStart} – ${chart.dasha.mahadashaEnd}`],
              [d.lbl_antardasha, chart.dasha.antardasha, `${chart.dasha.antardashaStart} – ${chart.dasha.antardashaEnd}`],
            ].map(([l, v, s]) => (
              <RevealItem key={l}><HoverLift><StatCard label={l} value={v} sub={s || undefined} /></HoverLift></RevealItem>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal>
        <Section id="soul" title={d.sec_soul}>
          <p className="max-w-prose font-display text-xl md:text-2xl leading-snug italic">{report.core.soulPurpose}</p>
        </Section>
      </Reveal>

      <Reveal>
        <Section id="overview" title={d.sec_overview}>
          <InsightList items={report.core.overview} />
        </Section>
      </Reveal>

      <Reveal>
        <Section id="dasha" title={d.sec_dasha_now} caption={`${chart.dasha.mahadasha} · ${chart.dasha.antardasha}`}>
          <p className="max-w-prose text-[1.05rem] leading-relaxed">{report.core.dashaAnalysis}</p>
        </Section>
      </Reveal>
    </div>
  );

  const panels: TabPanel[] = [
    { id: "overview", label: d.tab_overview, content: overview },
  ];
  if (report.sections.career) panels.push({ id: "career", label: d.tab_career, content: <Reveal><CareerBlock s={report.sections.career} d={d} /></Reveal> });
  if (report.sections.love) panels.push({ id: "love", label: d.tab_love, content: <Reveal><LoveBlock s={report.sections.love} d={d} /></Reveal> });
  if (report.sections.health) panels.push({ id: "health", label: d.tab_health, content: <Reveal><HealthBlock s={report.sections.health} d={d} /></Reveal> });
  if (report.sections.wealth) panels.push({ id: "wealth", label: d.tab_wealth, content: <Reveal><WealthBlock s={report.sections.wealth} d={d} /></Reveal> });

  panels.push({
    id: "timeline", label: d.tab_timeline,
    content: (
      <Reveal>
        <Section id="timeline" title={d.sec_dasha_timeline}>
          <div className="grid gap-10 md:grid-cols-2">
            <Timeline items={chart.dasha.allMahadashas.map((m) => ({ period: m.lord, desc: `${m.start} – ${m.end}`, current: m.current }))} />
            <div>
              <h3 className="mb-4 font-sans text-sm font-semibold">{d.sec_antardashas.replace("{m}", chart.dasha.mahadasha)}</h3>
              <Timeline items={chart.dasha.antardashas.map((a) => ({ period: a.lord, desc: `${a.start} – ${a.end}`, current: a.current }))} />
            </div>
          </div>
        </Section>
      </Reveal>
    ),
  });

  if (report.core.remedies.length > 0) {
    panels.push({
      id: "remedies", label: d.tab_remedies,
      content: (
        <Section id="remedies" title={d.sec_remedies}>
          <Reveal stagger={0.07} as="ul" className="grid gap-3 sm:grid-cols-2">
            {report.core.remedies.map((r, i) => (
              <RevealItem key={i} as="li">
                <HoverLift className="flex h-full gap-3 rounded-xl bg-surface p-4">
                  <span className="text-xl leading-none" aria-hidden>{r.icon}</span>
                  <div>
                    <p className="font-medium">{r.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted">{r.desc}</p>
                  </div>
                </HoverLift>
              </RevealItem>
            ))}
          </Reveal>
        </Section>
      ),
    });
  }

  return (
    <article className="mx-auto max-w-5xl px-4 py-10 sm:px-6 md:py-14" lang={report.language}>
      <Reveal as="header" stagger={0.06} className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="flex items-start gap-4">
          <RevealItem className="grid size-14 shrink-0 place-items-center rounded-full bg-accent-soft font-display text-xl">{initials}</RevealItem>
          <div>
            <RevealItem><h1 className="text-4xl md:text-5xl leading-none">{report.name}</h1></RevealItem>
            <RevealItem as="p" className="mt-2 text-muted">
              {birth.dob}{birth.timeKnown && birth.time ? ` · ${birth.time}` : ""} · {place}
              {profile.maritalStatus ? ` · ${profile.maritalStatus}` : ""}{profile.occupation ? ` · ${profile.occupation}` : ""}
            </RevealItem>
            <RevealItem className="mt-3 flex flex-wrap gap-2">
              {!birth.timeKnown && <Badge>{d.time_unknown_badge}</Badge>}
              {chart.mangal.isManglik && <Badge tone="concern">{d.manglik_badge}</Badge>}
              <Badge tone="accent">{d.focus_note.replace("{pillars}", pillarNames)}</Badge>
            </RevealItem>
          </div>
        </div>
        <RevealItem><ShareBar sharePath={`/report/${report.uid}`} newHref="/app" newLabel={d.share_new} /></RevealItem>
      </Reveal>

      <Tabs panels={panels} className="mt-10" />

      <footer className="mt-16 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6 text-xs text-muted">
        <span>{d.report_created} {created}</span>
        <span className="font-mono">/report/{report.uid.slice(0, 8)}…</span>
      </footer>
    </article>
  );
}
