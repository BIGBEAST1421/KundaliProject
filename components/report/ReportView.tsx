import { dict } from "@/src/i18n/dict";
import { PILLAR_LABELS } from "@/src/reports/pillars";
import type { PersonReport } from "@/src/reports/types";
import { Badge } from "@/components/ui/Badge";
import { Section } from "@/components/ui/Section";
import { InsightList } from "@/components/ui/InsightList";
import { NorthChart } from "./NorthChart";
import { StatCard } from "./StatCard";
import { Timeline } from "./Timeline";
import { ShareBar } from "./ShareBar";
import { CareerBlock, HealthBlock, LoveBlock, WealthBlock } from "./PillarSections";

/**
 * Renders a stored PersonReport. Server component — the same markup serves the name route,
 * the public share route and print. Labels follow the report's own language.
 */
export function ReportView({ report }: { report: PersonReport }) {
  const d = dict(report.language);
  const { chart, birth, profile } = report;
  const initials = report.name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const place = [birth.city, birth.state, birth.country].filter(Boolean).join(", ");
  const created = new Date(report.createdAt).toLocaleDateString(report.language === "hi" ? "hi-IN" : "en-IN", { day: "numeric", month: "short", year: "numeric" });
  const pillarNames = report.pillars.map((p) => PILLAR_LABELS[p][report.language]).join(" · ");

  return (
    <article className="mx-auto max-w-5xl px-4 py-10 sm:px-6 md:py-14" lang={report.language}>
      {/* Header */}
      <header className="fade-up flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="flex items-start gap-4">
          <div className="grid size-14 shrink-0 place-items-center rounded-full bg-accent-soft font-display text-xl">{initials}</div>
          <div>
            <h1 className="text-4xl md:text-5xl leading-none">{report.name}</h1>
            <p className="mt-2 text-muted">
              {birth.dob}{birth.timeKnown && birth.time ? ` · ${birth.time}` : ""} · {place}
              {profile.maritalStatus ? ` · ${profile.maritalStatus}` : ""}{profile.occupation ? ` · ${profile.occupation}` : ""}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {!birth.timeKnown && <Badge>{d.time_unknown_badge}</Badge>}
              {chart.mangal.isManglik && <Badge tone="concern">{d.manglik_badge}</Badge>}
              <Badge tone="accent">{d.focus_note.replace("{pillars}", pillarNames)}</Badge>
            </div>
          </div>
        </div>
        <ShareBar sharePath={`/report/${report.uid}`} newHref="/app" newLabel={d.share_new} />
      </header>

      {/* Chart + core stats */}
      <div className="mt-12 grid gap-8 md:grid-cols-[minmax(0,320px)_1fr] md:items-start">
        <div className="print-avoid">
          <NorthChart lagna={chart.lagna} d1={chart.d1} title={d.sec_chart} />
          <p className="mt-2 text-center text-xs text-muted">{d.ayanamsa} {chart.ayanamsa}° · {chart.utcTime}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <StatCard label={d.lbl_lagna} value={chart.lagna} sub={`${d.sub_lagna} · ${chart.lagnaDegree}°`} />
          <StatCard label={d.lbl_moonsign} value={chart.rashi} sub={d.sub_moonsign} />
          <StatCard label={d.lbl_nakshatra} value={chart.nakshatra.name} sub={`${d.pada} ${chart.nakshatra.pada} · ${chart.nakshatra.lord}`} />
          <StatCard label={d.lbl_sunsign} value={chart.sunSign} />
          <StatCard label={d.lbl_mahadasha} value={chart.dasha.mahadasha} sub={`${chart.dasha.mahadashaStart} – ${chart.dasha.mahadashaEnd}`} />
          <StatCard label={d.lbl_antardasha} value={chart.dasha.antardasha} sub={`${chart.dasha.antardashaStart} – ${chart.dasha.antardashaEnd}`} />
        </div>
      </div>

      <div className="mt-16 space-y-16">
        <Section id="soul" title={d.sec_soul}>
          <p className="max-w-prose font-display text-xl md:text-2xl leading-snug italic">{report.core.soulPurpose}</p>
        </Section>

        <Section id="overview" title={d.sec_overview}>
          <InsightList items={report.core.overview} />
        </Section>

        <Section id="dasha" title={d.sec_dasha_now} caption={`${chart.dasha.mahadasha} · ${chart.dasha.antardasha}`}>
          <p className="max-w-prose text-[1.05rem] leading-relaxed">{report.core.dashaAnalysis}</p>
        </Section>

        {report.sections.career && <CareerBlock s={report.sections.career} d={d} />}
        {report.sections.love && <LoveBlock s={report.sections.love} d={d} />}
        {report.sections.health && <HealthBlock s={report.sections.health} d={d} />}
        {report.sections.wealth && <WealthBlock s={report.sections.wealth} d={d} />}

        <Section id="timeline" title={d.sec_dasha_timeline} className="print-break">
          <div className="grid gap-10 md:grid-cols-2">
            <Timeline items={chart.dasha.allMahadashas.map((m) => ({ period: `${m.lord}`, desc: `${m.start} – ${m.end}`, current: m.current }))} />
            <div>
              <h3 className="mb-4 font-sans text-sm font-semibold">{d.sec_antardashas.replace("{m}", chart.dasha.mahadasha)}</h3>
              <Timeline items={chart.dasha.antardashas.map((a) => ({ period: a.lord, desc: `${a.start} – ${a.end}`, current: a.current }))} />
            </div>
          </div>
        </Section>

        {report.core.remedies.length > 0 && (
          <Section id="remedies" title={d.sec_remedies}>
            <ul className="grid gap-3 sm:grid-cols-2">
              {report.core.remedies.map((r, i) => (
                <li key={i} className="flex gap-3 rounded-xl bg-surface p-4">
                  <span className="text-xl leading-none" aria-hidden>{r.icon}</span>
                  <div>
                    <p className="font-medium">{r.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted">{r.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Section>
        )}
      </div>

      <footer className="mt-16 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6 text-xs text-muted">
        <span>{d.report_created} {created}</span>
        <span className="font-mono">/report/{report.uid.slice(0, 8)}…</span>
      </footer>
    </article>
  );
}
