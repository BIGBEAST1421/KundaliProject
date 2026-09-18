import "server-only";
import { supabase } from "./supabase";
import {
  PersonReportSchema, MatchReportSchema,
  type PersonReport, type MatchReport, type PersonTranslation, type MatchTranslation,
} from "@/src/reports/types";

export class RepoError extends Error {
  constructor(message: string, readonly cause?: unknown) {
    super(message);
    this.name = "RepoError";
  }
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const isUuid = (s: string) => UUID_RE.test(s);

type PersonRow = {
  uid: string; slug: string; name: string; language: string; birth: unknown; profile: unknown;
  pillars: string[]; chart: unknown; core: unknown; sections: unknown; facts?: unknown; translation?: unknown; created_at: string;
};
type MatchRow = {
  uid: string; language: string; boy: unknown; girl: unknown; guna: unknown; factors: unknown;
  mangal: unknown; insights: unknown; translation?: unknown; created_at: string;
};

function personFromRow(r: PersonRow): PersonReport {
  const parsed = PersonReportSchema.safeParse({
    uid: r.uid, slug: r.slug, name: r.name, language: r.language, birth: r.birth, profile: r.profile,
    pillars: r.pillars, chart: r.chart, core: r.core, sections: r.sections, facts: r.facts ?? null,
    translation: r.translation ?? null, createdAt: r.created_at,
  });
  if (!parsed.success) throw new RepoError(`Stored report ${r.uid} is malformed`, parsed.error.issues);
  return parsed.data;
}

function matchFromRow(r: MatchRow): MatchReport {
  const parsed = MatchReportSchema.safeParse({
    uid: r.uid, language: r.language, boy: r.boy, girl: r.girl, guna: r.guna, factors: r.factors,
    mangal: r.mangal, insights: r.insights, translation: r.translation ?? null, createdAt: r.created_at,
  });
  if (!parsed.success) throw new RepoError(`Stored match ${r.uid} is malformed`, parsed.error.issues);
  return parsed.data;
}

const PERSON_COLS = "*";
const MATCH_COLS = "*";

export const repo = {
  /** Existing slugs equal to `base` or of the form `base-N`, for duplicate handling. */
  async listSlugsLike(base: string): Promise<string[]> {
    const { data, error } = await supabase()
      .from("person_reports")
      .select("slug")
      .or(`slug.eq.${base},slug.like.${base}-%`);
    if (error) throw new RepoError("Could not check existing names", error);
    return (data ?? []).map((r) => r.slug as string);
  },

  async createPerson(report: PersonReport): Promise<PersonReport> {
    const { data, error } = await supabase()
      .from("person_reports")
      .insert({
        uid: report.uid, slug: report.slug, name: report.name, language: report.language,
        birth: report.birth, profile: report.profile, pillars: report.pillars, chart: report.chart,
        core: report.core, sections: report.sections, facts: report.facts ?? null, created_at: report.createdAt,
      })
      .select(PERSON_COLS)
      .single();
    if (error) throw new RepoError("Could not save the report", error);
    return personFromRow(data as PersonRow);
  },

  async getPersonBySlug(slug: string): Promise<PersonReport | null> {
    const { data, error } = await supabase()
      .from("person_reports").select(PERSON_COLS).eq("slug", slug).maybeSingle();
    if (error) throw new RepoError("Could not load the report", error);
    return data ? personFromRow(data as PersonRow) : null;
  },

  async getPersonByUid(uid: string): Promise<PersonReport | null> {
    if (!isUuid(uid)) return null;
    const { data, error } = await supabase()
      .from("person_reports").select(PERSON_COLS).eq("uid", uid).maybeSingle();
    if (error) throw new RepoError("Could not load the report", error);
    return data ? personFromRow(data as PersonRow) : null;
  },

  async createMatch(report: MatchReport): Promise<MatchReport> {
    const { data, error } = await supabase()
      .from("match_reports")
      .insert({
        uid: report.uid, language: report.language, boy: report.boy, girl: report.girl, guna: report.guna,
        factors: report.factors, mangal: report.mangal, insights: report.insights, created_at: report.createdAt,
      })
      .select(MATCH_COLS)
      .single();
    if (error) throw new RepoError("Could not save the match report", error);
    return matchFromRow(data as MatchRow);
  },

  async getMatchByUid(uid: string): Promise<MatchReport | null> {
    if (!isUuid(uid)) return null;
    const { data, error } = await supabase()
      .from("match_reports").select(MATCH_COLS).eq("uid", uid).maybeSingle();
    if (error) throw new RepoError("Could not load the match report", error);
    return data ? matchFromRow(data as MatchRow) : null;
  },

  /** Caches the AI translation of a report's narrative so it's only generated once. */
  async savePersonTranslation(uid: string, translation: PersonTranslation): Promise<void> {
    const { error } = await supabase().from("person_reports").update({ translation }).eq("uid", uid);
    if (error) throw new RepoError("Could not save the translation", error);
  },

  async saveMatchTranslation(uid: string, translation: MatchTranslation): Promise<void> {
    const { error } = await supabase().from("match_reports").update({ translation }).eq("uid", uid);
    if (error) throw new RepoError("Could not save the translation", error);
  },
};
