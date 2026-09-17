import type { Chart } from "@/src/astro/chart";
import type { MangalDosha } from "@/src/astro/matching";
import {
  CoreInsightsSchema, SectionsSchema, PersonReportSchema,
  type Birth, type ChartSummary, type Language, type PersonReport, type Pillar, type Profile, type Sections,
} from "./types";
import { normalizePillars } from "./pillars";

export class ReportBuildError extends Error {
  constructor(message: string, readonly issues?: unknown) {
    super(message);
    this.name = "ReportBuildError";
  }
}

/** Reduce a full computed chart to what the UI and DB need. */
export function summarizeChart(chart: Chart, mangal: MangalDosha): ChartSummary {
  return {
    lagna: chart.lagna,
    lagnaDegree: chart.lagnaDegree,
    rashi: chart.rashi,
    sunSign: chart.sunSign,
    nakshatra: {
      name: chart.nakshatra.name, pada: chart.nakshatra.pada,
      lord: chart.nakshatra.lord, deity: chart.nakshatra.deity,
    },
    d1: chart.d1,
    houseOf: chart.houseOf,
    d10Lagna: chart.d10Lagna,
    dasha: chart.dasha,
    ayanamsa: chart.ayanamsa,
    utcTime: chart.utcTime,
    mangal: { isManglik: mangal.isManglik, marsHouse: mangal.marsHouse },
  };
}

export interface BuildPersonInput {
  uid: string;
  slug: string;
  name: string;
  language: Language;
  birth: Birth;
  profile: Profile;
  pillars: readonly Pillar[];
  chart: ChartSummary;
  /** Raw JSON returned by the AI. */
  ai: unknown;
  createdAt?: string;
}

/**
 * Normalise raw AI output into a PersonReport. Only the selected pillars survive; an
 * empty `concerns` list is preserved (never padded), so the UI can hide it honestly.
 */
export function buildPersonReport(input: BuildPersonInput): PersonReport {
  const pillars = normalizePillars([...input.pillars]);
  const raw = (input.ai ?? {}) as Record<string, unknown>;

  const core = CoreInsightsSchema.safeParse(raw);
  if (!core.success) throw new ReportBuildError("AI response is missing core insights", core.error.issues);

  const allSections = SectionsSchema.safeParse(raw);
  if (!allSections.success) throw new ReportBuildError("AI response has malformed sections", allSections.error.issues);

  const sections: Sections = {};
  for (const p of pillars) {
    const section = allSections.data[p];
    if (!section) throw new ReportBuildError(`AI response is missing the "${p}" section`);
    sections[p] = section as never;
  }

  const report = PersonReportSchema.safeParse({
    uid: input.uid,
    slug: input.slug,
    name: input.name,
    language: input.language,
    birth: input.birth,
    profile: input.profile,
    pillars,
    chart: input.chart,
    core: core.data,
    sections,
    createdAt: input.createdAt ?? new Date().toISOString(),
  });
  if (!report.success) throw new ReportBuildError("Report failed validation", report.error.issues);
  return report.data;
}
