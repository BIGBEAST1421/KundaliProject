"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { dict } from "@/src/i18n/dict";
import { useI18n } from "@/src/i18n";
import { Logo } from "@/components/Logo";
import { APP_NAME } from "@/src/lib/brand";
import type { Dict } from "@/src/i18n/en";
import type { MatchReport, MatchInsights } from "@/src/reports/types";

type FactorNarrative = { title: string; meaning: string; result: string };
type MatchTranslated = { insights: MatchInsights; factors: FactorNarrative[]; gunaVerdict: string; mangalNote: string };
import { Badge, VerdictBadge } from "@/components/ui/Badge";
import { Meter } from "@/components/ui/Meter";
import { Section } from "@/components/ui/Section";
import { InsightList } from "@/components/ui/InsightList";
import { ShareBar } from "@/components/report/ShareBar";
import { FactorCard } from "./FactorCard";
import { Tabs, type TabPanel } from "@/components/motion/Tabs";
import { Reveal, RevealItem } from "@/components/motion/Reveal";
import { HoverLift } from "@/components/motion/Hover";
import { CountUp } from "@/components/motion/CountUp";

function PersonCol({ label, p, d }: { label: string; p: MatchReport["boy"]; d: Dict }) {
  return (
    <div className="h-full rounded-[var(--radius-card)] border border-line p-5">
      <p className="text-xs text-muted">{label}</p>
      <h2 className="mt-1 text-3xl leading-none">{p.name}</h2>
      <p className="mt-2 text-sm text-muted">{p.birth.dob}{p.birth.timeKnown && p.birth.time ? ` · ${p.birth.time}` : ""} · {p.birth.city}</p>
      <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
        <dt className="text-muted">{d.lbl_moonsign}</dt><dd className="font-medium">{p.chart.rashi}</dd>
        <dt className="text-muted">{d.lbl_nakshatra}</dt><dd className="font-medium">{p.chart.nakshatra.name} · {d.pada} {p.chart.nakshatra.pada}</dd>
        <dt className="text-muted">{d.lbl_lagna}</dt><dd className="font-medium">{p.chart.lagna}</dd>
        <dt className="text-muted">{d.mangal_title}</dt>
        <dd><Badge tone={p.mangal.isManglik ? "concern" : "strength"}>{p.mangal.isManglik ? d.manglik : d.not_manglik}</Badge></dd>
      </dl>
    </div>
  );
}

/** Comparison-first compatibility report. Client component so labels follow the live language toggle. */
export function MatchView({ report, mode = "owner" }: { report: MatchReport; mode?: "owner" | "share" }) {
  const { lang } = useI18n();
  const d = dict(lang);
  const { guna, factors: rawFactors, mangal, boy, girl } = report;

  // As with ReportView, the narrative text is only ever written once, in report.language.
  const cached: MatchTranslated | null = report.translation && report.translation.language === lang ? report.translation : null;
  const [translated, setTranslated] = useState<MatchTranslated | null>(cached);
  const [translating, setTranslating] = useState(false);
  useEffect(() => {
    if (lang === report.language) { setTranslated(null); return; }
    if (report.translation && report.translation.language === lang) { setTranslated(report.translation); return; }
    let cancelled = false;
    setTranslating(true);
    fetch(`/api/match/${report.uid}/translate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lang }),
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("translate failed"))))
      .then((data: MatchTranslated) => { if (!cancelled) setTranslated(data); })
      .catch(() => { /* fall back to the original language silently */ })
      .finally(() => { if (!cancelled) setTranslating(false); });
    return () => { cancelled = true; };
  }, [lang, report.uid, report.language, report.translation]);

  const insights = translated?.insights ?? report.insights;
  const mangalNote = translated?.mangalNote ?? report.mangal.note;
  const gunaVerdict = translated?.gunaVerdict ?? guna.verdict;
  const factors = rawFactors.map((f, i) => {
    const t = translated?.factors[i];
    return t ? { ...f, title: t.title, meaning: t.meaning, result: t.result } : f;
  });
  const strengths = factors.filter((f) => f.verdict === "strength").length;
  const concerns = factors.filter((f) => f.verdict === "concern").length;

  const overviewPanel = (
    <Reveal stagger={0.1} className="space-y-6">
      <RevealItem className="print-avoid rounded-[var(--radius-card)] border border-line bg-surface p-6 md:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-muted">{d.guna_score}</p>
            <p className="font-display text-5xl leading-none md:text-6xl">
              <CountUp value={guna.total} decimals={Number.isInteger(guna.total) ? 0 : 1} />
              <span className="ml-2 text-xl text-muted">{d.of_36}</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <VerdictBadge verdict="strength" label={`${strengths} ${d.verdict_strength}`} />
            <VerdictBadge verdict="concern" label={`${concerns} ${d.verdict_concern}`} />
            <VerdictBadge verdict="neutral" label={`${factors.length - strengths - concerns} ${d.verdict_neutral}`} />
          </div>
        </div>
        <div className="mt-5"><Meter value={guna.total} max={guna.max} label={d.guna_score} /></div>
        <p className="mt-4 max-w-prose leading-relaxed">{gunaVerdict}</p>
      </RevealItem>

      <div className="grid gap-4 md:grid-cols-2">
        <RevealItem><HoverLift className="h-full"><PersonCol label={d.groom_short} p={boy} d={d} /></HoverLift></RevealItem>
        <RevealItem><HoverLift className="h-full"><PersonCol label={d.bride_short} p={girl} d={d} /></HoverLift></RevealItem>
      </div>
    </Reveal>
  );

  return (
    <article className="mx-auto max-w-5xl px-4 py-10 sm:px-6 md:py-14" lang={lang}>
      <Reveal as="header" stagger={0.06} className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm text-muted">{d.match_headline}</p>
          <h1 className="mt-1 text-4xl md:text-5xl leading-none">{boy.name} <span className="text-accent">&amp;</span> {girl.name}</h1>
          <p className="mt-4 max-w-prose text-lg leading-relaxed">{insights.headline}</p>
        </div>
        {mode === "owner" && <RevealItem><ShareBar sharePath={`/match/${report.uid}/share`} newHref="/match" newLabel={d.match_new} /></RevealItem>}
      </Reveal>

      {translating && <p className="mt-4 text-sm text-muted">{d.translating}</p>}
      <Tabs className="mt-10" panels={[
        { id: "overview", label: d.tab_overview, content: overviewPanel },
        { id: "factors", label: d.tab_factors, hint: `${strengths}/${factors.length}`, content: (
        <Section id="factors" title={d.factors_title} caption={d.factors_sub}>
          <Reveal as="ul" stagger={0.06} className="grid gap-4 md:grid-cols-2">
            {factors.map((f) => <RevealItem key={f.key} as="li"><HoverLift className="h-full"><FactorCard f={f} d={d} boyName={boy.name} girlName={girl.name} /></HoverLift></RevealItem>)}
            <RevealItem as="li"><HoverLift className="print-avoid h-full rounded-[var(--radius-card)] border border-line bg-bg p-5">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-sans text-base font-semibold">{d.mangal_title}</h3>
                <VerdictBadge verdict={mangal.verdict} label={d[`verdict_${mangal.verdict}`]} />
              </div>
              <p className="mt-3 text-sm leading-relaxed">{mangalNote}</p>
              <dl className="mt-4 grid grid-cols-2 gap-3 rounded-lg bg-surface p-3 text-sm">
                <div><dt className="text-xs text-muted">{boy.name}</dt><dd className="font-medium">{boy.mangal.isManglik ? d.manglik : d.not_manglik}</dd></div>
                <div><dt className="text-xs text-muted">{girl.name}</dt><dd className="font-medium">{girl.mangal.isManglik ? d.manglik : d.not_manglik}</dd></div>
              </dl>
            </HoverLift></RevealItem>
          </Reveal>
        </Section>
        ) },
        { id: "analysis", label: d.tab_analysis, content: (
          <div className="space-y-14">
        <Section id="overall" title={d.sec_overall}>
          <p className="max-w-prose text-[1.05rem] leading-relaxed">{insights.overall}</p>
          <div className="mt-8 grid gap-8 md:grid-cols-3">
            <div><h3 className="font-sans text-sm font-semibold">{d.sec_emotional}</h3><p className="mt-2 text-sm leading-relaxed text-muted">{insights.emotional}</p></div>
            <div><h3 className="font-sans text-sm font-semibold">{d.sec_romantic}</h3><p className="mt-2 text-sm leading-relaxed text-muted">{insights.romantic}</p></div>
            <div><h3 className="font-sans text-sm font-semibold">{d.sec_communication}</h3><p className="mt-2 text-sm leading-relaxed text-muted">{insights.communication}</p></div>
          </div>
        </Section>
        <div className="grid gap-10 md:grid-cols-2">
          <Section id="strengths" title={d.sec_match_strengths}>
            <InsightList items={insights.strengths} tone="strength" />
          </Section>
          <Section id="concerns" title={d.sec_match_concerns}>
            <InsightList items={insights.concerns} tone="concern" emptyText={d.no_concerns} />
          </Section>
        </div>
          </div>
        ) },
        { id: "guidance", label: d.tab_guidance, content: (
        <Section id="guidance" title={d.sec_guidance}>
          <InsightList items={insights.guidance} />
          {insights.remedies.length > 0 && (
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {insights.remedies.map((r, i) => (
                <li key={i} className="flex gap-3 rounded-xl bg-surface p-4">
                  <span className="text-xl leading-none" aria-hidden>{r.icon}</span>
                  <div><p className="font-medium">{r.title}</p><p className="mt-1 text-sm leading-relaxed text-muted">{r.desc}</p></div>
                </li>
              ))}
            </ul>
          )}
        </Section>
        ) },
      ] satisfies TabPanel[]} />
      {mode === "share" && (
        <footer className="mt-16 flex flex-wrap items-center justify-end gap-2 border-t border-line pt-6 text-xs text-muted">
          {d.share_view_footer} <Logo text={APP_NAME} /> · <Link href="/match" className="font-medium text-ink underline decoration-accent underline-offset-4">{d.share_cta}</Link>
        </footer>
      )}
    </article>
  );
}
