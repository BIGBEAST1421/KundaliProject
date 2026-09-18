import { NextResponse, type NextRequest } from "next/server";
import { randomUUID } from "node:crypto";
import { computeChart } from "@/src/astro/chart";
import { checkMangalDosha } from "@/src/astro/matching";
import { generateJson } from "@/src/ai/client";
import { buildPersonSchema } from "@/src/ai/schemas";
import { personPrompt, relationshipStatusFrom } from "@/src/ai/prompts/person";
import { buildPersonReport, summarizeChart } from "@/src/reports/buildPerson";
import { computeFacts, factsForPrompt } from "@/src/reports/facts";
import { normalizePillars } from "@/src/reports/pillars";
import { toSlug, nextSlug } from "@/src/reports/slug";
import { CreateReportSchema } from "@/src/reports/input";
import { repo } from "@/src/db/repo";
import { geocode } from "@/src/lib/geocode";
import { errorResponse } from "@/src/lib/errors";

export const maxDuration = 60;

/**
 * Create a person report: validate → chart → AI → structured report → Supabase.
 * Responds with `{ uid, slug }`; the client navigates to `/<slug>`.
 */
export async function POST(req: NextRequest) {
  try {
    const input = CreateReportSchema.parse(await req.json());
    const pillars = normalizePillars(input.pillars);

    const coords = input.lat != null && input.lon != null
      ? { lat: input.lat, lon: input.lon, found: true }
      : await geocode(input.city, input.state, input.country);

    const chart = computeChart(input.dob, input.timeKnown ? input.time : "", coords.lat, coords.lon);
    const mangal = checkMangalDosha(chart);
    const relationshipStatus = relationshipStatusFrom(input.maritalStatus);
    const facts = computeFacts(chart);

    const { prompt, system } = personPrompt({
      name: input.name, dob: input.dob, time: input.time, timeKnown: input.timeKnown,
      location: [input.city, input.state, input.country].filter(Boolean).join(", "),
      gender: input.gender, occupation: input.occupation, maritalStatus: input.maritalStatus,
      relationshipStatus, pillars, chart, language: input.language, factsBlock: factsForPrompt(facts),
    });
    const ai = await generateJson({ prompt, system, schema: buildPersonSchema(pillars, relationshipStatus) });

    const base = toSlug(input.name);
    const slug = nextSlug(base, await repo.listSlugsLike(base));

    const report = buildPersonReport({
      uid: randomUUID(), slug, name: input.name, language: input.language,
      birth: {
        dob: input.dob, time: input.timeKnown ? input.time : "", timeKnown: input.timeKnown,
        city: input.city, state: input.state, country: input.country, lat: coords.lat, lon: coords.lon,
      },
      profile: { gender: input.gender, occupation: input.occupation, maritalStatus: input.maritalStatus, relationshipStatus },
      pillars, chart: summarizeChart(chart, mangal), ai, facts,
    });

    const saved = await repo.createPerson(report);
    return NextResponse.json({ uid: saved.uid, slug: saved.slug }, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
