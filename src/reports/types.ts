/**
 * Structured report types — the single contract shared by AI normalisation,
 * Supabase persistence, web rendering, public share pages and print.
 */
import { z } from "zod";
import { ReportFactsSchema } from "./facts-schema";

export const PILLARS = ["career", "love", "health", "wealth"] as const;
export const PillarSchema = z.enum(PILLARS);
export type Pillar = z.infer<typeof PillarSchema>;

export const LanguageSchema = z.enum(["en", "hi"]);
export type Language = z.infer<typeof LanguageSchema>;

export const RelationshipStatusSchema = z.enum(["unmarried", "married", "separated", "widowed"]);
export type RelationshipStatus = z.infer<typeof RelationshipStatusSchema>;

const str = z.string().trim();
const strList = z.array(str).default([]);

export const TimelineItemSchema = z.object({ period: str, desc: str });
export const RemedySchema = z.object({ icon: str.default("✦"), title: str, desc: str });
export const LabelledNoteSchema = z.object({ label: str, text: str });

/** Every pillar carries a summary plus balanced positives/concerns; concerns may be empty. */
const pillarBase = {
  summary: str,
  positives: strList,
  concerns: strList,
};

export const CareerSectionSchema = z.object({
  ...pillarBase,
  sectors: z.array(z.object({ sector: str, reason: str })).default([]),
  switchTiming: str.default(""),
  timeline: z.array(TimelineItemSchema).default([]),
});
export const LoveSectionSchema = z.object({
  ...pillarBase,
  partner: str.default(""),
  marriageWindows: z.array(z.object({ period: str, reason: str })).default([]),
  /** Status-specific paragraphs (e.g. "Where the marriage is now", "Moving forward"). */
  notes: z.array(LabelledNoteSchema).default([]),
});
export const HealthSectionSchema = z.object({
  ...pillarBase,
  watch: strList,
});
export const WealthSectionSchema = z.object({
  ...pillarBase,
  pattern: str.default(""),
  timeline: z.array(TimelineItemSchema).default([]),
  muhurta: z.array(z.object({ type: str, window: str, reason: str })).default([]),
});

export const SectionsSchema = z.object({
  career: CareerSectionSchema.optional(),
  love: LoveSectionSchema.optional(),
  health: HealthSectionSchema.optional(),
  wealth: WealthSectionSchema.optional(),
});
export type Sections = z.infer<typeof SectionsSchema>;
export type CareerSection = z.infer<typeof CareerSectionSchema>;
export type LoveSection = z.infer<typeof LoveSectionSchema>;
export type HealthSection = z.infer<typeof HealthSectionSchema>;
export type WealthSection = z.infer<typeof WealthSectionSchema>;

export const CoreInsightsSchema = z.object({
  soulPurpose: str,
  overview: strList,
  dashaAnalysis: str,
  remedies: z.array(RemedySchema).default([]),
});
export type CoreInsights = z.infer<typeof CoreInsightsSchema>;

export const BirthSchema = z.object({
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD"),
  time: z.string().regex(/^(\d{2}:\d{2})?$/, "Use HH:MM").default(""),
  timeKnown: z.boolean().default(false),
  city: str.min(1),
  state: str.default(""),
  country: str.default("India"),
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
});
export type Birth = z.infer<typeof BirthSchema>;

export const ProfileSchema = z.object({
  gender: str.default(""),
  occupation: str.default(""),
  maritalStatus: str.default("Unmarried"),
  relationshipStatus: RelationshipStatusSchema.default("unmarried"),
});
export type Profile = z.infer<typeof ProfileSchema>;

const DashaPeriodSchema = z.object({ lord: str, start: str, end: str, current: z.boolean() });
export const ChartSummarySchema = z.object({
  lagna: str,
  lagnaDegree: z.number(),
  rashi: str,
  sunSign: str,
  nakshatra: z.object({ name: str, pada: z.number(), lord: str, deity: str }),
  d1: z.record(z.string(), z.string()),
  houseOf: z.record(z.string(), z.number()),
  d10Lagna: str,
  dasha: z.object({
    mahadasha: str, mahadashaStart: str, mahadashaEnd: str,
    antardasha: str, antardashaStart: str, antardashaEnd: str,
    allMahadashas: z.array(DashaPeriodSchema),
    antardashas: z.array(DashaPeriodSchema),
  }),
  ayanamsa: z.number(),
  utcTime: str,
  mangal: z.object({ isManglik: z.boolean(), marsHouse: z.number() }),
});
export type ChartSummary = z.infer<typeof ChartSummarySchema>;

/** Shape the AI must return when translating a report's narrative: core fields plus whichever sections exist. */
export const PersonNarrativeSchema = CoreInsightsSchema.merge(SectionsSchema);
export type PersonNarrative = z.infer<typeof PersonNarrativeSchema>;

/** Translated {title, text, because} for one fired classical rule — everything else about it is deterministic. */
export const RuleNarrativeSchema = z.object({ title: str, text: str, because: strList });
export type RuleNarrative = z.infer<typeof RuleNarrativeSchema>;

export const IndicationsNarrativeSchema = z.object({
  career: z.array(RuleNarrativeSchema),
  marriage: z.array(RuleNarrativeSchema),
});
export type IndicationsNarrative = z.infer<typeof IndicationsNarrativeSchema>;

/** Cached AI translation of the narrative content into the one other supported language. */
export const PersonTranslationSchema = z.object({
  language: LanguageSchema,
  core: CoreInsightsSchema,
  sections: SectionsSchema,
  /** Translated classical-rule text; empty arrays for reports with no facts. */
  indications: IndicationsNarrativeSchema,
});
export type PersonTranslation = z.infer<typeof PersonTranslationSchema>;

export const PersonReportSchema = z.object({
  uid: z.string().uuid(),
  slug: str.min(1),
  name: str.min(1),
  language: LanguageSchema,
  birth: BirthSchema,
  profile: ProfileSchema,
  pillars: z.array(PillarSchema).min(1),
  chart: ChartSummarySchema,
  core: CoreInsightsSchema,
  sections: SectionsSchema,
  /** Deterministic chart facts; absent on reports created before v2. */
  facts: ReportFactsSchema.nullable().optional(),
  /** Cached translation into the other language, generated on first request. */
  translation: PersonTranslationSchema.nullable().optional(),
  createdAt: z.string(),
});
export type PersonReport = z.infer<typeof PersonReportSchema>;

// ── Matching ─────────────────────────────────────────────────────────

export const VerdictSchema = z.enum(["strength", "concern", "neutral"]);
export type Verdict = z.infer<typeof VerdictSchema>;

export const MatchFactorSchema = z.object({
  key: str,
  /** Display name, e.g. "Nadi" */
  name: str,
  /** Plain-language title, e.g. "Health & energy match" */
  title: str,
  points: z.number(),
  max: z.number(),
  verdict: VerdictSchema,
  /** One or two plain sentences explaining what this factor is about. */
  meaning: str,
  /** What the result says for this couple. */
  result: str,
  boy: str,
  girl: str,
});
export type MatchFactor = z.infer<typeof MatchFactorSchema>;

export const MatchPersonSchema = z.object({
  name: str.min(1),
  birth: BirthSchema,
  chart: z.object({
    lagna: str, rashi: str, sunSign: str,
    nakshatra: z.object({ name: str, pada: z.number(), lord: str }),
    d1: z.record(z.string(), z.string()),
    mahadasha: str,
  }),
  mangal: z.object({ isManglik: z.boolean(), marsHouse: z.number() }),
});
export type MatchPerson = z.infer<typeof MatchPersonSchema>;

export const MatchInsightsSchema = z.object({
  headline: str,
  overall: str,
  emotional: str,
  romantic: str,
  communication: str,
  strengths: strList,
  concerns: strList,
  guidance: strList,
  remedies: z.array(RemedySchema).default([]),
});
export type MatchInsights = z.infer<typeof MatchInsightsSchema>;

/** Cached AI translation of the narrative content into the one other supported language. */
export const MatchTranslationSchema = z.object({
  language: LanguageSchema,
  insights: MatchInsightsSchema,
  /** Translated {title, meaning, result} for each entry in `factors`, same order. */
  factors: z.array(z.object({ title: str, meaning: str, result: str })),
  gunaVerdict: str,
  mangalNote: str,
});
export type MatchTranslation = z.infer<typeof MatchTranslationSchema>;

export const MatchReportSchema = z.object({
  uid: z.string().uuid(),
  language: LanguageSchema,
  boy: MatchPersonSchema,
  girl: MatchPersonSchema,
  guna: z.object({ total: z.number(), max: z.number(), verdict: str, doshas: strList }),
  factors: z.array(MatchFactorSchema),
  mangal: z.object({ verdict: VerdictSchema, note: str }),
  insights: MatchInsightsSchema,
  /** Cached translation into the other language, generated on first request. */
  translation: MatchTranslationSchema.nullable().optional(),
  createdAt: z.string(),
});
export type MatchReport = z.infer<typeof MatchReportSchema>;
