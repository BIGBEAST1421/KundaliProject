"use client";

import Link from "next/link";
import { dict } from "@/src/i18n/dict";
import { useI18n } from "@/src/i18n";
import { APP_NAME } from "@/src/lib/brand";
import { PILLAR_LABELS } from "@/src/reports/pillars";
import type { PersonReport } from "@/src/reports/types";
import { Badge } from "@/components/ui/Badge";
import { Section } from "@/components/ui/Section";
import { InsightList } from "@/components/ui/InsightList";
import { ReportShell, type ShellGroup } from "@/components/motion/ReportShell";
import { Reveal, RevealItem } from "@/components/motion/Reveal";
import { HoverLift } from "@/components/motion/Hover";
import { NorthChart } from "./NorthChart";
import { StatCard } from "./StatCard";
import { Timeline } from "./Timeline";
import { ShareBar } from "./ShareBar";
import { CareerBlock, HealthBlock, LoveBlock, WealthBlock } from "./PillarSections";
import { PlanetTable } from "./facts/PlanetTable";
import { HouseGrid } from "./facts/HouseGrid";
import { VargaView } from "./facts/VargaView";
import { AspectsView } from "./facts/AspectsView";
import { YogasView } from "./facts/YogasView";
import { TransitsView } from "./facts/TransitsView";
import { Indications } from "./facts/Indications";
import { Logo } from "@/components/Logo";

const Icon = ({ d }: { d: string }) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden><path d={d} /></svg>;
const ICONS = {
  overview: "M4 12a8 8 0 1 0 16 0 8 8 0 0 0-16 0Zm8-3v3l2 2",
  chart: "M4 4h16v16H4zM4 4l16 16M20 4 4 20M12 4 4 12l8 8 8-8z",
  insights: "M12 3l2.5 5 5.5.8-4 3.9.9 5.5L12 15.6 7.1 18.2l.9-5.5-4-3.9L9.5 8z",
  timing: "M12 8v4l3 2M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0",
};

interface Props {
  report: PersonReport;
  /** "owner": actions shown. "share": view-only, no actions, footer CTA. */
  mode?: "owner" | "share";
}

/**
 * Stored PersonReport → grouped, tabbed reading. Client component so labels follow the site's
 * live language toggle; the same markup serves the name route (owner) and the public share
 * route (view-only). Only the AI-generated prose (soul purpose, section text, …) stays in
 * whichever language the report was created in — it isn't retranslated on the fly.
 */
export function ReportView({ report, mode = "owner" }: Props) {
  const { lang } = useI18n();
  const d = dict(lang);
  const { chart, birth, profile, facts } = report;
  const initials = report.name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const place = [birth.city, birth.state, birth.country].filter(Boolean).join(", ");
  const created = new Date(report.createdAt).toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", { day: "numeric", month: "short", year: "numeric" });
  const pillarNames = report.pillars.map((p) => PILLAR_LABELS[p][lang]).join(" · ");

  const noFacts = <p className="rounded-[var(--radius-card)] border border-line bg-surface p-5 text-sm text-muted">{d.no_facts}</p>;

  const overview = (
    <div className="space-y-14">
      <Reveal stagger={0.08}>
        <div className="grid gap-8 md:grid-cols-[minmax(0,300px)_1fr] md:items-start">
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
      <Reveal><Section id="soul" title={d.sec_soul}><p className="max-w-prose font-display text-xl md:text-2xl leading-snug italic">{report.core.soulPurpose}</p></Section></Reveal>
      <Reveal><Section id="overview" title={d.sec_overview}><InsightList items={report.core.overview} /></Section></Reveal>
      <Reveal><Section id="dasha" title={d.sec_dasha_now} caption={`${chart.dasha.mahadasha} · ${chart.dasha.antardasha}`}><p className="max-w-prose text-[1.05rem] leading-relaxed">{report.core.dashaAnalysis}</p></Section></Reveal>
    </div>
  );

  const groups: ShellGroup[] = [
    { id: "overview", label: d.grp_overview, icon: <Icon d={ICONS.overview} />, tabs: [{ id: "summary", label: d.tab_overview, keywords: "lagna moon nakshatra soul purpose dasha summary", content: overview }] },
    {
      id: "chart", label: d.grp_chart, icon: <Icon d={ICONS.chart} />,
      tabs: [
        { id: "planets", label: d.tab_planets, keywords: "sun moon mars mercury jupiter venus saturn rahu ketu degree retrograde combust dignity strength", content: facts ? <Reveal><Section id="planets" title={d.tab_planets}><PlanetTable f={facts} d={d} /></Section></Reveal> : noFacts },
        { id: "houses", label: d.tab_houses, keywords: "house lord bhava 7th 10th", content: facts ? <Reveal><Section id="houses" title={d.tab_houses}><HouseGrid f={facts} d={d} lagna={chart.lagna} lang={lang} /></Section></Reveal> : noFacts },
        { id: "vargas", label: d.tab_vargas, keywords: "navamsa dasamsa d9 d10 divisional", content: facts ? <Reveal><Section id="vargas" title={d.tab_vargas}><VargaView f={facts} d={d} /></Section></Reveal> : noFacts },
        { id: "aspects", label: d.tab_aspects, keywords: "drishti aspect glance", content: facts ? <Reveal><Section id="aspects" title={d.tab_aspects} caption={d.aspects_sub}><AspectsView f={facts} d={d} /></Section></Reveal> : noFacts },
      ],
    },
    {
      id: "insights", label: d.grp_insights, icon: <Icon d={ICONS.insights} />,
      tabs: [
        ...(report.sections.career ? [{ id: "career", label: d.tab_career, keywords: "career job work profession 10th business", content: <Reveal className="space-y-10">{facts && <Indications rules={facts.rules.career} d={d} />}<CareerBlock s={report.sections.career} d={d} /></Reveal> }] : []),
        ...(report.sections.love ? [{ id: "love", label: d.tab_love, keywords: "love marriage partner spouse relationship venus 7th manglik", content: <Reveal className="space-y-10">{facts && <Indications rules={facts.rules.marriage} d={d} />}<LoveBlock s={report.sections.love} d={d} /></Reveal> }] : []),
        ...(report.sections.health ? [{ id: "health", label: d.tab_health, keywords: "health body energy constitution", content: <Reveal><HealthBlock s={report.sections.health} d={d} /></Reveal> }] : []),
        ...(report.sections.wealth ? [{ id: "wealth", label: d.tab_wealth, keywords: "wealth money finance savings investment muhurta", content: <Reveal><WealthBlock s={report.sections.wealth} d={d} /></Reveal> }] : []),
        { id: "yogas", label: d.tab_yogas, keywords: "yoga dosha raja yoga gajakesari kemadruma manglik viparita neecha bhanga dhana", content: facts ? <Reveal><Section id="yogas" title={d.tab_yogas} caption={d.yogas_sub}><YogasView f={facts} d={d} /></Section></Reveal> : noFacts },
      ],
    },
    {
      id: "timing", label: d.grp_timing, icon: <Icon d={ICONS.timing} />,
      tabs: [
        { id: "dasha", label: d.tab_dasha, keywords: "dasha mahadasha antardasha timeline period vimshottari", content: (
          <Reveal><Section id="timeline" title={d.sec_dasha_timeline}>
            <div className="grid gap-10 md:grid-cols-2">
              <Timeline items={chart.dasha.allMahadashas.map((m) => ({ period: m.lord, desc: `${m.start} – ${m.end}`, current: m.current }))} />
              <div>
                <h3 className="mb-4 font-sans text-sm font-semibold">{d.sec_antardashas.replace("{m}", chart.dasha.mahadasha)}</h3>
                <Timeline items={chart.dasha.antardashas.map((a) => ({ period: a.lord, desc: `${a.start} – ${a.end}`, current: a.current }))} />
              </div>
            </div>
          </Section></Reveal>
        ) },
        { id: "transits", label: d.tab_transits, keywords: "transit gochar today now sade sati saturn jupiter", content: facts ? <Reveal><Section id="transits" title={d.tab_transits} caption={d.transits_sub}><TransitsView f={facts} d={d} /></Section></Reveal> : noFacts },
        ...(report.core.remedies.length ? [{ id: "remedies", label: d.tab_remedies, keywords: "remedy mantra gemstone practice upay", content: (
          <Section id="remedies" title={d.sec_remedies}>
            <Reveal stagger={0.07} as="ul" className="grid gap-3 sm:grid-cols-2">
              {report.core.remedies.map((r, i) => (
                <RevealItem key={i} as="li"><HoverLift className="flex h-full gap-3 rounded-xl bg-surface p-4">
                  <span className="text-xl leading-none" aria-hidden>{r.icon}</span>
                  <div><p className="font-medium">{r.title}</p><p className="mt-1 text-sm leading-relaxed text-muted">{r.desc}</p></div>
                </HoverLift></RevealItem>
              ))}
            </Reveal>
          </Section>
        ) }] : []),
      ],
    },
  ];

  return (
    <article className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14" lang={lang}>
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
        {mode === "owner" && <RevealItem><ShareBar sharePath={`/report/${report.uid}`} newHref="/app" newLabel={d.share_new} /></RevealItem>}
      </Reveal>

      <ReportShell groups={groups} jumpPlaceholder={d.jump_placeholder} jumpEmpty={d.jump_none} className="mt-10" />

      <footer className="mt-16 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6 text-xs text-muted">
        <span>{d.report_created} {created}</span>
        {mode === "share" ? (
          <span className="flex items-center gap-2">{d.share_view_footer} <Logo text={APP_NAME} /> · <Link href="/app" className="font-medium text-ink underline decoration-accent underline-offset-4">{d.share_cta}</Link></span>
        ) : (
          <span className="font-mono">/report/{report.uid.slice(0, 8)}…</span>
        )}
      </footer>
    </article>
  );
}
